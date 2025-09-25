// ===== SPELER PROFIEL MANAGEMENT =====
class PlayerProfile {
    constructor() {
        this.profile = this.loadProfile();
        this.initializeProfile();
    }

    // Default profiel structuur
    getDefaultProfile() {
        return {
            naam: "Speler",
            elo_rating: 1200,
            partijen_gespeeld: 0,
            partijen_gewonnen: 0,
            partijen_verloren: 0,
            partijen_remise: 0,
            
            // Vaardigheden (0-100)
            tactische_score: 50,
            positionele_score: 40,
            eindspel_score: 30,
            opening_kennis: 35,
            tijdbeheer: 50,
            
            // Sterke en zwakke punten
            sterke_punten: [],
            zwakke_punten: ["Tijdbeheer", "Eindspel"],
            
            // Leergeschiedenis
            partij_geschiedenis: [],
            verbetering_areas: [],
            laatste_feedback: [],
            
            // Statistieken
            gemiddelde_zetten_per_partij: 0,
            gemiddelde_denktijd: 0,
            meest_gespeelde_openings: {},
            
            // Instellingen
            moeilijkheidsgraad: "auto", // auto, easy, medium, hard
            feedback_niveau: "uitgebreid", // basis, uitgebreid, expert
            
            // Tijdstempels
            created_at: new Date().toISOString(),
            last_played: null,
            last_updated: new Date().toISOString()
        };
    }

    // Profiel laden uit localStorage
    loadProfile() {
        try {
            const saved = localStorage.getItem('schaak_speler_profiel');
            return saved ? JSON.parse(saved) : this.getDefaultProfile();
        } catch (error) {
            console.error('Fout bij laden profiel:', error);
            return this.getDefaultProfile();
        }
    }

    // Profiel opslaan in localStorage
    saveProfile() {
        try {
            this.profile.last_updated = new Date().toISOString();
            localStorage.setItem('schaak_speler_profiel', JSON.stringify(this.profile));
            this.updateUI();
        } catch (error) {
            console.error('Fout bij opslaan profiel:', error);
        }
    }

    // Profiel initialiseren
    initializeProfile() {
        // Controleer of alle vereiste velden bestaan
        const defaultProfile = this.getDefaultProfile();
        let needsUpdate = false;

        for (const key in defaultProfile) {
            if (!(key in this.profile)) {
                this.profile[key] = defaultProfile[key];
                needsUpdate = true;
            }
        }

        if (needsUpdate) {
            this.saveProfile();
        }

        this.updateUI();
    }

    // UI bijwerken met profiel data
    updateUI() {
        // Naam en rating
        document.getElementById('player-name').textContent = this.profile.naam;
        document.getElementById('player-rating').textContent = this.profile.elo_rating;

        // Voortgang balken
        this.updateProgressBar('tactical-progress', this.profile.tactische_score);
        this.updateProgressBar('positional-progress', this.profile.positionele_score);
        this.updateProgressBar('endgame-progress', this.profile.eindspel_score);
    }

