import dayjs from './dayjs'

const BACKEND_TIMEZONE = 'Asia/Kolkata'

/**
 * Get the current browser timezone.
 * E.g., 'Asia/Kolkata', 'America/New_York', 'Europe/London'
 */
export function getBrowserTimezone() {
	return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Convert a backend IST datetime string (YYYY-MM-DD HH:mm:ss) to the user's local timezone.
 * Returns a Day.js object.
 */
export function convertToLocal(dateTimeStr) {
	if (!dateTimeStr) return null
	// Parse the string specifically in Asia/Kolkata timezone, then convert to local browser timezone
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
