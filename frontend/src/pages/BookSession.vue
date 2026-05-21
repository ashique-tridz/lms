<template>
	<div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
		<!-- Hero Section -->
		<div class="max-w-7xl mx-auto mb-10">
			<div class="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-12 md:flex md:items-center md:justify-between">
				<div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)] pointer-events-none"></div>
				<div class="relative z-10 max-w-2xl">
					<h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
						Find & Book Your Perfect Tutor
					</h1>
					<p class="text-blue-100 text-lg leading-relaxed">
						Elevate your learning experience with personalized, one-on-one live interactive sessions tailored specifically to your curriculum.
					</p>
				</div>
				<div class="mt-8 md:mt-0 relative z-10">
					<div class="inline-flex rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/20 shadow-lg text-white">
						<div class="flex items-center space-x-3">
							<div class="p-3 bg-white/20 rounded-xl">
								<svg class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
							</div>
							<div>
								<p class="text-sm text-blue-200">Next Slot Available</p>
								<p class="text-lg font-bold">Book Today</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Filters Panel -->
		<div class="max-w-7xl mx-auto mb-8">
			<div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
				<h2 class="text-lg font-bold text-slate-800 mb-4 flex items-center">
					<svg class="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
					</svg>
					Filter Available Slots
				</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<!-- Subject Select -->
					<div class="flex flex-col space-y-1.5">
						<label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</label>
						<select v-model="filters.subject" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-colors duration-200">
							<option value="">All Subjects</option>
							<option v-for="subj in subjects" :key="subj.name" :value="subj.name">
								{{ subj.name }}
							</option>
						</select>
					</div>

					<!-- Board Select -->
					<div class="flex flex-col space-y-1.5">
						<label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Board</label>
						<select v-model="filters.board" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-colors duration-200">
							<option value="">All Boards</option>
							<option v-for="brd in boards" :key="brd.name" :value="brd.name">
								{{ brd.name }}
							</option>
						</select>
					</div>

					<!-- Class Select -->
					<div class="flex flex-col space-y-1.5">
						<label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</label>
						<select v-model="filters.class_name" class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-colors duration-200">
							<option value="">All Classes</option>
							<option v-for="cls in classes" :key="cls.name" :value="cls.name">
								{{ cls.name }}
							</option>
						</select>
					</div>

					<!-- Search Action Button -->
					<div class="flex items-end">
						<button @click="fetchAvailableSlots" :disabled="loading" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2">
							<span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
							<span v-else>Search Tutors</span>
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Tutors & Slots Content -->
		<div class="max-w-7xl mx-auto">
			<div v-if="loading" class="flex flex-col items-center justify-center py-24">
				<div class="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
				<p class="mt-4 text-slate-600 font-medium">Loading tutor schedules...</p>
			</div>

			<div v-else-if="tutorSlots.length === 0" class="bg-white rounded-2xl shadow-sm border border-slate-100 py-16 px-4 text-center">
				<div class="mx-auto h-20 w-20 text-slate-300 mb-4 flex items-center justify-center bg-slate-50 rounded-full">
					<svg class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
					</svg>
				</div>
				<h3 class="text-lg font-bold text-slate-800 mb-1">No Available Slots Found</h3>
				<p class="text-slate-500 max-w-md mx-auto">
					No slots match your current criteria. Try widening your subject, board, or class filters.
				</p>
			</div>

			<!-- Slot List Grid -->
			<div v-else class="space-y-6">
				<div v-for="tutor in tutorSlots" :key="tutor.tutor_profile" class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
					<div class="p-6 md:p-8 flex flex-col md:flex-row md:items-start md:space-x-8">
						<!-- Tutor Profile Box -->
						<div class="md:w-1/4 mb-6 md:mb-0 flex flex-col items-center text-center md:items-start md:text-left">
							<div class="h-20 w-20 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-extrabold text-3xl mb-4 shadow-inner">
								{{ getInitials(tutor.tutor_name) }}
							</div>
							<h3 class="text-xl font-bold text-slate-800 mb-1">{{ tutor.tutor_name }}</h3>
							<p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Verified Tutor</p>
							
							<div class="flex flex-wrap gap-1 justify-center md:justify-start mb-3">
								<span v-for="subj in tutor.subjects" :key="subj" class="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
									{{ subj }}
								</span>
							</div>

							<div class="text-sm text-slate-600 space-y-1 w-full bg-slate-50 p-3.5 rounded-xl border border-slate-100">
								<div class="flex justify-between">
									<span class="text-slate-400">Experience:</span>
									<span class="font-semibold text-slate-800">{{ tutor.experience || 0 }} Yrs</span>
								</div>
								<div class="flex justify-between">
									<span class="text-slate-400">Rate/Hr:</span>
									<span class="font-bold text-emerald-600">₹{{ tutor.hourly_rate || 500 }}</span>
								</div>
							</div>
						</div>

						<!-- Available Slots Grid -->
						<div class="flex-1">
							<h4 class="text-md font-bold text-slate-700 mb-4 flex items-center">
								<svg class="h-4 w-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Available Slots
							</h4>
							<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
								<button v-for="slot in tutor.slots" :key="slot.name" @click="selectSlot(tutor, slot)" class="group border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-xl p-3.5 text-center focus:outline-none transition-all duration-200 relative flex flex-col items-center">
									<p class="text-xs font-bold text-slate-400 uppercase tracking-wider group-hover:text-indigo-600">
										{{ formatDate(slot.start_datetime) }}
									</p>
									<p class="text-sm font-extrabold text-slate-800 mt-1 group-hover:text-indigo-900">
										{{ formatTime(slot.start_datetime) }}
									</p>
									<span class="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xxs font-semibold bg-emerald-50 text-emerald-700 uppercase tracking-wide">
										Available
									</span>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Booking Confirmation Drawer / Dialog -->
		<div v-if="selectedSlot" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
			<div class="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all border border-slate-100">
				<!-- Header -->
				<div class="bg-indigo-600 px-6 py-5 text-white flex justify-between items-center">
					<h3 class="text-lg font-bold">Review Booking</h3>
					<button @click="selectedSlot = null" class="text-white/80 hover:text-white focus:outline-none">
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<!-- Details Body -->
				<div class="p-6 space-y-6">
					<div class="flex items-center space-x-4">
						<div class="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-lg">
							{{ getInitials(selectedTutor.tutor_name) }}
						</div>
						<div>
							<h4 class="font-bold text-slate-800 text-md">{{ selectedTutor.tutor_name }}</h4>
							<p class="text-xs text-slate-500">One-on-One Session</p>
						</div>
					</div>

					<div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3.5 text-sm text-slate-700">
						<div class="flex justify-between items-center">
							<span class="text-slate-400">Date</span>
							<span class="font-semibold text-slate-800">{{ formatDateFull(selectedSlot.start_datetime) }}</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-slate-400">Time</span>
							<span class="font-semibold text-slate-800">
								{{ formatTime(selectedSlot.start_datetime) }} - {{ formatTime(selectedSlot.end_datetime) }}
							</span>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-slate-400">Subject</span>
							<span class="font-semibold text-slate-800">{{ filters.subject || 'General Mentoring' }}</span>
						</div>
						<div class="border-t border-slate-200 my-2 pt-3 flex justify-between items-center">
							<span class="font-bold text-slate-700">Total Price</span>
							<span class="font-extrabold text-lg text-emerald-600">₹{{ selectedTutor.hourly_rate }}</span>
						</div>
					</div>

					<!-- Error Message -->
					<div v-if="bookingError" class="bg-rose-50 text-rose-800 p-4 rounded-xl text-xs font-semibold border border-rose-100 leading-normal flex items-start space-x-2">
						<svg class="h-4 w-4 shrink-0 text-rose-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
						</svg>
						<span>{{ bookingError }}</span>
					</div>

					<!-- Confirm Action -->
					<button @click="proceedToCheckout" :disabled="checkoutLoading" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg hover:shadow-xl focus:outline-none disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2">
						<span v-if="checkoutLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
						<span v-else>Confirm & Pay</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { call, toast } from 'frappe-ui'
