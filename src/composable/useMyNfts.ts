import { useWallet } from './useWallet';
import { SUI_TYPE_ARG } from '@mysten/sui.js';
import { useChain } from './useChain';
import { Account, Provider } from '@/sdk';

export const useMyNfts = () => {
	const { address: walletAddress, chain } = useWallet();

	// const chain = useChain();
	const getMyNfts = async () => {
		if (chain.value && chain.value.rpcUrl) {
			const provider = new Provider(chain.value?.rpcUrl || '');
			const data = await provider.query.getOwnedNfts(walletAddress.value || '');
			console.debug({ data });
		}
	};
	return {
		getMyNfts,
	};
};
