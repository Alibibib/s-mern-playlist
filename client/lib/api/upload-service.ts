import { useAuthStore } from '@/lib/store/auth-store';

const API_URL = 'http://localhost:4000/api';

export interface UploadProgressCallback {
    (progress: number): void;
}

export interface UploadResponse {
    success: boolean;
    fileId: string;
    filename: string;
    size: number;
    message: string;
}

export const uploadService = {
    async uploadSong(
        file: File,
        metadata: { title: string; artist: string; duration: string },
        onProgress?: UploadProgressCallback
    ): Promise<UploadResponse> {
        const token = useAuthStore.getState().token;
        if (!token) {
            throw new Error('No authentication token found');
        }

        const formData = new FormData();
        formData.append('audio', file);
        formData.append('title', metadata.title);
        formData.append('artist', metadata.artist);
        formData.append('duration', metadata.duration);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${API_URL}/upload/upload`, true);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);

            if (onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        onProgress(percentComplete);
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (e) {
                        reject(new Error('Invalid JSON response from server'));
                    }
                } else {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        reject(new Error(errorResponse.message || 'Upload failed'));
                    } catch (e) {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                }
            };

            xhr.onerror = () => {
                reject(new Error('Network error during upload'));
            };

            xhr.send(formData);
        });
    },
};
