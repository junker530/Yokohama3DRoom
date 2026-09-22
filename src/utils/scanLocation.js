export function findScanLocationById(locations, id) {
  return locations.find((location) => location.id === id);
}
