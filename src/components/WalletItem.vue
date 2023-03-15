<script lang="ts" setup>
import type { IWallet } from '@/types';
import type { PropType } from 'vue';

defineProps({
	wallet: {
		type: Object as PropType<IWallet>,
		default: () => ({}),
	},
    showWalletName: {
        type: Boolean,
        default: true
    }
});
</script>

<template>
	<button class="wallet-item">
		<img
			:src="wallet.iconUrl"
			:alt="wallet.name"
			class="wallet-item__icon"
		/>
		<div v-if="showWalletName" class="wallet-item__name">
			{{ wallet.name }}
		</div>
	</button>
</template>

<style lang="scss" scoped>
.wallet-item {
	display: flex;
	align-items: center;
    padding: 8px 16px;
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
    border: none;
    outline: none;
   
	&__icon {
		width: 32px;
		height: 32px;
        margin-right: 8px;
	}
	&__name {
		font-weight: bold;
		font-size: 16px;
	}
}
</style>
