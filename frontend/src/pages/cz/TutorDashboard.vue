<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs
				class="h-7"
				:items="[{ label: __('Tutor Dashboard'), route: { name: 'TutorDashboard' } }]"
			/>
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
						<HomeIcon class="w-8 h-8 text-gray-400 stroke-1.5" />
					</div>
					<h3 class="text-lg font-medium text-gray-900">{{ __('No Tutor Profile linked to your account') }}</h3>
					<p class="text-sm text-gray-500 max-w-sm">
						{{ __('Please create your tutor profile first to access the dashboard.') }}
					</p>
				</div>
				<router-link
					:to="{ name: 'TutorProfile' }"
					class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
				>
					{{ __('Create Tutor Profile') }}
				</router-link>
			</div>

			<!-- Dashboard Content -->
			<div v-else class="space-y-6">
				<!-- Stat Cards -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
					<div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
						<span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ __('Total Booked Sessions') }}</span>
						<p class="text-3xl font-extrabold text-gray-900">{{ bookings.length }}</p>
					</div>
					<div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
						<span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ __('Available Slots') }}</span>
						<p class="text-3xl font-extrabold text-gray-900">{{ availableSlotsCount }}</p>
					</div>
					<div class="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-2">
						<span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">{{ __('Total Earnings') }}</span>
						<p class="text-3xl font-extrabold text-gray-900">{{ totalEarnings }} INR</p>
					</div>
				</div>

				<!-- Recent Sessions -->
				<div class="space-y-4">
					<h3 class="text-lg font-bold text-gray-900">{{ __('Recent Booked Sessions') }}</h3>
					<div v-if="bookings.length" class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
						<div class="overflow-x-auto">
							<table class="w-full text-left border-collapse text-sm text-gray-800">
								<thead>
									<tr class="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
										<th class="p-4">{{ __('Student') }}</th>
										<th class="p-4">{{ __('Subject') }}</th>
										<th class="p-4">{{ __('Date/Time') }}</th>
										<th class="p-4">{{ __('Status') }}</th>
										<th class="p-4">{{ __('Meeting') }}</th>
									</tr>
								</thead>
								<tbody>
									<tr
										v-for="b in bookings.slice(0, 10)"
										:key="b.name"
										class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
									>
										<td class="p-4 font-semibold text-gray-900">{{ b.student }}</td>
										<td class="p-4 text-gray-600">{{ b.subject || __('N/A') }}</td>
										<td class="p-4 text-gray-600">{{ formatTime(b.locked_at || b.confirmed_at) }}</td>
										<td class="p-4">
											<Badge
												:label="b.booking_status"
												:theme="b.booking_status === 'Confirmed' ? 'blue' : b.booking_status === 'Completed' ? 'green' : 'gray'"
												size="sm"
											/>
										</td>
										<td class="p-4">
											<a
												v-if="b.meeting_link"
												:href="b.meeting_link"
												target="_blank"
												class="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
											>
												{{ __('Join') }}
											</a>
											<span v-else class="text-gray-400 italic">{{ __('No link') }}</span>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<div v-else class="text-center py-12 bg-white border border-gray-200 rounded-xl text-gray-500">
						{{ __('No sessions booked yet.') }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, inject, onMounted } from 'vue'
import { Breadcrumbs, LoadingIndicator, Badge } from 'frappe-ui'
import { useTutorDashboardStore } from '@/stores/useTutorDashboardStore'
import { Home as HomeIcon } from 'lucide-vue-next'

const dashboardStore = useTutorDashboardStore()
const dayjs = inject('$dayjs')

onMounted(async () => {
	await dashboardStore.dashboardData.submit()
})

const profile = computed(() => dashboardStore.dashboardData.data?.profile)
const bookings = computed(() => dashboardStore.dashboardData.data?.sessions || [])
const slots = computed(() => dashboardStore.dashboardData.data?.slots || [])

const availableSlotsCount = computed(() => {
	return slots.value.filter(s => s.status === 'Available').length
})

const totalEarnings = computed(() => {
	return bookings.value
		.filter(b => b.booking_status === 'Confirmed' || b.booking_status === 'Completed')
		.reduce((sum, b) => sum + parseFloat(b.amount || 0), 0)
})

function formatTime(utcTime) {
	if (!utcTime || !dayjs) return 'N/A'
	return dayjs.utc(utcTime).local().format('DD MMM YYYY, hh:mm A')
}
</script>
