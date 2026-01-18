import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Institute reference (optional but useful)
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },

    employeeId: {
      type: String,
      required: true,
      trim: true,
    },

    // 📚 Subjects teacher padhata hai
    subjects: [
      {
        type: String,
        trim: true,
      },
    ],

    // ⏳ Experience (years me)
    experience: {
      type: Number,
      min: 0,
      default: 0,
    },

    qualification: {
      type: String,
      trim: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    joiningDate: {
      type: Date,
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
  { timestamps: true }
);

// 🔐 Indexes
teacherSchema.index({ instituteId: 1, employeeId: 1 }, { unique: true });

export default mongoose.model("Teacher", teacherSchema);
