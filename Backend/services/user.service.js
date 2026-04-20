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

export const getAllUsers = async ({ userId, search, limit = 50, skip = 0 }) => {
    const query = { _id: { $ne: userId } };
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    const users = await userModel.find(query)
        .select('firstName lastName')
        .limit(Math.min(limit, 100))
        .skip(skip)
        .lean();
    return users;
}