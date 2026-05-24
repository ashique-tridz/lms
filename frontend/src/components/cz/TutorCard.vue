<template>
	<div
		class="flex flex-col h-full bg-surface-white border border-outline-gray-2 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200"
	>
		<div class="flex flex-col flex-auto">
			<!-- Header: name + timezone -->
			<div class="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-outline-gray-1">
				<div>
					<h3 class="text-base font-semibold text-ink-gray-9 leading-tight">
						{{ tutor.tutor_name }}
					</h3>
					<p class="text-xs text-ink-gray-5 mt-0.5">
						{{ tutor.years_of_experiance || tutor.years_of_experience || 0 }}
						{{ __('yrs exp') }}
					</p>
				</div>
				<div class="text-right shrink-0">
					<span class="text-[10px] uppercase tracking-wider text-ink-gray-4 block">
						{{ __('Timezone') }}
					</span>
					<span class="text-xs font-medium text-ink-gray-7">
						{{ tutor.timezone || 'UTC' }}
					</span>
				</div>
			</div>

			<!-- Bio -->
			<p class="text-sm text-ink-gray-6 line-clamp-2 mb-4 leading-relaxed">
				{{ tutor.bio || __('No biography provided.') }}
			</p>

			<!-- Tags: subjects + classes -->
			<div class="mt-auto space-y-2 pt-3 border-t border-dashed border-outline-gray-1">
				<div v-if="tutor.subjects?.length" class="flex flex-wrap items-center gap-1">
					<span class="text-[10px] uppercase tracking-wider text-ink-gray-4 mr-1">
						{{ __('Subjects') }}:
					</span>
					<Badge
						v-for="sub in tutor.subjects"
						:key="sub.subject"
						:label="sub.subject"
						theme="gray"
						size="sm"
					/>
				</div>
				<div v-if="tutor.classes?.length" class="flex flex-wrap items-center gap-1">
					<span class="text-[10px] uppercase tracking-wider text-ink-gray-4 mr-1">
						{{ __('Classes') }}:
					</span>
					<Badge
						v-for="cls in tutor.classes"
						:key="cls.class"
						:label="cls.class"
						theme="blue"
						size="sm"
					/>
				</div>
			</div>

			<!-- Footer: price + book button -->
			<div class="flex items-center justify-between mt-4 pt-4 border-t border-outline-gray-1">
				<div class="text-sm font-semibold text-ink-gray-9">
					<template v-if="tutor.hourly_rate">
						{{ tutor.hourly_rate }} {{ currency }}
						<span class="text-xs font-normal text-ink-gray-5">/ hr</span>
					</template>
					<span v-else class="text-ink-gray-5 font-normal text-xs">
						{{ __('Price on Request') }}
					</span>
				</div>
				<router-link :to="{ name: 'BookSession', query: { tutor: tutor.name } }">
					<Button variant="solid" size="sm">
						{{ __('Book') }}
					</Button>
				</router-link>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import { Badge, Button } from 'frappe-ui'
import { systemSettings } from '@/resources/bookTutor'

const props = defineProps({
	tutor: {
		type: Object,
		required: true,
	},
})

const currency = computed(
	() => systemSettings.data?.currency || 'INR'
)
</script>