    updateProgressBar(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.width = `${Math.max(0, Math.min(100, value))}%`;
        }
    }

    // Partij resultaat verwerken
    processGameResult(gameData) {
        this.profile.partijen_gespeeld++;
        this.profile.last_played = new Date().toISOString();

        // Resultaat verwerken
        switch (gameData.result) {
            case 'win':
                this.profile.partijen_gewonnen++;
                this.adjustRating(+25);
                break;
            case 'loss':
                this.profile.partijen_verloren++;
                this.adjustRating(-20);
                break;
            case 'draw':
                this.profile.partijen_remise++;
                this.adjustRating(+5);
                break;
        }

        // Partij statistieken bijwerken
        this.updateGameStats(gameData);
        
        // Vaardigheden aanpassen gebaseerd op prestatie
        this.updateSkills(gameData);
        
        // Partij toevoegen aan geschiedenis
        this.addGameToHistory(gameData);

        this.saveProfile();
    }

    // Rating aanpassen
    adjustRating(change) {
        this.profile.elo_rating = Math.max(400, Math.min(3000, this.profile.elo_rating + change));
    }

    // Spelstatistieken bijwerken
    updateGameStats(gameData) {
        // Gemiddeld aantal zetten
        const totalMoves = this.profile.gemiddelde_zetten_per_partij * (this.profile.partijen_gespeeld - 1) + gameData.moveCount;
        this.profile.gemiddelde_zetten_per_partij = Math.round(totalMoves / this.profile.partijen_gespeeld);

        // Opening statistieken
        if (gameData.opening) {
            if (!this.profile.meest_gespeelde_openings[gameData.opening]) {
                this.profile.meest_gespeelde_openings[gameData.opening] = 0;
            }
            this.profile.meest_gespeelde_openings[gameData.opening]++;
        }
    }

    // Vaardigheden bijwerken gebaseerd op partij analyse
    updateSkills(gameData) {
        if (gameData.analysis) {
            const analysis = gameData.analysis;
            
            // Tactische score
            if (analysis.blunders < 2 && analysis.tactics_found > 2) {
                this.profile.tactische_score = Math.min(100, this.profile.tactische_score + 2);
            } else if (analysis.blunders > 3) {
                this.profile.tactische_score = Math.max(0, this.profile.tactische_score - 3);
            }

            // Positionele score
            if (analysis.positional_mistakes < 3) {
                this.profile.positionele_score = Math.min(100, this.profile.positionele_score + 1);
            }

            // Eindspel score (als partij eindspel bereikte)
            if (analysis.reached_endgame) {
                if (analysis.endgame_accuracy > 80) {
                    this.profile.eindspel_score = Math.min(100, this.profile.eindspel_score + 3);
                } else if (analysis.endgame_accuracy < 50) {
                    this.profile.eindspel_score = Math.max(0, this.profile.eindspel_score - 2);
                }
            }
        }
    }

    // Partij toevoegen aan geschiedenis
    addGameToHistory(gameData) {
        const gameRecord = {
            date: new Date().toISOString(),
            result: gameData.result,
            moveCount: gameData.moveCount,
            pgn: gameData.pgn,
            analysis: gameData.analysis,
            rating_before: this.profile.elo_rating,
            rating_after: this.profile.elo_rating // wordt later bijgewerkt
        };

        this.profile.partij_geschiedenis.push(gameRecord);
        
        // Bewaar alleen laatste 50 partijen
        if (this.profile.partij_geschiedenis.length > 50) {
            this.profile.partij_geschiedenis = this.profile.partij_geschiedenis.slice(-50);
        }
    }

    // Gepersonaliseerd AI niveau bepalen
    getRecommendedAILevel() {
        const rating = this.profile.elo_rating;
        
        if (rating < 1000) return 1;      // Zeer gemakkelijk
        if (rating < 1200) return 2;      // Gemakkelijk
        if (rating < 1400) return 3;      // Gemakkelijk-Medium
        if (rating < 1600) return 5;      // Medium
        if (rating < 1800) return 7;      // Medium-Moeilijk
        if (rating < 2000) return 10;     // Moeilijk
        if (rating < 2200) return 15;     // Zeer moeilijk
        return 20;                        // Expert
    }

    // Zwakke punten identificeren
    identifyWeaknesses() {
        const weaknesses = [];
        
        if (this.profile.tactische_score < 40) weaknesses.push("Tactiek");
        if (this.profile.positionele_score < 35) weaknesses.push("Positiespel");
        if (this.profile.eindspel_score < 30) weaknesses.push("Eindspel");
        if (this.profile.opening_kennis < 40) weaknesses.push("Openingskennis");
        
        // Analyseer recente partijen voor patronen
        const recentGames = this.profile.partij_geschiedenis.slice(-10);
        let blunderCount = 0;
        let timeProblems = 0;
        
        recentGames.forEach(game => {
            if (game.analysis) {
                if (game.analysis.blunders > 2) blunderCount++;
                if (game.analysis.time_pressure) timeProblems++;
            }
        });
        
        if (blunderCount > 3) weaknesses.push("Blunder preventie");
        if (timeProblems > 3) weaknesses.push("Tijdbeheer");
        
        this.profile.zwakke_punten = [...new Set(weaknesses)]; // Remove duplicates
        return weaknesses;
    }

    // Sterke punten identificeren
    identifyStrengths() {
        const strengths = [];
        
        if (this.profile.tactische_score > 70) strengths.push("Uitstekende tactiek");
        if (this.profile.positionele_score > 70) strengths.push("Sterk positiespel");
        if (this.profile.eindspel_score > 70) strengths.push("Goede eindspeltechniek");
        
        // Win percentage
        const totalGames = this.profile.partijen_gespeeld;
        if (totalGames > 10) {
            const winRate = (this.profile.partijen_gewonnen / totalGames) * 100;
            if (winRate > 60) strengths.push("Consistente prestaties");
        }
        
        this.profile.sterke_punten = [...new Set(strengths)];
        return strengths;
    }

    // Profiel resetten
    resetProfile() {
        if (confirm('Weet je zeker dat je je profiel wilt resetten? Dit kan niet ongedaan gemaakt worden.')) {
            this.profile = this.getDefaultProfile();
            this.saveProfile();
            alert('Profiel succesvol gereset!');
        }
    }

    // Profiel exporteren
    exportProfile() {
        const dataStr = JSON.stringify(this.profile, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `schaak-profiel-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    // Profiel importeren
    importProfile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedProfile = JSON.parse(e.target.result);
                
                // Validatie
                if (this.validateProfile(importedProfile)) {
                    this.profile = importedProfile;
                    this.saveProfile();
                    alert('Profiel succesvol geïmporteerd!');
                } else {
                    alert('Ongeldig profiel bestand.');
                }
            } catch (error) {
                alert('Fout bij importeren van profiel.');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }

    // Profiel valideren
    validateProfile(profile) {
        const required = ['naam', 'elo_rating', 'partijen_gespeeld'];
        return required.every(field => field in profile);
    }
}

// Globale instantie
window.playerProfile = new PlayerProfile();
