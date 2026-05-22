<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs class="h-7" :items="[{ label: __('Sessions'), route: { name: 'Sessions' } }]" />
			<router-link :to="{ name: 'BookSession' }">
				<Button variant="solid" class="text-xs font-semibold">
					{{ __('Book a Tutor') }}
				</Button>
			</router-link>
		</header>

		<div class="max-w-6xl mx-auto p-5 sm:p-8 space-y-8">
			<!-- Upcoming Sessions -->
			<div class="space-y-4">
				<h2 class="text-lg font-semibold text-gray-900">{{ __('Upcoming Sessions') }}</h2>
				<div v-if="upcomingSessions.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<SessionCard
						v-for="session in upcomingSessions"
						:key="session.name"
						:session="session"
						@retryPayment="handleRetryPayment"
					/>
				</div>
				<div v-else class="text-sm text-gray-500 py-8 text-center bg-white border border-dashed border-gray-200 rounded-xl">
					{{ __('No upcoming sessions found.') }}
				</div>
			</div>

			<!-- Past Sessions -->
			<div class="space-y-4">
				<div class="flex justify-between items-center">
					<h2 class="text-lg font-semibold text-gray-900">{{ __('Past Sessions') }}</h2>
					<router-link
						:to="{ name: 'SessionHistory' }"
						class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
					>
						{{ __('View Full History') }}
					</router-link>
				</div>
				<div v-if="pastSessions.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<SessionCard v-for="session in pastSessions" :key="session.name" :session="session" />
				</div>
				<div v-else class="text-sm text-gray-500 py-8 text-center bg-white border border-dashed border-gray-200 rounded-xl">
					{{ __('No past sessions found.') }}
				</div>
			</div>
		</div>

		<RazorpayCheckout
			v-if="checkoutDetails"
			:checkoutDetails="checkoutDetails"
			@success="onPaymentSuccess"
			@failure="onPaymentFailure"
		/>
	</div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { Breadcrumbs, Button } from 'frappe-ui'
import { useSessionStore } from '@/stores/useSessionStore'
import { useBookingStore } from '@/stores/useBookingStore'
import SessionCard from '@/components/cz/SessionCard.vue'
import RazorpayCheckout from '@/components/cz/RazorpayCheckout.vue'

const dayjs = inject('$dayjs')
const sessionStore = useSessionStore()
const bookingStore = useBookingStore()

const checkoutDetails = ref(null)

onMounted(() => {
	sessionStore.fetchHistory()
})

const upcomingSessions = computed(() => {
	if (!sessionStore.sessions) return []
	return sessionStore.sessions.filter(
		(s) => s.booking_status === 'Confirmed' || s.booking_status === 'Pending Payment'
	)
})

const pastSessions = computed(() => {
	if (!sessionStore.sessions) return []
	return sessionStore.sessions.filter(
		(s) =>
			s.booking_status === 'Completed' ||
			s.booking_status === 'Cancelled' ||
			s.booking_status === 'Expired'
	)
})

async function handleRetryPayment(bookingName) {
	try {
		const res = await bookingStore.getCheckout(bookingName)
		if (res) checkoutDetails.value = res
	} catch (e) {
		console.error('Failed to load checkout details:', e)
	}
}

function onPaymentSuccess() {
	checkoutDetails.value = null
	sessionStore.fetchHistory()
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
	sessionStore.fetchHistory()
}
</script>
