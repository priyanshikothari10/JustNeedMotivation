import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema(
  {
    id: { type: Number }, // Compat with TasksSection (localstorage style)
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }, // Compat with TasksSection
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    }, // Compat with StudentDashboard
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

const PomodoroStatSchema = new mongoose.Schema({
  date: { type: String, required: true }, // "YYYY-MM-DD"
  completedSessions: { type: Number, default: 0 },
  totalFocusSeconds: { type: Number, default: 0 }
})

const JournalEntrySchema = new mongoose.Schema({
  id: { type: String, required: true },
  date: { type: String, required: true }, // "YYYY-MM-DD"
  content: { type: String, required: true },
  mood: { type: String }, // "Calm", "Focused", "Inspired", "Tired"
  createdAt: { type: Date, default: Date.now }
})

const DailyChallengeSchema = new mongoose.Schema({
  date: { type: String, required: true }, // "YYYY-MM-DD"
  challengeText: { type: String, required: true },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
})

const RoadmapItemSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  points: [{ type: String }],
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  progress: { type: Number, default: 0 } // goal progress 0-100%
})

const LearningActivitySchema = new mongoose.Schema({
  type: { type: String, enum: ['lesson', 'video', 'note', 'quiz', 'topic'], required: true },
  title: { type: String, required: true },
  details: { type: String }, // e.g. quiz details, notes text, video length
  score: { type: Number }, // for quizzes (0 - 100)
  totalQuestions: { type: Number },
  timestamp: { type: Date, default: Date.now }
})

const FlashcardSchema = new mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  nextReviewDate: { type: Date, default: Date.now }
})

const MessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
})

const ConversationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, default: 'New Chat' },
  messages: [MessageSchema],
  updatedAt: { type: Date, default: Date.now }
})

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastStreakDate: { type: String }, // "YYYY-MM-DD"
    focusGoal: { type: String, default: '' },
    tasks: [TaskSchema],
    pomodoroStats: [PomodoroStatSchema],
    journalEntries: [JournalEntrySchema],
    challenges: [DailyChallengeSchema],
    roadmap: [RoadmapItemSchema],
    favoriteQuotes: [{ type: String }], // array of quote texts
    learningHistory: [LearningActivitySchema],
    flashcards: [FlashcardSchema],
    aiConversations: [ConversationSchema]
  },
  {
    timestamps: true
  }
)

export default mongoose.models.User || mongoose.model('User', UserSchema)
