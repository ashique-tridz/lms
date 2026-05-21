<template>
	<div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
		<!-- Page Header -->
		<div class="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
			<div>
				<h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">My Tutor Dashboard</h1>
				<p class="text-slate-500 mt-1">Manage your live one-on-one sessions and study recommendations.</p>
			</div>
			<div class="mt-4 sm:mt-0">
				<router-link to="/book-session" class="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
					<svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
					Book New Session
				</router-link>
			</div>
		</div>

		<!-- Main Layout Tabs -->
		<div class="max-w-7xl mx-auto">
			<div class="border-b border-slate-200 mb-6">
				<nav class="-mb-px flex space-x-8" aria-label="Tabs">
					<button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="[
						activeTab === tab.id
							? 'border-indigo-600 text-indigo-600'
							: 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300',
						'whitespace-nowrap py-4 px-1 border-b-2 font-bold text-md transition-all duration-200 focus:outline-none'
					]">
						{{ tab.name }}
					</button>
				</nav>
			</div>

			<!-- Loading State -->
			<div v-if="loading" class="flex flex-col items-center justify-center py-24">
				<div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
				<p class="mt-4 text-slate-600 font-medium">Fetching dashboard details...</p>
			</div>

			<!-- Bookings Tab Content -->
			<div v-else-if="activeTab === 'upcoming' || activeTab === 'past'">
				<div v-if="filteredBookings.length === 0" class="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 px-4 text-center">
					<div class="mx-auto h-20 w-20 text-slate-300 mb-4 flex items-center justify-center bg-slate-50 rounded-full">
						<svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<h3 class="text-lg font-bold text-slate-800 mb-1">No Sessions Found</h3>
					<p class="text-slate-500 max-w-md mx-auto">
						You don't have any {{ activeTab }} tutor sessions registered at the moment.
					</p>
				</div>

				<div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div v-for="booking in filteredBookings" :key="booking.name" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
						<div>
							<!-- Top Meta -->
							<div class="flex justify-between items-start mb-4">
								<div>
									<span class="px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider bg-indigo-50 text-indigo-700">
										{{ booking.subject || 'One-on-One Session' }}
									</span>
								</div>
								<!-- Status Badges -->
								<div class="flex space-x-1.5">
									<!-- Booking Status -->
									<span :class="[
										booking.booking_status === 'Confirmed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
										booking.booking_status === 'Pending Payment' ? 'bg-amber-50 text-amber-700 border-amber-100' :
										'bg-slate-50 text-slate-600 border-slate-100',
										'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border'
									]">
										{{ booking.booking_status }}
									</span>
									<!-- Payment Status -->
									<span :class="[
										booking.payment_status === 'Paid' || booking.payment_status === 'Captured' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
										'inline-flex items-center px-2 py-0.5 rounded text-xxs font-bold uppercase tracking-wide'
									]">
										{{ booking.payment_status }}
									</span>
								</div>
							</div>

							<!-- Tutor Details -->
							<h3 class="text-lg font-bold text-slate-800 mb-1">{{ booking.tutor }}</h3>
							
							<div class="text-sm text-slate-500 space-y-2 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
								<div class="flex justify-between">
									<span>Date:</span>
									<span class="font-bold text-slate-800">{{ formatDateFull(booking.locked_at) }}</span>
								</div>
								<div class="flex justify-between">
									<span>Booking ID:</span>
									<span class="font-semibold text-slate-600">{{ booking.name }}</span>
								</div>
								<div class="flex justify-between">
									<span>Amount:</span>
									<span class="font-extrabold text-slate-800">₹{{ booking.amount }}</span>
								</div>
							</div>
						</div>

						<!-- Action Row -->
						<div class="mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-3">
							<!-- Complete Payment Button -->
							<button v-if="booking.booking_status === 'Pending Payment'" @click="resumePayment(booking)" :disabled="checkoutLoading" class="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center space-x-2">
								<span v-if="checkoutLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
								<span v-else>Pay Now</span>
							</button>

							<!-- Google Meet Active Link -->
							<a v-if="booking.booking_status === 'Confirmed' && booking.meeting_link" :href="booking.meeting_link" target="_blank" class="flex-1 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
								<svg class="h-5 w-5 mr-2 animate-pulse text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
								</svg>
								Join Session
							</a>

							<!-- AI Summary Modal Button -->
							<button v-if="booking.booking_status === 'Completed' && booking.ai_summary" @click="viewSummary(booking)" class="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center">
								<svg class="h-4.5 w-4.5 mr-2 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
								View AI Meeting Summary
							</button>
						</div>
					</div>
				</div>
			</div>

			<!-- Recommendations Tab Content -->
			<div v-else-if="activeTab === 'recommendations'">
				<div v-if="recommendations.length === 0" class="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 px-4 text-center">
					<div class="mx-auto h-20 w-20 text-slate-300 mb-4 flex items-center justify-center bg-slate-50 rounded-full">
						<svg class="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
						</svg>
					</div>
					<h3 class="text-lg font-bold text-slate-800 mb-1">All Caught Up!</h3>
					<p class="text-slate-500 max-w-md mx-auto">
						No pending revision recommendations. Our AI engine produces revision plans based on quiz performances and class completions.
					</p>
				</div>

				<div v-else class="space-y-6">
					<div v-for="rec in recommendations" :key="rec.name" class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300">
						<!-- Top Row -->
						<div class="flex justify-between items-start mb-4">
							<div class="flex items-center space-x-3">
								<span :class="[
									rec.priority === 'High' ? 'bg-rose-50 text-rose-700' :
									rec.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
									'bg-blue-50 text-blue-700',
									'inline-flex items-center px-3 py-1 rounded-md text-xs font-bold'
								]">
									{{ rec.priority }} Priority
								</span>
								<span class="text-xs text-slate-400 font-semibold">
									Generated: {{ formatDate(rec.recommended_on) }}
								</span>
							</div>
							<div>
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 uppercase tracking-wide">
									{{ rec.status }}
								</span>
							</div>
						</div>

						<h3 class="text-xl font-bold text-slate-800 mb-3">Revision for Lesson: {{ rec.lesson }}</h3>
						
						<!-- Details Grids -->
						<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
							<!-- Reason & Notes -->
							<div class="bg-indigo-50/20 border border-indigo-50 rounded-xl p-4.5">
								<h4 class="text-xs font-extrabold text-indigo-800 uppercase tracking-wider mb-2">AI Reason</h4>
								<p class="text-slate-700 text-sm leading-relaxed mb-4 font-medium">{{ rec.recommendation_reason }}</p>
								
								<h4 class="text-xs font-extrabold text-indigo-800 uppercase tracking-wider mb-2">Revision Notes</h4>
								<p class="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{{ rec.revision_notes || 'No specific notes recorded. Review lesson materials.' }}</p>
							</div>

							<!-- Practice Questions -->
							<div class="bg-emerald-50/10 border border-emerald-50 rounded-xl p-4.5">
								<h4 class="text-xs font-extrabold text-emerald-800 uppercase tracking-wider mb-2">Practice Questions</h4>
								<div class="text-slate-700 text-sm whitespace-pre-line leading-relaxed">
									{{ rec.practice_questions || 'No revision questions generated. Practice quiz exercises.' }}
								</div>
							</div>
						</div>

						<!-- Action Row -->
						<div class="mt-6 pt-4 border-t border-slate-100 flex justify-end space-x-3">
							<router-link :to="`/courses`" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-xl text-sm shadow-md transition-all duration-200">
								Start Revision
							</router-link>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- AI Meeting Summary Modal -->
		<div v-if="activeSummaryBooking" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
			<div class="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden transform transition-all border border-slate-100">
				<!-- Header -->
				<div class="bg-indigo-600 px-6 py-5 text-white flex justify-between items-center">
					<div>
						<h3 class="text-lg font-bold">AI Meeting Audit Summary</h3>
						<p class="text-xs text-indigo-200 mt-0.5">Booking: {{ activeSummaryBooking.name }}</p>
					</div>
					<button @click="activeSummaryBooking = null" class="text-white/80 hover:text-white focus:outline-none">
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Content -->
				<div class="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
					<div class="bg-slate-50 border border-slate-100 rounded-2xl p-5">
						<h4 class="text-xs font-extrabold text-indigo-700 uppercase tracking-wide mb-2.5">AI Summary Output</h4>
						<p class="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
							{{ activeSummaryBooking.ai_summary }}
						</p>
					</div>
					
					<div v-if="activeSummaryBooking.ai_transcript" class="border-t border-slate-100 pt-5">
						<h4 class="text-sm font-bold text-slate-700 mb-3">AI Meeting Transcript Audit</h4>
						<div class="bg-slate-900 text-slate-300 p-4.5 rounded-2xl text-xs font-mono whitespace-pre-line leading-relaxed max-h-60 overflow-y-auto">
							{{ activeSummaryBooking.ai_transcript }}
						</div>
					</div>
				</div>
				
				<!-- Footer -->
				<div class="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
					<button @click="activeSummaryBooking = null" class="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-5 rounded-xl text-sm transition-all duration-200">
						Close Summary
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { call, toast } from 'frappe-ui'
import dayjs from 'dayjs'

