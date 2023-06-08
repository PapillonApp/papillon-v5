<script>
    import { defineComponent } from 'vue';
    import {
        IonButton,
        alertController
    } from '@ionic/vue';

    import packageInfo from '/package'
    import { Capacitor } from '@capacitor/core';

    import { Browser } from '@capacitor/browser';

    import { StatusBar, Style } from '@capacitor/status-bar';
    import { NavigationBar } from '@mauricewegner/capacitor-navigation-bar';

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
            },
            async openURL(url) {
                await Browser.open({
                    url: url
                });
            },
            async displayServiceMsg() {
                const alert = await alertController.create({
                    header: 'Vous ne voyez pas votre service scolaire',
                    message: `Papillon fonctionne grâce à une équipe de développeurs volontaires. Si vous pensez pouvoir ajouter un service à Papillon, n'hésitez pas à contribuer.`,
                    mode: 'md',
                    buttons: [
                        {
                            text: 'Contribuer',
                            handler: () => {
                                this.openURL('https://github.com/PapillonApp/Papillon');
                            },
                            cssClass: 'btn_secondary',
                        },
                        {
                            text: 'Je comprends',
                        }
                    ]
                });

                await alert.present();
            }
        },
        data() {
            return {
                LoginSelect: LoginSelect,
                appVersion: packageInfo.version,
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
            <img src="/assets/welcome/papillon.svg" alt="Logo de Papillon" class="logo">
            <p class="description">Bienvenue sur Papillon, votre nouvelle app scolaire que vous risquez d'adorer !</p>

            <div class="buttons">
                <ion-nav-link router-direction="forward" :component="LoginSelect">
                    <ion-button mode="md" color="dark" fill="solid" @click="goNormalStatusBar">
                        Se connecter avec
                        
                        <div class="logo_services">
                            <img alt="Logo" src="/assets/welcome/pronote_logo.png" />
                            <img alt="Logo" src="/assets/welcome/ecoledirecte_logo.png" />
                            <img alt="Logo" src="/assets/welcome/skolengo_logo.png" />
                            <!-- <img alt="Logo" src="/assets/welcome/apschool_logo.png" />
                            <img alt="Logo" src="/assets/welcome/lvs_logo.png" /> -->
                        </div>
                    </ion-button>
                </ion-nav-link>

                <ion-button class="no_service" mode="md" color="dark" fill="clear" @click="displayServiceMsg">
                    Je ne vois pas mon service scolaire
                </ion-button>
            </div>

            <div class="version">
                <p class="version_text"><span>version {{ appVersion }}-{{ appPlatform }}</span></p>
            </div>
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
    
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
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
        width: auto;
        margin-top: -10vh;
    }

    .description {
        max-width: 80vw;
        text-align: center;

        font-family: var(--papillon-font);

        font-size: 17px;
        line-height: 17px;
        font-weight: 500;

        margin: 0;
        margin-top: 10px;

        opacity: 0.7;
    }

    .buttons {
        margin-top: 30px;
        width: 90vw;
    }

    ion-button {
        width: 100%;
        --border-radius: 8px !important;
    }

    ion-button span {
        margin-left: 10px;
        color: #186F5A !important;
    }

    .logo_services {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 5px;
        margin-left: 10px;
    }

    .logo_services img {
        height: 24px;
        width: auto;
    }

    .no_service {
        font-size: 13px;
        font-weight: 500;
        opacity: 0.7;
    }

    .version {
        position: absolute;
        bottom: calc(28px + env(safe-area-inset-bottom));
        left: 30px;
        width: calc(100% - 30px * 2);
    }

    .version_text {
        font-size: 11px;
        font-weight: 400;
        opacity: 0.3;
        width: 100%;
        text-align: center;
        margin: 0;
    }
</style>
