<template>
	<div>
		<LayoutHeader>
			<template #left-header>
				<Breadcrumbs class="h-7" :items="breadcrumbs" />
			</template>
		</LayoutHeader>

		<div class="mx-auto flex min-h-0 w-full flex-1 flex-col p-5 max-w-6xl">
			<!-- Loading State -->
			<div v-if="dashboardStore.dashboardData.loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-gray-400" />
			</div>

			<!-- Empty State: No Profile -->
			<div v-else-if="!profile" class="text-center py-20 border rounded-md space-y-4 bg-surface-white">
				<div class="flex flex-col items-center justify-center space-y-2">
					<div class="p-3 bg-surface-gray-2 rounded-full">
						<Video class="w-8 h-8 text-ink-gray-5 stroke-1.5" />
					</div>
					<h3 class="text-lg font-medium text-ink-gray-9">{{ __('No Tutor Profile linked to your account') }}</h3>
					<p class="text-sm text-ink-gray-7 max-w-sm">
						{{ __('Please create your tutor profile first to view booked sessions.') }}
					</p>
				</div>
				<router-link
					:to="{ name: 'TutorProfile' }"
					class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
				>
					{{ __('Create Tutor Profile') }}
				</router-link>
			</div>

			<!-- Sessions Content -->
			<div v-else class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-xl font-semibold text-ink-gray-9">{{ __('My Tutoring Sessions') }}</h2>
					<p class="text-sm text-ink-gray-5 mt-1">{{ __('Manage your tutoring sessions and launch classes.') }}</p>
				</div>

				<!-- Section Tabs -->
				<div class="mb-4">
					<TabButtons
						class="inline-block"
						:buttons="tabButtons"
						v-model="activeTab"
					/>
				</div>

				<!-- Sessions List -->
				<div v-if="filteredSessions.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div
						v-for="b in filteredSessions"
						:key="b.name"
						class="border rounded-md p-4 bg-surface-white hover:border-outline-gray-3 transition-colors flex flex-col justify-between"
					>
						<div class="space-y-3">
							<!-- Header: Student Name & Badges -->
							<div class="flex justify-between items-start pb-3 border-b">
								<div>
									<h4 class="font-bold text-ink-gray-9 text-base">{{ b.student }}</h4>
									<p class="text-xs text-ink-gray-5 mt-1">
										<span class="font-semibold text-ink-gray-4 uppercase tracking-wider text-[10px] mr-1">{{ __('Scheduled') }}:</span>
										{{ formatTime(b.locked_at || b.confirmed_at) }}
									</p>
								</div>
								<div class="flex flex-col items-end gap-1.5">
									<Badge :label="b.booking_status" :theme="getBookingStatusTheme(b.booking_status)" size="sm" />
								</div>
							</div>

							<!-- Subject/Board/Class Details -->
							<div class="grid grid-cols-3 gap-2 text-xs pt-1 text-ink-gray-7">
								<div>
									<span class="text-ink-gray-4 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Subject') }}</span>
									<span class="font-semibold text-ink-gray-8">{{ b.subject || '—' }}</span>
								</div>
								<div>
									<span class="text-ink-gray-4 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Board') }}</span>
									<span class="font-semibold text-ink-gray-8">{{ b.board || '—' }}</span>
								</div>
								<div>
									<span class="text-ink-gray-4 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Class') }}</span>
									<span class="font-semibold text-ink-gray-8">{{ b.class || '—' }}</span>
								</div>
							</div>
						</div>

						<!-- Action Buttons (Launch meeting) -->
						<div class="flex justify-end items-center pt-3 border-t mt-4">
							<div>
								<a
									v-if="b.booking_status === 'Confirmed' && b.meeting_link"
									:href="b.meeting_link"
									target="_blank"
									class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150"
								>
									<Video class="w-3.5 h-3.5" />
									{{ __('Launch Class') }}
								</a>
								<span v-else-if="b.booking_status === 'Confirmed'" class="text-xs text-ink-gray-4 italic">
									{{ __('Meeting generating...') }}
								</span>
								<span v-else-if="b.booking_status === 'Completed'" class="text-xs text-green-600 font-medium italic">
									{{ __('Class concluded') }}
								</span>
								<span v-else class="text-xs text-ink-gray-4 italic">—</span>
							</div>
						</div>
					</div>
				</div>

				<div v-else class="text-center py-20 text-ink-gray-5 border rounded-md bg-surface-white">
					{{ __('No sessions found matching this status filter.') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Breadcrumbs, LoadingIndicator, Badge, TabButtons } from 'frappe-ui'
import { useTutorDashboardStore } from '@/stores/useTutorDashboardStore'
import LayoutHeader from '@/components/Layouts/LayoutHeader.vue'
import { Video } from 'lucide-vue-next'
import { convertToLocal, isSessionUpcoming } from '@/utils/timezone'

const dashboardStore = useTutorDashboardStore()

const activeTab = ref('upcoming')

onMounted(async () => {
	await dashboardStore.dashboardData.submit()
})

const profile = computed(() => dashboardStore.dashboardData.data?.profile)
const sessions = computed(() => dashboardStore.dashboardData.data?.sessions || [])

const breadcrumbs = computed(() => [
	{ label: __('My Sessions'), route: { name: 'TutorSessions' } }
])

const tabButtons = computed(() => {
	const upcoming = sessions.value.filter(s =>
		(s.booking_status === 'Confirmed' || s.booking_status === 'Payment Success') &&
		isSessionUpcoming(s.start_datetime)
	).length
	const completed = sessions.value.filter(s =>
		s.booking_status === 'Completed' ||
		((s.booking_status === 'Confirmed' || s.booking_status === 'Payment Success') &&
		!isSessionUpcoming(s.start_datetime))
	).length
	const cancelled = sessions.value.filter(s => s.booking_status === 'Cancelled').length
	const expired = sessions.value.filter(s => s.booking_status === 'Expired' || s.booking_status === 'Failed' || s.booking_status === 'Pending Payment').length

	return [
		{ value: 'upcoming', label: `${__('Upcoming')} (${upcoming})` },
		{ value: 'completed', label: `${__('Completed')} (${completed})` },
		{ value: 'cancelled', label: `${__('Cancelled')} (${cancelled})` },
		{ value: 'expired', label: `${__('Expired')} (${expired})` },
	]
})

const filteredSessions = computed(() => {
	if (activeTab.value === 'upcoming') {
		return sessions.value.filter(s =>
			(s.booking_status === 'Confirmed' || s.booking_status === 'Payment Success') &&
			isSessionUpcoming(s.start_datetime)
		)
	} else if (activeTab.value === 'completed') {
		return sessions.value.filter(s =>
			s.booking_status === 'Completed' ||
			((s.booking_status === 'Confirmed' || s.booking_status === 'Payment Success') &&
			!isSessionUpcoming(s.start_datetime))
		)
	} else if (activeTab.value === 'cancelled') {
		return sessions.value.filter(s => s.booking_status === 'Cancelled')
	} else {
		return sessions.value.filter(s => s.booking_status === 'Expired' || s.booking_status === 'Failed' || s.booking_status === 'Pending Payment')
	}
})

function formatTime(utcTime) {
	const localObj = convertToLocal(utcTime)
	return localObj ? localObj.format('DD MMM YYYY, hh:mm A') : 'N/A'
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
</script>
