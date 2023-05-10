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

const callFunction = async () => {
	const data = {
		packageObjectId: '0x2ee3923fc6b6c0bb61c3aa1d1e24206ecc8192b4',
		module: 'maze',
		function: 'down',
		typeArguments: [],
		arguments: [
			'0x932b6d02793bcb54b1eec8bd0af120da21852f77',
			'0x1743f09452dfd43db729d790f0189ea408632820',
			1,
		],
		gasBudget: 10000,
	};
	const res = await wallet.value?.signAndExecuteTransactionBlock({
		transaction: {
			kind: 'moveCall',
			data,
		},
	});
	console.debug({ res });
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
		<div v-else>
			<button @click="disconnect">{{ address }}</button>
			<button @click="callFunction">Call Function</button>
		</div>
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
