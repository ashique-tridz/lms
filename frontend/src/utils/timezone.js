import dayjs from './dayjs'

const BACKEND_TIMEZONE = 'Asia/Kolkata'

/**
 * Get the current browser timezone.
 * E.g., 'Asia/Kolkata', 'America/New_York', 'Europe/London'
 */
export function getBrowserTimezone() {
	return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function convertToLocal(dateTimeStr) {
	if (!dateTimeStr) return null
	// If the string contains a timezone offset or 'Z', it is already timezone-aware.
	// Otherwise, it is a naive datetime string which we assume is in the backend's timezone.
	const isTimezoneAware =
		dateTimeStr.includes('Z') || /[+-]\d{2}:?\d{2}$/.test(dateTimeStr)
	if (isTimezoneAware) {
		return dayjs(dateTimeStr).local()
	}
	return dayjs.tz(dateTimeStr, BACKEND_TIMEZONE).local()
}

/**
 * Formats a backend IST datetime string to a localized string in the browser's timezone.
 */
export function formatLocal(dateTimeStr, formatStr = 'YYYY-MM-DD hh:mm A') {
	const localObj = convertToLocal(dateTimeStr)
	if (!localObj) return ''
	return localObj.format(formatStr)
}

/**
 * Formats a slot or session time range from backend IST strings into localized browser times.
 */
export function formatTimeRangeLocal(
	startStr,
	endStr,
	formatStart = 'ddd, DD MMM YYYY, hh:mm A',
	formatEnd = 'hh:mm A'
) {
	const startLocal = convertToLocal(startStr)
	const endLocal = convertToLocal(endStr)
	if (!startLocal || !endLocal) return ''
	const tz = getBrowserTimezone()
	return `${startLocal.format(formatStart)} – ${endLocal.format(formatEnd)} (${tz})`
}