import { usersStore } from '@/stores/user'
import dayjs from 'dayjs'

const { userResource } = usersStore()

const loading = ref(false)
const checkoutLoading = ref(false)
const subjects = ref([])
const boards = ref([])
const classes = ref([])

const filters = ref({
	subject: '',
	board: '',
	class_name: '',
})

const tutorSlots = ref([])

const selectedTutor = ref(null)
const selectedSlot = ref(null)
const bookingError = ref('')

onMounted(async () => {
	await loadDropdownFilters()
	await fetchAvailableSlots()
})

const loadDropdownFilters = async () => {
	try {
		const [subjList, brdList, clsList] = await Promise.all([
			call('frappe.client.get_list', { doctype: 'Subject', fields: ['name'] }),
			call('frappe.client.get_list', { doctype: 'Board', fields: ['name'] }),
			call('frappe.client.get_list', { doctype: 'Class', fields: ['name'] }),
		])
		subjects.value = subjList
		boards.value = brdList
		classes.value = clsList
	} catch (e) {
		console.error('Failed to load filters:', e)
	}
}

const fetchAvailableSlots = async () => {
	loading.value = true
	try {
		const res = await call('smart_learning.api.search_slots.search_slots', {
			subject: filters.value.subject || undefined,
			board: filters.value.board || undefined,
			class_name: filters.value.class_name || undefined,
		})
		
		if (res && res.success) {
			tutorSlots.value = res.data || []
		} else {
			tutorSlots.value = []
			toast.error(res?.error || 'Failed to search available slots')
		}
	} catch (e) {
		console.error('Error fetching slots:', e)
		tutorSlots.value = []
		toast.error('Unable to connect to booking server')
	} finally {
		loading.value = false
	}
}

