import { isValid, isAfter } from "date-fns"

export function checkDate(date) {
  if (!date) {
    return `Data nu este specificata`
  }

  const [dd, mm, yyyy] = date.split("-")
  const sysDate = new Date(`${yyyy}-${mm}-${dd}`)

  const isInvalidError = `Eroare: data ${date} este invalida`

  if (!isValid(sysDate)) {
    return isInvalidError
  }

  if (isAfter(sysDate, new Date())) {
    return `Eroare: data ${date} este din viitor`
  }

  return null
}

export const getDurationInMilliseconds = (start) => {
  const NS_PER_SEC = 1e9
  const NS_TO_MS = 1e6
  const diff = process.hrtime(start)

  return parseInt((diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS)
}
