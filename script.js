const fullscreenInputContainer = document.getElementById("fullscreenInputContainer");
const fullscreenInput = document.getElementById("fullscreenInput");
const mainInputBox = document.getElementById("inputBox");
const chatContainer = document.getElementById("chatContainer");

async function sendMessage(input) {
    // Display user message
    const userMessage = document.createElement("div");
    userMessage.classList.add("message", "user-message");
    userMessage.innerText = input;
    chatContainer.appendChild(userMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Placeholder for bot message that will be populated as chunks arrive
    const botMessage = document.createElement("div");
    botMessage.classList.add("message", "bot-message");
    chatContainer.appendChild(botMessage);

    try {
        const response = await fetch("/.netlify/functions/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: input, stream: true }),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        // Stream and decode each chunk as it arrives
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;

        while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;

            if (value) {
                // Append the chunk to the bot's message
                botMessage.innerText += decoder.decode(value, { stream: true });
                chatContainer.scrollTop = chatContainer.scrollHeight;
            }
        }

        if (botMessage.innerText === "") {
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

document.getElementById("sendFullscreenBtn").addEventListener("click", () => {
    const input = fullscreenInput.value.trim();
    if (input) {
        sendMessage(input);
        fullscreenInput.value = "";
        fullscreenInputContainer.style.display = "none";
    }
});
