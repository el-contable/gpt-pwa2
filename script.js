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

    // Send input to Netlify function and display response
    try {
        const response = await fetch("/.netlify/functions/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input: input }),
        });
        const data = await response.json();

        const botMessage = document.createElement("div");
        botMessage.classList.add("message", "bot-message");
        botMessage.innerText = data.reply;
        chatContainer.appendChild(botMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } catch (error) {
        console.error("Error:", error);
        const errorMessage = document.createElement("div");
        errorMessage.classList.add("message", "error-message");
        errorMessage.innerText = "Error: Unable to fetch response.";
        chatContainer.appendChild(errorMessage);
    }
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

document.getElementById("sendFullscreenBtn").addEventListener("click", () => {
    const input = fullscreenInput.value.trim();
    if (input) {
        sendMessage(input);
        fullscreenInput.value = "";
        fullscreenInputContainer.style.display = "none";
    }
});
