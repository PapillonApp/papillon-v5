<script>
	import { defineComponent } from 'vue';
	import { IonItem, IonLabel, IonChip, IonList, IonListHeader } from '@ionic/vue';

	export default defineComponent({
		name: 'MenuElement',
		components: {
			IonItem,
			IonLabel,
			// IonChip,
			IonList,
			IonListHeader
		},
		props: {
			isLunch: {
				type: Boolean,
				required: true
			},
			isDinner: {
				type: Boolean,
				required: true
			},
			menus: {
				type: Array,
				required: true
			},
			name: {
				type: String,
				required: false
			},

		},
		data() {
            return { 
                classes: "",
            }
        },
        setup() {
            return { }
        },
        methods: {
        },
        mounted() {
            return false
        }
	});
</script>

<template>
	<IonList :inset="true" lines="inset">
		<IonListHeader>
			<IonLabel>
				<p v-if="isDinner">Dîner<span v-if="name != null"> - {{ name }}</span></p>
				<p v-else-if="isLunch">Déjeuner<span v-if="name != null"> - {{ name }}</span></p>
			</IonLabel>
		</IonListHeader>

		<IonItem>
			<IonLabel>
				<p v-for="menu in menus" :key="menu">{{ menu }}</p>
			</IonLabel>
		</IonItem>
	</IonList>
</template>

<style scoped>
</style>