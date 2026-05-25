<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header
			class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs class="h-7" :items="[{ label: __('Tutor Profile'), route: { name: 'TutorProfile' } }]" />
		</header>

		<div class="max-w-3xl mx-auto p-5 sm:p-8">
			<div v-if="loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-gray-400" />
			</div>

			<div v-else class="bg-surface-cards border border-outline-gray-2 rounded-xl p-6 space-y-6 shadow-sm">
				<div>
					<h2 class="text-lg font-semibold text-ink-gray-9">{{ __('Tutor Profile Details') }}</h2>
					<p class="text-sm text-ink-gray-5 mt-1">{{ __('Manage your tutoring profile details visible to students.') }}</p>
				</div>

				<form @submit.prevent="saveProfile" class="space-y-5">
					<!-- Basic Info -->
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label class="block text-xs font-semibold text-ink-gray-5 uppercase tracking-wider mb-1.5">{{ __('Display Name') }}</label>
							<input v-model="form.tutor_name" :disabled="isEdit" type="text" required
								placeholder="e.g. Dr. John Doe"
								class="w-full text-sm border border-outline-gray-2 rounded-lg p-2.5 bg-surface-gray-1 text-ink-gray-8 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed" />
						</div>
						<div>
							<label class="block text-xs font-semibold text-ink-gray-5 uppercase tracking-wider mb-1.5">{{ __('Timezone') }}</label>
							<input v-model="form.timezone" type="text" required placeholder="Asia/Kolkata"
								class="w-full text-sm border border-outline-gray-2 rounded-lg p-2.5 bg-surface-gray-1 text-ink-gray-8 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
						</div>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label class="block text-xs font-semibold text-ink-gray-5 uppercase tracking-wider mb-1.5">{{ __('Years of Experience') }}</label>
							<input v-model.number="form.years_of_experience" type="number" min="0" required
								placeholder="e.g. 5"
								class="w-full text-sm border border-outline-gray-2 rounded-lg p-2.5 bg-surface-gray-1 text-ink-gray-8 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
						</div>
						<div>
							<label class="block text-xs font-semibold text-ink-gray-5 uppercase tracking-wider mb-1.5">{{ __('Hourly Rate (INR)') }}</label>
							<input v-model.number="form.hourly_rate" type="number" min="1" required
								placeholder="e.g. 500"
								class="w-full text-sm border border-outline-gray-2 rounded-lg p-2.5 bg-surface-gray-1 text-ink-gray-8 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
						</div>
					</div>

					<div>
						<label class="block text-xs font-semibold text-ink-gray-5 uppercase tracking-wider mb-1.5">{{ __('Biography') }}</label>
						<textarea v-model="form.bio" rows="4"
							placeholder="Write a short summary about your background, credentials and tutoring approach..."
							class="w-full text-sm border border-outline-gray-2 rounded-lg p-2.5 bg-surface-gray-1 text-ink-gray-8 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" />
					</div>

					<!-- Subjects -->
					<div>
						<label class="block text-xs font-semibold text-ink-gray-5 uppercase tracking-wider mb-2">{{ __('Subjects Taught') }}</label>
						<div
							class="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-surface-gray-1 p-4 rounded-lg border border-outline-gray-2">
							<label v-for="sub in allSubjects" :key="sub"
								class="flex items-center gap-2 text-sm text-ink-gray-8 cursor-pointer select-none">
								<input type="checkbox" :value="sub" v-model="selectedSubjects"
									class="rounded border-outline-gray-2 text-blue-600 focus:ring-blue-500" />
								{{ sub }}
							</label>
							<p v-if="!allSubjects.length" class="text-xs text-ink-gray-4 col-span-full">{{ __('No subjects found.') }}</p>
						</div>
					</div>

					<!-- Boards -->
					<div>
						<label class="block text-xs font-semibold text-ink-gray-5 uppercase tracking-wider mb-2">{{ __('Boards Supported') }}</label>
						<div
							class="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-surface-gray-1 p-4 rounded-lg border border-outline-gray-2">
							<label v-for="brd in allBoards" :key="brd"
								class="flex items-center gap-2 text-sm text-ink-gray-8 cursor-pointer select-none">
								<input type="checkbox" :value="brd" v-model="selectedBoards"
									class="rounded border-outline-gray-2 text-blue-600 focus:ring-blue-500" />
								{{ brd }}
							</label>
							<p v-if="!allBoards.length" class="text-xs text-ink-gray-4 col-span-full">{{ __('No boards found.') }}</p>
						</div>
					</div>

					<!-- Classes -->
					<div>
						<label class="block text-xs font-semibold text-ink-gray-5 uppercase tracking-wider mb-2">{{ __('Classes Target') }}</label>
						<div
							class="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-surface-gray-1 p-4 rounded-lg border border-outline-gray-2">
							<label v-for="cls in allClasses" :key="cls"
								class="flex items-center gap-2 text-sm text-ink-gray-8 cursor-pointer select-none">
								<input type="checkbox" :value="cls" v-model="selectedClasses"
									class="rounded border-outline-gray-2 text-blue-600 focus:ring-blue-500" />
								{{ cls }}
							</label>
							<p v-if="!allClasses.length" class="text-xs text-ink-gray-4 col-span-full">{{ __('No classes found.') }}</p>
						</div>
					</div>

					<!-- Qualifications -->
					<div class="space-y-3 pt-2 border-t border-outline-gray-1">
						<label class="block text-xs font-semibold text-ink-gray-5 uppercase tracking-wider mt-2">{{ __('Qualifications') }}</label>

						<div v-if="qualifications.length" class="space-y-2">
							<div v-for="(q, idx) in qualifications" :key="idx"
								class="flex items-center justify-between bg-surface-gray-1 border border-outline-gray-2 rounded-lg px-4 py-3 text-sm text-ink-gray-8">
								<div class="flex gap-3 items-center">
									<span class="font-semibold">{{ q.degree }}</span>
									<span class="text-ink-gray-4">·</span>
									<span>{{ q.institution }}</span>
									<span class="text-ink-gray-4">·</span>
									<span class="font-medium text-ink-gray-6">{{ q.year }}</span>
								</div>
								<button type="button" @click="removeQualification(idx)"
									class="text-xs font-semibold text-red-500 hover:text-red-600 hover:underline ml-4 shrink-0">
									{{ __('Remove') }}
								</button>
							</div>
						</div>
						<div v-else
							class="text-sm text-ink-gray-4 bg-surface-gray-1 border border-dashed border-outline-gray-2 rounded-lg p-4 text-center">
							{{ __('No qualifications added yet. At least one is required.') }}
						</div>

						<!-- Add row -->
						<div class="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
							<input v-model="newQual.degree" type="text" placeholder="Degree"
								class="text-sm border border-outline-gray-2 rounded-lg p-2.5 bg-surface-gray-1 text-ink-gray-8 focus:outline-none focus:border-blue-500" />
							<input v-model="newQual.institution" type="text" placeholder="Institution"
								class="text-sm border border-outline-gray-2 rounded-lg p-2.5 bg-surface-gray-1 text-ink-gray-8 focus:outline-none focus:border-blue-500" />
							<input v-model.number="newQual.year" type="number" placeholder="Year"
								class="text-sm border border-outline-gray-2 rounded-lg p-2.5 bg-surface-gray-1 text-ink-gray-8 focus:outline-none focus:border-blue-500" />
							<Button type="button" variant="outline" @click="addQualification"
								class="rounded-lg text-xs font-semibold">
								{{ __('Add') }}
							</Button>
						</div>
					</div>

					<!-- Submit -->
					<div class="flex justify-end pt-4 border-t border-outline-gray-1">
						<Button :loading="saving" variant="solid" type="submit"
							class="rounded-lg text-xs font-semibold px-5">
							{{ isEdit ? __('Update Profile') : __('Create Profile') }}
						</Button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup>
