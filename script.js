let currentPlayer = null;
let credits = 0, selectedTickets = [], tickets = [], currentPrice = 200, isDrawing = false, drawnNumbers = [], currentDrawnIndex = 0, winnings = 0, simulatedTickets = [];
let linesWon = false; // Added global variable
const colors = ["#ef4444","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899","#6366f1","#14b8a6","#f97316","#06b6d4"];

let totalPrize = 0;
let firstLinePrize = 0;
let secondLinePrize = 0;
let bingoPrize = 0;

const creditCodes = {
    'AAAAA': { suffix: '00000', value: 1000 },
    'BBBBB': { suffix: '00001', value: 2000 },
    'CCCCC': { suffix: '00002', value: 3000 },
    'DDDDD': { suffix: '00003', value: 4000 },
    'EEEEE': { suffix: '00004', value: 5000 },
    'FFFFF': { suffix: '00005', value: 6000 },
    'GGGGG': { suffix: '00006', value: 7000 },
    'HHHHH': { suffix: '00007', value: 8000 },
    'IIIII': { suffix: '00008', value: 9000 },
    'JJJJJ': { suffix: '00009', value: 10000 },
    'KKKKK': { suffix: '00010', value: 11000 },
    'LLLLL': { suffix: '00011', value: 12000 },
    'MMMMM': { suffix: '00012', value: 13000 },
    'NNNNN': { suffix: '00013', value: 14000 },
    'OOOOO': { suffix: '00014', value: 15000 },
    'PPPPP': { suffix: '00015', value: 16000 },
    'QQQQQ': { suffix: '00016', value: 17000 },
    'RRRRR': { suffix: '00017', value: 18000 },
    'SSSSS': { suffix: '00018', value: 19000 },
    'TTTTT': { suffix: '00019', value: 20000 },
};

function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play();
    }
}

function generatePlayerId() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

function savePlayer(player) {
    let players = JSON.parse(localStorage.getItem('players')) || {};
    players[player.username] = player;
    localStorage.setItem('players', JSON.stringify(players));
    localStorage.setItem('currentPlayer', JSON.stringify(player));
}

function getPlayer(username) {
    let players = JSON.parse(localStorage.getItem('players')) || {};
    return players[username];
}

function loginPlayer() {
    const username = document.getElementById('usernameInput').value;
    if (username) {
        let player = getPlayer(username);
        if (!player) {
            player = {
                id: generatePlayerId(),
                username: username,
                credits: 0,
                usedCodes: [],
                boughtTickets: []
            };
        }
        savePlayer(player);
        loadPlayerAndStartGame(player);
    } else {
        alert('Por favor, ingresa un nombre de usuario');
    }
}

function loadPlayerAndStartGame(player) {
    currentPlayer = player;
    credits = player.credits;
    document.getElementById('authScreen').classList.add('x');
    document.getElementById('gameScreen').classList.remove('x');
    updatePlayerInfo();
    updateCreditsDisplay();
    if (currentPlayer.boughtTickets && currentPlayer.boughtTickets.length > 0) {
        tickets = currentPlayer.boughtTickets;
        renderTickets();
    } else {
        generateTickets();
    }
    console.log('Jugador cargado:', player);
}

function updatePlayerInfo() {
    document.getElementById('playerInfo').textContent = `Jugador: ${currentPlayer.username} (ID: ${currentPlayer.id})`;
}

function loadCredits() {
    if (currentPlayer) {
        credits = currentPlayer.credits;
        updateCreditsDisplay();
    }
}

function saveCredits() {
    if (currentPlayer) {
        currentPlayer.credits = credits;
        savePlayer(currentPlayer);
    }
}

function generateTickets() {
    tickets = [];
    selectedTickets = [];
    for (let i = 0; i < 10; i++) {
        tickets.push(generateSingleTicket());
    }
    renderTickets();
}

