// modules
import axios from 'axios';

interface Tab {
    name: string;
    icon: string;
    path: string;
    html: string;
}

interface PapillonManifest {
    name: string;
    author: string;
    authorDisplayName: string;
    description: string;
    icon: string;
    version: string;
    javascript: string[];
    css: string[];
    tabs: Tab[],
 
}

export class Extension {
    name : string;
    author : string;
    authorDisplayName : string;
    description : string;
    icon : string;
    version : string;
    javascript : string[];
    css : string[];
    tabs : Tab[];
    manifestUrl : string;
    rootUrl: string;
    constructor() {
        this.name = "";
        this.author = "";
        this.authorDisplayName = "";
        this.description = "";
        this.icon = "";
        this.version = "";
        this.javascript = [];
        this.css = [];
        this.tabs = [];
        this.manifestUrl = "";
        this.rootUrl = "";
    }

    fromJSON(json : PapillonManifest, rootUrl : string): Extension {
        this.name = json.name;
        this.author = json.author;
        this.authorDisplayName = json.authorDisplayName;
        this.description = json.description;
        this.icon = json.icon;
        this.version = json.version;
        this.javascript = json.javascript;
        this.css = json.css;
        this.tabs = json.tabs;
        this.rootUrl = rootUrl;

        return this;
    }

    validateExtension(papillonManifest : PapillonManifest): boolean {
        if (!papillonManifest.name || !papillonManifest.author || !papillonManifest.authorDisplayName || !papillonManifest.description || !papillonManifest.icon || !papillonManifest.version || !papillonManifest.javascript || !papillonManifest.css || !papillonManifest.tabs) {
            return false;
        }

        for (const tab of papillonManifest.tabs) {
            if (! tab.name || ! tab.icon || ! tab.path || ! tab.html) {
                return false;
            }
        }

        return true;
    }

    async fromURL(url : string): Promise < Extension > {
        const response = await axios.get(url);
        if (this.validateExtension(response.data)) {
            return this.fromJSON(response.data, url.replace('papillonManifest.json', ''));
        } else {
            throw new Error('Invalid extension');
        }

    }

    async getTab(tab : Tab): Promise < string > {
        const response = await axios.get(this.rootUrl + tab.html);
        return response.data;

    }

    async getCSS(css : string): Promise < string > {

        const response = await axios.get(this.rootUrl + css);
        return response.data;

    }

    async getJS(js : string): Promise < string > {

        const response = await axios.get(this.rootUrl + js);
        return response.data;

    }

    async setupGlobalJSandCSS(): Promise < void > {
        for (const js of this.javascript) {
            const jsCode = await this.getJS(js);
            const script = document.createElement('script');
            script.innerHTML = jsCode;
            document.body.appendChild(script);
        }

        for (const css of this.css) {
            const cssCode = await this.getCSS(css);
            const style = document.createElement('style');
            style.innerHTML = cssCode;
            document.head.appendChild(style);
        }

    }

    async activate(): Promise < void > {
        // add it to localstorage
        const extensions = JSON.parse(localStorage.getItem('extensions') || '[]');
        if (!extensions.find((extension : Extension) => extension.rootUrl === this.rootUrl)) {
            extensions.push(this);
            localStorage.setItem('extensions', JSON.stringify(extensions));
            window.location.reload();
        }


    }

    async deactivate(): Promise < void > {
        // remove it from localstorage if it exists
        const extensions = JSON.parse(localStorage.getItem('extensions') || '[]');
        const index = extensions.findIndex((extension : Extension) => extension.rootUrl === this.rootUrl);
        if (index !== -1) {
            extensions.splice(index, 1);
            localStorage.setItem('extensions', JSON.stringify(extensions));
            window.location.reload();
        }
    }

    async init(): Promise < void > {
        await this.activate();
        await this.setupGlobalJSandCSS();

    }

    getTabs(): Tab[]{
        return this.tabs;
    }

    getTabByName(name : string): Tab | undefined {
        return this.tabs.find((tab) => tab.name === name);
    }

    getTabByPath(path : string): Tab | undefined {
        return this.tabs.find((tab) => tab.path === path);
    }

  

}



