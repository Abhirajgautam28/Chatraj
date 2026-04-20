import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  parentMessageId: {
    type: String,
    default: null
  },
  reactions: {
    type: Array,
    default: []
  },
  deliveredTo: {
    type: [String],
    default: []
  },
  readBy: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Disable __v field for performance and storage savings (internal use only)
  versionKey: false,
  autoIndex: process.env.NODE_ENV !== 'production'
});

// Compound index for high-performance chat history retrieval
messageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model('Message', messageSchema);