<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs
				class="h-7"
				:items="[{ label: __('My Slots'), route: { name: 'SlotCalendar' } }]"
			/>
			<Button
				:loading="regenerating"
				v-if="profile"
				@click="triggerRegenerate"
				variant="outline"
				class="text-xs font-semibold"
			>
				{{ __('Regenerate Slots') }}
			</Button>
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
						<CalendarIcon class="w-8 h-8 text-gray-400 stroke-1.5" />
					</div>
					<h3 class="text-lg font-medium text-gray-900">{{ __('No Tutor Profile linked to your account') }}</h3>
					<p class="text-sm text-gray-500 max-w-sm">
						{{ __('Please create your tutor profile first to manage generated bookable slots.') }}
					</p>
				</div>
				<router-link
					:to="{ name: 'TutorProfile' }"
					class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
				>
					{{ __('Create Tutor Profile') }}
				</router-link>
			</div>

			<!-- Slots Page Content -->
			<div v-else class="space-y-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">{{ __('Generated Availability Slots') }}</h2>
					<p class="text-sm text-gray-500 mt-1">{{ __('Manage your available slots and view linked booking states.') }}</p>
				</div>

				<!-- Tabs Navigation -->
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

				<!-- Slots Grouped by Date -->
				<div v-if="sortedDates.length" class="space-y-6">
					<div
						v-for="date in sortedDates"
						:key="date"
						class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
					>
						<h3 class="font-bold text-sm text-gray-900 border-b border-gray-100 pb-2">
							{{ formatDateFriendly(date) }}
						</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div
								v-for="slot in groupedSlots[date]"
								:key="slot.name"
								class="border border-gray-200 rounded-xl p-4 flex flex-col justify-between bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300 transition-all space-y-3"
							>
								<div class="space-y-2">
									<!-- Time Range & Badge -->
									<div class="flex justify-between items-start">
										<span class="text-sm font-bold text-gray-900">
											{{ formatTime(slot.start_datetime) }} - {{ formatTime(slot.end_datetime) }}
										</span>
										<Badge :theme="getStatusTheme(slot.status)" size="sm">
											{{ slot.status }}
										</Badge>
									</div>

									<!-- Linked Booking info if Booked or Locked -->
									<div
										v-if="getBookingForSlot(slot.name)"
										class="border-t border-gray-100 pt-2.5 mt-2.5 space-y-1.5 text-xs text-gray-600"
									>
										<div class="flex justify-between">
											<span class="text-gray-400 font-medium">{{ __('Student') }}:</span>
											<span class="font-semibold text-gray-800">{{ getBookingForSlot(slot.name).student }}</span>
										</div>
										<div class="flex justify-between">
											<span class="text-gray-400 font-medium">{{ __('Subject') }}:</span>
											<span class="font-semibold text-gray-800">{{ getBookingForSlot(slot.name).subject || '—' }}</span>
										</div>
										<div class="flex justify-between">
											<span class="text-gray-400 font-medium">{{ __('Class') }}:</span>
											<span class="font-semibold text-gray-800">
												{{ getBookingForSlot(slot.name).class || '—' }} ({{ getBookingForSlot(slot.name).board || '—' }})
											</span>
										</div>
										<div class="flex justify-between" v-if="getBookingForSlot(slot.name).amount">
											<span class="text-gray-400 font-medium">{{ __('Price') }}:</span>
											<span class="font-semibold text-gray-800">{{ getBookingForSlot(slot.name).amount }} INR</span>
										</div>
									</div>
								</div>

								<!-- Action Button -->
								<div class="flex justify-end pt-2 border-t border-gray-100/50">
									<Button
										v-if="slot.status === 'Available'"
										@click="deleteSlot(slot.name)"
										variant="outline"
										class="text-xs font-semibold text-red-600 hover:text-red-700"
									>
										{{ __('Remove Slot') }}
									</Button>
									<a
										v-else-if="slot.status === 'Booked' && getBookingForSlot(slot.name)?.meeting_link"
										:href="getBookingForSlot(slot.name).meeting_link"
										target="_blank"
										class="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
									>
										{{ __('Join Class') }}
									</a>
									<span v-else-if="slot.status === 'Temporarily Locked'" class="text-xs text-gray-400 italic">
										{{ __('Awaiting Payment...') }}
									</span>
									<span v-else class="text-xs text-gray-400 italic">—</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="text-center py-20 text-gray-500 bg-white border border-gray-200 rounded-xl shadow-sm">
					{{ __('No slots found matching this status filter.') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { Breadcrumbs, Button, LoadingIndicator, Badge, call, toast } from 'frappe-ui'
import { useTutorDashboardStore } from '@/stores/useTutorDashboardStore'
import { Calendar as CalendarIcon } from 'lucide-vue-next'

const dashboardStore = useTutorDashboardStore()
const dayjs = inject('$dayjs')

const regenerating = ref(false)
const activeTab = ref('available')

onMounted(async () => {
	await dashboardStore.dashboardData.submit()
})

const profile = computed(() => dashboardStore.dashboardData.data?.profile)
const slots = computed(() => dashboardStore.dashboardData.data?.slots || [])
const sessions = computed(() => dashboardStore.dashboardData.data?.sessions || [])

const tabs = computed(() => {
	const availCount = slots.value.filter(s => s.status === 'Available' || s.status === 'Temporarily Locked').length
	const bookedCount = slots.value.filter(s => s.status === 'Booked').length
	const expiredCount = slots.value.filter(s => s.status === 'Expired' || s.status === 'Cancelled' || s.status === 'Blocked').length

	return [
		{ id: 'available', name: __('Available Slots'), count: availCount },
		{ id: 'booked', name: __('Booked Slots'), count: bookedCount },
		{ id: 'expired', name: __('Expired Slots'), count: expiredCount },
	]
})

const filteredSlots = computed(() => {
	if (activeTab.value === 'available') {
		return slots.value.filter(s => s.status === 'Available' || s.status === 'Temporarily Locked')
	} else if (activeTab.value === 'booked') {
		return slots.value.filter(s => s.status === 'Booked')
	} else {
		return slots.value.filter(s => s.status === 'Expired' || s.status === 'Cancelled' || s.status === 'Blocked')
	}
})

const groupedSlots = computed(() => {
	if (!filteredSlots.value || !dayjs) return {}
	const groups = {}
	filteredSlots.value.forEach((slot) => {
		const localDate = dayjs.utc(slot.start_datetime).local().format('YYYY-MM-DD')
		if (!groups[localDate]) {
			groups[localDate] = []
		}
		groups[localDate].push(slot)
	})
	return groups
})

const sortedDates = computed(() => {
	return Object.keys(groupedSlots.value).sort()
})

function getBookingForSlot(slotName) {
	return sessions.value.find(s => s.slot === slotName)
}

function formatTime(utcTime) {
	if (!utcTime || !dayjs) return ''
	return dayjs.utc(utcTime).local().format('hh:mm A')
}

function formatDateFriendly(dateStr) {
	if (!dateStr || !dayjs) return ''
	return dayjs(dateStr).format('dddd, MMMM D, YYYY')
}

function getStatusTheme(status) {
	switch (status) {
		case 'Available':
			return 'green'
		case 'Booked':
			return 'blue'
		case 'Temporarily Locked':
			return 'orange'
		default:
			return 'gray'
	}
}

async function triggerRegenerate() {
	if (!profile.value) return
	regenerating.value = true
	try {
		await call('smart_learning.services.slot_generation_service.regenerate_future_slots', {
			tutor_profile: profile.value.name,
		})
		toast({ title: __('Slot regeneration triggered. Slots will update shortly.'), variant: 'success' })
		setTimeout(async () => {
			await dashboardStore.dashboardData.submit()
		}, 1000)
	} catch (e) {
		console.error("Slot regeneration failed:", e)
		toast({ title: __('Slot regeneration failed.'), variant: 'error' })
	} finally {
		regenerating.value = false
	}
}

async function deleteSlot(name) {
	if (!confirm(__('Are you sure you want to delete this available slot?'))) return
	try {
		await call('frappe.client.delete_doc', {
			doctype: 'Tutor Availability Slot',
			name,
		})
		toast({ title: __('Slot removed.'), variant: 'success' })
		await dashboardStore.dashboardData.submit()
	} catch (e) {
		console.error("Failed to delete slot:", e)
		toast({ title: __('Failed to delete slot.'), variant: 'error' })
	}
}
</script>
