import os
import json
import hashlib
import logging
from datetime import datetime
from pathlib import Path

logger = logging.getLogger("buffer_scheduler")

class StateManager:
    """Manages reading, writing, and atomic updating of buffer_post_state.json."""
    
    def __init__(self, state_file_path: Path):
        self.state_file_path = Path(state_file_path)
        self.state = self.load_state()

    def load_state(self) -> dict:
        """Loads state from file, returning empty dict if missing or corrupted."""
        if not self.state_file_path.exists():
            return {}
        try:
            with open(self.state_file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading state file: {e}. Starting fresh.")
            return {}

    def save_state(self):
        """Saves state atomically to prevent corruption on unexpected shutdowns."""
        tmp_path = self.state_file_path.with_suffix(".json.tmp")
        try:
            with open(tmp_path, "w", encoding="utf-8") as f:
                json.dump(self.state, f, indent=2)
            # Atomically replace state file with tmp file
            os.replace(tmp_path, self.state_file_path)
        except Exception as e:
            logger.error(f"Failed to save state file atomically: {e}")
            if os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

    def get_ad_state(self, ad_number: int) -> dict:
        """Gets state for a specific ad number (returns None if not present)."""
        return self.state.get(str(ad_number))

    def update_ad_state(self, ad_number: int, updates: dict):
        """Updates the state dictionary for an ad and saves it atomically."""
        ad_key = str(ad_number)
        now_iso = datetime.now().isoformat()
        
        if ad_key not in self.state:
            self.state[ad_key] = {
                "ad_number": ad_number,
                "created_at": now_iso,
                "attempts": 0,
                "last_error": None
            }
            
        self.state[ad_key].update(updates)
        self.state[ad_key]["updated_at"] = now_iso
        self.save_state()

    @staticmethod
    def get_file_hash(file_path: str) -> str:
        """Calculates the SHA256 hash of a file."""
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(8192):
                sha256.update(chunk)
        return "sha256-" + sha256.hexdigest()

    @staticmethod
    def get_string_hash(text: str) -> str:
        """Calculates the SHA256 hash of a string."""
        return "sha256-" + hashlib.sha256(text.encode("utf-8")).hexdigest()
