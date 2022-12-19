# fonctions Fetch dans Pronote+ v5
Ce guide permettra de mieux comprendre quelles sont les issues de chaque fichier ici.

## A quoi servent ces fichiers ?
Ce sont eux qui s'occupent de récupérer les données depuis l'API et les uniformiser dans un format traitable peu importe l'API ou le service derrière.

## Comment fonctionnent-ils
Ils sont *en théorie* sénsés détecter le service utilisé et rendre les données correspondantes.
Pour le moment, seul Pronote est proposé : les données sont donc faites pour Pronote.

## Quels sont les schémas à rendre
### Utilisateur (`GetUserData.js`)
``` ts
interface UserData {
    student: {
        name: string,
        avatar: string,
        contact: {
            email: string,
            phone: string
        }
    },
    class: {
        name: string,
        school: string
    }
}
```

### Emploi du temps (`GetTimetable.js`)
``` ts
interface Timetable {
    course: {
        id: number // integer (e.g. 415987521987151)
        color: string // hex (e.g. "#0066ff")
    },
    data: {
        subject: string // (e.g. "MATHÉMATHIQUES")
        teacher: string // (e.g. "M. Durand")
        room: string // (e.g. "A210")
    },
    time: {
        start: Date // en objet Date (déja mis à la bonne timezone)
        end: Date // en objet Date (déja mis à la bonne timezone)
    },
    status: {
        isCancelled: boolean // booléen
        status: string // string (e.g. "Prof. absent")
        groupName: string // (optionnel) (e.g. "[TG1_MATH_B]")
    }
}
```