const randomWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'find', 'tell', 'very', 'still', 'try', 'kind', 'hand', 'picture', 'again', 'change', 'off', 'play', 'spell', 'air', 'away', 'animal', 'house', 'point', 'page', 'letter', 'mother', 'answer', 'found', 'study', 'learn', 'should', 'world', 'high', 'every', 'near', 'add', 'food', 'between', 'own', 'below', 'country', 'plant', 'last', 'school', 'father', 'keep', 'tree', 'never', 'start', 'city', 'earth', 'eye', 'light', 'thought', 'head', 'under', 'story', 'saw', 'left', 'don\'t', 'few', 'while', 'along', 'might', 'close', 'something', 'seem', 'next', 'hard', 'open', 'example', 'begin', 'life', 'always', 'those', 'both', 'paper', 'together', 'got', 'group', 'often', 'run', 'important', 'until', 'children', 'side', 'feet', 'car', 'mile', 'night', 'walk', 'white', 'sea', 'began', 'grow', 'took', 'river', 'four', 'carry', 'state', 'once', 'book', 'hear', 'stop', 'without', 'second', 'later', 'miss', 'idea', 'enough', 'eat', 'face', 'watch', 'far', 'Indian', 'real', 'almost', 'let', 'above', 'girl', 'sometimes', 'mountain', 'cut', 'young', 'talk', 'soon', 'list', 'song', 'being', 'leave', 'family', 'it\'s'];

const passages = [
    "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice.",
    "Technology has revolutionized the way we communicate and work. From smartphones to artificial intelligence these innovations shape our future.",
    "Reading is fundamental for personal growth. It expands knowledge improves vocabulary and enhances critical thinking throughout our lives.",
    "Music has the power to evoke emotions and bring people together. Whether classical jazz rock or electronic each genre offers unique experiences."
];

let state = {
    words: [],
    currentWordIndex: 0,
    currentCharIndex: 0,
    userInput: [],
    startTime: null,
    timer: null,
    timeLeft: 60,
    testActive: false,
    testMode: 'time',
    timeLimit: 60,
    wordLimit: 50,
    wpmHistory: [],
    rawWpmHistory: [],
    chart: null,
    caretPosition: 0,
    isBlocked: false,  
    consecutiveWrong: 0 
};

const els = {
    mode: document.getElementById('mode'),
    restart: document.getElementById('restart'),
    themeToggle: document.getElementById('theme-toggle'),
    textDisplay: document.getElementById('text-display'),
    textContainer: document.getElementById('text-container'),
    results: document.getElementById('results'),
    wpmLive: document.getElementById('wpm-live'),
    rawWpmLive: document.getElementById('raw-wpm-live'),
    accuracyLive: document.getElementById('accuracy-live'),
    timeDisplay: document.getElementById('time-display'),
    finalWpm: document.getElementById('final-wpm'),
    finalRaw: document.getElementById('final-raw'),
    finalAccuracy: document.getElementById('final-accuracy'),
    finalConsistency: document.getElementById('final-consistency'),
    finalChars: document.getElementById('final-chars'),
    finalTime: document.getElementById('final-time'),
    wpmChart: document.getElementById('wpm-chart')
};

function generateText() {
    if (els.mode.value === 'passage') {
        return passages[Math.floor(Math.random() * passages.length)].split(' ');
    }
    const count = state.testMode === 'words' ? state.wordLimit : 200;
    return Array.from({length: count}, () => randomWords[Math.floor(Math.random() * randomWords.length)]);
}

function displayText() {
    let html = '';
    
    state.words.forEach((word, wordIndex) => {
        const isCurrent = wordIndex === state.currentWordIndex;
        const wordClass = isCurrent ? 'word current' : 'word';
        
        html += `<span class="${wordClass}" data-word-index="${wordIndex}">`;
        
        const userWord = state.userInput[wordIndex] || '';
        const maxLength = Math.max(word.length, userWord.length);
        
        for (let charIndex = 0; charIndex < maxLength; charIndex++) {
            const char = word[charIndex];
            const userChar = userWord[charIndex];
            
            let charClass = 'char';
            let displayChar = char || '';
            
            if (userChar !== undefined) {
                charClass += ' typed';
                if (charIndex < word.length) {
                    charClass += userChar === char ? ' correct' : ' incorrect';
                } else {
                    charClass += ' extra';
                    displayChar = userChar;
                }
            }
            
            html += `<span class="${charClass}">${displayChar === ' ' ? '&nbsp;' : displayChar || ' '}</span>`;
        }
        
        html += '</span> ';
    });
    
    els.textContainer.innerHTML = html;
    
    updateCaret();
    
    // JITTER FIX: Smooth scrolling logic
    const currentWordElement = els.textContainer.querySelector(`[data-word-index="${state.currentWordIndex}"]`);
    
    if (currentWordElement) {
        const firstWordElement = els.textContainer.querySelector('[data-word-index="0"]');
        const lineHeight = firstWordElement ? firstWordElement.offsetHeight * 2 : 48;

        const currentWordTop = currentWordElement.offsetTop;

        if (currentWordTop >= (2 * lineHeight)) {
            const currentLineIndex = Math.floor(currentWordTop / lineHeight);
            
            const linesToShift = currentLineIndex - 1;
            const shiftY = linesToShift * lineHeight;
            
            els.textContainer.style.transform = `translateY(-${shiftY}px)`;
        } else {
            els.textContainer.style.transform = 'translateY(0px)';
        }
    }
}

