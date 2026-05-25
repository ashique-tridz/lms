<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs class="h-7" :items="[{ label: __('Tutor Profile'), route: { name: 'TutorProfile' } }]" />
		</header>

		<div class="max-w-3xl mx-auto p-5 sm:p-8">
			<!-- Loading State -->
			<div v-if="dashboardStore.dashboardData.loading || loadingOptions" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-gray-400" />
			</div>

			<!-- Empty State: No Profile and Not Creating -->
			<div v-else-if="!profile && !isCreating" class="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
				<div class="flex flex-col items-center justify-center space-y-2">
					<div class="p-3 bg-gray-50 rounded-full">
						<User class="w-8 h-8 text-gray-400 stroke-1.5" />
					</div>
					<h3 class="text-lg font-medium text-gray-900">{{ __('No Tutor Profile linked to your account') }}</h3>
					<p class="text-sm text-gray-500 max-w-sm">
						{{ __('Create a tutor profile to start configuring availability rules and taking bookings.') }}
					</p>
				</div>
				<Button
					@click="isCreating = true"
					variant="solid"
					class="font-semibold text-xs mt-2"
				>
					{{ __('Create Tutor Profile') }}
				</Button>
			</div>

			<!-- Profile Edit/View Form -->
			<div v-else class="bg-white border border-gray-200 rounded-xl p-6 space-y-6 shadow-sm">
				<!-- Header Notice if Profile is Verified -->
				<div class="flex justify-between items-start">
					<div>
						<h2 class="text-lg font-bold text-gray-900">{{ __('Tutor Profile Details') }}</h2>
						<p class="text-sm text-gray-500 mt-1">{{ __('Manage your tutoring profile details visible to students.') }}</p>
					</div>
					<Badge
						v-if="profile"
						:label="profile.verification_status"
						:theme="profile.verification_status === 'Verified' ? 'green' : 'gray'"
						size="sm"
					/>
				</div>

				<!-- Lock Notice -->
				<div
					v-if="profile && profile.verification_status === 'Verified'"
					class="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-start gap-2.5"
				>
					<Lock class="w-4 h-4 mt-0.5 shrink-0" />
					<div>
						<span class="font-semibold">{{ __('Profile verified') }}</span>. 
						{{ __('Contact administrator to modify profile.') }}
					</div>
				</div>

				<form @submit.prevent="saveProfile" class="space-y-5">
					<!-- Basic Info -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('Display Name') }}</label>
							<input
								v-model="form.tutor_name"
								:disabled="isReadOnly"
								type="text"
								required
								placeholder="e.g. Dr. John Doe"
								class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
							/>
						</div>
						<div>
							<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('Timezone') }}</label>
							<select
								v-model="form.timezone"
								:disabled="isReadOnly"
								required
								class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
							>
								<option v-for="tz in timezoneOptions" :key="tz" :value="tz">{{ tz }}</option>
							</select>
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('Years of Experience') }}</label>
							<input
								v-model.number="form.years_of_experience"
								:disabled="isReadOnly"
								type="number"
								min="0"
								required
								placeholder="e.g. 5"
								class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
							/>
						</div>
						<div>
							<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('Hourly Rate (INR)') }}</label>
							<input
								v-model.number="form.hourly_rate"
								:disabled="isReadOnly"
								type="number"
								min="1"
								required
								placeholder="e.g. 500"
								class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
							/>
						</div>
					</div>

					<div>
						<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{{ __('Biography') }}</label>
						<textarea
							v-model="form.bio"
							:disabled="isReadOnly"
							rows="4"
							placeholder="Write a short summary about your background, credentials and tutoring approach..."
							class="w-full text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
						/>
					</div>

					<!-- Subjects -->
					<div>
						<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ __('Subjects Taught') }}</label>
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
							<label
								v-for="sub in allSubjects"
								:key="sub"
								class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
							>
								<input
									type="checkbox"
									:value="sub"
									v-model="selectedSubjects"
									:disabled="isReadOnly"
									class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
								/>
								{{ sub }}
							</label>
							<p v-if="!allSubjects.length" class="text-xs text-gray-400 col-span-full">{{ __('No subjects found.') }}</p>
						</div>
					</div>

					<!-- Boards -->
					<div>
						<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ __('Boards Supported') }}</label>
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
							<label
								v-for="brd in allBoards"
								:key="brd"
								class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
							>
								<input
									type="checkbox"
									:value="brd"
									v-model="selectedBoards"
									:disabled="isReadOnly"
									class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
								/>
								{{ brd }}
							</label>
							<p v-if="!allBoards.length" class="text-xs text-gray-400 col-span-full">{{ __('No boards found.') }}</p>
						</div>
					</div>

					<!-- Classes -->
					<div>
						<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ __('Classes Target') }}</label>
						<div class="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
							<label
								v-for="cls in allClasses"
								:key="cls"
								class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none"
							>
								<input
									type="checkbox"
									:value="cls"
									v-model="selectedClasses"
									:disabled="isReadOnly"
									class="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
								/>
								{{ cls }}
							</label>
							<p v-if="!allClasses.length" class="text-xs text-gray-400 col-span-full">{{ __('No classes found.') }}</p>
						</div>
					</div>

					<!-- Qualifications -->
					<div class="space-y-3 pt-2 border-t border-gray-200">
						<label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mt-2">{{ __('Qualifications') }}</label>

						<div v-if="qualifications.length" class="space-y-2">
							<div
								v-for="(q, idx) in qualifications"
								:key="idx"
								class="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700"
							>
								<div class="flex gap-3 items-center">
									<span class="font-semibold text-gray-900">{{ q.degree }}</span>
									<span class="text-gray-400">·</span>
									<span>{{ q.institution }}</span>
									<span class="text-gray-400">·</span>
									<span class="font-medium text-gray-500">{{ q.year }}</span>
								</div>
								<button
									v-if="!isReadOnly"
									type="button"
									@click="removeQualification(idx)"
									class="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline ml-4 shrink-0"
								>
									{{ __('Remove') }}
								</button>
							</div>
						</div>
						<div
							v-else
							class="text-sm text-gray-400 bg-gray-50 border border-dashed border-gray-200 rounded-lg p-4 text-center"
						>
							{{ __('No qualifications added yet. At least one is required.') }}
						</div>

						<!-- Add row -->
						<div v-if="!isReadOnly" class="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
							<input
								v-model="newQual.degree"
								type="text"
								placeholder="Degree"
								class="text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500"
							/>
							<input
								v-model="newQual.institution"
								type="text"
								placeholder="Institution"
								class="text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500"
							/>
							<input
								v-model.number="newQual.year"
								type="number"
								placeholder="Year"
								class="text-sm border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-800 focus:outline-none focus:border-blue-500"
							/>
							<Button
								type="button"
								variant="outline"
								@click="addQualification"
								class="rounded-lg text-xs font-semibold"
							>
								{{ __('Add') }}
							</Button>
						</div>
					</div>

					<!-- Submit -->
					<div v-if="!isReadOnly" class="flex justify-end pt-4 border-t border-gray-200">
						<Button
							:loading="saving"
							variant="solid"
							type="submit"
							class="rounded-lg text-xs font-semibold px-5"
						>
							{{ profile ? __('Update Profile') : __('Create Profile') }}
						</Button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { Breadcrumbs, LoadingIndicator, Button, Badge, call, toast } from 'frappe-ui'
