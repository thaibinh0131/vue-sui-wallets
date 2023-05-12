import { ConnectionStatus, IDefaultWallet, IWallet, IWalletAdapter } from '../types/wallet.type';
import { KitError } from '../errors';
import {
	StandardConnectInput,
	SuiSignAndExecuteTransactionBlockInput,
	WalletAccount,
	SuiSignTransactionBlockInput,
} from '@mysten/wallet-standard';
import { ExpSignMessageOutput } from '../wallet-standard/features/exp_sign-message';
import type { TransactionBlock } from '@mysten/sui.js';
import { WalletEvent, WalletEventListeners } from '../types/event.type';
import { FeatureName } from '../wallet/wallet-adapter';

import { Chain } from '../types/chain.type';
import { computed, readonly, ref, watch } from 'vue';
import { DefaultChains, UnknownChain } from '@/constants';
import { AllDefaultWallets } from '@/wallet';
import { isNonEmptyArray } from '../utils';
import { Storage } from '../utils/storage';
import { StorageKey } from '@/constants';
import { useAvailableWallets } from './useAvailableWallets';
import { useAutoConnect } from './useAutoConnect';
import { IdentifierString } from '@wallet-standard/core';
import { SuiTxBlock, SuiTxArg, SuiVecTxArg } from '../sdk';

const walletAdapter = ref<IWalletAdapter>();
const status = ref<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
const walletOffListeners = ref<(() => void)[]>([]);
const walletSupports = ref<IDefaultWallet[]>([]);
const shouldAutoConnect = ref<boolean | undefined>();
const chainsList = ref<Chain[]>([]);
const chain = ref<Chain>(UnknownChain);

