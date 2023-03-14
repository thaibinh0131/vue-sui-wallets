import { useWallet } from './useWallet';
import { computed } from 'vue';

/**
 * use chain config from context by chainId
 * @param chainId
 */
export function useChain(chainId?: string) {
	const wallet = useWallet();
	if (!chainId) return wallet.chain;
	return computed(() => {
		return wallet.chainsList.value.find((w) => w.id === chainId);
	});
}
