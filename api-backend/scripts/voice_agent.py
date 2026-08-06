import os
import sys
import json
import logging
import datetime
import urllib.request
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv

from livekit.agents import JobContext, Agent, AgentSession, AgentServer, cli
from livekit.plugins import google, openai

# Reconfigure stdout/stderr for Unicode prints in Windows
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

# Load env variables
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

# Set Google API Key for Gemini plugin (mapping GEMINI_API_KEY to GOOGLE_API_KEY)
if os.getenv('GEMINI_API_KEY') and not os.getenv('GOOGLE_API_KEY'):
    os.environ['GOOGLE_API_KEY'] = os.getenv('GEMINI_API_KEY')

MONGODB_URI = os.getenv('MONGODB_URI')

logger = logging.getLogger("mcp-agent")
logger.setLevel(logging.INFO)

# Define the AgentServer
server = AgentServer()

def get_db():
    if not MONGODB_URI:
        logger.error("MONGODB_URI is not configured in .env")
        return None
    try:
        client = MongoClient(MONGODB_URI)
        try:
            return client.get_default_database()
        except Exception:
            db_names = client.list_database_names()
            candidates = [name for name in db_names if name not in ['admin', 'config', 'local']]
            db_name = candidates[0] if candidates else 'test'
            return client[db_name]
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return None

def fetch_user_context(user_id):
    db = get_db()
    if db is None:
        return None, None
        
    try:
        profiles_col = db['profiles']
        kundli_col = db['kundlireports']
        
        profile = profiles_col.find_one({"user_id": ObjectId(user_id)})
        kundli = kundli_col.find_one({"user_id": ObjectId(user_id)})
        return profile, kundli
    except Exception as e:
        logger.error(f"Error fetching MongoDB profile context: {e}")
        return None, None

def build_voice_prompt(profile, kundli, name):
    now = datetime.datetime.now()
    today_str = now.strftime("%A, %B %d, %Y")
    current_time_str = now.strftime("%I:%M %p")
    
    prompt = f"""You are Antigravity, a wise, warm, and comforting Personal AI Oracle and Astrologer.
You are talking directly to the user in a spoken, real-time voice call.
Keep your responses conversational, natural, and highly empathetic. Speak in short sentences (1-3 sentences maximum).
Never use bullet points, asterisks, bolding, list formatting, or markdown in your speech. Speak continuously and smoothly.

CURRENT TIMING CONTEXT:
- Date: {today_str}
- Local Time: {current_time_str}
"""
    
    if profile:
        dob = profile.get('date_of_birth', 'Not provided')
        tob = profile.get('time_of_birth', 'Not provided')
        pob = profile.get('place_of_birth', 'Not provided')
        gender = profile.get('gender', 'Not provided')
        
        prompt += f"""
USER BIO:
- Name: {name}
- Date of Birth: {dob}
- Time of Birth: {tob}
- Place of Birth: {pob}
- Gender: {gender}
"""
        
        life_context = profile.get('life_context', {})
        if life_context:
            prompt += f"""
USER LIFE PLIGHT:
- Career Stage: {life_context.get('career_stage', 'Not provided')}
- Relationship Status: {life_context.get('relationship_status', 'Not provided')}
- Main Life Focus: {life_context.get('main_life_focus', 'Not provided')}
- Primary Focus/Problem: {life_context.get('primary_life_problem', 'Not provided')}
"""

        numerology = profile.get('numerology_data', {})
        if numerology:
            prompt += f"""
USER NUMEROLOGY:
- Life Path: {numerology.get('life_path', 'Not provided')}
- Destiny: {numerology.get('destiny', 'Not provided')}
- Personal Year: {numerology.get('personal_year', 'Not provided')}
"""

    if kundli:
        chart = kundli.get('chart_data', {})
        if chart:
            prompt += f"""
USER BIRTH KUNDLI CHART:
- Ascendant: {chart.get('ascendant', 'Not provided')}
- Moon Sign: {chart.get('moon_sign', 'Not provided')}
- Sun Sign: {chart.get('sun_sign', 'Not provided')}
- Nakshatra: {chart.get('nakshatra', 'Not provided')}
"""
            planets = chart.get('planets', {})
            if planets:
                planet_summary = ", ".join([f"{p}: {details.get('sign')} in House {details.get('house')}" for p, details in planets.items() if isinstance(details, dict)])
                prompt += f"- Planetary Alignments: {planet_summary}\n"

    prompt += f"\nRULES OF ENGAGEMENT:\n1. Welcome {name} warmly if this is the start of the call.\n2. Synthesize Vedic astrology, numerology, and their current life context intuitively in your answers.\n3. Make your advice practical yet mystical.\n4. Keep your answers brief (1-3 sentences) so the user can easily interrupt or respond."
    return prompt


# Define the Agent class
class AstroOracleAgent(Agent):
    def __init__(self, system_prompt: str) -> None:
        super().__init__(
            instructions=system_prompt,
        )

    async def on_enter(self):
        # Automatically generate a welcoming speech when the agent connects
        await self.session.generate_reply()


# Define the RTC session entrypoint
@server.rtc_session
async def entrypoint(ctx: JobContext):
    logger.info("Initializing Astro Oracle Agent Session...")
    ctx.log_context_fields = {"room": ctx.room.name}
    
    # Wait for the user to join
    await ctx.wait_for_participant()
    
    user_id = None
    user_name = "Seeker"
    
    # Find participant metadata
    for identity, participant in ctx.room.remote_participants.items():
        if participant.metadata:
            try:
                meta = json.loads(participant.metadata)
                user_id = meta.get("userId")
                user_name = meta.get("userName", "Seeker")
                logger.info(f"Loaded identity from metadata: {user_name} ({user_id})")
                break
            except Exception as e:
                logger.warning(f"Failed to parse participant metadata: {e}")
                
    # Load profile details
    profile, kundli = None, None
    if user_id:
        profile, kundli = fetch_user_context(user_id)
        
    system_prompt = build_voice_prompt(profile, kundli, user_name)

    # Initialize the LLM: local Ollama if online, otherwise Google Gemini
    llm_instance = None
    try:
        # Check if local Ollama is reachable
        urllib.request.urlopen("http://localhost:11434", timeout=2)
        logger.info("Ollama server detected. Connecting to local llama3 model.")
        llm_instance = openai.LLM(
            base_url="http://localhost:11434/v1",
            api_key="ollama",
            model="llama3:latest"
        )
    except Exception:
        logger.info("Ollama server is offline or unreachable. Falling back to Google Gemini Cloud.")
        llm_instance = google.LLM(model="gemini-2.0-flash")

    # Create the AgentSession using LiveKit's managed cloud STT and TTS
    session = AgentSession(
        stt="deepgram/nova-3-general",
        llm=llm_instance,
        tts="cartesia/sonic-2"
    )

    # Start the agent session in the room
    await session.start(agent=AstroOracleAgent(system_prompt), room=ctx.room)
    
    # Connect WebRTC room
    await ctx.connect()
    
    logger.info(f"Astro Oracle successfully connected to room: {ctx.room.name}")


if __name__ == "__main__":
    cli.run_app(server)
