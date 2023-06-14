<br/>
<p align="center">
  <a href="https://github.com/PapillonApp/Papillon">
    <img src="https://i.ibb.co/BL8qgJQ/image.png" alt="Logo" width="96" height="96">
  </a>
  <h1 align="center">Papillon — Votre vie scolaire</h1>

  <p align="center">
    Votre emploi du temps, votre agenda, vos notes, vos news et bien plus encore en un clin d’œil grâce à la nouvelle app Papillon.
    <br/>
    <br/>
    <a href="https://docs.getpapillon.xyz/"><strong>Voir la documentation »</strong></a><br><br>
  <a href="https://github.com/PapillonApp/Papillon/README_EN.md">
    <img src="https://emojigraph.org/media/facebook/flag-united-kingdom_1f1ec-1f1e7.png" alt="English flag" width="48" height="48">
  	  Documentation in English<a/>
  </p>

  <div class="badges" align="center">
        <img alt="Téléchargements" src="https://img.shields.io/github/downloads/PapillonApp/Papillon/total">
        <img alt="Contributeurs" src="https://img.shields.io/github/contributors/PapillonApp/Papillon?color=dark-green">
        <img alt="Problèmes" src="https://img.shields.io/github/issues/PapillonApp/Papillon">
        <img alt="License" src="https://img.shields.io/github/license/PapillonApp/Papillon">
        <br />
        <a href="https://discord.gg/vFmCwSzvAp">
            <img src="https://img.shields.io/badge/Discord-Rejoindre-5865F2?style=flat&amp;logo=discord&amp;logoColor=white" alt="Rejoindre notre serveut Discord">
        </a>
        <a href="https://www.instagram.com/thepapillonapp/">
            <img src="https://img.shields.io/badge/Instagram-thepapillonapp-E4405F?style=flat&amp;logo=instagram&amp;logoColor=white" alt="Nous suivre sur instagram">
        </a>
    </div>
</p>



## Sommaire

