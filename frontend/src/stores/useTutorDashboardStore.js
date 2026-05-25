import { defineStore } from 'pinia'
import { createResource } from 'frappe-ui'

export const useTutorDashboardStore = defineStore('tutor-dashboard-store', () => {
	const dashboardData = createResource({
		url: 'smart_learning.api.tutor_api.get_tutor_dashboard_data',
		auto: false,
	})

	return {
		dashboardData,
	}
})
