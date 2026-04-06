        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        let deck = [];

        function initGame() {
            deck = [];
            document.getElementById('tableau').querySelectorAll('.slot').forEach(s => s.innerHTML = '');
            document.getElementById('waste').innerHTML = '';

            // 1. Create Deck
            for (let suit of suits) {
                for (let val of values) {
                    deck.push({ val, suit, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' });
                }
            }

            // 2. Shuffle
            deck.sort(() => Math.random() - 0.5);

            // 3. Deal to Tableau
            const slots = document.getElementById('tableau').querySelectorAll('.slot');
            slots.forEach((slot, index) => {
                const cardData = deck.pop();
                const cardDiv = document.createElement('div');
                cardDiv.className = `card ${cardData.color}`;
                cardDiv.innerHTML = `${cardData.val}${cardData.suit}`;
                slot.appendChild(cardDiv);
            });

            // 4. Show Deck Back
            document.getElementById('deck').innerHTML = '<div class="card back"></div>';
        }

        function dealCard() {
            if (deck.length > 0) {
                const cardData = deck.pop();
                const waste = document.getElementById('waste');
                waste.innerHTML = `<div class="card ${cardData.color}">${cardData.val}${cardData.suit}</div>`;
                if (deck.length === 0) document.getElementById('deck').innerHTML = '';
            } else {
                alert("Deck Empty! Restart to play again.");
            }
        }

        // Start the game on load
        initGame();
