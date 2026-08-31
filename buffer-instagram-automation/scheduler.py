import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from config import POSTING_CONFIG, PAST_DATE_MODE, SCHEDULE_OVERRIDES

logger = logging.getLogger("buffer_scheduler")

class SchedulingError(Exception):
    """Exception raised when scheduling calculation fails."""
    pass

def calculate_schedule(
    ad_numbers: list,
    now_dt: datetime,
    start_date_str: str = POSTING_CONFIG["start_date"],
    posting_time_str: str = POSTING_CONFIG["posting_time"],
    timezone: ZoneInfo = ZoneInfo(POSTING_CONFIG["timezone"]),
    past_mode: str = PAST_DATE_MODE,
    overrides: dict = None
) -> dict:
    """
    Calculates the scheduled datetime for each ad number, handling past dates
    according to the past_mode configuration (shift, skip, error).
    """
    if overrides is None:
        overrides = SCHEDULE_OVERRIDES or {}
        
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
    except ValueError as e:
        raise SchedulingError(f"Invalid start_date format in config: {e}")
        
    try:
        hour, minute = map(int, posting_time_str.split(":"))
    except ValueError as e:
        raise SchedulingError(f"Invalid posting_time format in config: {e}")

    # Determine today's standard posting slot
    today_slot = datetime.combine(
        now_dt.date(),
        datetime.min.time().replace(hour=hour, minute=minute)
    ).replace(tzinfo=timezone)

    # Keep track of assigned datetimes to prevent overlaps
    assigned_slots = set()
    schedule = {}

    
    # Sort ad numbers to ensure they are processed sequentially
    sorted_ads = sorted(ad_numbers)
    
    for ad_num in sorted_ads:
        # Determine base scheduled datetime
        if ad_num in overrides:
            try:
                base_dt = datetime.fromisoformat(overrides[ad_num]).astimezone(timezone)
            except ValueError as e:
                raise SchedulingError(f"Invalid ISO override for Ad {ad_num}: {e}")
        else:
            ad_date = start_date + timedelta(days=(ad_num - 1))
            base_dt = datetime.combine(
                ad_date,
                datetime.min.time().replace(hour=hour, minute=minute)
            ).replace(tzinfo=timezone)
            
        # Check if the date is in the past
        if base_dt < now_dt:
            if past_mode == "error":
                raise SchedulingError(f"Ad {ad_num} scheduled time ({base_dt.isoformat()}) is in the past.")
            elif past_mode == "skip":
                logger.info(f"Skipping Ad {ad_num} because scheduled time ({base_dt.isoformat()}) is in the past.")
                schedule[ad_num] = None
                continue
            elif past_mode == "shift":
                # Shift to next available slot after now_dt
                slot = today_slot if now_dt < today_slot else today_slot + timedelta(days=1)
                while slot in assigned_slots or slot < now_dt:
                    slot += timedelta(days=1)
                base_dt = slot
                
        # Resolve any remaining conflicts (e.g. if two ads calculate to the same day)
        while base_dt in assigned_slots or base_dt < now_dt:
            base_dt += timedelta(days=1)
            
        schedule[ad_num] = base_dt
        assigned_slots.add(base_dt)
        
    return schedule

