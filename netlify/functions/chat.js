exports.handler = async (event) => {
  // Import node-fetch dynamically
  const fetch = (await import("node-fetch")).default;

  try {
      const { input } = JSON.parse(event.body);
      const apiKey = process.env.OPENAI_API_KEY;

      // Check if the API key is missing or undefined
      if (!apiKey) {
          console.error("API key is missing. Please set it in the environment variables.");
          return {
              statusCode: 500,
              body: JSON.stringify({ error: "API key is missing." }),
          };
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
              model: "gpt-4-turbo",
              messages: [{ role: "user", content: input }],
              max_tokens: 500,
          }),
      });

      // Check for authorization error
      if (response.status === 401) {
          console.error("Authorization failed: Invalid API key.");
          return {
              statusCode: 500,
              body: JSON.stringify({ error: "Authorization failed: Invalid API key." }),
          };
      }

      // Log any other non-200 responses
      if (!response.ok) {
          console.error(`OpenAI API Error: ${response.status} - ${response.statusText}`);
          return {
              statusCode: 500,
              body: JSON.stringify({ error: `OpenAI API Error: ${response.status}` }),
          };
      }

      // Parse the JSON data if status is OK
      const data = await response.json();
      const output = data.choices && data.choices[0] && data.choices[0].message.content;

      if (output) {
          return {
              statusCode: 200,
              body: JSON.stringify({ reply: output }),
          };
      } else {
          return {
              statusCode: 500,
              body: JSON.stringify({ error: "No valid response from OpenAI API." }),
          };
      }
  } catch (error) {
      console.error("Error in serverless function:", error);
      return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to fetch response from OpenAI API." }),
      };
  }
};