function updateCaret() {
    const existingCaret = els.textContainer.querySelector('.caret');
    if (existingCaret) existingCaret.remove();
    
    if (!state.testActive && state.currentWordIndex === 0 && state.currentCharIndex === 0) {
        const firstChar = els.textContainer.querySelector('.char');
        if (firstChar) {
            const caret = document.createElement('div');
            caret.className = 'caret smooth';
            caret.style.left = '0px';
            firstChar.parentElement.appendChild(caret);
        }
        return;
    }
    
    const currentWord = els.textContainer.querySelector(`[data-word-index="${state.currentWordIndex}"]`);
    if (!currentWord) return;
    
    const chars = currentWord.querySelectorAll('.char');
    const userWord = state.userInput[state.currentWordIndex] || '';
    
    const caret = document.createElement('div');
    caret.className = state.isBlocked ? 'caret smooth blocked' : 'caret smooth';
    
    if (userWord.length === 0) {
        caret.style.left = '0px';
    } else if (userWord.length <= chars.length) {
        const prevChar = chars[userWord.length - 1];
        const rect = prevChar.getBoundingClientRect();
        const parentRect = currentWord.getBoundingClientRect();
        caret.style.left = (rect.right - parentRect.left) + 'px';
    } else {
        const lastChar = chars[chars.length - 1];
        const rect = lastChar.getBoundingClientRect();
        const parentRect = currentWord.getBoundingClientRect();
        const charWidth = (rect.right - rect.left) || 10;
        caret.style.left = (rect.right - parentRect.left + (userWord.length - chars.length) * charWidth) + 'px';
    }
    
    currentWord.appendChild(caret);
}

function calculateWPM() {
    if (!state.startTime) return 0;
    const timeElapsed = (Date.now() - state.startTime) / 60000;
    let correctChars = 0;
    
    state.userInput.forEach((userWord, wordIndex) => {
        const actualWord = state.words[wordIndex];
        if (actualWord) {
            for (let i = 0; i < Math.min(userWord.length, actualWord.length); i++) {
                if (userWord[i] === actualWord[i]) correctChars++;
            }
        }
    });
    
    return Math.round((correctChars / 5) / timeElapsed);
}

function calculateRawWPM() {
    if (!state.startTime) return 0;
    const timeElapsed = (Date.now() - state.startTime) / 60000;
    let totalChars = 0;
    
    state.userInput.forEach(word => {
        totalChars += word.length;
    });
    
    return Math.round((totalChars / 5) / timeElapsed);
}

function calculateAccuracy() {
    let correctChars = 0;
    let totalChars = 0;
    
    state.userInput.forEach((userWord, wordIndex) => {
        const actualWord = state.words[wordIndex];
        if (actualWord) {
            totalChars += userWord.length;
            for (let i = 0; i < Math.min(userWord.length, actualWord.length); i++) {
                if (userWord[i] === actualWord[i]) correctChars++;
            }
        }
    });
    
    return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
}

function calculateConsistency() {
    if (state.rawWpmHistory.length < 2) return 100;
    
    const values = state.rawWpmHistory.map(entry => entry.wpm);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? (stdDev / mean) : 0;
    
    return Math.max(0, Math.min(100, Math.round((1 - cv) * 100)));
}

function updateStats() {
    const wpm = calculateWPM();
    const rawWpm = calculateRawWPM();
    const accuracy = calculateAccuracy();
    
    els.wpmLive.textContent = wpm;
    els.rawWpmLive.textContent = rawWpm;
    els.accuracyLive.textContent = accuracy + '%';
    
    if (state.startTime && state.testActive) {
        const currentTime = Math.floor((Date.now() - state.startTime) / 1000);
        if (currentTime > 0 && wpm > 0) {
            const lastEntry = state.wpmHistory[state.wpmHistory.length - 1];
            if (!lastEntry || lastEntry.time !== currentTime) {
                state.wpmHistory.push({ time: currentTime, wpm: wpm });
                state.rawWpmHistory.push({ time: currentTime, wpm: rawWpm });
            }
        }
    }
}

