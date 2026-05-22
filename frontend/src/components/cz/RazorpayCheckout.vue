<template>
	<!-- Headless Razorpay integration wrapper -->
</template>

<script setup>
import { onMounted, watch } from 'vue'

const props = defineProps({
	checkoutDetails: {
		type: Object,
		default: null,
	},
})

const emit = defineEmits(['success', 'failure'])

function loadRazorpay() {
	return new Promise((resolve) => {
		if (window.Razorpay) {
			resolve(true)
			return
		}
		const script = document.createElement('script')
		script.src = 'https://checkout.razorpay.com/v1/checkout.js'
		script.onload = () => resolve(true)
		script.onerror = () => resolve(false)
		document.body.appendChild(script)
	})
}

async function startPayment() {
	if (!props.checkoutDetails) return
	
	const loaded = await loadRazorpay()
	if (!loaded) {
		emit('failure', {
			reason: 'Failed to load Razorpay SDK',
		})
		return
	}

	const options = {
		key: props.checkoutDetails.key_id,
		amount: props.checkoutDetails.amount,
		currency: props.checkoutDetails.currency,
		name: 'Curiozee Marketplace',
		description: props.checkoutDetails.description,
		order_id: props.checkoutDetails.order_id,
		handler: function (response) {
			emit('success', {
				razorpay_payment_id: response.razorpay_payment_id,
				razorpay_order_id: response.razorpay_order_id,
				razorpay_signature: response.razorpay_signature,
			})
		},
		prefill: {
			email: props.checkoutDetails.student,
		},
		theme: {
			color: '#2563eb', // Curiozee branding color
		},
	}

	const rzp = new window.Razorpay(options)
	rzp.on('payment.failed', function (response) {
		emit('failure', {
			order_id: props.checkoutDetails.order_id,
			error_code: response.error.code,
			error_description: response.error.description,
		})
	})
	rzp.open()
}

watch(
	() => props.checkoutDetails,
	(newDetails) => {
		if (newDetails) {
			startPayment()
		}
	},
	{ immediate: true }
)
</script>
