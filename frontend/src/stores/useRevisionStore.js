import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createResource } from 'frappe-ui'

export const useRevisionStore = defineStore('revision-store', () => {
	const recommendations = ref([])

	const revisionFetcher = createResource({
		url: 'smart_learning.api.student_api.get_revision_recommendations',
		onSuccess(data) {
			recommendations.value = data
		}
	})

	function fetchRecommendations() {
		return revisionFetcher.submit()
	}

	return {
		recommendations,
		revisionFetcher,
		fetchRecommendations,
	}
})
