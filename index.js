const magicsquare = [2, 7, 6, 9, 5, 1, 4, 3, 8];
const magicIndex = new Map(magicsquare.map((value, index) => [value, index]));
const WINNING_TRIPLES = [
    [2, 7, 6],
    [9, 5, 1],
    [4, 3, 8],
    [2, 9, 4],
    [7, 5, 3],
    [6, 1, 8],
    [2, 5, 8],
    [6, 5, 4]
];

let human = 1;
let comp = 0;
let level = -1;
let moves = 0;
let flag = 0;
let flag1 = 0;
const bot = [];
const player1 = [];
const player2 = [];
const occupied = Array(9).fill(0);

let boardCells = [];
let button1;
let button2;
let buttonX;
let buttonO;
let button3;
let levelsPanel;
let levelButtons = [];

function magicToIndex(n) {
    return magicIndex.has(n) ? magicIndex.get(n) : -1;
}

function updateSymbolButtons() {
    if (!buttonX || !buttonO) {
        return;
    }

    if (human === 1) {
        buttonX.style.backgroundColor = '#1372a1';
        buttonO.style.backgroundColor = '#A9A9A9';
    } else {
        buttonX.style.backgroundColor = '#A9A9A9';
        buttonO.style.backgroundColor = '#1372a1';
    }
}

function emptyAll() {
    boardCells.forEach(cell => {
        cell.innerHTML = '';
    });
    occupied.fill(0);
    bot.length = 0;
    player1.length = 0;
    player2.length = 0;
}

function restartClicked() {
    emptyAll();
    moves = 0;
    flag = 0;
    flag1 = 0;
    updateSymbolButtons();
    if (level > 0 && human === 0) {
        vsBotFirst();
    }
}

function winCondition(list) {
    const movesSet = new Set(list);
    return WINNING_TRIPLES.some(([a, b, c]) => movesSet.has(a) && movesSet.has(b) && movesSet.has(c));
}

function trioCheck(list) {
    const movesSet = new Set(list);

    for (const [a, b, c] of WINNING_TRIPLES) {
        const first = movesSet.has(a);
        const second = movesSet.has(b);
        const third = movesSet.has(c);

        if (first && second && !third && !occupied[magicToIndex(c)]) {
            return magicToIndex(c) + 1;
        }
        if (first && third && !second && !occupied[magicToIndex(b)]) {
            return magicToIndex(b) + 1;
        }
        if (second && third && !first && !occupied[magicToIndex(a)]) {
            return magicToIndex(a) + 1;
        }
    }

    return 0;
}

function randomPosition() {
    const available = occupied
        .map((value, index) => (value === 0 ? index : -1))
        .filter(index => index >= 0);

    const chosen = available[Math.floor(Math.random() * available.length)];
    return chosen + 1;
}

function randomExtPosition() {
    const corners = [0, 2, 6, 8];
    const available = corners.filter(index => occupied[index] === 0);
    const chosen = available[Math.floor(Math.random() * available.length)];
    return chosen + 1;
}

function randomMidPosition() {
    const mids = [1, 3, 5, 7];
    const available = mids.filter(index => occupied[index] === 0);
    const chosen = available[Math.floor(Math.random() * available.length)];
    return chosen + 1;
}

function vsPlayer(i) {
    if (moves % 2 === 1) {
        player1.push(magicsquare[i - 1]);
        buttonO.style.backgroundColor = '#1372a1';
        buttonX.style.backgroundColor = '#A9A9A9';
    } else {
        player2.push(magicsquare[i - 1]);
        buttonO.style.backgroundColor = '#A9A9A9';
        buttonX.style.backgroundColor = '#1372a1';
    }

    if (winCondition(player1)) {
        setTimeout(() => {
            alert('Player X Wins !!');
            restartClicked();
        }, 1);
        return;
    }

    if (winCondition(player2)) {
        setTimeout(() => {
            alert('Player O Wins !!');
            restartClicked();
        }, 1);
        return;
    }

    if (moves === 9) {
        setTimeout(() => {
            alert("It's a Tie !!");
            restartClicked();
        }, 1);
    }
}

function easy() {
    return trioCheck(bot) || randomPosition();
}

function medium() {
    return trioCheck(bot) || trioCheck(player1) || randomPosition();
}

