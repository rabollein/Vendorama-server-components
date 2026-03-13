function gs_addLeadingZero(value) {
  return value < 10 ? `0${value}` : value;
}

function gs_updateCountdown(countdownElement) {
  const endDate = new Date(countdownElement.getAttribute('data-end'));
  const now = new Date();
  const timeLeft = endDate - now;

  if (timeLeft <= 0) {
    let timeUpText = countdownElement.getAttribute('data-time-up-text') || "Time's up!";
    countdownElement.textContent = timeUpText;
    return;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  countdownElement.innerHTML = `
    <span class="gs_days gs_countdown_item">${gs_addLeadingZero(days)}</span>
    <span class="gs_date_divider">:</span>
    <span class="gs_hours gs_countdown_item">${gs_addLeadingZero(hours)}</span>
    <span class="gs_date_divider">:</span>
    <span class="gs_minutes gs_countdown_item">${gs_addLeadingZero(minutes)}</span>
    <span class="gs_date_divider">:</span>
    <span class="gs_seconds gs_countdown_item">${gs_addLeadingZero(seconds)}</span>
  `;
}

// Get all countdown elements
const gs_countdownElements = document.querySelectorAll('.gs_countdown');

// Update all countdowns immediately and then every second
function gs_updateAllCountdowns() {
  gs_countdownElements.forEach(gs_updateCountdown);
}

gs_updateAllCountdowns();
setInterval(gs_updateAllCountdowns, 1000);