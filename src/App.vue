<script setup lang="ts">
import { ref, watch } from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import ConnectWalletModal from './components/ConnectWalletModal.vue';
import { useWallet, useNftsOwnedByAddressInSpecificChain, useOwnedCoinsWithBalances } from './composable';
import { AccountChangeParams, ChainChangeParams } from './types';
import type { StandardEventsChangeProperties } from '@wallet-standard/features';
import { TransactionBlock, normalizeSuiObjectId } from '@mysten/sui.js';

const showModal = ref(false);
const { address, chain, on, connected, disconnect, moveCall } = useWallet();
const { getOwnedNfts } = useNftsOwnedByAddressInSpecificChain();
const { getOwnedCoinsAndBalances } = useOwnedCoinsWithBalances();

async function handleExecuteMoveCall(target: string | undefined) {
	if (!target) return;

	try {
		// const tx = new TransactionBlock();
		// const coin = '0x62cf7503381603d73ac97303e5662448d62462bb0870ea862a4b1a24e311d7c0';
		// tx.moveCall({
		// 	target: target as any,
		// 	arguments: [
		// 		tx.pure('0x1eb7ba8dfef48e5d715abb2d4ce4fe56309eb6913d6bde63209d5aaa702894c1'),
		// 		tx.makeMoveVec({ objects: [tx.object(coin)] }),
		// 	],
		// });
		// const resData = await signAndExecuteTransactionBlock({
		// 	transactionBlock: tx,
		// });
		const resData = await moveCall({
			target,
			arguments: [
				'0x1eb7ba8dfef48e5d715abb2d4ce4fe56309eb6913d6bde63209d5aaa702894c1',
				['0x62cf7503381603d73ac97303e5662448d62462bb0870ea862a4b1a24e311d7c0'],
			],
		});

		alert('executeMoveCall succeeded (see response in the console)');
	} catch (e) {
		console.error('executeMoveCall failed', e);
		alert('executeMoveCall failed (see response in the console)');
	}
}

watch(address, (val) => {
	if (val) {
		getOwnedCoinsAndBalances();
		getOwnedNfts();
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
						'0xfd1d8f1dd3861418b407c02ffba57e1e830108d9303f02beec90ba283cc1351a::nft::mint'
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
