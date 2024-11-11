// netlify/functions/chat.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
    try {
        const { input } = JSON.parse(event.body);
        const apiKey = process.env.OPENAI_API_KEY;

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [{ role: "user", content: input }],
                max_tokens: 1000,
            }),
        });

        const data = await response.json();
        const output = data.choices[0].message.content;

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: output }),
        };
    } catch (error) {
        console.error("Error in serverless function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch response from OpenAI API." }),
        };
    }
};
