import { SUI_TYPE_ARG } from '@mysten/sui.js';
import { QueryKey, queryKey } from '../constants';
import { Account, Provider } from '@/sdk';
import { useChain } from './useChain';
import { useWallet } from './useWallet';
import { reactive, computed, ref } from 'vue';

export interface UseCoinBalanceParams {
	address?: string;
	typeArg?: string;
	chainId?: string;
}

const coinBalanceMap = reactive(new Map<string, string>());

/**
 * use the account balance of one specific coin (SUI by default)
 * @param params
 */
export function useCoinBalance(params?: UseCoinBalanceParams) {
	const isLoading = ref(false);
	const { address: walletAddress, chain: walletChain } = useWallet();
	const {
		address = walletAddress.value,
		typeArg = SUI_TYPE_ARG,
		chainId = walletChain.value.id,
	} = params || {};
	const chain = useChain(chainId);

	const key = computed(() =>
		queryKey(QueryKey.COIN_BALANCE, {
			address,
			typeArg,
			chainId,
		})
	);
	const balance = computed(() => coinBalanceMap.get(key.value));
	const getCoinBalance = async () => {
		try {
			if (!address || !chain.value) return '0';
			isLoading.value = true;
			const provider = new Provider(chain.value.rpcUrl || '');
			const account = new Account(provider, address);
			const balance = await account.balance.get(typeArg);
			coinBalanceMap.set(key.value, balance.toString());
			isLoading.value = false;
		} catch (error) {
			isLoading.value = false;
			throw error;
		}
	};
	getCoinBalance();
	return {
        balance,
        isLoading,
    };
}
