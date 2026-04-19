import userModel from '../models/user.model.js';



export const createUser = async ({
    firstName, lastName, email, passwordHash, googleApiKey, otp, isVerified = false
}) => {
    if (!firstName || !lastName || !email || !passwordHash || !googleApiKey) {
        throw new Error('All fields are required');
    }
    // Store googleApiKey in plaintext for Gemini API
    const user = await userModel.create({
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
    const users = await userModel.find({
        _id: { $ne: userId }
    });
    return users;
}