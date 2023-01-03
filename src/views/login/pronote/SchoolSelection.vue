<script>
    import { defineComponent } from 'vue';
    import { IonItem, IonLabel, IonList, IonAvatar, IonIcon, IonBackButton, IonSearchbar, IonSkeletonText, IonThumbnail, IonModal, toastController, alertController, IonListHeader, IonSpinner, loadingController } from '@ionic/vue';

    import axios from 'axios';
    import $ from "jquery";
    
    import { linkOutline, linkSharp, qrCodeOutline, qrCodeSharp, schoolOutline, schoolSharp, businessOutline, businessSharp, navigateOutline, navigateSharp, personCircleOutline, personCircleSharp } from 'ionicons/icons';

    import { Dialog } from '@capacitor/dialog';

    export default defineComponent({
        name: 'FolderPage',
        components: {
            IonBackButton,
            IonItem,
            IonList,
            IonIcon,
            IonSearchbar,
            IonModal,
            IonListHeader,
            IonSpinner
        },
        setup() {
            return { 
                linkOutline,
                linkSharp,
                qrCodeOutline,
                qrCodeSharp,
                schoolOutline,
                schoolSharp,
                businessOutline,
                businessSharp,
                navigateOutline,
                navigateSharp,
                personCircleOutline,
                personCircleSharp
            }
        },
        mounted() {
            this.getENTs();
        },
        methods: {
            async presentToast(msg, color, notDismissable) {
                const toast = await toastController.create({
                    message: msg,
                    duration: 2000,
                    position: "bottom",
                    color: color
                });

                await toast.present();
            },
            async presentError(msg, color, error) {
                const toast = await toastController.create({
                    message: msg,
                    duration: 2000,
                    position: "bottom",
                    color: color,
                    buttons: [
                        {
                        text: "Plus d'infos",
                        role: 'info',
                        handler: () => { 
                            if(error == "[object Object]") {
                                error = "Impossible d'obtenir plus d'infos."
                            }

                            this.alertDialogError(error)
                        }
                        },
                    ]
                });

                await toast.present();
            },
            async alertDialogError(err) {
                const alert = await alertController.create({
                    header: "Détails de l'erreur",
                    subHeader: "Une erreur s'est produite",
                    message: err,
                    buttons: ['OK'],
                });

                await alert.present();
            },
            decodeEntities(encodedString) {
                var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
                var translate = {
                    "nbsp":" ",
                    "amp" : "&",
                    "quot": "\"",
                    "lt"  : "<",
                    "gt"  : ">"
                };
                return encodedString.replace(translate_re, function(match, entity) {
                    return translate[entity];
                }).replace(/&#(\d+);/gi, function(match, numStr) {
                    var num = parseInt(numStr, 10);
                    return String.fromCharCode(num);
                });
            },
            async getENTs() {
                const infosAPI = this.$api + "/infos";

                const loading = await loadingController.create({
                    message: 'Obtention des ENTS...'
                });
                    
                loading.present();
                
                axios.get(infosAPI)
                .then(response => {
                    setTimeout(() => {
                        loading.dismiss();
                    }, 200);
                    this.ents = response.data.ent_list;
                })
            },
            getPostal(e) {
                let postal = e.detail.value
                postal = postal.normalize("NFD").replace(/\p{Diacritic}/gu, "");

                console.log(postal)

                if(postal.trim() == "") {
                    this.etabs = [];
                    this.etabsEmpty = true;
                    this.locationFailed = false;
                    return;
                }

                this.etabs = [];
                this.etabsEmpty = false;
                this.locationFailed = false;
                this.terms = e.detail.value;
                this.isLoading = true;
                
                axios.get('https://cors.api.pronote.plus/https://positionstack.com/geo_api.php?query=france+' + postal, {
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
                        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
                        'Access-Control-Allow-Credentials': 'true'
                    }
                })
                .then(response => {                      
                    let data = response.data.data;

                    let lat = data[0].latitude;
                    let lon = data[0].longitude;

                    this.foundCity = data[0].locality;

                    this.findEstablishments(lat, lon)
                })
                .catch(error => {
                    this.presentError(`Une erreur s'est produite pour obtenir votre code postal.`, "danger", error.stack)
                })
            },
            findEstablishments(lat, lon) {
                $.ajax('https://www.index-education.com/swie/geoloc.php', {
                    crossDomain: true,
                    data: {
                    data: JSON.stringify({
                        "nomFonction": "geoLoc",
                        "lat": lat,
                        "long": lon,
                    })
                    },
                    method: "POST"})
                    .done((data) => {
                        this.etabs = data;

                        if(this.etabs.length == 0) {
                            this.etabsEmpty = true;
                        } else {
                            this.etabsEmpty = false;
                        }

                        if(JSON.stringify(data) == "{}") {
                            this.locationFailed = true;
                        } else {
                            this.locationFailed = false;
                        }
                        
                        // remove all etabs with no URL
                        for (let i = 0; i < this.etabs.length; i++) {
                            if (this.etabs[i].url == "" || this.etabs[i].url == null) {
                                this.etabs.splice(i, 1);
                            }
                        }

                        // decode etabName html entities
                        for (let i = 0; i < this.etabs.length; i++) {
                            this.etabs[i].nomEtab = this.decodeEntities(this.etabs[i].nomEtab);
                        }

                        setTimeout(() => {
                            this.isLoading = false;
                        }, 200);
                    })
                    .fail((error) => {
                        console.error(error)
                        
                        if(this.retries < 3) {
                            setTimeout(() => {
                                this.findEstablishments(lat, lon);
                            }, 1000);
                            this.retries++;
                        }
                        else {
                            this.presentError(`Une erreur s'est produite pour obtenir les établissements à proximité.`, "danger", error.stack)
                        }
                    });
            },
            clearEtabs() {
                this.etabs = [];
                this.etabsEmpty = true;
            },
            async URLLogin() {
                const { value, cancelled } = await Dialog.prompt({
                    title: 'Connexion avec une URL Pronote',
                    message: `Entrez l'URL Pronote fournie par votre établissement.`,
                });

                if(!cancelled) {
                    let etaburl = value;

                    // remove everything after the last / if includes 'eleve.html'
                    if(etaburl.includes('eleve.html')) {
                        etaburl = etaburl.split('/').slice(0, -1).join('/');
                    }

                    this.loginToEtab(etaburl);
                }
            },
            loginToDemo() {
                this.loginToEtab("https://demo.index-education.net/pronote");

                setTimeout(() => {
                    this.$refs.user.value = "demonstration";
                    this.$refs.pass.value = "pronotevs";

                    this.login();
                }, 1000);
            },
            loginToEtab(url) {
                // lowercase url
                url = url.toLowerCase();
                let etab = url.toLowerCase();

                // start loading
                this.isLoading = true;

                // get ENT
                axios.get(`https://api.androne.dev/papillon-v4/redirect.php?url=${encodeURIComponent(etab)}`)
                .then(response => {
                    // end loading
                    this.isLoading = false;

                    let resp = response.data.url;
                    let cas_host = resp.split('/')[2];
                    cas_host = cas_host.split('/')[0] || cas_host;
                    console.log(cas_host);
                    if(cas_host.includes("index-education.net")) {
                        cas_host = "index-education.net";
                    }
                    // more toutatice weird stuff
                    if(cas_host.includes("pronote.toutatice.fr")) {
                        cas_host = "www.toutatice.fr";
                    }
                    console.log(cas_host);
                    
                    
                    let all_cas_same_host = this.ents.filter(cas => cas.url == cas_host);

                    let cas = all_cas_same_host[0];
                    if (all_cas_same_host.length == 0) {
                        // no CAS for this host
                        this.presentToast(`Aucun CAS trouvé pour ${cas_host}.`, "danger")
                    }
                    else if (all_cas_same_host.length >= 1) {
                        // only one CAS for this host
                        cas = all_cas_same_host[0].py;
                    }

                    console.log(url);

                    // TODO: Vérifier si ca fonctionne pour toutatice
                    if(url == resp && url.includes("index-education.net")) {
                        // car toutatice est chelou
                        this.loginToEtab(url.replace("index-education.net", "pronote.toutatice.fr"));
                    }
                    else {
                        if(!etab.includes("eleve.html")) {
                            if(etab.includes("/pronote/")) {
                                etab = etab + "eleve.html";
                            }
                            else {
                                etab = etab + "/" + "eleve.html";
                            }
                        }
                        
                        // put etab to lowercase
                        etab = etab.toLowerCase();

                        this.etabUrl = etab;
                        this.etabCas = cas;
                        
                        // get cas name in all_cas_same_host
                        let cas_name = all_cas_same_host[0].name;
                        this.displayCas = cas_name;
                        this.isEduconnectLogin = all_cas_same_host[0].educonnect == true;

                        this.$refs.loginModal.$el.present()
                    }
                });
            },
            dismiss() {
                this.$refs.loginModal.$el.dismiss();
            },
            login() {
                const API = this.$api;

                let username = this.$refs.user.value;
                let password = this.$refs.pass.value;
                let cas = this.etabCas;
                let url = this.etabUrl;

                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                
                var urlencoded = new URLSearchParams();
                urlencoded.append("url", url);
                urlencoded.append("ent", cas);
                urlencoded.append("username", username);
                urlencoded.append("password", password);

                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: urlencoded,
                    redirect: 'follow'
                };

                this.presentToast("Connexion en cours...", "dark", true)

                fetch(API + "/generatetoken", requestOptions)
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);

                        if(!result.token) {
                            if(result.error ==  "Fail to connect with EduConnect : probably wrong login information") {
                                this.presentToast("Identifiants incorrects.", "danger")
                            }
                            else if(result == "missingusername") {
                                this.presentToast("Veuillez entrer un identifiant.", "danger")
                            }
                            else if(result == "missingpassword") {
                                this.presentToast("Veuillez entrer un mot de passe.", "danger")
                            }
                            else {
                                this.presentToast("Une erreur s'est produite.", "danger")
                            }
                        }
                        else {
                            let token = result.token;

                            // save token
                            localStorage.token = token;
                            localStorage.loggedIn = true;
                            localStorage.loginData = JSON.stringify({
                                username: username,
                                password: password,
                                cas: cas,
                                url: url,
                            });
                            localStorage.loginService = "pronote";

                            // go to home
                            window.location.replace("/");
                        }
                    });
            }
        },
        data() {
            return {
                presentingElement: null,
                terms: "",
                foundCity: "",
                etabsEmpty: true,
                locationFailed: false,
                etabs: [],
                isLoading: false,
                etabUrl: "",
                etabCas: "",
                displayCas: "",
                etabName: "",
                ents: [],
                retries: 0,
            }
        }
    });
