const fullscreenInputContainer = document.getElementById("fullscreenInputContainer");
const fullscreenInput = document.getElementById("fullscreenInput");
const mainInputBox = document.getElementById("inputBox");

mainInputBox.addEventListener("focus", () => {
    if (window.innerWidth <= 768) { // Target only mobile
        fullscreenInputContainer.style.display = "flex";
        fullscreenInput.focus();
    }
});

document.getElementById("sendFullscreenBtn").addEventListener("click", () => {
    if (fullscreenInput.value.trim() !== "") {
        const chatContainer = document.getElementById("chatContainer");
        const message = document.createElement("div");
        message.classList.add("message");
        message.innerText = fullscreenInput.value;
        chatContainer.appendChild(message);

        fullscreenInput.value = ""; // Clear fullscreen input
        fullscreenInputContainer.style.display = "none"; // Hide fullscreen input
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});

// Close fullscreen input on blur
fullscreenInput.addEventListener("blur", () => {
    fullscreenInputContainer.style.display = "none";
});


function toggleSidebar() {
    document.body.classList.toggle("sidebar-active");
}

document.getElementById("sendBtn").addEventListener("click", () => {
    const chatContainer = document.getElementById("chatContainer");
    const inputBox = document.getElementById("inputBox");

    if (inputBox.value.trim() !== "") {
        const message = document.createElement("div");
        message.classList.add("message");
        message.innerText = inputBox.value;
        chatContainer.appendChild(message);

        inputBox.value = ""; // Clear input
        chatContainer.scrollTop = chatContainer.scrollHeight; // Scroll to bottom
    }
});