- [Sommaire](#sommaire)
- [À propos du projet](#a-propos-du-projet)
- [Screenshots](#screenshots)
- [Construit avec](#construit-avec)
- [Pour commencer](#pour-commencer)
	- [Prérequis](#prérequis)
	- [Installation](#installation)
- [Usage](#usage)
- [Avancement](#avancement)
- [Contribuer](#contribuer)
	- [Créer une Pull Request](#créer-une-pull-request)
- [License](#license)
- [Auteurs](#auteurs)
- [Remerciements](#remerciements)

## A propos du projet

* **Fonctionnalités de papillon**
    - 📆 Emploi du temps
        + Gestion intuitive du temps
        + Ajout au calendrier
        + Cours personnalisés
        + Notifications *(bientôt)*
    - 📑 Devoirs
        + Gestion intuitive de votre emploi du temps
        + Devoirs personnalisés
    - 🎓 Notes et compétences
        + Moyenne générale et moyenne par classe
        + Remise à zéro automatique des notes sur 20
        + Affichage intuitif en grille
        + Influence sur la moyenne
    - 📂 Contenu du cours et fichiers
    - 📰 News
    - 🚪 Absences, retards et sanctions
* **Une interface incroyable**
    - 🎨 Conçu avec soin et précision
    - ✋ Prêt à être utilisé d'une seule main
        + Utilisation de gestes intuitifs
    - ✨ Amélioration continue grâce à des mises à jour régulières
    - 📱 Look natif pour iOS et Android
* **Extensions et personnalisation**
    - 🕺 Police et couleur de l'interface personnalisables
    - 🤯 Extension des fonctionnalités de l'application

## Screenshots

### iPhone XR (iOS 16.3.1) (version 5.7.0 - light mode)
|Accueil|Emploi du temps|Devoirs|Notes|Paramètres|
|--|--|--|--|--|
|![Home](https://media.discordapp.net/attachments/1001198944220627025/1110961162067116072/IMG_3352.png)|![image](https://media.discordapp.net/attachments/1001198944220627025/1110961162360729600/IMG_3353.png)|![image](https://media.discordapp.net/attachments/1001198944220627025/1110961162729816204/IMG_3354.png)|![image](https://media.discordapp.net/attachments/1001198944220627025/1110961163065372743/IMG_3356.png)|![image](https://media.discordapp.net/attachments/1001198944220627025/1110961163413487636/IMG_3357.png)|

## Construit avec

![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Ionic](https://img.shields.io/badge/Ionic-%233880FF.svg?style=for-the-badge&logo=Ionic&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

## Pour commencer

Pour mettre en place une copie locale et la faire fonctionner, suivez ces étapes simples.

### Prérequis

Tout d'abord, récupérez une copie de ce repo et installez les dépendances nécessaires à l'exécution locale de Papillon.

```sh
npm i
```

### Installation
*PS : Dans une ancienne version de ce fichier, vous deviez installer le paquet `@ionic/cli`. Ce paquet n'est plus nécessaire, et si vous l'avez installé uniquement pour Papillon, vous pouvez le supprimer avec `npm uninstall -g @ionic/cli`.*<br>
Nous l'avons supprimé pour corriger un bug avec le message "Waiting for connectivity with vue-cli-service" qui était gourmand en ressources CPU.<br>
Pour lancer papillon, exécutez simplement
```sh
npm run serve
```

To build papillon, you need **Android Studio** or *Xcode** installed.
Android SDK or Xcode command line tools needs to be configured. All the prerequisites for building are available on https://capacitorjs.com/docs/getting-started/environment-setup
```sh
npm run build
npx cap sync
# then build using Android Studio or Xcode
```

## Usage

Papillon est utile à tout étudiant utilisant Pronote ou EcoleDirecte. Si leur application officielle ne vous suffit pas, nous sommes là pour améliorer votre expérience de l'école numérique !

## Avancement

Allez voir [problèmes ouverts](https://github.com/PapillonApp/Papillon/issues) pour une liste des fonctionnalités proposées (et des problèmes connus).

## Contribuer

Les contributions sont ce qui fait de la communauté open source un endroit extraordinaire pour être, apprendre, inspirer et créer. Toutes vos contributions sont **très appréciées**.
* Si vous avez des suggestions pour ajouter ou supprimer des projets, n'hésitez pas à [ouvrir un problème] (https://github.com/PapillonApp/Papillon/issues/new) pour en discuter, ou créez directement une pull request après avoir édité le fichier *README.md* avec les changements nécessaires.
* Veillez à vérifier votre orthographe et votre grammaire.
* Créez des PR individuelles pour chaque suggestion.
* Veuillez également lire le [Code de conduite](https://github.com/PapillonApp/Papillon/blob/development/CODE_OF_CONDUCT.md) avant de publier votre première idée.

### Créer une Pull Request

1. Créer une fourche (fork) du projet
2. Créez votre branche de fonctionnalités (`git checkout -b feature/AmazingFeature`)
3. Confirmez vos modifications (`git commit -m 'Add some AmazingFeature'`)
4. Publiez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## License

Distribué sous licence GPL-3.0. Allez voir [LICENSE](https://github.com/PapillonApp/Papillon/blob/development/LICENSE) pour plus d'information

## Auteurs

* **Vince Linise** - *Étudiante français au lycée* - [Vince Linise](https://github.com/ecnivtwelve/) - *Créateur de Papillon*
* **Lucas** - *Étudiante français au lycée* - [Lucas](https://github.com/lucas-luchack) - *Développeur actif*
* **Lucas** - *Étudiante français au collège* - [Lucas](https://github.com/tryon-dev) - *Gestion du serveur*
* **Nicolas** - *Étudiante français en BTS SIO* - [Nicolas](https://github.com/andronedev) - *Développeur actif*
* **Astrow** - *Étudiante français au lycée* - [Astrow](https://github.com/Astrow25) - *Développeur et testeur*

## Remerciements

* [bain3/pronotepy](https://github.com/bain3/pronotepy/)
* [Communauté Capacitor](https://github.com/capacitor-community)
