import userModel from '../models/user.model.js';



export const createUser = async ({
    firstName, lastName, email, password, googleApiKey, otp, isVerified
}) => {
    if (!firstName || !lastName || !email || !password || !googleApiKey) {
        throw new Error('All fields are required');
    }
    const hashedPassword = await userModel.hashPassword(password);
    // Store googleApiKey in plaintext for Gemini API
    const user = await userModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
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