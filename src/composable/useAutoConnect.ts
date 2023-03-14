import { ref, watch } from 'vue';
import { isNonEmptyArray } from '../utils';
import { IWallet } from '../types';
import type { Ref } from 'vue';
import { Storage } from '../utils/storage';
import { StorageKey } from '../constants/storage';

const init = ref(false);

export function useAutoConnect(
	select: (name: string) => Promise<void>,
	allAvailableWallets: Ref<IWallet[]>,
	autoConnect: boolean
) {
	// auto connect
	watch(allAvailableWallets, () => {
		if (!autoConnect || init.value || !isNonEmptyArray(allAvailableWallets.value)) return;

		const storage = new Storage();
		const lastConnectedWalletName = storage.getItem(StorageKey.LAST_CONNECT_WALLET_NAME);
		if (!lastConnectedWalletName) return;

		if (allAvailableWallets.value.find((item) => item.name == lastConnectedWalletName)) {
			select(lastConnectedWalletName).then(() => {
				init.value = true;
			});
		}
	});
}
