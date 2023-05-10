<script setup lang="ts">
import { ref, watch } from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import ConnectWalletModal from './components/ConnectWalletModal.vue';
import { useWallet, useMyNfts } from './composable';
import { AccountChangeParams, ChainChangeParams } from './types';
import type { StandardEventsChangeProperties } from '@wallet-standard/features';
import { TransactionBlock } from '@mysten/sui.js';

const showModal = ref(false);
const { address, chain, on, connected, disconnect, signAndExecuteTransactionBlock } = useWallet();
const { getMyNfts } = useMyNfts();

const initializeListeners = () => {
	on('accountChange', (params: AccountChangeParams) => {
		console.debug({ params }, 'ACCOUNT');
	});
	on('chainChange', (params: ChainChangeParams) => {
		console.debug({ params }, 'CHAIN');
	});
};

async function handleExecuteMoveCall(target: string | undefined) {
	if (!target) return;

	try {
		const tx = new TransactionBlock();
		tx.moveCall({
			target: target as any,
			arguments: [
				tx.pure('Binh NFT'),
				tx.pure('Binh Sample NFT'),
				tx.pure(
					'https://xc6fbqjny4wfkgukliockypoutzhcqwjmlw2gigombpp2ynufaxa.arweave.net/uLxQwS3HLFUailocJWHupPJxQsli7aMgzmBe_WG0KC4'
				),
			],
		});
		const resData = await signAndExecuteTransactionBlock({
			transactionBlock: tx,
		});
		console.log('executeMoveCall success', resData);

		alert('executeMoveCall succeeded (see response in the console)');
	} catch (e) {
		console.error('executeMoveCall failed', e);
		alert('executeMoveCall failed (see response in the console)');
	}
}

watch(connected, (val) => {
	if (val) {
		initializeListeners();
		getMyNfts();
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
			<button
				v-if="address"
				@click="
					handleExecuteMoveCall(
						'0x4d33b1ac13f136aad11d890d37b7aef717306ab0df05743e6848295e3f2b0b15::nft::mint'
					)
				"
			>
				execute move call
			</button>
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
