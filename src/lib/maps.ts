/**
 * CIELVO Location & Maps Utilities
 */

/**
 * Calculate Great-Circle distance between two coordinates in Kilometers (Haversine Formula)
 */
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

/**
 * Generate Google Maps navigation deep-link for assigned professional
 */
export function getGoogleMapsNavigationUrl(
  destinationLat: number,
  destinationLng: number,
  addressLabel?: string
): string {
  const query = addressLabel
    ? encodeURIComponent(addressLabel)
    : `${destinationLat},${destinationLng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}&destination_place_id=${query}`;
}

/**
 * Build clean formatted Indian address string
 */
export function formatAddress(parts: {
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  locality: string;
  city: string;
  state: string;
  postalCode: string;
}): string {
  const segments = [
    parts.addressLine1,
    parts.addressLine2,
    parts.landmark ? `(Landmark: ${parts.landmark})` : null,
    parts.locality,
    parts.city,
    parts.state,
    parts.postalCode ? `PIN: ${parts.postalCode}` : null,
  ].filter(Boolean);

  return segments.join(', ');
}
