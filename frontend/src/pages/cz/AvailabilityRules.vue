<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs
				class="h-7"
				:items="[{ label: __('Availability Rules'), route: { name: 'AvailabilityRules' } }]"
			/>
			<Button
				@click="openAddModal"
				variant="solid"
				class="text-xs font-semibold"
			>
				{{ __('Add Rule') }}
			</Button>
		</header>

		<div class="max-w-6xl mx-auto p-5 sm:p-8 space-y-6">
			<div v-if="loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-gray-400" />
			</div>

			<div v-else-if="!tutorName" class="text-center py-20 bg-surface-cards border border-outline-gray-2 rounded-xl shadow-sm">
				<p class="text-ink-gray-5">{{ __('No Tutor Profile linked to your user account.') }}</p>
				<router-link
					:to="{ name: 'TutorProfile' }"
					class="mt-4 inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
				>
					{{ __('Create Tutor Profile') }}
				</router-link>
			</div>

			<div v-else class="space-y-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">{{ __('Weekly Availability Rules') }}</h2>
					<p class="text-sm text-gray-500 mt-1">{{ __('Set up your recurring weekly slot generation patterns.') }}</p>
				</div>

				<div v-if="rules.length" class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
					<table class="w-full text-left border-collapse text-sm text-gray-800">
						<thead>
							<tr class="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-xs uppercase tracking-wider">
								<th class="p-4">{{ __('Weekday') }}</th>
								<th class="p-4">{{ __('Time Range') }}</th>
								<th class="p-4">{{ __('Duration') }}</th>
								<th class="p-4">{{ __('Effective Dates') }}</th>
								<th class="p-4">{{ __('Status') }}</th>
								<th class="p-4 text-right">{{ __('Actions') }}</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="rule in rules"
								:key="rule.name"
								class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
							>
								<td class="p-4 font-semibold text-gray-900">{{ rule.weekday }}</td>
								<td class="p-4">{{ formatTime(rule.start_time) }} – {{ formatTime(rule.end_time) }}</td>
								<td class="p-4">{{ rule.slot_duration }} {{ __('mins') }}</td>
								<td class="p-4 text-xs text-gray-500">
									{{ rule.effective_from }} {{ rule.effective_to ? `to ${rule.effective_to}` : __('onwards') }}
								</td>
								<td class="p-4">
									<Badge
										:label="rule.active ? __('Active') : __('Inactive')"
										:theme="rule.active ? 'green' : 'gray'"
										size="sm"
									/>
								</td>
								<td class="p-4 text-right space-x-3">
									<button
										@click="openEditModal(rule)"
										class="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
									>
										{{ __('Edit') }}
									</button>
									<button
										@click="deleteRule(rule.name)"
										class="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline"
									>
										{{ __('Delete') }}
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div v-else class="text-center py-12 bg-white border border-dashed border-gray-200 rounded-xl text-gray-500 text-sm">
					{{ __('No availability rules defined yet. Create your first rule to generate booking slots.') }}
				</div>
			</div>
		</div>

		<!-- Rule Edit/Add Modal -->
		<Dialog
			v-model="showModal"
			:options="{
				title: editingRule ? __('Edit Availability Rule') : __('Add Availability Rule'),
				size: 'lg',
			}"
		>
			<template #body-content>
				<AvailabilityForm
					:rule="editingRule"
					:loading="saving"
					@save="handleSave"
					@cancel="showModal = false"
				/>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { Breadcrumbs, Button, LoadingIndicator, Badge, Dialog, call } from 'frappe-ui'
import AvailabilityForm from '@/components/cz/AvailabilityForm.vue'

const user = inject('$user')

const loading = ref(true)
const tutorName = ref('')
const rules = ref([])

const showModal = ref(false)
const editingRule = ref(null)
const saving = ref(false)

onMounted(async () => {
	await fetchTutorAndRules()
})

async function fetchTutorAndRules() {
	loading.value = true
	try {
		if (user.data?.name) {
			const tutorRes = await call('frappe.client.get_value', {
				doctype: 'Tutor Profile',
				filters: { user: user.data.name },
				fieldname: 'name',
			})
			if (tutorRes && tutorRes.message) {
				tutorName.value = tutorRes.message.name
				const rulesRes = await call('frappe.client.get_list', {
					doctype: 'Tutor Availability Rule',
					filters: { tutor: tutorName.value },
					fields: ['name', 'weekday', 'start_time', 'end_time', 'slot_duration', 'active', 'effective_from', 'effective_to', 'timezone', 'auto_regenerate'],
				})
				rules.value = rulesRes || []
			}
		}
	} catch (e) {
		console.error('Failed to load rules:', e)
	} finally {
		loading.value = false
	}
}

function formatTime(timeStr) {
	if (!timeStr) return ''
	const parts = timeStr.split(':')
	const hours = parseInt(parts[0])
	const minutes = parts[1]
	const ampm = hours >= 12 ? 'PM' : 'AM'
	const formattedHours = hours % 12 || 12
	return `${formattedHours}:${minutes} ${ampm}`
}

function openAddModal() {
	editingRule.value = null
	showModal.value = true
}

function openEditModal(rule) {
	editingRule.value = rule
	showModal.value = true
}

async function handleSave(formData) {
	saving.value = true
	try {
		if (editingRule.value) {
			await call('frappe.client.set_value', {
				doctype: 'Tutor Availability Rule',
				name: editingRule.value.name,
				fieldname: formData,
			})
		} else {
			const doc = {
				doctype: 'Tutor Availability Rule',
				tutor: tutorName.value,
				...formData,
			}
			await call('frappe.client.insert', { doc })
		}
		showModal.value = false
		await fetchTutorAndRules()
	} catch (e) {
		console.error('Save rule failed:', e)
	} finally {
		saving.value = false
	}
}

async function deleteRule(name) {
	if (!confirm(__('Are you sure you want to delete this rule?'))) return
	try {
		await call('frappe.client.delete_doc', {
			doctype: 'Tutor Availability Rule',
			name,
		})
		await fetchTutorAndRules()
	} catch (e) {
		console.error('Failed to delete rule:', e)
	}
}
</script>
