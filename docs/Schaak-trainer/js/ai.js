// ===== AI SCHAAK TEGENSTANDER =====
class ChessAI {
    constructor() {
        this.stockfish = null;
        this.isThinking = false;
        this.currentLevel = 5;
        this.initializeStockfish();
    }

    // Stockfish initialiseren
    async initializeStockfish() {
        try {
            // Voor productie gebruik je een lokale Stockfish instantie
            // Dit is een vereenvoudigde implementatie
            this.stockfish = {
                postMessage: (cmd) => {
                    console.log('Stockfish command:', cmd);
                    // Simuleer Stockfish response
                    setTimeout(() => this.handleStockfishMessage(cmd), 1000);
                }
            };
            
            console.log('AI geïnitialiseerd');
        } catch (error) {
            console.error('Fout bij initialiseren AI:', error);
            // Fallback naar eenvoudige AI
            this.useSimpleAI = true;
        }
    }

    // Stockfish berichten verwerken
    handleStockfishMessage(command) {
        // Simuleer Stockfish response voor demo
        if (command.includes('position')) {
            // Position command
        } else if (command.includes('go')) {
            // Genereer move
            this.generateMove();
        }
    }

    // Niveau instellen gebaseerd op speler rating
    setLevel(playerRating) {
        let level;
        
        if (playerRating < 1000) level = 1;
        else if (playerRating < 1200) level = 2;
        else if (playerRating < 1400) level = 3;
        else if (playerRating < 1600) level = 5;
        else if (playerRating < 1800) level = 7;
        else if (playerRating < 2000) level = 10;
        else if (playerRating < 2200) level = 15;
        else level = 20;

        this.currentLevel = level;
        
        if (this.stockfish) {
            this.stockfish.postMessage(`setoption name Skill Level value ${level}`);
        }
        
        // UI bijwerken
        this.updateLevelDisplay(level);
    }

    updateLevelDisplay(level) {
        const levelNames = {
            1: "Zeer Gemakkelijk",
            2: "Gemakkelijk", 
            3: "Beginner",
            5: "Amateur",
            7: "Gevorderd",
            10: "Sterk",
            15: "Expert",
            20: "Meester"
        };
        
        const levelName = levelNames[level] || "Aangepast";
        document.getElementById('ai-level').textContent = levelName;
    }

    // Beste zet berekenen
    async getBestMove(fen, timeLimit = 1000) {
        if (this.isThinking) {
            return null;
        }

        this.isThinking = true;
        
        try {
            if (this.useSimpleAI) {
                return await this.getSimpleAIMove(fen);
            } else {
                return await this.getStockfishMove(fen, timeLimit);
            }
        } finally {
            this.isThinking = false;
        }
    }

    // Stockfish zet ophalen
    async getStockfishMove(fen, timeLimit) {
        return new Promise((resolve) => {
            this.stockfish.postMessage(`position fen ${fen}`);
            this.stockfish.postMessage(`go movetime ${timeLimit}`);
            
            // Voor demo: simuleer random maar redelijke zet
            setTimeout(() => {
                const moves = this.getLegalMoves(fen);
                const bestMove = moves[Math.floor(Math.random() * Math.min(3, moves.length))];
                resolve(bestMove);
            }, timeLimit);
        });
    }

    // Eenvoudige AI voor fallback
    async getSimpleAIMove(fen) {
        const game = new Chess(fen);
        const moves = game.moves({ verbose: true });
        
        if (moves.length === 0) return null;

        // Eenvoudige strategie: prioriteer captures, checks, en ontwikkeling
        let bestMoves = [];
        
        moves.forEach(move => {
            let score = Math.random() * 10; // Base random score
            
            // Prioriteer slagen
            if (move.captured) {
                const pieceValues = {
                    'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
                };
                score += pieceValues[move.captured] * 10;
            }
            
            // Prioriteer schaak
            game.move(move);
            if (game.in_check()) {
                score += 5;
            }
            game.undo();
            
            // Ontwikkelingsbonus voor ridders en lopers
            if (['n', 'b'].includes(move.piece) && ['b1', 'g1', 'b8', 'g8'].includes(move.from)) {
                score += 3;
            }
            
            bestMoves.push({ move: move.san, score: score });
        });

        // Sorteer op score en kies uit top 3
        bestMoves.sort((a, b) => b.score - a.score);
        const topMoves = bestMoves.slice(0, Math.min(3, bestMoves.length));
        const selectedMove = topMoves[Math.floor(Math.random() * topMoves.length)];
        
        return selectedMove.move;
    }