import { useTutorDashboardStore } from '@/stores/useTutorDashboardStore'
import { getTimezones } from '@/utils'
import { User, Lock } from 'lucide-vue-next'

const dashboardStore = useTutorDashboardStore()

const loadingOptions = ref(true)
const saving = ref(false)
const isCreating = ref(false)

const allSubjects = ref([])
const allBoards = ref([])
const allClasses = ref([])

const selectedSubjects = ref([])
const selectedBoards = ref([])
const selectedClasses = ref([])

const qualifications = ref([])
const newQual = reactive({ degree: '', institution: '', year: '' })
const timezoneOptions = getTimezones()

const form = reactive({
	tutor_name: '',
	bio: '',
	years_of_experience: 1,
	hourly_rate: 500,
	timezone: 'Asia/Kolkata',
})

const profile = computed(() => dashboardStore.dashboardData.data?.profile)

const isReadOnly = computed(() => {
	return profile.value?.verification_status === 'Verified'
})

onMounted(async () => {
	await loadFormOptions()
	await dashboardStore.dashboardData.submit()
	syncForm()
})

watch(profile, () => {
	syncForm()
})

function syncForm() {
	if (profile.value) {
		Object.assign(form, {
			tutor_name: profile.value.tutor_name,
			bio: profile.value.bio || '',
			years_of_experience: profile.value.years_of_experience,
			hourly_rate: profile.value.hourly_rate || 500,
			timezone: profile.value.timezone || 'Asia/Kolkata',
		})
		selectedSubjects.value = profile.value.subjects ? profile.value.subjects.map((s) => s.subject) : []
		selectedBoards.value = profile.value.boards ? profile.value.boards.map((b) => b.board) : []
		selectedClasses.value = profile.value.classes ? profile.value.classes.map((c) => c.class) : []
		qualifications.value = profile.value.qualifications
			? profile.value.qualifications.map((q) => ({
				degree: q.degree,
				institution: q.institution,
				year: q.year,
			}))
			: []
	}
}

