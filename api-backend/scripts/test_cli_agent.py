import os
import sys
import json
import datetime
import urllib.request
import urllib.error
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv

# Reconfigure stdout/stderr to use UTF-8 to prevent unicode print crashes in Windows CMD/Powershell
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

# Load env file from the parent directory of this script
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

MONGODB_URI = os.getenv('MONGODB_URI')
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'llama3:latest')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

def get_db_client():
    if not MONGODB_URI:
        print("❌ Error: MONGODB_URI is not set in .env")
        sys.exit(1)
    return MongoClient(MONGODB_URI)

def select_user(db):
    print("🔮 Fetching users from database...")
    users_col = db['users']
    profiles_col = db['profiles']
    
    # Get users who have profiles completed
    profiles = list(profiles_col.find().limit(10))
    if not profiles:
        print("⚠️ No user profiles found in the database. Listing raw users instead...")
        users = list(users_col.find().limit(10))
        if not users:
            print("❌ No users found in the database. Please register a user first.")
            sys.exit(1)
        for i, u in enumerate(users):
            print(f"[{i + 1}] Email: {u.get('email')} | ID: {u.get('_id')}")
        choice = input("\nSelect a user number: ")
        try:
            selected_user = users[int(choice) - 1]
            return selected_user['_id'], selected_user.get('email'), "User"
        except (ValueError, IndexError):
            print("❌ Invalid choice")
            sys.exit(1)
            
    for i, p in enumerate(profiles):
        user_id = p.get('user_id')
        user = users_col.find_one({"_id": user_id})
        email = user.get('email') if user else "N/A"
        print(f"[{i + 1}] Name: {p.get('full_name')} | Email: {email} | DOB: {p.get('date_of_birth')}")
        
    choice = input("\nSelect a user number: ")
    try:
        idx = int(choice) - 1
        selected_profile = profiles[idx]
        user_id = selected_profile.get('user_id')
        user = users_col.find_one({"_id": user_id})
        return user_id, user.get('email') if user else "N/A", selected_profile.get('full_name')
    except (ValueError, IndexError):
        print("❌ Invalid choice")
        sys.exit(1)

def fetch_astrology_context(db, user_id):
    profiles_col = db['profiles']
    kundli_col = db['kundlireports']
    
    profile = profiles_col.find_one({"user_id": ObjectId(user_id)})
    kundli = kundli_col.find_one({"user_id": ObjectId(user_id)})
    
    return profile, kundli

def build_system_prompt(profile, kundli, name):
    now = datetime.datetime.now()
    today_str = now.strftime("%A, %B %d, %Y")
    current_time_str = now.strftime("%I:%M %p")
    
    prompt = f"""You are Antigravity, a highly specialized Personal AI Oracle and Astrologer.
You are having a real-time spoken voice conversation with a user.
Keep your responses conversational, warm, concise, and natural (since this is for voice/avatar use). Avoid bullet points or markdown in your replies.

CURRENT CONTEXT:
- Today's Date: {today_str}
- Current Time: {current_time_str}
"""
    
    if profile:
        dob = profile.get('date_of_birth', 'Not provided')
        tob = profile.get('time_of_birth', 'Not provided')
        pob = profile.get('place_of_birth', 'Not provided')
        gender = profile.get('gender', 'Not provided')
        
        prompt += f"""
USER PROFILE:
- Name: {name}
- Date of Birth: {dob}
- Time of Birth: {tob}
- Place of Birth: {pob}
- Gender: {gender}
"""
        
        life_context = profile.get('life_context', {})
        if life_context:
            prompt += f"""
USER LIFE CONTEXT:
- Career Stage: {life_context.get('career_stage', 'Not provided')}
- Relationship Status: {life_context.get('relationship_status', 'Not provided')}
- Main Life Focus: {life_context.get('main_life_focus', 'Not provided')}
- Primary Focus/Problem: {life_context.get('primary_life_problem', 'Not provided')}
"""

        numerology = profile.get('numerology_data', {})
        if numerology:
            prompt += f"""
USER NUMEROLOGY:
- Life Path Number: {numerology.get('life_path', 'Not provided')}
- Destiny Number: {numerology.get('destiny', 'Not provided')}
- Personal Year: {numerology.get('personal_year', 'Not provided')}
"""

    if kundli:
        chart = kundli.get('chart_data', {})
        if chart:
            prompt += f"""
USER KUNDLI / VEDIC BIRTH CHART:
- Ascendant (Lagna): {chart.get('ascendant', 'Not provided')}
- Moon Sign: {chart.get('moon_sign', 'Not provided')}
- Sun Sign: {chart.get('sun_sign', 'Not provided')}
- Nakshatra: {chart.get('nakshatra', 'Not provided')}
"""
            planets = chart.get('planets', {})
            if planets:
                planet_summary = ", ".join([f"{p}: {details.get('sign')} in House {details.get('house')}" for p, details in planets.items() if isinstance(details, dict)])
                prompt += f"- Planetary Placements: {planet_summary}\n"

    prompt += "\nINSTRUCTIONS:\n1. Address the user by their name: " + name + "\n2. Synthesize Vedic astrology, numerology, and their current life context to answer their query.\n3. Make your response sound intuitive, oracle-like, and highly personalized.\n4. Keep answers short (1-3 sentences) suitable for a spoken voice interface."
    return prompt

