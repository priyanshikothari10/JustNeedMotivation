import mongoose from 'mongoose'

const QuoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    author: { type: String, default: 'Anonymous', trim: true },
    source: { type: String, default: 'seed' } // 'seed' | 'api' | etc.
  },
  { timestamps: true }
)

QuoteSchema.index({ text: 1, author: 1 }, { unique: true })

export default mongoose.models.Quote || mongoose.model('Quote', QuoteSchema)

