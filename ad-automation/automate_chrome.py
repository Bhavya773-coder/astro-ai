import os
import sys
import time
import urllib.request

# Define default fallback marketing prompts for astroai4u.com
DEFAULT_PROMPTS = [
    # Ad 1: General Brand & AI Birth Charts
    "A premium mystical Instagram ad illustration promoting the website astroai4u.com. "
    "In the center, a delicate, glowing celestial compass and circular birth chart orbits rendered in fine golden lines. "
    "The background consists of soft, dreamy watercolor washes in lavender and sky blue, decorated with faint hand-drawn stars "
    "and a slim golden crescent moon. The layout is clean and spiritual, with a sense of cosmic wisdom. The lowercase "
    "domain name astroai4u.com is subtly and beautifully integrated at the bottom of the design in an elegant, minimalist font. Square 1:1 format.",
    
    # Ad 2: AI Astrologer Chat (Real-time Guidance)
    "A modern spiritual Instagram ad for astroai4u.com promoting real-time AI astrology chat. "
    "An elegant mockup of a modern smartphone resting on a marble surface covered in celestial watercolor splashes of lavender and sky blue. "
    "The phone screen displays a beautiful, clean cosmic chat interface with a digital assistant, featuring a soft golden crescent moon avatar. "
    "Surrounding the phone are subtle gold dust trails, small glowing constellations, and light watercolor blobs. "
    "The lowercase domain name astroai4u.com is written clearly at the top header of the phone screen in a sleek font. 1:1 aspect ratio.",
    
    # Ad 3: AI Tarot Card Readings
    "An artistic, premium Instagram ad illustration for astroai4u.com highlighting interactive AI tarot readings. "
    "Two mystical tarot cards are displayed floating slightly, showing detailed line drawings of the Sun and the Moon with delicate golden borders. "
    "The cards float over a background of soft, blended watercolor washes in pale blue and lavender. Subtle glowing sparkles and small star "
    "constellations float around the cards. The lowercase domain name astroai4u.com is written elegantly at the bottom center of the cards in a clean, modern typeface. 1:1 ratio.",
    
    # Ad 4: Daily Horoscope & Astro-Transits
    "A premium cosmic ad design for astroai4u.com daily horoscopes. "
    "A beautiful, minimalist illustration of the 12 zodiac symbols arranged in a delicate circular wheel in the center, glowing with a soft golden light. "
    "The background is a soft, calming blend of lavender and light blue watercolor textures. Minimalist gold sparkles and dust decorate the layout. "
    "The lowercase domain name astroai4u.com is placed cleanly at the center of the zodiac wheel in a small, modern font. Square 1:1 format.",
    
    # Ad 5: Love & Relationship Compatibility (Synastry)
    "An elegant, dreamy Instagram advertisement image for astroai4u.com promoting AI relationship compatibility. "
    "Two overlapping celestial circles representing planetary synastry, connected by glowing golden constellations. "
    "The entire design is bathed in soft, romantic watercolor textures of lavender, pale rose, and sky blue. "
    "A small, delicate gold crescent moon sits in the upper corner. The lowercase domain name astroai4u.com is embedded "
    "seamlessly along one of the orbital paths in a neat, lowercase sans-serif font. 1:1 aspect ratio.",

    # Ad 6: Numerology & Life Path Calculator
    "A modern, premium Instagram ad illustration for astroai4u.com promoting AI numerology reports. "
    "Features floating glowing numbers (like 11, 22, 7, 3) in an elegant, golden serif typeface, swirling around a central golden key. "
    "The background is a beautiful, light watercolor canvas of soft lavender and sky-blue washes, detailed with delicate cosmic orbits. "
    "The lowercase domain name astroai4u.com is written cleanly along the bottom in a small, minimalist font. Square 1:1 ratio.",

    # Ad 7: Lunar Cycle Tracking & Moon Rituals
    "A spiritual, high-end Instagram ad image for astroai4u.com promoting moon phase tracking. "
    "Displays the phases of the moon from new moon to full moon in a clean horizontal layout, connected by thin golden threads. "
    "The moon illustrations are highly detailed, glowing in soft gold. The backdrop is a serene watercolor texture of lavender and sky blue. "
    "The lowercase domain name astroai4u.com is printed at the top center in a sleek, lowercase font. 1:1 aspect ratio.",

    # Ad 8: Astro-Calendar & Celestial Events
    "A premium, minimalist Instagram ad design for astroai4u.com promoting a celestial event calendar. "
    "Features a clean, modern calendar layout with a glowing golden star highlighting the current date. "
    "The calendar is superimposed on a delicate celestial map showing planetary transits. The background is composed of soft "
    "watercolor gradients in sky blue and lavender. The lowercase domain name astroai4u.com is integrated at the bottom right corner in a tiny, clean font. Square 1:1 ratio.",

    # Ad 9: AI Dream Interpretation
    "A dreamy, surreal Instagram ad illustration for astroai4u.com promoting AI dream analysis. "
    "A large, beautifully sketched eye with a nebula and galaxies reflecting inside the iris. "
    "The background is a soft, cloud-like wash of lavender and pale blue watercolor. Delicate gold dust and stars float peacefully in the air. "
    "The lowercase domain name astroai4u.com is placed gently under the eye in a clean, modern font. 1:1 aspect ratio.",

    # Ad 10: Planetary Remedies & Crystals
    "A high-end Instagram ad for astroai4u.com showcasing planetary crystal healing remedies. "
    "A group of three clean, raw crystals (amethyst, aquamarine, and clear quartz) reflecting a soft golden light. "
    "The crystals sit on a background of sky-blue and lavender watercolor washes with delicate golden orbits surrounding them. "
    "The lowercase domain name astroai4u.com is written neatly at the bottom center in a sleek font. Square 1:1 format.",

    # Ad 11: Mercury Retrograde Survival Guide
    "A fun, modern, yet premium Instagram ad for astroai4u.com survival guide for Mercury retrograde. "
    "Displays an hourglass with glowing golden sand flowing upwards against gravity, symbolizing time transits. "
    "The background features sky-blue and lavender watercolor textures with thin golden planetary rings. "
    "The lowercase domain name astroai4u.com is embedded seamlessly around the rim of the hourglass in a small, clean font. 1:1 aspect ratio.",

    # Ad 12: Chakra Alignment & Cosmic Energy
    "A beautiful, spiritual Instagram ad image for astroai4u.com promoting cosmic chakra alignment. "
    "A minimalist outline of a figure in a meditation pose, with 7 glowing energy points aligned along the spine, illuminated in soft golden lights. "
    "The background is a calming balance of lavender, sky blue, and white watercolor washes. The lowercase domain name astroai4u.com "
    "is placed at the top in a modern, lightweight font. Square 1:1 ratio.",

    # Ad 13: Astrological Wellness & Health
    "A premium lifestyle Instagram ad for astroai4u.com daily wellness guidelines based on your zodiac sign. "
    "A glowing gold chalice with water ripples and small celestial stars floating above it. "
    "The backdrop consists of fresh, soft lavender and sky-blue watercolor washes with delicate golden botanical leaves. "
    "The lowercase domain name astroai4u.com is positioned cleanly at the bottom in a small, elegant typeface. 1:1 aspect ratio.",

    # Ad 14: Astro-Cartography & Power Places
    "A premium travel-astrology Instagram ad design for astroai4u.com promoting power location maps. "
    "A stylized outline of a world map with glowing golden planetary lines crossing over major continents. "
    "The background is a soft watercolor wash of light sky blue and lavender. The lowercase domain name astroai4u.com "
    "is displayed beautifully in the ocean area of the map in a small, minimalist font. Square 1:1 ratio.",

    # Ad 15: Karma & Past Life Analysis
    "A deep, spiritual Instagram ad illustration for astroai4u.com past life karma readings. "
    "An elegant infinity symbol (∞) drawn in delicate golden lines, with small stars and constellations nested inside the loops. "
    "The background is a soft, swirling watercolor wash of deep lavender and pale blue. "
    "The lowercase domain name astroai4u.com is positioned horizontally below the infinity symbol in a clean, modern font. 1:1 aspect ratio.",

    # Ad 16: Career & Wealth Astrology
    "A high-end Instagram ad for astroai4u.com career and financial astrology reports. "
    "A beautiful golden key resting on a constellation chart of the midheaven (MC) house, representing career path. "
    "The background is a premium wash of sky blue and lavender watercolor. Faint gold sparkles drift across the scene. "
    "The lowercase domain name astroai4u.com is engraved along the handle of the key in a tiny, clean font. Square 1:1 format.",

    # Ad 17: Celestial Meditation & Audio Guides
    "An elegant Instagram ad image for astroai4u.com promoting cosmic audio guides and meditation. "
    "A pair of modern, sleek wireless headphones resting next to a glowing golden soundwave pattern that blends into constellation lines. "
    "The background is a calming watercolor wash of lavender and soft blue. The lowercase domain name astroai4u.com is written "
    "at the bottom center in a clean, minimalist font. 1:1 aspect ratio.",

    # Ad 18: Astro-Parenting & Family Charts
    "A warm, celestial Instagram ad for astroai4u.com parent-child compatibility. "
    "A beautiful illustration showing a large golden constellation of a mother star and a small baby star side-by-side, glowing warmly. "
    "The background is a gentle watercolor wash of lavender and soft sky blue. The lowercase domain name astroai4u.com "
    "is printed at the bottom center in a sleek, lowercase font. Square 1:1 format.",

    # Ad 19: Kundli Matching (Vedic Astrology)
    "A premium Instagram ad for astroai4u.com Vedic Kundli matching. "
    "Two beautifully hand-drawn golden lotus flowers side-by-side, connected by a delicate, glowing golden thread. "
    "The background is a wash of sky-blue and lavender watercolor. Faint golden stars populate the cosmic sky. "
    "The lowercase domain name astroai4u.com is written beautifully along the bottom edge in a clean, modern font. 1:1 ratio.",

    # Ad 20: Year Ahead Astrology Planner
    "An elegant, inspiring Instagram ad for astroai4u.com year-ahead transit planners. "
    "A premium, open leather journal with blank pages reflecting a soft golden glow of a rising sun. "
    "The journal lies on a background of lavender and sky-blue watercolor washes, surrounded by golden zodiac symbol icons. "
    "The lowercase domain name astroai4u.com is placed on the cover of the journal in a small, clean font. Square 1:1 format."
]

