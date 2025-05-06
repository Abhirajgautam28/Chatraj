export const requiredKeys = {
    MONGODB_URI: {
        name: "MongoDB Connection String",
        description: "Your MongoDB Atlas connection string",
        example: "mongodb+srv://chatraj_admin:G48utah7YME5tjjb@chatraj-cluster.pmqtv2i.mongodb.net/ChatRaj?retryWrites=true&w=majority"
    },
    JWT_SECRET: {
        name: "JWT Secret Key",
        description: "Secret key for JWT authentication (min 32 characters)",
        example: "b18269f236b4703503082370caef1292057db9b8bbcb20ed67ccc06f60c4d84be0c9bf8f5ab9fa32d8418fc87d7f73a85af95d9dcc1851a5fea049fbacc36203"
    },
    GOOGLE_AI_KEY: {
        name: "Google AI API Key",
        description: "API key from Google Cloud Console",
        example: "AIzaSyD59nJa7Y6JsLnsHhDWm7kx0A2Ed2MhfJo"
    }
};