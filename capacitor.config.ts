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
    }
  },
  /* server: {
    url: "http://192.168.1.22:8100",
    cleartext: true
  }, */
};

export default config;
