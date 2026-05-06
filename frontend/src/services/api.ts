import axios, { AxiosError } from 'axios';

// ── Config ────────────────────────────────────────────────────────────────────
// Use relative path for Vite proxy in development, or full URL for production
const API_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api');

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 120_000, // 2 min — allow slow video analysis
});

// ── Types ─────────────────────────────────────────────────────────────────────
export interface AnalysisResult {
  success: boolean;
  authenticity_score: number;
  fake_probability: number;
  risk_level: 'Low' | 'Medium' | 'High';
  explanation: string;
  heatmap_url: string | null;
  metadata_flags: string[];
  analysis: {
    face_consistency: number;
    texture_score: number;
    artifact_score: number;
  };
}

export interface HistoryRecord {
  id: number;
  filename: string;
  media_type: string;
  authenticity_score: number;
  fake_probability: number;
  risk_level: string;
  explanation: string;
  created_at: string;
}

// ── Error normalizer ──────────────────────────────────────────────────────────
function normalizeError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const ae = err as AxiosError<{ detail?: string }>;
    if (ae.code === 'ECONNREFUSED' || ae.code === 'ERR_NETWORK') {
      return 'Cannot reach backend. Make sure the server is running on port 8000.';
    }
    if (ae.code === 'ECONNABORTED') {
      return 'Request timed out. The analysis took too long — try a smaller file.';
    }
    const detail = ae.response?.data?.detail;
    if (detail) return typeof detail === 'string' ? detail : JSON.stringify(detail);
    if (ae.response?.status === 413) return 'File is too large for upload.';
    if (ae.response?.status === 400) return 'Invalid input. Check your file or URL.';
    if (ae.response?.status === 500) return 'Backend error during analysis. Check server logs.';
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}

// ── Retry helper (1 retry for 5xx) ────────────────────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (
      retries > 0 &&
      axios.isAxiosError(err) &&
      err.response &&
      err.response.status >= 500
    ) {
      await new Promise(r => setTimeout(r, 800));
      return withRetry(fn, retries - 1);
    }
    throw err;
  }
}

// ── API calls ─────────────────────────────────────────────────────────────────

/**
 * Analyze an image or video file. Reports upload progress via onProgress callback.
 */
export const analyzeMedia = async (
  file: File,
  onProgress?: (pct: number) => void
): Promise<AnalysisResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const endpoint = file.type.startsWith('video/') ? '/analyze-video' : '/analyze-image';

  try {
    const response = await withRetry(() =>
      apiClient.post<AnalysisResult>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      })
    );
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err));
  }
};

/**
 * Scan a public image URL.
 */
export const scanUrl = async (url: string): Promise<AnalysisResult> => {
  try {
    const response = await withRetry(() =>
      apiClient.post<AnalysisResult>('/scan-url', { image_url: url })
    );
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err));
  }
};

/**
 * Fetch paginated scan history from the DB.
 */
export const getScanHistory = async (limit = 100): Promise<HistoryRecord[]> => {
  try {
    const response = await apiClient.get<HistoryRecord[]>('/history', {
      params: { limit },
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.warn('History fetch failed:', normalizeError(err));
    return [];
  }
};

/**
 * Delete a single history record by ID.
 */
export const deleteHistoryRecord = async (id: number): Promise<void> => {
  await apiClient.delete(`/history/${id}`);
};

/**
 * Send a single webcam frame for live deepfake analysis.
 */
export const scanWebcamFrame = async (imageSrc: string): Promise<AnalysisResult> => {
  const res = await fetch(imageSrc);
  const blob = await res.blob();
  const file = new File([blob], 'webcam_frame.jpg', { type: 'image/jpeg' });

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post<AnalysisResult>('/webcam-scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 8_000, // Short timeout for real-time
    });
    return response.data;
  } catch (err) {
    throw new Error(normalizeError(err));
  }
};

/**
 * Health check to verify backend is reachable.
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    await apiClient.get('/health', { timeout: 3_000 });
    return true;
  } catch {
    return false;
  }
};
