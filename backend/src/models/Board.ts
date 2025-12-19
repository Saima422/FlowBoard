import mongoose, { Document, Schema } from 'mongoose';

export interface IMember {
  user: mongoose.Types.ObjectId;
  role: 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
}

export interface IBoard extends Document {
  title: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: IMember[];
  backgroundColor?: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<IMember>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'editor',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const boardSchema = new Schema<IBoard>(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
    backgroundColor: {
      type: String,
      default: '#0079bf',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
boardSchema.index({ owner: 1 });
boardSchema.index({ 'members.user': 1 });

export default mongoose.model<IBoard>('Board', boardSchema);

