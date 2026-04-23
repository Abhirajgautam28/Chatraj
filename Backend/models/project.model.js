import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        index: true
    }],
    fileTree: {
        type: Object,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    settings: {
        sidebar: {
            type: Object,
            default: {}
        }
    }
}, {
    timestamps: true,
    autoIndex: process.env.NODE_ENV !== 'production',
    versionKey: false
});

// Optimization: Covered Index for project listing
projectSchema.index({ users: 1, category: 1, name: 1, createdAt: -1 });

const Project = mongoose.model('project', projectSchema);

export default Project;