def query_ollama(system_prompt, messages):
    url = f"{OLLAMA_URL}/api/chat"
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [{"role": "system", "content": system_prompt}] + messages,
        "stream": True
    }
    
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            buffer = ""
            for chunk in response:
                buffer += chunk.decode('utf-8')
                lines = buffer.split('\n')
                buffer = lines.pop()
                for line in lines:
                    if line.strip():
                        data = json.loads(line)
                        token = data.get('message', {}).get('content', '')
                        yield token
    except Exception as e:
        raise e

def query_gemini(system_prompt, messages):
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY is not configured in .env")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key={GEMINI_API_KEY}"
    
    # Format messages for Gemini api
    contents = []
    for msg in messages:
        contents.append({
            "role": "user" if msg['role'] == 'user' else "model",
            "parts": [{"text": msg['content']}]
        })
        
    payload = {
        "systemInstruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": contents
    }
    
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
    
    with urllib.request.urlopen(req, timeout=30) as response:
        buffer = ""
        for chunk in response:
            buffer += chunk.decode('utf-8')
            # Gemini stream returns chunks of JSON array
            # A simple way is to parse lines for "text": "..."
            lines = buffer.split('\n')
            buffer = lines.pop()
            for line in lines:
                if '"text":' in line:
                    try:
                        # Extract the string content between quotes
                        start_idx = line.find('"text":') + 8
                        # Find the first quote and matching end quote
                        str_start = line.find('"', start_idx) + 1
                        str_end = line.rfind('"')
                        if str_start > 0 and str_end > str_start:
                            token = line[str_start:str_end].encode('utf-8').decode('unicode-escape')
                            yield token
                    except Exception:
                        pass

def main():
    print("🌟 Personal Oracle Terminal Agent 🌟")
    print("=====================================")
    client = get_db_client()
    try:
        db = client.get_default_database()
    except Exception:
        db_names = client.list_database_names()
        candidates = [dname for dname in db_names if dname not in ['admin', 'config', 'local']]
        db_name = candidates[0] if candidates else 'test'
        db = client[db_name]
    
    user_id, email, name = select_user(db)
    print(f"\n🔮 Loaded Oracle Context for: {name} ({email})")
    
    profile, kundli = fetch_astrology_context(db, user_id)
    system_prompt = build_system_prompt(profile, kundli, name)
    
    # Check if Ollama is running, otherwise set fallback to Gemini
    use_gemini = False
    try:
        # Simple health check to Ollama
        urllib.request.urlopen(OLLAMA_URL, timeout=2)
        print(f"🤖 Connected to Ollama local LLM ({OLLAMA_MODEL})")
    except Exception:
        print("⚠️ Ollama is not running locally. Falling back to Google Gemini Cloud...")
        use_gemini = True
        if not GEMINI_API_KEY:
            print("❌ Error: GEMINI_API_KEY is not set. Cannot run fallback LLM.")
            sys.exit(1)
        print("✨ Connected to Gemini LLM")
        
    print("\n💬 Speak/Type your question to the Personal Oracle (type 'exit' to quit):")
    messages = []
    
    while True:
        try:
            user_input = input("\nYou: ")
            if not user_input.strip():
                continue
            if user_input.lower() == 'exit':
                print("👋 Farewell! The stars align in your path.")
                break
                
            messages.append({"role": "user", "content": user_input})
            print("Oracle: ", end="", flush=True)
            
            response_text = ""
            if use_gemini:
                for token in query_gemini(system_prompt, messages):
                    print(token, end="", flush=True)
                    response_text += token
            else:
                try:
                    for token in query_ollama(system_prompt, messages):
                        print(token, end="", flush=True)
                        response_text += token
                except Exception as e:
                    print(f"\n⚠️ Ollama error: {e}. Attempting fallback to Gemini...")
                    use_gemini = True
                    for token in query_gemini(system_prompt, messages):
                        print(token, end="", flush=True)
                        response_text += token
                        
            print() # Print newline
            messages.append({"role": "assistant", "content": response_text})
            
        except KeyboardInterrupt:
            print("\n👋 Farewell! The stars align in your path.")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
