// video_ideas.js - Verbeterde Versie

document.addEventListener('DOMContentLoaded', function() {
    // Array om de chatgeschiedenis bij te houden
    let chatMessages = [];

    // Verwijzingen naar alle HTML-elementen
    const userInput = document.getElementById("userInput");
    const sendButton = document.getElementById("sendButton");
    const chatDisplay = document.getElementById("chatDisplay");
    const clearChatButton = document.getElementById("clearChatButton");
    const hamburgerMenu = document.getElementById("hamburger-menu");
    const navMenu = document.querySelector(".menu");
    const themeButtons = document.querySelectorAll('.theme-btn');

    // --- HAMBURGER MENU FUNCTIONALITEIT ---
    // Deze code staat nu centraal in dit bestand.
    if (hamburgerMenu && navMenu) {
        hamburgerMenu.addEventListener("click", function() {
            navMenu.classList.toggle("active");
        });
    }

    // --- CHAT FUNCTIES ---

    /**
     * Toont een bericht in het chatvenster.
     * @param {string} role - De rol ('user' of 'ai').
     * @param {string} text - De tekst van het bericht (kan HTML bevatten).
     */
    function displayMessage(role, text) {
        if (!chatDisplay) return;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${role}-message`);
        
        // De naam van de afzender aanpassen naar Nederlands
        const senderName = (role === 'user') ? 'Jij' : 'AI';
        messageDiv.innerHTML = `<strong>${senderName}:</strong> ${text}`;
        
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight; // Scroll altijd naar het nieuwste bericht
    }

    /**
     * Toont een mooi welkomstbericht bij het laden van de pagina.
     */
    function showWelcomeMessage() {
        const welcomeHTML = `
            <p>Ik ben jouw AI-partner voor het bedenken van video's!</p>
            <p>Hoe werkt het?</p>
            <ul>
                <li>Typ een thema, sfeer of gek idee in het invoerveld.</li>
                <li>Of klik op een van de snelle thema's hierboven.</li>
                <li>Ik geef je een concept en we kunnen van daaruit verder chatten om het te verfijnen.</li>
            </ul>
            <p>Waar denk je vandaag aan?</p>
        `;
        displayMessage('ai', welcomeHTML);
    }

    /**
     * Wist de volledige chatgeschiedenis en het scherm.
     */
    function clearChat() {
        chatMessages = []; 
        if (chatDisplay) {
            chatDisplay.innerHTML = ''; 
            displayMessage('ai', 'Chat gewist! Waarmee kan ik je helpen?'); // Vertaald naar Nederlands
        }
    }

    /**
     * Stuurt de gebruikersinput naar de backend en verwerkt het antwoord.
     */
    async function generateIdea() {
        const userText = userInput.value.trim();
        if (!userText) return;

        displayMessage('user', userText);
        chatMessages.push({ role: "user", parts: [{ text: userText }] });

        userInput.value = '';
        userInput.disabled = true;
        sendButton.disabled = true;
        displayMessage('ai', 'AI is aan het brainstormen...'); // Vertaald naar Nederlands

        try {
            const response = await fetch("https://video-ideas-generator-api.onrender.com/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: chatMessages })
            });

            // Verwijder het 'AI is aan het brainstormen...' bericht
            if (chatDisplay && chatDisplay.lastChild.textContent.includes('brainstormen')) {
                chatDisplay.removeChild(chatDisplay.lastChild);
            }

            if (!response.ok) {
                throw new Error(`Er is een fout opgetreden: ${response.statusText}`);
            }

            const data = await response.json();
            const aiResponse = data.result || "Er ging iets mis, probeer het opnieuw! 😅";
            
            displayMessage('ai', aiResponse);
            chatMessages.push({ role: "model", parts: [{ text: aiResponse }] });

        } catch (error) {
            console.error("Fout bij het genereren van een idee:", error);
            // Verwijder het 'AI is aan het brainstormen...' bericht, ook bij een fout
            if (chatDisplay && chatDisplay.lastChild.textContent.includes('brainstormen')) {
                chatDisplay.removeChild(chatDisplay.lastChild);
            }
            displayMessage('ai', 'Oeps, er is een fout opgetreden. Controleer de verbinding en probeer het opnieuw.'); // Vertaald
        } finally {
            userInput.disabled = false;
            sendButton.disabled = false;
            userInput.focus();
        }
    }

    /**
     * Vult de input en geeft een hint wanneer een themaknop wordt geklikt.
     * @param {string} theme - Het thema van de geklikte knop.
     */
    function fillIdeaFromThemeButton(theme) {
        if (userInput) {
            userInput.value = `Genereer een video-idee over het thema: ${theme}`;
            userInput.focus();
        }
    }

    // --- EVENT LISTENERS ---

    // Koppel de generateIdea functie aan de knop en Enter-toets
    if (sendButton) sendButton.addEventListener('click', generateIdea);
    if (userInput) userInput.addEventListener('keypress', (e) => (e.key === 'Enter' && generateIdea()));
    
    // Koppel de clearChat functie
    if (clearChatButton) clearChatButton.addEventListener('click', clearChat);

    // Koppel de themaknoppen
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            fillIdeaFromThemeButton(this.innerText);
        });
    });

    // --- INITIALISATIE ---
    // Toon het welkomstbericht als de chat leeg is
    if (chatDisplay && chatDisplay.innerHTML.trim() === '') {
        showWelcomeMessage();
    }
});