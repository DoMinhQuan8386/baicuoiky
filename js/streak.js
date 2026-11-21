/**
 * STUDY HABIT TRACKER - STREAK CALCULATION ENGINE (MEMBER 2)
 * File: js/streak.js
 * Nhiệm vụ: Tính toán chuỗi ngày học liên tiếp (Streak) hiện tại và dài nhất
 * dựa trên dữ liệu lịch sử phiên học từ AppStorage.
 */

(function () {
  'use strict';

  function parseDateToMidnight(dateStr) {
    const parts = dateStr.split('-');
    return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
  }

  function getUniqueStudyDates(sessions) {
    if (!Array.isArray(sessions) || sessions.length === 0) return [];
    
    const validDates = sessions
      .filter(s => s.durationMinutes && s.durationMinutes > 0 && s.date)
      .map(s => s.date);
    
    const unique = Array.from(new Set(validDates));
    unique.sort((a, b) => parseDateToMidnight(b) - parseDateToMidnight(a));
    return unique;
  }

  function isStudiedToday(sessions) {
    const today = window.AppStorage.getTodayDateString();
    return sessions.some(s => s.date === today && s.durationMinutes > 0);
  }

  function calculateCurrentStreak(sessions) {
    const uniqueDates = getUniqueStudyDates(sessions);
    if (uniqueDates.length === 0) return 0;

    const todayStr = window.AppStorage.getTodayDateString();
    const yesterdayStr = window.AppStorage.getTodayDateString(-1);

    const hasToday = uniqueDates.includes(todayStr);
    const hasYesterday = uniqueDates.includes(yesterdayStr);

    if (!hasToday && !hasYesterday) {
      return 0;
    }

    let streak = 0;
    let expectedDate = new Date();
    if (!hasToday && hasYesterday) {
      expectedDate.setDate(expectedDate.getDate() - 1);
    }

    for (let i = 0; i < 365; i++) {
      const year = expectedDate.getFullYear();
      const month = String(expectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(expectedDate.getDate()).padStart(2, '0');
      const checkStr = `${year}-${month}-${day}`;

      if (uniqueDates.includes(checkStr)) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  function calculateLongestStreak(sessions) {
    const uniqueDates = getUniqueStudyDates(sessions);
    if (uniqueDates.length === 0) return 0;

    const sortedAsc = [...uniqueDates].sort((a, b) => parseDateToMidnight(a) - parseDateToMidnight(b));

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedAsc.length; i++) {
      const prevDate = new Date(parseDateToMidnight(sortedAsc[i - 1]));
      const currDate = new Date(parseDateToMidnight(sortedAsc[i]));

      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  function getStreakMessage(streak, studiedToday) {
    if (streak === 0) {
      return 'Hãy bắt đầu phiên học đầu tiên hôm nay để tạo Streak mới! 🚀';
    }
    if (!studiedToday) {
      return `Bạn đang giữ chuỗi ${streak} ngày! Đừng quên học hôm nay để không bị đứt nhé! ⏳`;
    }
    if (streak >= 7) {
      return `Thật phi thường! ${streak} ngày liên tiếp rèn luyện thói quen vàng! 🌟`;
    }
    return `Tuyệt vời! Bạn đã duy trì chuỗi học ${streak} ngày liên tiếp! 🔥`;
  }

  window.AppStreak = {
    calculateCurrentStreak,
    calculateLongestStreak,
    isStudiedToday,
    getStreakMessage
  };

})();