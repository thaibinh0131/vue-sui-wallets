import { IDefaultWallet, IWallet } from '../types';
import { useWalletAdapterDetection } from './useWalletAdapterDetection';
import { isNonEmptyArray } from '../utils';
import { computed } from 'vue';

export const useAvailableWallets = (defaultWallets: IDefaultWallet[]) => {
	const { data: availableWalletAdapters } = useWalletAdapterDetection();
	// configured wallets
	const configuredWallets = computed(() => {
		if (!isNonEmptyArray(defaultWallets)) return [];
		if (!isNonEmptyArray(availableWalletAdapters)) {
			return defaultWallets.map(
				(item) =>
					({
						...item,
						adapter: undefined,
						installed: false,
					} as IWallet)
			);
		}

		return defaultWallets.map((item) => {
			const foundAdapter = availableWalletAdapters.value.find(
				(walletAdapter) => item.name === walletAdapter.name
			);
			if (foundAdapter) {
				return {
					...item,
					adapter: foundAdapter,
					installed: true,
				} as IWallet;
			}
			return {
				...item,
				adapter: undefined,
				installed: false,
			} as IWallet;
		});
	});

	// detected wallets
	const detectedWallets = computed(() => {
		if (!isNonEmptyArray(availableWalletAdapters)) return [];
		return availableWalletAdapters.value
			.filter((adapter) => {
				// filter adapters not shown in the configured list
				return !defaultWallets.find((wallet) => wallet.name === adapter.name);
			})
			.map((adapter) => {
				// normalized detected adapter to IWallet
				return {
					name: adapter.name,
					adapter: adapter,
					installed: true,
					iconUrl: adapter.icon,
					downloadUrl: {
						browserExtension: '', // no need to know
					},
				};
			});
	});

	// filter installed wallets
	const allAvailableWallets = computed(() => {
		return [...configuredWallets.value, ...detectedWallets.value].filter(
			(wallet) => wallet.installed
		);
	});

	return {
		allAvailableWallets,
		configuredWallets,
		detectedWallets,
	};
};
