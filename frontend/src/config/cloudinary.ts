import Constants from 'expo-constants';

const extra: any = (Constants?.expoConfig as any)?.extra ?? {};

export const CLOUDINARY_CLOUD_NAME = extra.CLOUDINARY_CLOUD_NAME ?? '';
export const CLOUDINARY_UPLOAD_PRESET = extra.CLOUDINARY_UPLOAD_PRESET ?? '';

export const CLOUDINARY_API_URL = CLOUDINARY_CLOUD_NAME
  ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
  : '';
