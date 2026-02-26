import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, MapPin, ChevronRight, Loader2, AlertCircle } from 'lucide-react';

const INDIAN_STATES = [
  'Andaman & Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra & Nagar Haveli',
  'Daman & Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: string) => void;
}

export default function LocationPickerModal({ isOpen, onClose, onSelect }: LocationPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredStates = INDIAN_STATES.filter((state) =>
    state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setGeoError(null);
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);
    setDetectedLocation(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (!response.ok) throw new Error('Geocoding failed');
          const data = await response.json();
          const address = data.address || {};
          const city =
            address.city ||
            address.town ||
            address.village ||
            address.county ||
            address.district ||
            '';
          const state = address.state || '';
          const locationStr = city && state ? `${city}, ${state}` : state || city || 'India';
          setDetectedLocation(locationStr);
          setGeoLoading(false);
        } catch {
          setGeoError('Could not determine your location. Please select a state manually.');
          setGeoLoading(false);
        }
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Please allow access or select a state manually.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoError('Location information is unavailable. Please select a state manually.');
        } else {
          setGeoError('Unable to retrieve your location. Please select a state manually.');
        }
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSelectDetectedLocation = () => {
    if (detectedLocation) {
      onSelect(detectedLocation);
      onClose();
    }
  };

  const handleSelectState = (state: string) => {
    onSelect(state);
    onClose();
  };

  const handleSelectAllIndia = () => {
    onSelect('All in India');
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-gray-200 bg-white shrink-0">
        <button
          onClick={onClose}
          className="p-1 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close location picker"
        >
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-display text-lg font-semibold text-gray-900">Location</h2>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-gray-200 bg-white shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search city, area or neighbourhood"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto overscroll-contain bg-white">
        {/* Use Current Location Row */}
        <div className="px-4 py-3 border-b border-gray-100 bg-white">
          <button
            onClick={handleUseCurrentLocation}
            disabled={geoLoading}
            className="flex items-center gap-3 w-full text-left disabled:opacity-60"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-50 shrink-0">
              {geoLoading ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <MapPin className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-primary font-semibold text-sm">
                {geoLoading ? 'Detecting location…' : 'Use current location'}
              </p>
              {detectedLocation && !geoLoading && (
                <p className="text-gray-500 text-xs mt-0.5 truncate">{detectedLocation}</p>
              )}
            </div>
          </button>

          {/* Detected location — tap to confirm */}
          {detectedLocation && !geoLoading && (
            <button
              onClick={handleSelectDetectedLocation}
              className="mt-2 ml-12 text-xs text-primary underline underline-offset-2"
            >
              Use "{detectedLocation}"
            </button>
          )}

          {/* Geo error */}
          {geoError && (
            <div className="mt-2 ml-12 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{geoError}</p>
            </div>
          )}
        </div>

        {/* Choose State Section */}
        <div className="px-4 pt-4 pb-1 bg-white">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">
            Choose State
          </p>
        </div>

        {/* All in India */}
        {(!searchQuery || 'all in india'.includes(searchQuery.toLowerCase())) && (
          <button
            onClick={handleSelectAllIndia}
            className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 bg-white"
          >
            <span className="text-primary font-semibold text-sm">All in India</span>
          </button>
        )}

        {/* State List */}
        {filteredStates.length > 0 ? (
          filteredStates.map((state) => (
            <button
              key={state}
              onClick={() => handleSelectState(state)}
              className="flex items-center justify-between w-full px-4 py-4 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 bg-white"
            >
              <span className="text-gray-800 text-sm">{state}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
            </button>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-gray-500 text-sm bg-white">
            No states match "{searchQuery}"
          </div>
        )}

        {/* Bottom padding */}
        <div className="h-6 bg-white" />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
