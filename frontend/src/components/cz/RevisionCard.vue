<template>
	<div class="flex flex-col border rounded-md p-4 bg-surface-white hover:border-outline-gray-3 transition-colors">
		<div class="flex items-start justify-between pb-3 border-b">
			<div>
				<h4 class="font-bold text-base text-ink-gray-9">
					{{ recommendation.lesson }}
				</h4>
				<p class="text-xs text-ink-gray-5 mt-1 uppercase tracking-wider text-[10px]">
					{{ __('Recommended') }}: {{ formatDate(recommendation.recommended_on) }}
				</p>
			</div>
			<div class="flex gap-2">
				<span
					class="border px-2.5 py-0.5 text-xs rounded-full font-medium"
					:class="priorityClasses"
				>
					{{ recommendation.priority }}
				</span>
				<span
					class="border px-2.5 py-0.5 text-xs rounded-full font-medium"
					:class="statusClasses"
				>
					{{ recommendation.status }}
				</span>
			</div>
		</div>

		<div class="text-sm text-ink-gray-8 space-y-4 py-4">
			<div>
				<span class="font-bold text-[10px] uppercase tracking-wider text-ink-gray-4 block mb-1.5">{{ __('Reason') }}</span>
				<p class="leading-relaxed bg-surface-gray-2 p-3 border rounded-md text-ink-gray-7 text-xs font-normal">
					{{ recommendation.recommendation_reason }}
				</p>
			</div>
		</div>

		<div class="pt-4 border-t">
			<Button
				:loading="resolving"
				@click="goToLesson"
				variant="solid"
				class="w-full justify-center py-2 text-xs font-semibold"
			>
				{{ __('Revise Lesson') }}
			</Button>
		</div>
	</div>
</template>

<script setup>
import { computed, inject, ref } from 'vue'
import { Button } from 'frappe-ui'
import { call } from 'frappe-ui'
import { useRouter } from 'vue-router'

const props = defineProps({
	recommendation: {
		type: Object,
		required: true,
	},
})

const dayjs = inject('$dayjs')
const resolving = ref(false)
const router = useRouter()

const priorityClasses = computed(() => {
	switch (props.recommendation.priority) {
		case 'High':
			return 'border-red-200 bg-red-50 text-red-700 font-semibold'
		case 'Medium':
			return 'border-amber-200 bg-amber-50 text-amber-700 font-semibold'
		case 'Low':
		default:
			return 'border-gray-200 bg-gray-50 text-gray-600'
	}
})

const statusClasses = computed(() => {
	switch (props.recommendation.status) {
		case 'Completed':
			return 'border-green-200 bg-green-50 text-green-700 font-semibold'
		case 'In Progress':
			return 'border-blue-200 bg-blue-50 text-blue-700'
		default:
			return 'border-gray-200 bg-gray-50 text-gray-600'
	}
})

function formatDate(dateStr) {
	if (!dateStr || !dayjs) return 'N/A'
	return dayjs(dateStr).format('DD MMM YYYY')
}

async function goToLesson() {
	resolving.value = true
	try {
		const lessonName = props.recommendation.lesson
		const response = await call('frappe.client.get', {
			doctype: 'Course Lesson',
			name: lessonName,
		})
		
		if (response) {
			const course = response.course
			const refResponse = await call('frappe.client.get_list', {
				doctype: 'Lesson Reference',
				filters: { lesson: lessonName },
				fields: ['parent', 'idx'],
				limit: 1
			})
			if (refResponse && refResponse.length) {
				const chapterName = refResponse[0].parent
				const lessonIdx = refResponse[0].idx
				
				const chapResponse = await call('frappe.client.get_list', {
					doctype: 'Chapter Reference',
					filters: { chapter: chapterName, parent: course },
					fields: ['idx'],
					limit: 1
				})
				if (chapResponse && chapResponse.length) {
					const chapIdx = chapResponse[0].idx
					const lessonNumber = `${chapIdx}-${lessonIdx}`
					router.push({
						name: 'Lesson',
						params: {
							courseName: course,
							lessonNumber: lessonNumber
						}
					})
				}
			}
		}
	} catch (e) {
		console.error("Failed to navigate to lesson:", e)
	} finally {
		resolving.value = false
	}
}
</script>
