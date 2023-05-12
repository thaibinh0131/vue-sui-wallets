<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { IWallet } from '@/types';
import CloseIcon from './Icons/CloseIcon.vue';
import ArrowLeftIcon from './Icons/ArrowLeftIcon.vue';
import WalletsList from './WalletsList.vue';
import { useWallet } from '@/composable';
import { BaseError } from '@/errors';
import InstallGuide from './InstallGuide.vue';
import Connecting from './Connecting.vue';

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false,
	},
	onConnectSuccess: {
		type: Function,
		default: () => {},
	},
	onConnectError: {
		type: Function,
		default: (err: BaseError) => {
			throw err;
		},
	},
});

const emit = defineEmits(['update:modelValue']);
const activeWallet = ref<IWallet>();
const { configuredWallets, detectedWallets, selectWallet, connecting } = useWallet();

const showModal = computed({
	get() {
		return props.modelValue;
	},
	set(val) {
		emit('update:modelValue', val);
	},
});

const headerText = computed(() => {
	if (!activeWallet.value) return 'Connect Wallet';
	if (!activeWallet.value.installed) return 'Install Wallet';
	return 'Connecting';
});

const shouldShowArrowBack = computed(() => {
	if (!activeWallet.value) return false;
	return activeWallet.value && !activeWallet.value.installed;
});

const clearActiveWallet = () => {
	activeWallet.value = undefined;
};

const handleSelectWallet = async (wallet: IWallet) => {
	activeWallet.value = { ...wallet };
	if (wallet.installed) {
		try {
			await selectWallet(wallet.name);
			showModal.value = false;
			props.onConnectSuccess();
			clearActiveWallet();
		} catch (error) {
			props.onConnectError(error);
		}
	}
};
</script>

<template>
	<transition
		v-if="showModal"
		name="modal"
	>
		<Teleport to="body">
			<div class="connect-modal">
				<div
					class="connect-modal__mask"
					@click.stop="showModal = false"
				></div>
				<div class="connect-modal__wrapper">
					<div class="connect-modal__content">
						<div class="connect-modal__body">
							<div class="connect-modal__content__header">
								<div>
									<button
										v-if="shouldShowArrowBack"
										@click="clearActiveWallet"
										class="arrow-left"
									>
										<ArrowLeftIcon />
									</button>

									<span>
										{{ headerText }}
									</span>
								</div>
								<button>
									<CloseIcon @click.stop="showModal = false" />
								</button>
							</div>
							<div class="connect-modal__content__body">
								<template v-if="activeWallet">
									<InstallGuide
										v-if="!activeWallet.installed"
										:wallet="activeWallet"
									/>
									<Connecting
										v-else-if="connecting"
										:wallet="activeWallet"
									/>
								</template>
								<template v-else>
									<WalletsList
										title="Popular"
										:wallets="configuredWallets"
										@select-wallet="handleSelectWallet"
									/>
									<WalletsList
										title="Others"
										:wallets="detectedWallets"
										@select-wallet="handleSelectWallet"
									/>
								</template>
							</div>
						</div>
					</div>
				</div>
			</div>
		</Teleport>
	</transition>
</template>
<style lang="scss">
.connect-modal {
	position: fixed;
	display: table;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	color: var(--color-text-primary);
	&__mask {
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		position: fixed;
		transition: opacity 0.3s ease;
		z-index: 1000;
	}
	&__wrapper {
		display: table-cell;
		vertical-align: middle;
	}
	&__content {
		max-width: 500px;
		max-height: 100%;
		overflow: auto;
		margin: 20px auto;
		transition: all 0.3s ease;
		z-index: 99999;
		position: relative;
		&__header {
			font-weight: bold;
			font-size: 20px;
			padding-bottom: 16px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			> div {
				display: flex;
				align-items: center;
				.arrow-left {
					margin-left: 8px;
				}
			}
		}
		&__body {
			max-height: 350px;
			min-height: 280px;
			overflow-y: auto;
			// padding: 0 16px;
		}
	}
	&__body {
		margin: 20px;
		background-color: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
		border-radius: 16px;
		padding: 16px;
	}
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
	opacity: 0;
}

.modal-leave-active {
	opacity: 0;
}

.modal-enter .connect-modal,
.modal-leave-active .connect-modal {
	-webkit-transform: scale(1.1);
	transform: scale(1.1);
}

::-webkit-scrollbar {
	width: 8px;
}
::-webkit-scrollbar-track {
	@apply bg-transparent;
	border-left: 1px solid transparent;
}
::-webkit-scrollbar-thumb {
	border-width: 4px;

	border-color: transparent;
	background-color: #333;
	border-radius: 9999px;
}
</style>
