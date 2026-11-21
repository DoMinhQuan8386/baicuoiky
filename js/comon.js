/**
 * STUDY HABIT TRACKER - COMMON UTILITIES & UI HELPERS (MEMBER 1)
 * File: js/common.js
 * Mục đích: Quản lý active navbar, hệ thống Toast notification,
 * Modal helper, âm thanh thông báo và kiểm tra Browser Notification nhắc học.
 */

(function () {
  'use strict';

  function setupActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-item a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  function ensureToastContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function showToast(message, type = 'info', duration = 3500) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${icon}</span>
        <span>${message}</span>
      </div>
      <button style="background:none; border:none; cursor:pointer; color:#94a3b8; font-size:16px; margin-left:12px;" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  function playBeep(type = 'success') {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(440.00, ctx.currentTime);
      }

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('AudioContext not allowed or not supported:', e);
    }
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) {
      showToast('Trình duyệt của bạn không hỗ trợ thông báo hệ thống', 'warning');
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  function sendBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>'
      });
    }
  }

  function formatMinutes(totalMinutes) {
    const mins = Math.max(0, Math.round(totalMinutes));
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hours === 0) return `${remMins} phút`;
    if (remMins === 0) return `${hours} giờ`;
    return `${hours}h ${remMins}m`;
  }

  function startReminderChecker() {
    setInterval(() => {
      if (!window.AppStorage) return;
      const settings = window.AppStorage.getSettings();
      if (!settings.reminderEnabled || !settings.reminderTime) return;

      const now = new Date();
      const currentHM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const lastRemindedKey = 'SHT_LAST_REMINDER_TRIGGER';
      const lastReminded = sessionStorage.getItem(lastRemindedKey);

      if (currentHM === settings.reminderTime && lastReminded !== currentHM) {
        sessionStorage.setItem(lastRemindedKey, currentHM);
        showToast('🔔 Đã đến giờ học tập theo mục tiêu hàng ngày của bạn!', 'info', 6000);
        sendBrowserNotification('Study Habit Tracker', '🔔 Đã đến giờ học tập theo mục tiêu của bạn!');
        playBeep('success');
      }
    }, 30000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupActiveNav();
    ensureToastContainer();
    startReminderChecker();
  });

  window.AppCommon = {
    showToast,
    openModal,
    closeModal,
    playBeep,
    requestNotificationPermission,
    sendBrowserNotification,
    formatMinutes
  };

})();