// Add this helper at the top of script.js to convert 'A', 'J', 'Q', 'K' to numbers
const valueMap = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };

function createCardElement(cardData) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${cardData.color}`;
    cardDiv.innerHTML = `${cardData.val}${cardData.suit}`;
    
    // THE SECRET SAUCE: Store data for the rules engine
    cardDiv.dataset.value = valueMap[cardData.val];
    cardDiv.dataset.color = cardData.color; // 'red' or 'black'
    
    addDragEvents(cardDiv);
    return cardDiv;
}

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
    const waste = document.getElementById('waste');
    const deckSlot = document.getElementById('deck');
    
    if (deck.length > 0) {
        const cardData = deck.pop();
        const cardDiv = createCardElement(cardData);

	waste.innerHTML = '';
	waste.appendChild(cardDiv);

        cardDiv.className = `card ${cardData.color}`;
        cardDiv.innerHTML = `${cardData.val}${cardData.suit}`;
        
        // ADDED: Attach the drag ability to the dealt card
        addDragEvents(cardDiv);
        
    } else {
        // DECK RESET: Move waste back to deck
        const wasteCards = waste.querySelectorAll('.card');
        if (wasteCards.length === 0 && deck.length === 0) {
            alert("No more moves possible!");
            return;
        }
        // Logic to refill deck array from a 'waste' array would go here
        location.reload(); // Simple version: Restart the game
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

// --- GLOBAL GAME STATE ---
let score = 0;

function addDragEvents(card) {
    card.onmousedown = function(event) {
        event.preventDefault();
        card.style.position = 'fixed';
        card.style.zIndex = 1000;

        function moveAt(pageX, pageY) {
            card.style.left = pageX - 40 + 'px';
            card.style.top = pageY - 60 + 'px';
        }

        moveAt(event.pageX, event.pageY);
        document.addEventListener('mousemove', onMouseMove);

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.onmouseup = function(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.onmouseup = null;

            // Check if the drop is valid
            const isMoveValid = checkMove(card, e.clientX, e.clientY);

            if (!isMoveValid) {
                // If invalid, snap back to the original slot
                card.style.position = 'relative';
                card.style.left = '0';
                card.style.top = '0';
                card.style.zIndex = 1;
            } else {
                // If valid, increment score and check for empty slots
                score += 10;
                document.getElementById('score').innerText = score;
                refillEmptySlots();
            }
        };
    };
    card.ondragstart = function() { return false; };
}

// THE "RULES" BRAIN
function checkMove(draggedCard, mouseX, mouseY) {
    // This looks for what is "under" your mouse when you let go
    draggedCard.style.display = 'none'; // Temporarily hide to see what's under
    let elementBelow = document.elementFromPoint(mouseX, mouseY);
    draggedCard.style.display = 'flex';

    if (!elementBelow) return false;

    // Find the closest "Slot" or "Card" below
    let targetSlot = elementBelow.closest('.slot');
    if (targetSlot) {
	const draggedVal = parseInt(draggedCard.dataset.value);
	const draggedColor = draggedCard.dataset.color;
	const topCard = targetSlot.lastElementChild;

    if (!topCard) {
	if (draggedVal ===13) {
	    targetSlot.appendChild(draggedCard);
	    snapToSlot(draggedCard);
	    return true;
	}
    } else {
            const topVal = parseInt(topCard.dataset.value);
            const topColor = topCard.dataset.color;

            // Rule: One lower AND opposite color
            if (topVal === draggedVal + 1 && topColor !== draggedColor) {
                targetSlot.appendChild(draggedCard);
                snapToSlot(draggedCard);
                return true;
            }
	}
    }
    return false;
}

// NEW: Win Condition Logic
function handleFoundationMove(card, pile) {
    const cardVal = parseInt(card.dataset.value);
    const cardSuit = card.innerHTML.slice(-1); // Gets the symbol
    const topCard = pile.lastElementChild;

    if (!topCard) {
        if (cardVal === 1) { // Only Aces start a foundation
            pile.appendChild(card);
            snapToSlot(card);
            score += 50; // Big points for foundation!
            return true;
        }
    } else {
        const topVal = parseInt(topCard.dataset.value);
        const topSuit = topCard.innerHTML.slice(-1);

        // Rule: Same suit AND one value higher
        if (cardVal === topVal + 1 && cardSuit === topSuit) {
            pile.appendChild(card);
            snapToSlot(card);
            score += 50;
            checkWin();
            return true;
        }
    }
    return false;
}

function checkWin() {
    const foundations = document.querySelectorAll('.foundation');
    let totalCards = 0;
    foundations.forEach(f => totalCards += f.childElementCount);
    if (totalCards === 52) {
        alert("NERD ARCADE CHAMPION! You won Solitaire!");
    }
}

function snapToSlot(card) {
    card.style.position = 'relative';
    card.style.left = '0';
    card.style.top = '0';
    card.style.zIndex = 1;
}

// AUTO-REFILL LOGIC
function refillEmptySlots() {
    const slots = document.getElementById('tableau').querySelectorAll('.slot');
    slots.forEach(slot => {
        if (slot.innerHTML === "" && deck.length > 0) {
            const cardData = deck.pop();
            const cardDiv = document.createElement('div');
            cardDiv.className = `card ${cardData.color}`;
            cardDiv.innerHTML = `${cardData.val}${cardData.suit}`;
            
            // Teach the new card how to move
            addDragEvents(cardDiv);
            slot.appendChild(cardDiv);
            console.log("Refilled an empty slot!");
        }
    });
}

// Start the game on load
initGame();
