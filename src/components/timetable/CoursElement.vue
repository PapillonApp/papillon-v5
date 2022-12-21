<script>
    import { defineComponent } from 'vue';
    import { IonItem, IonLabel, IonChip, IonItemDivider } from '@ionic/vue';

    export default defineComponent({
        name: 'CoursElement',
        components: {
            IonItem,
            IonLabel,
            IonChip,
            IonItemDivider
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
            },
            color: {
                type: String,
                required: false,
                default: "var(--ion-color-primary)"
            },
            isCancelled: {
                type: Boolean,
                required: false,
                default: false
            },
            status: {
                type: String,
                required: false,
                default: "normal"
            },
            sameTime: {
                type: Boolean,
                required: false,
                default: false
            }
        },
        data() {
            return { 
                classes: "",
            }
        },
        setup() {
            return { }
        },
        mounted() {
            return false
        }
    });
</script>

<template>
    <ion-item-divider class="divider" color="light" v-if="!isCancelled">
        <ion-label class="divider_label">
            {{start}}
        </ion-label>
    </ion-item-divider>

    <ion-item button lines="none" :class="classes" v-if="!isCancelled" @click="$emit('open')">
        <div class="CoursColor" slot="start" :style="`background: ${color};`"></div>

        <ion-label>
            <h3 class="CoursName">{{subject}}</h3>
            <p>avec {{teacher}} - salle {{room}}</p>
        </ion-label>

        <ion-chip class="chip" outline="true" v-if="status">{{status}}</ion-chip>
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

    .CoursColor {
        width: 3px;
        height: 50px;

        border-radius: 300px;
        margin-right: 13px !important;
    }

    .md .CoursColor {
        border-radius: 0;
        width: 2px;
    }

    .divider.md {
        background: none; 
    }

    .divider.md ion-label {
        margin: 0;
    }

    .divider_label {
        font-family: 'Papillon', sans-serif;
        font-weight: 500;
        font-size: 18px;
    }
</style>