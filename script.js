const valueMap = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
let deck = [];
let score = 0;

function createCardElement(cardData) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${cardData.color}`;
    
    const content = `
        <div class="card-corner top-left">
            <span>${cardData.val}</span><span>${cardData.suit}</span>
        </div>
        <div class="card-corner bottom-right">
            <span>${cardData.val}</span><span>${cardData.suit}</span>
        </div>`;
    
    cardDiv.innerHTML = content;
    cardDiv.dataset.value = valueMap[cardData.val];
    cardDiv.dataset.suit = cardData.suit;
    cardDiv.dataset.color = cardData.color;
    
    addDragEvents(cardDiv);
    return cardDiv;
}

function initGame() {
    deck = [];
    score = 0;
    const scoreElement = document.getElementById('score');
    if (scoreElement) scoreElement.innerText = score;
    
    // Clear all slots first
    document.querySelectorAll('.slot').forEach(s => s.innerHTML = '');

    // Create the deck
    for (let suit of suits) {
        for (let val of values) {
            deck.push({ val, suit, color: (suit === '♥' || suit === '♦') ? 'red' : 'black' });
        }
    }
    
    // Shuffle
    deck.sort(() => Math.random() - 0.5);

    // Deal to Tableau
    const tableau = document.getElementById('tableau');
    if (tableau) {
        const slots = tableau.querySelectorAll('.slot');
        slots.forEach(slot => {
            if (deck.length > 0) {
                const cardData = deck.pop();
                slot.appendChild(createCardElement(cardData));
            }
        });
    }

    // FINAL STEP: Set the deck visual to Memphis (No gray background anymore!)
    const deckSlot = document.getElementById('deck');
    if (deckSlot) {
        deckSlot.innerHTML = '<div class="card card-back"></div>';
    }
}

function dealCard() {
    const waste = document.getElementById('waste');
    const deckSlot = document.getElementById('deck');
    if (deck.length > 0) {
        const cardData = deck.pop();
        waste.innerHTML = '';
        waste.appendChild(createCardElement(cardData));

     // If that was the last card, show the "Refresh" icon instead
        if (deck.length === 0) {
            deckSlot.innerHTML = '<div class="refresh-icon" style="cursor:pointer; font-size:2rem; text-align:center; padding-top:25%;">🔄</div>';
        }	
    } else {
        initGame();
    }
}

function addDragEvents(card) {
    card.onmousedown = function(event) {
        event.preventDefault();
        let shiftX = card.offsetWidth / 2;
        let shiftY = card.offsetHeight / 2;

        card.style.position = 'fixed';
        card.style.zIndex = 1000;

        function moveAt(pageX, pageY) {
            card.style.left = pageX - shiftX + 'px';
            card.style.top = pageY - shiftY + 'px';
        }

        function onMouseMove(event) { moveAt(event.pageX, event.pageY); }
        document.addEventListener('mousemove', onMouseMove);

        document.onmouseup = function(e) {
            document.removeEventListener('mousemove', onMouseMove);
            document.onmouseup = null;

            if (!checkMove(card, e.clientX, e.clientY)) {
                card.style.position = 'absolute';
                card.style.left = '0';
                card.style.top = ''; // Let CSS nth-child reset it
                card.style.zIndex = '';
            }
        };
    };
    card.ondragstart = () => false;
}

function checkMove(card, x, y) {
    card.style.visibility = 'hidden';
    let target = document.elementFromPoint(x, y)?.closest('.slot');
    card.style.visibility = 'visible';

    if (!target) return false;

    const dVal = parseInt(card.dataset.value);
    const dColor = card.dataset.color;
    const dSuit = card.dataset.suit;
    const topCard = target.lastElementChild;

    if (target.classList.contains('foundation')) {
        if (!topCard) {
            if (dVal === 1) return snapTo(card, target);
        } else {
            if (dVal === parseInt(topCard.dataset.value) + 1 && dSuit === topCard.dataset.suit) 
                return snapTo(card, target);
        }
    } else if (target.parentElement.id === "tableau") {
        if (!topCard) {
            if (dVal === 13) return snapTo(card, target);
        } else {
            if (parseInt(topCard.dataset.value) === dVal + 1 && topCard.dataset.color !== dColor) 
                return snapTo(card, target);
        }
    }
    return false;
}

function snapTo(card, target) {
    target.appendChild(card);
    card.style.position = 'absolute';
    card.style.left = '0';
    card.style.top = ''; 
    card.style.zIndex = target.childElementCount;
    score += 10;
    document.getElementById('score').innerText = score;
    return true;
}

initGame();
