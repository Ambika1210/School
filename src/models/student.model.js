import mongoose from 'mongoose';
import { MALE, FEMALE, OTHER } from '../constants/enums.js';

const studentSchema = new mongoose.Schema(
  {
    // Reference to User model for authentication
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
    },
    // Student-specific fields
    admissionNumber: {
      type: String,
      required: true,
      trim: true,
    },
    rollNumber: {
      type: String,
      required: false,
      trim: true,
    },
    currentClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstituteClass',
      required: false,
    },
    // Parent references
    parentIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    // Additional student information
    admissionDate: {
      type: Date,
      required: false,
    },
    bloodGroup: {
      type: String,
      required: false,
      trim: true,
    },
    aadharNumber: {
      type: String,
      required: false,
      trim: true,
    },
    // Emergency contact
    emergencyContactName: {
      type: String,
      required: false,
      trim: true,
    },
    emergencyContactPhone: {
      type: String,
      required: false,
      trim: true,
    },
    emergencyContactRelation: {
      type: String,
      required: false,
      trim: true,
    },
    // Status fields
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
studentSchema.index({ instituteId: 1, admissionNumber: 1 }, { unique: true });
studentSchema.index({ instituteId: 1, rollNumber: 1 }, { sparse: true });
studentSchema.index({ userId: 1 }, { unique: true });
studentSchema.index({ instituteId: 1, currentClassId: 1 });
studentSchema.index({ instituteId: 1, isActive: 1, isDeleted: 1 });

export default mongoose.model('Student', studentSchema);