function generateSingleTicket() {
    const ticket = [[], [], []];
    const allNumbers = Array.from({length: 90}, (_, i) => i + 1);
    for (let i = 0; i < 15; i++) {
        const randomIndex = Math.floor(Math.random() * allNumbers.length);
        const selectedNumber = allNumbers[randomIndex];
        ticket[Math.floor(i / 5)].push(selectedNumber);
        allNumbers.splice(randomIndex, 1);
    }
    ticket.forEach(row => row.sort((a, b) => a - b));
    return ticket;
}

function renderTickets() {
    const container = document.getElementById('ticketContainer');
    container.innerHTML = '';
    tickets.forEach((ticket, index) => {
        const ticketElement = createTicketElement(ticket);
        ticketElement.addEventListener('click', () => toggleTicketSelection(index));
        container.appendChild(ticketElement);
    });
}

function createTicketElement(ticket, inDrawScreen = false) {
    const ticketElement = document.createElement('div');
    ticketElement.className = 'ticket';
    ticketElement.innerHTML = `
        ${ticket.map(row => `
            <div class="ticket-row">
                ${row.map(number => `
                    <span class="ticket-number ${inDrawScreen && drawnNumbers.includes(number) ? 'matched' : ''}">
                        ${number}
                    </span>
                `).join('')}
            </div>
        `).join('')}
    `;
    return ticketElement;
}

function toggleTicketSelection(index) {
    const ticketElement = document.querySelectorAll('.ticket')[index];
    if (selectedTickets.includes(index)) {
        selectedTickets = selectedTickets.filter(i => i !== index);
        ticketElement.classList.remove('selected');
    } else {
        selectedTickets.push(index);
        ticketElement.classList.add('selected');
    }
    document.getElementById('buySelectedTickets').disabled = selectedTickets.length === 0;
}

function setupEventListeners() {
    document.querySelectorAll(".b").forEach(button => {
        button.addEventListener("click", () => changeTab(button.dataset.tab));
    });
    document.getElementById("cB").addEventListener("click", showCreditDialog);
    document.getElementById("loadCreditsBtn").addEventListener("click", showLoadCreditsForm);
    document.getElementById("loadCreditsCodeBtn").addEventListener("click", showLoadCreditsCodeForm);
    document.getElementById("withdrawCreditsBtn").addEventListener("click", showWithdrawCreditsForm);
    document.getElementById("confirmLoadCredits").addEventListener("click", handleLoadCredits);
    document.getElementById("confirmLoadCreditsCode").addEventListener("click", handleLoadCreditsCode);
    document.getElementById("confirmWithdraw").addEventListener("click", handleWithdraw);
    document.getElementById("clB").addEventListener("click", hideCreditDialog);
    document.getElementById("closeReceipt").addEventListener("click", hideReceiptScreen);
    document.getElementById("generateTickets").addEventListener("click", generateTickets);
    document.getElementById("buySelectedTickets").addEventListener("click", buySelectedTickets);
    document.getElementById("sB").addEventListener("click", startDraw);
    document.getElementById("loginButton").addEventListener("click", loginPlayer);
    document.getElementById("logoutButton").addEventListener("click", logoutPlayer);
    console.log('Event listeners configurados');
}

function logoutPlayer() {
    localStorage.removeItem('currentPlayer');
    location.reload();
}

function changeTab(tabName) {
    document.querySelectorAll(".b").forEach(btn => btn.classList.remove("a"));
    document.querySelectorAll(".n").forEach(content => content.classList.add("x"));
    document.querySelector(`.b[data-tab="${tabName}"]`).classList.add("a");
    document.getElementById(`${tabName}Tab`).classList.remove("x");
    if (tabName === "buy" && isDrawing) resetDraw();
    updateCreditsDisplay();
}

function showCreditDialog() {
    document.getElementById("cD").classList.add("visible");
    document.getElementById("loadCreditsForm").classList.add("x");
    document.getElementById("loadCreditsCodeForm").classList.add("x");
    document.getElementById("withdrawCreditsForm").classList.add("x");
}

function showLoadCreditsForm() {
    document.getElementById("loadCreditsForm").classList.remove("x");
    document.getElementById("loadCreditsCodeForm").classList.add("x");
    document.getElementById("withdrawCreditsForm").classList.add("x");
}

