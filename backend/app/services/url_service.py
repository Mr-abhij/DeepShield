import os
import uuid
import aiohttp
import cv2
import numpy as np
from app.config.settings import settings
from app.services.image_service import image_service

class UrlService:
    @staticmethod
    async def analyze_url(url: str) -> dict:
        filename = f"url_{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(settings.TEMP_FRAMES_DIR, filename)
        
        try:
            # Download image with headers to avoid blocking
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=15, headers=headers, ssl=False) as response:
                    if response.status != 200:
                        raise Exception(f"Failed to download image from URL (status: {response.status})")
                    content = await response.read()
                    
            with open(filepath, 'wb') as f:
                f.write(content)

            # Read with OpenCV
            img = cv2.imread(filepath)
            if img is None:
                raise Exception("Downloaded file is not a valid image")

            # Convert BGR to RGB
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Analyze
            result = image_service.analyze_image(img_rgb, filepath)
            return result
            
        finally:
            # Cleanup temp file
            if os.path.exists(filepath):
                os.remove(filepath)

url_service = UrlService()
