<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs
				class="h-7"
				:items="[{ label: __('Availability Rules'), route: { name: 'AvailabilityRules' } }]"
			/>
			<Button
				v-if="profile"
				@click="openAddModal"
				variant="solid"
				class="text-xs font-semibold"
			>
				{{ __('Add Rule') }}
			</Button>
		</header>

		<div class="max-w-6xl mx-auto p-5 sm:p-8 space-y-6">
			<!-- Loading State -->
			<div v-if="dashboardStore.dashboardData.loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-gray-400" />
			</div>

			<!-- Empty State: No Profile -->
			<div v-else-if="!profile" class="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
				<div class="flex flex-col items-center justify-center space-y-2">
					<div class="p-3 bg-gray-50 rounded-full">
						<Clock class="w-8 h-8 text-gray-400 stroke-1.5" />
					</div>
					<h3 class="text-lg font-medium text-gray-900">{{ __('No Tutor Profile linked to your account') }}</h3>
					<p class="text-sm text-gray-500 max-w-sm">
						{{ __('Please create your tutor profile first to start defining weekly availability rules.') }}
					</p>
				</div>
				<router-link
					:to="{ name: 'TutorProfile' }"
					class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
				>
					{{ __('Create Tutor Profile') }}
				</router-link>
			</div>

			<!-- Rules Content -->
			<div v-else class="space-y-6">
				<div>
					<h2 class="text-xl font-semibold text-gray-900">{{ __('Weekly Availability Rules') }}</h2>
					<p class="text-sm text-gray-500 mt-1">{{ __('Set up your recurring weekly slot generation patterns.') }}</p>
				</div>

				<!-- Rules Card List -->
				<div v-if="rules.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
					<div
						v-for="rule in rules"
						:key="rule.name"
						class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md transition-shadow"
					>
						<div class="space-y-3">
							<!-- Header: Weekday & Active Status -->
							<div class="flex justify-between items-start">
								<div>
									<h4 class="font-bold text-gray-900 text-base">
										{{ getWeekdaysString(rule.weekday) }}
									</h4>
									<p class="text-xs text-gray-500 mt-0.5">
										{{ rule.effective_from }} {{ rule.effective_to ? `to ${rule.effective_to}` : __('onwards') }}
									</p>
								</div>
								<div class="flex gap-2">
									<Badge
										:label="rule.docstatus === 1 ? __('Submitted') : __('Draft')"
										:theme="rule.docstatus === 1 ? 'blue' : 'gray'"
										size="sm"
									/>
									<Badge
										:label="rule.active ? __('Active') : __('Inactive')"
										:theme="rule.active ? 'green' : 'red'"
										size="sm"
									/>
								</div>
							</div>

							<!-- Details Grid -->
							<div class="grid grid-cols-2 gap-4 pt-1 text-xs">
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Time Range') }}</span>
									<span class="font-semibold text-gray-800">{{ formatTime(rule.start_time) }} – {{ formatTime(rule.end_time) }}</span>
								</div>
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Duration') }}</span>
									<span class="font-semibold text-gray-800">{{ rule.slot_duration }} {{ __('mins') }}</span>
								</div>
								<div class="col-span-2">
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Time Zone') }}</span>
									<span class="font-semibold text-gray-800">{{ rule.timezone || profile.timezone || 'Asia/Kolkata' }}</span>
								</div>
							</div>

							<!-- Subjects, Board, Class from Profile -->
							<div class="border-t border-gray-100 pt-3 space-y-2 text-xs">
								<div class="flex justify-between">
									<span class="text-gray-400 font-medium">{{ __('Subjects') }}:</span>
									<span class="font-semibold text-gray-700 text-right max-w-[200px] truncate" :title="profileSubjects">
										{{ profileSubjects }}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-400 font-medium">{{ __('Boards') }}:</span>
									<span class="font-semibold text-gray-700 text-right max-w-[200px] truncate" :title="profileBoards">
										{{ profileBoards }}
									</span>
								</div>
								<div class="flex justify-between">
									<span class="text-gray-400 font-medium">{{ __('Classes') }}:</span>
									<span class="font-semibold text-gray-700 text-right max-w-[200px] truncate" :title="profileClasses">
										{{ profileClasses }}
									</span>
								</div>
							</div>
						</div>

						<!-- Actions -->
						<div class="flex justify-end gap-3 pt-3 border-t border-gray-100 mt-2">
							<Button
								@click="openEditModal(rule)"
								variant="outline"
								class="text-xs font-semibold"
							>
								{{ __('Edit') }}
							</Button>
							<Button
								@click="deleteRule(rule.name)"
								variant="outline"
								class="text-xs font-semibold text-red-600 hover:text-red-700"
							>
								{{ __('Delete') }}
							</Button>
						</div>
					</div>
				</div>

				<div v-else class="text-center py-20 bg-white border border-gray-200 rounded-xl text-gray-500 shadow-sm space-y-3">
					<p>{{ __('No availability rules defined yet. Create your first rule to generate booking slots.') }}</p>
					<Button
						@click="openAddModal"
						variant="solid"
						class="text-xs font-semibold"
					>
						{{ __('Create Rule') }}
					</Button>
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
import { computed, inject, onMounted, ref } from 'vue'
import { Breadcrumbs, Button, LoadingIndicator, Badge, Dialog, call, toast } from 'frappe-ui'
import { useTutorDashboardStore } from '@/stores/useTutorDashboardStore'
import AvailabilityForm from '@/components/cz/AvailabilityForm.vue'
import { Clock } from 'lucide-vue-next'

