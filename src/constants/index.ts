export * from './chain';
export * from './token';
export * from './storage';

export enum QueryKey {
	COIN_BALANCE = `COIN_BALANCE`,
	OWNED_COINS = 'OWNED_COINS'

}
export function queryKey(key: string, opts: Record<string, any>) {
	const uriQuery = new URLSearchParams(opts);
	return key + '?' + uriQuery.toString();
}
