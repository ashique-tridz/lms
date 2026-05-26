<template>
	<form @submit.prevent="submitForm" class="space-y-6 text-gray-800">
		<div class="grid grid-cols-1 gap-4">
			<div>
				<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('Weekday') }}</label>
				<select
					v-model="form.weekday"
					required
					class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				>
					<option value="" disabled>{{ __('Select weekday') }}</option>
					<option v-for="day in weekdays" :key="day" :value="day">
						{{ day }}
					</option>
				</select>
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
				<input
					v-model="form.timezone"
					type="text"
					required
					class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-white text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
					placeholder="Asia/Kolkata"
				/>
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

				<label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 select-none">
					<input
						v-model="form.auto_regenerate"
						type="checkbox"
						class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
					/>
					{{ __('Auto') }}
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
import { reactive, watch } from 'vue'
import { Button } from 'frappe-ui'

const props = defineProps({
	rule: {
		type: Object,
		default: null,
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
	weekday: '',
	slot_duration: 60,
	start_time: '',
	end_time: '',
	effective_from: '',
	effective_to: '',
	timezone: 'Asia/Kolkata',
	active: true,
	auto_regenerate: true,
})

watch(
	() => props.rule,
	(newRule) => {
		if (newRule) {
			Object.assign(form, {
				weekday: newRule.weekday || '',
				slot_duration: newRule.slot_duration || 60,
				start_time: newRule.start_time || '',
				end_time: newRule.end_time || '',
				effective_from: newRule.effective_from || '',
				effective_to: newRule.effective_to || '',
				timezone: newRule.timezone || 'Asia/Kolkata',
				active: newRule.active === undefined ? true : !!newRule.active,
				auto_regenerate: newRule.auto_regenerate === undefined ? true : !!newRule.auto_regenerate,
			})
		} else {
			Object.assign(form, {
				weekday: '',
				slot_duration: 60,
				start_time: '',
				end_time: '',
				effective_from: new Date().toISOString().split('T')[0],
				effective_to: '',
				timezone: 'Asia/Kolkata',
				active: true,
				auto_regenerate: true,
			})
		}
	},
	{ immediate: true }
)

function submitForm() {
	emit('save', { ...form })
}
</script>
