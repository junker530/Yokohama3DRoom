import { useCallback, useState } from "react";

export function useSelectedLocation() {
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  const selectLocation = useCallback((id) => {
    setSelectedLocationId(id);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedLocationId(null);
  }, []);

  return { selectedLocationId, selectLocation, clearSelection };
}
