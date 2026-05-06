class ExplanationEngine:
    @staticmethod
    def generate(risk_level: str, model_prob: float, artifact: float, metadata: float, face_consistency: float, flags: list, synthetic_indicators: list = None) -> str:
        explanation = []
        
        if risk_level == "High":
            explanation.append("AI detected significant inconsistencies indicating manipulation or synthetic generation.")
        elif risk_level == "Medium":
            explanation.append("AI detected some unusual patterns requiring careful review.")
        else:
            explanation.append("The media appears largely authentic.")

        # Prioritize model confidence for modern AI detection
        if model_prob > 0.6:
            explanation.append("The deep neural network identified structural artifacts commonly found in synthetic media or deepfakes.")
        elif model_prob > 0.4:
            explanation.append("The deep neural network detected patterns consistent with AI-generated imagery.")
            
        # Synthetic portrait indicators
        if synthetic_indicators and len(synthetic_indicators) > 0:
            if "ultra-smooth skin texture" in synthetic_indicators:
                explanation.append("Facial texture appears synthetically uniform, characteristic of AI portrait generation.")
            if "excessive texture uniformity" in synthetic_indicators:
                explanation.append("Texture distribution is unnaturally uniform across the image.")
            if "unnatural lack of sensor noise" in synthetic_indicators:
                explanation.append("Image lacks natural camera sensor noise, suggesting synthetic origin.")
            if "unnaturally perfect edge rendering" in synthetic_indicators:
                explanation.append("Edge rendering appears artificially perfect, indicative of AI generation.")
            if "artificial background smoothness" in synthetic_indicators:
                explanation.append("Background exhibits artificial smoothness typical of AI-generated portraits.")
            if "synthetic frequency patterns" in synthetic_indicators:
                explanation.append("Frequency domain analysis reveals synthetic generation patterns.")
            if "uniform color saturation" in synthetic_indicators:
                explanation.append("Color saturation is unnaturally uniform, a common trait of AI portraits.")
            
        if face_consistency < 60:
            explanation.append("Inconsistencies were found in facial regions, often a sign of face-swapping or GAN generation.")
            
        if artifact < 60:
            explanation.append("Error Level Analysis indicates abnormal compression patterns or blending artifacts.")
            
        if metadata < 80:
            explanation.append("Metadata anomalies were detected.")
            if flags:
                explanation.append(f"Specifically: {', '.join(flags)}.")

        if not explanation[1:]:
            explanation.append("No significant traces of digital manipulation, GAN artifacts, or deepfake footprints were detected.")

        return " ".join(explanation)

explanation_engine = ExplanationEngine()
