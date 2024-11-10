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
