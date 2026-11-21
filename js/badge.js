/**
 * STUDY HABIT TRACKER - GAMIFICATION & BADGES ENGINE (MEMBER 5)
 * File: js/badges.js
 * Nhiệm vụ:
 * 1. Hiển thị danh mục huy hiệu với trạng thái Khóa / Mở khóa.
 * 2. Đánh giá điều kiện đạt huy hiệu dựa trên dữ liệu học tập thực tế.
 * 3. Kích hoạt hiệu ứng mở khóa huy hiệu, popup chúc mừng & âm thanh.
 */

(function () {
  'use strict';

  function renderBadgesGrid(containerId = 'badges-container') {
    const container = document.getElementById(containerId);
    if (!container || !window.AppStorage) return;

    const badges = window.AppStorage.getBadges();

    container.innerHTML = badges.map(badge => {
      const isUnlocked = Boolean(badge.unlockedAt);
      const unlockedDate = isUnlocked ? new Date(badge.unlockedAt).toLocaleDateString('vi-VN') : null;

      return `
        <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" data-badge-id="${badge.id}">
          <div class="badge-icon-box">
            <span>${badge.icon}</span>
          </div>
          <div class="badge-card-title">${badge.title}</div>
          <div class="badge-card-desc">${badge.desc}</div>
          
          <div class="badge-status-tag ${isUnlocked ? 'badge-pill badge-pill-success' : 'badge-pill'}">
            ${isUnlocked ? `Đã mở khóa • ${unlockedDate}` : '🔒 Chưa mở'}
          </div>
        </div>
      `;
    }).join('');
  }

  function evaluateAndUnlockBadges() {
    if (!window.AppStorage) return [];

    const sessions = window.AppStorage.getSessions();
    const badges = window.AppStorage.getBadges();
    const newlyUnlocked = [];

    badges.forEach(badge => {
      if (badge.unlockedAt) return;

      let qualified = false;

      // 1. Huy hiệu "Bước Đầu Tiên" - Hoàn thành ít nhất 1 phiên
      if (badge.id === 'first_step' && sessions.length >= 1) {
        qualified = true;
      }

      // 2. Huy hiệu "Bậc Thầy Tập Trung" - Hoàn thành 10 phiên Pomodoro
      if (badge.id === 'pomodoro_master' && sessions.length >= 10) {
        qualified = true;
      }

      // 3. Huy hiệu "Người Chạy Marathon" - Tổng học trong 1 ngày bất kỳ >= 120 phút (2 giờ)
      if (badge.id === 'marathon_day') {
        const dayMap = {};
        sessions.forEach(s => {
          dayMap[s.date] = (dayMap[s.date] || 0) + (Number(s.durationMinutes) || 0);
        });
        const hasMarathon = Object.values(dayMap).some(mins => mins >= 120);
        if (hasMarathon) qualified = true;
      }

      // 4. Các huy hiệu Streak 3 ngày và 7 ngày
      if (badge.id === 'streak_3' || badge.id === 'streak_7') {
        let currentStreak = 0;
        if (window.AppStreak) {
          currentStreak = window.AppStreak.calculateCurrentStreak(sessions);
        }
        if (badge.id === 'streak_3' && currentStreak >= 3) qualified = true;
        if (badge.id === 'streak_7' && currentStreak >= 7) qualified = true;
      }

      if (qualified) {
        const unlocked = window.AppStorage.unlockBadge(badge.id);
        if (unlocked) {
          newlyUnlocked.push(unlocked);
        }
      }
    });

    if (newlyUnlocked.length > 0) {
      renderBadgesGrid();
      triggerCelebrationModal(newlyUnlocked[0]);
    }

    return newlyUnlocked;
  }

  function triggerCelebrationModal(badge) {
    const iconEl = document.getElementById('celebration-badge-icon');
    const titleEl = document.getElementById('celebration-badge-title');
    const descEl = document.getElementById('celebration-badge-desc');

    if (iconEl) iconEl.textContent = badge.icon;
    if (titleEl) titleEl.textContent = badge.title;
    if (descEl) descEl.textContent = badge.desc;

    if (window.AppCommon) {
      window.AppCommon.openModal('celebration-modal');
      window.AppCommon.playBeep('success');
      window.AppCommon.showToast(`🎉 Chúc mừng bạn đã mở khóa huy hiệu: "${badge.title}"!`, 'success', 5000);
    }
  }

  window.AppBadges = {
    renderBadgesGrid,
    evaluateAndUnlockBadges,
    triggerCelebrationModal
  };

})();