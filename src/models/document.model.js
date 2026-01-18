import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: false, // Optional as requested
    },
    mimeType: {
      type: String,
      required: false,
    },
    size: {
      type: Number,
      required: false,
    },
    path: {
      type: String, // URL or File Path
      required: true, 
    },
    bucket: {
      type: String, // 'local', 's3', etc.
      default: 'local',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Document', documentSchema);
