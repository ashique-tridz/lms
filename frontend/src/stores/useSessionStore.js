import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createResource } from 'frappe-ui'

export const useSessionStore = defineStore('session-store', () => {
	const sessions = ref([])
	const currentSession = ref(null)

	const bookingHistoryFetcher = createResource({
		url: 'smart_learning.api.student_api.get_booking_history',
		onSuccess(data) {
			sessions.value = data
		}
	})

	const bookingDetailsFetcher = createResource({
		url: 'smart_learning.api.student_api.get_booking_details',
		onSuccess(data) {
			currentSession.value = data
		}
	})

	function fetchHistory() {
		return bookingHistoryFetcher.submit()
	}

	function fetchDetails(bookingName) {
		return bookingDetailsFetcher.submit({ booking_name: bookingName })
	}

	return {
		sessions,
		currentSession,
		bookingHistoryFetcher,
		bookingDetailsFetcher,
		fetchHistory,
		fetchDetails,
	}
})
