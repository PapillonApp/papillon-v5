import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'plus.pronote.app',
  appName: 'Papillon',
  webDir: 'dist',
  bundledWebRuntime: false,
  loggingBehavior: 'debug',
  plugins: {
    "SplashScreen": {
      "launchAutoHide": false,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_notify",
      iconColor: "#27A057",
      sound: "/public/audio/tone.ogg",
    },
  },
  /* server: {
    url: "http://192.168.1.22:8100",
    cleartext: true
  }, */
};

export default config;