function showLoadCreditsCodeForm() {
    document.getElementById("loadCreditsCodeForm").classList.remove("x");
    document.getElementById("loadCreditsForm").classList.add("x");
    document.getElementById("withdrawCreditsForm").classList.add("x");
}

function showWithdrawCreditsForm() {
    document.getElementById("withdrawCreditsForm").classList.remove("x");
    document.getElementById("loadCreditsForm").classList.add("x");
    document.getElementById("loadCreditsCodeForm").classList.add("x");
}

function hideCreditDialog() {
    document.getElementById("cD").classList.remove("visible");
    document.getElementById("loadPassword").value = "";
    document.getElementById("loadAmount").value = "";
    document.getElementById("loadCode").value = "";
    document.getElementById("withdrawAmount").value = "";
}

function handleLoadCredits() {
    const password = document.getElementById("loadPassword").value;
    const amount = parseInt(document.getElementById("loadAmount").value);

    if (password === "c27041279") {
        if (!isNaN(amount) && amount > 0) {
            credits += amount;
            updateCreditsDisplay();
            saveCredits();
            playSound("cashRegisterSound");
            showTemporaryMessage(`Se han cargado ${amount} créditos a tu cuenta.`);
            hideCreditDialog();
        } else {
            showTemporaryMessage("Por favor, ingrese un monto válido.");
        }
    } else {
        showTemporaryMessage("Contraseña incorrecta.");
    }
}

function handleLoadCreditsCode() {
    const code = document.getElementById("loadCode").value.toUpperCase();
    
    if (validateCode(code)) {
        const prefix = code.slice(0, 5);
        if (creditCodes.hasOwnProperty(prefix) && !currentPlayer.usedCodes.includes(code)) {
            const amount = creditCodes[prefix].value;
            credits += amount;
            currentPlayer.usedCodes.push(code);
            updateCreditsDisplay();
            saveCredits();
            playSound("cashRegisterSound");
            showTemporaryMessage(`Se han cargado ${amount} créditos a tu cuenta.`);
            hideCreditDialog();
        } else {
            showTemporaryMessage("Código inválido o ya utilizado.");
        }
    } else {
        showTemporaryMessage("Formato de código inválido o no coincide con tu ID de jugador.");
    }
}

function validateCode(code) {
    const codeRegex = /^[A-Z]{5}\d{5}$/;
    if (!codeRegex.test(code)) {
        return false;
    }

    const prefix = code.slice(0, 5);
    const suffix = code.slice(5);

    if (!creditCodes.hasOwnProperty(prefix)) {
        return false;
    }

    const playerIdSuffix = currentPlayer.id.slice(-5);
    return suffix === playerIdSuffix && suffix === creditCodes[prefix].suffix;
}

function handleWithdraw() {
    const amount = parseInt(document.getElementById("withdrawAmount").value);
    
    if (isNaN(amount) || amount <= 0) {
        showTemporaryMessage("Por favor, ingrese un monto válido.");
        return;
    }
    
    if (amount > credits) {
        showTemporaryMessage("No tienes suficientes créditos para realizar este retiro.");
        return;
    }
    
    credits -= amount;
    updateCreditsDisplay();
    saveCredits();
    playSound("cashRegisterSound");
    hideCreditDialog();
    
    showReceiptScreen(amount);
}

function showReceiptScreen(amount) {
    const receiptScreen = document.getElementById("receiptScreen");
    const receiptContent = document.getElementById("receiptContent");
    const currentDate = new Date();
    
    receiptContent.innerHTML = `
        <p><strong>Usuario:</strong> ${currentPlayer.username}</p>
        <p><strong>ID del Jugador:</strong> ${currentPlayer.id}</p>
        <p><strong>Cantidad Retirada:</strong> ${amount}</p>
        <p><strong>Fecha:</strong> ${currentDate.toLocaleDateString()}</p>
        <p><strong>Hora:</strong> ${currentDate.toLocaleTimeString()}</p>
    `;
    
    receiptScreen.classList.add("visible");
}

