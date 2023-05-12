import {
	getMoveObject,
	JsonRpcProvider,
	SuiMoveObject,
	Coin as CoinAPI,
	Connection,
	getSuiObjectData,
	SuiObjectResponse,
	SuiObjectData,
} from '@mysten/sui.js';
import { Coin, CoinObject, Nft, NftObject, CoinObjectDto } from './objects';

export const SUI_SYSTEM_STATE_OBJECT_ID = '0x0000000000000000000000000000000000000005';

export class Provider {
	query: QueryProvider;

	constructor(endpoint: string) {
		this.query = new QueryProvider(endpoint);
	}
}

class QueryProvider {
	provider: JsonRpcProvider;

	constructor(endpoint: string) {
		this.provider = new JsonRpcProvider(new Connection({ fullnode: endpoint }));
	}

	public async getOwnedObjects(address: string): Promise<SuiObjectData[]> {
		let hasNextPage = true;
		let nextCursor = null;
		let objects: SuiObjectData[] = [];
		while (hasNextPage) {
			const resp: any = await this.provider.getOwnedObjects({
				owner: address,
				cursor: nextCursor,
				options: {
					showType: true,
					showDisplay: true,
					showContent: true,
					showOwner: true,
				},
			});
			const sui_object_responses = resp.data as SuiObjectResponse[];

			sui_object_responses?.forEach((r) => {
				const obj = getSuiObjectData(r);
				if (obj) {
					objects.push(obj);
				}
			});
			hasNextPage = resp.hasNextPage;
			nextCursor = resp.nextCursor;
		}
		return objects;
	}

	public async getOwnedCoins(
		address: string
	): Promise<{ coinAsSuiMoveObject?: SuiMoveObject; coinObjectDto: CoinObjectDto }[]> {
		const objects = await this.getOwnedObjects(address);
		const res = objects
			.map((item) => ({
				id: item.objectId,
				object: { ...getMoveObject(item), type: item.type } as SuiMoveObject,
			}))
			.filter((item) => {
				return item.object && CoinAPI.isCoin(item.object);
			})
			.map((item) => {
				return {
					coinAsSuiMoveObject: item.object,
					coinObjectDto: Coin.getCoinObject(item.object as SuiMoveObject).toDto(),
				};
			});
		return res;
	}

	public async getOwnedNfts(address: string): Promise<NftObject[]> {
		const objects = await this.getOwnedObjects(address);
		const res = objects
			.map((item) => ({
				id: item.objectId,
				object: { ...getMoveObject(item), type: item.type } as SuiMoveObject,
				previousTransaction: item.previousTransaction,
			}))
			.filter((item) => item.object && Nft.isNft(item.object))
			.map((item) => {
				const obj = item.object as SuiMoveObject;
				return Nft.getNftObject(obj, item.previousTransaction);
			});
		return res;
	}
}
