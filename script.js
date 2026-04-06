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
        // RULE: For now, we allow moving to any empty slot or any card
        // To add strict "King only on empty" or "Red on Black", 
        // you would add IF statements here checking card.dataset values.
        targetSlot.appendChild(draggedCard);
        draggedCard.style.position = 'relative';
        draggedCard.style.left = '0';
        draggedCard.style.top = '0';
        return true;
    }
    return false;
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