</script>

<template>
    <ion-header>
        <ion-toolbar>
            <ion-buttons slot="start">
                <ion-back-button></ion-back-button>
            </ion-buttons>
            <ion-title>Sélection de l'établissement</ion-title>
            <ion-buttons slot="end" style="padding-right: 10px;">
                <ion-spinner v-if="isLoading"></ion-spinner>
            </ion-buttons>
        </ion-toolbar>
        <ion-toolbar>
            <ion-searchbar autocomplete="off" ref="postalInput" placeholder="Entrez une ville, un code postal" type="text" :debounce="1000" animated="true" @ionChange="getPostal($event)" @ionClear="clearEtabs()" v-bind="terms"></ion-searchbar>
        </ion-toolbar>
    </ion-header>
      
    <ion-content :fullscreen="true">

        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Établissements disponibles</p>
                </ion-label>
            </ion-list-header>

            <ion-item button detail="true" v-for="(etab, index) in etabs" v-bind:key="index" @click="loginToEtab(etab.url)">
                <ion-icon class="icon" slot="start" :ios="schoolOutline" :md="schoolSharp"></ion-icon>
                <ion-label>
                    <h2>{{ etab.nomEtab }}</h2>
                    <p>{{ etab.url }}</p>
                </ion-label>
            </ion-item>

            <ion-item v-if="etabsEmpty">
                <ion-icon class="icon" slot="start" :ios="businessOutline" :md="businessSharp"></ion-icon>
                <ion-label>
                    <h2>Pas d'établissements par ici...</h2>
                    <p>Essayez une autre vile ou un autre code postal</p>
                </ion-label>
            </ion-item>

            <ion-item v-if="locationFailed">
                <ion-icon class="icon" slot="start" :ios="navigateOutline" :md="navigateSharp"></ion-icon>
                <ion-label>
                    <h2>Emplacement introuvable</h2>
                    <p>Impossible de trouver des établissements à "{{terms}}"</p>
                </ion-label>
            </ion-item>
        </ion-list>
        
        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Autres options</p>
                </ion-label>
            </ion-list-header>

            <ion-item button @click="URLLogin()">
                <ion-icon class="icon" slot="start" :ios="linkOutline" :md="linkSharp"></ion-icon>
                <ion-label>
                    <h2>Se connecter avec une URL</h2>
                    <p>Utilisez l'URL fournie par votre établissement</p>
                </ion-label>
            </ion-item>

            <ion-item button @click="loginToDemo()">
                <ion-icon class="icon" slot="start" :ios="personCircleOutline" :md="personCircleSharp"></ion-icon>
                <ion-label>
                    <h2>Utiliser le compte démo</h2>
                    <p>Permet de tester Papillon à l'aide du compte de démonstration</p>
                </ion-label>
            </ion-item>

            <ion-item button disabled>
                <ion-icon class="icon" slot="start" :ios="qrCodeOutline" :md="qrCodeSharp"></ion-icon>
                <ion-label>
                    <h2>Se connecter avec un QR-Code</h2>
                    <p>Scannez le QR-Code de l'interface Pronote</p>
                </ion-label>
            </ion-item>
        </ion-list>

        <br/><br/>

        <ion-modal ref="loginModal" trigger="open-loginModal" :swipeToClose="true">
            <ion-header>
                <ion-toolbar>
                    <ion-title>Se connecter</ion-title>
                    <ion-buttons slot="end">
                    <ion-button @click="dismiss()">Fermer</ion-button>
                    </ion-buttons>
                </ion-toolbar>
            </ion-header>
            <ion-content>
                <div class="loginPage">
                    
                    <div class="loginIntro">
                        <img src="assets/welcome/pronote_logo.png" alt="Pronote Logo" class="logo"/>
                        <p>Vous souhaitez vous connecter à <B>Pronote</B> avec l'ENT <B>{{displayCas}}</B> à l'aide de Papillon.</p>
                        <br>
                        <p v-if="isEduconnectLogin">Cet ENT utilise ÉduConnect, merci de rentrer les identifiants de ce service.</p>
                    </div>

                    <div class="loginForm">
                        <input ref="user" type="text" placeholder="Identifiant" class="loginInput" appAutofill autocomplete="username"/>
                        <input ref="pass" type="password" placeholder="Mot de passe" class="loginInput" appAutofill autocomplete="password"/><br/>

                        <button @click="login" class="loginButton">Se connecter</button>
                    </div>

                    <div class="loginConditions">
                        Vos données ne sont pas stockées sur nos serveurs. En vous connectant, vous acceptez les <a href="https://papillon.app/conditions">conditions d'utilisation</a> de Papillon.
                    </div>

                </div>
            </ion-content>
        </ion-modal> 
    </ion-content>
