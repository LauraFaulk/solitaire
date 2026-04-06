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
    cardDiv.innerHTML = `${cardData.val}${cardData.suit}`;
    
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
            card.style.left = pageX - offsetX + 'px';
            card.style.top = pageY - offsetY + 'px';
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

    let targetSlot = elementBelow.closest('.slot') || elementBelow.closest('.foundation');
    if (!targetSlot) return false;

    const dVal = parseInt(draggedCard.dataset.value);
    const dColor = draggedCard.dataset.color;
    const topCard = targetSlot.lastElementChild;

    // Handle Foundation (Win Piles)
    if (targetSlot.classList.contains('foundation')) {
        const dSuit = draggedCard.innerHTML.slice(-1);
        if (!topCard) {
            if (dVal === 1) return snapToSlot(draggedCard, targetSlot);
        } else {
            const tVal = parseInt(topCard.dataset.value);
            const tSuit = topCard.innerHTML.slice(-1);
            if (dVal === tVal + 1 && dSuit === tSuit) return snapToSlot(draggedCard, targetSlot);
        }
        return false;
    }

    // Handle Tableau (Main Board)
    if (!topCard) {
        if (dVal === 13) return snapToSlot(draggedCard, targetSlot); // Kings on empty
    } else {
        const tVal = parseInt(topCard.dataset.value);
        const tColor = topCard.dataset.color;
        // Rule: One lower and opposite color
        if (tVal === dVal + 1 && tColor !== dColor) return snapToSlot(draggedCard, targetSlot);
    }

    return false;
}

function snapToSlot(card, slot) {
    slot.appendChild(card);
    card.style.position = 'relative';
    card.style.left = '0';
    card.style.top = '0';
    card.style.zIndex = 1;
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
