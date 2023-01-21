![image](https://user-images.githubusercontent.com/32978709/211217228-adb2b6b4-af7d-4062-ba11-c10c47c77023.png)

![](https://github.com/PapillonApp/papillon-v5/actions/workflows/build.yml/badge.svg)
![](https://img.shields.io/github/license/PapillonApp/papillon-v5)
![](https://img.shields.io/github/issues/PapillonApp/papillon-v5)
![](https://img.shields.io/github/issues-pr/PapillonApp/papillon-v5)
![](https://img.shields.io/github/languages/top/PapillonApp/papillon-v5)
![](https://img.shields.io/github/repo-size/PapillonApp/papillon-v5)
![](https://img.shields.io/github/forks/PapillonApp/papillon-v5?style=social)
![](https://img.shields.io/github/stars/PapillonApp/papillon-v5?style=social)

## Installation
Installez [Ionic](https://ionicframework.com/docs/intro/cli) et [Capacitor](https://capacitorjs.com/docs/getting-started#install-capacitor),
puis, à la racine des fichiers du dépôt, exécutez :
```bash
npm i
```

### Démarrer la preview web
Pour tester l'application dans votre navigateur :
```bash
ionic serve
```

### Générer l'app
Pour préparer la construction de l'application pour mobile :
```bash
npm run build # ou ionic build
npx cap sync
npx cap open
```
La dernière commande lance Android Studio ou Xcode.
Construisez ensuite l'application à partir de celui-ci.
