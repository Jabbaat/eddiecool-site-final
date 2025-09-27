// ===== SPELER PROFIEL MANAGEMENT =====
class PlayerProfile {
    constructor() {
        this.profile = this.loadProfile();
        this.updateUI();
    }

    // Default profiel structuur
    getDefaultProfile() {
        return {
            naam: "Speler",
            elo_rating: 1200,
            partijen_gespeeld: 0,
            tactische_score: 50,
            positionele_score: 40,
            eindspel_score: 30,
        };
    }

    // Profiel laden uit de lokale opslag van de browser
    loadProfile() {
        try {
            const saved = localStorage.getItem('schaak_speler_profiel');
            const profile = saved ? JSON.parse(saved) : this.getDefaultProfile();
            // Zorg ervoor dat alle velden bestaan
            return { ...this.getDefaultProfile(), ...profile };
        } catch (error) {
            console.error('Fout bij laden profiel:', error);
            return this.getDefaultProfile();
        }
    }

    // Profiel opslaan in de lokale opslag
    saveProfile() {
        try {
            localStorage.setItem('schaak_speler_profiel', JSON.stringify(this.profile));
            this.updateUI();
        } catch (error) {
            console.error('Fout bij opslaan profiel:', error);
        }
    }

    // De interface bijwerken met de profielgegevens
    updateUI() {
        $('#player-name').text(this.profile.naam);
        $('#player-rating').text(this.profile.elo_rating);
        this.updateProgressBar('tactical-progress', this.profile.tactische_score);
        this.updateProgressBar('positional-progress', this.profile.positionele_score);
        this.updateProgressBar('endgame-progress', this.profile.eindspel_score);
    }

    updateProgressBar(elementId, value) {
        $(`#${elementId}`).css('width', `${Math.max(0, Math.min(100, value))}%`);
    }

    // Verwerkt het resultaat van een partij en past het profiel aan
    processGameResult(gameData) {
        this.profile.partijen_gespeeld++;

        // Simpele rating aanpassing
        if (gameData.result === 'win') {
            this.profile.elo_rating += 15;
            this.profile.tactische_score = Math.min(100, this.profile.tactische_score + 2);
        } else if (gameData.result === 'loss') {
            this.profile.elo_rating = Math.max(400, this.profile.elo_rating - 10);
            this.profile.tactische_score = Math.max(0, this.profile.tactische_score - 1);
        } else {
            this.profile.elo_rating += 2;
        }

        this.saveProfile();
    }

    // Geeft het aanbevolen AI niveau op basis van ELO rating
    getRecommendedAILevel() {
        const rating = this.profile.elo_rating;
        if (rating < 1000) return 1;
        if (rating < 1200) return 3;
        if (rating < 1400) return 5;
        if (rating < 1600) return 8;
        if (rating < 1800) return 12;
        if (rating < 2000) return 16;
        return 20; // Max niveau
    }
}

// Maak een globale instantie zodat de hele app erbij kan
window.playerProfile = new PlayerProfile();