const selectSlot = (tutor, slot) => {
	selectedTutor.value = tutor
	selectedSlot.value = slot
	bookingError.value = ''
}

const proceedToCheckout = async () => {
	checkoutLoading.value = true
	bookingError.value = ''
	
	try {
		// 1. Load Razorpay script
		const rzpScriptLoaded = await loadRazorpayScript()
		if (!rzpScriptLoaded) {
			bookingError.value = 'Failed to load payment checkout widget. Please check your network connection.'
			checkoutLoading.value = false
			return
		}

		// 2. Initiate booking backend api call
		const bookingRes = await call('smart_learning.api.booking_api.initiate_booking', {
			slot: selectedSlot.value.name,
			tutor: selectedTutor.value.tutor_profile,
			amount: selectedTutor.value.hourly_rate || 500,
			currency: 'INR',
			subject: filters.value.subject || undefined,
			board: filters.value.board || undefined,
			class_name: filters.value.class_name || undefined,
		})

		if (!bookingRes || !bookingRes.order_id) {
			bookingError.value = 'Booking locking or checkout initiation failed. The slot may have been locked by another user.'
			checkoutLoading.value = false
			return
		}

		// 3. Open Razorpay checkout widget
		const userEmail = userResource.data?.email || 'student@example.com'
		const options = {
			key: bookingRes.key_id,
			amount: bookingRes.amount,
			currency: bookingRes.currency,
			name: 'Curiozee',
			description: 'Session Booking Payment',
			order_id: bookingRes.order_id,
			handler: function (response) {
				toast.success('Payment authorized. Completing booking...')
				window.location.href = `/lms/bookings?payment=success&booking=${bookingRes.booking_name}`
			},
			prefill: {
				email: userEmail,
			},
			theme: {
				color: '#4F46E5', // Indigo color
			},
			modal: {
				ondismiss: function () {
					// User cancelled payment
					call('smart_learning.api.booking_api.report_payment_failure', {
						razorpay_order_id: bookingRes.order_id,
						error_code: 'CANCELLED',
						error_description: 'User dismissed the payment checkout widget'
					})
					toast.info('Payment window closed. Booking remains in pending payment state.')
					window.location.href = '/lms/bookings'
				}
			}
		}
		
		const rzp = new window.Razorpay(options)
		rzp.open()
		selectedSlot.value = null
	} catch (e) {
		console.error('Booking checkout error:', e)
		bookingError.value = e.message || 'Slot locking failed. The slot is temporarily locked or already booked.'
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

// Formatting helpers
const getInitials = (name) => {
	if (!name) return 'TR'
	return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const formatDate = (dateStr) => {
	return dayjs(dateStr).format('ddd, MMM DD')
}

const formatDateFull = (dateStr) => {
	return dayjs(dateStr).format('dddd, MMMM DD, YYYY')
}

const formatTime = (dateStr) => {
	return dayjs(dateStr).format('hh:mm A')
}
</script>

<style scoped>
.text-xxs {
	font-size: 0.65rem;
}
</style>
