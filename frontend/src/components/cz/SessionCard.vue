<template>
	<div class="flex flex-col bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
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
					@click="$emit('retryPayment', session.name)"
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
					@click="showSummary = true"
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
	const s = dayjs.utc(start).local()
	const e = dayjs.utc(end).local()
	return `${s.format('DD MMM YYYY, hh:mm A')} - ${e.format('hh:mm A')}`
}
</script>
