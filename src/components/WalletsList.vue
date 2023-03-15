<script lang="ts" setup>
import type { IWallet } from '@/types';
import type { PropType } from 'vue';
import WalletItem from './WalletItem.vue';

defineProps({
	wallets: {
		type: Object as PropType<IWallet[]>,
		default: () => [],
	},
	title: {
		type: String,
		required: true,
	},
});

const emit = defineEmits(['selectWallet']);

const handleSelectWallet = (wallet: IWallet) => {
	emit('selectWallet', wallet);
};
</script>

<template>
	<div
		v-if="wallets.length"
		class="wallets"
	>
		<div class="wallets__title">{{ title }}</div>
		<div class="wallets__list">
			<WalletItem
				v-for="wallet in wallets"
				:key="wallet.name"
				:wallet="wallet"
				@click="handleSelectWallet(wallet)"
			></WalletItem>
		</div>
	</div>
</template>

<style lang="scss">
.wallets {
	&__title {
		font-size: 14px;
		color: var(--color-text-secondary);
		margin-bottom: 16px;
	}
	&__list {
		display: flex;
		flex-direction: column;
		.wallet-item {
			margin-bottom: 8px;
			cursor: pointer;
			&:hover {
				background-color: var(--color-bg-hover);
			}
		}
	}
}
</style>
