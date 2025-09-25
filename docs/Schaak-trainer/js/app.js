// ===== HOOFD APPLICATIE LOGICA =====
document.addEventListener('DOMContentLoaded', () => {
    const ChessApp = {
        board: null,
        game: new Chess(),
        playerColor: 'w',

        init() {
            this.setupBoard();
            this.setupEventListeners();
            this.startNewGame();
        },

        // Schaakbord initialiseren
        setupBoard() {
            const config = {
                draggable: true,
                position: 'start',
                onDragStart: this.onDragStart.bind(this),
                onDrop: this.onDrop.bind(this),
                onSnapEnd: this.onSnapEnd.bind(this),
                pieceTheme: 'assets/pieces/{piece}.png'
            };
            this.board = Chessboard('chessboard', config);
            $(window).resize(this.board.resize);
        },

        // Event listeners voor knoppen instellen
        setupEventListeners() {
            $('#new-game-btn').on('click', this.startNewGame.bind(this));
            $('#undo-btn').on('click', this.undoMove.bind(this));
            $('#hint-btn').on('click', this.showHint.bind(this));
            $('.close').on('click', FeedbackGenerator.closeFeedback);
            $('#continue-btn').on('click', () => {
                FeedbackGenerator.closeFeedback();
                this.startNewGame();
            });
        },

        // Start een nieuwe partij
        startNewGame() {
            this.game.reset();
            this.board.position(this.game.fen());
            window.chessAI.setLevel(window.playerProfile.profile.elo_rating);
            this.updateGameInfo();
        },

        // Bij het oppakken van een stuk
        onDragStart(source, piece) {
            // Niet verplaatsen als het spel voorbij is of als het niet jouw beurt is
            if (this.game.game_over() || this.game.turn() !== this.playerColor) {
                return false;
            }
            // Alleen stukken van de juiste kleur oppakken
            if (piece.search(new RegExp(`^${this.playerColor}`)) === -1) {
                return false;
            }
        },

        // Bij het loslaten van een stuk
        onDrop(source, target) {
            const move = this.game.move({
                from: source,
                to: target,
                promotion: 'q' // Altijd promoveren naar dame voor eenvoud
            });

            // Ongeldige zet
            if (move === null) return 'snapback';

            this.updateGameInfo();
            
            // Wacht even en laat de AI een zet doen
            window.setTimeout(this.makeAIMove.bind(this), 250);
        },

        // Na het animeren van een zet
        onSnapEnd() {
            this.board.position(this.game.fen());
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
            this.game.undo(); // Speler zet
            this.game.undo(); // AI zet
            this.board.position(this.game.fen());
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
            const evalPercent = 50 + (evaluation * 10); // Simpele conversie naar percentage
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
            
            // Profiel bijwerken
            window.playerProfile.processGameResult(gameData);
            
            // Feedback tonen
            const feedback = new FeedbackGenerator(analysisResult, window.playerProfile.profile);
            feedback.showFeedback();
        }
    };

    ChessApp.init();
});
