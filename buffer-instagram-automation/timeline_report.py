import csv
import logging
from pathlib import Path
from datetime import datetime

logger = logging.getLogger("buffer_scheduler")

def generate_csv_report(timeline_data: list, output_path: Path):
    """Generates a CSV report of the posting timeline."""
    try:
        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "Ad Number", "Image File", "Scheduled Date", "Scheduled Time", 
                "Caption Preview", "Hashtag Count", "Status", "Buffer Post ID", "Last Error"
            ])
            for item in timeline_data:
                writer.writerow([
                    item["ad_number"],
                    item["filename"],
                    item["date"],
                    item["time"],
                    item["caption_preview"],
                    item["hashtag_count"],
                    item["status"],
                    item["buffer_post_id"] or "",
                    item["last_error"] or ""
                ])
        logger.info(f"CSV timeline report written to: {output_path}")
    except Exception as e:
        logger.error(f"Failed to generate CSV timeline report: {e}")

def generate_html_report(timeline_data: list, output_path: Path, timezone_name: str):
    """Generates a beautiful HTML report of the posting timeline."""
    try:
        rows_html = ""
        for item in timeline_data:
            # Determine status badge class
            status = item["status"].lower()
            badge_class = "status-pending"
            if status in ["scheduled", "published"]:
                badge_class = "status-success"
            elif status == "failed":
                badge_class = "status-failed"
            elif status == "waiting_for_queue_space":
                badge_class = "status-waiting"
            elif status == "skipped":
                badge_class = "status-skipped"
                
            # Thumbnail image - use ImgBB url if available, otherwise default fallback
            img_src = item["public_url"] if item["public_url"] else ""
            img_html = f'<img src="{img_src}" class="thumbnail" alt="Ad {item["ad_number"]}">' if img_src else '<div class="no-thumb">No Image</div>'
            
            # Error display
            err_html = f'<div class="error-msg">{item["last_error"]}</div>' if item["last_error"] else ""
            post_id_html = f'<code class="post-id">{item["buffer_post_id"]}</code>' if item["buffer_post_id"] else '<span class="none">-</span>'

            rows_html += f"""
            <tr>
                <td class="text-center font-bold">{item["ad_number"]}</td>
                <td>
                    <div class="thumb-container">
                        {img_html}
                        <span class="filename">{item["filename"]}</span>
                    </div>
                </td>
                <td class="text-nowrap">{item["date"]}</td>
                <td class="text-nowrap">{item["time"]}</td>
                <td>
                    <div class="caption-preview" title="{item["caption"]}">{item["caption_preview"]}</div>
                </td>
                <td class="text-center">{item["hashtag_count"]}</td>
                <td><span class="badge {badge_class}">{item["status"]}</span></td>
                <td class="text-center">{post_id_html}</td>
                <td>{err_html}</td>
            </tr>
            """

        html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AstroAI4U Instagram Posting Timeline</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {{
            --bg-color: #0b0c10;
            --card-bg: #1f2833;
            --text-color: #c5c6c7;
            --text-bright: #ffffff;
            --primary: #4f46e5;
            --secondary: #66fcf1;
            --success: #10b981;
            --failed: #ef4444;
            --waiting: #f59e0b;
            --skipped: #6b7280;
            --border-color: #2c3540;
        }}
        
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}
        
        body {{
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            padding: 2rem;
            line-height: 1.5;
        }}
        
        header {{
            max-width: 1200px;
            margin: 0 auto 2rem auto;
            border-bottom: 1px solid var(--border-color);
            padding-bottom: 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }}
        
        h1 {{
            color: var(--text-bright);
            font-size: 2.2rem;
            font-weight: 700;
            background: linear-gradient(90deg, #66fcf1, #4f46e5);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .meta-info {{
            font-size: 0.9rem;
            color: #8b9bb4;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: var(--card-bg);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            overflow: hidden;
            border: 1px solid var(--border-color);
        }}
        
        table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.95rem;
        }}
        
        th {{
            background-color: rgba(79, 70, 229, 0.1);
            color: var(--secondary);
            font-weight: 600;
            padding: 1rem;
            border-bottom: 2px solid var(--border-color);
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.05em;
        }}
        
        td {{
            padding: 1rem;
            border-bottom: 1px solid var(--border-color);
            vertical-align: middle;
        }}
        
        tr:hover td {{
            background-color: rgba(255, 255, 255, 0.02);
        }}
        
        .thumb-container {{
            display: flex;
            align-items: center;
            gap: 0.8rem;
        }}
        
        .thumbnail {{
            width: 50px;
            height: 50px;
            object-fit: cover;
            border-radius: 6px;
            border: 1px solid var(--border-color);
            background: #000;
        }}
        
        .no-thumb {{
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #111;
            font-size: 0.7rem;
            border-radius: 6px;
            color: #555;
            border: 1px solid var(--border-color);
        }}
        
        .filename {{
            font-size: 0.85rem;
            color: #8b9bb4;
        }}
        
        .caption-preview {{
            max-width: 250px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: help;
        }}
        
        .badge {{
            display: inline-block;
            padding: 0.25rem 0.6rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }}
        
        .status-success {{ background-color: rgba(16, 185, 129, 0.15); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.3); }}
        .status-failed {{ background-color: rgba(239, 68, 68, 0.15); color: var(--failed); border: 1px solid rgba(239, 68, 68, 0.3); }}
        .status-waiting {{ background-color: rgba(245, 158, 11, 0.15); color: var(--waiting); border: 1px solid rgba(245, 158, 11, 0.3); }}
        .status-skipped {{ background-color: rgba(107, 114, 128, 0.15); color: var(--skipped); border: 1px solid rgba(107, 114, 128, 0.3); }}
        .status-pending {{ background-color: rgba(79, 70, 229, 0.15); color: var(--text-color); border: 1px solid rgba(79, 70, 229, 0.3); }}
        
        .post-id {{
            font-family: monospace;
            background: #111;
            padding: 0.1rem 0.3rem;
            border-radius: 4px;
            color: var(--secondary);
            font-size: 0.85rem;
        }}
        
        .error-msg {{
            color: var(--failed);
            font-size: 0.85rem;
            max-width: 200px;
            word-wrap: break-word;
        }}
        
        .text-center {{ text-align: center; }}
        .text-nowrap {{ white-space: nowrap; }}
        .font-bold {{ font-weight: 600; }}
        .none {{ color: #555; }}
    </style>
</head>
<body>
    <header>
        <div>
            <h1>AstroAI4U Instagram Posting Timeline</h1>
            <div class="meta-info">Timezone: {timezone_name} | Generated: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</div>
        </div>
    </header>
    <main class="container">
        <table>
            <thead>
                <tr>
                    <th class="text-center" style="width: 60px;">Ad</th>
                    <th>Image</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Caption Preview</th>
                    <th class="text-center" style="width: 90px;">Hashtags</th>
                    <th>Status</th>
                    <th class="text-center">Buffer Post ID</th>
                    <th>Notes/Errors</th>
                </tr>
            </thead>
            <tbody>
                {rows_html}
            </tbody>
        </table>
    </main>
</body>
</html>
"""
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        logger.info(f"HTML timeline report written to: {output_path}")
    except Exception as e:
        logger.error(f"Failed to generate HTML timeline report: {e}")
