import os
import logging
from PIL import Image

logger = logging.getLogger("buffer_scheduler")

class ImageValidationError(Exception):
    """Exception raised when image validation fails."""
    pass

def validate_image(file_path: str) -> dict:
    """
    Validates a local image file for compatibility with Buffer and Instagram.
    Returns metadata dict if valid, raises ImageValidationError if not.
    """
    if not os.path.exists(file_path):
        raise ImageValidationError(f"File does not exist: {file_path}")
        
    file_size = os.path.getsize(file_path)
    if file_size == 0:
        raise ImageValidationError(f"File is empty: {file_path}")
        
    # Check max file size (Instagram allows max 8MB via API)
    max_size_bytes = 8 * 1024 * 1024
    if file_size > max_size_bytes:
        raise ImageValidationError(f"File size ({file_size / (1024*1024):.2f}MB) exceeds Instagram's 8MB limit.")

    try:
        with Image.open(file_path) as img:
            img.verify()  # Verifies image is not corrupted
    except Exception as exc:
        raise ImageValidationError(f"Image is corrupted or unreadable: {exc}")

    # Open image to inspect dimensions
    try:
        with Image.open(file_path) as img:
            width, height = img.size
            img_format = img.format.upper() if img.format else "UNKNOWN"
    except Exception as exc:
        raise ImageValidationError(f"Failed to read image properties: {exc}")

    # Check format compatibility
    supported_formats = ["PNG", "JPEG", "JPG", "WEBP"]
    if img_format not in supported_formats:
        # Check by extension if format detection failed
        ext = os.path.splitext(file_path)[1].upper().replace(".", "")
        if ext not in supported_formats:
            raise ImageValidationError(f"Unsupported image format: {img_format} (Supported: {supported_formats})")
        img_format = ext

    # Check aspect ratio
    aspect_ratio = width / height
    
    # Instagram direct auto-publish requirements:
    # Aspect ratio must be between 4:5 (0.80) and 1.91:1 (1.91)
    min_ratio = 0.80
    max_ratio = 1.91
    
    requires_notification = False
    warning_msg = None
    
    if aspect_ratio < min_ratio or aspect_ratio > max_ratio:
        requires_notification = True
        warning_msg = (
            f"Aspect ratio ({aspect_ratio:.2f}) is outside the 4:5 (0.80) to 1.91:1 (1.91) range. "
            f"This ad ({width}x{height}) will require notification-based publishing (manual post via Buffer app notification) "
            f"instead of automatic direct publishing."
        )
        logger.warning(warning_msg)

    return {
        "width": width,
        "height": height,
        "format": img_format,
        "file_size": file_size,
        "aspect_ratio": aspect_ratio,
        "requires_notification": requires_notification,
        "warning": warning_msg
    }
