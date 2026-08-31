import os
import sys
import time
import logging
import logging.handlers
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo

# Reconfigure stdout/stderr to use UTF-8 to support emojis on Windows command prompt
if sys.stdout and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
if sys.stderr and sys.stderr.encoding.lower() != 'utf-8':
    try:
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass


# Import modular components
import config
from captions import CAPTIONS
from buffer_client import BufferClient, BufferAPIError
from image_uploader import ImgBBUploader, ImageUploaderError
from image_validator import validate_image, ImageValidationError
from scheduler import calculate_schedule, SchedulingError
from state_manager import StateManager
from timeline_report import generate_csv_report, generate_html_report

# Configure Logger
def setup_logging():
    log_file = config.LOGS_DIR / "buffer_scheduler.log"
    logger = logging.getLogger("buffer_scheduler")
    logger.setLevel(logging.INFO)
    
    # Avoid duplicate handlers
    if not logger.handlers:
        # Rotating File Handler: Max 5MB per file, keeping 3 backups
        file_handler = logging.handlers.RotatingFileHandler(
            log_file, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
        )
        formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(message)s"
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        # Console Handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(formatter)
        console_handler.setLevel(logging.WARNING)  # Only show warnings/errors on console normally
        logger.addHandler(console_handler)

setup_logging()
logger = logging.getLogger("buffer_scheduler")

def get_ads_in_downloads() -> list:
    """Scans the Downloads folder for astroai4u_ad_<number> images."""
    downloads_dir = Path.home() / "Downloads"
    if not downloads_dir.exists():
        logger.error(f"Downloads folder does not exist: {downloads_dir}")
        return []
        
    ad_files = []
    # Search for PNG, JPG, JPEG, WEBP files matching pattern
    for file_path in downloads_dir.iterdir():
        if file_path.is_file():
            name = file_path.name
            # Regex match for numerical ad pattern (e.g. astroai4u_ad_2.png)
            import re
            match = re.fullmatch(r"astroai4u_ad_(\d+)\.(png|jpg|jpeg|webp)", name, re.I)
            if match:
                ad_num = int(match.group(1))
                ad_files.append((ad_num, file_path))
                
    # Sort numerically by ad number
    ad_files.sort(key=lambda x: x[0])
    return ad_files

def resolve_instagram_channel(client: BufferClient):
    """Resolves the connected Instagram channel ID, prompt user if multiple are found."""
    channel_id = config.get_channel_id()
    if channel_id:
        orgs = client.get_organizations()
        if not orgs:
            raise RuntimeError("No organizations found in your Buffer account.")
            
        for org in orgs:
            channels = client.get_channels(org["id"])
            for ch in channels:
                if ch["id"] == channel_id:
                    if ch["service"].lower() != "instagram":
                        raise RuntimeError(f"Saved channel ID {channel_id} is not an Instagram channel.")
                    return org, ch
        logger.warning(f"Saved channel ID {channel_id} was not found. Re-resolving channel...")
        config.save_channel_id(None)

    # Auto resolve
    orgs = client.get_organizations()
    if not orgs:
        raise RuntimeError("No organizations found in your Buffer account.")
        
    instagram_channels = []
    org_mapping = {}
    
    for org in orgs:
        channels = client.get_channels(org["id"])
        for ch in channels:
            if ch["service"].lower() == "instagram":
                instagram_channels.append(ch)
                org_mapping[ch["id"]] = org
                
    if not instagram_channels:
        raise RuntimeError("No connected Instagram channels found in your Buffer account.")
        
    if len(instagram_channels) == 1:
        ch = instagram_channels[0]
        org = org_mapping[ch["id"]]
        config.save_channel_id(ch["id"])
        return org, ch
        
    # Interactive choice
    print("\nMultiple connected Instagram channels found:")
    for idx, ch in enumerate(instagram_channels, 1):
        print(f"  {idx}. {ch['name']} ({ch['displayName']}) - ID: {ch['id']}")
        
    if not sys.stdin.isatty():
        raise RuntimeError("Multiple Instagram channels found but terminal is non-interactive. Set BUFFER_INSTAGRAM_CHANNEL_ID.")
        
    while True:
        try:
            choice = input(f"Select channel (1-{len(instagram_channels)}): ").strip()
            c_idx = int(choice) - 1
            if 0 <= c_idx < len(instagram_channels):
                ch = instagram_channels[c_idx]
                org = org_mapping[ch["id"]]
                config.save_channel_id(ch["id"])
                return org, ch
        except (ValueError, IndexError):
            pass
        print("Invalid choice. Try again.")

