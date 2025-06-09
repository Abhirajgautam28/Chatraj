import userModel from '../models/user.model.js';



export const createUser = async ({
    firstName, lastName, email, password, googleApiKey
}) => {
    if (!firstName || !lastName || !email || !password || !googleApiKey) {
        throw new Error('All fields are required');
    }
    const hashedPassword = await userModel.hashPassword(password);
    const hashedApiKey = await userModel.hashPassword(googleApiKey);
    const user = await userModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        googleApiKey: hashedApiKey
    });
    return user;
}

export const getAllUsers = async ({ userId }) => {
    const users = await userModel.find({
        _id: { $ne: userId }
    });
    return users;
}