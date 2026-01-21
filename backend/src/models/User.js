import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true, trim: true },
  passwordHash: String,
  phone: String,
}, { timestamps: true });

export default mongoose.model('User', userSchema);