function hideReceiptScreen() {
    showTemporaryMessage("Recuerde que para validar este recibo debe hacer una captura de pantalla al recibo y enviarlo al WhatsApp +573247159521");
    document.getElementById("receiptScreen").classList.remove("visible");
}

function updateCreditsDisplay() {
    const creditButton = document.getElementById("cB");
    creditButton.innerHTML = `💳 Créditos: $<span id="cA">${credits}</span>`;
}

function buySelectedTickets() {
    const totalCost = selectedTickets.length * currentPrice;
    if (credits >= totalCost) {
        credits -= totalCost;
        updateCreditsDisplay();
        saveCredits();
        
        playSound("ticketBuySound");
        
        currentPlayer.boughtTickets = selectedTickets.map(index => tickets[index]);
        savePlayer(currentPlayer);
        showTemporaryMessage(`Has comprado ${selectedTickets.length} tickets por ${totalCost}`);
        selectedTickets = [];
        renderTickets();
    } else {
        showTemporaryMessage("No tienes suficientes créditos para comprar los tickets seleccionados.");
    }
}

function startDraw() {
    linesWon = false; // Added line to reset linesWon
    if (currentPlayer.boughtTickets && currentPlayer.boughtTickets.length > 0) {
        isDrawing = true;
        drawnNumbers = [];
        currentDrawnIndex = 0;
        winnings = 0;
        simulatedTickets = [];
           
        // Generar entre 80 y 100 tickets simulados
        const totalSimulatedTickets = Math.floor(Math.random() * (100 - 80 + 1)) + 80;
        for (let i = 0; i < totalSimulatedTickets; i++) {
            simulatedTickets.push({
                ticket: generateSingleTicket(),
                id: generatePlayerId(),
                firstLineWon: false,
                secondLineWon: false,
                bingoWon: false
            });
        }
        
        // Calcular el bote del premio
        const totalTickets = totalSimulatedTickets + currentPlayer.boughtTickets.length;
        totalPrize = totalTickets * currentPrice * 0.9; // 10% de comisión
        firstLinePrize = totalPrize * 0.25;
        secondLinePrize = totalPrize * 0.25;
        bingoPrize = totalPrize * 0.5;
        
        const availableNumbers = Array.from({length: 90}, (_, i) => i + 1);
        document.getElementById("sB").classList.add("x");
        document.getElementById("dR").classList.remove("x");
        renderTicketsInDrawScreen();
        playSound("ballsSound");
        drawNextNumber(availableNumbers);
        
        // Mostrar información del bote
        showTemporaryMessage(`Bote total: $${totalPrize.toFixed(2)}\nPremio primera línea: $${firstLinePrize.toFixed(2)}\nPremio segunda línea: $${secondLinePrize.toFixed(2)}\nPremio Bingo: $${bingoPrize.toFixed(2)}`, 5000);
    } else {
        showTemporaryMessage("Debes comprar al menos un ticket para iniciar el sorteo.");
    }
}

function drawNextNumber(availableNumbers) {
    if (currentDrawnIndex < 90 && availableNumbers.length > 0 && isDrawing) {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        const drawnNumber = availableNumbers[randomIndex];
        drawnNumbers.push(drawnNumber);
        availableNumbers.splice(randomIndex, 1);
        
        renderDrawnNumbers();
        updateLastDrawnBall(drawnNumber);
        checkWinningConditions();
        
        currentDrawnIndex++;
        setTimeout(() => drawNextNumber(availableNumbers), 1500);
    } else if (isDrawing) {
        finishDraw();
    }
}

function renderDrawnNumbers() {
    const drawnNumbersElement = document.getElementById("dN");
    drawnNumbersElement.innerHTML = "";
    drawnNumbers.forEach((number, index) => {
        const numberElement = document.createElement("div");
        numberElement.style.backgroundColor = colors[index % colors.length];
        numberElement.textContent = number;
        drawnNumbersElement.appendChild(numberElement);
    });
    renderTicketsInDrawScreen();
}

function updateLastDrawnBall(number) {
    const lastDrawnBall = document.getElementById("lastDrawnBall");
    lastDrawnBall.textContent = number;
    lastDrawnBall.style.backgroundColor = colors[(drawnNumbers.length - 1) % colors.length];
}

