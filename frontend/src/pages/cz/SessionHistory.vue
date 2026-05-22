<template>
	<div class="min-h-screen bg-surface-gray-1">
		<header class="sticky top-0 z-10 flex items-center justify-between border-b bg-surface-white px-3 py-2.5 sm:px-5">
			<Breadcrumbs
				class="h-7"
				:items="[
					{ label: __('Sessions'), route: { name: 'Sessions' } },
					{ label: __('History'), route: { name: 'SessionHistory' } }
				]"
			/>
		</header>

		<div class="max-w-6xl mx-auto p-5 sm:p-8 space-y-6">
			<h2 class="text-2xl font-bold text-ink-gray-9">
				{{ __('Session History') }}
			</h2>

			<div v-if="sessionStore.bookingHistoryFetcher.loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-10 h-10 text-gray-400" />
			</div>
			<div v-else-if="sessionStore.sessions && sessionStore.sessions.length" class="bg-surface-cards rounded-lg border border-outline-gray-2 shadow-sm overflow-hidden">
				<table class="w-full text-left border-collapse text-sm text-ink-gray-8">
					<thead>
						<tr class="bg-surface-gray-1 border-b border-outline-gray-2 text-ink-gray-5 font-semibold">
							<th class="p-4">{{ __('ID') }}</th>
							<th class="p-4">{{ __('Tutor') }}</th>
							<th class="p-4">{{ __('Booking Date') }}</th>
							<th class="p-4">{{ __('Amount') }}</th>
							<th class="p-4">{{ __('Status') }}</th>
							<th class="p-4">{{ __('Payment') }}</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="session in sessionStore.sessions"
							:key="session.name"
							class="border-b border-outline-gray-1 hover:bg-surface-gray-1/50 transition-colors"
						>
							<td class="p-4 font-mono font-medium text-ink-gray-7">{{ session.name }}</td>
							<td class="p-4">{{ session.tutor }}</td>
							<td class="p-4">{{ formatDate(session.locked_at || session.confirmed_at) }}</td>
							<td class="p-4">{{ session.amount }} {{ session.currency }}</td>
							<td class="p-4">
								<Badge :theme="getStatusTheme(session.booking_status)" size="sm">
									{{ session.booking_status }}
								</Badge>
							</td>
							<td class="p-4">
								<Badge :theme="getPaymentTheme(session.payment_status)" size="sm">
									{{ session.payment_status }}
								</Badge>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<div v-else class="text-center py-20 text-ink-gray-5 bg-surface-cards border border-outline-gray-2 rounded-lg shadow-sm">
				{{ __('You have no session bookings yet.') }}
			</div>
		</div>
	</div>
</template>

<script setup>
import { inject, onMounted } from 'vue'
import { Breadcrumbs, LoadingIndicator, Badge } from 'frappe-ui'
import { useSessionStore } from '@/stores/useSessionStore'

const dayjs = inject('$dayjs')
const sessionStore = useSessionStore()

onMounted(() => {
	sessionStore.fetchHistory()
})

function formatDate(dateStr) {
	if (!dateStr || !dayjs) return 'N/A'
	return dayjs(dateStr).format('DD MMM YYYY, hh:mm A')
}

function getStatusTheme(status) {
	switch (status) {
		case 'Confirmed':
			return 'green'
		case 'Completed':
			return 'blue'
		case 'Pending Payment':
			return 'orange'
		case 'Cancelled':
		case 'Expired':
			return 'red'
		default:
			return 'gray'
	}
}

function getPaymentTheme(status) {
	switch (status) {
		case 'Captured':
			return 'green'
		case 'Pending':
			return 'orange'
		case 'Failed':
			return 'red'
		default:
			return 'gray'
	}
}
</script>
