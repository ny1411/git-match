import { updateMyProfile } from './profile.service';
import type { AuthTokenSources } from './api.service';

interface ReverseGeocodeResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    suburb?: string;
    state_district?: string;
    road?: string;
    country?: string;
  };
}

export const reverseGeocodeCoordinates = async (lat: number, lng: number) => {
  try {
    const query = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'json',
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query.toString()}`);

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = (await response.json()) as ReverseGeocodeResponse;
    const city =
      data.address?.county ||
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.suburb ||
      data.address?.state_district ||
      data.address?.road ||
      '';
    const country = data.address?.country || '';

    return { city, country };
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return { city: '', country: '' };
  }
};

export const submitOnboardingProfile = (
  payload: Record<string, unknown>,
  auth: AuthTokenSources
) => updateMyProfile(payload, auth);