const dashboardStore = useTutorDashboardStore()

const showModal = ref(false)
const editingRule = ref(null)
const saving = ref(false)

onMounted(async () => {
	await dashboardStore.dashboardData.submit()
})

const profile = computed(() => dashboardStore.dashboardData.data?.profile)
const rules = computed(() => dashboardStore.dashboardData.data?.rules || [])

const profileSubjects = computed(() => {
	if (!profile.value?.subjects?.length) return '—'
	return profile.value.subjects.map(s => s.subject).join(', ')
})

const profileBoards = computed(() => {
	if (!profile.value?.boards?.length) return '—'
	return profile.value.boards.map(b => b.board).join(', ')
})

const profileClasses = computed(() => {
	if (!profile.value?.classes?.length) return '—'
	return profile.value.classes.map(c => c.class).join(', ')
})

function getWeekdaysString(weekdayList) {
	if (!weekdayList || !weekdayList.length) return ''
	return weekdayList.map(w => w.weekday).join(', ')
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
	// Map child table to string for the single-select in form
	const weekdayStr = Array.isArray(rule.weekday) && rule.weekday.length
		? rule.weekday[0].weekday
		: ''
	editingRule.value = {
		...rule,
		weekday: weekdayStr
	}
	showModal.value = true
}

async function handleSave(formData) {
	saving.value = true
	try {
		// Map back to child table structure
		const weekdayRows = [{ weekday: formData.weekday }]

		if (editingRule.value && editingRule.value.name) {
			// Cancel old rule
			await call('frappe.client.cancel', {
				doctype: 'Tutor Availability Rule',
				name: editingRule.value.name,
			})
			// Insert updated rule
			const doc = {
				doctype: 'Tutor Availability Rule',
				tutor: profile.value.name,
				workflow_state: 'Approved',
				...formData,
				weekday: weekdayRows
			}
			const newDoc = await call('frappe.client.insert', { doc })
			await call('frappe.client.submit', { doc: newDoc })
		} else {
			// Insert new rule
			const doc = {
				doctype: 'Tutor Availability Rule',
				tutor: profile.value.name,
				workflow_state: 'Approved',
				...formData,
				weekday: weekdayRows
			}
			const newDoc = await call('frappe.client.insert', { doc })
			await call('frappe.client.submit', { doc: newDoc })
		}
		showModal.value = false
		toast({ title: __('Rule saved successfully.'), variant: 'success' })
		await dashboardStore.dashboardData.submit()
	} catch (e) {
		console.error('Save rule failed:', e)
		toast({ title: e.message || __('Failed to save rule.'), variant: 'error' })
	} finally {
		saving.value = false
	}
}

async function deleteRule(name) {
	if (!confirm(__('Are you sure you want to delete this rule?'))) return
	try {
		await call('frappe.client.cancel', {
			doctype: 'Tutor Availability Rule',
			name,
		})
		toast({ title: __('Rule deleted successfully.'), variant: 'success' })
		await dashboardStore.dashboardData.submit()
	} catch (e) {
		console.error('Failed to delete rule:', e)
		toast({ title: __('Failed to delete rule.'), variant: 'error' })
	}
}
</script>
