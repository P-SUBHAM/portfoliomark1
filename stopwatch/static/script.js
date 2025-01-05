// Theme handling
const themeToggleBtn = document.getElementById('themeToggleBtn');
const body = document.body;

// Check for saved theme preference, default to dark mode
const savedTheme = localStorage.getItem('theme') || 'dark-mode';
body.className = savedTheme;

// Theme toggle function
function toggleTheme() {
    if (body.classList.contains('light-mode')) {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark-mode');
    } else {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        localStorage.setItem('theme', 'light-mode');
    }
}

themeToggleBtn.addEventListener('click', toggleTheme);

// Clock functionality
const hoursDisplay = document.getElementById('hours');
const clockMinutesDisplay = document.getElementById('clock-minutes');
const clockSecondsDisplay = document.getElementById('clock-seconds');
const ampmDisplay = document.getElementById('ampm');
const timezoneSelect = document.getElementById('timezoneSelect');
const formatToggle = document.getElementById('formatToggle');
const timezoneInfo = document.getElementById('timezone-info');

let use24Hour = false;
let currentTimezone = 'local';

function getTimezoneTime(timezone) {
    const now = new Date();
    if (timezone === 'local') {
        return now;
    }
    
    const options = {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const timeStr = formatter.format(now);
    const [hours, minutes, seconds] = timeStr.split(':').map(num => parseInt(num));
    
    const tzDate = new Date();
    tzDate.setHours(hours);
    tzDate.setMinutes(minutes);
    tzDate.setSeconds(seconds);
    return tzDate;
}

function updateClock() {
    const now = getTimezoneTime(currentTimezone);
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    if (!use24Hour) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // If hours is 0, make it 12
        ampmDisplay.textContent = ampm;
        ampmDisplay.style.display = 'inline';
    } else {
        ampmDisplay.style.display = 'none';
    }
    
    // Update display
    hoursDisplay.textContent = (use24Hour ? hours : hours).toString().padStart(2, '0');
    clockMinutesDisplay.textContent = minutes.toString().padStart(2, '0');
    clockSecondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function updateTimezoneInfo() {
    if (currentTimezone === 'local') {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        timezoneInfo.textContent = `Local Time (${timezone})`;
    } else {
        timezoneInfo.textContent = currentTimezone.replace('_', ' ');
    }
}

// Event listeners for timezone and format changes
timezoneSelect.addEventListener('change', (e) => {
    currentTimezone = e.target.value;
    updateTimezoneInfo();
    updateClock();
});

formatToggle.addEventListener('click', () => {
    use24Hour = !use24Hour;
    formatToggle.textContent = use24Hour ? '12H' : '24H';
    updateClock();
});

// Update clock immediately and then every second
updateTimezoneInfo();
updateClock();
setInterval(updateClock, 1000);

// Notes functionality
const notesArea = document.getElementById('notesArea');
const clearNotesBtn = document.getElementById('clearNotesBtn');

// Load saved notes if any
const savedNotes = localStorage.getItem('stopwatchNotes');
if (savedNotes) {
    notesArea.value = savedNotes;
}

// Save notes automatically when typing
notesArea.addEventListener('input', () => {
    localStorage.setItem('stopwatchNotes', notesArea.value);
});

// Clear notes
clearNotesBtn.addEventListener('click', () => {
    notesArea.value = '';
    localStorage.removeItem('stopwatchNotes');
});

let minutes = 0;
let seconds = 0;
let milliseconds = 0;
let interval;
let isRunning = false;
let lapCount = 0;
let lastLapTime = 0;

const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const millisecondsDisplay = document.getElementById('milliseconds');
const startStopBtn = document.getElementById('startStopBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('lapsList');

function getCurrentTime() {
    return minutes * 60000 + seconds * 1000 + milliseconds * 10;
}

function formatTime(ms) {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${millis.toString().padStart(2, '0')}`;
}

function getFormattedTimestamp() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
}

function addLap() {
    if (!isRunning) return;
    
    lapCount++;
    const currentTime = getCurrentTime();
    const lapTime = currentTime - lastLapTime;
    lastLapTime = currentTime;
    const timestamp = getFormattedTimestamp();
    
    const li = document.createElement('li');
    li.innerHTML = `
        <div class="lap-info">
            <span class="lap-number">Lap ${lapCount}</span>
            <span class="lap-timestamp">${timestamp}</span>
        </div>
        <div class="lap-times">
            <span class="lap-split">Split: ${formatTime(lapTime)}</span>
            <span class="lap-total">Total: ${formatTime(currentTime)}</span>
        </div>
    `;
    lapsList.insertBefore(li, lapsList.firstChild);
}

function toggleStartStop() {
    if (!isRunning) {
        isRunning = true;
        startStopBtn.textContent = 'Stop';
        startStopBtn.classList.add('running');
        interval = setInterval(() => {
            milliseconds++;
            if (milliseconds === 100) {
                milliseconds = 0;
                seconds++;
                if (seconds === 60) {
                    seconds = 0;
                    minutes++;
                }
            }
            updateDisplay();
        }, 10);
    } else {
        isRunning = false;
        startStopBtn.textContent = 'Start';
        startStopBtn.classList.remove('running');
        clearInterval(interval);
    }
}

function resetStopwatch() {
    isRunning = false;
    clearInterval(interval);
    minutes = 0;
    seconds = 0;
    milliseconds = 0;
    lapCount = 0;
    lastLapTime = 0;
    updateDisplay();
    lapsList.innerHTML = '';
    startStopBtn.textContent = 'Start';
    startStopBtn.classList.remove('running');
}

function updateDisplay() {
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    millisecondsDisplay.textContent = milliseconds.toString().padStart(2, '0');
}

startStopBtn.addEventListener('click', toggleStartStop);
lapBtn.addEventListener('click', addLap);
resetBtn.addEventListener('click', resetStopwatch);