import { inject, onMounted, reactive, ref } from 'vue'
import { Breadcrumbs, LoadingIndicator, Button, call, toast } from 'frappe-ui'

const user = inject('$user')

const loading = ref(true)
const saving = ref(false)
const isEdit = ref(false)

const allSubjects = ref([])
const allBoards = ref([])
const allClasses = ref([])

const selectedSubjects = ref([])
const selectedBoards = ref([])
const selectedClasses = ref([])

const qualifications = ref([])
const newQual = reactive({ degree: '', institution: '', year: '' })

const form = reactive({
	tutor_name: '',
	bio: '',
	years_of_experience: 1,
	hourly_rate: 500,
	timezone: 'Asia/Kolkata',
})

onMounted(async () => {
	await loadFormOptions()
	await fetchProfile()
})

async function loadFormOptions() {
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
	}
}

async function fetchProfile() {
	loading.value = true
	try {
		if (user.data?.name) {
			const tutorRes = await call('frappe.client.get_list', {
				doctype: 'Tutor Profile',
				filters: { user: user.data.name },
				fields: ['name', 'tutor_name', 'bio', 'years_of_experience', 'hourly_rate', 'timezone'],
			})
			if (tutorRes && tutorRes.length) {
				const profile = tutorRes[0]
				isEdit.value = true
				Object.assign(form, {
					tutor_name: profile.tutor_name,
					bio: profile.bio || '',
					years_of_experience: profile.years_of_experience,
					hourly_rate: profile.hourly_rate || 500,
					timezone: profile.timezone || 'Asia/Kolkata',
				})
				const doc = await call('frappe.client.get', {
					doctype: 'Tutor Profile',
					name: profile.name,
				})
				if (doc) {
					selectedSubjects.value = doc.subjects ? doc.subjects.map((s) => s.subject) : []
					selectedBoards.value = doc.boards ? doc.boards.map((b) => b.board) : []
					selectedClasses.value = doc.classes ? doc.classes.map((c) => c.class) : []
					qualifications.value = doc.qualifications
						? doc.qualifications.map((q) => ({
							degree: q.degree,
							institution: q.institution,
							year: q.year,
						}))
						: []
				}
			}
		}
	} catch (e) {
		console.error('Failed to load profile:', e)
	} finally {
		loading.value = false
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
			isEdit.value = true
			await fetchProfile()
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
