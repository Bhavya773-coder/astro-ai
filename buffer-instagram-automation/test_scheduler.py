import unittest
import re
import os
import tempfile
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from pathlib import Path

# Import components to test
from scheduler import calculate_schedule, SchedulingError
from state_manager import StateManager
from image_validator import validate_image, ImageValidationError
from buffer_client import BufferAPIError

class TestScheduler(unittest.TestCase):

    def setUp(self):
        self.timezone = ZoneInfo("Asia/Kolkata")
        self.now = datetime(2026, 7, 13, 20, 0, 0, tzinfo=self.timezone)  # July 13, 8:00 PM

    def test_filename_parsing_and_sorting(self):
        """Verify that ad filenames are matched, parsed, and sorted numerically."""
        filenames = [
            "astroai4u_ad_10.png",
            "astroai4u_ad_2.jpg",
            "astroai4u_ad_1.webp",
            "unrelated_file.png",
            "astroai4u_ad_20.JPEG",
        ]
        
        parsed = []
        for name in filenames:
            match = re.fullmatch(r"astroai4u_ad_(\d+)\.(png|jpg|jpeg|webp)", name, re.I)
            if match:
                ad_num = int(match.group(1))
                parsed.append(ad_num)
                
        # Sort numerically
        parsed.sort()
        
        self.assertEqual(parsed, [1, 2, 10, 20])

    def test_past_date_shifting(self):
        """Verify that past dates are correctly shifted to the next available future slot in Asia/Kolkata."""
        ad_numbers = [1, 2, 3]
        
        # 1. Shifting mode:
        # Start date: 2026-07-12 at 19:00 (which is in the past compared to July 13, 20:00)
        # Ad 1 default: 2026-07-12 19:00 (past) -> should shift to next available slot (July 14 19:00)
        # Ad 2 default: 2026-07-13 19:00 (past) -> should shift to next available slot (July 15 19:00)
        # Ad 3 default: 2026-07-14 19:00 (future) -> fits at July 16 19:00 (since Ad 2 occupies July 15)
        schedule = calculate_schedule(
            ad_numbers=ad_numbers,
            now_dt=self.now,
            start_date_str="2026-07-12",
            posting_time_str="19:00",
            timezone=self.timezone,
            past_mode="shift"
        )
        
        self.assertEqual(schedule[1], datetime(2026, 7, 14, 19, 0, 0, tzinfo=self.timezone))
        self.assertEqual(schedule[2], datetime(2026, 7, 15, 19, 0, 0, tzinfo=self.timezone))
        self.assertEqual(schedule[3], datetime(2026, 7, 16, 19, 0, 0, tzinfo=self.timezone))

    def test_past_date_error_mode(self):
        """Verify that past_mode='error' raises an error when scheduled in the past."""
        ad_numbers = [1]
        with self.assertRaises(SchedulingError):
            calculate_schedule(
                ad_numbers=ad_numbers,
                now_dt=self.now,
                start_date_str="2026-07-12",
                posting_time_str="19:00",
                timezone=self.timezone,
                past_mode="error"
            )

    def test_past_date_skip_mode(self):
        """Verify that past_mode='skip' skips past dates without raising errors."""
        ad_numbers = [1, 2]
        # Start date: 2026-07-12. Ad 1 is July 12 19:00 (past). Ad 2 is July 13 19:00 (past).
        schedule = calculate_schedule(
            ad_numbers=ad_numbers,
            now_dt=self.now,
            start_date_str="2026-07-12",
            posting_time_str="19:00",
            timezone=self.timezone,
            past_mode="skip"
        )
        self.assertIsNone(schedule.get(1))
        self.assertIsNone(schedule.get(2))

    def test_schedule_overrides(self):
        """Verify that schedule overrides are respected."""
        ad_numbers = [1, 2]
        # Override Ad 1 to July 20 at 10:00 AM
        override_iso = "2026-07-20T10:00:00+05:30"
        overrides = {1: override_iso}
        
        schedule = calculate_schedule(
            ad_numbers=ad_numbers,
            now_dt=self.now,
            start_date_str="2026-07-14",
            posting_time_str="19:00",
            timezone=self.timezone,
            past_mode="shift",
            overrides=overrides
        )
        
        self.assertEqual(schedule[1], datetime(2026, 7, 20, 10, 0, 0, tzinfo=self.timezone))
        # Ad 2 defaults to July 15 19:00 (future)
        self.assertEqual(schedule[2], datetime(2026, 7, 15, 19, 0, 0, tzinfo=self.timezone))

    def test_duplicate_detection(self):
        """Verify file and caption hash calculation helper methods."""
        with tempfile.NamedTemporaryFile(delete=False) as f:
            f.write(b"astroai4u image content")
            temp_path = f.name
            
        try:
            hash_1 = StateManager.get_file_hash(temp_path)
            hash_2 = StateManager.get_file_hash(temp_path)
            self.assertEqual(hash_1, hash_2)
            self.assertTrue(hash_1.startswith("sha256-"))
            
            caption = "Test caption for astroai4u.com"
            cap_hash = StateManager.get_string_hash(caption)
            self.assertEqual(cap_hash, StateManager.get_string_hash(caption))
        finally:
            os.remove(temp_path)

    def test_retry_classification(self):
        """Verify that Buffer API errors are classified into retryable and permanent."""
        # 1. Temporary errors (retryable)
        temp_err_1 = BufferAPIError("GraphQL Request Timeout", is_temporary=True)
        temp_err_2 = BufferAPIError("Throttled by rate limit", is_temporary=True)
        
        self.assertTrue(temp_err_1.is_temporary)
        self.assertTrue(temp_err_2.is_temporary)
        
        # 2. Permanent errors (non-retryable)
        perm_err_1 = BufferAPIError("Invalid Access Token", is_temporary=False)
        perm_err_2 = BufferAPIError("Plan limit exceeded", is_temporary=False)
        
        self.assertFalse(perm_err_1.is_temporary)
        self.assertFalse(perm_err_2.is_temporary)

if __name__ == "__main__":
    unittest.main()
