import User from '../models/user.model.js';



export const createUser = async ({
    firstName, lastName, email, passwordHash, googleApiKey, otp, isVerified = false
}) => {
    if (!firstName || !lastName || !email || !passwordHash || !googleApiKey) {
        throw new Error('All fields are required');
    }
    // Store googleApiKey in plaintext for Gemini API
    const user = await User.create({
        firstName,
        lastName,
        email,
        password: passwordHash,
        googleApiKey,
        otp,
        isVerified
    });
    return user;
}

export const getAllUsers = async ({ userId }) => {
    const users = await User.find({
        _id: { $ne: userId }
    }).lean();
    return users;
}