function renderTicketsInDrawScreen() {
    const container = document.getElementById('tD');
    container.innerHTML = '';
    
    const ticketsWithMatches = currentPlayer.boughtTickets.map((ticket, index) => {
        const matches = countMatches(ticket);
        const color = getTicketColor(ticket);
        return { ticket, index, matches, color };
    });
    
    // Ordenar los tickets por color solo si se está jugando por el bingo
    if (linesWon) {
        ticketsWithMatches.sort((a, b) => {
            const colorOrder = { 'red': 0, 'yellow': 1, 'green': 2, 'white': 3 };
            if (colorOrder[a.color] !== colorOrder[b.color]) {
                return colorOrder[a.color] - colorOrder[b.color];
            }
            return b.matches - a.matches;
        });
    }
    
    ticketsWithMatches.forEach(({ ticket, index, color }) => {
        const ticketElement = createTicketElement(ticket, true);
        ticketElement.classList.add('in-draw');
        ticketElement.innerHTML += `<div class="ticket-id">Ticket #${index + 1}</div>`;
        ticketElement.style.backgroundColor = color;
        container.appendChild(ticketElement);
    });
}

function countMatches(ticket) {
    return ticket.flat().filter(number => drawnNumbers.includes(number)).length;
}

function getTicketColor(ticket) {
    const lineStatus = ticket.map(line => line.filter(number => drawnNumbers.includes(number)).length);
    const bingoStatus = lineStatus.reduce((a, b) => a + b, 0);
    
    // Solo aplicar colores para bingo si ya se han ganado las dos líneas
    if (firstLinePrize === 0 && secondLinePrize === 0) {
        if (bingoStatus >= 14) return 'red';
        if (bingoStatus === 13) return 'yellow';
        if (bingoStatus === 12) return 'green';
    }
    
    return 'white';
}

function checkWinningConditions() {
    const allTickets = [
        ...currentPlayer.boughtTickets.map((ticket, index) => ({
            ticket,
            id: currentPlayer.id,
            index,
            firstLineWon: false,
            secondLineWon: false,
            bingoWon: false
        })),
        ...simulatedTickets
    ];
    
    let firstLineWinners = [];
    let secondLineWinners = [];
    let bingoWinners = [];
    
    allTickets.forEach((ticketObj) => {
        let completedLines = 0;
        
        ticketObj.ticket.forEach((row, rowIndex) => {
            if (row.every(number => drawnNumbers.includes(number))) {
                completedLines++;
                if (completedLines === 1 && !ticketObj.firstLineWon) {
                    ticketObj.firstLineWon = true;
                    firstLineWinners.push(ticketObj);
                } else if (completedLines === 2 && !ticketObj.secondLineWon) {
                    ticketObj.secondLineWon = true;
                    secondLineWinners.push(ticketObj);
                }
            }
        });
        
        if (completedLines === 3 && !ticketObj.bingoWon) {
            ticketObj.bingoWon = true;
            bingoWinners.push(ticketObj);
        }
    });
    
    // Distribuir premios
    if (firstLineWinners.length > 0 && firstLinePrize > 0) {
        const prizePerWinner = firstLinePrize / firstLineWinners.length;
        firstLineWinners.forEach(winner => {
            if (winner.id === currentPlayer.id) {
                winnings += prizePerWinner;
                showTemporaryMessage(`¡Tu ticket #${winner.index + 1} ha ganado la primera línea! Premio: $${prizePerWinner.toFixed(2)}`, 5000);
                updateWinningsDisplay(winnings);
            } else {
                showTemporaryMessage(`El ticket del jugador ${winner.id} ha ganado la primera línea. Premio: $${prizePerWinner.toFixed(2)}`, 5000);
            }
        });
        firstLinePrize = 0;
    }
    
    if (secondLineWinners.length > 0 && secondLinePrize > 0) {
        const prizePerWinner = secondLinePrize / secondLineWinners.length;
        secondLineWinners.forEach(winner => {
            if (winner.id === currentPlayer.id) {
                winnings += prizePerWinner;
                showTemporaryMessage(`¡Tu ticket #${winner.index + 1} ha ganado la segunda línea! Premio: $${prizePerWinner.toFixed(2)}`, 5000);
                updateWinningsDisplay(winnings);
            } else {
                showTemporaryMessage(`El ticket del jugador ${winner.id} ha ganado la segunda línea. Premio: $${prizePerWinner.toFixed(2)}`, 5000);
            }
        });
        secondLinePrize = 0;
    }
    
    if (firstLinePrize === 0 && secondLinePrize === 0) { // Added condition to update linesWon
        linesWon = true;
    }
    
    if (bingoWinners.length > 0) {
        const prizePerWinner = bingoPrize / bingoWinners.length;
        bingoWinners.forEach(winner => {
            if (winner.id === currentPlayer.id) {
                winnings += prizePerWinner;
                showTemporaryMessage(`¡BINGO! Tu ticket #${winner.index + 1} ha ganado. Premio: $${prizePerWinner.toFixed(2)}`, 5000);
                updateWinningsDisplay(winnings);
            } else {
                showTemporaryMessage(`¡BINGO! El ticket del jugador ${winner.id} ha ganado. Premio: $${prizePerWinner.toFixed(2)}`, 5000);
            }
        });
        finishDraw();
    }
}

