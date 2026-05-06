import cv2
import numpy as np
import os
import uuid
from app.config.settings import settings

class HeatmapGenerator:
    @staticmethod
    def generate(image_np: np.ndarray, fake_prob: float) -> str:
        """
        Generates a heatmap approximation for visualization.
        Saves it to static/heatmaps and returns the filename.
        """
        try:
            # If high fake prob, generate a red-ish heatmap on edges
            # Otherwise, a green-ish safe map
            
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
            # Find edges
            edges = cv2.Canny(gray, 100, 200)
            
            # Dilate edges to make them thicker
            kernel = np.ones((5,5), np.uint8)
            edges_dilated = cv2.dilate(edges, kernel, iterations=2)
            
            # Create colored heatmap overlay
            heatmap = np.zeros_like(image_np)
            if fake_prob > 0.5:
                # Red overlay on edges
                heatmap[:,:,0] = edges_dilated # Red channel
            else:
                # Green overlay on edges
                heatmap[:,:,1] = edges_dilated # Green channel
                
            # Blur the heatmap for a glow effect
            heatmap = cv2.GaussianBlur(heatmap, (21, 21), 0)
            
            # Blend
            blended = cv2.addWeighted(image_np, 0.7, heatmap, 0.5, 0)
            
            # Convert back to BGR for saving
            blended_bgr = cv2.cvtColor(blended, cv2.COLOR_RGB2BGR)
            
            filename = f"heatmap_{uuid.uuid4().hex}.jpg"
            filepath = os.path.join(settings.HEATMAPS_DIR, filename)
            
            cv2.imwrite(filepath, blended_bgr)
            
            return f"/static/heatmaps/{filename}"
            
        except Exception as e:
            return ""

heatmap_generator = HeatmapGenerator()
