/**
 * STUDY HABIT TRACKER - SETTINGS CONTROLLER (MEMBER 4)
 * File: js/settings.js
 * Nhiệm vụ:
 * 1. Tải và hiển thị cấu hình mục tiêu hiện tại.
 * 2. Kiểm tra tính hợp lệ dữ liệu nhập (Validation: số giờ > 0 và <= 24).
 * 3. Lưu cấu hình vào localStorage qua AppStorage.saveSettings().
 * 4. Tích hợp cấu hình nhắc nhở và xin cấp quyền Browser Notification.
 * 5. Quản lý khôi phục dữ liệu mặc định.
 */

(function () {
  'use strict';

  function initSettingsPage() {
    if (!window.AppStorage || !window.AppCommon) {
      console.error('AppStorage or AppCommon missing!');
      return;
    }

    const form = document.getElementById('settings-form');
    const inputGoalHours = document.getElementById('input-daily-goal');
    const inputReminderTime = document.getElementById('input-reminder-time');
    const toggleReminder = document.getElementById('toggle-reminder');
    const btnRequestNotif = document.getElementById('btn-request-notif');
    const btnResetData = document.getElementById('btn-reset-data');

    // 1. Tải dữ liệu hiện tại lên Form
    const currentSettings = window.AppStorage.getSettings();
    if (inputGoalHours) inputGoalHours.value = currentSettings.dailyGoalHours || 2;
    if (inputReminderTime) inputReminderTime.value = currentSettings.reminderTime || '20:00';
    if (toggleReminder) toggleReminder.checked = Boolean(currentSettings.reminderEnabled);

    updateSummaryCard(currentSettings);

    // 2. Lắng nghe sự kiện thay đổi trực tiếp trên input để xem trước (Live Preview)
    if (inputGoalHours) {
      inputGoalHours.addEventListener('input', () => {
        const val = parseFloat(inputGoalHours.value);
        if (!isNaN(val) && val > 0) {
          updateSummaryCard({ dailyGoalHours: val });
        }
      });
    }

    // 3. Xử lý Submit Form lưu cấu hình
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const goalVal = parseFloat(inputGoalHours.value);
        const reminderTimeVal = inputReminderTime.value;
        const reminderEnabledVal = toggleReminder.checked;

        if (isNaN(goalVal) || goalVal <= 0) {
          window.AppCommon.showToast('Mục tiêu học tập phải lớn hơn 0 giờ!', 'error');
          inputGoalHours.focus();
          return;
        }

        if (goalVal > 18) {
          window.AppCommon.showToast('Hãy đặt mục tiêu thực tế (dưới 18 giờ/ngày) để bảo vệ sức khỏe!', 'warning');
          return;
        }

        if (reminderEnabledVal && !reminderTimeVal) {
          window.AppCommon.showToast('Vui lòng chọn thời gian nhắc nhở học tập!', 'warning');
          inputReminderTime.focus();
          return;
        }

        const isSuccess = window.AppStorage.saveSettings({
          dailyGoalHours: parseFloat(goalVal.toFixed(1)),
          reminderTime: reminderTimeVal,
          reminderEnabled: reminderEnabledVal
        });

        if (isSuccess) {
          window.AppCommon.showToast('Đã lưu cấu hình mục tiêu thành công! 🎉', 'success');
          updateSummaryCard(window.AppStorage.getSettings());
        } else {
          window.AppCommon.showToast('Lỗi khi lưu cấu hình vào bộ nhớ!', 'error');
        }
      });
    }

    // 4. Xử lý yêu cầu cấp quyền Browser Notification
    if (btnRequestNotif) {
      btnRequestNotif.addEventListener('click', async () => {
        const granted = await window.AppCommon.requestNotificationPermission();
        if (granted) {
          window.AppCommon.showToast('Đã bật quyền nhận thông báo trình duyệt! 🔔', 'success');
          window.AppCommon.sendBrowserNotification('Study Habit Tracker', 'Thông báo học tập đã sẵn sàng hoạt động!');
        } else {
          window.AppCommon.showToast('Bạn đã từ chối hoặc chưa cấp quyền thông báo!', 'warning');
        }
      });
    }

    // 5. Xử lý khôi phục / Reset dữ liệu mẫu
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        const confirmed = confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu mẫu ban đầu? Toàn bộ lịch sử sẽ được làm mới.');
        if (confirmed) {
          window.AppStorage.resetAllData();
          window.AppCommon.showToast('Đã đặt lại dữ liệu mặc định thành công!', 'success');
          setTimeout(() => window.location.reload(), 1000);
        }
      });
    }
  }

  function updateSummaryCard(settings) {
    const previewGoalHours = document.getElementById('preview-goal-hours');
    const previewGoalMins = document.getElementById('preview-goal-minutes');
    const previewReminder = document.getElementById('preview-reminder-text');

    const hours = settings.dailyGoalHours || 2;
    const mins = Math.round(hours * 60);

    if (previewGoalHours) previewGoalHours.textContent = `${hours}h`;
    if (previewGoalMins) previewGoalMins.textContent = `Tương đương: ${mins} phút / ngày`;
    if (previewReminder && settings.reminderTime !== undefined) {
      previewReminder.textContent = settings.reminderEnabled 
        ? `Bật lúc ${settings.reminderTime}` 
        : 'Đang tắt nhắc nhở';
    }
  }

  document.addEventListener('DOMContentLoaded', initSettingsPage);

})();