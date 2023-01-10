<script>
    import { defineComponent } from 'vue';
    import { IonItem, IonLabel, IonList, IonAvatar, IonIcon, IonBackButton, IonSearchbar, IonSkeletonText, IonThumbnail, IonModal, IonListHeader, IonSpinner, loadingController, actionSheetController } from '@ionic/vue';

    import axios from 'axios';
    import $ from "jquery";

    import { BarcodeScanner, SupportedFormat } from '@capacitor-community/barcode-scanner';
    
    import { linkOutline, linkSharp, qrCodeOutline, qrCodeSharp, schoolOutline, schoolSharp, businessOutline, businessSharp, navigateOutline, navigateSharp, personCircleOutline, personCircleSharp } from 'ionicons/icons';

    import displayToast from '@/functions/utils/displayToast.js';

    import { Geolocation } from '@capacitor/geolocation';

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
            this.GetLocation();
        },
        methods: {
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
            async GetLocation() {
                const coordinates = await Geolocation.getCurrentPosition();

                let lat = coordinates.coords.latitude;
                let lon = coordinates.coords.longitude;

                this.isLoading = true;
                this.findEstablishments(lat, lon)
            },     
            async createEntPicker(multipleEnts) {
                let options = [];

                for (let i = 0; i < multipleEnts.cas.length; i++) {
                    options.push({
                        text: multipleEnts.cas[i].name,
                        handler: () => {
                            let selected = {
                                etab : multipleEnts.etab.toLowerCase(),
                                cas : multipleEnts.cas[i].py,
                                cas_name : multipleEnts.cas[i].name,
                                educonnect : multipleEnts.cas[i].educonnect == true,
                            }

                            this.displayLogin(selected)
                        }
                    });
                }

                options.push({
                    text: 'Annuler',
                    role: 'cancel',
                    handler: () => {
                        this.presentToast("Vous devez choisir un ENT pour continuer.", "danger")
                    },
                    data: {
                        action: 'cancel'
                    }
                });

                const actionSheet = await actionSheetController.create({
                    header: 'Choisissez votre ENT',
                    subHeader: 'Plusieurs ENT ont été trouvés. Choisissez celui que vous souhaitez utiliser.',
                    buttons: options
                });

                await actionSheet.present();
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
                    displayToast.presentError(`Une erreur s'est produite pour obtenir votre code postal.`, "danger", error.stack)
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
                            displayToast.presentError(`Une erreur s'est produite pour obtenir les établissements à proximité.`, "danger", error.stack)
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

                    this.loginToEtab(etaburl, false);
                }
            },
            async QRCodeLogin() {
                this.methodLogin = "qrcode";
                this.getQrCodeWithCamera();
            },
            loginToDemo() {
                this.loginToEtab("https://demo.index-education.net/pronote");

                setTimeout(() => {
                    this.$refs.user.value = "demonstration";
                    this.$refs.pass.value = "pronotevs";

                    this.login();
                }, 1000);
            },
            loginToEtab(url, cp) {
                // lowercase url
                url = url.toLowerCase();
                let etab = url.toLowerCase();

                let isToutatice = false;

                // check if cp (integer) starts with 35, 22, 56, or 29 (Bretagne)
                if(cp) {
                    if(cp.toString().startsWith("35") || cp.toString().startsWith("22") || cp.toString().startsWith("56") || cp.toString().startsWith("29")) {
                        isToutatice = true;
                    }
                }

                // start loading
                this.isLoading = true;

                if(!etab.includes("eleve.html")) {
                    if(etab.includes("/pronote/")) {
                        etab = etab + "eleve.html";
                    }
                    else {
                        etab = etab + "/" + "eleve.html";
                    }
                }

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
                        displayToast.presentToast(`Aucun CAS trouvé pour ${cas_host}.`, "danger")
                    }
                    else if (all_cas_same_host.length == 1) {
                        // only one CAS for this host
                        cas = all_cas_same_host[0].py;
                    } else {
                        // multiple CAS for this host
                        let listToChoose = {
                            etab : etab.toLowerCase(),
                            cas : all_cas_same_host,
                        };

                        this.createEntPicker(listToChoose);
                        return;
                    }

                    console.log(url);

                    // TODO: Vérifier si ca fonctionne pour toutatice
                    if(isToutatice) {
                        // car toutatice est chelou
                        this.loginToEtab(url.replace("index-education.net", "pronote.toutatice.fr"));
                    }
                    else {
                        // put etab to lowercase
                        etab = etab.toLowerCase();

                        let selected = {
                            etab : etab,
                            cas : cas,
                            cas_name : all_cas_same_host[0].name,
                            educonnect : all_cas_same_host[0].educonnect == true,
                        }

                        this.loginMethod = "url";

                        this.displayLogin(selected)
                    }
                })
            },
            async getQrCodeWithCamera() {
                try {
                    await BarcodeScanner.checkPermission({ force: true });

                    BarcodeScanner.hideBackground();

                    const result = await BarcodeScanner.startScan({ targetedFormats: [SupportedFormat.QR_CODE] });

                    if (result.hasContent) {
                        this.qrcodeEncoded = result.content;
                    }

                    const { value, cancelled } = await Dialog.prompt({
                        title: 'Connexion avec une URL Pronote',
                        message: `Entrez l'URL Pronote fournie par votre établissement.`,
                    });

                    if(!cancelled) {
                        this.qrPin = value;
                        return true;
                    }

                    return false;
                } catch (e) {
                    displayToast.presentError("Une erreur est survenue lors de la lecture du QR Code.", "danger", e);
                }
            },
            displayLogin(selected) {
                this.etabUrl = selected.etab;
                this.etabCas = selected.cas;
                this.displayCas = selected.cas_name;
                this.isEduconnectLogin = selected.educonnect;

                this.$refs.loginModal.$el.present()
            },
            dismiss() {
                this.$refs.loginModal.$el.dismiss();
            },
            login() {
                const API = this.$api;

                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
                
                var urlencoded = new URLSearchParams();
                let pin, qrToken, login, username, password, cas, url, checkCode;
                if (this.loginMethod == "qrcode") {
                    let qrcode = JSON.parse(this.qrcodeEncoded)

                    qrToken = qrcode.jeton;
                    url = qrcode.url;
                    login = qrcode.login;

                    pin = this.qrPin;

                    if (pin.length != 4) {
                        displayToast.presentToast("Le code PIN doit contenir 4 chiffres.", "danger")
                        return;
                    }

                    urlencoded.append("qrToken", qrToken);
                    urlencoded.append("login", login);
                    urlencoded.append("pin", checkCode);
                } else {
                    username = this.$refs.user.value;
                    password = this.$refs.pass.value;
                    cas = this.etabCas;
                    url = this.etabUrl;

                    urlencoded.append("ent", cas);
                    urlencoded.append("username", username);
                    urlencoded.append("password", password);
                }
                urlencoded.append("url", url);
                urlencoded.append("method", this.loginMethod);

                var requestOptions = {
                    method: 'POST',
                    headers: myHeaders,
                    body: urlencoded,
                    redirect: 'follow'
                };

                displayToast.presentToast("Connexion en cours...", "dark", true)

                fetch(API + "/generatetoken", requestOptions)
                    .then(response => response.json())
                    .then(result => {
                        console.log(result);

                        if(!result.token) {
                            if(result.error.includes("probably wrong login information")) {
                                displayToast.presentToast("Identifiants incorrects.", "danger")
                            }
                            else if(result == "missingusername") {
                                displayToast.presentToast("Veuillez entrer un identifiant.", "danger")
                            }
                            else if(result == "missingpassword") {
                                displayToast.presentToast("Veuillez entrer un mot de passe.", "danger")
                            } else if(result.error == "Your IP address is suspended.") {
                                displayToast.presentError("Une erreur s'est produite", "danger", "L'adresse IP de nos serveurs est suspendue pour votre établissement. S'il vous plaît réessayez dans quelques heures.")
                            }
                            else {
                                displayToast.presentError("Une erreur s'est produite.", "danger", result.error)
                            }
                        } else {
                            let token = result.token;

                            // save token
                            localStorage.token = token;
                            localStorage.loggedIn = true;
                            if (this.loginMethod == "qrcode") {
                                localStorage.loginData = JSON.stringify({
                                    qrToken: qrToken,
                                    login: login,
                                    url: url,
                                    checkCode: pin,
                                });
                            } else {
                                localStorage.loginData = JSON.stringify({
                                    method: this.loginMethod,
                                    username: username,
                                    password: password,
                                    cas: cas,
                                    url: url,
                                });
                            }
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
        },
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
            <ion-searchbar autocomplete="off" ref="postalInput" placeholder="Entrez un code postal..." type="number" :debounce="1000" animated="true" @ionChange="getPostal($event)" @ionClear="clearEtabs()" v-bind="terms"></ion-searchbar>
        </ion-toolbar>
    </ion-header>
      
    <ion-content :fullscreen="true">

        <ion-list>
            <ion-list-header>
                <ion-label>
                    <p>Établissements disponibles</p>
                </ion-label>
            </ion-list-header>

            <ion-item button detail="true" v-for="(etab, index) in etabs" v-bind:key="index" @click="loginToEtab(etab.url, etab.cp)">
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

            <ion-item button @click="QRCodeLogin()">
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
                        <div class="introData">
                            <h2>Connexion à Papillon</h2>
                            <p>Vous souhaitez vous connecter à <B>Pronote</B> avec l'ENT <B>{{displayCas}}</B> à l'aide de Papillon.</p>
                            <br v-if="isEduconnectLogin">
                            <p v-if="isEduconnectLogin" class="isEduconnectLogin">Cet ENT utilise ÉduConnect, merci de rentrer les identifiants de ce service.</p>
                        </div>
                    </div>

                    <div class="loginForm">
                        <input ref="user" type="text" placeholder="Identifiant" class="loginInput" appAutofill autocomplete="username" value=""/>
                        <input ref="pass" type="password" placeholder="Mot de passe" class="loginInput" appAutofill autocomplete="password" value=""/><br/>

                        <button @click="login" class="loginButton">Se connecter</button>
                    </div>

                    <div class="loginConditions">
                        Vos données ne sont pas stockées sur nos serveurs. En vous connectant avec cette application, vous acceptez les <a href="https://papillon.app/conditions">conditions d'utilisation</a> de Papillon.
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
        text-align: left;
        background: linear-gradient(180deg, #009C34 0%, #00AC6E 100%);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
    } 

    .introData h2 {
        font-size: 24px;
        font-family: 'Papillon' !important;
        font-weight: 700;
    }
    
    .loginIntro .logo {
        height: 42px;
        width: 42px;
    }

    .loginIntro p {
        margin-top: 5px;
    }

    .isEduconnectLogin {
        font-size: 14px;
        font-weight: 500;
        color: #ffffffc0;
    }

    .loginConditions {
        padding: 5px 20px;
        text-align: center;
        font-size: 13px;
        color: #999999;
    }

    .loginConditions a {
        color: #009c34;
    }

    .loginForm {
        padding: 20px;
    }

    .loginInput {
        width: 100%;
        padding: 15px 15px;
        border: none;
        background: #00000010;
        border-radius: 8px;
        margin-bottom: 10px;
        overflow: hidden;
        isolation: isolate;

        font-size: 16px;
        font-weight: 500;
        font-family: 'Papillon' !important;
    }

    .loginButton {
        width: 100%;
        padding: 15px 15px;
        border: 1px solid #009c34;
        border-radius: 8px;
        background-color: #009c34;
        color: #ffffff;
        font-weight: 600;
        font-size: 17px;
        cursor: pointer;
        overflow: hidden;
        isolation: isolate;
        font-family: 'Papillon' !important;
    }
</style>