const loading = ref(false)
const checkoutLoading = ref(false)
const activeTab = ref('upcoming')
const bookings = ref([])
const recommendations = ref([])
const activeSummaryBooking = ref(null)

const tabs = [
	{ id: 'upcoming', name: 'Upcoming Sessions' },
	{ id: 'past', name: 'Past Sessions' },
	{ id: 'recommendations', name: 'AI Revision Engine' },
]

onMounted(async () => {
	await loadDashboardData()
})

const loadDashboardData = async () => {
	loading.value = true
	try {
		const [bookingList, recList] = await Promise.all([
			call('smart_learning.api.student_api.get_booking_history'),
			call('smart_learning.api.student_api.get_revision_recommendations')
		])
		bookings.value = bookingList || []
		recommendations.value = recList || []
	} catch (e) {
		console.error('Error fetching dashboard data:', e)
		toast.error('Failed to load tutor dashboard details')
	} finally {
		loading.value = false
	}
}

const filteredBookings = computed(() => {
	if (activeTab.value === 'upcoming') {
		return bookings.value.filter(b => b.booking_status !== 'Completed' && b.booking_status !== 'Cancelled')
	} else if (activeTab.value === 'past') {
		return bookings.value.filter(b => b.booking_status === 'Completed' || b.booking_status === 'Cancelled')
	}
	return []
})

