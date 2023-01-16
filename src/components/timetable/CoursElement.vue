<script>
    import { defineComponent } from 'vue';
    import { IonLabel, IonChip, IonItemDivider, IonRippleEffect } from '@ionic/vue';

    import subjectColor from '@/functions/utils/subjectColor.js';

    export default defineComponent({
        name: 'CoursElement',
        components: {
            IonLabel,
            IonRippleEffect
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
            },
            distance: {
                type: Boolean,
                required: false,
                default: false
            },
            lengthCours: {
                type: Number,
                required: false,
                default: 0
            }
        },
        data() {
            return { 
                classes: "mainElemCours ion-activatable ripple-parent rounded-rectangle ",
                newColor: ""
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
            if(this.distance) {
                this.classes += "distance "
            }

            if(this.lengthCours > 1.2) {
                this.classes += "long "
            }

            this.newColor = subjectColor.lightenColor(this.color, -20)

            return false
        }
    });
</script>

<template>
    <div class="dist" v-if="distance && !sameTime"></div>
    <div :class="classes + isCancelled" :style="`--backgroundColor: ${color};`" v-if="!sameTime" @click="openCours()">
        <div class="CoursTime">
            <p class="start">{{ start }}</p>
            <p class="end">{{ end }}</p>
        </div>
        <div class="cours">
            <ion-ripple-effect></ion-ripple-effect>
            <div class="bg"></div>
            
            <div class="CoursColor" slot="start"></div>

            <ion-label>
                <div class="CoursData">
                    <h3 class="CoursName">{{subject}}</h3>

                    <div class="CoursInfoContainer">
                        <div class="CoursInfo room" v-if="(rooms !== null)">
                            <span class="material-symbols-outlined smol" slot="start">location_on</span>

                            <p>{{rooms}}</p>
                        </div>
                        <div class="separator" v-if="(rooms !== null)"></div>
                        <div class="CoursInfo">
                            <span class="material-symbols-outlined smol" slot="start">face</span>

                            <p>{{teachers}}</p>
                        </div>
                    </div>

                    <p class="CoursInfo Status" v-if="status">
                        <span v-if="!isCancelled" class="material-symbols-outlined smol" slot="start">info</span>
                        <span v-if="isCancelled" class="material-symbols-outlined smol" slot="start">error</span>

                        {{status}}
                    </p>
                </div>
            </ion-label>

            <div slot="end" class="TypeIcon">
                <span v-if="isTest">
                    <span class="material-symbols-outlined smol">quiz</span>
                </span>

                <span v-if="isOuting">
                    <span class="material-symbols-outlined smol">directions_walk</span>
                </span>

                <span v-if="memo">
                    <span class="material-symbols-outlined smol">sticky_note_2</span>
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
    .TypeIcon {
        position: absolute;
        right: 10px;
        top: 40%;
    }

    .mainElemCours {
        display: flex;
        align-items: center;
        justify-content: center;

        gap: 20px;

        margin: 8px 14px;
        margin-bottom: 10px;
    }

    .mainElemCours.long .cours .CoursData {
        /* padding: 15px 0px; */
    }

    .dist {
        width: 90vw;
        height: 3px;

        margin: 15px 5vw;

        background: var(--ion-color-step-50);
        border-radius: 9px;
    }

    .md .dist {
        border-radius: 0;
        height: 2px;
        background: var(--ion-color-step-100);
    }

    .cours {
        width: 100%;

        display: flex;
        align-items: stretch;

        background: var(--ion-color-step-50);
        border-radius: 9px;

        padding: 0px 0px;

        overflow: hidden;
        isolation: isolate;

        position: relative;
    }

    .cours .bg {
        background: var(--backgroundColor);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.05;
        filter: saturate(1.5);
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
        top: 11px;
        right: 16px;
    }

    .CoursName {
        font-size: 1.2em;
        font-weight: 600 !important;
        margin-top: 1px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: calc(100vw - 135px);
    }

    @media screen and (prefers-color-scheme: light) {
        .cours {
            background: none;
        }

        .cours .bg {
            background: var(--backgroundColor);
            opacity: 0.10;
        }

        .CoursName {
            color: var(--backgroundColor);
            filter: brightness(0.6);
        }
    }

    @media screen and (prefers-color-scheme: dark) {
        .cours .bg {
            background: var(--backgroundColor);
            opacity: 0.1;
        }
    }

    .CoursColor {
        width: 4px;
        margin-right: 15px !important;
        background: var(--backgroundColor);
    }

    .CoursInfoContainer {
        margin-top: 2px;
        display: flex;
        align-items: flex-start;
        gap: 10px;

        width: calc(100vw - 135px);
    }

    .CoursInfoContainer .separator {
        width: 1px;
        height: 100%;
        background: var(--ion-color-step-200);
    }

    .cours .material-symbols-outlined {
        font-variation-settings:
        'FILL' 1,
        'wght' 400,
        'GRAD' 1,
        'opsz' 14 !important;
    }

    .CoursInfo {
        display: flex;
        align-items: center;

        font-size: 0.9em;
        font-weight: 400;

        opacity: 0.7;

        width: fit-content;
        max-width: 55%;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-bottom: 3px;
    }

    .CoursInfo span {
        margin-right: 5px;
    }

    .CoursInfo.room {
        opacity: 100%;
        font-weight: 600;
    }

    .Status {
        opacity: 1;
        color: #fff;
        padding: 5px 10px;
        background: #ffffff10;
        border-radius: 300px;
        margin-top: 5px;
        max-width: fit-content;
    }

    @media screen and (prefers-color-scheme: light) {
        .Status {
            color: var(--ion-color-warning);
            background: rgba(var(--ion-color-warning-rgb), 0.1);
        }
    }

    .true .cours {
        background: var(--ion-color-danger-dark) !important;
        --backgroundColor: var(--ion-color-danger) !important;
    }

    .true .cours .CoursColor {
        background: var(--ion-color-danger) !important;
    }

    .true .cours .Status {
            color: var(--ion-color-danger);
            background: rgba(var(--ion-color-danger-rgb), 0.1);
    }

    .CoursTime {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        height: 100%;

        padding: 0px 0px;
        padding-left: 3px;

        width: 60px;
    }

    .CoursTime * {
        margin: 0;
        padding: 0;
    }

    .CoursTime .start {
        margin-bottom: 3px;

        font-size: 1.2em;
        font-weight: 600;

        font-family: var(--papillon-font);
    }

    .CoursTime .end {
        opacity: 0.7;
        font-size: 0.9em;
        font-weight: 400;
    }
</style>