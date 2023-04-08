<script>
	import { defineComponent } from 'vue';
	import { IonBackButton } from '@ionic/vue';

	export default defineComponent({
		name: 'PapillonBackButton',
		components: {
			IonBackButton,
		},
	});
</script>

<template>
	<IonBackButton shape="round" color="dark" mode="md" @click="pop" class="back_button">
		<span class="material-symbols-outlined mdls" slot="start">arrow_back</span>
	</IonBackButton>
</template>

<style scoped>
	.back_button {
		height: 48px !important;
	}

	.back_button::part(native) {
		padding-left: 12px;
		padding-right: 8px;
	}
</style>