import cv2
import numpy as np
import logging

logger = logging.getLogger(__name__)

class SyntheticPortraitAnalyzer:
    """
    Detects characteristics of modern AI-generated portraits from
    Midjourney, SDXL, Flux, DALL-E, Leonardo AI, etc.
    
    These images are often visually clean and photorealistic but have
    telltale signs of synthetic generation.
    """
    
    @staticmethod
    def analyze(image_np: np.ndarray) -> dict:
        """
        Analyzes image for synthetic portrait indicators.
        Returns a synthetic_score (0-100 where lower = more synthetic).
        """
        try:
            gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
            h, w = gray.shape
            
            synthetic_indicators = []
            score = 100.0  # Start with "real" score, deduct for synthetic indicators
            
            # 1. Ultra-smooth skin texture detection
            # AI generators often produce unnaturally smooth skin
            skin_smoothness = SyntheticPortraitAnalyzer._detect_excessive_smoothness(gray)
            if skin_smoothness < 40:
                synthetic_indicators.append("ultra-smooth skin texture")
                score -= 15
            
            # 2. Texture uniformity analysis
            # AI images often have uniform texture distribution
            texture_uniformity = SyntheticPortraitAnalyzer._detect_texture_uniformity(image_np)
            if texture_uniformity > 0.85:
                synthetic_indicators.append("excessive texture uniformity")
                score -= 12
            
            # 3. Lack of camera sensor noise
            # Real photos have natural sensor noise, AI images are often too clean
            noise_level = SyntheticPortraitAnalyzer._detect_sensor_noise(gray)
            if noise_level < 5:
                synthetic_indicators.append("unnatural lack of sensor noise")
                score -= 10
            
            # 4. Edge perfection analysis
            # AI images often have unnaturally sharp or perfect edges
            edge_perfection = SyntheticPortraitAnalyzer._detect_edge_perfection(gray)
            if edge_perfection > 0.9:
                synthetic_indicators.append("unnaturally perfect edge rendering")
                score -= 8
            
            # 5. Background smoothness
            # AI backgrounds are often unnaturally smooth or blurred
            bg_smoothness = SyntheticPortraitAnalyzer._detect_background_smoothness(gray)
            if bg_smoothness > 0.8:
                synthetic_indicators.append("artificial background smoothness")
                score -= 8
            
            # 6. Frequency domain analysis
            # AI images often have characteristic frequency patterns
            freq_anomaly = SyntheticPortraitAnalyzer._detect_frequency_anomalies(gray)
            if freq_anomaly:
                synthetic_indicators.append("synthetic frequency patterns")
                score -= 10
            
            # 7. Color saturation uniformity
            # AI portraits often have uniform color distribution
            color_uniformity = SyntheticPortraitAnalyzer._detect_color_uniformity(image_np)
            if color_uniformity > 0.75:
                synthetic_indicators.append("uniform color saturation")
                score -= 7
            
            # Clamp score
            score = max(20.0, min(100.0, score))
            
            return {
                "synthetic_score": float(score),
                "indicators": synthetic_indicators
            }
            
        except Exception as e:
            logger.error(f"Synthetic analysis failed: {e}")
            return {
                "synthetic_score": 70.0,
                "indicators": []
            }
    
    @staticmethod
    def _detect_excessive_smoothness(gray: np.ndarray) -> float:
        """Detects if image has unnaturally smooth regions (common in AI skin)"""
        # Use local variance to detect smooth regions
        kernel_size = 15
        local_var = cv2.filter2D(gray.astype(np.float32), -1, 
                                  np.ones((kernel_size, kernel_size)) / (kernel_size * kernel_size))
        
        # Calculate variance of local variance
        smoothness = np.std(local_var)
        
        # Lower smoothness = more uniform/smooth
        return min(100.0, smoothness * 2.0)
    
    @staticmethod
    def _detect_texture_uniformity(image_np: np.ndarray) -> float:
        """Measures how uniform texture is across the image"""
        # Convert to grayscale and calculate texture variance
        gray = cv2.cvtColor(image_np, cv2.COLOR_RGB2GRAY)
        
        # Use Gabor filter to detect texture patterns
        kernel = cv2.getGaborKernel((21, 21), 5, np.pi/4, np.pi/2, 0.5, 0, ktype=cv2.CV_32F)
        filtered = cv2.filter2D(gray, cv2.CV_8UC3, kernel)
        
        # Calculate uniformity (lower variance = more uniform)
        uniformity = 1.0 - (np.std(filtered) / 255.0)
        
        return uniformity
    
    @staticmethod
    def _detect_sensor_noise(gray: np.ndarray) -> float:
        """Detects natural camera sensor noise"""
        # Calculate high-frequency noise
        kernel = np.array([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]])
        high_freq = cv2.filter2D(gray.astype(np.float32), -1, kernel)
        
        noise_level = np.std(high_freq)
        
        return noise_level
    
    @staticmethod
    def _detect_edge_perfection(gray: np.ndarray) -> float:
        """Detects unnaturally perfect edges"""
        edges = cv2.Canny(gray, 50, 150)
        
        # Calculate edge strength distribution
        edge_strength = np.mean(edges) / 255.0
        
        # Very high edge strength with low variation suggests artificial perfection
        edge_variance = np.std(edges) / 255.0
        
        perfection_score = edge_strength if edge_variance < 0.2 else edge_strength * 0.5
        
        return perfection_score
    
    @staticmethod
    def _detect_background_smoothness(gray: np.ndarray) -> float:
        """Detects unnaturally smooth backgrounds"""
        h, w = gray.shape
        
        # Sample edges (assuming portrait has subject in center)
        edge_regions = [
            gray[0:int(h*0.2), :],  # Top
            gray[int(h*0.8):, :],   # Bottom
            gray[:, 0:int(w*0.2)],  # Left
            gray[:, int(w*0.8):]    # Right
        ]
        
        smoothness_scores = []
        for region in edge_regions:
            if region.size > 0:
                local_var = cv2.Laplacian(region, cv2.CV_64F).var()
                smoothness_scores.append(local_var)
        
        if smoothness_scores:
            avg_smoothness = np.mean(smoothness_scores)
            # Normalize to 0-1 range (lower = smoother)
            normalized = 1.0 - min(1.0, avg_smoothness / 500.0)
            return normalized
        
        return 0.5
    
    @staticmethod
    def _detect_frequency_anomalies(gray: np.ndarray) -> bool:
        """Detects characteristic frequency patterns in AI images"""
        # Apply FFT
        f = np.fft.fft2(gray)
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)
        
        # Check for unusual frequency distribution
        # AI images often have specific frequency roll-off patterns
        center_region = magnitude_spectrum[magnitude_spectrum.shape[0]//2-10:magnitude_spectrum.shape[0]//2+10,
                                            magnitude_spectrum.shape[1]//2-10:magnitude_spectrum.shape[1]//2+10]
        
        if center_region.size > 0:
            center_energy = np.mean(center_region)
            total_energy = np.mean(magnitude_spectrum)
            
            # Unusual center-to-total ratio indicates synthetic generation
            ratio = center_energy / total_energy if total_energy > 0 else 0
            return ratio > 0.8 or ratio < 0.1
        
        return False
    
    @staticmethod
    def _detect_color_uniformity(image_np: np.ndarray) -> float:
        """Detects uniform color saturation common in AI portraits"""
        # Convert to HSV
        hsv = cv2.cvtColor(image_np, cv2.COLOR_RGB2HSV)
        
        # Analyze saturation channel
        saturation = hsv[:, :, 1]
        
        # Calculate uniformity of saturation
        sat_std = np.std(saturation) / 255.0
        uniformity = 1.0 - sat_std
        
        return uniformity

synthetic_analyzer = SyntheticPortraitAnalyzer()
