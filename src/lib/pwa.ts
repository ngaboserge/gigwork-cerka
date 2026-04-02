// PWA Service Worker Registration and Management

export function registerServiceWorker() {
  // TEMPORARILY DISABLED FOR DEVELOPMENT - UNREGISTERING EXISTING SW
  console.log('⚠️ Service Worker DISABLED for development - clearing cache');
  
  if ('serviceWorker' in navigator) {
    // Unregister all existing service workers
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
        console.log('🗑️ Unregistered service worker');
      });
    });
    
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
          console.log('🗑️ Deleted cache:', name);
        });
      });
    }
  }
  
  /* ORIGINAL CODE - RE-ENABLE FOR PRODUCTION
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration.scope);

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  }
  */
}

function showUpdateNotification() {
  // Show a toast or notification that an update is available
  const updateBanner = document.createElement('div');
  updateBanner.className = 'fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
  updateBanner.innerHTML = `
    <span>A new version is available!</span>
    <button id="reload-btn" class="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-blue-50">
      Update Now
    </button>
  `;
  document.body.appendChild(updateBanner);

  document.getElementById('reload-btn')?.addEventListener('click', () => {
    window.location.reload();
  });
}

// Check if app is installed
export function isAppInstalled(): boolean {
  // Check if running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check for iOS standalone
  if ((window.navigator as any).standalone === true) {
    return true;
  }

  return false;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
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

// Show notification
export function showNotification(title: string, options?: NotificationOptions) {
  if (Notification.permission === 'granted') {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          icon: '/pwa-icons/android/android-launchericon-192-192.png',
          badge: '/pwa-icons/android/android-launchericon-72-72.png',
          ...options
        } as any);
      });
    } else {
      new Notification(title, {
        icon: '/pwa-icons/android/android-launchericon-192-192.png',
        ...options
      });
    }
  }
}

// Check for app updates
export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  }
}

// Get app info
export function getAppInfo() {
  return {
    isInstalled: isAppInstalled(),
    isOnline: navigator.onLine,
    hasNotifications: 'Notification' in window,
    notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported',
    hasServiceWorker: 'serviceWorker' in navigator
  };
}
