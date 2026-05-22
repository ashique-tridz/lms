<template>
	<div class="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
		<!-- Step 1: Tutor info and filters -->
		<div class="flex flex-col sm:flex-row justify-between gap-4 border-b border-gray-100 pb-5">
			<div>
				<h3 class="text-xl font-bold text-gray-900">
					{{ tutor.tutor_name }}
				</h3>
				<p class="text-xs text-gray-500 mt-1">
					{{ tutor.years_of_experiance }} {{ __('years of experience') }} | {{ tutor.timezone || 'UTC' }}
				</p>
			</div>
			<div class="text-left sm:text-right">
				<span class="text-[10px] uppercase tracking-wider text-gray-400 block">{{ __('Hourly Rate') }}</span>
				<span class="text-lg font-bold text-gray-950">{{ tutor.hourly_rate || 500 }} INR</span>
			</div>
		</div>

		<!-- Filters Section -->
		<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
			<div>
				<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ __('Subject') }}</label>
				<select
					v-model="filters.subject"
					class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option v-for="sub in tutor.subjects" :key="sub.name" :value="sub.subject">
						{{ sub.subject }}
					</option>
				</select>
			</div>

			<div>
				<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ __('Board') }}</label>
				<select
					v-model="filters.board"
					class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option v-for="brd in tutor.boards" :key="brd.name" :value="brd.board">
						{{ brd.board }}
					</option>
				</select>
			</div>

			<div>
				<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ __('Class') }}</label>
				<select
					v-model="filters.class_name"
					class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option v-for="cls in tutor.classes" :key="cls.name" :value="cls.class">
						{{ cls.class }}
					</option>
				</select>
			</div>
		</div>

		<!-- Slots List -->
		<div v-if="slotsList.loading" class="flex justify-center py-12">
			<LoadingIndicator class="w-8 h-8 text-blue-600" />
		</div>
		<div v-else>
			<SlotPicker
				:slots="slots"
				:selectedSlotName="selectedSlot?.name"
				@selectSlot="onSelectSlot"
			/>
		</div>

		<!-- Booking Details Box (When slot is selected) -->
		<div
			v-if="selectedSlot"
			class="bg-blue-50 border border-blue-100 rounded-xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-150"
		>
			<div class="space-y-1">
				<h4 class="font-bold text-sm text-blue-900 uppercase tracking-wider">{{ __('Booking Review') }}</h4>
				<p class="text-xs text-blue-800">
					<span class="font-semibold text-blue-600 mr-1 uppercase">{{ __('Time') }}:</span>
					{{ formatSlotTime(selectedSlot.start_datetime, selectedSlot.end_datetime) }}
				</p>
				<p class="text-xs text-blue-800">
					<span class="font-semibold text-blue-600 mr-1 uppercase">{{ __('Price') }}:</span>
					{{ tutor.hourly_rate || 500 }} INR
				</p>
			</div>

			<Button
				:loading="bookingStore.loading"
				@click="startBooking"
				variant="solid"
				class="w-full sm:w-auto justify-center rounded-lg px-6 py-2.5 text-xs font-semibold"
			>
				{{ __('Proceed to Pay') }}
			</Button>
		</div>

		<!-- Razorpay Checkout Headless Component -->
		<RazorpayCheckout
			v-if="checkoutDetails"
			:checkoutDetails="checkoutDetails"
			@success="onPaymentSuccess"
			@failure="onPaymentFailure"
		/>
	</div>
</template>

<script setup>
import { computed, inject, reactive, ref, watch } from 'vue'
import { LoadingIndicator, Button } from 'frappe-ui'
import { useTutorStore } from '@/stores/useTutorStore'
import { useBookingStore } from '@/stores/useBookingStore'
import SlotPicker from './SlotPicker.vue'
import RazorpayCheckout from './RazorpayCheckout.vue'
import { useRouter } from 'vue-router'

const props = defineProps({
	tutor: {
		type: Object,
		required: true,
	},
})

const dayjs = inject('$dayjs')
const router = useRouter()
const tutorStore = useTutorStore()
const bookingStore = useBookingStore()

const filters = reactive({
	subject: props.tutor.subjects?.[0]?.subject || '',
	board: props.tutor.boards?.[0]?.board || '',
	class_name: props.tutor.classes?.[0]?.class || '',
})

const selectedSlot = ref(null)
const checkoutDetails = ref(null)

// Synchronize filters and search
const slotsList = tutorStore.slotsList
const slots = computed(() => slotsList.data?.success ? slotsList.data.data : [])

watch(
	() => props.tutor.name,
	() => {
		filters.subject = props.tutor.subjects?.[0]?.subject || ''
		filters.board = props.tutor.boards?.[0]?.board || ''
		filters.class_name = props.tutor.classes?.[0]?.class || ''
	},
	{ immediate: true }
)

watch(
	filters,
	() => {
		selectedSlot.value = null
		tutorStore.filters.tutor = props.tutor.name
		tutorStore.filters.subject = filters.subject
		tutorStore.filters.board = filters.board
		tutorStore.filters.class_name = filters.class_name
	},
	{ immediate: true, deep: true }
)

function onSelectSlot(slot) {
	selectedSlot.value = slot
}

function formatSlotTime(start, end) {
	if (!start || !end || !dayjs) return ''
	const s = dayjs(start)
	const e = dayjs(end)
	return `${s.format('dddd, DD MMM YYYY, hh:mm A')} - ${e.format('hh:mm A')}`
}

async function startBooking() {
	if (!selectedSlot.value) return
	
	try {
		const res = await bookingStore.initiateBooking({
			slot: selectedSlot.value.name,
			tutor: props.tutor.name,
			amount: props.tutor.hourly_rate || 500,
			currency: 'INR',
			subject: selectedSlot.value.subject || undefined,
			board: selectedSlot.value.board || undefined,
			class_name: selectedSlot.value.class || undefined,
		})
		
		if (res) {
			checkoutDetails.value = res
		}
	} catch (e) {
		console.error("Booking initiation failed:", e)
	}
}

async function onPaymentSuccess(paymentRes) {
	checkoutDetails.value = null
	try {
		await bookingStore.confirmPayment(paymentRes)
	} catch (e) {
		console.error("Failed to confirm payment on backend:", e)
	}
	router.push({ name: 'Sessions' })
}

async function onPaymentFailure(errorRes) {
	checkoutDetails.value = null
	if (errorRes.order_id) {
		await bookingStore.reportFailure(
			errorRes.order_id,
			errorRes.error_code,
			errorRes.error_description
		)
	}
	alert(__('Payment failed. Please try again.'))
}
</script>
