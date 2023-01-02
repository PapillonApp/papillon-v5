<script>
    import { defineComponent } from 'vue';
    import { IonItem, IonLabel, IonChip, IonItemDivider } from '@ionic/vue';

    export default defineComponent({
        name: 'CoursElement',
        components: {
            IonLabel,
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
                required: false,
                default: "N/A"
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
                classes: "cours ",
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
    <div :class="classes + isCancelled" v-if="!sameTime" @click="$emit('open')">
        <div class="CoursColor" slot="start" :style="`background: ${color};`"></div>

        <ion-label>
            <small class="CoursStart"> {{ start }} </small>

            <div class="CoursData">
                <h3 class="CoursName">{{subject}}</h3>

                <div class="CoursInfoContainer">
                    <p class="CoursInfo">
                        <span class="material-symbols-outlined smol" slot="start">face</span>

                        {{teacher}}
                    </p>
                    <p class="CoursInfo" v-if="(room !== null)">
                        <span class="material-symbols-outlined smol" slot="start">meeting_room</span>

                        {{room}}
                    </p>

                    <p class="CoursInfo Status" v-if="status">
                        <span class="material-symbols-outlined smol" slot="start">info</span>

                        {{status}}
                    </p>
                </div>
            </div>
        </ion-label>
    </div>
</template>

<style scoped>
    .cours {
        display: flex;
        align-items: stretch;

        background: var(--ion-color-step-50);
        border-radius: 9px;

        margin: 8px 14px;
        padding: 0px 0px;

        margin-bottom: 10px;

        overflow: hidden;

        position: relative;
    }

    .CoursData {
        display: flex;
        flex-direction: column;
        justify-content: center;
    
        width: 100%;
        height: 100%;

        padding: 8px 0px;
    }

    .CoursStart {
        font-size: 0.9em;
        font-weight: 400;

        opacity: 0.7;

        position: absolute;
        top: 13px;
        right: 14px;
    }

    .CoursName {
        font-size: 1.2em;
        font-weight: 500;
    }

    .CoursColor {
        width: 4px;  
        margin-right: 15px !important;
    }

    .CoursInfoContainer {
        margin-top: 5px;
    }

    .CoursInfo {
        display: flex;
        align-items: center;

        font-size: 0.9em;
        font-weight: 400;

        opacity: 0.7;
    }

    .CoursInfo span {
        margin-right: 5px;
    }

    .Status {
        opacity: 1;
        color: var(--ion-color-warning);
    }

    .true {
        background: var(--ion-color-danger-dark) !important;
    }

    .true .CoursColor {
        background: var(--ion-color-danger) !important;
    }

    .true .Status {
        color: var(--ion-color-danger);
    }
</style>