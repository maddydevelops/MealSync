/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCXqZ8VAAMFbv2KaqUz0IOfD-OQnIvHwh4",
  authDomain: "mealsync-68d59.firebaseapp.com",
  projectId: "mealsync-68d59",
  messagingSenderId: "485242424559",
  appId: "1:485242424559:web:8cf981faa62cb165addf1a",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/notification.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
