<script>
    import { defineComponent } from 'vue';
    import {
        IonButton
    } from '@ionic/vue';

    import { version } from '/package'
    import { Capacitor } from '@capacitor/core';

    import { StatusBar, Style } from '@capacitor/status-bar';
    import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';

    import LoginSelect from './LoginSelect.vue';

    export default defineComponent({
        name: 'FolderPage',
        components: {
            
        },
        setup() {
            return { 
                IonButton
            }
        },
        methods: {
            goNormalStatusBar() {
                setTimeout(() => {
                    if (Capacitor.getPlatform() === 'android') {
                        let isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                        if (isDarkMode) {
                            StatusBar.setBackgroundColor({color: "#1C1B1F"});
                            StatusBar.setStyle({style: Style.Dark})
                        }
                        else {
                            StatusBar.setBackgroundColor({color: "#ffffff"});
                            StatusBar.setStyle({style: Style.Light})
                        }

                        if (isDarkMode) {
                            NavigationBar.setColor({
                                    color: "#1C1B1F",
                                    darkButtons: false
                            });
                        }
                        else {
                            NavigationBar.setColor({
                                    color: "#ffffff",
                                    darkButtons: true
                            });
                        }
                    }
                }, 200);
            }
        },
        data() {
            return {
                LoginSelect: LoginSelect,
                appVersion: version,
                appPlatform: Capacitor.getPlatform(),
                status: "",
            }
        },
        mounted() {
            if (Capacitor.getPlatform() === 'android') {
                StatusBar.setStyle({ style: Style.Dark });
                StatusBar.setBackgroundColor({color: "#12D4A6"});
                NavigationBar.setColor({
                        color: "#186F5A",
                        darkButtons: false
                });
            }

            return;
        }
    });
</script>

