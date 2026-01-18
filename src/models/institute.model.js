import mongoose from 'mongoose';

const instituteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    maxAllowerUser: {
      type: String,
      required:false,
      default: 10
    },
    address: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    logoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
      required: false, // "require true nhi krna hai"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    settings: {
      type: Map,
      of: String, // Or Mixed if complex settings needed
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

instituteSchema.index({ code: 1 }, { unique: true });
instituteSchema.index({ ownerId: 1 });
instituteSchema.index({ isActive: 1, isDeleted: 1 });

export default mongoose.model('Institute', instituteSchema);
