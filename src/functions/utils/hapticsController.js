import { Haptics } from '@capacitor/haptics';

async function notification(type) {
    await Haptics.notification({ type: type });
}

async function impact(style) {
    await Haptics.impact({ style: style });
}

async function confetti() {
    let repeat = 5;
    let interval = setInterval(async () => {
        
        await Haptics.impact({ style: 'MEDIUM' });

        if (repeat === 0) {
            clearInterval(interval);
        }

        repeat--;
    }, 50);
}

export default {
    notification,
    impact,
    confetti
}