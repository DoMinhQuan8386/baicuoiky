/**
 * STUDY HABIT TRACKER - HOME PAGE CONTROLLER (MEMBER 2)
 * File: js/home.js
 * Nhiệm vụ: Tải dữ liệu, kích hoạt engine Streak, tính toán tỷ lệ hoàn thành mục tiêu,
 * hiển thị thống kê tổng quan và danh sách phiên học hôm nay.
 */

(function () {
  'use strict';

  function initHomePage() {
    if (!window.AppStorage || !window.AppStreak) {
      console.error('Dependencies AppStorage or AppStreak missing!');
      return;
    }

    const settings = window.AppStorage.getSettings();
    const sessions = window.AppStorage.getSessions();
    const today = window.AppStorage.getTodayDateString();

    // 1. Tính toán Streak
    const currentStreak = window.AppStreak.calculateCurrentStreak(sessions);
    const longestStreak = window.AppStreak.calculateLongestStreak(sessions);
    const studiedToday = window.AppStreak.isStudiedToday(sessions);
    const streakMsg = window.AppStreak.getStreakMessage(currentStreak, studiedToday);

    const streakCountEl = document.getElementById('streak-count');
    const streakBannerEl = document.getElementById('streak-banner');
    const longestStreakEl = document.getElementById('longest-streak');
    const todayStatusEl = document.getElementById('today-status-badge');

    if (streakCountEl) streakCountEl.textContent = currentStreak;
    if (streakBannerEl) streakBannerEl.textContent = streakMsg;
    if (longestStreakEl) longestStreakEl.textContent = longestStreak + ' ngày';
    
    if (todayStatusEl) {
      if (studiedToday) {
        todayStatusEl.className = 'badge-pill badge-pill-success';
        todayStatusEl.textContent = 'Đã học hôm nay';
      } else {
        todayStatusEl.className = 'badge-pill badge-pill-warning';
        todayStatusEl.textContent = 'Chưa học hôm nay';
      }
    }

    // 2. Tính toán mục tiêu & tiến độ học tập hôm nay
    const todayMinutes = window.AppStorage.getTodayTotalMinutes();
    const dailyGoalMinutes = (settings.dailyGoalHours || 2) * 60;
    const progressPercent = Math.min(100, Math.round((todayMinutes / dailyGoalMinutes) * 100));

    const todayHoursEl = document.getElementById('today-hours-text');
    const dailyGoalTextEl = document.getElementById('daily-goal-text');
    const progressBarEl = document.getElementById('today-progress-fill');
    const progressPercentEl = document.getElementById('progress-percentage');
    const remainingTimeEl = document.getElementById('remaining-time-text');

    if (todayHoursEl) {
      todayHoursEl.textContent = (todayMinutes / 60).toFixed(1) + ' giờ';
    }
    if (dailyGoalTextEl) {
      dailyGoalTextEl.textContent = `Mục tiêu: ${settings.dailyGoalHours} giờ (${dailyGoalMinutes}p)`;
    }
    if (progressBarEl) {
      progressBarEl.style.width = `${progressPercent}%`;
    }
    if (progressPercentEl) {
      progressPercentEl.textContent = `${progressPercent}%`;
    }
    if (remainingTimeEl) {
      const remainingMins = Math.max(0, dailyGoalMinutes - todayMinutes);
      remainingTimeEl.textContent = remainingMins === 0 
        ? '🎉 Đã đạt mục tiêu hôm nay!' 
        : `Còn thiếu: ${window.AppCommon.formatMinutes(remainingMins)}`;
    }

    // 3. Hiển thị danh sách các phiên học hôm nay
    renderTodaySessions(sessions, today);
  }

  function renderTodaySessions(sessions, today) {
    const listContainer = document.getElementById('today-sessions-list');
    if (!listContainer) return;

    const todaySessions = sessions
      .filter(s => s.date === today)
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (todaySessions.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <span class="empty-state-icon">📖</span>
          <p>Hôm nay bạn chưa có phiên học nào.</p>
          <p style="font-size: 0.85rem; margin-top: 4px;">Hãy bật đồng hồ Pomodoro để bắt đầu học ngay nhé!</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = todaySessions.map(sess => {
      const timeStr = sess.timestamp 
        ? new Date(sess.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Hôm nay';
      
      return `
        <div class="session-item">
          <div class="session-left">
            <div class="session-icon">⏱️</div>
            <div>
              <div class="session-title">${escapeHtml(sess.note || 'Phiên học Pomodoro')}</div>
              <div class="session-subtitle">Chủ đề: <strong>${escapeHtml(sess.tag || 'Chung')}</strong> • Lúc: ${timeStr}</div>
            </div>
          </div>
          <div class="session-duration">
            +${sess.durationMinutes} phút
          </div>
        </div>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', initHomePage);

})();