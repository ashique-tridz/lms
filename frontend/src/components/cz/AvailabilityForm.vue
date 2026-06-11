<template>
	<form @submit.prevent="submitForm" class="space-y-6 text-gray-800">
		<div class="grid grid-cols-1 gap-4">
			<div>
				<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">{{ __('Weekdays') }}</label>
				<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 border border-gray-100 rounded-lg p-3">
					<label
						v-for="day in weekdays"
						:key="day"
						class="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-gray-700 select-none hover:text-gray-900"
					>
						<input
							type="checkbox"
							:value="day"
							v-model="form.weekdays"
							class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						{{ day }}
					</label>
				</div>
				<p v-if="weekdayError" class="text-xs text-red-500 mt-1.5">{{ __('Please select at least one weekday.') }}</p>
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('Start Time') }}</label>
				<input
					v-model="form.start_time"
					type="time"
					required
					class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('End Time') }}</label>
				<input
					v-model="form.end_time"
					type="time"
					required
					class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('Effective From') }}</label>
				<input
					v-model="form.effective_from"
					type="date"
					required
					class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('Effective To') }}</label>
				<input
					v-model="form.effective_to"
					type="date"
					class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<div>
				<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('Timezone') }}</label>
				<div class="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2.5 flex items-center justify-between">
					<span>{{ profileTimezone || 'Asia/Kolkata' }}</span>
					<span class="text-[10px] bg-gray-200 text-gray-600 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">{{ __('Source: Tutor Profile') }}</span>
				</div>
			</div>

			<div class="flex items-center gap-6 pt-4">
				<label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 select-none">
					<input
						v-model="form.active"
						type="checkbox"
						class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					{{ __('Active') }}
				</label>
			</div>
		</div>

		<div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
			<Button
				@click="$emit('cancel')"
				variant="outline"
				type="button"
				class="rounded-lg text-xs px-4 py-2"
			>
				{{ __('Cancel') }}
			</Button>
			<Button
				:loading="loading"
				variant="solid"
				type="submit"
				class="rounded-lg text-xs px-4 py-2"
			>
				{{ __('Save Rule') }}
			</Button>
		</div>
	</form>
</template>

<script setup>
import { reactive, watch, ref } from 'vue'
import { Button } from 'frappe-ui'

const props = defineProps({
	rule: {
		type: Object,
		default: null,
	},
	profileTimezone: {
		type: String,
		default: 'Asia/Kolkata',
	},
	loading: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['save', 'cancel'])

const weekdays = [
	'Monday',
	'Tuesday',
	'Wednesday',
	'Thursday',
	'Friday',
	'Saturday',
	'Sunday',
]

const form = reactive({
	weekdays: [],
	slot_duration: 60,
	start_time: '',
	end_time: '',
	effective_from: '',
	effective_to: '',
	active: true,
})

const weekdayError = ref(false)

watch(
	() => props.rule,
	(newRule) => {
		weekdayError.value = false
		if (newRule) {
			Object.assign(form, {
				weekdays: Array.isArray(newRule.weekdays) ? [...newRule.weekdays] : [],
				slot_duration: newRule.slot_duration || 60,
				start_time: newRule.start_time || '',
				end_time: newRule.end_time || '',
				effective_from: newRule.effective_from || '',
				effective_to: newRule.effective_to || '',
				active: newRule.active === undefined ? true : !!newRule.active,
			})
		} else {
			Object.assign(form, {
				weekdays: [],
				slot_duration: 60,
				start_time: '',
				end_time: '',
				effective_from: new Date().toISOString().split('T')[0],
				effective_to: '',
				active: true,
			})
		}
	},
	{ immediate: true }
)

function submitForm() {
	if (!form.weekdays || form.weekdays.length === 0) {
		weekdayError.value = true
		return
	}
	weekdayError.value = false
	emit('save', { ...form })
}
</script>
