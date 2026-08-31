import os
import json
from pathlib import Path
from dotenv import load_dotenv
from zoneinfo import ZoneInfo

# Load environment variables
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).resolve().parent
LOGS_DIR = BASE_DIR / "logs"
LOGS_DIR.mkdir(exist_ok=True)

# API Keys & Credentials
BUFFER_API_KEY = os.getenv("BUFFER_API_KEY")
BUFFER_INSTAGRAM_CHANNEL_ID = os.getenv("BUFFER_INSTAGRAM_CHANNEL_ID")
IMGBB_API_KEY = os.getenv("IMGBB_API_KEY")

# Local config & state paths
LOCAL_CONFIG_PATH = BASE_DIR / "local_config.json"
STATE_FILE_PATH = BASE_DIR / "buffer_post_state.json"

# Scheduling Config
POSTING_CONFIG = {
    "timezone": "Asia/Kolkata",
    "start_date": "2026-07-14",
    "posting_time": "19:00",
    "interval_days": 1,
}

# Individual overrides: ad_number -> ISO 8601 string in Asia/Kolkata
SCHEDULE_OVERRIDES = {}

# Timezone object
TIMEZONE = ZoneInfo(POSTING_CONFIG["timezone"])

# Past Date Mode: "shift", "skip", "error"
PAST_DATE_MODE = "shift"

# Queue settings
ALLOW_REPLACE_EXISTING = False

# Hashtag Placement: "caption" or "first_comment"
HASHTAG_PLACEMENT = "caption"

# Load saved channel ID from local config if environment variable is missing
def get_channel_id():
    if BUFFER_INSTAGRAM_CHANNEL_ID:
        return BUFFER_INSTAGRAM_CHANNEL_ID
    if LOCAL_CONFIG_PATH.exists():
        try:
            with open(LOCAL_CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("BUFFER_INSTAGRAM_CHANNEL_ID")
        except Exception:
            pass
    return None

def save_channel_id(channel_id):
    data = {}
    if LOCAL_CONFIG_PATH.exists():
        try:
            with open(LOCAL_CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            pass
    data["BUFFER_INSTAGRAM_CHANNEL_ID"] = channel_id
    with open(LOCAL_CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
