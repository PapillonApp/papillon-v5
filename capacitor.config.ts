import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

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
		Keyboard: {
			resize: KeyboardResize.Ionic,
		},
		"CapacitorHttp": {
			"enabled": true
		}
	},
	server : {
		url: "http://localhost:8100/" // Address of the server running locally
	},
};

export default config;
