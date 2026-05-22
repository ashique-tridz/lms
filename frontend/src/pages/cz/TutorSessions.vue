<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs class="h-7" :items="[{ label: __('My Sessions'), route: { name: 'TutorSessions' } }]" />
		</header>

		<div class="max-w-6xl mx-auto p-5 sm:p-8 space-y-6">
			<div v-if="loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-gray-400" />
			</div>

			<div v-else-if="!tutorName" class="text-center py-20 bg-white border border-gray-200 rounded-xl shadow-sm">
				<p class="text-gray-500 text-sm mb-4">{{ __('No Tutor Profile linked to your user account.') }}</p>
				<router-link :to="{ name: 'TutorProfile' }" class="text-sm font-semibold text-blue-600 hover:underline">
					{{ __('Create Tutor Profile') }}
				</router-link>
			</div>

			<div v-else class="space-y-8">
				<!-- Upcoming Sessions -->
				<div class="space-y-4">
					<h2 class="text-lg font-semibold text-gray-900">{{ __('Upcoming Sessions') }}</h2>
					<div v-if="upcomingBookings.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div
							v-for="b in upcomingBookings"
							:key="b.name"
							class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
						>
							<div class="flex justify-between items-start pb-3 border-b border-gray-100">
								<div>
									<h4 class="font-semibold text-gray-900 text-base">{{ b.student }}</h4>
									<p class="text-xs text-gray-500 mt-1">
										<span class="font-semibold text-gray-400 uppercase tracking-wider text-[10px] mr-1">{{ __('Scheduled') }}:</span>
										{{ formatTime(b.locked_at || b.confirmed_at) }}
									</p>
								</div>
								<Badge label="Confirmed" theme="blue" size="sm" />
							</div>

							<div class="grid grid-cols-3 gap-2 text-xs">
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Subject') }}</span>
									<span class="font-semibold text-gray-800">{{ b.subject || '—' }}</span>
								</div>
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Board') }}</span>
									<span class="font-semibold text-gray-800">{{ b.board || '—' }}</span>
								</div>
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Class') }}</span>
									<span class="font-semibold text-gray-800">{{ b.class || '—' }}</span>
								</div>
							</div>

							<div>
								<a
									v-if="b.meeting_link"
									:href="b.meeting_link"
									target="_blank"
									class="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150 shadow-sm"
								>
									<Video class="w-3.5 h-3.5" />
									{{ __('Launch Class') }}
								</a>
								<span v-else class="text-xs text-gray-400 italic">
									{{ __('Meeting link generating...') }}
								</span>
							</div>
						</div>
					</div>
					<div v-else class="text-sm text-gray-500 py-8 text-center bg-white border border-dashed border-gray-200 rounded-xl">
						{{ __('No upcoming sessions booked.') }}
					</div>
				</div>

				<!-- Past Sessions -->
				<div class="space-y-4">
					<h2 class="text-lg font-semibold text-gray-900">{{ __('Past Sessions') }}</h2>
					<div v-if="pastBookings.length" class="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div
							v-for="b in pastBookings"
							:key="b.name"
							class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4"
						>
							<div class="flex justify-between items-start pb-3 border-b border-gray-100">
								<div>
									<h4 class="font-semibold text-gray-900 text-base">{{ b.student }}</h4>
									<p class="text-xs text-gray-500 mt-1">
										<span class="font-semibold text-gray-400 uppercase tracking-wider text-[10px] mr-1">{{ __('Concluded') }}:</span>
										{{ formatTime(b.locked_at || b.confirmed_at) }}
									</p>
								</div>
								<Badge
									:label="b.booking_status"
									:theme="b.booking_status === 'Completed' ? 'green' : 'gray'"
									size="sm"
								/>
							</div>

							<div class="grid grid-cols-3 gap-2 text-xs">
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Subject') }}</span>
									<span class="font-semibold text-gray-800">{{ b.subject || '—' }}</span>
								</div>
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Board') }}</span>
									<span class="font-semibold text-gray-800">{{ b.board || '—' }}</span>
								</div>
								<div>
									<span class="text-gray-400 block mb-0.5 uppercase tracking-wider text-[10px]">{{ __('Class') }}</span>
									<span class="font-semibold text-gray-800">{{ b.class || '—' }}</span>
								</div>
							</div>

							<div v-if="b.ai_summary">
								<Button
									@click="viewSummary(b)"
									variant="outline"
									class="rounded-lg text-xs font-semibold"
								>
									{{ __('AI Meeting Audit') }}
								</Button>
							</div>
						</div>
					</div>
					<div v-else class="text-sm text-gray-500 py-8 text-center bg-white border border-dashed border-gray-200 rounded-xl">
						{{ __('No past sessions found.') }}
					</div>
				</div>
			</div>
		</div>

		<!-- AI Audit Dialog -->
		<Dialog
			v-model="showAuditModal"
			:options="{
				title: `${__('AI Session Summary')} — ${selectedBooking?.student}`,
				size: 'lg',
			}"
		>
			<template #body-content>
				<div class="space-y-4 p-4">
					<div>
						<p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{{ __('AI Summary') }}</p>
						<div class="bg-surface-gray-1 border border-outline-gray-2 rounded-lg p-4 text-sm text-ink-gray-8 leading-relaxed whitespace-pre-wrap">
							{{ selectedBooking?.ai_summary }}
						</div>
					</div>
					<div v-if="selectedBooking?.ai_transcript">
						<p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{{ __('AI Transcript') }}</p>
						<div class="bg-surface-gray-1 border border-outline-gray-2 rounded-lg p-4 text-sm text-ink-gray-8 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
							{{ selectedBooking?.ai_transcript }}
						</div>
					</div>
				</div>
			</template>
		</Dialog>
	</div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { Breadcrumbs, LoadingIndicator, Dialog, Button, Badge, call } from 'frappe-ui'
import { Video } from 'lucide-vue-next'

const user = inject('$user')
const dayjs = inject('$dayjs')

const loading = ref(true)
const tutorName = ref('')
const upcomingBookings = ref([])
const pastBookings = ref([])

const showAuditModal = ref(false)
const selectedBooking = ref(null)

onMounted(async () => {
	await fetchTutorAndSessions()
})

async function fetchTutorAndSessions() {
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
				const bkRes = await call('frappe.client.get_list', {
					doctype: 'Session Booking',
					filters: { tutor: tutorName.value },
					fields: [
						'name', 'student', 'subject', 'board', 'class',
						'locked_at', 'confirmed_at', 'booking_status',
						'meeting_link', 'ai_summary', 'ai_transcript',
					],
					order_by: 'confirmed_at desc',
					limit: 100,
				})
				upcomingBookings.value = bkRes.filter((b) => b.booking_status === 'Confirmed')
				pastBookings.value = bkRes.filter(
					(b) =>
						b.booking_status === 'Completed' ||
						b.booking_status === 'Cancelled' ||
						b.booking_status === 'Expired'
				)
			}
		}
	} catch (e) {
		console.error('Failed to load sessions:', e)
	} finally {
		loading.value = false
	}
}

function formatTime(utcTime) {
	if (!utcTime || !dayjs) return 'N/A'
	return dayjs.utc(utcTime).local().format('DD MMM YYYY, hh:mm A')
}

function viewSummary(booking) {
	selectedBooking.value = booking
	showAuditModal.value = true
}
</script>
