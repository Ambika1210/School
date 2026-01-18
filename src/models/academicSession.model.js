import mongoose from 'mongoose';
import { validateDateRange } from '../utils/dateHelper.js';
import logger from '../utils/logger.js';

const academicSessionSchema = new mongoose.Schema(
  {
    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institute',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true, // e.g., "2024-2025" or "Spring 2024" or "April 2024 - March 2025"
    },
    startDate: {
      type: Date,
      required: true,
      // JavaScript Date automatically handles different month lengths (28, 30, 31 days)
      // MongoDB stores dates in ISO format, so month length is handled automatically
    },
    endDate: {
      type: Date,
      required: true,
    },
    isCurrent: {
      type: Boolean,
      default: false,
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

// Pre-save validation hook
// This ensures dates are validated before saving to database
academicSessionSchema.pre('save', function(next) {
  // Only validate if dates are being set/modified
  if (this.isModified('startDate') || this.isModified('endDate') || this.isNew) {
    const dateValidation = validateDateRange(this.startDate, this.endDate);
    
    if (!dateValidation.valid) {
      logger.error('AcademicSession Model >>>> Pre-save validation failed', {
        error: dateValidation.error,
        startDate: this.startDate,
        endDate: this.endDate
      });
      const error = new Error(dateValidation.error);
      error.name = 'ValidationError';
      return next(error);
    }
  }
  
  next();
});

// Pre-update validation hook (for findOneAndUpdate, updateOne, etc.)
academicSessionSchema.pre(['updateOne', 'findOneAndUpdate', 'findOneAndReplace'], function(next) {
  const update = this.getUpdate();
  
  // Check if dates are being updated
  if (update.$set && (update.$set.startDate || update.$set.endDate)) {
    // Get the document to access existing dates
    this.model.findOne(this.getQuery()).then(doc => {
      if (!doc) {
        return next();
      }
      
      const startDate = update.$set.startDate || doc.startDate;
      const endDate = update.$set.endDate || doc.endDate;
      
      const dateValidation = validateDateRange(startDate, endDate);
      
      if (!dateValidation.valid) {
        logger.error('AcademicSession Model >>>> Pre-update validation failed', {
          error: dateValidation.error,
          startDate,
          endDate
        });
        const error = new Error(dateValidation.error);
        error.name = 'ValidationError';
        return next(error);
      }
      
      next();
    }).catch(err => next(err));
  } else {
    next();
  }
});

// Virtual for session duration in days
academicSessionSchema.virtual('durationDays').get(function() {
  if (!this.startDate || !this.endDate) return 0;
  const diffTime = this.endDate - this.startDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for formatted date range
academicSessionSchema.virtual('formattedDateRange').get(function() {
  if (!this.startDate || !this.endDate) return '';
  const start = this.startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const end = this.endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `${start} - ${end}`;
});

// Ensure virtuals are included in JSON output
academicSessionSchema.set('toJSON', { virtuals: true });
academicSessionSchema.set('toObject', { virtuals: true });

// Basic indexing
academicSessionSchema.index({ instituteId: 1, isCurrent: 1 }); // To quickly find the current session for an institute
academicSessionSchema.index({ instituteId: 1, name: 1 }, { unique: true }); // Prevent duplicate names per institute
academicSessionSchema.index({ instituteId: 1, startDate: 1, endDate: 1 }); // For date range queries
academicSessionSchema.index({ startDate: 1, endDate: 1 }); // For finding sessions by date

export default mongoose.model('AcademicSession', academicSessionSchema);