function finishDraw() {
    isDrawing = false;
    credits += winnings;
    updateCreditsDisplay();
    saveCredits();
    document.getElementById("wI").classList.remove("x");
    document.getElementById("wI").textContent = winnings > 0
        ? `¡Felicidades! Ganaste $${winnings.toFixed(2)}`
        : "No hubo ganadores esta vez";
    document.getElementById("sB").classList.remove("x");
    updateWinningsDisplay(0);
}

function resetDraw() {
    isDrawing = false;
    drawnNumbers = [];
    currentDrawnIndex = 0;
    winnings = 0;
    document.getElementById("sB").classList.remove("x");
    document.getElementById("dR").classList.add("x");
    document.getElementById("wI").classList.add("x");
    renderTickets();
    updateCreditsDisplay();
    updateWinningsDisplay(0);
}

function showTemporaryMessage(message, duration = 5000) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.position = 'fixed';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '20px';
    messageElement.style.borderRadius = '10px';
    messageElement.style.zIndex = '1000';
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, duration);
}

function updateWinningsDisplay(amount) {
    const winningsDisplay = document.getElementById('winningsDisplay');
    if (!winningsDisplay) {
        const newWinningsDisplay = document.createElement('div');
        newWinningsDisplay.id = 'winningsDisplay';
        newWinningsDisplay.style.position = 'fixed';
        newWinningsDisplay.style.bottom = '10px';
        newWinningsDisplay.style.left = '10px';
        newWinningsDisplay.style.backgroundColor = 'rgba(0, 255, 0, 0.8)';
        newWinningsDisplay.style.color = 'white';
        newWinningsDisplay.style.padding = '10px';
        newWinningsDisplay.style.borderRadius = '5px';
        document.body.appendChild(newWinningsDisplay);
    }
    document.getElementById('winningsDisplay').textContent = `Ganancias: $${amount.toFixed(2)}`;
}

document.addEventListener("DOMContentLoaded", () => {
    setupEventListeners();
    
    const savedPlayer = JSON.parse(localStorage.getItem('currentPlayer'));
    if (savedPlayer) {
        loadPlayerAndStartGame(savedPlayer);
    } else {
        console.log('No hay jugador guardado, mostrando pantalla de inicio de sesión');
        document.getElementById('authScreen').classList.remove('x');
        document.getElementById('gameScreen').classList.add('x');
    }
    
    // Crear el elemento para la última balota
    const lastDrawnBallContainer = document.createElement('div');
    lastDrawnBallContainer.id = 'lastDrawnBallContainer';
    lastDrawnBallContainer.innerHTML = '<div id="lastDrawnBall"></div>';
    document.body.appendChild(lastDrawnBallContainer);
});