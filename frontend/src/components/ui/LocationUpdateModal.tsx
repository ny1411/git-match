import React, { useState } from 'react';
import { MapPin, X, Navigation } from 'lucide-react';

interface LocationUpdateModalProps {
  onClose: () => void;
  onSave: (newLocation: string) => void;
  currentLocation: string;
}

export const LocationUpdateModal: React.FC<LocationUpdateModalProps> = ({
  onClose,
  onSave,
  currentLocation,
}) => {
  const [location, setLocation] = useState(currentLocation);
  const [loading, setLoading] = useState(false);

  const handleDetectLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Mocking reverse geocoding for speed.
        // In production, send lat/long to Google Maps Geocoding API or OpenStreetMap Nominatim here.
        const { latitude, longitude } = position.coords;
        console.log(`Lat: ${latitude}, Long: ${longitude}`);

        // Simulating API delay
        setTimeout(() => {
          setLocation('Detected City, Country'); // Replace with API result
          setLoading(false);
        }, 1000);
      },
      (error) => {
        console.error(error);
        alert('Unable to retrieve your location');
        setLoading(false);
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#1c1b2e] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h3 className="text-xl font-bold text-white">Update Location</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 p-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Current Location</label>
            <div className="relative">
              <MapPin
                className="absolute top-1/2 left-3 -translate-y-1/2 text-purple-400"
                size={18}
              />
              <input
                type="text"
                disabled
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-10 text-white focus:border-purple-500 focus:outline-none"
                placeholder="Enter city, country"
              />
            </div>
          </div>

          <div className="relative flex items-center gap-4">
            <div className="h-px w-full bg-white/10"></div>
            <span className="text-xs text-gray-500 uppercase">Or</span>
            <div className="h-px w-full bg-white/10"></div>
          </div>

          {/* Map Canvas */}
          <div className="flex h-60 w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {/* Replace with Google Maps API */}
            <iframe
              className=""
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d9249.56628752442!2d77.63770791509144!3d12.910063191575984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1768972648306!5m2!1sen!2sin"
              style={{ width: '100%', height: '100%' }}
              loading="lazy"
            ></iframe>
          </div>

          {/* Detect Location Button */}
          <button
            onClick={handleDetectLocation}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600/20 py-3 text-sm font-semibold text-purple-300 transition-colors hover:bg-purple-600/30 disabled:opacity-50"
          >
            {loading ? (
              <span>Detecting...</span>
            ) : (
              <>
                <Navigation size={16} /> Use Current Location
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="flex gap-3 bg-black/20 p-5">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(location)}
            className="flex-1 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
