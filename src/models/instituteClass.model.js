import mongoose from 'mongoose';

const instituteClassSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
    },
    academicSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicSession',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true, // e.g., "Class 10", "Grade 5"
    },
    section: {
      type: String,
      required: true,
      trim: true, // e.g., "A", "B", "Rose"
      default: 'A'
    },
    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: false, // Can be assigned later
    },
    strength: {
        type: Number,
        default: 0
    },
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

// Compound index to ensure unique class-section combination per session
instituteClassSchema.index(
  { instituteId: 1, academicSessionId: 1, name: 1, section: 1 }, 
  { unique: true }
);

export default mongoose.model('InstituteClass', instituteClassSchema);
