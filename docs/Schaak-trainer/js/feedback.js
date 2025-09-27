// ===== FEEDBACK GENERATOR =====
class FeedbackGenerator {
    constructor() {}

    // Genereert HTML-feedback op basis van de partij-analyse
    generateFeedback(analysisResult, gameResult) {
        const { blunders, mistakes, goodMoves, accuracy } = analysisResult;

        // 1. Algemene Samenvatting
        let summaryHTML = `<h3>Partij Samenvatting</h3>`;
        summaryHTML += `<p>Je speelde met een nauwkeurigheid van <strong>${accuracy}%</strong>. `;
        if (gameResult === 'win') {
            summaryHTML += `Een verdiende overwinning!</p>`;
        } else if (gameResult === 'loss') {
            summaryHTML += `Een leerzame partij, volgende keer beter!</p>`;
        } else {
            summaryHTML += `Een spannende remise!</p>`;
        }
        summaryHTML += `<ul>
            <li>Goede zetten: ${goodMoves}</li>
            <li>Fouten: ${mistakes}</li>
            <li>Blunders: ${blunders}</li>
        </ul>`;
        
        $('#game-summary').html(summaryHTML);

        // 2. Sterktes en Zwaktes
        let feedbackHTML = `<h3>Sterke en Zwakke Punten</h3>`;
        if (blunders === 0 && mistakes < 2) {
            feedbackHTML += `<p class="strength"><strong>Uitstekend!</strong> Je speelde een zeer solide partij met nauwelijks fouten.</p>`;
        } else if (blunders > 2) {
            feedbackHTML += `<p class="weakness"><strong>Focuspunt:</strong> Probeer blunders te vermijden. Dubbelcheck je zet voordat je deze uitvoert.</p>`;
        } else if (mistakes > 4) {
             feedbackHTML += `<p class="weakness"><strong>Focuspunt:</strong> Je maakt soms kleine foutjes. Let op de tactische mogelijkheden van je tegenstander.</p>`;
        } else {
            feedbackHTML += `<p class="strength"><strong>Goed gespeeld!</strong> Je hebt een goed begrip van de basisprincipes.</p>`;
        }
        $('#strengths-weaknesses').html(feedbackHTML);
        
        // 3. Concrete Tips
        let tipsHTML = `<h3>Tips voor Verbetering</h3>`;
        tipsHTML += `<ul>`;
        if (blunders > 0) {
            tipsHTML += `<li>Voer voor elke zet een 'blunder-check' uit: staat er een van je stukken ongedekt?</li>`;
        }
        tipsHTML += `<li>Probeer na de zet van je tegenstander altijd te vragen: "Wat is zijn plan?".</li>`;
        tipsHTML += `<li>Blijf je stukken ontwikkelen en breng je koning snel in veiligheid.</li>`;
        tipsHTML += `</ul>`;
        $('#improvement-tips').html(tipsHTML);
    }

    // Toont de feedback modal
    showFeedbackModal() {
        $('#feedback-modal').fadeIn(300);
    }
}

// Maak een globale instantie
window.feedbackGenerator = new FeedbackGenerator();


