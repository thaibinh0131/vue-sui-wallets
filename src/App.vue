<script setup lang="ts">
import { ref, watch } from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import ConnectWalletModal from './components/ConnectWalletModal.vue';
import { useWallet } from './composable';
import { AccountChangeParams, ChainChangeParams } from './types';
import type { StandardEventsChangeProperties } from '@wallet-standard/features';

const showModal = ref(false);
const { address, wallet, on, connected, disconnect } = useWallet();

const initializeListeners = () => {
	on('accountChange', (params: AccountChangeParams) => {
		console.debug({ params });
	});
	on('chainChange', (params: ChainChangeParams) => {
		console.debug({ params });
	});
};

watch(connected, (val) => {
	if (val) {
		initializeListeners();
	}
});
</script>

<template>
	<div>
		<a
			href="https://vitejs.dev"
			target="_blank"
		>
			<img
				src="/vite.svg"
				class="logo"
				alt="Vite logo"
			/>
		</a>
		<a
			href="https://vuejs.org/"
			target="_blank"
		>
			<img
				src="./assets/vue.svg"
				class="logo vue"
				alt="Vue logo"
			/>
		</a>
		<button
			v-if="!address"
			@click="showModal = true"
		>
			Connect
		</button>
		<button v-else @click="disconnect">{{ address }}</button>
		<ConnectWalletModal v-model="showModal" />
	</div>
</template>

<style scoped>
.logo {
	height: 6em;
	padding: 1.5em;
	will-change: filter;
	transition: filter 300ms;
}
.logo:hover {
	filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
	filter: drop-shadow(0 0 2em #42b883aa);
}

button {
	color: white;
}
</style>
