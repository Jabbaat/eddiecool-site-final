// ===== AI SCHAAK TEGENSTANDER =====
class ChessAI {
    constructor() {
        this.skillLevel = 5; // Startniveau (1-20)
        this.useSimpleAI = true; // Gebruik een simpele, snelle AI zonder engine
    }

    // Past het niveau van de AI aan op basis van spelersprofiel
    setLevel(playerRating) {
        const recommendedLevel = window.playerProfile.getRecommendedAILevel();
        this.skillLevel = recommendedLevel;
        
        const levelNames = {1: "Beginner", 3: "Amateur", 5: "Clubspeler", 8: "Gevorderd", 12: "Expert", 16: "Meester", 20: "Grootmeester" };
        let levelName = "Aangepast";
        for (const lvl in levelNames) {
            if (recommendedLevel >= lvl) levelName = levelNames[lvl];
        }
        $('#ai-level').text(levelName);
    }

    // Berekent de beste zet voor de huidige positie
    async getBestMove(fen) {
        // Voor dit voorbeeld gebruiken we een simpele random move generator.
        // Een echte implementatie zou een connectie met Stockfish.js of een andere engine hebben.
        return new Promise(resolve => {
            setTimeout(() => {
                const game = new Chess(fen);
                const moves = game.moves({ verbose: true });
                if (moves.length > 0) {
                    // Simuleer beter spelen op hogere niveaus door minder random te kiezen
                    const bestMoves = this.findGoodMoves(moves, game);
                    const choice = bestMoves[Math.floor(Math.random() * bestMoves.length)];
                    resolve(choice.san);
                } else {
                    resolve(null);
                }
            }, 200 + (20 * this.skillLevel)); // AI "denkt" langer op hogere niveaus
        });
    }
    
    // Eenvoudige logica om "betere" zetten te vinden
    findGoodMoves(moves, game) {
        let scoredMoves = moves.map(move => {
            let score = 0;
            if (move.flags.includes('c')) score += 10; // Slaan is goed
            if (move.flags.includes('p')) score += 8;  // Promotie is geweldig
            
            // Zet proberen en kijken of het schaak geeft
            game.move(move.san);
            if (game.in_check()) score += 5;
            game.undo();

            return { san: move.san, score: score };
        });

        scoredMoves.sort((a, b) => b.score - a.score);

        // Op lagere niveaus, overweeg meer (ook slechtere) zetten
        const topMovesToConsider = Math.max(1, Math.floor(moves.length * (1 - this.skillLevel / 25)));
        return scoredMoves.slice(0, topMovesToConsider);
    }

    // Evalueert de positie (simpel, op basis van materiaal)
    evaluatePosition(fen) {
        const game = new Chess(fen);
        if (game.game_over()) return 0;

        let material = 0;
        const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9 };
        
        game.board().forEach(row => {
            row.forEach(piece => {
                if (piece) {
                    const value = pieceValues[piece.type];
                    material += (piece.color === 'w' ? value : -value);
                }
            });
        });
        return material;
    }

    // Geeft een hint voor de speler
    async getHint(fen) {
        const game = new Chess(fen);
        const moves = game.moves({ verbose: true });
        if (moves.length === 0) return null;

        const bestMoves = this.findGoodMoves(moves, game);
        const hintMove = bestMoves[0].san;
        return {
            move: hintMove,
            explanation: "Dit is een sterke zet."
        };
    }
}

// Maak een globale instantie
window.chessAI = new ChessAI();

