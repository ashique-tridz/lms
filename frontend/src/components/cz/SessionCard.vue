<template>
	<div
		@click="showDetails = true"
		class="flex flex-col bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-150 cursor-pointer"
	>
		<div class="flex items-start justify-between pb-3 border-b border-gray-100">
			<div>
				<h4 class="font-bold text-lg text-gray-900">
					{{ session.tutor }}
				</h4>
				<p class="text-xs text-gray-500 mt-1.5 flex items-center">
					<span class="font-semibold text-gray-400 mr-1.5 uppercase tracking-wider text-[10px]">{{ __('SLOT') }}:</span>
					{{ formatSlotTime(session.start_datetime, session.end_datetime) }}
				</p>
			</div>
			<div>
				<span
					class="border px-2.5 py-0.5 text-xs rounded-full font-medium"
					:class="statusClasses"
				>
					{{ session.booking_status }}
				</span>
			</div>
		</div>

		<div class="grid grid-cols-2 gap-4 text-xs py-4 border-b border-dashed border-gray-100">
			<div>
				<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Amount') }}</span>
				<span class="font-bold text-gray-900">{{ session.amount }} {{ session.currency }}</span>
			</div>
			<div>
				<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Payment') }}</span>
				<span class="font-bold text-gray-900">{{ session.payment_status }}</span>
			</div>
		</div>

		<div class="flex items-center justify-between pt-4">
			<!-- Meeting Link -->
			<div v-if="session.booking_status === 'Confirmed' && session.meeting_link">
				<a
					@click.stop
					:href="session.meeting_link"
					target="_blank"
					class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150 shadow-sm"
				>
					<Video class="w-3.5 h-3.5" />
					{{ __('Join Meeting') }}
				</a>
			</div>
			<div v-else-if="session.booking_status === 'Confirmed'">
				<span class="text-xs text-gray-500 italic">
					{{ __('Generating meeting link...') }}
				</span>
			</div>
			<div v-else-if="session.booking_status === 'Pending Payment'">
				<Button
					@click.stop="$emit('retryPayment', session.name)"
					variant="solid"
					class="rounded-lg text-xs px-4 py-2"
				>
					{{ __('Pay Now') }}
				</Button>
			</div>
			<div v-else>
				<span class="text-xs text-gray-400 uppercase tracking-wider text-[10px]">{{ __('No Active Meeting') }}</span>
			</div>

			<!-- AI Summary Action -->
			<div v-if="session.booking_status === 'Completed' && session.ai_summary">
				<Button
					@click.stop="showSummary = true"
					variant="outline"
					class="rounded-lg text-xs px-4 py-2"
				>
					{{ __('AI Feedback') }}
				</Button>
			</div>
		</div>

		<!-- AI Summary Modal -->
		<Dialog
			v-model="showSummary"
			:options="{
				title: `${__('AI Session Summary')} - ${session.tutor}`,
				size: 'lg',
			}"
		>
			<template #body-content>
				<div class="prose prose-sm max-w-none text-gray-800 p-4 bg-gray-50 rounded-lg border border-gray-150">
					<p class="whitespace-pre-wrap leading-relaxed">{{ session.ai_summary }}</p>
				</div>
			</template>
		</Dialog>

		<!-- Booking Details Dialog -->
		<Dialog
			v-model="showDetails"
			:options="{
				title: __('Booking Details'),
				size: 'md',
			}"
		>
			<template #body-content>
				<div class="space-y-4 text-sm text-gray-700 p-1">
					<!-- Tutor and Status Header -->
					<div class="flex justify-between items-start border-b border-gray-100 pb-3">
						<div>
							<h4 class="font-bold text-base text-gray-950">{{ session.tutor }}</h4>
							<p class="text-xs text-gray-400 mt-0.5">ID: {{ session.name }}</p>
						</div>
						<span class="border px-2.5 py-0.5 text-xs rounded-full font-semibold" :class="statusClasses">
							{{ session.booking_status }}
						</span>
					</div>

					<!-- Details Grid -->
					<div class="grid grid-cols-2 gap-4 py-2">
						<div class="col-span-2">
							<span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">{{ __('Date & Time') }}</span>
							<span class="font-medium text-gray-900 block leading-relaxed">
								{{ formatSlotTime(session.start_datetime, session.end_datetime) }}
							</span>
						</div>
						<div>
							<span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">{{ __('Subject') }}</span>
							<span class="font-medium text-gray-900 block">{{ session.subject || 'N/A' }}</span>
						</div>
						<div>
							<span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">{{ __('Board') }}</span>
							<span class="font-medium text-gray-900 block">{{ session.board || 'N/A' }}</span>
						</div>
						<div>
							<span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">{{ __('Class') }}</span>
							<span class="font-medium text-gray-900 block">{{ session.class || 'N/A' }}</span>
						</div>
						<div>
							<span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">{{ __('Amount Paid') }}</span>
							<span class="font-medium text-gray-900 block">{{ session.amount }} {{ session.currency }}</span>
						</div>
						<div class="col-span-2">
							<span class="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-0.5">{{ __('Payment Status') }}</span>
							<span class="font-medium text-gray-900 block">{{ session.payment_status }}</span>
						</div>
					</div>

					<!-- Meeting Link Section -->
					<div v-if="session.booking_status === 'Confirmed'" class="bg-blue-50 border border-blue-100 rounded-lg p-3 mt-3">
						<span class="text-xs font-semibold text-blue-900 uppercase tracking-wider block mb-1">{{ __('Meeting Room') }}</span>
						<div v-if="session.meeting_link" class="flex items-center justify-between">
							<span class="text-xs text-blue-800 break-all select-all font-mono mr-2">{{ session.meeting_link }}</span>
							<a
								:href="session.meeting_link"
								target="_blank"
								class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
							>
								<Video class="w-3.5 h-3.5" />
								{{ __('Join') }}
							</a>
						</div>
						<div v-else class="text-xs text-blue-800 italic">
							{{ __('Generating meeting link...') }}
						</div>
					</div>

					<!-- Audit Details Section -->
					<div class="border-t border-gray-100 pt-3 text-xs text-gray-400 flex flex-col gap-1">
						<div class="flex justify-between">
							<span>{{ __('Locked At') }}</span>
							<span>{{ session.locked_at ? dayjs(session.locked_at).format('DD MMM YYYY, hh:mm A') : 'N/A' }}</span>
						</div>
						<div v-if="session.confirmed_at" class="flex justify-between">
							<span>{{ __('Confirmed At') }}</span>
							<span>{{ dayjs(session.confirmed_at).format('DD MMM YYYY, hh:mm A') }}</span>
						</div>
					</div>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { Dialog, Button } from 'frappe-ui'
import { Video } from 'lucide-vue-next'

const props = defineProps({
	session: {
		type: Object,
		required: true,
	},
})

defineEmits(['retryPayment'])

const dayjs = inject('$dayjs')
const showSummary = ref(false)
const showDetails = ref(false)

const statusClasses = computed(() => {
	switch (props.session.booking_status) {
		case 'Confirmed':
			return 'border-blue-200 bg-blue-50 text-blue-700'
		case 'Completed':
			return 'border-green-200 bg-green-50 text-green-700'
		case 'Pending Payment':
			return 'border-amber-200 bg-amber-50 text-amber-700'
		case 'Cancelled':
		case 'Expired':
			return 'border-gray-200 bg-gray-50 text-gray-400 line-through'
		default:
			return 'border-gray-200 bg-gray-50 text-gray-600'
	}
})

function formatSlotTime(start, end) {
	if (!start || !end || !dayjs) return 'N/A'
	const s = dayjs(start)
	const e = dayjs(end)
	return `${s.format('DD MMM YYYY, hh:mm A')} - ${e.format('hh:mm A')}`
}
</script>
