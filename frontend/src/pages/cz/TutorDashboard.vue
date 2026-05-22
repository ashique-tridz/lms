<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs
				class="h-7"
				:items="[{ label: __('Tutor Dashboard'), route: { name: 'TutorDashboard' } }]"
			/>
		</header>

		<div class="max-w-6xl mx-auto p-5 sm:p-8 space-y-6">
			<div v-if="loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-gray-400" />
			</div>

			<div v-else-if="!tutorName" class="text-center py-20 bg-surface-cards border border-outline-gray-2 rounded-lg">
				<p class="text-ink-gray-5">{{ __('No Tutor Profile linked to your user account.') }}</p>
				<router-link :to="{ name: 'TutorProfile' }" class="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-semibold">
					{{ __('Create Tutor Profile') }}
				</router-link>
			</div>

			<div v-else class="space-y-6">
				<!-- Stat Cards -->
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
					<div class="bg-surface-cards p-5 rounded-lg border border-outline-gray-2 shadow-sm space-y-2">
						<span class="text-xs font-semibold text-ink-gray-5 uppercase tracking-wider">{{ __('Total Booked Sessions') }}</span>
						<p class="text-3xl font-extrabold text-ink-gray-9">{{ bookings.length }}</p>
					</div>
					<div class="bg-surface-cards p-5 rounded-lg border border-outline-gray-2 shadow-sm space-y-2">
						<span class="text-xs font-semibold text-ink-gray-5 uppercase tracking-wider">{{ __('Available Slots') }}</span>
						<p class="text-3xl font-extrabold text-ink-gray-9">{{ availableSlotsCount }}</p>
					</div>
					<div class="bg-surface-cards p-5 rounded-lg border border-outline-gray-2 shadow-sm space-y-2">
						<span class="text-xs font-semibold text-ink-gray-5 uppercase tracking-wider">{{ __('Total Earnings') }}</span>
						<p class="text-3xl font-extrabold text-ink-gray-9">{{ totalEarnings }} INR</p>
					</div>
				</div>

				<!-- Recent Sessions -->
				<div class="space-y-4">
					<h3 class="text-lg font-bold text-ink-gray-9">{{ __('Recent Booked Sessions') }}</h3>
					<div v-if="bookings.length" class="bg-surface-cards border border-outline-gray-2 rounded-lg shadow-sm overflow-hidden">
						<table class="w-full text-left border-collapse text-sm text-ink-gray-8">
							<thead>
								<tr class="bg-surface-gray-1 border-b border-outline-gray-2 text-ink-gray-5 font-semibold">
									<th class="p-4">{{ __('Student') }}</th>
									<th class="p-4">{{ __('Subject') }}</th>
									<th class="p-4">{{ __('Date/Time') }}</th>
									<th class="p-4">{{ __('Status') }}</th>
									<th class="p-4">{{ __('Meeting') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr v-for="b in bookings" :key="b.name" class="border-b border-outline-gray-1 hover:bg-surface-gray-1/50 transition-colors">
									<td class="p-4 font-semibold">{{ b.student }}</td>
									<td class="p-4">{{ b.subject || __('N/A') }}</td>
									<td class="p-4">{{ formatTime(b.locked_at || b.confirmed_at) }}</td>
									<td class="p-4">
										<Badge :theme="b.booking_status === 'Confirmed' ? 'green' : 'blue'" size="sm">
											{{ b.booking_status }}
										</Badge>
									</td>
									<td class="p-4">
										<a
											v-if="b.meeting_link"
											:href="b.meeting_link"
											target="_blank"
											class="text-blue-600 hover:underline font-semibold"
										>
											{{ __('Join') }}
										</a>
										<span v-else class="text-ink-gray-4 italic">{{ __('No link') }}</span>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div v-else class="text-center py-12 bg-surface-cards border border-outline-gray-2 rounded-lg text-ink-gray-5">
						{{ __('No sessions booked yet.') }}
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { Breadcrumbs, LoadingIndicator, Badge, call } from 'frappe-ui'

const user = inject('$user')
const dayjs = inject('$dayjs')

const loading = ref(true)
const tutorName = ref('')
const bookings = ref([])
const availableSlotsCount = ref(0)

onMounted(async () => {
	try {
		if (user.data?.name) {
			const tutorRes = await call('frappe.client.get_value', {
				doctype: 'Tutor Profile',
				filters: { user: user.data.name },
				fieldname: 'name',
			})
			if (tutorRes && tutorRes.message) {
				tutorName.value = tutorRes.message.name
				
				// Fetch bookings
				const bkRes = await call('frappe.client.get_list', {
					doctype: 'Session Booking',
					filters: { tutor: tutorName.value },
					fields: ['name', 'student', 'subject', 'locked_at', 'confirmed_at', 'booking_status', 'meeting_link', 'amount'],
					limit: 10,
				})
				bookings.value = bkRes || []

				// Fetch slots count
				const slotsRes = await call('frappe.client.get_list', {
					doctype: 'Tutor Availability Slot',
					filters: { tutor: tutorName.value, status: 'Available' },
					fields: ['name'],
				})
				availableSlotsCount.value = slotsRes ? slotsRes.length : 0
			}
		}
	} catch (e) {
		console.error("Dashboard data load failed:", e)
	} finally {
		loading.value = false
	}
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
