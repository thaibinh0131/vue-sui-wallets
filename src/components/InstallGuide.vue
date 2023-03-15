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
	<div class="install-guide">
		<WalletItem :wallet="wallet" />
		<div class="install-guide__title">You haven’t install this wallet</div>
		<div class="install-guide__sub-title">Install wallet via Chrome Extension Store</div>
		<div class="install-guide__btn">
			<a
				:href="wallet.downloadUrl?.browserExtension"
				target="_blank"
			>
				Get Wallet
			</a>
		</div>
	</div>
</template>

<style lang="scss">
.install-guide {
	display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
	&__title {
		font-weight: bold;
		font-size: 16px;
        margin-top: 16px;
	}
	&__sub-title {
		font-size: 14px;
		color: var(--color-text-secondary);
	}
	&__btn {
		a {
			background: var(--color-bg-button);
			color: var(--color-bg-primary);
			border-radius: 16px;
			padding: 8px 16px;
			display: block;
			width: max-content;
            margin: 16px auto;
            text-decoration: none;
		}
	}
}
</style>
