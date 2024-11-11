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
                  const cleanText = formatResponseText(accumulatedText);
                  botMessage.innerHTML += cleanText; // Using innerHTML allows structured content
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

// Helper function to clean and format response text
function formatResponseText(rawText) {
  // Parse JSON if necessary
  let parsedText;
  try {
      const data = JSON.parse(rawText);
      parsedText = data.reply || rawText; // Get the 'reply' if it's structured
  } catch (e) {
      parsedText = rawText; // Use raw text if parsing fails
  }

  // Clean unwanted characters
  parsedText = parsedText.replace(/\\n/g, "<br>")  // Convert newlines to HTML breaks
                         .replace(/\\["{}]/g, ""); // Remove escape sequences

  // Wrap text in paragraph tags or any other desired HTML structure
  return `<p>${parsedText}</p>`;
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
