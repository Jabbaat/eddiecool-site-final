// ===== SPEL ANALYSE MODULE =====
class GameAnalysis {
    constructor(gameHistory) {
        this.history = gameHistory;
        this.analysisResult = {
            blunders: 0,
            mistakes: 0,
            inaccuracies: 0,
            good_moves: 0,
            brilliant_moves: 0,
            key_moments: [],
            opening: "Onbekend",
            accuracy: { white: 100, black: 100 },
            tactics_found: 0,
            positional_mistakes: 0,
            reached_endgame: false,
            endgame_accuracy: 0,
            time_pressure: false,
        };
    }

    // Voert de volledige analyse uit
    async analyze() {
        if (!this.history || this.history.length === 0) {
            return this.analysisResult;
        }

        const tempGame = new Chess();
        let prevEval = 0;

        for (let i = 0; i < this.history.length; i++) {
            const move = this.history[i];
            const fenBefore = tempGame.fen();
            
            // Zet uitvoeren om de nieuwe positie te krijgen
            tempGame.move(move.san);
            const fenAfter = tempGame.fen();

            // Evalueer de positie voor en na de zet
            const currentEval = window.chessAI.evaluatePosition(fenAfter);
            const evalChange = currentEval - prevEval;

            // Bepaal de zetkwaliteit
            this.classifyMove(move, prevEval, currentEval, tempGame.turn());

            prevEval = currentEval;
        }
        
        // Bepaal de openingsnaam (vereenvoudigd)
        this.identifyOpening(tempGame.pgn());

        // Controleer of het eindspel is bereikt
        this.analysisResult.reached_endgame = this.isEndgame(tempGame);

        console.log("Analyse voltooid:", this.analysisResult);
        return this.analysisResult;
    }

    // Classificeert een zet op basis van evaluatieverandering
    classifyMove(move, evalBefore, evalAfter, turn) {
        // De evaluatieverandering is vanuit het perspectief van de speler die de zet deed.
        // Als wit aan de beurt was, is een positieve verandering goed voor wit.
        // Als zwart aan de beurt was, is een negatieve verandering goed voor zwart.
        const delta = (turn === 'b') ? (evalAfter - evalBefore) : -(evalAfter - evalBefore);

        if (delta > 2.0) {
            this.analysisResult.blunders++;
            move.classification = 'blunder';
            this.analysisResult.key_moments.push({ move: move.san, type: 'Blunder', description: 'Groot nadeel verkregen.' });
        } else if (delta > 0.8) {
            this.analysisResult.mistakes++;
            move.classification = 'mistake';
        } else if (delta > 0.4) {
            this.analysisResult.inaccuracies++;
            move.classification = 'inaccuracy';
        } else if (delta < -0.5) {
            this.analysisResult.good_moves++;
            move.classification = 'good';
        } else {
             move.classification = 'normal';
        }
    }

    // Identificeert de opening (simpele versie)
    identifyOpening(pgn) {
        if (pgn.startsWith('1. e4 e5 2. Nf3 Nc6 3. Bb5')) {
            this.analysisResult.opening = 'Ruy Lopez';
        } else if (pgn.startsWith('1. e4 c5')) {
            this.analysisResult.opening = 'Sicilian Defense';
        } else if (pgn.startsWith('1. d4 d5 2. c4')) {
            this.analysisResult.opening = "Queen's Gambit";
        }
    }

    // Bepaalt of de positie een eindspel is
    isEndgame(game) {
        // Een simpele definitie: minder dan 10 stukken op het bord (exclusief koningen en pionnen)
        const board = game.board();
        let pieceCount = 0;
        board.forEach(row => {
            row.forEach(square => {
                if (square && square.type !== 'p' && square.type !== 'k') {
                    pieceCount++;
                }
            });
        });
        return pieceCount < 10;
    }
}
