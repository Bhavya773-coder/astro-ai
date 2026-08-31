# AstroAI4U Instagram Posting Automation via Buffer

This directory contains a production-ready, reliable Python posting system that automates scheduling and posting advertisement images to Instagram using the official Buffer GraphQL API.

---

## 1. What the Tool Does
The tool automatically:
- Scans your system's `Downloads` folder for ad images named `astroai4u_ad_<number>.png` (or `.jpg`, `.jpeg`, `.webp`).
- Validates that images exist, can be opened, are uncorrupted, and meet Instagram aspect-ratio rules (ideally between 4:5 and 1.91:1).
- Maps each image to its unique caption and hashtags from `captions.py`.
- Uploads local images to ImgBB (to generate stable, public media URLs required by Buffer).
- Calls Buffer's GraphQL API to schedule the posts for 7:00 PM IST daily starting on **July 14, 2026** (or custom dates/times you override).
- Generates beautiful timeline reports in CSV (`posting_timeline.csv`) and portable HTML (`posting_timeline.html`) formats.

---

## 2. Why Buffer is Used Instead of Direct Browser Automation
Automating direct browser actions on Instagram Web is highly fragile because:
- Instagram regularly updates its HTML class names, DOM layout, and popups.
- Frequent login challenges, verification checks, and duplicate-session alerts trigger bot-detection blocks.
- Page hydration delay conflicts cause dynamic React components to load out-of-order.

Using Buffer's official developer API provides a stable, supported, and secure pathway that eliminates browser automation entirely and complies fully with Instagram's developer policies.

---

## 3. Python Installation Instructions
Make sure you have **Python 3.11** or newer installed.
1. Download Python from the [official site](https://www.python.org/downloads/).
2. During installation, check the box for **"Add Python to PATH"**.

---

## 4. Dependency Installation
Run the following commands in your terminal (PowerShell or Command Prompt) to set up your virtual environment and install dependencies:

```powershell
# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
.venv\Scripts\activate

# Install required dependencies
pip install -r requirements.txt
```

---

## 5. How to Obtain the Required Buffer API Credential
To generate a Buffer Personal Access Token/API Key:
1. Log in to your Buffer account in your web browser.
2. Go to **Settings** -> **API**.
3. Under **Personal Access Tokens**, click **Generate New Token**.
4. Copy the token and paste it into your `.env` file as `BUFFER_API_KEY`.

---

## 6. How to Identify the Instagram Channel
You don't need to hunt for the channel ID manually! 
If you leave `BUFFER_INSTAGRAM_CHANNEL_ID` blank in your `.env` file and run `verify` or `schedule`, the script will automatically query Buffer's API. 
- If exactly one connected Instagram channel is found, it will select it automatically.
- If multiple Instagram channels are found, it will print a numbered list allowing you to choose. The selected channel is saved securely in a local `local_config.json` file (which is ignored by Git).

---

## 7. How to Configure `.env`
Create a `.env` file in the `buffer-instagram-automation` folder (copied from `.env.example`) and fill in your keys:

```text
BUFFER_API_KEY=apikey-mKadteV2KWJ6G7n8cW91EmtNKX_KkrGZPCEqRKXQFcE
BUFFER_INSTAGRAM_CHANNEL_ID=
IMGBB_API_KEY=your_imgbb_api_key_here
```

To get a free `IMGBB_API_KEY` for hosting ad images:
1. Go to [ImgBB API](https://api.imgbb.com/).
2. Create a free account.
3. Generate a free API key and copy it into `.env`.

---

## 8. How to Run `verify`
Verifies your Buffer credentials, connected Instagram profile status, local Downloads folder, and ad image files.
```powershell
python buffer_instagram_scheduler.py verify
```

---

## 9. How to Run `preview`
Generates a markdown table of your posting calendar, creates CSV/HTML reports, and prints the timeline summary without uploading or writing anything to Buffer.
```powershell
python buffer_instagram_scheduler.py preview
```

---

## 10. How to Schedule Posts
To schedule your ads in Buffer, run:
```powershell
python buffer_instagram_scheduler.py schedule
```
The program will display the scheduling plan and ask for confirmation `[y/N]`.

For non-interactive scheduling (e.g. cron jobs or automated scripts), run:
```powershell
python buffer_instagram_scheduler.py schedule --yes
```

---

## 11. How Timeline Shifting Works
The posting schedule starts on **July 14, 2026 at 7:00 PM IST** and posts daily.
If the script is run on a date in the past (or if config dates are in the past):
- Under `PAST_DATE_MODE = "shift"`, the scheduler moves the first unscheduled ad to the next available future slot (e.g., today's or tomorrow's 7:00 PM IST slot).
- All subsequent ads are shifted forward by 1 day to maintain the sequence and prevent scheduling conflicts.

---

## 12. How Queue Limits are Handled
Buffer free plans allow a maximum of **10 scheduled posts** at a time per channel.
- The scheduler automatically retrieves your current Buffer queue size.
- If the queue limit is reached, remaining unscheduled ads are marked as `waiting_for_queue_space`.
- Running the scheduler again at a later date will automatically schedule the waiting ads as older posts get published and queue capacity opens up.

---

## 13. How Duplicate Protection Works
To guarantee that the exact same ad is never posted twice:
- The script hashes the image file (`sha256-value`) and caption text.
- These hashes and the Buffer post ID are stored in `buffer_post_state.json`.
- Before scheduling an ad, it compares the current hashes with the stored state and skips the ad if it is already scheduled/published.
- If you modify an image file or caption text on disk after scheduling, the program detects the hash change and prints a warning instead of creating a duplicate.

---

## 14. How to Check Status
Synchronizes local state with Buffer's queue and reports the status of your ads:
```powershell
python buffer_instagram_scheduler.py status
```

---

## 15. How to Retry Failures
Retries scheduling ads that failed due to temporary errors (e.g., network timeout, API limits):
```powershell
python buffer_instagram_scheduler.py retry
```
Permanent failures (e.g. bad dimensions, missing credentials) are skipped to prevent duplicate posting bugs.

---

## 16. Common Buffer and Instagram Publishing Errors
- **"Requires Notification Publishing"**: If your image is tall (e.g. 9:16) or extremely wide, Instagram's API doesn't support automatic direct publishing. You must post it manually via the Buffer phone app notification.
- **"Rate Limit Exceeded (HTTP 429)"**: The script handles this automatically by pausing and retrying with exponential backoff and jitter.
- **"First Comment Not Published"**: Buffer occasionally fails to post first comments to Instagram accounts that are not set up as Instagram Professional/Business profiles connected to a Facebook page. If this occurs, the script falls back to placing hashtags in the caption.

---

## 17. Security Precautions
- **Secret Keys**: Never commit your `.env` or `local_config.json` files to Git. They are ignored by the default `.gitignore`.
- **Sensitive Logs**: The rotating log file (`logs/buffer_scheduler.log`) logs error messages but strips authentication headers, tokens, and keys.

---

## 18. Example Output
```text
ASTROAI4U INSTAGRAM POSTING TIMELINE
Timezone: Asia/Kolkata

✓ Ad 1  — Jul 14, 2026 at 07:00 PM — Scheduled
✓ Ad 2  — Jul 15, 2026 at 07:00 PM — Scheduled
○ Ad 3  — Jul 16, 2026 at 07:00 PM — Waiting
✗ Ad 4  — Jul 17, 2026 at 07:00 PM — Failed: unsupported dimensions
```