function handleInput(key) {
    if (!state.testActive && key.length === 1) startTest();
    
    const currentWord = state.words[state.currentWordIndex];
    if (!currentWord) return;
    
    const currentInput = state.userInput[state.currentWordIndex] || '';

    if (key === ' ') {
        if (currentInput.length === currentWord.length) {
            state.currentWordIndex++;
            state.currentCharIndex = 0;
            state.consecutiveWrong = 0;
            state.isBlocked = false;
            
            if (state.testMode === 'words' && state.currentWordIndex >= state.wordLimit) {
                setTimeout(() => endTest(), 100);
            }
        } else {
            if (state.isBlocked) return;
            
            if (!state.userInput[state.currentWordIndex]) {
                state.userInput[state.currentWordIndex] = '';
            }
            state.userInput[state.currentWordIndex] += key;
            
            const charIndex = state.userInput[state.currentWordIndex].length - 1;
            if (charIndex >= currentWord.length || state.userInput[state.currentWordIndex][charIndex] !== currentWord[charIndex]) {
                state.consecutiveWrong++;
                if (state.consecutiveWrong >= 10) {
                    state.isBlocked = true;
                }
            } else {
                state.consecutiveWrong = 0;
            }
        }
    } else if (key === 'Backspace') {
        if (currentInput.length > 0) {
            state.userInput[state.currentWordIndex] = currentInput.slice(0, -1);
            
            let wrongCount = 0;
            const newInput = state.userInput[state.currentWordIndex];
            for (let i = 0; i < newInput.length; i++) {
                if (i >= currentWord.length || newInput[i] !== currentWord[i]) {
                    wrongCount++;
                } else {
                    wrongCount = 0;
                }
            }
            state.consecutiveWrong = wrongCount;
            
            if (state.consecutiveWrong < 10) {
                state.isBlocked = false;
            }
        } else if (state.currentWordIndex > 0) {
            state.currentWordIndex--;
            state.currentCharIndex = (state.userInput[state.currentWordIndex] || '').length;
            state.consecutiveWrong = 0;
            state.isBlocked = false;
        }
    } else if (key.length === 1 && !key.match(/[F1-F12]/)) {
        if (state.isBlocked) return;
        
        if (!state.userInput[state.currentWordIndex]) {
            state.userInput[state.currentWordIndex] = '';
        }
        state.userInput[state.currentWordIndex] += key;
        
        const charIndex = state.userInput[state.currentWordIndex].length - 1;
        if (charIndex >= currentWord.length || state.userInput[state.currentWordIndex][charIndex] !== currentWord[charIndex]) {
            state.consecutiveWrong++;
            if (state.consecutiveWrong >= 10) {
                state.isBlocked = true;
            }
        } else {
            state.consecutiveWrong = 0;
        }
    }
    
    displayText();
    updateStats();
}

function startTest() {
    state.testActive = true;
    state.startTime = Date.now();
    
    if (state.testMode === 'time') {
        state.timeLeft = state.timeLimit;
        state.timer = setInterval(() => {
            state.timeLeft--;
            els.timeDisplay.textContent = state.timeLeft + 's';
            if (state.timeLeft <= 0) endTest();
        }, 1000);
    }
}

