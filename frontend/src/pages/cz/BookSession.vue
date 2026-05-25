<template>
	<!-- Booking flow when a tutor is selected via ?tutor= query param -->
	<div v-if="tutorName">
		<LayoutHeader>
			<template #left-header>
				<Breadcrumbs :items="breadcrumbItems" />
			</template>
		</LayoutHeader>

		<div class="p-5 pb-10">
			<div v-if="tutorDetails.loading" class="flex justify-center py-20">
				<LoadingIndicator class="w-8 h-8 text-ink-gray-4" />
			</div>
			<div v-else-if="tutorDetails.data">
				<BookingFlow :tutor="tutorDetails.data" />
			</div>
			<EmptyStateLayout
				v-else
				name="Tutor"
				:title="__('Failed to load tutor details')"
				:description="__('Please go back and select a tutor.')"
			/>
		</div>
	</div>

	<!-- Tutor discovery listing when no tutor is selected -->
	<div v-else>
		<LayoutHeader>
			<template #left-header>
				<Breadcrumbs :items="breadcrumbItems" />
			</template>
			<template #right-header>
				<!-- Inline filter bar: exactly matches Batches header pattern -->
				<div class="flex items-center gap-2 flex-wrap">
					<FormControl
						v-model="localFilters.tutor"
						:placeholder="__('Search by Tutor')"
						type="text"
						class="min-w-36"
					/>
					<Select
						v-model="localFilters.subject"
						:options="subjectOptions"
						:placeholder="__('Subject')"
						class="min-w-28"
					/>
					<Select
						v-model="localFilters.class_name"
						:options="classOptions"
						:placeholder="__('Class')"
						class="min-w-28"
					/>
					<Select
						v-model="localFilters.board"
						:options="boardOptions"
						:placeholder="__('Board')"
						class="min-w-28"
					/>
					<Button variant="solid" @click="onSearch">
						<template #prefix>
							<Search class="size-4 stroke-1.5" />
						</template>
						{{ __('Search') }}
					</Button>
					<Button
						v-if="hasActiveFilters"
						variant="ghost"
						@click="clearFilters"
					>
						{{ __('Clear') }}
					</Button>
				</div>
			</template>
		</LayoutHeader>

		<div class="p-5 pb-10">
			<!-- Title row like "All Batches" -->
			<div class="mb-5">
				<div class="text-lg font-semibold text-ink-gray-9">{{ __('All Tutors') }}</div>
			</div>

			<!-- Skeleton while loading -->
			<div
				v-if="tutorsList.loading"
				class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				<div
					v-for="i in 8"
					:key="i"
					class="rounded-xl border border-outline-gray-2 bg-surface-white p-5 space-y-4 animate-pulse"
				>
					<div class="flex justify-between border-b border-outline-gray-1 pb-3">
						<div class="space-y-2">
							<div class="h-4 w-32 rounded bg-surface-gray-3"></div>
							<div class="h-3 w-20 rounded bg-surface-gray-2"></div>
						</div>
						<div class="h-3 w-16 rounded bg-surface-gray-2 mt-1"></div>
					</div>
					<div class="space-y-1.5">
						<div class="h-3 w-full rounded bg-surface-gray-2"></div>
						<div class="h-3 w-5/6 rounded bg-surface-gray-2"></div>
					</div>
					<div class="flex gap-1.5 pt-3 border-t border-outline-gray-1 border-dashed">
						<div class="h-5 w-14 rounded bg-surface-gray-2"></div>
						<div class="h-5 w-16 rounded bg-surface-gray-3"></div>
					</div>
					<div class="flex justify-between pt-3 border-t border-outline-gray-1 mt-auto">
						<div class="h-4 w-20 rounded bg-surface-gray-3"></div>
						<div class="h-7 w-16 rounded bg-surface-gray-3"></div>
					</div>
				</div>
			</div>

			<!-- Tutor grid -->
			<div
				v-else-if="allTutors.length"
				class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				<TutorCard
					v-for="tutor in allTutors"
					:key="tutor.name"
					:tutor="tutor"
				/>
			</div>

			<!-- Empty state exactly as LMS pattern -->
			<EmptyStateLayout
				v-else
				name="Tutors"
				:title="__('No Tutors Found')"
				:description="__('Try changing the filters to find tutors.')"
			/>

			<!-- Load More -->
			<div
				v-if="!tutorsList.loading && hasMore"
				class="mt-5 flex justify-center"
			>
				<Button @click="loadMore">
					{{ __('Load More') }}
				</Button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
	Breadcrumbs,
	Button,
	FormControl,
	LoadingIndicator,
	Select,
	createResource,
	usePageMeta,
} from 'frappe-ui'
import { Search } from 'lucide-vue-next'
import LayoutHeader from '@/components/Layouts/LayoutHeader.vue'
import EmptyStateLayout from '@/components/Layouts/EmptyStateLayout.vue'
import TutorCard from '@/components/cz/TutorCard.vue'
import BookingFlow from '@/components/cz/BookingFlow.vue'
import {
	filterState,
	tutorsList,
	subjectsList,
	boardsList,
	classesList,
} from '@/resources/bookTutor'

