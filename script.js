const fullscreenInputContainer = document.getElementById("fullscreenInputContainer");
const fullscreenInput = document.getElementById("fullscreenInput");
const mainInputBox = document.getElementById("inputBox");
const chatContainer = document.getElementById("chatContainer");

// Helper function to format response text using Markdown and card layout
function formatResponseText(rawText) {
    // Parse JSON if necessary
    let parsedText;
    try {
        const data = JSON.parse(rawText);
        parsedText = data.reply || rawText; // Extract the 'reply' if it's structured
    } catch (e) {
        parsedText = rawText; // Use raw text if parsing fails
    }

    // Use marked.js to convert Markdown to HTML
    const htmlContent = marked.parse(parsedText);

    // Wrap content in a styled card
    return `<div class="bot-message-card">${htmlContent}</div>`;
}

async function sendMessage(input) {
    // Display user message
    const userMessage = document.createElement("div");
    userMessage.classList.add("message", "user-message");
    userMessage.innerText = input;
    chatContainer.appendChild(userMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Placeholder for bot message
    const botMessage = document.createElement("div");
    botMessage.classList.add("message", "bot-message");
    chatContainer.appendChild(botMessage);

    // Typing indicator
    const typingIndicator = document.createElement("div");
    typingIndicator.classList.add("typing-indicator");
    typingIndicator.innerText = "ChatGPT is typing...";
    chatContainer.appendChild(typingIndicator);

    try {
        const response = await fetch("/.netlify/functions/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: input, stream: true }),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let accumulatedText = ""; // To accumulate small chunks before displaying

        while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;

            if (value) {
                accumulatedText += decoder.decode(value, { stream: true });

                // If accumulatedText has enough content, append it to the message
                if (accumulatedText.length > 20 || done) { // Adjust threshold based on desired smoothness
                    const formattedText = formatResponseText(accumulatedText);
                    botMessage.innerHTML += formattedText;
                    accumulatedText = ""; // Reset buffer
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            }
        }

        chatContainer.removeChild(typingIndicator);

        // Final check for empty response
        if (botMessage.innerHTML === "") {
            console.error("No reply field in response");
            displayErrorMessage("Error: No response received from AI.");
        }
    } catch (error) {
        console.error("Error in fetch operation:", error);
        displayErrorMessage("Error: Unable to fetch response.");
    }
}

function displayErrorMessage(message) {
    const errorMessage = document.createElement("div");
    errorMessage.classList.add("message", "error-message");
    errorMessage.innerText = message;
    chatContainer.appendChild(errorMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

document.getElementById("sendBtn").addEventListener("click", () => {
    const input = mainInputBox.value.trim();
    if (input) {
        sendMessage(input);
        mainInputBox.value = "";
    }
});

mainInputBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const input = mainInputBox.value.trim();
        if (input) {
            sendMessage(input);
            mainInputBox.value = "";
        }
    }
});

function toggleSidebar() {
    document.body.classList.toggle("sidebar-active");
}

function adjustChatContainerHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', adjustChatContainerHeight);
window.addEventListener('load', adjustChatContainerHeight);

document.getElementById("sendFullscreenBtn").addEventListener("click", () => {
    const input = fullscreenInput.value.trim();
    if (input) {
        sendMessage(input);
        fullscreenInput.value = "";
        fullscreenInputContainer.style.display = "none";
    }
});
