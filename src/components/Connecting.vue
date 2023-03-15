<script lang="ts" setup>
import type { IWallet } from '@/types';
import type { PropType } from 'vue';
import WalletItem from './WalletItem.vue';

defineProps({
	wallet: {
		type: Object as PropType<IWallet>,
		default: () => ({}),
	},
});
</script>

<template>
	<div class="connecting">
		<WalletItem
			:wallet="wallet"
			:show-wallet-name="false"
		/>
		<div class="connecting__title">Opening {{ wallet.name }}</div>
		<div class="connecting__sub-title">Confirm connection in the extension</div>
	</div>
</template>

<style lang="scss">
.connecting {
	text-align: center;
	&__title {
		font-weight: bold;
		font-size: 16px;
	}
	&__sub-title {
		font-size: 14px;
		color: var(--color-text-secondary);
	}
}
</style>
