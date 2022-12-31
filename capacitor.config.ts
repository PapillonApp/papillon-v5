import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vinceline.papillon',
  appName: 'Papillon',
  webDir: 'dist',
  bundledWebRuntime: false,
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
