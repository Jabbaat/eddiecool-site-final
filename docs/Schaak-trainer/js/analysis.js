// ===== PARTIJ ANALYSE =====
class GameAnalysis {
    constructor() {
        // In een echte app zou je hier een web worker met een schaakengine initialiseren.
        // Voor nu simuleren we de analyse om het eenvoudig te houden.
    }

    // Analyseert een complete partij
    async analyze(gameHistory) {
        if (!gameHistory || gameHistory.length === 0) {
            return { blunders: 0, mistakes: 0, goodMoves: 0, accuracy: 0 };
        }

        let blunders = 0;
        let mistakes = 0;
        let goodMoves = 0;

        const game = new Chess();
        
        // Loop door de zetten van de speler
        for (let i = 0; i < gameHistory.length; i++) {
            const move = gameHistory[i];
            
            // Analyseer alleen de zetten van de speler (wit, dus de even zetten)
            if (i % 2 === 0) {
                const fenBeforeMove = game.fen();
                const playerMoveEvaluation = this.evaluateMove(fenBeforeMove, move);

                if (playerMoveEvaluation < -1.5) {
                    blunders++;
                } else if (playerMoveEvaluation < -0.7) {
                    mistakes++;
                } else {
                    goodMoves++;
                }
            }
            game.move(move);
        }

        const totalMoves = goodMoves + mistakes + blunders;
        const accuracy = totalMoves > 0 ? Math.round((goodMoves / totalMoves) * 100) : 0;

        return {
            blunders,
            mistakes,
            goodMoves,
            accuracy
        };
    }

    // Evalueert een enkele zet door deze te vergelijken met de "beste" zet
    evaluateMove(fen, playerMove) {
        const game = new Chess(fen);
        const bestAIMove = this.getBestMoveForAnalysis(game);
        
        const evalBefore = window.chessAI.evaluatePosition(fen);

        // Evaluatie na de zet van de speler
        game.move(playerMove);
        const evalAfterPlayerMove = -window.chessAI.evaluatePosition(game.fen()); // Negatief, want het is de beurt van de tegenstander
        game.undo();

        // Evaluatie na de "beste" zet
        game.move(bestAIMove);
        const evalAfterBestMove = -window.chessAI.evaluatePosition(game.fen());
        game.undo();

        // Het verschil in evaluatie is hoe "slecht" de zet van de speler was
        return evalAfterPlayerMove - evalAfterBestMove;
    }

    // Krijgt de beste zet (volgens onze simpele AI) voor een positie
    getBestMoveForAnalysis(gameInstance) {
        const moves = gameInstance.moves({ verbose: true });
        const goodMoves = window.chessAI.findGoodMoves(moves, gameInstance);
        return goodMoves.length > 0 ? goodMoves[0].san : moves[0].san;
    }
}

// Maak een globale instantie
window.gameAnalysis = new GameAnalysis();


