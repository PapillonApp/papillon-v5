import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vincelinise.papillon',
  appName: 'Papillon',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    "SplashScreen": {
      "launchShowDuration": 3000,
      "launchAutoHide": false,
      "backgroundColor": "#ffffffff",
      "androidSplashResourceName": "ic_launcher",
      "androidScaleType": "CENTER_CROP",
      "androidSpinnerStyle": "large",
      "iosSpinnerStyle": "small",
      "spinnerColor": "#999999",
      "showSpinner": true,
      "splashFullScreen": true,
      "splashImmersive": true
    }
  },
  server: {
    url: "http://192.168.1.22:8100",
    cleartext: true
  },
};

export default config;
