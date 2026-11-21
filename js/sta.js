/**
 * STUDY HABIT TRACKER - STATISTICS MODULE (MEMBER 3)
 * File: js/statistics.js
 * Nhiệm vụ:
 * 1. Hiển thị tổng số giờ học, số ngày học, trung bình mỗi ngày.
 * 2. Sinh Calendar Heatmap giống GitHub cho 16 tuần gần nhất.
 * 3. Sinh biểu đồ cột SVG trực quan 7 ngày gần nhất với đường mục tiêu.
 * 4. Hiển thị bảng chi tiết lịch sử tất cả các phiên học.
 */

(function () {
  'use strict';

  function initStatistics() {
    if (!window.AppStorage) {
      console.error('AppStorage is required for Statistics module!');
      return;
    }

    const sessions = window.AppStorage.getSessions();
    const settings = window.AppStorage.getSettings();

    renderOverviewMetrics(sessions);
    renderWeeklySvgChart(sessions, settings);
    renderGitHubHeatmap(sessions);
    renderSessionsTable(sessions);
  }

  function renderOverviewMetrics(sessions) {
    const totalMinutes = sessions.reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    const uniqueDays = new Set(sessions.filter(s => s.durationMinutes > 0).map(s => s.date));
    const totalDaysCount = uniqueDays.size;

    const avgMinutesPerActiveDay = totalDaysCount > 0 ? Math.round(totalMinutes / totalDaysCount) : 0;
    const totalSessionsCount = sessions.length;

    const totalHoursEl = document.getElementById('stat-total-hours');
    const totalDaysEl = document.getElementById('stat-total-days');
    const avgDailyEl = document.getElementById('stat-avg-daily');
    const totalSessionsEl = document.getElementById('stat-total-sessions');

    if (totalHoursEl) totalHoursEl.textContent = `${totalHours}h`;
    if (totalDaysEl) totalDaysEl.textContent = `${totalDaysCount} ngày`;
    if (avgDailyEl) avgDailyEl.textContent = `${avgMinutesPerActiveDay} phút`;
    if (totalSessionsEl) totalSessionsEl.textContent = `${totalSessionsCount} phiên`;
  }

  function renderWeeklySvgChart(sessions, settings) {
    const svgEl = document.getElementById('weekly-bar-chart');
    if (!svgEl) return;

    const daysData = [];
    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const dayMins = sessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + (Number(s.durationMinutes) || 0), 0);

      daysData.push({
        date: dateStr,
        label: i === 0 ? 'Hôm nay' : dayName,
        minutes: dayMins
      });
    }

    const goalMinutes = (settings.dailyGoalHours || 2) * 60;
    const maxVal = Math.max(goalMinutes * 1.25, ...daysData.map(d => d.minutes), 60);

    const svgWidth = 600;
    const svgHeight = 220;
    const paddingBottom = 35;
    const paddingTop = 25;
    const chartHeight = svgHeight - paddingBottom - paddingTop;
    const colWidth = svgWidth / 7;
    const barWidth = 36;

    let elementsSvg = '';

    const goalY = paddingTop + chartHeight - (goalMinutes / maxVal) * chartHeight;
    elementsSvg += `
      <line x1="20" y1="${goalY}" x2="${svgWidth - 20}" y2="${goalY}" class="goal-line" />
      <text x="${svgWidth - 25}" y="${goalY - 6}" font-size="10" fill="#f59e0b" text-anchor="end">Mục tiêu: ${goalMinutes}p</text>
    `;

    daysData.forEach((day, index) => {
      const x = index * colWidth + (colWidth - barWidth) / 2;
      const barHeight = Math.max(4, (day.minutes / maxVal) * chartHeight);
      const y = paddingTop + chartHeight - barHeight;

      const isTargetMet = day.minutes >= goalMinutes && goalMinutes > 0;
      const barFill = isTargetMet ? '#10b981' : '#4f46e5';

      elementsSvg += `
        <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="4" fill="${barFill}" class="bar-rect">
          <title>${day.date}: ${day.minutes} phút</title>
        </rect>
        <text x="${x + barWidth / 2}" y="${y - 6}" class="chart-value-text">${day.minutes > 0 ? day.minutes + 'p' : '0'}</text>
        <text x="${x + barWidth / 2}" y="${svgHeight - 12}" class="chart-axis-text">${day.label}</text>
      `;
    });

    svgEl.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svgEl.innerHTML = elementsSvg;
  }

  function renderGitHubHeatmap(sessions) {
    const gridEl = document.getElementById('heatmap-grid');
    const tooltipEl = document.getElementById('heatmap-tooltip');
    if (!gridEl) return;

    const minutesByDate = {};
    sessions.forEach(s => {
      if (s.date && s.durationMinutes) {
        minutesByDate[s.date] = (minutesByDate[s.date] || 0) + Number(s.durationMinutes);
      }
    });

    const totalDays = 112;
    gridEl.innerHTML = '';

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const mins = minutesByDate[dateStr] || 0;

      let level = 0;
      if (mins > 0 && mins < 30) level = 1;
      else if (mins >= 30 && mins < 60) level = 2;
      else if (mins >= 60 && mins < 120) level = 3;
      else if (mins >= 120) level = 4;

      const cell = document.createElement('div');
      cell.className = `heatmap-cell level-${level}`;
      cell.setAttribute('data-date', dateStr);
      cell.setAttribute('data-minutes', mins);

      cell.addEventListener('mouseenter', () => {
        if (!tooltipEl) return;
        tooltipEl.style.display = 'block';
        tooltipEl.innerHTML = `<strong>${dateStr}</strong>: ${mins > 0 ? mins + ' phút học tập' : 'Không có hoạt động'}`;
      });

      cell.addEventListener('mousemove', (e) => {
        if (!tooltipEl) return;
        tooltipEl.style.left = (e.clientX + 10) + 'px';
        tooltipEl.style.top = (e.clientY - 30) + 'px';
      });

      cell.addEventListener('mouseleave', () => {
        if (!tooltipEl) return;
        tooltipEl.style.display = 'none';
      });

      gridEl.appendChild(cell);
    }
  }

  function renderSessionsTable(sessions) {
    const tbody = document.getElementById('sessions-table-body');
    if (!tbody) return;

    if (sessions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #64748b;">Chưa có dữ liệu phiên học nào.</td></tr>`;
      return;
    }

    const sorted = [...sessions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    tbody.innerHTML = sorted.map((sess, idx) => {
      return `
        <tr>
          <td><strong>#${sorted.length - idx}</strong></td>
          <td>${sess.date}</td>
          <td><span class="badge-pill badge-pill-primary">${escapeHtml(sess.tag || 'Chung')}</span></td>
          <td>${escapeHtml(sess.note || 'Phiên học Pomodoro')}</td>
          <td><strong>${sess.durationMinutes} phút</strong></td>
        </tr>
      `;
    }).join('');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', initStatistics);

})();