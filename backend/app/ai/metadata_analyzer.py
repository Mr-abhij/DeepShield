import piexif
from PIL import Image
import logging

logger = logging.getLogger(__name__)

class MetadataAnalyzer:
    @staticmethod
    def analyze(image_path: str) -> dict:
        """
        Analyzes image metadata.
        Returns score 0-100 (100 = highly authentic/original, 0 = tampered/stripped)
        """
        flags = []
        score = 100.0
        
        try:
            img = Image.open(image_path)
            if 'exif' not in img.info:
                flags.append("Missing EXIF data (Possible social media download or stripped)")
                score -= 30.0
                return {"score": max(0.0, score), "flags": flags}

            exif_dict = piexif.load(img.info['exif'])
            
            # Check software tag (0x0131 is Software in 0th IFD)
            if piexif.ImageIFD.Software in exif_dict["0th"]:
                software = exif_dict["0th"][piexif.ImageIFD.Software].decode('utf-8', errors='ignore').lower()
                suspicious_software = ['photoshop', 'gimp', 'lightroom', 'canva', 'midjourney', 'dall-e', 'stable diffusion']
                
                for susp in suspicious_software:
                    if susp in software:
                        flags.append(f"Manipulated with {susp.title()}")
                        score -= 50.0
                        break
            else:
                flags.append("No camera software signature found")
                score -= 10.0

            return {"score": max(0.0, score), "flags": flags}

        except Exception as e:
            logger.error(f"Metadata analysis error: {e}")
            return {"score": 70.0, "flags": ["Unable to fully parse metadata"]}

metadata_analyzer = MetadataAnalyzer()
