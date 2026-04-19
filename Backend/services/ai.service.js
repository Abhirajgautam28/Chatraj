import { GoogleGenerativeAI } from "@google/generative-ai"

/**
 * Base function to generate content from Google AI.
 * @param {Object} params
 * @param {string} params.prompt
 * @param {string} [params.userApiKey]
 * @param {string} [params.modelName="gemini-1.5-flash"]
 * @param {string} [params.systemInstruction]
 * @param {string} [params.responseMimeType]
 * @param {number} [params.temperature=0.4]
 * @returns {Promise<string>}
 */
export const generateContent = async ({ prompt, userApiKey, modelName = "gemini-1.5-flash", systemInstruction, responseMimeType, temperature = 0.4 }) => {
    const apiKey = userApiKey || process.env.GOOGLE_AI_KEY;
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
        throw new Error('AI is not available. Please set a valid GOOGLE_AI_KEY.');
    }
    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const config = {
            model: modelName,
            generationConfig: {
                temperature,
            },
        };

        if (responseMimeType) {
            config.generationConfig.responseMimeType = responseMimeType;
        }

        if (systemInstruction) {
            config.systemInstruction = systemInstruction;
        }

        const model = genAI.getGenerativeModel(config);
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error('AI generation error:', err);
        throw err;
    }
}

/**
 * Specifically for ChatRaj project generation with complex system instructions.
 */
export const generateResult = async (prompt, userApiKey) => {
    const systemInstruction = `You are an expert in MERN and Development. You have an experience of 10 years in the development. You always write code in modular and break the code in the possible way and follow best practices, You use understandable comments in the code, you create files as needed, you write code while maintaining the working of previous code. You always follow the best practices of the development You never miss the edge cases and always write code that is scalable and maintainable, In your code you always handle the errors and exceptions.
    
    Examples: 

    <example>
 
    response: {

    "text": "this is you fileTree structure of the express server",
    "fileTree": {
        "app.js": {
            file: {
                contents: "
                const express = require('express');

                const app = express();


                app.get('/', (req, res) => {
                    res.send('Hello World!');
                });


                app.listen(3000, () => {
                    console.log('Server is running on port 3000');
                })
                "
            },
        },

        "package.json": {
            file: {
                contents: "

                {
                    "name": "temp-server",
                    "version": "1.0.0",
                    "main": "index.js",
                    "scripts": {
                        "test": "echo \"Error: no test specified\" && exit 1"
                    },
                    "keywords": [],
                    "author": "",
                    "license": "ISC",
                    "description": "",
                    "dependencies": {
                        "express": "^4.21.2"
                    }
}

                "
            },
        },
    },
    "buildCommand": {
        mainItem: "npm",
            commands: [ "install" ]
    },

    "startCommand": {
        mainItem: "node",
            commands: [ "app.js" ]
    }
}

    user:Create an express application 
   
    </example>


    
       <example>

       user:Hello 
       response:{
       "text":"Hello, How can I help you today?"
       }
       
       </example>
    
 IMPORTANT : don't use file name like routes/index.js
       
    `;

    try {
        return await generateContent({
            prompt,
            userApiKey,
            systemInstruction,
            modelName: "gemini-1.5-flash",
            responseMimeType: "application/json"
        });
    } catch (err) {
        return JSON.stringify({
            text: 'AI error: ' + (err.message || 'Unknown error'),
            fileTree: null
        });
    }
}
