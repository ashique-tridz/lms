<template>
	<div>
		<LayoutHeader>
			<template #left-header>
				<Breadcrumbs class="h-7" :items="breadcrumbs" />
			</template>
			<template #right-header>
				<Button
					:loading="regenerating"
					v-if="profile"
					@click="triggerRegenerate"
					variant="outline"
					class="text-xs font-semibold"
				>
					{{ __('Regenerate Slots') }}
				</Button>
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
						<CalendarIcon class="w-8 h-8 text-ink-gray-5 stroke-1.5" />
					</div>
					<h3 class="text-lg font-medium text-ink-gray-9">{{ __('No Tutor Profile linked to your account') }}</h3>
					<p class="text-sm text-ink-gray-7 max-w-sm">
						{{ __('Please create your tutor profile first to manage generated bookable slots.') }}
					</p>
				</div>
				<router-link
					:to="{ name: 'TutorProfile' }"
					class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
				>
					{{ __('Create Tutor Profile') }}
				</router-link>
			</div>

			<!-- Slots Page Content -->
			<div v-else class="space-y-6">
				<div class="border-b pb-4">
					<h2 class="text-xl font-semibold text-ink-gray-9">{{ __('Generated Availability Slots') }}</h2>
					<p class="text-sm text-ink-gray-5 mt-1">{{ __('Manage your available slots and view linked booking states.') }}</p>
				</div>

				<!-- Tabs Navigation -->
				<div class="mb-4">
					<TabButtons
						class="inline-block"
						:buttons="tabButtons"
						v-model="activeTab"
					/>
				</div>

				<!-- Slots Grouped by Date -->
				<div v-if="sortedDates.length" class="space-y-6">
					<div
						v-for="date in sortedDates"
						:key="date"
						class="border rounded-md p-5 bg-surface-white space-y-4"
					>
						<h3 class="font-bold text-sm text-ink-gray-9 border-b pb-2">
							{{ formatDateFriendly(date) }}
						</h3>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							<div
								v-for="slot in groupedSlots[date]"
								:key="slot.name"
								class="border rounded-md p-4 flex flex-col justify-between bg-surface-white hover:border-outline-gray-3 transition-colors space-y-3"
							>
								<div class="space-y-2">
									<!-- Time Range & Badge -->
									<div class="flex justify-between items-start">
										<span class="text-sm font-bold text-ink-gray-9">
											{{ formatTime(slot.start_datetime) }} - {{ formatTime(slot.end_datetime) }}
										</span>
										<Badge :theme="getStatusTheme(slot.status)" size="sm">
											{{ slot.status }}
										</Badge>
									</div>

									<!-- Linked Booking info if Booked or Locked -->
									<div
										v-if="getBookingForSlot(slot.name)"
										class="border-t pt-2.5 mt-2.5 space-y-1.5 text-xs text-ink-gray-7"
									>
										<div class="flex justify-between">
											<span class="text-ink-gray-4 font-medium">{{ __('Student') }}:</span>
											<span class="font-semibold text-ink-gray-8">{{ getBookingForSlot(slot.name).student }}</span>
										</div>
										<div class="flex justify-between">
											<span class="text-ink-gray-4 font-medium">{{ __('Subject') }}:</span>
											<span class="font-semibold text-ink-gray-8">{{ getBookingForSlot(slot.name).subject || '—' }}</span>
										</div>
										<div class="flex justify-between">
											<span class="text-ink-gray-4 font-medium">{{ __('Class') }}:</span>
											<span class="font-semibold text-ink-gray-8">
												{{ getBookingForSlot(slot.name).class || '—' }} ({{ getBookingForSlot(slot.name).board || '—' }})
											</span>
										</div>
										<div class="flex justify-between" v-if="getBookingForSlot(slot.name).amount">
											<span class="text-ink-gray-4 font-medium">{{ __('Price') }}:</span>
											<span class="font-semibold text-ink-gray-8">{{ getBookingForSlot(slot.name).amount }} INR</span>
										</div>
									</div>
								</div>

								<!-- Action Button -->
								<div class="flex justify-end pt-2 border-t mt-2">
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
										class="inline-block px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold transition-colors"
									>
										{{ __('Join Class') }}
									</a>
									<span v-else-if="slot.status === 'Temporarily Locked'" class="text-xs text-ink-gray-4 italic">
										{{ __('Awaiting Payment...') }}
									</span>
									<span v-else class="text-xs text-ink-gray-4 italic">—</span>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="text-center py-20 text-ink-gray-5 border rounded-md bg-surface-white">
					{{ __('No slots found matching this status filter.') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { Breadcrumbs, Button, LoadingIndicator, Badge, TabButtons, call, toast } from 'frappe-ui'
import { useTutorDashboardStore } from '@/stores/useTutorDashboardStore'
import LayoutHeader from '@/components/Layouts/LayoutHeader.vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { convertToLocal } from '@/utils/timezone'
import dayjs from '@/utils/dayjs'

const dashboardStore = useTutorDashboardStore()

const regenerating = ref(false)
const activeTab = ref('available')

onMounted(async () => {
	await dashboardStore.dashboardData.submit()
})

const profile = computed(() => dashboardStore.dashboardData.data?.profile)
const slots = computed(() => dashboardStore.dashboardData.data?.slots || [])
const sessions = computed(() => dashboardStore.dashboardData.data?.sessions || [])

const breadcrumbs = computed(() => [
	{ label: __('My Slots'), route: { name: 'SlotCalendar' } }
])

const tabButtons = computed(() => {
	const availCount = slots.value.filter(s => s.status === 'Available' || s.status === 'Temporarily Locked').length
	const bookedCount = slots.value.filter(s => s.status === 'Booked').length
	const expiredCount = slots.value.filter(s => s.status === 'Expired' || s.status === 'Cancelled' || s.status === 'Blocked').length

	return [
		{ value: 'available', label: `${__('Available')} (${availCount})` },
		{ value: 'booked', label: `${__('Booked')} (${bookedCount})` },
		{ value: 'expired', label: `${__('Expired')} (${expiredCount})` },
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
	if (!filteredSlots.value) return {}
	const groups = {}
	filteredSlots.value.forEach((slot) => {
		const d = convertToLocal(slot.start_datetime)
		if (!d) return
		const localDate = d.format('YYYY-MM-DD')
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
	const localObj = convertToLocal(utcTime)
	return localObj ? localObj.format('hh:mm A') : ''
}

function formatDateFriendly(dateStr) {
	if (!dateStr) return ''
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
