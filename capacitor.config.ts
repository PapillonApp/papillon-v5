import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vincelinise.papillon',
  appName: 'Papillon',
  webDir: 'dist',
  bundledWebRuntime: false,
  "server": {
    "url": "http://192.168.1.22:8100",
    "cleartext": true
  },
};

export default config;
