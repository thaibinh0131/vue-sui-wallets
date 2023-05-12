import { SUI_TYPE_ARG, SuiMoveObject } from '@mysten/sui.js';
import { QueryKey, queryKey } from '../constants';
import { Account, Provider, CoinObjectDto } from '@/sdk';
import { useWallet } from './useWallet';
import { reactive, computed, ref } from 'vue';

export interface UseCoinBalanceParams {
	address?: string;
	chainId?: string;
	typeArg?: string;
}
export interface GetOwnedCoinsAndBalancesParams {
	address?: string;
	chainId?: string;
}

const coinBalanceMap = reactive(new Map<string, string>());
const coinObjectsMapByAddressAndChainId = reactive(new Map<string, CoinObjectDto[]>());
const isLoading = ref(false);

/**
 * use the account balance of one specific coin (SUI by default)
 * @param params
 */
export function useOwnedCoinsWithBalances(initialize = false) {
	const { address: walletAddress, chain } = useWallet();

	const getOwnedCoinsAndBalances = async (params?: GetOwnedCoinsAndBalancesParams) => {
		try {
			const { address = walletAddress.value, chainId = chain.value } = params || {};
			if (!address || !chainId) return '0';
			isLoading.value = true;
			const provider = new Provider(chain.value.rpcUrl || '');
			const ownedCoins = await provider.query.getOwnedCoins(address);
			ownedCoins.forEach(({ coinObjectDto }) => {
				const key = queryKey(QueryKey.COIN_BALANCE, { 
					address,
					chainId,
					typeArg: coinObjectDto.typeArg,
				});
				coinBalanceMap.set(key, coinObjectDto.balance.toString());
			});
			coinObjectsMapByAddressAndChainId.set(
				queryKey(QueryKey.OWNED_COINS, { address: walletAddress.value, chainId: chain.value.id }),
				ownedCoins.map((el) => el.coinObjectDto)
			);
			isLoading.value = false;
		} catch (error) {
			isLoading.value = false;
			throw error;
		}
	};
	if (initialize) getOwnedCoinsAndBalances();
	return {
		coinBalanceMap,
		isLoading,
		coinObjectsMapByAddressAndChainId,
		getOwnedCoinsAndBalances,
	};
}

export const useCoinBalance = (params?: UseCoinBalanceParams) => {
	const { address: walletAddress, chain: walletChain } = useWallet();

	const { typeArg = SUI_TYPE_ARG, chainId = walletChain.value } = params || {};

	const key = computed(() =>
		queryKey(QueryKey.COIN_BALANCE, {
			address: walletAddress.value,
			chainId,
			typeArg,
		})
	);
	const balance = computed(() => coinBalanceMap.get(key.value));
	return {
		balance,
		isLoading,
	};
};
