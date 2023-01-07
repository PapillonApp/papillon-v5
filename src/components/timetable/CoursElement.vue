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
            teachers: {
                type: String,
                required: false,
                default: "Pas de professeur"
            },
            rooms: {
                type: String,
                required: false,
                default: "Pas de salle"
            },
            memo: {
                type: Boolean,
                required: false,
                default: false
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
            isExempted: {
                type: Boolean,
                required: false,
                default: false
            },
            isDetention: {
                type: Boolean,
                required: false,
                default: false
            },
            isOuting: {
                type: Boolean,
                required: false,
                default: false
            },
            isTest: {
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
                classes: "ion-activatable ripple-parent rounded-rectangle cours ",
            }
        },
        setup() {
            return { }
        },
        methods: {
            openCours() {
                this.$emit('open')
            }
        },
        mounted() {
            return false
        }
    });
</script>

<template>
    <div :class="classes + isCancelled" v-if="!sameTime" @click="openCours()">
        <div class="CoursColor" slot="start" :style="`background: ${color};`"></div>

        <ion-label>
            <small class="CoursStart"> {{ start }} </small>

            <div class="CoursData">
                <h3 class="CoursName">{{subject}}</h3>

                <div class="CoursInfoContainer">
                    <p class="CoursInfo">
                        <span class="material-symbols-outlined smol" slot="start">face</span>

                        {{teachers}}
                    </p>
                    <p class="CoursInfo" v-if="(rooms !== null)">
                        <span class="material-symbols-outlined smol" slot="start">meeting_room</span>

                        {{rooms}}
                    </p>

                    <p class="CoursInfo Status" v-if="status">
                        <span v-if="!isCancelled" class="material-symbols-outlined smol" slot="start">info</span>
                        <span v-if="isCancelled" class="material-symbols-outlined smol" slot="start">emergency_home</span>

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
        isolation: isolate;

        position: relative;
    }

    .ios .CoursData {
        padding-bottom: 10px;
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
        font-weight: 700 !important;
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