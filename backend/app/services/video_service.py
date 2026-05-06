import cv2
import numpy as np
import ffmpeg
import logging
from app.config.settings import settings
from app.services.image_service import image_service

logger = logging.getLogger(__name__)

class VideoService:
    @staticmethod
    def analyze_video(file_path: str) -> dict:
        """
        Extract frames (1 FPS) using OpenCV up to MAX_VIDEO_FRAMES.
        Aggregates frame scores into a single video score.
        """
        try:
            probe = ffmpeg.probe(file_path)
            video_info = next(s for s in probe['streams'] if s['codec_type'] == 'video')
            width = int(video_info['width'])
            height = int(video_info['height'])
            
            # evaluate fps (e.g., '30000/1001')
            fps_str = video_info.get('r_frame_rate', '25/1')
            if '/' in fps_str:
                num, den = fps_str.split('/')
                fps = float(num) / float(den)
            else:
                fps = float(fps_str)
                
            if fps == 0 or np.isnan(fps):
                fps = 25.0

            frames_to_process = []
            
            # Output 1 frame per second using ffmpeg fps filter
            out, _ = (
                ffmpeg
                .input(file_path)
                .filter('fps', fps=1, round='up')
                .output('pipe:', format='rawvideo', pix_fmt='rgb24')
                .run(capture_stdout=True, capture_stderr=True)
            )
            
            frame_size = width * height * 3
            for i in range(0, len(out), frame_size):
                if len(frames_to_process) >= settings.MAX_VIDEO_FRAMES:
                    break
                frame_bytes = out[i:i+frame_size]
                if len(frame_bytes) != frame_size:
                    break
                frame_np = np.frombuffer(frame_bytes, np.uint8).reshape((height, width, 3))
                frames_to_process.append(frame_np)

            if not frames_to_process:
                raise Exception("No frames could be extracted from video")

            # Analyze each frame
            frame_results = []
            for img_np in frames_to_process:
                # pass None for file_path to skip metadata analysis per frame
                res = image_service.analyze_image(img_np, file_path=None) 
                frame_results.append(res)

            # Aggregate results
            avg_authenticity = sum(r["authenticity_score"] for r in frame_results) / len(frame_results)
            avg_fake_prob = sum(r["fake_probability"] for r in frame_results) / len(frame_results)
            
            avg_face = sum(r["analysis"]["face_consistency"] for r in frame_results) / len(frame_results)
            avg_texture = sum(r["analysis"]["texture_score"] for r in frame_results) / len(frame_results)
            avg_artifact = sum(r["analysis"]["artifact_score"] for r in frame_results) / len(frame_results)

            if avg_authenticity < 40.0:
                risk_level = "High"
            elif avg_authenticity < 75.0:
                risk_level = "Medium"
            else:
                risk_level = "Low"

            # Combine explanations (simplify)
            explanation = f"Video analysis evaluated {len(frames_to_process)} key frames. "
            if risk_level == "High":
                explanation += "Consistent deepfake artifacts and facial anomalies detected across multiple frames."
            elif risk_level == "Medium":
                explanation += "Some frames showed suspicious compression or texture blending, suggesting potential manipulation."
            else:
                explanation += "The video maintains high temporal consistency and natural textures across frames."

            # Use heatmap of the frame with the lowest authenticity
            worst_frame_res = min(frame_results, key=lambda x: x["authenticity_score"])
            
            return {
                "success": True,
                "authenticity_score": round(avg_authenticity, 2),
                "fake_probability": round(avg_fake_prob, 2),
                "risk_level": risk_level,
                "explanation": explanation,
                "heatmap_url": worst_frame_res["heatmap_url"],
                "metadata_flags": [],
                "analysis": {
                    "face_consistency": round(avg_face, 2),
                    "texture_score": round(avg_texture, 2),
                    "artifact_score": round(avg_artifact, 2)
                }
            }

        except Exception as e:
            logger.error(f"Video analysis failed: {e}")
            raise e

video_service = VideoService()