def verify_connection():
    """Verify Buffer and ImgBB credentials and connectivity."""
    print("==============================================")
    print("VERIFYING SYSTEM CONFIGURATION & API CONNECTIVITY")
    print("==============================================")
    
    if not config.BUFFER_API_KEY:
        print("[-] ERROR: BUFFER_API_KEY is not set in your .env file.")
        sys.exit(1)
        
    if not config.IMGBB_API_KEY:
        print("[-] WARNING: IMGBB_API_KEY is not set in your .env. Local image uploads will fail.")
        
    try:
        client = BufferClient(config.BUFFER_API_KEY)
        org, channel = resolve_instagram_channel(client)
        print(f"[+] Connected Buffer organization: {org['name']} ({org['id']})")
        print(f"[+] Selected Instagram channel   : {channel['name']} ({channel['displayName']})")
        print(f"[+] Timezone                     : {config.POSTING_CONFIG['timezone']}")
        print(f"[+] Scheduled post time          : {config.POSTING_CONFIG['posting_time']} daily")
    except Exception as exc:
        print(f"[-] ERROR: Failed to connect to Buffer: {exc}")
        sys.exit(1)
        
    downloads_dir = Path.home() / "Downloads"
    print(f"[+] Downloads folder path        : {downloads_dir}")
    ads = get_ads_in_downloads()
    print(f"[+] Found {len(ads)} ad images in Downloads.")
    
    for ad_num, file_path in ads:
        try:
            val = validate_image(str(file_path))
            print(f"    - Ad {ad_num}: {file_path.name} (Valid: {val['width']}x{val['height']}, {val['format']})")
            if val["requires_notification"]:
                print(f"      [!] WARNING: {val['warning']}")
        except ImageValidationError as err:
            print(f"    - Ad {ad_num}: {file_path.name} ([-] INVALID: {err})")
            
    print("\nVerification check passed successfully.")
    return client, org, channel

def get_hashtag_and_caption(ad_number: int) -> tuple:
    """Extracts hashtags and main caption body according to hashtag placement settings."""
    caption_raw = CAPTIONS.get(ad_number, "")
    if not caption_raw:
        caption_raw = f"astroai4u.com\n\nPersonalized cosmic guidance powered by AI.\n\n#astrology #horoscope #astroai4u"
        
    if config.HASHTAG_PLACEMENT == "caption":
        return caption_raw, None
        
    # Split text and hashtags for first_comment placement
    lines = caption_raw.split("\n")
    main_text_lines = []
    hashtag_lines = []
    
    for line in lines:
        if line.strip().startswith("#") or all(word.startswith("#") for word in line.strip().split() if word):
            hashtag_lines.append(line)
        else:
            main_text_lines.append(line)
            
    main_caption = "\n".join(main_text_lines).strip()
    hashtags = "\n".join(hashtag_lines).strip()
    
    # Fallback to caption if no hashtags found
    if not hashtags:
        return caption_raw, None
        
    return main_caption, hashtags

def build_timeline_data(state_mgr: StateManager, schedule_map: dict, ads: list) -> list:
    """Builds a structured list of timeline data for reports."""
    timeline = []
    for ad_num, file_path in ads:
        state = state_mgr.get_ad_state(ad_num) or {}
        sched_time = schedule_map.get(ad_num)
        
        main_cap, hashtags = get_hashtag_and_caption(ad_num)
        caption_preview = main_cap[:50] + "..." if len(main_cap) > 50 else main_cap
        
        # Count hashtags
        all_text = main_cap + " " + (hashtags or "")
        hashtag_count = len([w for w in all_text.split() if w.startswith("#")])
        
        timeline.append({
            "ad_number": ad_num,
            "filename": file_path.name,
            "public_url": state.get("public_url") or "",
            "date": sched_time.strftime("%b %d, %Y") if sched_time else "-",
            "time": sched_time.strftime("%I:%M %p") if sched_time else "-",
            "caption": main_cap,
            "caption_preview": caption_preview.replace("\n", " "),
            "hashtag_count": hashtag_count,
            "status": state.get("status", "discovered"),
            "buffer_post_id": state.get("buffer_post_id"),
            "last_error": state.get("last_error")
        })
    return timeline

