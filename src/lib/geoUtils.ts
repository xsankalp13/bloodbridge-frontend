import type { BloodRequest, GeoCoordinates } from "@/types"

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula (returns distance in kilometers).
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`
  }
  return `${km.toFixed(1)} km away`
}

/**
 * Known centroid coordinates for major Pakistani cities to match approximate locations
 */
export const PAKISTAN_CITY_COORDINATES: Record<string, GeoCoordinates> = {
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Lahore: { lat: 31.5204, lng: 74.3587 },
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5973, lng: 73.0479 },
  Faisalabad: { lat: 31.4504, lng: 73.135 },
  Multan: { lat: 30.1575, lng: 71.5249 },
  Peshawar: { lat: 34.0151, lng: 71.5249 },
  Quetta: { lat: 30.1798, lng: 66.975 },
  Hyderabad: { lat: 25.396, lng: 68.3578 },
  Gujranwala: { lat: 32.1877, lng: 74.1945 },
  Sialkot: { lat: 32.4945, lng: 74.5229 },
  Abbottabad: { lat: 34.1688, lng: 73.2215 },
  Sukkur: { lat: 27.7052, lng: 68.8574 },
}

/**
 * Finds the nearest Pakistani city name for given coordinates
 */
export function getNearestPakistaniCity(lat: number, lng: number): { city: string; distanceKm: number } {
  let nearestCity = "Pakistan"
  let minDistance = Infinity

  for (const [cityName, coords] of Object.entries(PAKISTAN_CITY_COORDINATES)) {
    const dist = calculateDistanceKm(lat, lng, coords.lat, coords.lng)
    if (dist < minDistance) {
      minDistance = dist
      nearestCity = cityName
    }
  }

  return { city: nearestCity, distanceKm: minDistance }
}

/**
 * Populates and sorts blood requests based on user's coordinates
 */
export function populateAndSortRequestsByLocation(
  requests: BloodRequest[],
  userCoords: GeoCoordinates | null
): BloodRequest[] {
  if (!userCoords) {
    return requests
  }

  return requests
    .map((req) => {
      const distanceKm = calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        req.hospital.coordinates.lat,
        req.hospital.coordinates.lng
      )
      return { ...req, distanceKm }
    })
    .sort((a, b) => {
      // Sort primarily by distance if available
      return (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    })
}
