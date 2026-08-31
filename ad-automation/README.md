# Astro-AI Ad Generator & Instagram Push Automation

This module contains automation scripts designed to generate marketing and advertisement images using Google Gemini.

## Setup Requirements

Before running the scripts, install the required Python packages in your terminal:

```bash
pip install google-generativeai playwright
```

---

## Method A: Official Gemini API (Recommended & Fast)

This method directly connects to Google's backend API (Imagen 3 model) to generate the image and save it immediately. It is fast, silent, and does not require opening any browser tabs.

### 1. Set your Gemini API Key
Obtain an API key from Google AI Studio, and set it as an environment variable in your terminal:

* **Windows Command Prompt:**
  ```cmd
  set GEMINI_API_KEY="your-api-key-here"
  ```
* **Windows PowerShell:**
  ```powershell
  $env:GEMINI_API_KEY="your-api-key-here"
  ```

### 2. Run the Script
```bash
python generate_api.py
```
This will ask you for a prompt, connect to the API, generate a high-quality square image, and download it as `gemini_api_ad.png` in the current folder.

---

## Method B: Browser RPA (Chrome Automation)

This method controls your actual open Chrome browser. By using your active session, it bypasses any login prompts, 2FA, or bot-blocking measures on Gemini Web.

### 1. Close all active Chrome windows completely.
This is required so Chrome can be restarted with the debugging port unlocked.

### 2. Start Chrome in Debugging Mode
Open Windows Run (`Win + R`) or a terminal, and run the following command to start Chrome on port `9222`:

```powershell
chrome.exe --remote-debugging-port=9222 --user-data-dir="C:\ChromeDebug"
```

### 3. Open Gemini and Log In
In the newly opened Chrome browser window, navigate to `https://gemini.google.com` and log in to your Google Account (if not already logged in).

### 4. Run the Automation Script
Open your terminal in this folder and run:
```bash
python automate_chrome.py
```
The script will hook into your open Chrome browser, navigate to Gemini, enter your prompt, wait for the image, and automatically download the generated output as `gemini_chrome_ad.png`.
