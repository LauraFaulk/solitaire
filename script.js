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
        
        // ADDED: Attach the drag ability
        addDragEvents(cardDiv);
        
        slot.appendChild(cardDiv);
    });

    // 4. Show Deck Back
    document.getElementById('deck').innerHTML = '<div class="card back"></div>';
}

function dealCard() {
    if (deck.length > 0) {
        const cardData = deck.pop();
        const waste = document.getElementById('waste');
        const cardDiv = document.createElement('div');
        cardDiv.className = `card ${cardData.color}`;
        cardDiv.innerHTML = `${cardData.val}${cardData.suit}`;
        
        // ADDED: Attach the drag ability to the dealt card
        addDragEvents(cardDiv);
        
        waste.innerHTML = ''; // Clear previous waste card
        waste.appendChild(cardDiv);

        if (deck.length === 0) document.getElementById('deck').innerHTML = '';
    } else {
        alert("Deck Empty! Restart to play again.");
    }
}

// --- THE DRAG LOGIC (NEW SECTION) ---
function addDragEvents(card) {
    card.onmousedown = function(event) {
        // Prevent clicking from doing other things
        event.preventDefault();

        // 1. Prepare card for floating
        card.style.position = 'fixed';
        card.style.zIndex = 1000;
        
        // Center the card on the cursor immediately
        function moveAt(pageX, pageY) {
            card.style.left = pageX - 40 + 'px';
            card.style.top = pageY - 60 + 'px';
        }

        moveAt(event.pageX, event.pageY);

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        // 2. Move the card as the mouse moves
        document.addEventListener('mousemove', onMouseMove);

        // 3. Drop the card
        document.onmouseup = function() {
            document.removeEventListener('mousemove', onMouseMove);
            document.onmouseup = null;
            window.highestZ = (window.highestZ || 10) + 1;
	    card.style.zIndex = window.highestZ;
	    checkDropLocation(card); 
        };
    };

    // Kill the browser's default drag-and-drop ghosting
    card.ondragstart = function() { return false; };
}

let score = 0;

function checkDropLocation(card) {
    // 1. Simple Scoring: Every time a card is moved to a new slot, +10 points
    score += 10;
    document.getElementById('score').innerText = score;

    // 2. The "Auto-Refill" Logic
    // If a Tableau slot is now empty, we should ideally pull a card from the deck.
    // For a basic version, let's just log it:
    console.log("Card moved! Checking for empty slots...");
    
    // 3. Snap to Grid (Optional but recommended)
    // You can add code here to detect if the card is 'near' a slot 
    // and make it 'snap' into place perfectly.
}
// Start the game on load
initGame();