def show_timeline_summary(timeline_data: list):
    """Prints the final summary timeline to the console."""
    print("\n==============================================")
    print("ASTROAI4U INSTAGRAM POSTING TIMELINE")
    print(f"Timezone: {config.POSTING_CONFIG['timezone']}\n")
    
    counts = {
        "discovered": 0, "validated": 0, "scheduled": 0,
        "published": 0, "waiting_for_queue_space": 0,
        "failed": 0, "skipped": 0
    }
    
    for item in timeline_data:
        status = item["status"]
        counts[status] = counts.get(status, 0) + 1
        
        icon = "○"
        if status in ["scheduled", "published"]:
            icon = "✓"
        elif status == "failed":
            icon = "✗"
        elif status == "skipped":
            icon = "–"
            
        err_info = f" — Failed: {item['last_error']}" if item["last_error"] else ""
        print(f"{icon} Ad {item['ad_number']:<2} — {item['date']} at {item['time']} — {status.replace('_', ' ').capitalize()}{err_info}")
        
    print("\nSummary Totals:")
    print(f"  Discovered:              {len(timeline_data)}")
    print(f"  Scheduled:               {counts.get('scheduled', 0)}")
    print(f"  Published:               {counts.get('published', 0)}")
    print(f"  Waiting for queue space: {counts.get('waiting_for_queue_space', 0)}")
    print(f"  Failed:                  {counts.get('failed', 0)}")
    print(f"  Skipped:                 {counts.get('skipped', 0)}")
    print("==============================================")

def preview_timeline():
    """Generates and prints preview reports without scheduling."""
    client, org, channel = verify_connection()
    state_mgr = StateManager(config.STATE_FILE_PATH)
    
    ads = get_ads_in_downloads()
    if not ads:
        print("[-] No ad images found in Downloads.")
        return
        
    now_dt = datetime.now(config.TIMEZONE)
    schedule_map = calculate_schedule([a[0] for a in ads], now_dt)
    
    timeline_data = build_timeline_data(state_mgr, schedule_map, ads)
    
    # Print Markdown Table
    print("\nAd | Image | Date | Time | Caption preview | Status")
    print("-" * 75)
    for item in timeline_data:
        print(f"{item['ad_number']:<2} | {item['filename']:<20} | {item['date']} | {item['time']} | {item['caption_preview']:<25} | {item['status']}")
        
    # Generate CSV & HTML reports
    generate_csv_report(timeline_data, config.BASE_DIR / "posting_timeline.csv")
    generate_html_report(timeline_data, config.BASE_DIR / "posting_timeline.html", config.POSTING_CONFIG["timezone"])
    
    show_timeline_summary(timeline_data)

def check_status():
    """Reconcile local state with Buffer posting queue."""
    client, org, channel = verify_connection()
    state_mgr = StateManager(config.STATE_FILE_PATH)
    
    print("\nSynchronizing local state with Buffer...")
    try:
        # Fetch current scheduled posts from Buffer
        queued_posts = client.get_queued_posts(org["id"], channel["id"])
        queued_ids = {p["id"] for p in queued_posts}
        
        now_dt = datetime.now(config.TIMEZONE)
        
        # Reconcile local state
        for ad_num_str, state in state_mgr.state.items():
            ad_num = int(ad_num_str)
            post_id = state.get("buffer_post_id")
            status = state.get("status")
            
            if status == "scheduled" and post_id:
                if post_id in queued_ids:
                    # Still scheduled in Buffer
                    continue
                else:
                    # Not in the scheduled queue anymore. Has the time passed?
                    sched_time_str = state.get("scheduled_at")
                    if sched_time_str:
                        sched_time = datetime.fromisoformat(sched_time_str).astimezone(config.TIMEZONE)
                        if sched_time < now_dt:
                            # Time passed, assume published
                            state_mgr.update_ad_state(ad_num, {"status": "published", "last_error": None})
                            logger.info(f"Ad {ad_num} is no longer in queue and scheduled time has passed. Marked as published.")
                        else:
                            # Not scheduled and time hasn't passed -> deleted/canceled in Buffer
                            state_mgr.update_ad_state(ad_num, {"status": "waiting_for_queue_space", "last_error": "Canceled manually in Buffer."})
                            logger.info(f"Ad {ad_num} was canceled or deleted in Buffer.")
                            
        print("[+] Reconciled local state with Buffer queue successfully.")
    except Exception as exc:
        print(f"[-] Failed to reconcile state: {exc}")
        
    # Print status report
    ads = get_ads_in_downloads()
    now_dt = datetime.now(config.TIMEZONE)
    schedule_map = calculate_schedule([a[0] for a in ads], now_dt)
    timeline_data = build_timeline_data(state_mgr, schedule_map, ads)
    show_timeline_summary(timeline_data)