    // Legale zetten ophalen (voor demo)
    getLegalMoves(fen) {
        const game = new Chess(fen);
        return game.moves();
    }

    // Positie evaluatie
    evaluatePosition(fen) {
        const game = new Chess(fen);
        
        // Eenvoudige materiaal evaluatie
        let whiteScore = 0;
        let blackScore = 0;
        
        const pieceValues = {
            'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
        };
        
        const board = game.board();
        board.forEach(row => {
            row.forEach(square => {
                if (square) {
                    const value = pieceValues[square.type];
                    if (square.color === 'w') {
                        whiteScore += value;
                    } else {
                        blackScore += value;
                    }
                }
            });
        });
        
        // Positie factoren
        let evaluation = whiteScore - blackScore;
        
        // Schaak/schaakmat bonus
        if (game.in_checkmate()) {
            evaluation = game.turn() === 'w' ? -1000 : 1000;
        } else if (game.in_check()) {
            evaluation += game.turn() === 'w' ? -0.5 : 0.5;
        }
        
        // Mobiliteit (aantal mogelijke zetten)
        evaluation += game.moves().length * 0.1 * (game.turn() === 'w' ? 1 : -1);
        
        return evaluation;
    }

    // Hint voor speler
    async getHint(fen) {
        const bestMove = await this.getBestMove(fen, 500);
        if (bestMove) {
            return {
                move: bestMove,
                explanation: this.explainMove(fen, bestMove)
            };
        }
        return null;
    }

    // Zet uitleggen
    explainMove(fen, move) {
        const game = new Chess(fen);
        const moveObj = game.moves({ verbose: true }).find(m => m.san === move);
        
        if (!moveObj) return "Onbekende zet";
        
        let explanation = [];
        
        if (moveObj.captured) {
            explanation.push(`Slaat ${this.getPieceName(moveObj.captured)}`);
        }
        
        game.move(move);
        if (game.in_check()) {
            explanation.push("Geeft schaak");
        }
        
        if (game.in_checkmate()) {
            explanation.push("Schaakmat!");
        }
        
        game.undo();
        
        // Strategische uitleg
        if (['n', 'b'].includes(moveObj.piece) && moveObj.from.includes('1') || moveObj.from.includes('8')) {
            explanation.push("Ontwikkelt stuk");
        }
        
        if (moveObj.san.includes('O-O')) {
            explanation.push("Rokade voor koning veiligheid");
        }
        
        return explanation.length > 0 ? explanation.join(', ') : "Goede ontwikkelingszet";
    }

    getPieceName(piece) {
        const names = {
            'p': 'pion', 'n': 'paard', 'b': 'loper', 
            'r': 'toren', 'q': 'dame', 'k': 'koning'
        };
        return names[piece] || piece;
    }

    // AI niveau aanpassen tijdens spel
    adjustDifficulty(playerPerformance) {
        if (playerPerformance === 'too_easy') {
            this.currentLevel = Math.min(20, this.currentLevel + 2);
        } else if (playerPerformance === 'too_hard') {
            this.currentLevel = Math.max(1, this.currentLevel - 1);
        }
        
        this.setLevel(this.currentLevel);
    }

    // Opening boek
    getOpeningMove(fen) {
        const openingBook = {
            // Startpositie
            'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e4', 'd4', 'Nf3', 'c4'],
            
            // Na 1.e4
            'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['e5', 'c5', 'e6', 'c6'],
            
            // Na 1.d4
            'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['d5', 'Nf6', 'f5', 'e6']
        };
        
        const moves = openingBook[fen];
        if (moves) {
            return moves[Math.floor(Math.random() * moves.length)];
        }
        
        return null;
    }
}

// Globale AI instantie
window.chessAI = new ChessAI();
