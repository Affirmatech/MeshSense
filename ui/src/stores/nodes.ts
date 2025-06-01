export interface HistoryRecord {
  latitudeI: number;
  longitudeI: number;
  timestampMs: number;
}

export async function getNodeHistory(nodeNum: number): Promise<HistoryRecord[]> {
  try {
    const resp = await fetch(`/api/nodes/${nodeNum}/history`);
    if (!resp.ok) {
      console.error(`Failed to fetch history for node ${nodeNum}:`, resp.statusText);
      return [];
    }
    const data = await resp.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Error fetching history for node ${nodeNum}:`, err);
    return [];
  }
}