function endTest() {
    state.testActive = false;
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
    
    const finalTime = state.startTime ? Math.round((Date.now() - state.startTime) / 1000) : 0;
    const wpm = calculateWPM();
    const rawWpm = calculateRawWPM();
    const accuracy = calculateAccuracy();
    const consistency = calculateConsistency();
    
    let totalChars = 0;
    let correctChars = 0;
    state.userInput.forEach((userWord, wordIndex) => {
        const actualWord = state.words[wordIndex];
        if (actualWord) {
            totalChars += userWord.length;
            for (let i = 0; i < Math.min(userWord.length, actualWord.length); i++) {
                if (userWord[i] === actualWord[i]) correctChars++;
            }
        }
    });
    
    els.finalWpm.textContent = wpm;
    els.finalRaw.textContent = rawWpm;
    els.finalAccuracy.textContent = accuracy + '%';
    els.finalConsistency.textContent = consistency + '%';
    els.finalChars.textContent = `${correctChars}/${totalChars}`;
    els.finalTime.textContent = finalTime + 's';
    
    els.results.classList.add('show');
    document.querySelector('.typing-container').style.display = 'none';
    
    createChart();
    els.results.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetTest() {
    state.testActive = false;
    if (state.timer) {
        clearInterval(state.timer);
        state.timer = null;
    }
    
    state.words = generateText();
    state.currentWordIndex = 0;
    state.currentCharIndex = 0;
    state.userInput = [];
    state.startTime = null;
    state.wpmHistory = [];
    state.rawWpmHistory = [];
    state.isBlocked = false;
    state.consecutiveWrong = 0;
    
    const timeLabel = els.timeDisplay.nextElementSibling;

    if (state.testMode === 'time') {
        state.timeLeft = state.timeLimit;
        els.timeDisplay.textContent = state.timeLimit + 's';
        if (timeLabel) timeLabel.textContent = 'TIME';
    } else if (state.testMode === 'words') {
        els.timeDisplay.textContent = state.wordLimit;
        if (timeLabel) timeLabel.textContent = 'WORDS';
    } else {
        state.timeLeft = state.timeLimit;
        els.timeDisplay.textContent = state.timeLimit + 's';
        if (timeLabel) timeLabel.textContent = 'TIME';
    }
    
    displayText();
    els.results.classList.remove('show');
    document.querySelector('.typing-container').style.display = 'block';
    
    els.wpmLive.textContent = '0';
    els.rawWpmLive.textContent = '0';
    els.accuracyLive.textContent = '100%';
    
    els.textDisplay.focus();
}

function createChart() {
    const ctx = els.wpmChart.getContext('2d');
    if (state.chart) state.chart.destroy();
    
    const chartData = [...state.wpmHistory];
    const rawData = [...state.rawWpmHistory];
    
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    const gridColor = isDark ? '#3c3e42' : '#e5e7eb';
    const textColor = isDark ? '#646669' : '#6b7280';
    
    state.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.map(point => point.time + 's'),
            datasets: [{
                label: 'WPM',
                data: chartData.map(point => point.wpm),
                // Note: The color for the chart should be updated in CSS for the final purple theme.
                borderColor: '#e2b714', 
                backgroundColor: 'rgba(226, 183, 20, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 5
            }, {
                label: 'Raw WPM',
                data: rawData.map(point => point.wpm),
                borderColor: '#4ade80',
                backgroundColor: 'transparent',
                borderWidth: 2,
                fill: false,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 4,
                borderDash: [5, 5]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: true,
                    labels: {
                        color: textColor,
                        font: { family: 'Roboto Mono' }
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#2c2e31' : '#ffffff',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                },
                y: { 
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: { color: textColor }
                }
            }
        }
    });
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    els.themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
    
    if (state.chart) {
        setTimeout(() => {
            if (els.results.classList.contains('show')) {
                createChart();
            }
        }, 100);
    }
}

els.restart.addEventListener('click', resetTest);
els.themeToggle.addEventListener('click', toggleTheme);

els.mode.addEventListener('change', (e) => {
    state.testMode = e.target.value;
    
    const timeLabel = els.timeDisplay.nextElementSibling;
    if (timeLabel) {
        if (state.testMode === 'words') {
            timeLabel.textContent = 'WORDS';
        } else {
            timeLabel.textContent = 'TIME';
        }
    }
    
    resetTest();
});

document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.word-btn').forEach(b => b.classList.remove('active'));
        state.timeLimit = parseInt(btn.dataset.time);
        state.testMode = 'time';
        els.mode.value = 'time';
        resetTest();
    });
});

document.querySelectorAll('.word-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.word-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
        state.wordLimit = parseInt(btn.dataset.words);
        state.testMode = 'words';
        els.mode.value = 'words';
        resetTest();
    });
});


document.addEventListener('keydown', (e) => {
    // Block Enter from triggering any buttons
    if (e.key === 'Enter' && e.target.tagName === 'BUTTON') {
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) return;
    
    // Handle Enter key - end test if active
    if (e.key === 'Enter') {
        e.preventDefault();
        if (state.testActive) {
            endTest();
        }
        return;
    }
    
    // Only process other keys if text display is focused or test is active
    if (document.activeElement !== els.textDisplay && !state.testActive) return;
    
    if (e.key === 'Tab' || e.key === 'F5') {
        e.preventDefault();
        resetTest();
        return;
    }
    
    if (e.key === 'Escape') {
        e.preventDefault();
        els.textDisplay.focus();
        return;
    }
    
    handleInput(e.key);
    e.preventDefault();
});

els.textDisplay.addEventListener('click', () => {
    els.textDisplay.focus();
});

els.textDisplay.addEventListener('focus', () => {

});

els.textDisplay.addEventListener('blur', () => {

});

function init() {
    resetTest();
}

init();