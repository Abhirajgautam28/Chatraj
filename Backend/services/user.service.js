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
    let sort = { firstName: 1 };

    if (search) {
        // Use MongoDB Text Search for vastly superior performance and relevance
        query.$text = { $search: search };
        sort = { score: { $meta: 'textScore' } };
    }

    const users = await userModel.find(query, search ? { score: { $meta: 'textScore' } } : {})
        .select('firstName lastName')
        .sort(sort)
        .limit(Math.min(limit, 100))
        .skip(skip)
        .lean();

    // Fallback to regex if text search returned nothing (e.g. for partial matches which text search ignores)
    if (search && users.length === 0) {
        const regexQuery = {
            _id: { $ne: userId },
            $or: [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ]
        };
        return await userModel.find(regexQuery)
            .select('firstName lastName')
            .limit(Math.min(limit, 100))
            .skip(skip)
            .lean();
    }

    return users;
}