const resumePayment = async (booking) => {
	checkoutLoading.value = true
	try {
		const rzpScriptLoaded = await loadRazorpayScript()
		if (!rzpScriptLoaded) {
			toast.error('Payment checkout widget unavailable. Check network connections.')
			checkoutLoading.value = false
			return
		}

		const checkoutRes = await call('smart_learning.api.booking_api.get_checkout_details', {
			booking_name: booking.name
		})

		if (!checkoutRes || !checkoutRes.order_id) {
			toast.error('Failed to retrieve checkout configuration.')
			checkoutLoading.value = false
			return
		}

		const options = {
			key: checkoutRes.key_id,
			amount: checkoutRes.amount,
			currency: checkoutRes.currency,
			name: 'Curiozee',
			description: 'Session Booking Payment Completion',
			order_id: checkoutRes.order_id,
			handler: function (response) {
				toast.success('Payment completed!')
				loadDashboardData()
			},
			theme: {
				color: '#4F46E5',
			},
			modal: {
				ondismiss: function () {
					toast.info('Payment window closed.')
				}
			}
		}

		const rzp = new window.Razorpay(options)
		rzp.open()
	} catch (e) {
		console.error('Checkout retry error:', e)
		toast.error(e.message || 'Payment initiation failed')
	} finally {
		checkoutLoading.value = false
	}
}

const loadRazorpayScript = () => {
	return new Promise((resolve) => {
		if (window.Razorpay) {
			resolve(true)
			return
		}
		const script = document.createElement('script')
		script.src = 'https://checkout.razorpay.com/v1/checkout.js'
		script.onload = () => resolve(true)
		script.onerror = () => resolve(false)
		document.body.appendChild(script)
	})
}

const viewSummary = (booking) => {
	activeSummaryBooking.value = booking
}

// Formatting helpers
const formatDate = (dateStr) => {
	return dayjs(dateStr).format('ddd, MMM DD, YYYY')
}

const formatDateFull = (dateStr) => {
	return dayjs(dateStr).format('dddd, MMMM DD, YYYY')
}
</script>

<style scoped>
.text-xxs {
	font-size: 0.65rem;
}
</style>