async function loadFormOptions() {
	loadingOptions.value = true
	try {
		const [subRes, brdRes, clsRes] = await Promise.all([
			call('frappe.client.get_list', { doctype: 'Subject', fields: ['name'], limit: 100 }),
			call('frappe.client.get_list', { doctype: 'Board', fields: ['name'], limit: 100 }),
			call('frappe.client.get_list', { doctype: 'Class', fields: ['name'], limit: 100 }),
		])
		allSubjects.value = subRes ? subRes.map((r) => r.name) : []
		allBoards.value = brdRes ? brdRes.map((r) => r.name) : []
		allClasses.value = clsRes ? clsRes.map((r) => r.name) : []
	} catch (e) {
		console.error('Failed to load options:', e)
	} finally {
		loadingOptions.value = false
	}
}

function addQualification() {
	if (!newQual.degree || !newQual.institution || !newQual.year) {
		toast({ title: __('Please fill in degree, institution and year.'), variant: 'warning' })
		return
	}
	qualifications.value.push({
		degree: newQual.degree,
		institution: newQual.institution,
		year: parseInt(newQual.year),
	})
	newQual.degree = ''
	newQual.institution = ''
	newQual.year = ''
}

function removeQualification(index) {
	qualifications.value.splice(index, 1)
}

async function saveProfile() {
	if (!qualifications.value.length) {
		toast({ title: __('At least one qualification is required.'), variant: 'warning' })
		return
	}
	saving.value = true
	try {
		const res = await call('smart_learning.api.tutor_api.save_tutor_profile', {
			tutor_name: form.tutor_name,
			bio: form.bio,
			years_of_experience: form.years_of_experience,
			hourly_rate: form.hourly_rate,
			timezone: form.timezone,
			subjects: JSON.stringify(selectedSubjects.value),
			boards: JSON.stringify(selectedBoards.value),
			classes: JSON.stringify(selectedClasses.value),
			qualifications: JSON.stringify(qualifications.value),
		})
		if (res && res.success) {
			toast({ title: res.message, variant: 'success' })
			isCreating.value = false
			await dashboardStore.dashboardData.submit()
		} else {
			toast({ title: res.error || __('Failed to save profile.'), variant: 'error' })
		}
	} catch (e) {
		console.error('Failed to save profile:', e)
		toast({ title: __('An error occurred while saving.'), variant: 'error' })
	} finally {
		saving.value = false
	}
}
</script>