<template>
      <ion-content :fullscreen="true">
        <div class="content">
            <svg width="88" height="88" viewBox="0 0 88 88" class="logo" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M17.3862 20.3517C17.8251 22.254 18.4328 24.2276 19.2049 26.2334C17.233 26.4291 15.3635 26.7334 13.6252 27.1432C10.4241 27.898 7.45401 29.0608 5.09542 30.7461C2.71558 32.4466 0.714628 34.8742 0.152301 38.0891C-0.410025 41.304 0.646603 44.2751 2.30599 46.6936C3.95055 49.0905 6.34697 51.2072 9.09903 53.0201C9.61312 53.3588 10.146 53.6911 10.6967 54.0164C16.0721 57.2178 23.164 59.7585 30.9794 61.1477C39.7934 62.7144 48.1785 61.8758 54.551 60.0196C54.8996 59.9181 55.2439 59.813 55.5836 59.7045C54.6476 63.6853 54.0108 67.4819 53.7113 70.8461C53.4187 74.1316 53.4244 77.2488 53.9123 79.8046C54.2814 81.7378 55.203 84.777 57.853 86.3101C58.2066 86.5251 58.5919 86.713 59.0119 86.8671C62.2065 88.0392 65.1384 86.5358 66.9597 85.186C68.9397 83.7184 70.8476 81.5516 72.6145 79.0764C76.1849 74.0749 79.7891 66.9471 82.7042 58.8732C85.6193 50.7993 87.4032 43.0036 87.8573 36.8587C88.082 33.8177 88.0021 30.9215 87.4211 28.5143C86.9518 26.5704 85.9024 23.9811 83.4915 22.5847C83.1223 22.3605 82.7204 22.1646 82.2825 22.0039C79.4221 20.9544 76.6865 21.9148 74.7129 23.1414C72.6977 24.3939 70.7974 26.3115 69.0563 28.5502C67.8353 30.1201 66.616 31.9476 65.4221 34.0038C63.4702 28.9876 60.3813 23.3415 55.8178 17.859C50.9037 11.9553 45.4073 7.17193 40.1494 4.06478C39.3928 3.61427 38.6411 3.19833 37.8965 2.81861C34.963 1.32248 31.9464 0.288678 29.065 0.0513678C26.1577 -0.188081 23.0769 0.375023 20.5962 2.4734L20.6822 2.57664C18.2374 4.66475 17.111 7.68107 16.7172 10.6173C16.3166 13.6041 16.6015 16.9506 17.3862 20.3517ZM34.0865 10.7261C34.624 11.0003 35.173 11.3025 35.7316 11.6323C39.9234 14.1308 44.6397 18.1644 49.0232 23.4307C51.7948 26.7605 53.913 30.1378 55.4902 33.3026C50.3415 30.5279 43.8684 28.3314 36.8042 27.0758C34.0283 26.5823 31.2888 26.2569 28.6351 26.0941C27.3468 23.3956 26.4247 20.7662 25.8701 18.3625C25.2493 15.6721 25.1286 13.437 25.349 11.7937C25.5742 10.1145 26.0861 9.46783 26.3173 9.27229C26.5376 9.08593 27.1035 8.7622 28.4779 8.8754C29.8783 8.99073 31.7786 9.54906 34.0865 10.7261ZM32.3698 52.4279C25.4006 51.1891 19.3925 48.9738 15.115 46.4492C14.7237 46.2159 14.3472 45.9801 13.986 45.7421C11.8209 44.3158 10.3911 42.936 9.59181 41.7711C8.80735 40.6277 8.8025 39.9718 8.85244 39.6863C8.90238 39.4008 9.12948 38.7861 10.2545 37.9822C11.4008 37.1631 13.2126 36.3595 15.731 35.7657C17.959 35.2404 20.5736 34.9184 23.4641 34.8421C24.8966 37.195 26.544 39.5169 28.3994 41.746C32.7962 47.0283 37.9982 50.7291 43.1588 53.0221C39.7874 53.2393 36.127 53.0958 32.3698 52.4279ZM35.4138 35.7956C42.3832 37.0344 48.3915 39.2498 52.6691 41.7746C53.0602 42.0078 53.4366 42.2435 53.7976 42.4813C55.9627 43.9077 57.3925 45.2875 58.1918 46.4524C58.2981 46.6074 58.3902 46.7534 58.4696 46.8908C58.0979 46.9731 57.6767 47.041 57.2022 47.0865C55.4107 47.2582 53.1469 47.0772 50.6119 46.3933C45.5501 45.0278 39.7788 41.7566 35.0719 36.1019C34.9541 35.9604 34.8374 35.8185 34.7217 35.6763C34.9518 35.7147 35.1825 35.7544 35.4138 35.7956ZM76.0331 34.0404C77.1834 32.5615 78.1729 31.5908 78.9375 31.0125C79.141 32.174 79.2155 33.879 79.0489 36.1339C78.6693 41.2702 77.119 48.2585 74.397 55.7976C71.6751 63.3366 68.4067 69.6946 65.4224 73.8751C64.2957 75.4534 63.2917 76.6047 62.4625 77.3782C62.3044 75.9908 62.2968 74.0848 62.5088 71.7035C62.9977 66.2135 64.5718 59.0607 67.0785 51.8774C67.2094 51.596 67.3262 51.2998 67.4234 50.9891C67.6429 50.517 67.7956 50.0433 67.9039 49.602C70.5051 42.7012 73.4168 37.4044 76.0331 34.0404Z"/>
            </svg>

            <h1 class="welcomeTitle">Bienvenue dans la nouvelle ère de la vie scolaire numérique</h1>
            <p class="welcomeText">Papillon, c’est votre nouveau portail vers votre scolarité, avec plein de fonctionnalités que vous allez forcément adorer.</p>

            <ion-nav-link router-direction="forward" :component="LoginSelect">
                <ion-button mode="md" color="dark" fill="solid" @click="goNormalStatusBar">
                    Commencer
                    <span class="material-symbols-outlined mdls" slot="end">arrow_forward</span>
                </ion-button>
            </ion-nav-link>

            <small class="version">
                <span>version {{ appVersion }}-{{ appPlatform }}</span><br />
            </small>
        </div>
      </ion-content>
</template>
  
<style scoped>
    .content {
        height: 100%;
        width: 100%;
        position: fixed;

        padding: 30px 30px !important;
        padding-top: calc(30px + env(safe-area-inset-top)) !important;

        background: linear-gradient(180deg, #12D4A6 2.24%, #186F5A 91.53%);
    }

    .content * {
        --ion-color-dark: #f4f5f8 !important;
        --ion-color-dark-rgb: 244,245,248 !important;
        --ion-color-dark-contrast: #186F5A !important;

        color: #fff;
    }

    .logo {
        fill: #fff;
        height: 36px;
        width: 36px;
    }

    .welcomeTitle {
        font-size: 2rem;
        line-height: 1.9rem;
        letter-spacing: -0.02em;
        font-weight: 600 !important;
        text-align: left;
        margin-top: 20px;
    }

    .welcomeText {
        font-size: 1.1rem;
        line-height: 1.2rem;
        letter-spacing: -0.01em;
        text-align: left;
        margin-top: 15px;
        font-weight: 500 !important;
        font-family: var(--papillon-font), sans-serif;
    }

    ion-button {
        margin-top: 10px;
        position: absolute;
        bottom: calc(25px + env(safe-area-inset-bottom));
        right: 30px;
        --border-radius: 8px !important;
    }

    ion-button span {
        margin-left: 10px;
        color: #186F5A !important;
    }

    .version {
        position: absolute;
        bottom: calc(28px + env(safe-area-inset-bottom));
        left: 30px;
        font-size: 11px;
        font-weight: 500;
        opacity: 0.3;
        width: calc(100% - 180px - 30px * 2);
    }
</style>
