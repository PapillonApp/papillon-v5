interface User{
    name: string;
    avatar: string;
    ine: string;
    contact: {
        phone: string;
        email: string;
    };
    class: {
        name: string;
        school: string;
    };
    periods: string[];
}

interface PapillonApi{
    version: string;
    url: string;
}

interface Papillon{
    version : string;
    canal: string;
    api: PapillonApi;

}


export class ExtensionApi{
    // this class allow to extension to interact with the main app
    // this class may be inject in startup of the app in window.extensionApi
   
    public papillon : Papillon;
    public user : User;

    constructor(){
        this.papillon = {
            version: "",
            canal: "",
            api: {
                version: "",
                url: ""
            }
        }
        this.user = {
            name: "",
            avatar: "",
            ine: "",
            contact: {
                phone: "",
                email: ""
            },
            class: {
                name: "",
                school: ""
            },
            periods: []
        }
    }

    
}