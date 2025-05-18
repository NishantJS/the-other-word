// This function allows sorting by multiple criteria
// Each selector can return a different type, as long as it's comparable
export function sortBy<T>(
  list: T[],
  ...selectors: ((item: T) => string | number | boolean)[]
) {
  return list.slice().sort((a, b) => {
    for (const selector of selectors) {
      const aKey = selector(a)
      const bKey = selector(b)

      if (aKey < bKey) return -1
      if (aKey > bKey) return 1
    }

    return 0
  })
}
