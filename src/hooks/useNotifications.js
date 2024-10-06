// src/hooks/useNotifications.js
import { useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, getDoc } from 'firebase/firestore';

/**
 * Custom hook to handle daily notifications based on user activity.
 *
 * @param {string} userId - The ID of the current user.
 */
const useNotifications = (userId) => {
  useEffect(() => {
    // Request Notification Permission on mount
    const requestPermission = async () => {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications.');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied.');
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {

    if (!userId) return;
console.log('run')
    // Helper Functions
    const getTodayDateKey = () => {
      const today = new Date();
      return today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    };

    const getMonthKey = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`; // 'YYYY-MM'
    };

    const formatDateKey = (date) => {
      return date.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    };

    const incrementMainNotificationsSent = () => {
      const todayKey = getTodayDateKey();
      const count = parseInt(localStorage.getItem(`mainNotifications_${todayKey}`) || '0', 10);
      localStorage.setItem(`mainNotifications_${todayKey}`, count + 1);
    };

    const getMainNotificationsSent = () => {
      const todayKey = getTodayDateKey();
      return parseInt(localStorage.getItem(`mainNotifications_${todayKey}`) || '0', 10);
    };

    const sendNotification = (title, message) => {
      if (Notification.permission !== 'granted') return;

      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body: message,
          icon: '/images/logo.png', // Adjust the path as needed
          badge: '/images/favicon-32x32.png', // Adjust the path as needed
        });
      });
    };

    // Main Notification Handlers
    const sendStartOfDayNotifications = async () => {
      if (getMainNotificationsSent() >= 3) return;

      const today = new Date();
      const dateKey = formatDateKey(today);
      const recordsCollection = collection(db, 'users', userId, 'records');
      const recordDocRef = doc(recordsCollection, dateKey);
      const recordDoc = await getDoc(recordDocRef);
      const recordData = recordDoc.exists() ? recordDoc.data() : {};

      // 1. Check Sleep Start Time
      if (!recordData.sleepStartTime) {
        sendNotification(
          'Sleep Reminder',
          'It looks like you forgot to log your sleep start time. Please log it to track your day.'
        );
        incrementMainNotificationsSent();
        return; // Prioritize highest priority
      }

      // 2. Check Work Start Time
      if (!recordData.workStartTime) {
        const messages = [
          'Log your work start time to kick off the day.',
          'Don’t forget to log your start time.',
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        sendNotification('Work Start Reminder', message);
        incrementMainNotificationsSent();
        return;
      }

      // 3. Check Motivation Level
      if (recordData.motivationLevel === undefined || recordData.motivationLevel === null) {
        sendNotification(
          'Motivation Reminder',
          'Go set your motivation level, don’t forget.'
        );
        incrementMainNotificationsSent();
      }
    };

    const sendMiddayNotifications = async () => {
      if (getMainNotificationsSent() >= 3) return;

      const today = new Date();
      const dateKey = formatDateKey(today);
      const recordsCollection = collection(db, 'users', userId, 'records');
      const recordDocRef = doc(recordsCollection, dateKey);
      const recordDoc = await getDoc(recordDocRef);
      const recordData = recordDoc.exists() ? recordDoc.data() : {};

      const needsMotivation = recordData.motivationLevel === undefined || recordData.motivationLevel === null;
      const needsWorkout = recordData.didWorkout === undefined || recordData.didWorkout === null;

      if (needsMotivation || needsWorkout) {
        const messages = [
          "How’s your motivation? Set your level if you haven’t yet.",
          'Did you log your workout today?',
          "Make sure you’ve logged your sleep, motivation, or workout.",
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        sendNotification('Midday Reminder', message);
        incrementMainNotificationsSent();
      }
    };

    const sendEndOfDayNotifications = async () => {
      if (getMainNotificationsSent() >= 3) return;

      const today = new Date();
      const dateKey = formatDateKey(today);
      const recordsCollection = collection(db, 'users', userId, 'records');
      const recordDocRef = doc(recordsCollection, dateKey);
      const recordDoc = await getDoc(recordDocRef);
      const recordData = recordDoc.exists() ? recordDoc.data() : {};

      const hasWorkHours = recordData.workHours !== undefined && recordData.workHours !== null;
      const hasEarnings = recordData.earnings !== undefined && recordData.earnings !== null;
      const hasProjects = recordData.projectsCount !== undefined && recordData.projectsCount !== null;

      if (!hasWorkHours || !hasEarnings || !hasProjects) {
        const messages = [
          'Log your work hours, earnings, and projects before the day ends.',
          'Wrap up your day by logging work hours, earnings, and projects.',
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        sendNotification('End of Day Reminder', message);
        incrementMainNotificationsSent();
      }
    };

    // Schedule Notifications
    const scheduleNotifications = () => {
      const now = new Date();

      // Schedule Start of Day Notification (8:00 AM)
      const startOfDay = new Date(now);
      startOfDay.setHours(8, 0, 0, 0);
      if (startOfDay <= now) {
        startOfDay.setDate(startOfDay.getDate() + 1);
      }
      const delayStartOfDay = startOfDay.getTime() - now.getTime();
      setTimeout(sendStartOfDayNotifications, delayStartOfDay);

      // Schedule Midday Notification (1:00 PM)
      const midday = new Date(now);
      midday.setHours(13, 0, 0, 0);
      if (midday <= now) {
        midday.setDate(midday.getDate() + 1);
      }
      const delayMidday = midday.getTime() - now.getTime();
      setTimeout(sendMiddayNotifications, delayMidday);

      // Schedule End of Day Notification (8:00 PM)
      const endOfDay = new Date(now);
      endOfDay.setHours(20, 0, 0, 0);
      if (endOfDay <= now) {
        endOfDay.setDate(endOfDay.getDate() + 1);
      }
      const delayEndOfDay = endOfDay.getTime() - now.getTime();
      setTimeout(sendEndOfDayNotifications, delayEndOfDay);
    };

    // Initialize Scheduling
    scheduleNotifications();

    // Cleanup function to handle component unmounting
    return () => {
      // Note: In this simple implementation, we aren't clearing the timeouts.
      // For a more robust solution, consider storing the timeout IDs and clearing them here.
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Additional Helpful Reminders (Unbounded)
    const sendAdditionalReminders = async () => {
      const today = new Date();
      const dateKey = today.toISOString().split('T')[0];
      const recordsCollection = collection(db, 'users', userId, 'records');
      const recordDocRef = doc(recordsCollection, dateKey);
      const recordDoc = await getDoc(recordDocRef);
      const recordData = recordDoc.exists() ? recordDoc.data() : {};

      // 1. Sleep Recovery
      if (recordData.sleepHours && recordData.sleepHours < 6) {
        sendNotification(
          'Sleep Recovery',
          'You’ve logged less than 6 hours of sleep. Try to catch up tonight to boost tomorrow’s productivity!'
        );
      }

      // 2. Workout Motivation
      if (recordData.workoutsThisWeek) { // Assuming you track this
        sendNotification(
          'Workout Motivation',
          `You’ve logged ${recordData.workoutsThisWeek} workouts this week. Keep that energy going strong!`
        );
      }

      // 3. Progress Motivation
      if (recordData.hoursWorkedToday) { // Assuming you track this
        sendNotification(
          'Progress Update',
          `You’ve worked ${recordData.hoursWorkedToday} hours today. Stay on track with your goals!`
        );
      }

      // 4. Break Reminder
      if (recordData.continuousWorkHours && recordData.continuousWorkHours >= 4) { // Example condition
        sendNotification(
          'Take a Break',
          'Remember to take a quick break—it helps with focus!'
        );
      }

      // 5. Milestone Check
      if (recordData.monthlyEarnings && recordData.monthlyEarnings >= 0.9 * recordData.selectedGoal) { // 90% of goal
        sendNotification(
          'Milestone Almost Reached',
          `You’re ${Math.round((recordData.monthlyEarnings / recordData.selectedGoal) * 100)}% closer to your monthly goal. Keep pushing forward!`
        );
      }

      // 6. Missed Activity
      if (recordData.missedWorkoutYesterday) { // Assuming you track this
        sendNotification(
          'Missed Workout',
          'Missed a workout yesterday? Let’s get back on track today!'
        );
      }
    };

    // Schedule Additional Reminders Every 2 Hours
    const intervalId = setInterval(() => {
      sendAdditionalReminders();
    }, 2 * 60 * 60 * 1000); // Every 2 hours

    // Initial call
    sendAdditionalReminders();

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, [userId]);
};

export default useNotifications;
