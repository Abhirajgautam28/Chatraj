import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: [2, 'First name must be at least 2 characters'],
        maxLength: [30, 'First name must not be longer than 30 characters']
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minLength: [2, 'Last name must be at least 2 characters'],
        maxLength: [30, 'Last name must not be longer than 30 characters']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minLength: [ 6, 'Email must be at least 6 characters long' ],
        maxLength: [ 50, 'Email must not be longer than 50 characters' ]
    },
    password: {
        type: String,
        select: false,
    },
    googleApiKey: {
        type: String,
        select: false,
        required: true
    },
    otp: {
        type: String,
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false
    }
    ,
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'project',
        default: []
    }]
});

userSchema.statics.hashPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

userSchema.methods.isValidPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateJWT = function () {
    return jwt.sign(
        { email: this.email, firstName: this.firstName, lastName: this.lastName },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

const User = mongoose.model('user', userSchema);

export default User;