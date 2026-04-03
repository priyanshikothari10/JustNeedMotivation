import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date
    }
  },
  { _id: true }
)

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    roadmap: [{ type: String }],
    tasks: [TaskSchema],
    streak: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.models.Student || mongoose.model('Student', StudentSchema)

