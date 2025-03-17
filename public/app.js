document.addEventListener("DOMContentLoaded", () => {
    // DOM elements
    const chatForm = document.getElementById("chat-form")
    const userInput = document.getElementById("user-input")
    const chatContainer = document.getElementById("chat-container")
    const loadingIndicator = document.getElementById("loading-indicator")
  
    // Load chat history from localStorage if it exists
    const loadChatHistory = () => {
      const history = localStorage.getItem("chatHistory")
      if (history) {
        chatContainer.innerHTML = history
      }
    }
  
    // Save chat history to localStorage
    const saveChatHistory = () => {
      localStorage.setItem("chatHistory", chatContainer.innerHTML)
    }
  
    // Add a message to the chat
    const addMessage = (message, isUser = false) => {
      const messageDiv = document.createElement("div")
      messageDiv.className = `chat-message ${isUser ? "user-message" : "ai-message"} fade-in`
  
      const innerDiv = document.createElement("div")
      innerDiv.className = "rounded-lg p-4 shadow-md"
  
      const messagePara = document.createElement("p")
      messagePara.className = "message-content"
      messagePara.innerText = message
  
      innerDiv.appendChild(messagePara)
      messageDiv.appendChild(innerDiv)
      chatContainer.appendChild(messageDiv)
  
      // Scroll to bottom
      chatContainer.scrollTop = chatContainer.scrollHeight
  
      // Save to localStorage
      saveChatHistory()
    }
  
    // Show loading indicator
    const showLoading = () => {
      loadingIndicator.classList.remove("hidden")
      userInput.disabled = true
    }
  
    // Hide loading indicator
    const hideLoading = () => {
      loadingIndicator.classList.add("hidden")
      userInput.disabled = false
      userInput.focus()
    }
  
    // Send message to Netlify Function
    const sendMessage = async (message) => {
      try {
        showLoading()
  
        const response = await fetch("/.netlify/functions/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        })
  
        if (!response.ok) {
          throw new Error("Failed to get response")
        }
  
        const data = await response.json()
        hideLoading()
  
        if (data.error) {
          console.error("Error:", data.error)
          addMessage("Sorry, I encountered an error. Please try again later.", false)
        } else {
          addMessage(data.response, false)
        }
      } catch (error) {
        console.error("Error:", error)
        hideLoading()
        addMessage("Sorry, I encountered an error. Please try again later.", false)
      }
    }
  
    // Handle form submission
    chatForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const message = userInput.value.trim()
  
      if (message) {
        addMessage(message, true)
        userInput.value = ""
        sendMessage(message)
      }
    })
  
    // Clear chat history button
    const addClearButton = () => {
      const footer = document.querySelector("footer")
      const clearBtn = document.createElement("button")
      clearBtn.textContent = "Clear Chat History"
      clearBtn.className = "mt-2 text-xs text-teal-400 hover:text-teal-300"
  
      clearBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear the chat history?")) {
          localStorage.removeItem("chatHistory")
          // Keep only the initial greeting message
          chatContainer.innerHTML = `
            <div class="chat-message ai-message">
              <div class="bg-gray-800 rounded-lg p-4 shadow-md">
                <p>Hello! I'm your Career & Mentorship Advisor. I can help with career advice, resume tips, and academic guidance. What would you like assistance with today?</p>
              </div>
            </div>
          `
        }
      })
  
      footer.appendChild(clearBtn)
    }
  
    // Initialize the chat
    loadChatHistory()
    addClearButton()
  
    // Focus the input field on load
    userInput.focus()
  })
