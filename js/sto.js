/**
 * STUDY HABIT TRACKER - SHARED STORAGE API (MEMBER 1)
 * File: js/storage.js
 * Mục đích: Quản lý toàn bộ dữ liệu localStorage dùng chung cho 5 thành viên.
 * Cung cấp API chuẩn hóa: Settings, Sessions, Badges.
 */

(function () {
  'use strict';

  // Khóa localStorage cố định - Không thành viên nào được tự ý đổi
  const STORAGE_KEYS = {
    SETTINGS: 'SHT_SETTINGS_V1',
    SESSIONS: 'SHT_SESSIONS_V1',
    BADGES: 'SHT_BADGES_V1'
  };

  // Cấu hình mặc định
  const DEFAULT_SETTINGS = {
    dailyGoalHours: 2.0,          // Số giờ mục tiêu mỗi ngày (float)
    reminderTime: '20:00',        // Giờ nhắc nhở học (HH:mm)
    reminderEnabled: true,        // Trạng thái bật nhắc nhở
    theme: 'light'
  };

  // Danh mục huy hiệu chuẩn hóa
  const DEFAULT_BADGES = [
    {
      id: 'first_step',
      title: 'Bước Đầu Tiên',
      desc: 'Hoàn thành phiên học Pomodoro đầu tiên',
      icon: '🌱',
      unlockedAt: null
    },
    {
      id: 'streak_3',
      title: 'Kỷ Luật Bắt Đầu',
      desc: 'Duy trì chuỗi học tập 3 ngày liên tiếp',
      icon: '🔥',
      unlockedAt: null
    },
    {
      id: 'streak_7',
      title: 'Chiến Binh Thói Quen',
      desc: 'Duy trì chuỗi học tập 7 ngày liên tiếp',
      icon: '⚡',
      unlockedAt: null
    },
    {
      id: 'marathon_day',
      title: 'Người Chạy Marathon',
      desc: 'Hoàn thành trên 2 giờ học trong một ngày',
      icon: '🏆',
      unlockedAt: null
    },
    {
      id: 'pomodoro_master',
      title: 'Bậc Thầy Tập Trung',
      desc: 'Hoàn thành tổng cộng 10 phiên Pomodoro',
      icon: '👑',
      unlockedAt: null
    }
  ];

  /**
   * Helper định dạng ngày hôm nay theo dạng YYYY-MM-DD
   */
  function getTodayDateString(offsetDays = 0) {
    const d = new Date();
    if (offsetDays !== 0) {
      d.setDate(d.getDate() + offsetDays);
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Khởi tạo dữ liệu mẫu nếu lần đầu truy cập
   */
  function initDefaultData() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BADGES)) {
      localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(DEFAULT_BADGES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SESSIONS)) {
      // Tạo một số session mẫu trong 5 ngày gần đây để trực quan hoá biểu đồ và heatmap ngay lập tức
      const sampleSessions = [
        {
          id: 'sess_' + Date.now() + '_1',
          date: getTodayDateString(-4),
          timestamp: Date.now() - 4 * 86400000,
          durationMinutes: 50,
          tag: 'Lập trình',
          note: 'Học HTML5 & CSS3'
        },
        {
          id: 'sess_' + Date.now() + '_2',
          date: getTodayDateString(-3),
          timestamp: Date.now() - 3 * 86400000,
          durationMinutes: 75,
          tag: 'Toán rời rạc',
          note: 'Làm bài tập logic'
        },
        {
          id: 'sess_' + Date.now() + '_3',
          date: getTodayDateString(-2),
          timestamp: Date.now() - 2 * 86400000,
          durationMinutes: 60,
          tag: 'Tiếng Anh',
          note: 'Luyện nghe IELTS'
        },
        {
          id: 'sess_' + Date.now() + '_4',
          date: getTodayDateString(-1),
          timestamp: Date.now() - 1 * 86400000,
          durationMinutes: 90,
          tag: 'Cấu trúc dữ liệu',
          note: 'Học giải thuật sắp xếp'
        },
        {
          id: 'sess_' + Date.now() + '_5',
          date: getTodayDateString(0),
          timestamp: Date.now(),
          durationMinutes: 45,
          tag: 'Lập trình Web',
          note: 'Pomodoro phiên 1'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sampleSessions));
      unlockBadge('first_step');
    }
  }

  function getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
    } catch (e) {
      console.error('Error reading settings:', e);
      return { ...DEFAULT_SETTINGS };
    }
  }

  function saveSettings(newSettings) {
    try {
      const current = getSettings();
      const updated = { ...current, ...newSettings };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('Error saving settings:', e);
      return false;
    }
  }

  function getSessions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading sessions:', e);
      return [];
    }
  }

  function addSession(session) {
    try {
      const sessions = getSessions();
      const newSession = {
        id: 'sess_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        date: session.date || getTodayDateString(),
        timestamp: Date.now(),
        durationMinutes: Number(session.durationMinutes) || 25,
        tag: session.tag || 'Chung',
        note: session.note || 'Phiên học Pomodoro'
      };
      sessions.push(newSession);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
      return newSession;
    } catch (e) {
      console.error('Error adding session:', e);
      return null;
    }
  }

  function getTodayTotalMinutes() {
    const today = getTodayDateString();
    const sessions = getSessions();
    return sessions
      .filter(s => s.date === today)
      .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);
  }

  function getBadges() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BADGES);
      return data ? JSON.parse(data) : DEFAULT_BADGES;
    } catch (e) {
      console.error('Error reading badges:', e);
      return DEFAULT_BADGES;
    }
  }

  function hasBadge(badgeId) {
    const badges = getBadges();
    const b = badges.find(item => item.id === badgeId);
    return Boolean(b && b.unlockedAt);
  }

  function unlockBadge(badgeId) {
    try {
      const badges = getBadges();
      const target = badges.find(b => b.id === badgeId);
      if (target && !target.unlockedAt) {
        target.unlockedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.BADGES, JSON.stringify(badges));
        return target;
      }
      return null;
    } catch (e) {
      console.error('Error unlocking badge:', e);
      return null;
    }
  }

  function resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.BADGES);
    initDefaultData();
  }

  // Tự động khởi tạo dữ liệu mặc định khi nạp script
  initDefaultData();

  // Đính kèm API vào đối tượng toàn cục duy nhất
  window.AppStorage = {
    STORAGE_KEYS,
    getTodayDateString,
    getSettings,
    saveSettings,
    getSessions,
    addSession,
    getTodayTotalMinutes,
    getBadges,
    hasBadge,
    unlockBadge,
    resetAllData
  };

})();