import torch
from transformers import pipeline, AutoImageProcessor, AutoModelForImageClassification
import logging
from app.config.settings import settings

logger = logging.getLogger(__name__)

class DeepfakeModelLoader:
    def __init__(self):
        self.device = "cpu"
        self.pipe = None
        self.load_model()

    def load_model(self):
        try:
            logger.info(f"Loading model {settings.MODEL_NAME} onto {self.device}...")
            # Use AutoImageProcessor to ensure preprocessing is exact
            processor = AutoImageProcessor.from_pretrained(settings.MODEL_NAME)
            model = AutoModelForImageClassification.from_pretrained(settings.MODEL_NAME)
            self.pipe = pipeline("image-classification", model=model, image_processor=processor, device=self.device)
            logger.info("Model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.pipe = None

    def predict(self, image):
        """
        Runs the image through the pipeline. Returns a probability of being fake.
        Returns float between 0.0 and 1.0
        """
        if not self.pipe:
            logger.warning("Pipeline is not loaded. Returning fallback 0.5")
            return 0.5
            
        try:
            # result is a list of dicts, e.g., [{'label': 'FAKE', 'score': 0.9}, {'label': 'REAL', 'score': 0.1}]
            results = self.pipe(image)
            
            fake_score = 0.0
            for r in results:
                label = r['label'].upper()
                if 'FAKE' in label or 'SPOOF' in label or 'MANIPULATED' in label:
                    fake_score = max(fake_score, r['score'])
                elif 'REAL' in label or 'GENUINE' in label or 'ORIGINAL' in label:
                    # if we only see real, fake is 1 - real
                    fake_score = max(fake_score, 1.0 - r['score'])
                    
            # If the model uses a generic LABEL_0/LABEL_1, we assume LABEL_1 is FAKE or check specifics
            # For `prithivMLmods/Deep-Fake-Detector-Model`, FAKE/REAL labels are standard.
            # If no FAKE found directly, default fallback is the first label score if it's the only one
            if fake_score == 0.0 and results:
                # If we couldn't parse the label, default to 50%
                fake_score = 0.5
                
            return float(fake_score)
        except Exception as e:
            logger.error(f"Inference error: {e}")
            return 0.5

# Global singleton
deepfake_model = DeepfakeModelLoader()
