import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'project',
    required: true,
    index: true
  },
  sender: {
    _id: { type: String, required: true },
    email: { type: String },
    firstName: { type: String },
    lastName: { type: String }
  },
  message: {
    type: String,
    required: true
  },
  parentMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  reactions: [{
    emoji: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
  }],
  deliveredTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }]
}, {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'production',
    versionKey: false
});

// Compound index for fast chat history retrieval
messageSchema.index({ conversationId: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