function hardSecond() {
    const forcedMove = trioCheck(bot) || trioCheck(player1);
    if (forcedMove) {
        return forcedMove;
    }

    const r = Math.round(Math.random());

    if (moves === 1) {
        const first = player1[0];
        if (first === 5) {
            return randomExtPosition();
        }
        if ([2, 4, 6, 8].includes(first)) {
            return 5;
        }

        flag = 1;
        if (r === 0) {
            if (first === 7) return 1;
            if (first === 1) return 3;
            if (first === 3) return 7;
            if (first === 9) return 1;
        }

        if (first === 7) return 3;
        if (first === 1) return 9;
        if (first === 3) return 9;
        if (first === 9) return 7;
    }

    if (moves === 3) {
        if (flag === 1) {
            return 5;
        }
        if (bot[0] === 5) {
            const second = player1[1];
            if ([1, 3, 7, 9].includes(second)) {
                const blockedIndex = magicToIndex(10 - second);
                occupied[blockedIndex] = 1;
                const choice = randomMidPosition();
                occupied[blockedIndex] = 0;
                flag1 = 1;
                return choice;
            }
            return randomMidPosition();
        }
        return randomExtPosition();
    }

    if (flag1 === 1) {
        const x = magicToIndex(player1[0]);
        if (occupied[8 - x] === 0) {
            return 8 - x + 1;
        }
    }

    return randomPosition();
}

function hardFirst() {
    const forcedMove = trioCheck(bot) || trioCheck(player1);
    if (forcedMove) {
        return forcedMove;
    }

    const r = Math.round(Math.random());

    if (moves === 0) {
        return r ? randomExtPosition() : 5;
    }

    if (moves === 2) {
        return occupied[4] === 0 ? 5 : randomExtPosition();
    }

    return randomPosition();
}

function vsBotFirst() {
    let k = 0;

    if (level === 1) k = easy();
    if (level === 2) k = medium();
    if (level === 3) k = hardFirst();

    const x = document.getElementById(String(k));
    x.innerHTML = `<img src="${comp}.png" width="75%">`;
    occupied[k - 1] = 1;
    moves += 1;
    bot.push(magicsquare[k - 1]);

    if (winCondition(bot)) {
        setTimeout(() => {
            alert('Bot Wins !!');
            restartClicked();
        }, 1);
        return;
    }

    if (moves === 9) {
        setTimeout(() => {
            alert("It's a Tie!!");
            restartClicked();
        }, 1);
    }
}

function vsBotSecond() {
    if (winCondition(player1)) {
        setTimeout(() => {
            alert(level === 3 ? "You're a CHAMPION !!" : 'Player Wins !!');
            restartClicked();
        }, 1);
        return;
    }

    if (moves === 9) {
        setTimeout(() => {
            alert("It's a Tie !!");
            restartClicked();
        }, 1);
        return;
    }

    let k = 0;
    if (level === 1) k = easy();
    if (level === 2) k = medium();
    if (level === 3) k = hardSecond();

    const x = document.getElementById(String(k));
    x.innerHTML = `<img src="${comp}.png" width="75%">`;
    occupied[k - 1] = 1;
    moves += 1;
    bot.push(magicsquare[k - 1]);

    if (winCondition(bot)) {
        setTimeout(() => {
            alert('Bot Wins !!');
            restartClicked();
        }, 1);
    }
}

function playareaClicked(i) {
    if (level === -1) {
        alert("Select 'Vs Bot' or 'Vs Player' first");
        return;
    }

    if (occupied[i - 1]) {
        return;
    }

    occupied[i - 1] = 1;
    moves += 1;
    const x = document.getElementById(String(i));

    if (level === 0) {
        const zeroOne = moves % 2;
        x.innerHTML = `<img src="${zeroOne}.png" width="75%">`;
        vsPlayer(i);
        return;
    }

    x.innerHTML = `<img src="${human}.png" width="75%">`;
    player1.push(magicsquare[i - 1]);

    if (human === 1) {
        vsBotSecond();
    } else {
        if (winCondition(player1)) {
            setTimeout(() => {
                alert(level === 3 ? "You're a CHAMPION !!" : 'Player Wins !!');
                restartClicked();
            }, 1);
            return;
        }
        vsBotFirst();
    }
}

