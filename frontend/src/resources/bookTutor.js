import { createResource } from 'frappe-ui'
import { reactive } from 'vue'

export const filterState = reactive({
	tutor: '',
	subject: '',
	class_name: '',
	board: '',
	page: 1,
	page_length: 20,
})

// System settings: currency + timezone
// frappe.client.get_value returns { message: { currency, time_zone } }
export const systemSettings = createResource({
	url: 'frappe.client.get_value',
	params: {
		doctype: 'System Settings',
		fieldname: ['currency', 'time_zone'],
	},
	auto: true,
	transform(data) {
		// createResource strips the outer {message} wrapper; data is already the inner object
		return {
			currency: data?.currency || 'INR',
			timezone: data?.time_zone || 'UTC',
		}
	},
})

export const subjectsList = createResource({
	url: 'frappe.client.get_list',
	params: {
		doctype: 'Subject',
		fields: ['name', 'subject'],
		order_by: 'subject asc',
		limit: 1000,
	},
	auto: true,
	transform(data) {
		return data.map((item) => ({
			label: item.subject || item.name,
			value: item.name,
		}))
	},
})

export const boardsList = createResource({
	url: 'frappe.client.get_list',
	params: {
		doctype: 'Board',
		fields: ['name', 'board'],
		order_by: 'board asc',
		limit: 1000,
	},
	auto: true,
	transform(data) {
		return data.map((item) => ({
			label: item.board || item.name,
			value: item.name,
		}))
	},
})

export const classesList = createResource({
	url: 'frappe.client.get_list',
	params: {
		doctype: 'Class',
		fields: ['name', 'class'],
		order_by: 'class asc',
		limit: 1000,
	},
	auto: true,
	transform(data) {
		return data.map((item) => ({
			label: item.class || item.name,
			value: item.name,
		}))
	},
})

export const allTutorsList = createResource({
	url: 'frappe.client.get_list',
	params: {
		doctype: 'Tutor Profile',
		filters: {
			active: 1,
			verification_status: 'Verified',
		},
		fields: ['name', 'tutor_name'],
		order_by: 'tutor_name asc',
		limit: 1000,
	},
	auto: true,
	transform(data) {
		return data.map((item) => ({
			label: item.tutor_name || item.name,
			value: item.tutor_name,
		}))
	},
})

export const tutorsList = createResource({
	url: 'smart_learning.api.tutor_api.search_tutors',
	makeParams() {
		return {
			tutor: filterState.tutor || undefined,
			subject: filterState.subject || undefined,
			class_name: filterState.class_name || undefined,
			board: filterState.board || undefined,
			start: (filterState.page - 1) * filterState.page_length,
			page_length: filterState.page_length,
		}
	},
})
