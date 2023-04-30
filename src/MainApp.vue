<template>
	<ion-page>
		<!-- main navigation (contains router and menu) -->
		<ion-nav ref="nav" :root="App" :swipeGesture="true"></ion-nav>
	</ion-page>
</template>

<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	import { IonPage, IonNav } from '@ionic/vue';
	import App from './App.vue';
	
	const nav = ref(null)

	onMounted(() => {
		(window as any).nav = nav;
	})
</script>
