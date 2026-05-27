import { defineStore } from 'pinia'
import { ref, reactive, watch } from 'vue'
import { createResource } from 'frappe-ui'

export const useTutorStore = defineStore('tutor-store', () => {
	const filters = reactive({
		subject: '',
		board: '',
		class_name: '',
		start_date: '',
		end_date: '',
		tutor: '',
	})

	const selectedTutor = ref(null)

	// Fetch tutors
	const tutorsList = createResource({
		url: 'frappe.client.get_list',
		params: {
			doctype: 'Tutor Profile',
			filters: {
				active: 1,
				verification_status: 'Verified',
			},
			fields: ['name', 'tutor_name', 'bio', 'years_of_experience', 'timezone'],
		},
		auto: true,
	})

	// Fetch available slots
	const slotsList = createResource({
		url: 'smart_learning.api.tutor_api.search_slots',
		makeParams() {
			return {
				subject: filters.subject || undefined,
				board: filters.board || undefined,
				class_name: filters.class_name || undefined,
				start_date: filters.start_date || undefined,
				end_date: filters.end_date || undefined,
				tutor: filters.tutor || undefined,
			}
		},
	})

	watch(
		filters,
		() => {
			if (filters.tutor || filters.subject || filters.board || filters.class_name) {
				slotsList.submit()
			}
		},
		{ deep: true }
	)

	return {
		filters,
		selectedTutor,
		tutorsList,
		slotsList,
	}
})
