import {
	StandardConnectMethod,
	StandardDisconnectMethod,
	SuiSignAndExecuteTransactionMethod,
	StandardConnectFeature,
	StandardDisconnectFeature,
	StandardEventsFeature,
	WalletWithFeatures,
	StandardEventsOnMethod,
} from '@mysten/wallet-standard';
import { SuiSignAndExecuteTransactionFeature } from '@mysten/wallet-standard/src/features';
import { ExpSignMessageMethod } from '../wallet-standard/features/exp_sign-message';

export interface IWallet {
	name: string;
	adapter: IWalletAdapter | undefined;
	installed: boolean | undefined;
	iconUrl: string;
	downloadUrl: {
		browserExtension?: string; // chrome default
	};
}

export type IDefaultWallet = Omit<
	IWallet,
	keyof {
		adapter: any;
		installed: any;
	}
>;

export enum ConnectionStatus {
	DISCONNECTED = 'disconnected',
	CONNECTED = 'connected',
	CONNECTING = 'connecting',
}

export type IWalletAdapter = WalletWithFeatures<
	StandardConnectFeature &
		StandardEventsFeature &
		SuiSignAndExecuteTransactionFeature &
		Partial<StandardDisconnectFeature>
> & {
	hasFeature: (name: string) => boolean;
	connect: StandardConnectMethod;
	disconnect: StandardDisconnectMethod;
	signAndExecuteTransaction: SuiSignAndExecuteTransactionMethod;
	signMessage: ExpSignMessageMethod; // experimental feature
	on: StandardEventsOnMethod;
};
