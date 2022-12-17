<script>
    import { defineComponent } from 'vue';
    import { IonItem, IonLabel, IonList, IonAvatar, IonIcon, IonNavLink } from '@ionic/vue';
    
    import { logoDiscord, logoGithub, bugOutline, bugSharp, informationCircleOutline, informationCircleSharp } from 'ionicons/icons';

    import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet';

    import SchoolSelection from './pronote/SchoolSelection.vue';

    export default defineComponent({
        name: 'FolderPage',
        components: {
            IonItem,
            IonLabel,
            IonList,
            IonAvatar,
            IonIcon,
            IonNavLink
        },
        setup() {
            return { 
                logoDiscord,
                logoGithub,
                bugOutline,
                bugSharp,
                informationCircleOutline,
                informationCircleSharp
            }
        },
        methods: {
            openActions() {
                const showActions = async () => {
                const result = await ActionSheet.showActions({
                    title: 'Photo Options',
                    message: 'Select an option to perform',
                    options: [
                    {
                        title: 'Upload',
                    },
                    {
                        title: 'Share',
                    },
                    {
                        title: 'Remove',
                        style: ActionSheetButtonStyle.Destructive,
                    },
                    ],
                });

                console.log('Action Sheet result:', result);
                };
            }
        },
        data() {
            return {
                SchoolSelection: SchoolSelection,
            }
        }
    });
</script>

<template>
      <ion-header>
        <ion-toolbar>
          <ion-title>Bienvenue dans Papillon</ion-title>
        </ion-toolbar>
      </ion-header>
      
      <ion-content :fullscreen="true">
        <ion-header collapse="condense">
            <ion-toolbar>
              <ion-title size="large">Bienvenue dans Papillon</ion-title>
            </ion-toolbar>
        </ion-header>

        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Sélectionnez un service scolaire pour commencer</p>
                </ion-label>
            </ion-list-header>

            <ion-nav-link router-direction="forward" :component="SchoolSelection">
                <ion-item detail="true" button>
                    <ion-avatar slot="start">
                        <img alt="Logo" src="/assets/welcome/pronote_logo.png" />
                    </ion-avatar>
                    <ion-label>
                        <h2>Pronote</h2>
                        <p>Utilisez Pronote et votre ENT pour vous connecter</p>
                    </ion-label>
                </ion-item>
            </ion-nav-link>

            <ion-item button detail="true" disabled>
                <ion-avatar slot="start">
                    <img alt="Logo" src="/assets/welcome/ecoledirecte_logo.png" />
                </ion-avatar>
                <ion-label>
                    <h2>EcoleDirecte</h2>
                    <p>Utilisez vos identifiants EcoleDirecte pour vous connecter</p>
                </ion-label>
            </ion-item>

            <ion-item button detail="true" disabled>
                <ion-avatar slot="start">
                    <img alt="Logo" src="/assets/welcome/apschool_logo.png" />
                </ion-avatar>
                <ion-label>
                    <h2>APSchool</h2>
                    <p>Utilisez vos identifiants APSchool pour vous connecter</p>
                </ion-label>
            </ion-item>
        </ion-list>

        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Alternativement, vous pouvez aussi</p>
                </ion-label>
            </ion-list-header>

            <ion-item button href="https://discord.gg/DMx3TDyz2U">
                <ion-icon slot="start" :icon="logoDiscord"></ion-icon>
                <ion-label>
                    <h2>Rejoindre la communauté</h2>
                    <p>Discutez avec d'autres personnes intéressées par le projet</p>
                </ion-label>
            </ion-item>

            <ion-item button href="https://github.com/PapillonApp/Papillon">
                <ion-icon slot="start" :icon="logoGithub"></ion-icon>
                <ion-label>
                    <h2>Contribuer au projet Papillon</h2>
                    <p>Ajoutez de vos idées et de votre temps au projet</p>
                </ion-label>
            </ion-item>
        </ion-list>

        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Plus d'options</p>
                </ion-label>
            </ion-list-header>

            <ion-item button href="https://github.com/PapillonApp/Papillon/issues">
                <ion-icon class="icon" slot="start" :ios="bugOutline" :md="bugSharp"></ion-icon>
                <ion-label>
                    <h2>Signaler un bug ou une erreur</h2>
                    <p>Reportez votre problème sur GitHub</p>
                </ion-label>
            </ion-item>

            <ion-item button href="https://pronote.plus/assets/terms_privacy_23112022_rev0.pdf">
                <ion-icon class="icon" slot="start" :ios="informationCircleOutline" :md="informationCircleSharp"></ion-icon>
                <ion-label>
                    Mentions légales
                </ion-label>
            </ion-item>
        </ion-list>
      </ion-content>
</template>
  
<style scoped>
    .ios .icon {
        opacity: 50%;
    }
</style>
