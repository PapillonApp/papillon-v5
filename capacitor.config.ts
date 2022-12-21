import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vincelinise.papillon',
  appName: 'Papillon',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    "SplashScreen": {
      "launchAutoHide": false,
    }
  },
};

export default config;
