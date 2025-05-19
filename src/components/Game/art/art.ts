// Empty placeholder for the art object
// This file is kept for compatibility with existing components
// but the actual animal/emotion images have been removed

// Create a record type that allows any string key
type AnyStringRecord = Record<string, string>

// Export an empty art object
export const art = {
  animals: {} as AnyStringRecord,
  emotions: {} as AnyStringRecord
}
