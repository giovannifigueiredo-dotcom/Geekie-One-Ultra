// Pomodoro com 3 modos + notificação
let timerInterval, timeLeft = 25*60, isTimerRunning = false, isBreak = false;

function startTimer() {
  isTimerRunning = true;
  timerInterval = setInterval(() => {
    timeLeft--;
    if (!isBreak) studySeconds++;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      if (!isBreak) { cycles++; earnCoins(10); isBreak = true; timeLeft = 5*60; }
      else { isBreak = false; timeLeft = 25*60; }
      sendPomodoroNotification('Foco concluído!');
    }
  }, 1000);
}