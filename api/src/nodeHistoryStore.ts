export const nodeHistoryMap = new Map<number, Array<{ latitudeI: number, longitudeI: number, timestampMs: number }>>();

// Example: Add a fake history for node 123
nodeHistoryMap.set(123, [
  { latitudeI: 404123456, longitudeI: -747654321, timestampMs: 1620000000000 },
  { latitudeI: 404223456, longitudeI: -747654123, timestampMs: 1620000050000 },
]);