def load_prompts():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    prompts_file = os.path.join(script_dir, "prompts.md")
    
    if os.path.exists(prompts_file):
        try:
            loaded = []
            current_prompt = []
            in_prompt_section = False
            
            with open(prompts_file, "r", encoding="utf-8") as f:
                for line in f:
                    line_stripped = line.strip()
                    
                    # Detect start of a new prompt header (e.g. "### 1. ...")
                    if line_stripped.startswith("###"):
                        if current_prompt:
                            full_text = " ".join(current_prompt).strip()
                            if full_text:
                                loaded.append(full_text)
                            current_prompt = []
                        in_prompt_section = True
                        continue
                    
                    if in_prompt_section:
                        # End section on divider or another main header
                        if line_stripped.startswith("---") or line_stripped.startswith("##"):
                            if current_prompt:
                                full_text = " ".join(current_prompt).strip()
                                if full_text:
                                    loaded.append(full_text)
                                current_prompt = []
                            in_prompt_section = False
                            continue
                        
                        # Clean up blockquote character or backticks
                        clean_line = line_stripped
                        if clean_line.startswith(">"):
                            clean_line = clean_line[1:].strip()
                        clean_line = clean_line.replace("`", "")
                        
                        if clean_line:
                            current_prompt.append(clean_line)
            
            # Save the last prompt
            if current_prompt:
                full_text = " ".join(current_prompt).strip()
                if full_text:
                    loaded.append(full_text)
            
            if loaded:
                print(f"Loaded {len(loaded)} prompts dynamically from prompts.md.")
                return loaded
        except Exception as e:
            print(f"Error reading prompts.md: {e}")
            
    print("Using default hardcoded prompts.")
    return DEFAULT_PROMPTS

