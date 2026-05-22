<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs
				class="h-7"
				:items="[{ label: __('Revision Recommendations'), route: { name: 'Revision' } }]"
			/>
		</header>

		<div class="max-w-4xl mx-auto p-5 sm:p-8 space-y-6">
			<div>
				<h2 class="text-2xl font-bold text-ink-gray-9">
					{{ __('Smart Revision Feed') }}
				</h2>
				<p class="text-sm text-ink-gray-5 mt-1">
					{{ __('AI-analyzed concepts and lessons to review based on your performance and tutoring sessions.') }}
				</p>
			</div>

			<!-- List of recommendations -->
			<div v-if="revisionStore.revisionFetcher.loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-gray-400" />
			</div>
			<div v-else-if="revisionStore.recommendations && revisionStore.recommendations.length" class="space-y-5">
				<RevisionCard
					v-for="rec in revisionStore.recommendations"
					:key="rec.name"
					:recommendation="rec"
				/>
			</div>
			<div v-else class="text-center py-20 text-ink-gray-5 bg-surface-cards border border-outline-gray-2 rounded-lg shadow-sm">
				{{ __('No revision recommendations generated yet. Complete a booked session to receive feedback!') }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Breadcrumbs, LoadingIndicator } from 'frappe-ui'
import { useRevisionStore } from '@/stores/useRevisionStore'
import RevisionCard from '@/components/cz/RevisionCard.vue'

const revisionStore = useRevisionStore()

onMounted(() => {
	revisionStore.fetchRecommendations()
})
</script>