export const useWallet = (params?: {
	defaultWallets?: IDefaultWallet[];
	chains?: Chain[];
	autoConnect?: boolean;
}) => {
	const {
		defaultWallets = walletSupports.value.length ? walletSupports.value : AllDefaultWallets,
		chains = chainsList.value ?? DefaultChains,
		autoConnect = shouldAutoConnect.value !== undefined ?? true,
	} = params || {};
	shouldAutoConnect.value = autoConnect;
	if (!isNonEmptyArray(chainsList.value)) {
		chainsList.value = [...chains];
	}
	if (!isNonEmptyArray(walletSupports.value)) {
		walletSupports.value = [...defaultWallets];
	}

	const { allAvailableWallets, configuredWallets, detectedWallets } =
		useAvailableWallets(defaultWallets);
	const isCallable = (walletAdapter: IWalletAdapter | undefined, status: ConnectionStatus) => {
		return walletAdapter && status === ConnectionStatus.CONNECTED;
	};
	const account = computed<WalletAccount | undefined>(() => {
		if (!isCallable(walletAdapter.value, status.value)) return;
		return walletAdapter.value?.accounts[0];
	});
	const ensureCallable = (adapter: IWalletAdapter | undefined, status: ConnectionStatus) => {
		if (!isCallable(adapter, status)) {
			throw new KitError('Failed to call function, wallet not connected');
		}
	};
	const connect = async (adapter: IWalletAdapter, options?: StandardConnectInput) => {
		if (!adapter) throw new KitError('param adapter is missing');
		status.value = ConnectionStatus.CONNECTING;
		try {
			const res = await adapter.connect(options);
			// NOTE: hack implementation for getting current network when connected
			// Still waiting for wallet-standard's progress
			if (isNonEmptyArray((res as any)?.accounts.chains)) {
				const chainId = (res as any)?.accounts.chains[0];
				const targetChain = chains.find((item) => item.id === chainId);
				chain.value = targetChain ?? UnknownChain;
			} else {
				chain.value = DefaultChains[0];
			}
			walletAdapter.value = {
				...adapter,
				accounts: res.accounts,
			};
			status.value = ConnectionStatus.CONNECTED;

			const storage = new Storage();
			storage.setItem(StorageKey.LAST_CONNECT_WALLET_NAME, adapter.name);
			return res;
		} catch (e) {
			walletAdapter.value = undefined;
			status.value = ConnectionStatus.DISCONNECTED;
			throw e;
		}
	};
	const disconnect = async () => {
		ensureCallable(walletAdapter.value, status.value);
		const adapter = walletAdapter.value as IWalletAdapter;
		// try to clear listeners
		if (isNonEmptyArray(walletOffListeners.value)) {
			walletOffListeners.value.forEach((off) => {
				try {
					off();
				} catch (e) {
					console.error('error when clearing wallet listener', (e as any).message);
				}
			});
			walletOffListeners.value = []; // empty array
		}
		try {
			// disconnect is an optional action for wallet
			if (adapter.hasFeature(FeatureName.STANDARD__DISCONNECT)) {
				await adapter.disconnect();
			}
		} finally {
			walletAdapter.value = undefined;
			status.value = ConnectionStatus.DISCONNECTED;
			chain.value = chains?.[0] ?? UnknownChain;
			const storage = new Storage();
			storage.setItem(StorageKey.LAST_CONNECT_WALLET_NAME, '');
		}
	};
	const selectWallet = async (walletName: string) => {
		if (isCallable(walletAdapter.value, status.value)) {
			const adapter = walletAdapter.value as IWalletAdapter;
			// Same wallet, ignore
			if (walletName === adapter.name) return;

			// else first disconnect current wallet
			await disconnect();
		}

		const wallet = allAvailableWallets.value.find((wallet) => wallet.name === walletName);
		if (!wallet) {
			const availableWalletNames = allAvailableWallets.value.map((wallet) => wallet.name);
			throw new KitError(
				`select failed: wallet ${walletName} is not available, all wallets are listed here: [${availableWalletNames.join(
					', '
				)}]`
			);
		}
		await connect(wallet.adapter as IWalletAdapter);
	};
	const on = (event: WalletEvent, listener: WalletEventListeners[WalletEvent]) => {
		ensureCallable(walletAdapter.value, status.value);
		const _wallet = walletAdapter.value as IWalletAdapter;

		// filter event and params to decide when to emit
		const off = _wallet.on('change', (params) => {
			if (event === 'change') {
				const _listener = listener as WalletEventListeners['change'];
				_listener(params);
				return;
			}
			if (params.accounts && params.accounts[0].chains && event === 'chainChange') {
				const _listener = listener as WalletEventListeners['chainChange'];
				_listener({ chain: (params.accounts[0].chains as any)?.[0] });
				return;
			}
			if (params.accounts && event === 'accountChange') {
				const _listener = listener as WalletEventListeners['accountChange'];
				_listener({ account: (params.accounts as any)?.[0] });
				return;
			}
			if (params.features && event === 'featureChange') {
				const _listener = listener as WalletEventListeners['featureChange'];
				_listener({ features: params.features });
				return;
			}
		});
		walletOffListeners.value.push(off); // should help user manage off cleaners
		return off;
	};
	const getAccounts = () => {
		ensureCallable(walletAdapter.value, status.value);
		const _wallet = walletAdapter.value as IWalletAdapter;
		return _wallet.accounts;
	};
	const signAndExecuteTransactionBlock = async (
		input: Omit<SuiSignAndExecuteTransactionBlockInput, 'account' | 'chain'>
	) => {
		ensureCallable(walletAdapter.value, status.value);
		if (!account.value) {
			throw new KitError('no active account');
		}
		const _wallet = walletAdapter.value as IWalletAdapter;
		return await _wallet.signAndExecuteTransactionBlock({
			account: account.value,
			chain: chain.value.id as IdentifierString,
			...input,
		});
	};
	const signTransactionBlock = async (
		input: Omit<SuiSignTransactionBlockInput, 'account' | 'chain'>
	) => {
		ensureCallable(walletAdapter.value, status.value);
		if (!account.value) {
			throw new KitError('no active account');
		}
		const _wallet = walletAdapter.value as IWalletAdapter;
		return await _wallet.signTransactionBlock({
			account: account.value,
			chain: chain.value.id as IdentifierString,
			...input,
		});
	};

	const signMessage = async (input: { message: Uint8Array }) => {
		ensureCallable(walletAdapter.value, status.value);
		if (!account.value) {
			throw new KitError('no active account');
		}
		const adapter = walletAdapter.value as IWalletAdapter;
		return await adapter.signMessage({
			account: account.value,
			message: input.message,
		});
	};
	const signAndSendTxn = (tx: TransactionBlock | SuiTxBlock) => {
		tx = tx instanceof SuiTxBlock ? tx.txBlock : tx;
		return signAndExecuteTransactionBlock({ transactionBlock: tx });
	};
	const moveCall = async (callParams: {
		target: string;
		arguments?: (SuiTxArg | SuiVecTxArg)[];
		typeArguments?: string[];
	}) => {
		const { target, arguments: args = [], typeArguments = [] } = callParams;
		const tx = new SuiTxBlock();
		tx.moveCall(target, args, typeArguments);
		return signAndSendTxn(tx);
	};
	const getPublicKey = () => {
		ensureCallable(walletAdapter.value, status.value);
		return Promise.resolve((account.value as WalletAccount).publicKey);
	};
	useAutoConnect(selectWallet, allAvailableWallets, autoConnect);
	const setChain = (chainId: string) => {
		const newChain = chains.find((item) => item.id === chainId);
		if (!newChain) {
			chain.value = UnknownChain;
			return;
		}
		chain.value = newChain;
	};

	return {
		chain: computed(() => chain.value),
		chainsList,
		allAvailableWallets,
		configuredWallets,
		detectedWallets,
		adapter: computed(() => walletAdapter.value),
		name: computed(() => walletAdapter.value?.name),
		status: computed(() => status.value),
		account,
		address: computed(() => account.value?.address),
		connecting: computed(() => status.value === ConnectionStatus.CONNECTING),
		connected: computed(() => status.value === ConnectionStatus.CONNECTED),
		selectWallet,
		disconnect,
		on,
		getAccounts,
		signMessage,
		getPublicKey,
		setChain,
		signAndExecuteTransactionBlock,
		signTransactionBlock,
		moveCall,
	};
};