function showLevelMenu() {
    levelsPanel.classList.add('visible');
}

function hideLevelMenu() {
    levelsPanel.classList.remove('visible');
}

function hoverButton1() {
    showLevelMenu();
    button1.style.backgroundColor = level <= 0 ? '#808080' : '#066796';
}

function unhoverButton1() {
    hideLevelMenu();
    button1.style.backgroundColor = level <= 0 ? '#A9A9A9' : '#1372a1';
}

function hoverButton2() {
    button2.style.backgroundColor = level === 0 ? '#066796' : '#808080';
}

function unhoverButton2() {
    button2.style.backgroundColor = level === 0 ? '#1372a1' : '#A9A9A9';
}

function hoverButton3() {
    button3.style.backgroundColor = '#066796';
}

function unhoverButton3() {
    button3.style.backgroundColor = '#1372a1';
}

function setLevel(value, label) {
    restartClicked();
    level = value;
    button1.textContent = label;
    button1.style.backgroundColor = '#1372a1';
    button2.style.backgroundColor = '#A9A9A9';
    hideLevelMenu();
    if (human === 0) {
        vsBotFirst();
    }
}

function initVsPlayer() {
    restartClicked();
    level = 0;
    button2.style.backgroundColor = '#1372a1';
    button1.style.backgroundColor = '#A9A9A9';
    button1.textContent = 'Vs Bot';
}

function undoBotFirstMove() {
    if (moves !== 1 || bot.length !== 1 || player1.length !== 0) {
        return false;
    }

    const boardIndex = magicToIndex(bot[0]);
    if (boardIndex === -1) {
        return false;
    }

    const cell = document.getElementById(String(boardIndex + 1));
    if (cell) {
        cell.innerHTML = '';
    }

    occupied[boardIndex] = 0;
    bot.length = 0;
    moves = 0;
    return true;
}

function switchXO(i) {
    if (level <= 0) {
        return;
    }

    if (moves > 0 && !(i === 1 && level > 0 && undoBotFirstMove())) {
        return;
    }

    if (i === 0) {
        human = 0;
        comp = 1;
        buttonO.style.backgroundColor = '#1372a1';
        buttonX.style.backgroundColor = '#A9A9A9';
        vsBotFirst();
    } else {
        human = 1;
        comp = 0;
        buttonO.style.backgroundColor = '#A9A9A9';
        buttonX.style.backgroundColor = '#1372a1';
    }
}

function preloadImages() {
    if (!document.images) {
        return;
    }

    const images = [new Image(), new Image(), new Image()];
    images[0].src = '0.png';
    images[1].src = '1.png';
    images[2].src = 'back.jpg';
}

function init() {
    button1 = document.getElementById('button1');
    button2 = document.getElementById('button2');
    buttonX = document.getElementById('button-x');
    buttonO = document.getElementById('button-o');
    button3 = document.getElementById('button3');
    levelsPanel = document.getElementById('levels');
    levelButtons = Array.from(document.querySelectorAll('.level-option'));
    boardCells = Array.from(document.querySelectorAll('#board td'));

    button1.addEventListener('mouseenter', hoverButton1);
    button1.addEventListener('mouseleave', unhoverButton1);
    button1.addEventListener('click', showLevelMenu);

    button2.addEventListener('click', initVsPlayer);
    button2.addEventListener('mouseenter', hoverButton2);
    button2.addEventListener('mouseleave', unhoverButton2);

    buttonX.addEventListener('click', () => switchXO(1));
    buttonO.addEventListener('click', () => switchXO(0));

    button3.addEventListener('click', restartClicked);
    button3.addEventListener('mouseenter', hoverButton3);
    button3.addEventListener('mouseleave', unhoverButton3);

    levelsPanel.addEventListener('mouseenter', showLevelMenu);
    levelsPanel.addEventListener('mouseleave', hideLevelMenu);

    levelButtons.forEach(button => {
        button.addEventListener('click', () => {
            setLevel(Number(button.dataset.level), button.textContent);
        });
    });

    boardCells.forEach(cell => {
        const index = Number(cell.id);
        cell.addEventListener('click', () => playareaClicked(index));
    });

    preloadImages();
    updateSymbolButtons();
}

document.addEventListener('DOMContentLoaded', init);
