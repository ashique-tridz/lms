<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs class="h-7" :items="[{ label: __('My Sessions'), route: { name: 'TutorSessions' } }]" />
		</header>

		<div class="max-w-6xl mx-auto p-5 sm:p-8 space-y-6">
			<!-- Loading State -->
			<div v-if="dashboardStore.dashboardData.loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-gray-400" />
			</div>

			<!-- Empty State: No Profile -->
			<div v-else-if="!profile" class="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
				<div class="flex flex-col items-center justify-center space-y-2">
					<div class="p-3 bg-gray-50 rounded-full">
						<Video class="w-8 h-8 text-gray-400 stroke-1.5" />
					</div>
					<h3 class="text-lg font-medium text-gray-900">{{ __('No Tutor Profile linked to your account') }}</h3>
					<p class="text-sm text-gray-500 max-w-sm">
						{{ __('Please create your tutor profile first to view booked sessions.') }}
					</p>
				</div>
				<router-link
					:to="{ name: 'TutorProfile' }"
					class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
				>
					{{ __('Create Tutor Profile') }}
				</router-link>
			</div>

			<!-- Sessions Content -->
			<div v-else class="space-y-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">{{ __('My Tutoring Sessions') }}</h2>
					<p class="text-sm text-gray-500 mt-1">{{ __('Manage bookings, access video classes, and view financial invoice documents.') }}</p>
				</div>

				<!-- Section Tabs -->
				<div class="flex border-b border-gray-200 gap-6">
					<button
						v-for="tab in tabs"
						:key="tab.id"
						@click="activeTab = tab.id"
						class="pb-3 text-sm font-semibold relative transition-colors focus:outline-none"
						:class="activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'"
					>
						{{ tab.name }} ({{ tab.count }})
						<div
							v-if="activeTab === tab.id"
							class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
						></div>
					</button>
				</div>

				<!-- Sessions List -->
				<div v-if="filteredSessions.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div
						v-for="b in filteredSessions"
						:key="b.name"
						class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
					>
						<div class="space-y-3">
							<!-- Header: Student Name & Badges -->
							<div class="flex justify-between items-start pb-3 border-b border-gray-100">
								<div>
									<h4 class="font-bold text-gray-900 text-base">{{ b.student }}</h4>
									<p class="text-xs text-gray-500 mt-1">
										<span class="font-semibold text-gray-400 uppercase tracking-wider text-[10px] mr-1">{{ __('Scheduled') }}:</span>
										{{ formatTime(b.locked_at || b.confirmed_at) }}
									</p>
								</div>
								<div class="flex flex-col items-end gap-1.5">
									<Badge :label="b.booking_status" :theme="getBookingStatusTheme(b.booking_status)" size="sm" />
									<Badge :label="b.payment_status" :theme="getPaymentStatusTheme(b.payment_status)" size="xs" />
								</div>
							</div>

							<!-- Subject/Board/Class Details -->
							<div class="grid grid-cols-3 gap-2 text-xs pt-1">
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Subject') }}</span>
									<span class="font-semibold text-gray-800">{{ b.subject || '—' }}</span>
								</div>
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Board') }}</span>
									<span class="font-semibold text-gray-800">{{ b.board || '—' }}</span>
								</div>
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Class') }}</span>
									<span class="font-semibold text-gray-800">{{ b.class || '—' }}</span>
								</div>
							</div>

							<!-- Price and ERP document details -->
							<div class="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
								<div class="flex justify-between" v-if="b.amount">
									<span class="text-gray-400 font-medium">{{ __('Session Amount') }}:</span>
									<span class="font-bold text-gray-900">{{ b.amount }} INR</span>
								</div>
								<div class="flex justify-between" v-if="b.sales_invoice">
									<span class="text-gray-400 font-medium">{{ __('Sales Invoice') }}:</span>
									<a
										:href="`/app/sales-invoice/${b.sales_invoice}`"
										target="_blank"
										class="text-blue-600 hover:text-blue-700 hover:underline font-semibold flex items-center gap-1"
									>
										{{ b.sales_invoice }}
										<ExternalLink class="w-3 h-3" />
									</a>
								</div>
								<div class="flex justify-between" v-if="b.payment_entry">
									<span class="text-gray-400 font-medium">{{ __('Payment Entry') }}:</span>
									<a
										:href="`/app/payment-entry/${b.payment_entry}`"
										target="_blank"
										class="text-blue-600 hover:text-blue-700 hover:underline font-semibold flex items-center gap-1"
									>
										{{ b.payment_entry }}
										<ExternalLink class="w-3 h-3" />
									</a>
								</div>
							</div>
						</div>

						<!-- Action Buttons (Launch meeting / AI audit) -->
						<div class="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
							<div class="flex gap-2">
								<Button
									v-if="b.ai_summary"
									@click="viewSummary(b)"
									variant="outline"
									class="text-xs font-semibold"
								>
									{{ __('AI Meeting Audit') }}
								</Button>
							</div>

							<div>
								<a
									v-if="b.booking_status === 'Confirmed' && b.meeting_link"
									:href="b.meeting_link"
									target="_blank"
									class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150 shadow-sm"
								>
									<Video class="w-3.5 h-3.5" />
									{{ __('Launch Class') }}
								</a>
								<span v-else-if="b.booking_status === 'Confirmed'" class="text-xs text-gray-400 italic">
									{{ __('Meeting generating...') }}
								</span>
								<span v-else-if="b.booking_status === 'Completed'" class="text-xs text-green-600 font-medium italic">
									{{ __('Class concluded') }}
								</span>
								<span v-else class="text-xs text-gray-400 italic">—</span>
							</div>
						</div>
					</div>
				</div>

				<div v-else class="text-center py-20 text-gray-500 bg-white border border-gray-200 rounded-xl shadow-sm">
					{{ __('No sessions found matching this status filter.') }}
				</div>
			</div>
		</div>

		<!-- AI Audit Dialog -->
		<Dialog
			v-model="showAuditModal"
			:options="{
				title: `${__('AI Session Summary')} — ${selectedBooking?.student}`,
				size: 'lg',
			}"
		>
			<template #body-content>
				<div class="space-y-4 p-4">
					<div>
						<p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{{ __('AI Summary') }}</p>
						<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
							{{ selectedBooking?.ai_summary }}
						</div>
					</div>
					<div v-if="selectedBooking?.ai_transcript">
						<p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{{ __('AI Transcript') }}</p>
						<div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
							{{ selectedBooking?.ai_transcript }}
						</div>
					</div>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { Breadcrumbs, LoadingIndicator, Dialog, Button, Badge } from 'frappe-ui'
