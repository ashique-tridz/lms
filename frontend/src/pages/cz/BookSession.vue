<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs class="h-7" :items="breadcrumbItems" />
		</header>

		<div class="max-w-4xl mx-auto p-5 sm:p-8">
			<!-- Tutor selected — show booking flow -->
			<div v-if="tutorName">
				<div v-if="tutorDetails.loading" class="flex justify-center py-20">
					<LoadingIndicator class="w-10 h-10 text-gray-400" />
				</div>
				<div v-else-if="tutorDetails.data" class="space-y-6">
					<BookingFlow :tutor="tutorDetails.data" />
				</div>
				<div v-else class="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
					<p class="text-gray-500 mb-4">{{ __('Failed to load tutor details.') }}</p>
					<router-link
						:to="{ name: 'BookSession' }"
						class="text-sm font-semibold text-blue-600 hover:underline"
					>
						{{ __('Back to Tutor Selection') }}
					</router-link>
				</div>
			</div>

			<!-- No tutor selected — show tutor grid -->
			<div v-else class="space-y-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">{{ __('Find a Tutor') }}</h2>
					<p class="text-sm text-gray-500 mt-1">{{ __('Select from our verified tutors to book a session.') }}</p>
				</div>

				<div v-if="tutorStore.tutorsList.loading" class="flex justify-center py-20">
					<LoadingIndicator class="w-10 h-10 text-gray-400" />
				</div>
				<div v-else-if="tutors && tutors.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<TutorCard
						v-for="tutor in tutors"
						:key="tutor.name"
						:tutor="tutor"
					/>
				</div>
				<div v-else class="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
					{{ __('No tutors available right now. Please check back later.') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Breadcrumbs, LoadingIndicator, createResource } from 'frappe-ui'
import { useTutorStore } from '@/stores/useTutorStore'
import TutorCard from '@/components/cz/TutorCard.vue'
import BookingFlow from '@/components/cz/BookingFlow.vue'

const route = useRoute()
const tutorStore = useTutorStore()

const tutorName = computed(() => route.query.tutor)

const breadcrumbItems = computed(() => {
	const items = [{ label: __('Book Session'), route: { name: 'BookSession' } }]
	if (tutorName.value && tutorDetails.data) {
		items.push({
			label: tutorDetails.data.tutor_name,
			route: { name: 'BookSession', query: { tutor: tutorName.value } },
		})
	}
	return items
})

const tutorDetails = createResource({
	url: 'frappe.client.get',
	makeParams() {
		return {
			doctype: 'Tutor Profile',
			name: tutorName.value,
		}
	},
})

const tutors = computed(() => tutorStore.tutorsList.data || [])

watch(
	tutorName,
	(newName) => {
		if (newName) {
			tutorDetails.submit()
		}
	},
	{ immediate: true }
)

onMounted(() => {
	if (!tutors.value.length) {
		tutorStore.tutorsList.submit()
	}
})
</script>
