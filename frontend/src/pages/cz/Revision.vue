<template>
	<div>
		<LayoutHeader>
			<template #left-header>
				<Breadcrumbs
					class="h-7"
					:items="breadcrumbs"
				/>
			</template>
		</LayoutHeader>

		<div class="mx-auto flex min-h-0 w-full flex-1 flex-col p-5 max-w-4xl">
			<div class="space-y-6">
				<div class="border-b pb-4">
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
				<div v-else class="text-center py-20 text-ink-gray-5 border rounded-md bg-surface-white">
					{{ __('No revision recommendations generated yet. Complete a booked session to receive feedback!') }}
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { Breadcrumbs, LoadingIndicator } from 'frappe-ui'
import { useRevisionStore } from '@/stores/useRevisionStore'
import RevisionCard from '@/components/cz/RevisionCard.vue'
import LayoutHeader from '@/components/Layouts/LayoutHeader.vue'

const revisionStore = useRevisionStore()

onMounted(() => {
	revisionStore.fetchRecommendations()
})

const breadcrumbs = computed(() => [
	{ label: __('Revision Recommendations'), route: { name: 'Revision' } }
])
</script>
