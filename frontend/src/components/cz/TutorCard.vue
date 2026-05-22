<template>
	<div class="flex flex-col h-full bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
		<div class="flex flex-col flex-auto">
			<div class="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-gray-100">
				<div>
					<h3 class="text-lg font-semibold text-gray-950 leading-tight">
						{{ tutor.tutor_name }}
					</h3>
					<p class="text-xs text-gray-500 mt-1">
						{{ tutor.years_of_experiance }} {{ __('Years Experience') }}
					</p>
				</div>
				<div class="text-right">
					<span class="text-[10px] uppercase tracking-wider text-gray-400 block">{{ __('Timezone') }}</span>
					<span class="text-xs font-medium text-gray-800">{{ tutor.timezone || 'UTC' }}</span>
				</div>
			</div>

			<p class="text-sm text-gray-600 line-clamp-3 mb-6 leading-relaxed">
				{{ tutor.bio || __('No biography provided.') }}
			</p>

			<!-- Subjects / Boards / Classes -->
			<div class="mt-auto space-y-3 pt-4 border-t border-dashed border-gray-100">
				<div v-if="tutor.subjects && tutor.subjects.length" class="flex flex-wrap items-center gap-1.5">
					<span class="text-[10px] uppercase tracking-wider text-gray-400 mr-1">{{ __('Subjects') }}:</span>
					<span
						v-for="sub in tutor.subjects"
						:key="sub.name"
						class="text-xs bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-md font-medium"
					>
						{{ sub.subject }}
					</span>
				</div>

				<div v-if="tutor.classes && tutor.classes.length" class="flex flex-wrap items-center gap-1.5">
					<span class="text-[10px] uppercase tracking-wider text-gray-400 mr-1">{{ __('Classes') }}:</span>
					<span
						v-for="cls in tutor.classes"
						:key="cls.name"
						class="text-xs bg-gray-50 text-gray-600 border border-gray-100 px-2 py-0.5 rounded-md font-medium"
					>
						{{ cls.class }}
					</span>
				</div>
			</div>

			<div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
				<div class="text-base font-bold text-gray-900">
					{{ tutor.hourly_rate ? `${tutor.hourly_rate} INR / hr` : __('Price on Request') }}
				</div>
				<router-link
					:to="{ name: 'BookSession', query: { tutor: tutor.name } }"
				>
					<Button
						variant="solid"
						class="rounded-lg text-xs font-semibold px-4 py-2"
					>
						{{ __('Book') }}
					</Button>
				</router-link>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { Button } from 'frappe-ui'

const props = defineProps({
	tutor: {
		type: Object,
		required: true,
	},
})
</script>