def schedule_posts(non_interactive=False):
    """Processes and schedules ads on Buffer."""
    client, org, channel = verify_connection()
    state_mgr = StateManager(config.STATE_FILE_PATH)
    
    ads = get_ads_in_downloads()
    if not ads:
        print("[-] No ad images found to schedule.")
        return
        
    now_dt = datetime.now(config.TIMEZONE)
    schedule_map = calculate_schedule([a[0] for a in ads], now_dt)
    
    # 1. Fetch current queue size from Buffer
    try:
        queued_posts = client.get_queued_posts(org["id"], channel["id"])
        current_queue_size = len(queued_posts)
        print(f"\nCurrent Buffer queue size: {current_queue_size} posts.")
    except Exception as exc:
        print(f"[-] ERROR: Failed to read Buffer queue size: {exc}")
        sys.exit(1)
        
    # Free capacity (Buffer Free plans usually limit to 10 scheduled posts total per channel)
    max_queue_size = 10
    free_slots = max(0, max_queue_size - current_queue_size)
    print(f"Available slots in Buffer queue: {free_slots}")

    plan_to_schedule = []
    
    for ad_num, file_path in ads:
        state = state_mgr.get_ad_state(ad_num) or {}
        status = state.get("status")
        
        # Get hash of current file
        file_hash = state_mgr.get_file_hash(str(file_path))
        caption_text, hashtags = get_hashtag_and_caption(ad_num)
        caption_hash = state_mgr.get_string_hash(caption_text + (hashtags or ""))
        
        # Check if already scheduled or published with same image and caption
        if status in ["scheduled", "published"]:
            saved_file_hash = state.get("file_hash")
            saved_caption_hash = state.get("caption_hash")
            
            if saved_file_hash == file_hash and saved_caption_hash == caption_hash:
                # Already posted/scheduled with no modifications
                continue
            else:
                print(f"[!] WARNING: Ad {ad_num} image or caption has modified since being {status}!")
                if not config.ALLOW_REPLACE_EXISTING:
                    print(f"    - Skipping reschedule for Ad {ad_num} (ALLOW_REPLACE_EXISTING = False)")
                    continue
                    
        # Check image compatibility
        try:
            validate_image(str(file_path))
        except ImageValidationError as err:
            state_mgr.update_ad_state(ad_num, {
                "filename": file_path.name,
                "status": "failed",
                "last_error": str(err)
            })
            continue
            
        plan_to_schedule.append((ad_num, file_path, file_hash, caption_hash, caption_text, hashtags))

    if not plan_to_schedule:
        print("\nAll ad images are already scheduled or published. Nothing to do!")
        return
        
    print("\nProposed Scheduling Actions:")
    for ad_num, file_path, _, _, _, _ in plan_to_schedule:
        target_time = schedule_map[ad_num]
        print(f"  - Schedule Ad {ad_num} ({file_path.name}) at {target_time.strftime('%b %d, %Y at %I:%M %p')}")
        
    if not non_interactive:
        choice = input("\nSchedule these posts in Buffer? [y/N]: ").strip().lower()
        if choice != "y":
            print("Action aborted.")
            return

    # Initialize ImgBB uploader
    try:
        uploader = ImgBBUploader(config.IMGBB_API_KEY)
    except ImageUploaderError as err:
        print(f"[-] ERROR: {err}")
        sys.exit(1)

    for ad_num, file_path, file_hash, caption_hash, caption_text, hashtags in plan_to_schedule:
        # Check queue limits before attempting to upload/schedule
        if free_slots <= 0:
            print(f"[!] Buffer queue is full. Marking Ad {ad_num} as waiting_for_queue_space.")
            state_mgr.update_ad_state(ad_num, {
                "filename": file_path.name,
                "status": "waiting_for_queue_space",
                "last_error": "Buffer queue capacity reached. Waiting for queue space."
            })
            continue
            
        # Get target scheduled ISO timestamp
        target_dt = schedule_map[ad_num]
        target_iso = target_dt.isoformat()
        
        state_mgr.update_ad_state(ad_num, {
            "filename": file_path.name,
            "status": "uploading",
            "last_error": None
        })
        
        # 1. Upload local file to ImgBB
        try:
            public_url = uploader.upload(str(file_path))
        except ImageUploaderError as err:
            print(f"[-] Ad {ad_num} upload failed: {err}")
            state_mgr.update_ad_state(ad_num, {
                "status": "failed",
                "last_error": f"Image hosting failed: {err}"
            })
            continue
            
        # 2. Schedule on Buffer
        print(f"Scheduling Ad {ad_num} via Buffer API...")
        try:
            attempts = state_mgr.get_ad_state(ad_num).get("attempts", 0) + 1
            state_mgr.update_ad_state(ad_num, {"attempts": attempts})
            
            # Execute create post mutation
            post_info = client.create_post(
                channel_id=channel["id"],
                text=caption_text,
                due_at=target_iso,
                image_url=public_url,
                first_comment=hashtags
            )
            
            # Update state to scheduled
            state_mgr.update_ad_state(ad_num, {
                "status": "scheduled",
                "buffer_post_id": post_info["id"],
                "channel_id": channel["id"],
                "public_url": public_url,
                "file_hash": file_hash,
                "caption_hash": caption_hash,
                "scheduled_at": target_iso,
                "last_error": None
            })
            print(f"[+] Successfully scheduled Ad {ad_num} (Post ID: {post_info['id']})")
            free_slots -= 1
            
        except BufferAPIError as err:
            logger.error(f"Ad {ad_num} Buffer scheduling failed: {err.message}")
            status = "waiting_for_queue_space" if "limit" in err.message.lower() else "failed"
            state_mgr.update_ad_state(ad_num, {
                "status": status,
                "last_error": err.message
            })
            print(f"[-] Failed to schedule Ad {ad_num} on Buffer: {err.message}")
            
    # Generate updated reports
    updated_timeline = build_timeline_data(state_mgr, schedule_map, ads)
    generate_csv_report(updated_timeline, config.BASE_DIR / "posting_timeline.csv")
    generate_html_report(updated_timeline, config.BASE_DIR / "posting_timeline.html", config.POSTING_CONFIG["timezone"])
    
    show_timeline_summary(updated_timeline)

