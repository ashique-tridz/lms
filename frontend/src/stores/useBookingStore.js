import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createResource } from 'frappe-ui'

export const useBookingStore = defineStore('booking-store', () => {
	const currentBooking = ref(null)
	const checkoutDetails = ref(null)
	const loading = ref(false)
	const error = ref(null)

	// API call to initiate booking (create lock + order)
	const bookingInitiator = createResource({
		url: 'smart_learning.api.booking_api.initiate_booking',
		onSuccess(data) {
			checkoutDetails.value = data
			loading.value = false
		},
		onError(err) {
			error.value = err
			loading.value = false
		}
	})

	const checkoutDetailsFetcher = createResource({
		url: 'smart_learning.api.booking_api.get_checkout_details',
		onSuccess(data) {
			checkoutDetails.value = data
			loading.value = false
		},
		onError(err) {
			error.value = err
			loading.value = false
		}
	})

	const failureReporter = createResource({
		url: 'smart_learning.api.booking_api.report_payment_failure',
	})

	function initiateBooking(params) {
		loading.value = true
		error.value = null
		return bookingInitiator.submit(params)
	}

	function getCheckout(bookingName) {
		loading.value = true
		error.value = null
		return checkoutDetailsFetcher.submit({ booking_name: bookingName })
	}

	function reportFailure(razorpayOrderId, errorCode, errorDesc) {
		return failureReporter.submit({
			razorpay_order_id: razorpayOrderId,
			error_code: errorCode,
			error_description: errorDesc,
		})
	}

	return {
		currentBooking,
		checkoutDetails,
		loading,
		error,
		initiateBooking,
		getCheckout,
		reportFailure,
	}
})