</template>
  
<style scoped>
    .ios .icon {
        opacity: 50%;
    }

    .loginPage {
        position: absolute;
        top: 0;
        left: 0;
        background-color: #ffffff;
        color: #000;
        width: 100%;
        height: 100vh;
        overflow: hidden;
    }

    .loginPage * {
        font-family: sans-serif !important;
        margin: 0;
    }

    .loginIntro {
        padding: 20px;
        text-align: center;
        border-bottom: 1px solid #e5e5e5;
    } 
    
    .loginIntro .logo {
        height: 48px;
        width: 48px;
    }

    .loginIntro p {
        margin-top: 5px;
    }

    .loginConditions {
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #999999;
    }

    .loginForm {
        padding: 20px;
    }

    .loginInput {
        width: 100%;
        padding: 10px;
        border: 1px solid #55555555;
        background: none;
        border-radius: 0px;
        margin-bottom: 10px;
    }

    .loginInput:focus {
        border: 1px solid #009c34;
        outline: 3px solid #0066ff22;
    }

    .loginButton {
        width: 100%;
        padding: 10px;
        border: 1px solid #009c34;
        border-radius: 0px;
        background-color: #009c34;
        color: #ffffff;
        font-weight: bold;
        font-size: 16px;
        cursor: pointer;
    }
</style>
