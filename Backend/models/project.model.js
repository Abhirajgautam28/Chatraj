import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        lowercase: true,
        required: true,
        trim: true,
        unique: [ true, 'Project name must be unique' ],
    },

    users: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            }
        ],
        index: true
    },
    fileTree: {
        type: Object,
        default: {}
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    settings: {
        type: Object,
        default: {}
    }
}, {
    versionKey: false
})

// Covered index for category counts
projectSchema.index({ users: 1, category: 1 });

const Project = mongoose.model('project', projectSchema)

export default Project;