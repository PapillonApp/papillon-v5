<script>
    import { defineComponent } from 'vue';
    import { IonHeader, IonContent, IonToolbar, IonTitle, IonMenuButton, IonPage, IonButtons, IonList, IonLabel, IonItem, IonSpinner, IonSearchbar, IonNavLink } from '@ionic/vue';
    
    import { Browser } from '@capacitor/browser';

    import GetNews from '@/functions/fetch/GetNews.js';
    import InfoView from './InfoView.vue';

    export default defineComponent({
        name: 'FolderPage',
        components: {
            IonHeader,
            IonContent,
            IonToolbar,
            IonTitle,
            IonMenuButton,
            IonPage,
            IonButtons,
            IonItem,
            IonLabel,
            IonList,
            IonSpinner,
            IonSearchbar,
            IonNavLink
        },
        props() {
            return {
                urlNews: {
                    type: Object,
                    default: []
                }
            }
        },
        data() {
            return { 
                InfoView: InfoView,
                news: [],
                fullNews: [],
                presentingElement: null,
                isLoading: false,
            }
        },
        methods: {
            async openLink(url) {
                await Browser.open({
                    url: url,
					toolbarColor: '#1e1e1e',
					presentationStyle: 'popover',
                });
            },
            getNewsRefresh() {
                this.isLoading = true;
                GetNews(true).then((data) => {
                    this.isLoading = false;
                    this.news = data;
                })
            },
            searchNews() {
                let search1 = this.$refs.searchBar.$el.value;
                let search2 = this.$refs.searchBar.$el.value;
                let news = this.fullNews;

                if (search1 == "" && search2 == "") {
                    this.news = news;
                } else {
                    let search = search1 == "" ? search2 : search1;
                    // filter news by name, content and author
                    let filteredNews = news.filter((news) => {
                        return news.title.toLowerCase().includes(search.toLowerCase()) || news.content.toLowerCase().includes(search.toLowerCase()) || news.author.toLowerCase().includes(search.toLowerCase());
                    });

                    this.news = filteredNews;
                }
            },
            handleRefresh(event) {
                // get new News data
                this.getNewsRefresh()

                // stop refresh when this.news is updated
                this.$watch('news', () => {
                    setTimeout(() => {
                        event.target.complete();
                    }, 200);
                });
            },
        },
        mounted() {
            this.presentingElement = this.$refs.page.$el;

            this.isLoading = true;
            GetNews().then((data) => {
                this.news = data;
                this.fullNews = data;
                
                this.isLoading = false;
            });

            document.addEventListener('tokenUpdated', () => {
                this.getNewsRefresh();
            });
        }
    });
</script>

<template>
    <ion-page ref="page">
      <IonHeader class="AppHeader" translucent>
        <IonToolbar>

          <ion-buttons slot="start">
            <ion-menu-button color="dark" mode="md"></ion-menu-button>
          </ion-buttons>

          <ion-title mode="md">Actualités</ion-title>
        </IonToolbar>
        <IonToolbar>
            <ion-searchbar ref="searchBar" placeholder="Rechercher une actualité, une personne..." @ionInput="searchNews()"></ion-searchbar>
        </IonToolbar>
      </IonHeader>
      
      <ion-content :fullscreen="true">
        <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
            <ion-refresher-content></ion-refresher-content>
        </ion-refresher>

        <Transition name="NoCoursAnim">
            <div class="NoCours" v-if="news.length == 0 && isLoading">
                <IonSpinner></IonSpinner>
                <br/>
                <h2>Téléchargement des actualités...</h2>
                <p>Veuillez patienter pendant qu'on récupère les actualités depuis nos serveurs...</p>
            </div>
            <div class="NoCours" v-else-if="news.length == 0 && !isLoading">
                <span class="material-symbols-outlined mdls">feed</span>
                <h2>Aucune actualité n'a été trouvée.</h2>
                <p>Revenez plus tard ou essayer de rafraîchir.</p>
            </div>
        </Transition>

        <IonList v-if="news.length !== 0">
            <IonNavLink v-for="(news, i) in news" v-bind:key="i" router-direction="forward" :component="InfoView" :componentProps="{urlNews: encodeURIComponent(JSON.stringify(news))}">
                <IonItem button>
                    <span v-if="news.title.toLowerCase().includes('menu')" slot="start" class="material-symbols-outlined mdls emoji">restaurant</span>
                    <span v-else-if="!news.isSurvey" class="material-symbols-outlined mdls" slot="start">feed</span>
                    <span v-else-if="news.isSurvey" class="material-symbols-outlined mdls" slot="start">contact_support</span>
                        <IonLabel>
                            <h2>{{ news.title }}</h2>
                            <p>{{ news.author }} - {{ news.category }}</p>
                            <small>{{ news.dateString }}</small>
                        </IonLabel>
                </IonItem>
            </IonNavLink>
        </IonList>
      </ion-content>
    </ion-page>
</template>
  
<style scoped>
    .ios .only-md {
        display: none;
    }

    .newsModalContent * {
        margin: 0;
    }

    .newsModalContent hr {
        margin: 15px 0px;
        background: #000;
        opacity: 25%;
    }

    .newsModalContent .chips {
        margin-top: 20px !important;
        margin-bottom: 20px !important;

        display: flex;
        flex-wrap: wrap;
    }

    .newsModalContent .chips ion-chip {
        margin-right: 5px;
        margin-bottom: 5px;
    }

    .newsModalContent .chips span {
        opacity: 50%;
        margin-right: 8px;
    }

    .newsModalContent .chips ion-chip p {
        max-width: 160px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .dark .newsModalContent hr {
        background: #fff !important;
    }

    .newsModalContent h1 {
        font-size: 1.5em;
        font-weight: 300 !important;
    }

    .newsModalContent small {
        font-size: 0.9em;
        font-weight: 400;
        opacity: 0.5;
    }

    .newsModalContentContent {
        zoom: 1.2;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }

    .survey-warning {
        margin: 25px 0px;
        color: var(--ion-color-danger);
        --background: var(--ion-color-danger-dark);
    }

    .survey-warning p {
        white-space: pre-line;
    }

    .survey-warning::part(native) {
        padding: 10px 18px;
        border-radius: 11px;
    }
</style>
