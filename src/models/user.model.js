import mongoose from 'mongoose';
import { SUPER_ADMIN, INSTITUTE_ADMIN, TEACHER, STUDENT, PARENT, STAFF, USER, MALE, FEMALE, OTHER } from '../constants/enums.js';

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: false, // Optional for now
    },
    phoneNo: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: [SUPER_ADMIN, INSTITUTE_ADMIN, TEACHER, STUDENT, PARENT, STAFF, USER],
      default: USER,
    },
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      default: null, // Super Admin won't belong to an institute
    },
    gender: {
      type: String,
      enum: [MALE, FEMALE, OTHER],
      default: null,
    },
    dob: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    profileUrl: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ email: 1, instituteId: 1 }, { unique: true });
userSchema.index({ phoneNo: 1, countryCode: 1, instituteId: 1 }, { unique: true, sparse: true });
userSchema.index({ instituteId: 1, role: 1 });
userSchema.index({ isActive: 1, isDeleted: 1 });
userSchema.index({ instituteId: 1, role: 1, hasStudentRecord: 1 }); // For efficient querying of new registered students

export default mongoose.model('User', userSchema);
