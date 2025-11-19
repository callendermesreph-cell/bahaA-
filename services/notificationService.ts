
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
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
};

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    const options = {
      body,
      icon: '/logo.png', // Updated to use your uploaded logo
      vibrate: [200, 100, 200],
      tag: 'daily-news' // Prevents duplicate notifications stacking
    };
    
    const notification = new Notification(title, options);
    
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};

export const checkAndTriggerScheduledNotification = () => {
  // Türkiye saati (UTC+3)
  const now = new Date();
  
  // Check if notification already sent today
  const todayStr = now.toISOString().split('T')[0];
  const lastSentDate = localStorage.getItem('lastNotificationDate');

  if (lastSentDate === todayStr) {
    return; // Already sent today
  }

  // Get time in Turkey
  const trTimeStr = now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" });
  const trTime = new Date(trTimeStr);
  const currentHour = trTime.getHours();
  const currentMinute = trTime.getMinutes();

  // Target: 11:00 AM
  if (currentHour >= 11) {
    sendNotification(
      "bahaAİ Günlük Bülten Hazır! 🤖",
      "Yapay zeka dünyasındaki son gelişmeleri okumak için dokunun."
    );
    localStorage.setItem('lastNotificationDate', todayStr);
  }
};
