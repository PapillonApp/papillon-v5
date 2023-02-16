// modules
import axios from 'axios';
import { Extension } from './Extension';
//'https://raw.githubusercontent.com/andronedev/papillon_extension_demo/master/papillonManifest.json'
export class LocalRepo {
    installedExtensions: {name: string, author: string, authorDisplayName: string, description: string, icon: string, version: string, javascript: string[], css: string[], tabs: {name: string, icon: string, path: string, html: string}[], manifestUrl: string, rootUrl: string}[];
    extensions: Extension[];
    constructor() {
        // list of installed extensions
        this.installedExtensions = localStorage.getItem('extensions') ? JSON.parse(localStorage.getItem('extensions') || '[]') : []; //[{"name":"demo","author":"andronedev","authorDisplayName":"Papillon","description":"Test Plugin Papillon","icon":"more","version":"1.0.0","javascript":["test.js"],"css":[],"tabs":[{"name":"Extension de Test","icon":"cruelty_free","path":"dev.androne.test","html":"test.html"}],"manifestUrl":"","rootUrl":"https://raw.githubusercontent.com/andronedev/papillon_extension_demo/master/"}]
        // list of extensions currently loaded
        this.extensions = [];
    }

    /**
        * Get the list of installed extensions
        * @returns {string[]} List of installed extensions

    */
    getInstalledExtensions(): {name: string, author: string, authorDisplayName: string, description: string, icon: string, version: string, javascript: string[], css: string[], tabs: {name: string, icon: string, path: string, html: string}[], manifestUrl: string, rootUrl: string}[] {
        return this.installedExtensions;
    }

    /**
        * Get the list of extensions
        * @returns {Extension[]} List of extensions
    */
    getExtensions(): Extension[] {
        return this.extensions;
    }

    /**
        * Install an extension
        * @param {string} url - The url of the extension
        * @returns {boolean} True if the extension is installed
    */
    async installExtension(url: string): Promise<boolean> {
        const newExtension = new Extension();
        newExtension.fromURL(url).then((ext : Extension) => {
            console.log(ext);
            ext.init();
            window.location.reload();
        });
        return true;
    }

    /**
        * Uninstall an extension
        * @param {string} url - The url of the extension
        * @returns {boolean} True if the extension is uninstalled
    */
    uninstallExtension(url: string): void {
        for (let i = 0; i < this.installedExtensions.length; i++) {
            if (this.installedExtensions[i].rootUrl === url) {
                this.installedExtensions.splice(i, 1);
                // remove extension from the list
                for (let j = 0; j < this.extensions.length; j++) {
                    if (this.extensions[j].rootUrl === url) {
                        this.extensions.splice(j, 1);
                        break;
                    }
                }

                localStorage.setItem('extensions', JSON.stringify(this.installedExtensions));
                break;
            }
        }
        window.location.reload();
    }

    /**
        * Update all installed extensions
    */
    updateAllInstalled(): void {
        for (const extension of this.installedExtensions) {
            const rootUrl = extension.rootUrl;
            const manifestUrl = rootUrl + 'papillonManifest.json';
            const newExtension = new Extension();

            newExtension.fromURL(manifestUrl).then((ext : Extension) => {
                if (ext.version !== extension.version) {
                    this.uninstallExtension(extension.rootUrl);
                    this.installExtension(ext.rootUrl);
                }
            });
        }
    }

    updateExtension(url: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            for (const extension of this.installedExtensions) {
                if (extension.rootUrl === url) {
                    const rootUrl = extension.rootUrl;
                    const manifestUrl = rootUrl + 'papillonManifest.json';
                    const newExtension = new Extension();
                    newExtension.fromURL(manifestUrl).then((ext : Extension) => {
                        this.uninstallExtension(extension.rootUrl);
                        ext.init();
                        window.location.reload();
                        resolve(true);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            }
        });
    }
                

    /**
        * Update an extension
        * @param {string} url - The url of the extension
    */
    init(): void {
        for (const extension of this.installedExtensions) {
            const ext = new Extension();    
            ext.fromJSON(extension, extension.rootUrl);
            this.extensions.push(ext);
            ext.init();
        }
    }

}



