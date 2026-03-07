import mongoose, { Document, Schema } from 'mongoose';

export interface IList extends Document {
  title: string;
  board: mongoose.Types.ObjectId;
  position: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const listSchema = new Schema<IList>(
  {
    title: {
      type: String,
      required: [true, 'List title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    position: {
      type: Number,
      required: true,
      default: 0,
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
listSchema.index({ board: 1, position: 1 });

export default mongoose.model<IList>('List', listSchema);

