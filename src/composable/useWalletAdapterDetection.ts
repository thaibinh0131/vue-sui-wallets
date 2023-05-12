import { getWallets, Wallet, Wallets } from '@wallet-standard/core';
import { IWalletAdapter } from '../types/wallet.type';
import { initializeWalletAdapter } from '../wallet/wallet-adapter';
import { isNonEmptyArray, isStandardWalletAdapterCompatibleWallet } from '../utils';
import { onMounted, ref, onBeforeUnmount } from 'vue';
/**
 * detect wallet adapters that support wallet-standard from window and register event
 * normalize them to WalletAdapter
 * Notice: call once only in provider, cuz there is event registration
 */
const standardWalletManager = ref<Wallets>();
// normalized adapters
const availableWalletAdapters = ref<IWalletAdapter[]>([]);
const clearListeners = ref<() => void>();
// log('availableWalletAdapters', availableWalletAdapters)
export function useWalletAdapterDetection() {
	function getInitStandardWalletAdapters(): Wallet[] {
		if (!standardWalletManager.value) return [];
		const initWalletAdapters = standardWalletManager.value.get();
		return initWalletAdapters.filter(isStandardWalletAdapterCompatibleWallet);
	}

	onMounted(() => {
		standardWalletManager.value = getWallets();

		const initWalletAdapters = getInitStandardWalletAdapters();

		if (isNonEmptyArray(initWalletAdapters)) {
			// setAvailableWalletAdapters(
			// 	initWalletAdapters.map((newAdapter) => new WalletAdapter(newAdapter))
			// );
			availableWalletAdapters.value = initWalletAdapters.map((newAdapter) => {
				return initializeWalletAdapter(newAdapter);
			});
		}

		clearListeners.value = standardWalletManager.value.on(
			'register',
			(...newAdapters: Wallet[]) => {
				if (!standardWalletManager.value) return;
				const initWalletAdapters = getInitStandardWalletAdapters();
				const allAdapters = [...initWalletAdapters];
				// filter out duplicate & not standard sui adapters & merged into existed list
				newAdapters
					.filter(isStandardWalletAdapterCompatibleWallet)
					.filter(
						(newAdapter) =>
							!allAdapters.find((existAdapter) => existAdapter.name === newAdapter.name)
					)
					.forEach((newAdapter) => {
						allAdapters.push(newAdapter);
					});
				// normalize adapters
				availableWalletAdapters.value = allAdapters.map((wallet) =>
					initializeWalletAdapter(wallet)
				);
			}
		);
	});

	onBeforeUnmount(() => {
		clearListeners.value?.();
	});

	return {
		availableWalletAdapters,
	};
}
