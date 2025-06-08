// video_ideas.js

document.addEventListener('DOMContentLoaded', function() {
    // Array om de chatgeschiedenis bij te houden in het formaat dat de Gemini API verwacht
    let chatMessages = [];

    // Verwijzingen naar HTML-elementen
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const chatDisplay = document.getElementById("chatDisplay");
    const clearChatButton = document.getElementById("clearChatButton");
    const hamburgerMenu = document.getElementById("hamburger-menu");
    const navMenu = document.querySelector(".menu");

    const themeButtons = document.querySelectorAll('.theme-btn'); // Nieuw: selecteer alle themaknoppen


    // Event listener voor het hamburger menu
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener("click", function() {
            if (navMenu) {
                navMenu.classList.toggle("active");
            }
        });
    }

    // Functie om berichten weer te geven in de chatDisplay
    function displayMessage(role, text) {
        if (chatDisplay) {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message', `${role}-message`);
            // Sanitize text to prevent XSS if you were getting external content
            // For now, innerHTML is fine for trusted AI output.
            messageDiv.innerHTML = `<strong>${role === 'user' ? 'You' : 'AI'}:</strong> ${text}`;
            chatDisplay.appendChild(messageDiv);
            chatDisplay.scrollTop = chatDisplay.scrollHeight; // Scroll naar beneden
        }
    }

    // Functie om de chat te wissen
    function clearChat() {
        chatMessages = []; // Leeg de geschiedenis
        if (chatDisplay) {
            chatDisplay.innerHTML = ''; // Leeg de weergave
            displayMessage('ai', 'Chat cleared! How can I help you today?'); // Startbericht
        }
    }

    // Functie om een idee te genereren (nu voor de chat)
    async function generateIdea() {
        const userText = userInput.value.trim();
        if (!userText) return; // Doe niets als invoer leeg is

        displayMessage('user', userText); // Toon gebruikersbericht direct
        chatMessages.push({ role: "user", parts: [{ text: userText }] }); // Voeg toe aan geschiedenis

        userInput.value = ''; // Leeg het invoerveld
        userInput.disabled = true; // Schakel invoer uit tijdens AI-denken
        sendButton.disabled = true; // Schakel knop uit
        displayMessage('ai', 'AI is thinking...'); // Toon laadbericht

        try {
            const response = await fetch("https://video-ideas-generator-api.onrender.com/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ messages: chatMessages }) // Stuur HELE geschiedenis
            });

            const data = await response.json();
            const aiResponse = data.result || "Something went wrong 😅";
            
            // Verwijder het 'AI is thinking...' bericht
            if (chatDisplay && chatDisplay.lastChild) {
                chatDisplay.removeChild(chatDisplay.lastChild); 
            }

            displayMessage('ai', aiResponse); // Toon AI-antwoord
            chatMessages.push({ role: "model", parts: [{ text: aiResponse }] }); // Voeg AI-antwoord toe aan geschiedenis

        } catch (error) {
            console.error("Error generating idea:", error);
            // Verwijder het 'AI is thinking...' bericht
            if (chatDisplay && chatDisplay.lastChild) {
                chatDisplay.removeChild(chatDisplay.lastChild); 
            }
            displayMessage('ai', 'An error occurred. Please try again.');
        } finally {
            userInput.disabled = false; // Schakel invoer weer in
            sendButton.disabled = false; // Schakel knop weer in
            userInput.focus(); // Focus terug op invoerveld
        }
    }

    // NIEUW: Functie om de input te vullen via de themaknoppen
    function fillIdeaFromThemeButton(theme) {
        if (userInput) {
            userInput.value = theme; // Vul het inputveld met het thema
            // Geef een hint dat de gebruiker nu kan genereren
            displayMessage('ai', `Theme "${theme}" set. Click 'Generate Idea' to get concepts!`);
        }
    }

    // NIEUW: Event listeners toevoegen aan alle themaknoppen
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.dataset.theme; // Haal het thema uit het data-theme attribuut
            fillIdeaFromThemeButton(theme);
        });
    });

    // Event listeners voor de generator
    if (sendButton) {
        sendButton.addEventListener('click', generateIdea);
    }
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                generateIdea();
            }
        });
    }
    if (clearChatButton) {
        clearChatButton.addEventListener('click', clearChat);
    }

    // Initialiseer de chat met een welkomstbericht
    // Zorg ervoor dat dit alleen gebeurt als de chatDisplay leeg is bij het laden
    if (chatDisplay && chatDisplay.innerHTML.trim() === '') {
        displayMessage('AI: Hallo! Ik ben je AI Video Ideeën Generator. Geef me een thema of sfeer!');
    }
});