const route = useRoute()

// ── Breadcrumbs ────────────────────────────────────────────────────────────
const tutorName = computed(() => route.query.tutor)

const breadcrumbItems = computed(() => {
	const items = [{ label: __('Book a Tutor'), route: { name: 'BookSession' } }]
	if (tutorName.value && tutorDetails.data) {
		items.push({
			label: tutorDetails.data.tutor_name,
			route: { name: 'BookSession', query: { tutor: tutorName.value } },
		})
	}
	return items
})

// ── Tutor detail resource (booking flow) ───────────────────────────────────
const tutorDetails = createResource({
	url: 'frappe.client.get',
	makeParams() {
		return { doctype: 'Tutor Profile', name: tutorName.value }
	},
})

watch(
	tutorName,
	(v) => { if (v) tutorDetails.submit() },
	{ immediate: true }
)

// ── Inline filter state (local, committed on Search click) ─────────────────
const localFilters = reactive({
	tutor: filterState.tutor,
	subject: filterState.subject,
	class_name: filterState.class_name,
	board: filterState.board,
})

const hasActiveFilters = computed(() =>
	!!(localFilters.tutor || localFilters.subject || localFilters.class_name || localFilters.board)
)

// ── Select option helpers ──────────────────────────────────────────────────
function toOptions(data, emptyLabel) {
	const base = [{ label: emptyLabel, value: '' }]
	if (!data) return base
	return base.concat(data.map((o) => ({ label: o.label, value: o.value })))
}

const subjectOptions = computed(() => toOptions(subjectsList.data))
const classOptions   = computed(() => toOptions(classesList.data))
const boardOptions   = computed(() => toOptions(boardsList.data))

// ── Search (manual trigger) ────────────────────────────────────────────────
function onSearch() {
	filterState.tutor      = localFilters.tutor
	filterState.subject    = localFilters.subject
	filterState.class_name = localFilters.class_name
	filterState.board      = localFilters.board
	filterState.page       = 1
	allTutors.value = []
	tutorsList.submit()
}

function clearFilters() {
	localFilters.tutor = localFilters.subject = localFilters.class_name = localFilters.board = ''
	onSearch()
}

// ── Tutor list with infinite scroll accumulation ───────────────────────────
const allTutors = ref([])

const hasMore = computed(
	() => !tutorsList.loading && (tutorsList.data?.length ?? 0) === filterState.page_length
)

watch(
	() => tutorsList.data,
	(data) => {
		if (!data) return
		if (filterState.page === 1) {
			allTutors.value = [...data]
		} else {
			const seen = new Set(allTutors.value.map((t) => t.name))
			allTutors.value.push(...data.filter((t) => !seen.has(t.name)))
		}
	}
)

function loadMore() {
	filterState.page += 1
	tutorsList.submit()
}

onMounted(() => {
	if (!allTutors.value.length) tutorsList.submit()
})

usePageMeta(() => ({ title: __('Book a Tutor') }))
</script>
