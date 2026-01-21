import api from '../api/axios';
import { CLOUDINARY_API_URL, CLOUDINARY_UPLOAD_PRESET } from '../config/cloudinary';

export async function uploadImageToCloudinary(uri: string): Promise<string> {
  if (!CLOUDINARY_API_URL || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured');
  }
  const formData = new FormData();
  // React Native FormData typed as any for file field
  (formData as any).append('file', {
    uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  const res = await fetch(CLOUDINARY_API_URL, {
    method: 'POST',
    body: formData as any,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to upload image');
  }
  const data = await res.json();
  return data.secure_url as string;
}

export async function uploadImageToCloudinarySigned(uri: string, folder?: string): Promise<string> {
  // Get signature and parameters from backend (requires auth)
  const signRes = await api.post('/upload/sign', { folder });
  const { timestamp, signature, apiKey, cloudName } = signRes.data;
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  (formData as any).append('file', {
    uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('api_key', apiKey);
  if (folder) formData.append('folder', folder);

  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: formData as any,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to upload image');
  }
  const data = await res.json();
  return data.secure_url as string;
}
