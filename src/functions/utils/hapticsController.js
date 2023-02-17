import { Haptics } from '@capacitor/haptics';

async function notification(type) {
    await Haptics.notification({ type: type });
}

async function impact(style) {
    await Haptics.impact({ style: style });
}

export default {
    notification,
    impact
}