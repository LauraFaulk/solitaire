// 1. CONSTANTS & STATE
const valueMap = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let deck = [];
let score = 0;

// 2. THE CARD FACTORY
function createCardElement(cardData) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${cardData.color}`;
    
    // --- BUILD THE TOP-LEFT CORNER ---
    const topLeft = document.createElement('div');
    topLeft.className = 'card-corner top-left';
    
    // Check if the value is '10' (it's the only 2-character value, needs space)
    const valSpanTL = document.createElement('span');
    valSpanTL.className = 'card-val';
    valSpanTL.innerText = cardData.val;
    
    const suitSpanTL = document.createElement('span');
    suitSpanTL.className = 'card-suit';
    suitSpanTL.innerText = cardData.suit;
    
    topLeft.appendChild(valSpanTL);
    topLeft.appendChild(suitSpanTL);
    
    // --- BUILD THE BOTTOM-RIGHT CORNER ---
    const bottomRight = topLeft.cloneNode(true); // Efficiency! Clone the TL corner
    bottomRight.className = 'card-corner bottom-right'; // Override the class
    
    // Assemble the card
    cardDiv.appendChild(topLeft);
    cardDiv.appendChild(bottomRight);
    
    // Attach data for the rules engine
    cardDiv.dataset.value = valueMap[cardData.val];
    cardDiv.dataset.color = cardData.color;
    
    addDragEvents(cardDiv);
    return cardDiv;
}

// 3. GAME INITIALIZATION
function initGame() {
    deck = [];
    score = 0;
    document.getElementById('score').innerText = score;
    document.getElementById('tableau').querySelectorAll('.slot').forEach(s => s.innerHTML = '');
    document.getElementById('waste').innerHTML = '';

    // Create and Shuffle Deck
    for (let suit of suits) {
        for (let val of values) {
            deck.push({ val, suit, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' });
        }
    }
    deck.sort(() => Math.random() - 0.5);

    // Deal to Tableau
    const slots = document.getElementById('tableau').querySelectorAll('.slot');
    slots.forEach((slot) => {
        const cardData = deck.pop();
        const cardDiv = createCardElement(cardData);
        slot.appendChild(cardDiv);
    });

    document.getElementById('deck').innerHTML = '<div class="card back"></div>';
}

// 4. DEALING LOGIC
function dealCard() {
    const waste = document.getElementById('waste');
    if (deck.length > 0) {
        const cardData = deck.pop();
        const cardDiv = createCardElement(cardData);
        waste.innerHTML = ''; 
        waste.appendChild(cardDiv);
        
        if (deck.length === 0) {
            document.getElementById('deck').innerHTML = '<div class="refresh-icon" style="cursor:pointer; font-size:2rem; text-align:center;">🔄</div>';
        }
    } else {
        // If deck is empty, restart
        location.reload();
    }
}

// 5. DRAG & DROP ENGINE
function addDragEvents(card) {
    card.onmousedown = function(event) {
        event.preventDefault();
        
        // Prepare for floating
        const offsetX = 40; // Half of 80px width
        const offsetY = 60; // Half of 120px height
        
        card.style.position = 'fixed';
        card.style.zIndex = 1000;

        function moveAt(pageX, pageY) {
    	    // Dynamically calculate half-width and half-height
    	    const halfWidth = card.offsetWidth / 2;
    	    const halfHeight = card.offsetHeight / 2;
    
    	    card.style.left = pageX - halfWidth + 'px';
    	    card.style.top = pageY - halfHeight + 'px';
        }

        moveAt(event.pageX, event.pageY);

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        document.addEventListener('mousemove', onMouseMove);

        document.onmouseup = function(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.onmouseup = null;

            const isMoveValid = checkMove(card, e.clientX, e.clientY);

            if (!isMoveValid) {
                // Snap back to original position if illegal move
                card.style.position = 'relative';
                card.style.left = '0';
                card.style.top = '0';
                card.style.zIndex = 1;
            } else {
                // Success!
                score += 10;
                document.getElementById('score').innerText = score;
                refillEmptySlots();
            }
        };
    };
    card.ondragstart = () => false;
}

// 6. THE RULES ENGINE
function checkMove(draggedCard, mouseX, mouseY) {
    draggedCard.style.visibility = 'hidden';
    let elementBelow = document.elementFromPoint(mouseX, mouseY);
    draggedCard.style.visibility = 'visible';

    if (!elementBelow) return false;

    let target = elementBelow.closest('.slot');
    if (!target) return false;

    const dVal = parseInt(draggedCard.dataset.value);
    const dColor = draggedCard.dataset.color;
    const dSuit = draggedCard.innerHTML.slice(-1);
    const topCard = target.lastElementChild;

    // Handle Foundation (Win Piles)
    if (target.classList.contains('foundation')) {
        if (!topCard) {
            if (dVal === 1) return snapTo(draggedCard, target);
        } else {
            const tVal = parseInt(topCard.dataset.value);
            const tSuit = topCard.innerHTML.slice(-1);
            if (dVal === tVal + 1 && dSuit === tSuit) return snapTo(draggedCard, target);
        }
        return false;
    }

    // Handle Tableau (Main Board)
    if (target.parentElement.id === "tableau" || target.id.startsWith("f") === false) {
        if (!topCard) {
            // King on empty
            if (dVal === 13) return snapTo(draggedCard, target);
        } else {
            const tVal = parseInt(topCard.dataset.value);
            const tColor = topCard.dataset.color;
            // Descending value and alternating color
            if (tVal === dVal + 1 && tColor !== dColor) return snapTo(draggedCard, target);
        }
    }

    return false;
}

function snapTo(card, target) {
    target.appendChild(card);
    card.style.position = 'relative';
    card.style.left = '0';
    card.style.top = '0';
    card.style.zIndex = 1;

    score += 10;
    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) scoreDisplay.innerText = score;

    return true;
}

function refillEmptySlots() {
    const slots = document.getElementById('tableau').querySelectorAll('.slot');
    slots.forEach(slot => {
        if (slot.innerHTML === "" && deck.length > 0) {
            const cardData = deck.pop();
            const cardElement = createCardElement(cardData);
            slot.appendChild(cardElement);
        }
    });
}

// Start Game
initGame();
