<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs
				class="h-7"
				:items="[{ label: __('Tutors'), route: { name: 'TutorSearch' } }]"
			/>
		</header>

		<div class="max-w-6xl mx-auto p-5 sm:p-8 space-y-6">
			<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h2 class="text-2xl font-bold text-ink-gray-9">
						{{ __('Explore Our Tutors') }}
					</h2>
					<p class="text-sm text-ink-gray-5 mt-1">
						{{ __('Find the best mentors customized for your curriculum and goals.') }}
					</p>
				</div>
			</div>

			<!-- Tutor Grid -->
			<div v-if="tutorStore.tutorsList.loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-blue-600" />
			</div>
			<div v-else-if="tutors && tutors.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<TutorCard
					v-for="tutor in tutors"
					:key="tutor.name"
					:tutor="tutor"
				/>
			</div>
			<div v-else class="text-center py-20 text-ink-gray-5 bg-surface-cards border border-outline-gray-2 rounded-lg shadow-sm">
				{{ __('No tutors match the criteria or are verified currently.') }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Breadcrumbs, LoadingIndicator } from 'frappe-ui'
import { useTutorStore } from '@/stores/useTutorStore'
import TutorCard from '@/components/cz/TutorCard.vue'

const tutorStore = useTutorStore()
const tutors = computed(() => tutorStore.tutorsList.data || [])

onMounted(() => {
	tutorStore.tutorsList.submit()
})
</script>
