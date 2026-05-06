import cv2
import numpy as np
from mtcnn import MTCNN
import logging

logger = logging.getLogger(__name__)

class FaceDetector:
    def __init__(self):
        # We can disable TF warnings by setting os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
        self.detector = MTCNN()

    def extract_faces(self, image_np: np.ndarray):
        """
        Takes a numpy array (RGB) image, returns a list of cropped faces.
        If no face is detected, returns empty list.
        """
        try:
            results = self.detector.detect_faces(image_np)
            faces = []
            for res in results:
                x, y, width, height = res['box']
                # Add some padding
                x1 = max(0, x - int(width*0.1))
                y1 = max(0, y - int(height*0.1))
                x2 = min(image_np.shape[1], x + width + int(width*0.1))
                y2 = min(image_np.shape[0], y + height + int(height*0.1))
                
                cropped_face = image_np[y1:y2, x1:x2]
                if cropped_face.size > 0:
                    faces.append(cropped_face)
            
            return faces
        except Exception as e:
            logger.error(f"Face extraction failed: {e}")
            return []

face_detector = FaceDetector()
