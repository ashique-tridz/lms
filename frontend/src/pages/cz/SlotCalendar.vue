<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs
				class="h-7"
				:items="[{ label: __('My Slots'), route: { name: 'SlotCalendar' } }]"
			/>
			<Button
				:loading="regenerating"
				@click="triggerRegenerate"
				variant="outline"
				class="text-xs font-semibold"
			>
				{{ __('Regenerate Slots') }}
			</Button>
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
				<div>
					<h2 class="text-2xl font-bold text-ink-gray-9">{{ __('Generated Availability Slots') }}</h2>
					<p class="text-sm text-ink-gray-5 mt-1">{{ __('View, delete or manage individual generated bookable slots.') }}</p>
				</div>

				<!-- Slots Grid -->
				<div v-if="Object.keys(groupedSlots).length" class="space-y-6">
					<div
						v-for="date in sortedDates"
						:key="date"
						class="bg-surface-cards border border-outline-gray-2 rounded-lg p-5 shadow-sm space-y-4"
					>
						<h3 class="font-bold text-sm text-ink-gray-9 border-b border-outline-gray-1 pb-2">
							{{ formatDateFriendly(date) }}
						</h3>
						<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
							<div
								v-for="slot in groupedSlots[date]"
								:key="slot.name"
								class="border border-outline-gray-2 rounded p-3 flex justify-between items-center bg-surface-gray-1/30"
							>
								<div>
									<p class="text-sm font-semibold text-ink-gray-8">
										{{ formatTime(slot.start_datetime) }} - {{ formatTime(slot.end_datetime) }}
									</p>
									<span class="text-[10px] mt-1 block">
										<Badge :theme="getStatusTheme(slot.status)" size="sm">
											{{ slot.status }}
										</Badge>
									</span>
								</div>

								<button
									v-if="slot.status === 'Available'"
									@click="deleteSlot(slot.name)"
									class="text-xs text-red-600 hover:underline font-semibold"
								>
									{{ __('Remove') }}
								</button>
							</div>
						</div>
					</div>
				</div>
				<div v-else class="text-center py-20 text-ink-gray-5 bg-surface-cards border border-outline-gray-2 rounded-lg shadow-sm">
					{{ __('No slots generated. Set up availability rules to generate slots automatically.') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, inject, onMounted, ref } from 'vue'
import { Breadcrumbs, Button, LoadingIndicator, Badge, call } from 'frappe-ui'

const user = inject('$user')
const dayjs = inject('$dayjs')

const loading = ref(true)
const regenerating = ref(false)
const tutorName = ref('')
const slots = ref([])

onMounted(async () => {
	await fetchTutorAndSlots()
})

async function fetchTutorAndSlots() {
	loading.value = true
	try {
		if (user.data?.name) {
			const tutorRes = await call('frappe.client.get_value', {
				doctype: 'Tutor Profile',
				filters: { user: user.data.name },
				fieldname: 'name',
			})
			if (tutorRes && tutorRes.message) {
				tutorName.value = tutorRes.message.name
				const slotsRes = await call('frappe.client.get_list', {
					doctype: 'Tutor Availability Slot',
					filters: { tutor: tutorName.value },
					fields: ['name', 'start_datetime', 'end_datetime', 'status'],
					order_by: 'start_datetime asc',
					limit: 200,
				})
				slots.value = slotsRes || []
			}
		}
	} catch (e) {
		console.error("Failed to load slots:", e)
	} finally {
		loading.value = false
	}
}

const groupedSlots = computed(() => {
	if (!slots.value || !dayjs) return {}
	const groups = {}
	slots.value.forEach((slot) => {
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
	regenerating.value = true
	try {
		await call('smart_learning.services.slot_generation_service.regenerate_future_slots', {
			tutor_profile: tutorName.value,
		})
		alert(__('Slot regeneration triggered. It will run in the background.'))
		setTimeout(async () => {
			await fetchTutorAndSlots()
		}, 1000)
	} catch (e) {
		console.error("Slot regeneration failed:", e)
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
		await fetchTutorAndSlots()
	} catch (e) {
		console.error("Failed to delete slot:", e)
	}
}
</script>
