export const formatDashboardMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN').format(value)

export const getToday = () => {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export const getCurrentMonth = () => getToday().slice(0, 7)

export const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1).padStart(2, '0'),
  label: `Tháng ${index + 1}`,
}))

const currentYear = new Date().getFullYear()

export const YEAR_OPTIONS = Array.from(
  { length: 11 },
  (_, index) => currentYear - index
)

export const getCurrentYear = () => String(currentYear)
