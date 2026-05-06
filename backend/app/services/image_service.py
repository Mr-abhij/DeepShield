import numpy as np
import logging
from PIL import Image
from app.ai.model_loader import deepfake_model
from app.ai.face_detector import face_detector
from app.ai.artifact_analyzer import artifact_analyzer
from app.ai.metadata_analyzer import metadata_analyzer
from app.ai.authenticity_engine import authenticity_engine
from app.ai.explanation_engine import explanation_engine
from app.ai.heatmap_generator import heatmap_generator
from app.ai.synthetic_analyzer import synthetic_analyzer

logger = logging.getLogger(__name__)

class ImageService:
    @staticmethod
    def analyze_image(image_np: np.ndarray, file_path: str = None) -> dict:
        # Convert RGB image back to PIL for transformer model
        pil_img = Image.fromarray(image_np)
        
        # 1. Model Inference
        model_fake_prob = deepfake_model.predict(pil_img)
        
        # 2. Face Detection
        faces = face_detector.extract_faces(image_np)
        face_consistency = 100.0
        
        if len(faces) == 0:
            logger.info("No face detected, relying on global artifacts.")
            face_consistency = 70.0 # Neutral penalty
        else:
            # Analyze largest face
            largest_face = max(faces, key=lambda f: f.shape[0] * f.shape[1])
            pil_face = Image.fromarray(largest_face)
            face_fake_prob = deepfake_model.predict(pil_face)
            # Higher prob of face fake = lower consistency
            face_consistency = max(0.0, (1.0 - face_fake_prob) * 100.0)

        # 3. Artifact Analysis
        artifact_data = artifact_analyzer.analyze(image_np)
        artifact_score = artifact_data["artifact_score"]
        texture_score = artifact_data["texture_score"]
        facial_texture_score = artifact_data.get("facial_texture_score", 75.0)
        
        # 4. Synthetic Portrait Analysis (NEW)
        synthetic_data = synthetic_analyzer.analyze(image_np)
        synthetic_score = synthetic_data["synthetic_score"]
        synthetic_indicators = synthetic_data["indicators"]
        
        # 5. Metadata Analysis
        metadata_score = 100.0
        metadata_flags = []
        if file_path:
            meta_data = metadata_analyzer.analyze(file_path)
            metadata_score = meta_data["score"]
            metadata_flags = meta_data["flags"]

        # 6. Authenticity Engine (UPDATED with synthetic score)
        result = authenticity_engine.calculate(
            model_fake_prob=model_fake_prob,
            artifact_score=artifact_score,
            metadata_score=metadata_score,
            face_consistency=face_consistency,
            synthetic_score=synthetic_score
        )

        # 7. Heatmap Generation
        heatmap_url = heatmap_generator.generate(image_np, result["fake_probability"] / 100.0)

        # 8. Explanation Engine (UPDATED with synthetic indicators)
        explanation = explanation_engine.generate(
            risk_level=result["risk_level"],
            model_prob=model_fake_prob,
            artifact=artifact_score,
            metadata=metadata_score,
            face_consistency=face_consistency,
            flags=metadata_flags,
            synthetic_indicators=synthetic_indicators
        )

        return {
            "success": True,
            "authenticity_score": result["authenticity_score"],
            "fake_probability": result["fake_probability"],
            "risk_level": result["risk_level"],
            "explanation": explanation,
            "heatmap_url": heatmap_url,
            "metadata_flags": metadata_flags,
            "analysis": {
                "face_consistency": round(face_consistency, 2),
                "texture_score": round(texture_score, 2),
                "artifact_score": round(artifact_score, 2),
                "synthetic_score": round(synthetic_score, 2),
                "facial_texture_score": round(facial_texture_score, 2)
            }
        }

image_service = ImageService()