def run_automation():
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Error: The 'playwright' package is not installed.")
        print("Please run: pip install playwright")
        sys.exit(1)

    print("Connecting to your running Chrome instance on debugging port 9222...")
    print("Ensure Chrome was started with: chrome.exe --remote-debugging-port=9222 --user-data-dir=\"C:\\ChromeDebug\"")
    
    with sync_playwright() as p:
        try:
            # Connect to Chrome via DevTools Protocol
            browser = p.chromium.connect_over_cdp("http://localhost:9222")
            
            # Fetch active context and page
            context = browser.contexts[0]
            page = context.pages[0] if context.pages else context.new_page()
            
            print("\nNavigating to Gemini...")
            page.goto("https://gemini.google.com", wait_until="domcontentloaded")
            
            # Check if logged in
            if "signin" in page.url or "login" in page.url:
                print("Warning: You are not logged in to Google/Gemini in this Chrome instance.")
                print("Please log in manually on the open browser window first, then run this script again.")
                return

            # Get path to the system Downloads folder
            output_dir = os.path.join(os.path.expanduser("~"), "Downloads")
            if not os.path.exists(output_dir):
                output_dir = "generated_ads"
                os.makedirs(output_dir, exist_ok=True)

            # Shuffle prompts list to run in a random order with no duplicates
            import random
            shuffled_prompts = list(load_prompts())
            random.shuffle(shuffled_prompts)
            
            # Select exactly 5 prompts for this run
            selected_prompts = shuffled_prompts[:5]

            print(f"\nStarting randomized batch generation of {len(selected_prompts)} unique ads for astroai4u.com...")
            
            for index, prompt in enumerate(selected_prompts):
                ad_num = index + 1
                print(f"\n--- Generating Ad {ad_num}/{len(selected_prompts)} ---")
                print(f"Prompt: {prompt[:80]}...")

                # 1. Get list of existing images on page BEFORE sending prompt
                existing_images = set()
                try:
                    for img in page.locator("img").all():
                        src = img.get_attribute("src")
                        if src:
                            existing_images.add(src)
                except Exception:
                    pass

                # 2. Wait for prompt input box
                input_selector = "textarea, rich-textarea, [contenteditable='true'], [placeholder*='Gemini']"
                page.wait_for_selector(input_selector, timeout=30000)
                prompt_input = page.locator(input_selector).first
                
                # 3. Click, focus, and type the prompt
                prompt_input.click()
                prompt_input.focus()
                
                # Clear input box first
                page.keyboard.press("Control+A")
                page.keyboard.press("Backspace")
                time.sleep(0.5)
                
                # Type using keyboard simulation
                page.keyboard.type(prompt)
                time.sleep(1)
                
                # 4. Submit prompt safely (Click Send button OR press Enter, NOT both)
                print("Sending prompt to Gemini...")
                send_button = page.locator("button[aria-label*='Send message'], button[aria-label*='Send'], button[aria-label*='Submit']").first
                if send_button.is_visible() and send_button.is_enabled():
                    send_button.click()
                    print("Clicked Send button.")
                else:
                    page.keyboard.press("Enter")
                    print("Pressed Enter.")

                # 5. Wait for the new generated image to appear
                print("Waiting for image to generate (approx. 20-60 seconds)...")
                new_image_src = None
                last_image_element = None
                start_time = time.time()
                
                while time.time() - start_time < 90:  # 90 seconds timeout
                    time.sleep(3)
                    
                    try:
                        current_images = page.locator("img").all()
                        for img in current_images:
                            src = img.get_attribute("src")
                            if src and src not in existing_images:
                                # Exclude user profile picture URLs (which contain /a/ or /a-)
                                if "/a/" in src or "/a-" in src or "googleusercontent.com/a/" in src:
                                    continue
                                    
                                # Verify if it's a large generated image
                                is_generated = "googleusercontent" in src or "prod-embed-cdn" in src
                                
                                # Double check natural width (generated images are always > 250px)
                                try:
                                    width_val = img.evaluate("el => el.naturalWidth")
                                    if width_val:
                                        if width_val < 250:
                                            is_generated = False
                                        else:
                                            is_generated = True
                                except Exception:
                                    pass
                                
                                if is_generated:
                                    new_image_src = src
                                    last_image_element = img
                                    break
                        if new_image_src:
                            break
                    except Exception:
                        pass
                
                if new_image_src and last_image_element:
                    # Get the original index of this prompt (1-based index from prompts.md)
                    try:
                        original_idx = PROMPTS.index(prompt) + 1
                    except Exception:
                        original_idx = ad_num

                    print(f"New image generated. Attempting verified download sequence...")
                    output_path = os.path.join(output_dir, f"astroai4u_ad_{original_idx}.png")
                    
                    download_success = False
                    for attempt in range(1, 6):
                        print(f"Download attempt {attempt}/5...")
                        
                        # Clean up existing file if it's failed/partial
                        if os.path.exists(output_path):
                            try:
                                os.remove(output_path)
                            except Exception:
                                pass
                        
                        # 6a. Try browser UI download
                        try:
                            last_image_element.scroll_into_view_if_needed()
                            time.sleep(1)
                            last_image_element.hover()
                            time.sleep(1)
                            
                            # Find direct download button
                            download_button = page.locator("button[aria-label*='Download'], button[aria-label*='download']").last
                            
                            # If not visible, click 3-dot menu first
                            if not (download_button.is_visible() and download_button.is_enabled()):
                                three_dots = page.locator("button[aria-label*='More options'], button[aria-label*='more options']").last
                                if three_dots.is_visible():
                                    three_dots.click()
                                    time.sleep(1.5)
                                    download_button = page.locator("span:has-text('Download'), [aria-label*='Download'], [role='menuitem']:has-text('Download')").last
                                    
                            if download_button.is_visible() and download_button.is_enabled():
                                with page.expect_download(timeout=20000) as download_info:
                                    download_button.click()
                                download = download_info.value
                                download.save_as(output_path)
                        except Exception as ui_err:
                            print(f"  UI download attempt failed: {ui_err}")
                            
                        # 6b. Try fallback direct HTTP download if file does not exist or is empty
                        if not (os.path.exists(output_path) and os.path.getsize(output_path) > 0):
                            print("  UI download didn't produce file. Trying fallback direct HTTP download...")
                            try:
                                req = urllib.request.Request(
                                    new_image_src, 
                                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                                )
                                with urllib.request.urlopen(req, timeout=15) as response:
                                    with open(output_path, 'wb') as f:
                                        f.write(response.read())
                            except Exception as http_err:
                                print(f"  HTTP download attempt failed: {http_err}")
                                
                        # 6c. Verify if the file is fully downloaded and is valid (> 50KB)
                        if os.path.exists(output_path) and os.path.getsize(output_path) > 50000:
                            print(f"Success! Image verified on disk: '{output_path}' ({os.path.getsize(output_path)} bytes)")
                            download_success = True
                            break
                        else:
                            print(f"  File not found or empty. Waiting 5 seconds before retrying...")
                            time.sleep(5)
                            
                    if not download_success:
                        print(f"Warning: Failed to download Ad {ad_num} after 5 attempts.")
                else:
                    print("Timeout: No new generated image detected for this prompt.")
                    print("Please check your Chrome browser tab directly.")

                # Wait 10 seconds before starting next prompt to let the interface cool down
                if ad_num < len(selected_prompts):
                    print("Waiting 10 seconds before starting the next generation...")
                    time.sleep(10)
            
            print("\n==============================================")
            print("All ads in the batch have been processed!")
            print(f"Images are saved in the folder: '{output_dir}'")
            print("==============================================")
            
        except Exception as e:
            print(f"\nAn error occurred during automation: {e}")

if __name__ == "__main__":
    run_automation()
