const transitRoutesByDestination = {
  "yokohama-station": [
    {
      id: "keikyu-yokohama",
      durationMinutes: 15,
      walkMinutes: 9,
      transferCount: 1,
      departure: "黄金町駅",
      arrival: "横浜駅",
      lines: [{ label: "KK", name: "京急本線", color: "#27b7d6" }],
    },
    {
      id: "blue-line-yokohama",
      durationMinutes: 17,
      walkMinutes: 8,
      transferCount: 0,
      departure: "吉野町駅",
      arrival: "横浜駅",
      lines: [{ label: "B", name: "ブルーライン", color: "#1976d2" }],
    },
    {
      id: "bus-negishi-yokohama",
      durationMinutes: 23,
      walkMinutes: 7,
      transferCount: 1,
      departure: "山王町周辺",
      arrival: "横浜駅",
      lines: [
        { label: "BUS", name: "市営バス", color: "#1838d8" },
        { label: "JK", name: "根岸線", color: "#1da8c2" },
      ],
    },
  ],
  "sony-city-minatomirai": [
    {
      id: "keikyu-sony-city",
      durationMinutes: 23,
      walkMinutes: 9,
      transferCount: 1,
      departure: "黄金町駅",
      arrival: "新高島駅",
      lines: [
        { label: "KK", name: "京急本線", color: "#27b7d6" },
        { label: "MM", name: "みなとみらい線", color: "#0e9eb2" },
      ],
    },
    {
      id: "blue-line-sony-city",
      durationMinutes: 25,
      walkMinutes: 8,
      transferCount: 1,
      departure: "吉野町駅",
      arrival: "新高島駅",
      lines: [
        { label: "B", name: "ブルーライン", color: "#1976d2" },
        { label: "MM", name: "みなとみらい線", color: "#0e9eb2" },
      ],
    },
    {
      id: "bus-sony-city",
      durationMinutes: 31,
      walkMinutes: 6,
      transferCount: 0,
      departure: "山王町周辺",
      arrival: "みなとみらい5丁目",
      lines: [{ label: "BUS", name: "市営バス", color: "#1838d8" }],
    },
  ],
};

export function getFallbackTransitOptions(destinationId) {
  return transitRoutesByDestination[destinationId] ?? [];
}

export const getTransitOptions = getFallbackTransitOptions;

export function googleTransitDirectionsUrl(origin, destination) {
  const params = new URLSearchParams({
    api: "1",
    origin: origin.address,
    destination: destination.address,
    travelmode: "transit",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