def retry_failures():
    """Retries scheduling ads that previously failed due to temporary issues."""
    client, org, channel = verify_connection()
    state_mgr = StateManager(config.STATE_FILE_PATH)
    
    ads = get_ads_in_downloads()
    failed_ads = []
    
    for ad_num, file_path in ads:
        state = state_mgr.get_ad_state(ad_num) or {}
        if state.get("status") == "failed":
            # Verify if error is retryable (like image hosting, timeout, API temporary errors)
            last_err = state.get("last_error", "")
            if last_err and any(word in last_err.lower() for word in ["unsupported", "invalid", "dimension", "aspect ratio", "permission"]):
                print(f"Skipping retry for Ad {ad_num} due to permanent error: {last_err}")
                continue
            failed_ads.append((ad_num, file_path))
            
    if not failed_ads:
        print("No ads with retryable temporary failures found.")
        return
        
    print(f"\nFound {len(failed_ads)} failed ads to retry:")
    for ad_num, file_path in failed_ads:
        print(f"  - Ad {ad_num} ({file_path.name})")
        
    choice = input("\nRetry these uploads? [y/N]: ").strip().lower()
    if choice != "y":
        print("Aborted.")
        return
        
    # Reset status of failed ads to discovered so they get picked up by scheduler
    for ad_num, _ in failed_ads:
        state_mgr.update_ad_state(ad_num, {"status": "discovered", "last_error": None})
        
    schedule_posts(non_interactive=True)

def main():
    if len(sys.argv) < 2:
        print("Usage: python buffer_instagram_scheduler.py [verify | preview | schedule | status | retry]")
        print("Optional: --yes flag with 'schedule' for non-interactive mode")
        sys.exit(1)
        
    mode = sys.argv[1].lower()
    
    if mode == "verify":
        verify_connection()
    elif mode == "preview":
        preview_timeline()
    elif mode == "schedule":
        non_interactive = "--yes" in sys.argv
        schedule_posts(non_interactive)
    elif mode == "status":
        check_status()
    elif mode == "retry":
        retry_failures()
    else:
        print(f"Unknown mode: {mode}")
        print("Available modes: verify, preview, schedule, status, retry")
        sys.exit(1)

if __name__ == "__main__":
    main()
