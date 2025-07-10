import mongoose, { Schema } from 'mongoose';
import toJSON from './plugins/toJSON';

const DemoRequestSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    practiceType: {
      type: String,
      required: [true, 'Practice type is required'],
    },
    preferredTime: {
      type: String,
      required: [true, 'Preferred time is required'],
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'scheduled', 'completed', 'cancelled'],
      default: 'new',
    },
    agreeToTerms: {
      type: Boolean,
      required: [true, 'Agreement to terms is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Add toJSON plugin
DemoRequestSchema.plugin(toJSON);

export default mongoose.models.DemoRequest ||
  mongoose.model('DemoRequest', DemoRequestSchema, 'av_demo_requests');
