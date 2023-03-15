import { IWalletAdapter } from '../types/wallet.type';
import {
	ConnectInput,
	ConnectMethod,
	ConnectOutput,
	DisconnectMethod,
	EventsListeners,
	EventsNames,
	EventsOnMethod,
	StandardConnectInput,
	StandardConnectMethod,
	StandardConnectOutput,
	StandardEventsListeners,
	StandardEventsNames,
	StandardEventsOnMethod,
	SuiSignAndExecuteTransactionInput,
	SuiSignAndExecuteTransactionMethod,
	SuiSignAndExecuteTransactionOutput,
	Wallet,
} from '@mysten/wallet-standard';
import { has } from 'lodash-es';
import { ErrorCode, WalletError, WalletNotImplementError } from '../errors';
import {
	ExpSignMessageInput,
	ExpSignMessageMethod,
	ExpSignMessageOutput,
} from '../wallet-standard/features/exp_sign-message';
import { handleConnectionError } from './wallet-error-handling';

export enum FeatureName {
	STANDARD__CONNECT = 'standard:connect',
	STANDARD__DISCONNECT = 'standard:disconnect',
	STANDARD__EVENTS = 'standard:events',
	SUI__SIGN_AND_TRANSACTION = 'sui:signAndExecuteTransaction',
	EXP__SIGN_MESSAGE = 'exp:signMessage',
}

export const initializeWalletAdapter = (standardWalletAdapter: Wallet): IWalletAdapter => {
	const { features, icon, name: walletName, version, accounts, chains } = standardWalletAdapter;
	const getFeature = <T = any>(name: string): T => {
		if (!has(features, name)) {
			throw new WalletNotImplementError(name);
		}
		return (features as any)[name];
	};
	return {
		name: walletName,
		icon,
		version,
		accounts,
		chains,
		features: features as any,
		connect: async (input?: StandardConnectInput): Promise<StandardConnectOutput> => {
			const feature = getFeature<{ connect: StandardConnectMethod }>(
				FeatureName.STANDARD__CONNECT
			);
			try {
				return await feature.connect(input);
			} catch (e) {
				const { code, message, details } = handleConnectionError(e as Error, walletName);
				throw new WalletError(message, code, details);
			}
		},
		disconnect: async (): Promise<void> => {
			const feature = getFeature<{ disconnect: DisconnectMethod }>(
				FeatureName.STANDARD__DISCONNECT
			);
			try {
				return await feature.disconnect();
			} catch (e) {
				throw new WalletError((e as any).message, ErrorCode.WALLET__DISCONNECT_ERROR);
			}
		},
		on: (
			event: StandardEventsNames,
			listener: StandardEventsListeners[StandardEventsNames]
		) => {
			const feature = getFeature<{ on: StandardEventsOnMethod }>(
				FeatureName.STANDARD__EVENTS
			);
			try {
				return feature.on<StandardEventsNames>(event, listener);
			} catch (e) {
				throw new WalletError((e as any).message, ErrorCode.WALLET__LISTEN_TO_EVENT_ERROR);
			}
		},
		signAndExecuteTransaction: async (
			input: SuiSignAndExecuteTransactionInput
		): Promise<SuiSignAndExecuteTransactionOutput> => {
			const feature = getFeature<{
				signAndExecuteTransaction: SuiSignAndExecuteTransactionMethod;
			}>(FeatureName.SUI__SIGN_AND_TRANSACTION);
			try {
				return await feature.signAndExecuteTransaction(input);
			} catch (e) {
				throw new WalletError((e as any).message, ErrorCode.WALLET__SIGN_TX_ERROR);
			}
		},
		signMessage: async (input: ExpSignMessageInput): Promise<ExpSignMessageOutput> => {
			const feature = getFeature<{ signMessage: ExpSignMessageMethod }>(
				FeatureName.EXP__SIGN_MESSAGE
			);
			try {
				return await feature.signMessage(input);
			} catch (e) {
				throw new WalletError((e as any).message, ErrorCode.WALLET__SIGN_MSG_ERROR);
			}
		},
		hasFeature: (name: string): boolean => {
			return has(features, name);
		},
	};
};