import { useTutorDashboardStore } from '@/stores/useTutorDashboardStore'
import { Video, ExternalLink } from 'lucide-vue-next'

const dashboardStore = useTutorDashboardStore()
const dayjs = inject('$dayjs')

const activeTab = ref('upcoming')
const showAuditModal = ref(false)
const selectedBooking = ref(null)

onMounted(async () => {
	await dashboardStore.dashboardData.submit()
})

const profile = computed(() => dashboardStore.dashboardData.data?.profile)
const sessions = computed(() => dashboardStore.dashboardData.data?.sessions || [])

const tabs = computed(() => {
	const upcoming = sessions.value.filter(s => s.booking_status === 'Confirmed' || s.booking_status === 'Payment Success').length
	const completed = sessions.value.filter(s => s.booking_status === 'Completed').length
	const cancelled = sessions.value.filter(s => s.booking_status === 'Cancelled').length
	const expired = sessions.value.filter(s => s.booking_status === 'Expired' || s.booking_status === 'Failed' || s.booking_status === 'Pending Payment').length

	return [
		{ id: 'upcoming', name: __('Upcoming'), count: upcoming },
		{ id: 'completed', name: __('Completed'), count: completed },
		{ id: 'cancelled', name: __('Cancelled'), count: cancelled },
		{ id: 'expired', name: __('Expired'), count: expired },
	]
})

const filteredSessions = computed(() => {
	if (activeTab.value === 'upcoming') {
		return sessions.value.filter(s => s.booking_status === 'Confirmed' || s.booking_status === 'Payment Success')
	} else if (activeTab.value === 'completed') {
		return sessions.value.filter(s => s.booking_status === 'Completed')
	} else if (activeTab.value === 'cancelled') {
		return sessions.value.filter(s => s.booking_status === 'Cancelled')
	} else {
		return sessions.value.filter(s => s.booking_status === 'Expired' || s.booking_status === 'Failed' || s.booking_status === 'Pending Payment')
	}
})

function formatTime(utcTime) {
	if (!utcTime || !dayjs) return 'N/A'
	return dayjs.utc(utcTime).local().format('DD MMM YYYY, hh:mm A')
}

function getBookingStatusTheme(status) {
	switch (status) {
		case 'Confirmed':
		case 'Payment Success':
			return 'blue'
		case 'Completed':
			return 'green'
		case 'Cancelled':
			return 'red'
		default:
			return 'gray'
	}
}

function getPaymentStatusTheme(status) {
	switch (status) {
		case 'Captured':
			return 'green'
		case 'Refunded':
			return 'orange'
		case 'Failed':
			return 'red'
		default:
			return 'gray'
	}
}

function viewSummary(booking) {
	selectedBooking.value = booking
	showAuditModal.value = true
}
</script>
