import base64
import requests
import logging
from requests.exceptions import RequestException

logger = logging.getLogger("buffer_scheduler")

class ImageUploaderError(Exception):
    """Exception raised when image upload fails."""
    pass

class ImgBBUploader:
    """ImgBB Image Uploader implementation."""
    
    API_URL = "https://api.imgbb.com/1/upload"
    
    def __init__(self, api_key: str):
        if not api_key:
            raise ImageUploaderError(
                "ImgBB API key is missing. Please sign up for a free account at "
                "https://imgbb.com/ and add IMGBB_API_KEY to your .env file."
            )
        self.api_key = api_key

    def upload(self, file_path: str) -> str:
        """Uploads a local image file to ImgBB and returns the direct public URL."""
        if not os.path.exists(file_path):
            raise ImageUploaderError(f"Local file does not exist: {file_path}")
            
        try:
            logger.info(f"Reading and base64-encoding image: {file_path}")
            with open(file_path, "rb") as f:
                img_data = base64.b64encode(f.read()).decode("utf-8")
                
            payload = {
                "key": self.api_key,
                "image": img_data
            }
            
            logger.info("Uploading image to ImgBB...")
            response = requests.post(self.API_URL, data=payload, timeout=45)
            response.raise_for_status()
            
            result = response.json()
            if not result.get("success"):
                raise ImageUploaderError(f"ImgBB reported failure: {result}")
                
            direct_url = result.get("data", {}).get("url")
            if not direct_url:
                raise ImageUploaderError("ImgBB response did not contain image direct URL.")
                
            logger.info(f"ImgBB upload successful! Direct URL: {direct_url}")
            return direct_url
            
        except RequestException as exc:
            raise ImageUploaderError(f"Network error during ImgBB upload: {exc}")
        except Exception as exc:
            raise ImageUploaderError(f"Failed to upload image to ImgBB: {exc}")

import os
