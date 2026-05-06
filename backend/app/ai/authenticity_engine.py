class AuthenticityEngine:
    @staticmethod
    def calculate(model_fake_prob: float, artifact_score: float, metadata_score: float, face_consistency: float, synthetic_score: float = 50.0) -> dict:
        """
        model_fake_prob: 0.0 to 1.0 (higher = more fake)
        artifact_score: 0.0 to 100.0 (higher = more real)
        metadata_score: 0.0 to 100.0 (higher = more real)
        face_consistency: 0.0 to 100.0 (higher = more real)
        synthetic_score: 0.0 to 100.0 (lower = more synthetic/AI-generated)
        """
        # Convert model probability to a "realness" score (0-100)
        model_real_score = (1.0 - model_fake_prob) * 100.0

        # Updated weights to prioritize AI model confidence for modern synthetic portrait detection
        # Model confidence is now 70% of the score to catch realistic AI-generated images
        final_score = (
            model_real_score * 0.70 +
            artifact_score * 0.15 +
            synthetic_score * 0.05 +
            metadata_score * 0.05 +
            face_consistency * 0.05
        )

        final_score = max(0.0, min(100.0, final_score))
        fake_probability = 100.0 - final_score

        # Adjusted thresholds for modern AI detection
        if final_score < 45.0:
            risk_level = "High"
        elif final_score < 70.0:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return {
            "authenticity_score": round(final_score, 2),
            "fake_probability": round(fake_probability, 2),
            "risk_level": risk_level
        }

authenticity_engine = AuthenticityEngine()
