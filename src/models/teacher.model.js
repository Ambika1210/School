import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema(
  {
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
    designation: {
      type: String,
      trim: true,
      default: 'Assistant Teacher',
    },
    department: {
      type: String,
      trim: true,
    },
    qualification: [{
      degree: String,
      university: String,
      year: Number,
    }],
    experience: {
      type: Number,
      default: 0,
    },
    joiningDate: {
      type: Date,
    },
    specialization: {
      type: String,
      trim: true,
    },
    subjects: [{
      type: String,
      trim: true,
    }],
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
teacherSchema.index({ userId: 1 }, { unique: true });
teacherSchema.index({ instituteId: 1, isActive: 1, isDeleted: 1 });
teacherSchema.index({ instituteId: 1, designation: 1 });

export default mongoose.model('Teacher', teacherSchema);
