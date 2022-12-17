<script lang="ts">
    import { defineComponent } from 'vue';
    import { IonItem, IonLabel } from '@ionic/vue';

    export default defineComponent({
        name: 'CoursElement',
        components: {
            IonItem,
            IonLabel
        },
        props: {
            subject: {
                type: String,
                required: true
            },
            teacher: {
                type: String,
                required: false
            },
            room: {
                type: String,
                required: false
            },
            start: {
                type: String,
                required: false
            },
            end: {
                type: String,
                required: false
            }
        },
        setup() {
            return { }
        }
    });
</script>

<template>
    <ion-item>
        <ion-label slot="start" class="TimeLabel">
            <h1 class="CoursStart">{{start}}</h1>
            <p>{{end}}</p>
        </ion-label>

        <ion-label>
            <h1 class="CoursName">{{subject}}</h1>
            <p>avec {{teacher}} - salle {{room}}</p>
        </ion-label>
    </ion-item>
</template>

<style scoped>
    .TimeLabel {
        max-width: fit-content;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        margin-inline-end: 20px;
    }

    .CoursName, .CoursStart {
        font-weight: 600;
        font-size: 1em;
    }
</style>