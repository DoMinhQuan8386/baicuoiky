/**
 * STUDY HABIT TRACKER - POMODORO TIMER ENGINE (MEMBER 5)
 * File: js/pomodoro.js
 * Nhiệm vụ:
 * 1. Quản lý trạng thái đếm ngược Pomodoro (Start, Pause, Resume, Reset) bằng setInterval().
 * 2. Cập nhật vòng quay tiến độ tròn bằng SVG stroke-dashoffset.
 * 3. Ghi nhận thời gian học vào AppStorage khi kết thúc phiên.
 * 4. Phát âm thanh, gửi Browser Notification và kích hoạt Gamification mở huy hiệu.
 */

(function () {
  'use strict';

  const TIMER_MODES = {
    pomodoro: { name: 'Pomodoro', minutes: 25, color: '#4f46e5' },
    shortBreak: { name: 'Nghỉ Ngắn', minutes: 5, color: '#10b981' },
    longBreak: { name: 'Nghỉ Dài', minutes: 15, color: '#06b6d4' }
  };

  let currentMode = 'pomodoro';
  let totalSeconds = 25 * 60;
  let remainingSeconds = 25 * 60;
  let timerInterval = null;
  let isRunning = false;

  const CIRCLE_CIRCUMFERENCE = 785.4;

  function initPomodoro() {
    setupDomListeners();
    updateDisplay();
    updateSvgProgress();

    if (window.AppBadges) {
      window.AppBadges.renderBadgesGrid();
    }
  }

  function setupDomListeners() {
    const btnToggle = document.getElementById('btn-timer-toggle');
    const btnReset = document.getElementById('btn-timer-reset');
    const tabBtns = document.querySelectorAll('.mode-tab-btn');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (isRunning) {
          const confirmSwitch = confirm('Đồng hồ đang chạy. Bạn có chắc muốn dừng và đổi chế độ?');
          if (!confirmSwitch) return;
        }
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const modeKey = btn.getAttribute('data-mode');
        switchMode(modeKey);
      });
    });

    if (btnToggle) {
      btnToggle.addEventListener('click', toggleTimer);
    }

    if (btnReset) {
      btnReset.addEventListener('click', resetTimer);
    }
  }

  function switchMode(modeKey) {
    pauseTimer();
    currentMode = modeKey;
    const modeConfig = TIMER_MODES[modeKey] || TIMER_MODES.pomodoro;
    totalSeconds = modeConfig.minutes * 60;
    remainingSeconds = totalSeconds;

    const progressCircle = document.getElementById('timer-svg-circle');
    if (progressCircle) {
      progressCircle.style.stroke = modeConfig.color;
    }

    const statusLabel = document.getElementById('timer-status-text');
    if (statusLabel) {
      statusLabel.textContent = modeConfig.name;
    }

    updateDisplay();
    updateSvgProgress();
  }

  function toggleTimer() {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    if (isRunning) return;

    isRunning = true;
    updateToggleButtonUI();

    timerInterval = setInterval(() => {
      if (remainingSeconds > 0) {
        remainingSeconds--;
        updateDisplay();
        updateSvgProgress();
      } else {
        handleTimerComplete();
      }
    }, 1000);
  }

  function pauseTimer() {
    isRunning = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    updateToggleButtonUI();
  }

  function resetTimer() {
    pauseTimer();
    const modeConfig = TIMER_MODES[currentMode] || TIMER_MODES.pomodoro;
    totalSeconds = modeConfig.minutes * 60;
    remainingSeconds = totalSeconds;
    updateDisplay();
    updateSvgProgress();
  }

  function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const displayEl = document.getElementById('timer-display');
    if (displayEl) {
      displayEl.textContent = formatted;
    }
    document.title = `(${formatted}) Study Habit Tracker`;
  }

  function updateSvgProgress() {
    const progressCircle = document.getElementById('timer-svg-circle');
    if (!progressCircle) return;

    const fraction = remainingSeconds / totalSeconds;
    const offset = CIRCLE_CIRCUMFERENCE * (1 - fraction);
    progressCircle.style.strokeDashoffset = offset;
  }

  function updateToggleButtonUI() {
    const btnToggle = document.getElementById('btn-timer-toggle');
    if (!btnToggle) return;

    if (isRunning) {
      btnToggle.className = 'btn-timer-action btn-timer-pause';
      btnToggle.innerHTML = '⏸️';
      btnToggle.title = 'Tạm dừng';
    } else {
      btnToggle.className = 'btn-timer-action btn-timer-play';
      btnToggle.innerHTML = '▶️';
      btnToggle.title = 'Bắt đầu';
    }
  }

  function handleTimerComplete() {
    pauseTimer();

    if (window.AppCommon) {
      window.AppCommon.playBeep('success');
    }

    if (window.AppCommon) {
      const modeName = TIMER_MODES[currentMode].name;
      window.AppCommon.sendBrowserNotification(
        'Đã xong phiên ' + modeName + '!',
        'Tuyệt vời! Bạn đã hoàn thành trọn vẹn thời gian đã định.'
      );
      window.AppCommon.showToast(`🎉 Đã hoàn thành phiên ${modeName}!`, 'success', 5000);
    }

    if (currentMode === 'pomodoro' && window.AppStorage) {
      const inputTag = document.getElementById('pomodoro-tag-input');
      const inputNote = document.getElementById('pomodoro-note-input');

      const tagVal = (inputTag && inputTag.value.trim()) || 'Học tập';
      const noteVal = (inputNote && inputNote.value.trim()) || 'Phiên Pomodoro hoàn thành';
      const studyMins = TIMER_MODES.pomodoro.minutes;

      window.AppStorage.addSession({
        durationMinutes: studyMins,
        tag: tagVal,
        note: noteVal
      });

      if (window.AppBadges) {
        window.AppBadges.evaluateAndUnlockBadges();
      }
    }

    resetTimer();
  }

  document.addEventListener('DOMContentLoaded', initPomodoro);

})();