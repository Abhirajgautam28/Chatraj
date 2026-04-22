import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied'],
        default: 'pending'
    }
}, { timestamps: true });

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
