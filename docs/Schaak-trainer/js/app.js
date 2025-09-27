// ===== HOOFD APPLICATIE LOGICA =====
document.addEventListener('DOMContentLoaded', () => {
    const ChessApp = {
        board: null,
        game: new Chess(),
        playerColor: 'w',
        selectedSquare: null,
        highlightedSquares: [],
        gameHistory: [],

        init() {
            this.setupBoard();
            this.setupEventListeners();
            this.startNewGame();
        },

        // Schaakbord initialiseren met chessboard.js
        setupBoard() {
            const config = {
                draggable: false, // We regelen de logica zelf
                position: 'start',
                pieceTheme: 'assets/pieces/{piece}.png',
                onSquareClick: this.onSquareClick.bind(this)
            };
            this.board = Chessboard('chessboard', config);
            $(window).resize(this.board.resize);
        },

        // Event listeners voor knoppen instellen
        setupEventListeners() {
            $('#new-game-btn').on('click', this.startNewGame.bind(this));
            $('#hint-btn').on('click', this.showHint.bind(this));
            $('#undo-btn').on('click', this.undoMove.bind(this));
            $('.close, #continue-btn').on('click', () => $('#feedback-modal').fadeOut(300));
        },

        // Start een nieuw spel
        startNewGame() {
            this.game.reset();
            this.board.position(this.game.fen());
            this.updateGameInfo();
            window.playerProfile.updateUI();
            window.chessAI.setLevel(window.playerProfile.profile.elo_rating);
            this.gameHistory = [];
            $('#feedback-modal').hide();
        },

        // Verwerkt een klik op een veld
        onSquareClick(square, piece) {
            // Check of het de beurt van de speler is
            if (this.game.turn() !== this.playerColor) return;

            // Als er al een stuk is geselecteerd
            if (this.selectedSquare) {
                const move = {
                    from: this.selectedSquare,
                    to: square,
                    promotion: 'q' // Altijd promoveren naar dame voor eenvoud
                };

                const result = this.game.move(move);

                if (result) {
                    this.board.position(this.game.fen());
                    this.updateGameInfo();
                    this.gameHistory.push(result.san);
                    this.clearHighlights();
                    this.highlightLastMove(move.from, move.to);
                    
                    // Laat de AI een zet doen na een korte pauze
                    setTimeout(() => this.makeAIMove(), 250);
                } else {
                    // Ongeldige zet, deselecteer of selecteer een ander stuk
                    this.clearHighlights();
                    if (piece && piece.startsWith(this.playerColor)) {
                        this.selectPiece(square);
                    }
                }
            } else if (piece && piece.startsWith(this.playerColor)) {
                // Selecteer een stuk als er nog niets is geselecteerd
                this.selectPiece(square);
            }
        },

        // Selecteert een stuk en toont mogelijke zetten
        selectPiece(square) {
            this.clearHighlights();
            this.selectedSquare = square;
            
            const moves = this.game.moves({
                square: square,
                verbose: true
            });

            if (moves.length === 0) {
                this.selectedSquare = null;
                return;
            }

            // Highlight het geselecteerde veld en de mogelijke doelvelden
            this.highlightSquare(square, 'selected');
            moves.forEach(move => {
                this.highlightSquare(move.to, 'possible');
            });
        },

        // AI doet een zet
        async makeAIMove() {
            if (this.game.game_over()) {
                this.endGame('draw'); // Of andere conditie
                return;
            }
            const bestMove = await window.chessAI.getBestMove(this.game.fen());
            if (bestMove) {
                const moveResult = this.game.move(bestMove);
                this.board.position(this.game.fen());
                this.updateGameInfo();
                this.gameHistory.push(moveResult.san);
                this.highlightLastMove(moveResult.from, moveResult.to);
            }
        },

        // Werkt de game info in de UI bij
        updateGameInfo() {
            const moveCount = Math.ceil(this.game.history().length / 2);
            $('#move-count').text(moveCount);

            let status = 'Aan de beurt';
            if (this.game.in_checkmate()) {
                status = 'Schaakmat!';
                this.endGame(this.game.turn() === 'w' ? 'loss' : 'win');
            } else if (this.game.in_draw()) {
                status = 'Remise';
                this.endGame('draw');
            } else if (this.game.in_check()) {
                status = 'Schaak!';
            }
            $('#game-status').text(status);
            
            // Evaluatiebalk bijwerken
            const evaluation = window.chessAI.evaluatePosition(this.game.fen());
            const evalPercentage = 50 + (evaluation * 10); // Simpele conversie
            $('#eval-indicator').css('width', `${Math.max(0, Math.min(100, evalPercentage))}%`);
            $('#eval-score').text(evaluation.toFixed(1));
        },

        // Toont een hint
        async showHint() {
            const hint = await window.chessAI.getHint(this.game.fen());
            if (hint) {
                $('#best-move').text(`Hint: ${hint.move}`).fadeIn().delay(2000).fadeOut();
            }
        },
        
        // Maakt de laatste zet ongedaan
        undoMove() {
            this.game.undo(); // Speler zet ongedaan
            this.game.undo(); // AI zet ongedaan
            this.board.position(this.game.fen());
            this.updateGameInfo();
            this.gameHistory.pop();
            this.gameHistory.pop();
        },
        
        // Einde van het spel: analyseer en toon feedback
        async endGame(result) {
            const analysis = await window.gameAnalysis.analyze(this.gameHistory);
            window.playerProfile.processGameResult({
                result: result,
                moveCount: this.game.history().length,
                analysis: analysis
            });
            window.feedbackGenerator.generateFeedback(analysis, result);
            window.feedbackGenerator.showFeedbackModal();
        },

        // Visuele functies
        highlightSquare(square, type) {
            const $square = $(`#chessboard .square-${square}`);
            $square.addClass(`highlight-${type}`);
            this.highlightedSquares.push($square);
        },

        clearHighlights() {
            this.highlightedSquares.forEach($square => $square.removeClass('highlight-selected highlight-possible'));
            this.selectedSquare = null;
            this.highlightedSquares = [];
        },

        highlightLastMove(from, to) {
            $('.highlight-last').removeClass('highlight-last');
            $(`#chessboard .square-${from}`).addClass('highlight-last');
            $(`#chessboard .square-${to}`).addClass('highlight-last');
        }
    };

    ChessApp.init();
});


