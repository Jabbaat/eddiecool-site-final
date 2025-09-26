// ===== HOOFD APPLICATIE LOGICA (met Click-to-Move) =====
document.addEventListener('DOMContentLoaded', () => {
    const ChessApp = {
        board: null,
        game: new Chess(),
        playerColor: 'w',
        selectedSquare: null,

        init() {
            this.setupBoard();
            this.setupEventListeners();
            this.startNewGame();
        },

        // Schaakbord initialiseren
        setupBoard() {
            const config = {
                // Drag and drop is nu definitief uitgeschakeld
                draggable: false, 
                position: 'start',
                pieceTheme: 'assets/pieces/{piece}.png'
            };
            this.board = Chessboard('chessboard', config);
            $(window).resize(this.board.resize);
        },

        // Event listeners instellen
        setupEventListeners() {
            // Knoppen
            $('#new-game-btn').on('click', this.startNewGame.bind(this));
            $('#undo-btn').on('click', this.undoMove.bind(this));
            $('#hint-btn').on('click', this.showHint.bind(this));
            
            // Modal
            $('.close').on('click', FeedbackGenerator.closeFeedback);
            $('#continue-btn').on('click', () => {
                FeedbackGenerator.closeFeedback();
                this.startNewGame();
            });

            // Click handler voor de velden op het bord
            $('#chessboard').on('click', '.square-55d63', this.handleSquareClick.bind(this));
        },
        
        // Verwerkt een klik op een veld
        handleSquareClick(e) {
            if (this.game.game_over()) return;

            const square = $(e.currentTarget).data('square');

            // Als er al een stuk geselecteerd is
            if (this.selectedSquare) {
                const move = {
                    from: this.selectedSquare,
                    to: square,
                    promotion: 'q' // Altijd promoveren naar dame voor eenvoud
                };

                const result = this.game.move(move);

                // Als de zet geldig is
                if (result) {
                    this.board.position(this.game.fen());
                    this.clearHighlights();
                    this.selectedSquare = null;
                    this.updateGameInfo();
                    window.setTimeout(this.makeAIMove.bind(this), 250);
                }
                // Als de zet ongeldig is, deselecteer of selecteer een ander stuk
                else {
                    this.clearHighlights();
                    // Als er op een ander eigen stuk is geklikt, selecteer dat
                    if (this.isPlayerPiece(square)) {
                        this.selectSquare(square);
                    } else {
                        this.selectedSquare = null;
                    }
                }
            } 
            // Als er nog geen stuk geselecteerd is
            else {
                if (this.isPlayerPiece(square)) {
                    this.selectSquare(square);
                }
            }
        },

        isPlayerPiece(square) {
            const piece = this.game.get(square);
            return piece && piece.color === this.playerColor && piece.color === this.game.turn();
        },

        // Selecteert een veld en toont legale zetten
        selectSquare(square) {
            this.selectedSquare = square;
            this.highlightLegalMoves(square);
        },

        // Markeer het geselecteerde veld en de mogelijke zetten
        highlightLegalMoves(square) {
            this.clearHighlights();
            const moves = this.game.moves({
                square: square,
                verbose: true
            });

            if (moves.length === 0) return;

            // Markeer geselecteerd veld
            $(`.square-${square}`).addClass('highlight-selected');

            // Markeer mogelijke zetten
            moves.forEach(move => {
                $(`.square-${move.to}`).addClass('highlight-legal');
            });
        },
        
        // Verwijder alle markeringen
        clearHighlights() {
            $('#chessboard .square-55d63').removeClass('highlight-selected highlight-legal');
        },

        // Start een nieuwe partij
        startNewGame() {
            this.game.reset();
            this.board.position(this.game.fen());
            this.clearHighlights();
            this.selectedSquare = null;
            window.chessAI.setLevel(window.playerProfile.profile.elo_rating);
            this.updateGameInfo();
        },

        // AI een zet laten doen
        async makeAIMove() {
            if (this.game.game_over()) return;
            const move = await window.chessAI.getBestMove(this.game.fen());
            if (move) {
                this.game.move(move);
                this.board.position(this.game.fen());
                this.updateGameInfo();
            }
        },
        
        // Een zet ongedaan maken
        undoMove() {
            this.game.undo(); // AI zet
            this.game.undo(); // Speler zet
            this.board.position(this.game.fen());
            this.clearHighlights();
            this.selectedSquare = null;
            this.updateGameInfo();
        },

        // Een hint tonen
        async showHint() {
            const hint = await window.chessAI.getHint(this.game.fen());
            if (hint) {
                $('#best-move').html(`<strong>Hint:</strong> ${hint.move} - <em>${hint.explanation}</em>`);
            }
        },

        // UI-elementen bijwerken
        updateGameInfo() {
            const statusEl = $('#game-status');
            let statusText = this.game.turn() === 'w' ? 'Wit is aan zet' : 'Zwart is aan zet';

            if (this.game.in_checkmate()) {
                statusText = `Schaakmat! ${this.game.turn() === 'w' ? 'Zwart' : 'Wit'} wint.`;
                this.endGame('loss'); // Aanname: speler is altijd wit
            } else if (this.game.in_draw()) {
                statusText = 'Remise!';
                this.endGame('draw');
            } else if (this.game.in_check()) {
                statusText += ', schaak!';
            }

            statusEl.text(statusText);
            $('#pgn-moves').html(this.game.pgn({ max_width: 5, newline_char: '<br>' }));
            $('#move-count').text(this.game.history().length);
            
            // Live evaluatie
            const evaluation = window.chessAI.evaluatePosition(this.game.fen());
            $('#eval-score').text(evaluation.toFixed(1));
            const evalPercent = 50 + (evaluation * 10);
            $('#eval-indicator').css('width', `${Math.max(0, Math.min(100, evalPercent))}%`);
        },
        
        // Partij beëindigen en analyse starten
        async endGame(result) {
            console.log('Partij beëindigd. Resultaat:', result);
            const analysis = new GameAnalysis(this.game.history({ verbose: true }));
            const analysisResult = await analysis.analyze();
            const gameData = {
                result: result,
                moveCount: this.game.history().length,
                pgn: this.game.pgn(),
                analysis: analysisResult
            };
            window.playerProfile.processGameResult(gameData);
            const feedback = new FeedbackGenerator(analysisResult, window.playerProfile.profile);
            feedback.showFeedback();
        }
    };

    ChessApp.init();
});