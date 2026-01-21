import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  type: { type: String, enum: ['lost', 'found'] },
  location: String,
  imageUrl: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isResolved: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
