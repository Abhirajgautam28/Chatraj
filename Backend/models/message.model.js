import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
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
});

export default mongoose.model('Message', messageSchema);