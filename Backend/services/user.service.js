import userModel from '../models/user.model.js';

export const createUser = async ({
    firstName, lastName, email, password, googleApiKey, otp, isVerified
}) => {
    if (!firstName || !lastName || !email || !password || !googleApiKey) {
        throw new Error('All fields are required');
    }
    const hashedPassword = await userModel.hashPassword(password);
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
    let sort = { firstName: 1 };

    if (search) {
        // Use MongoDB Text Search for vastly superior performance
        query.$text = { $search: search };
        sort = { score: { $meta: 'textScore' } };
    }

    const users = await userModel.find(query)
        .select('firstName lastName')
        .sort(sort)
        .limit(Math.min(limit, 100))
        .skip(skip)
        .lean();

    return users;
}
