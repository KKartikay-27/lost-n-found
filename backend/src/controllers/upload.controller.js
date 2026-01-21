import crypto from 'crypto';

export const signUpload = async (req, res) => {
  try {
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!apiKey || !apiSecret || !cloudName) {
      return res.status(500).json({ message: 'Cloudinary is not configured on the server' });
    }

    const { folder } = req.body || {};
    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = { timestamp, ...(folder ? { folder } : {}) };
    const paramString = Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join('&');

    const signature = crypto
      .createHash('sha1')
      .update(paramString + apiSecret)
      .digest('hex');

    res.json({ timestamp, signature, apiKey, cloudName });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate signature', error: err.message });
  }
};
