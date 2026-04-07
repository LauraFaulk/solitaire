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

    const bottomRight = topLeft.cloneNode(true);
    bottomRight.className = 'card-corner bottom-right';

    cardDiv.appendChild(topLeft);
    cardDiv.appendChild(bottomRight);
    
    // Attach data for the rules engine

    cardDiv.dataset.value = valueMap[cardData.val];
    cardDiv.dataset.color = cardData.color;
    
    cardDiv.dataset.suit = cardData.suit;

    addDragEvents(cardDiv);
    return cardDiv;
}

function updateScoreDisplay() {
    document.getElementById('score').innerText = score;
}

function resetFloatingStyles(card) {
    card.style.position = '';
    card.style.left = '';
    card.style.top = '';
    card.style.zIndex = '';
}

function layoutTableauSlot(slot) {
    const cards = slot.querySelectorAll(':scope > .card');
    cards.forEach((card, index) => {
        card.style.position = 'absolute';
        card.style.left = '0';
        card.style.top = `${index * 22}px`;
        card.style.zIndex = String(index + 1);
    });
}

// 3. GAME INITIALIZATION
function initGame() {
    deck = [];
    score = 0;
    document.getElementById('score').innerText = score;
    document.getElementById('tableau').querySelectorAll('.slot').forEach(s => s.innerHTML = '');
    updateScoreDisplay();

    const tableauSlots = document.getElementById('tableau').querySelectorAll('.slot');
    tableauSlots.forEach(slot => { slot.innerHTML = ''; });

    document.getElementById('waste').innerHTML = '';
    document.querySelectorAll('.foundation').forEach(foundation => { foundation.innerHTML = ''; });

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
    tableauSlots.forEach((slot) => {
        const cardData = deck.pop();
        const cardDiv = createCardElement(cardData);
        slot.appendChild(cardDiv);
        layoutTableauSlot(slot);
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
        

        const originSlot = card.closest('.slot');

        card.style.position = 'fixed';
        card.style.zIndex = 1000;
        card.style.zIndex = '5000';

        function moveAt(pageX, pageY) {
    	    // Dynamically calculate half-width and half-height
    	    const halfWidth = card.offsetWidth / 2;
    	    const halfHeight = card.offsetHeight / 2;
    
    	    card.style.left = pageX - halfWidth + 'px';
    	    card.style.top = pageY - halfHeight + 'px';
            const halfWidth = card.offsetWidth / 2;
            const halfHeight = card.offsetHeight / 2;

            card.style.left = `${pageX - halfWidth}px`;
            card.style.top = `${pageY - halfHeight}px`;
        }

        moveAt(event.pageX, event.pageY);

        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        function onMouseMove(e) {
            moveAt(e.pageX, e.pageY);
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
                originSlot.appendChild(card);
                resetFloatingStyles(card);

                if (originSlot.closest('#tableau')) {
                    layoutTableauSlot(originSlot);
                }
            }
        };
    };

    card.ondragstart = () => false;
}

// 6. THE RULES ENGINE
function checkMove(draggedCard, mouseX, mouseY) {
    draggedCard.style.visibility = 'hidden';
    let elementBelow = document.elementFromPoint(mouseX, mouseY);
    const elementBelow = document.elementFromPoint(mouseX, mouseY);
    draggedCard.style.visibility = 'visible';

    if (!elementBelow) return false;

    let target = elementBelow.closest('.slot');
    const target = elementBelow.closest('.slot');
    if (!target) return false;

    const dVal = parseInt(draggedCard.dataset.value);
    const dVal = Number.parseInt(draggedCard.dataset.value, 10);
    const dColor = draggedCard.dataset.color;
    const dSuit = draggedCard.innerHTML.slice(-1);
    const topCard = target.lastElementChild;
    const dSuit = draggedCard.dataset.suit;
    const topCard = target.querySelector(':scope > .card:last-child');

    // Handle Foundation (Win Piles)
    if (target.classList.contains('foundation')) {
        if (!topCard) {
            if (dVal === 1) return snapTo(draggedCard, target);
        } else {
            const tVal = parseInt(topCard.dataset.value);
            const tSuit = topCard.innerHTML.slice(-1);
            if (dVal === tVal + 1 && dSuit === tSuit) return snapTo(draggedCard, target);
        if (!topCard && dVal === 1) return snapTo(draggedCard, target);

        if (topCard) {
            const tVal = Number.parseInt(topCard.dataset.value, 10);
            const tSuit = topCard.dataset.suit;
            if (dVal === tVal + 1 && dSuit === tSuit) {
                return snapTo(draggedCard, target);
            }
        }
        return false;
    }

    // Handle Tableau (Main Board)
    if (target.parentElement.id === "tableau" || target.id.startsWith("f") === false) {
    const isTableauSlot = !!target.closest('#tableau');
    if (isTableauSlot) {
        if (!topCard) {
            // King on empty
            if (dVal === 13) return snapTo(draggedCard, target);
        } else {
            const tVal = parseInt(topCard.dataset.value);
            const tColor = topCard.dataset.color;
            // Descending value and alternating color
            if (tVal === dVal + 1 && tColor !== dColor) return snapTo(draggedCard, target);
            // Only Kings can fill an empty tableau slot.
            return dVal === 13 ? snapTo(draggedCard, target) : false;
        }

        const tVal = Number.parseInt(topCard.dataset.value, 10);
        const tColor = topCard.dataset.color;
        // Descending value and alternating color.
        if (tVal === dVal + 1 && tColor !== dColor) {
            return snapTo(draggedCard, target);
        }
    }

    return false;
}

function snapTo(card, target) {
    target.appendChild(card);
    if (target.classList.contains('foundation')) {
        card.style.top = '0';
    } else {
    card.style.position = 'absolute';
    }
    resetFloatingStyles(card);

    card.style.left = '0';
    card.style.zIndex = target.childElementCount;
    if (target.closest('#tableau')) {
        layoutTableauSlot(target);
    }

    score += 10;
    const scoreDisplay = document.getElementById('score');
    if (scoreDisplay) scoreDisplay.innerText = score;
    updateScoreDisplay();

    refillEmptySlots();
    return true;
}

function refillEmptySlots() {
    const slots = document.getElementById('tableau').querySelectorAll('.slot');
    slots.forEach(slot => {
        if (slot.innerHTML === "" && deck.length > 0) {
        if (slot.children.length === 0 && deck.length > 0) {
            const cardData = deck.pop();
            const cardElement = createCardElement(cardData);
            slot.appendChild(cardElement);
            layoutTableauSlot(slot);
        }
    });
}

// Start Game
initGame();
