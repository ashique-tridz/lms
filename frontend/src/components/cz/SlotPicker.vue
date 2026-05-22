<template>
	<div class="space-y-6">
		<h4 class="text-base font-semibold text-gray-900">
			{{ __('Select a Slot') }}
		</h4>

		<!-- Date Tabs -->
		<div v-if="groupedSlots && Object.keys(groupedSlots).length" class="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
			<button
				v-for="date in dates"
				:key="date"
				@click="selectedDate = date"
				class="flex flex-col items-center px-4 py-2 border transition-all duration-150 min-w-[80px] rounded-lg focus:outline-none"
				:class="selectedDate === date ? 'bg-blue-600 border-blue-600 text-white font-medium shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'"
			>
				<span class="text-[10px] uppercase tracking-wider font-semibold" :class="selectedDate === date ? 'text-blue-100' : 'text-gray-400'">{{ formatDayOfWeek(date) }}</span>
				<span class="text-lg font-bold mt-0.5">{{ formatDayOfMonth(date) }}</span>
				<span class="text-[9px] uppercase tracking-wider font-semibold mt-0.5" :class="selectedDate === date ? 'text-blue-200' : 'text-gray-400'">{{ formatMonth(date) }}</span>
			</button>
		</div>
		<div v-else class="text-sm text-gray-500 py-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-lg">
			{{ __('No slots available for the selected filters.') }}
		</div>

		<!-- Time Slots Grid -->
		<div v-if="selectedDate && groupedSlots[selectedDate]" class="space-y-3">
			<h5 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
				{{ __('Available Times on') }} {{ formatDateFriendly(selectedDate) }}
			</h5>
			<div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
				<button
					v-for="slot in groupedSlots[selectedDate]"
					:key="slot.name"
					@click="$emit('selectSlot', slot)"
					class="py-2.5 px-3 border text-xs font-medium transition-all text-center rounded-lg focus:outline-none"
					:class="selectedSlotName === slot.name ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'"
				>
					{{ formatTime(slot.start_datetime) }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, inject, ref, watch } from 'vue'

const props = defineProps({
	slots: {
		type: Array,
		required: true,
	},
	selectedSlotName: {
		type: String,
		default: '',
	},
})

defineEmits(['selectSlot'])

const dayjs = inject('$dayjs')
const selectedDate = ref('')

// Group slots by local date string (YYYY-MM-DD)
const groupedSlots = computed(() => {
	if (!props.slots || !dayjs) return {}
	const groups = {}
	props.slots.forEach((slot) => {
		const localDate = dayjs(slot.start_datetime).format('YYYY-MM-DD')
		if (!groups[localDate]) {
			groups[localDate] = []
		}
		groups[localDate].push(slot)
	})
	return groups
})

const dates = computed(() => {
	return Object.keys(groupedSlots.value).sort()
})

watch(
	dates,
	(newDates) => {
		if (newDates.length && !newDates.includes(selectedDate.value)) {
			selectedDate.value = newDates[0]
		} else if (!newDates.length) {
			selectedDate.value = ''
		}
	},
	{ immediate: true }
)

function formatDayOfWeek(dateStr) {
	if (!dayjs) return ''
	return dayjs(dateStr).format('ddd')
}

function formatDayOfMonth(dateStr) {
	if (!dayjs) return ''
	return dayjs(dateStr).format('D')
}

function formatMonth(dateStr) {
	if (!dayjs) return ''
	return dayjs(dateStr).format('MMM')
}

function formatDateFriendly(dateStr) {
	if (!dayjs) return ''
	return dayjs(dateStr).format('dddd, MMMM D, YYYY')
}

function formatTime(localTime) {
	if (!dayjs) return ''
	return dayjs(localTime).format('hh:mm A')
}
</script>
