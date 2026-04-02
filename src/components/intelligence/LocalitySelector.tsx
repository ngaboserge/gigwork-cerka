import React, { useState, useEffect } from 'react';
import { MapPin } from '../../lib/icons';
import { getNeighborhoods, findNearestNeighborhood, type Neighborhood } from '../../services/intelligence.service';
import { Slider } from '../ui/Slider';

interface LocalitySelectorProps {
  onLocationChange: (lat: number, lng: number, radius: number, neighborhood?: Neighborhood) => void;
  defaultRadius?: number;
  className?: string;
}

export const LocalitySelector: React.FC<LocalitySelectorProps> = ({
  onLocationChange,
  defaultRadius = 5,
  className = ''
}) => {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [radius, setRadius] = useState(defaultRadius);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNeighborhoods();
  }, []);

  const loadNeighborhoods = async () => {
    const data = await getNeighborhoods();
    setNeighborhoods(data);
  };

  const handleNeighborhoodChange = (neighborhoodId: string) => {
    setSelectedNeighborhood(neighborhoodId);
    const neighborhood = neighborhoods.find(n => n.id === neighborhoodId);
    if (neighborhood) {
      onLocationChange(neighborhood.centerLat, neighborhood.centerLng, radius, neighborhood);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = await findNearestNeighborhood(latitude, longitude);
        
        if (nearest) {
          setSelectedNeighborhood(nearest.id);
        }
        
        onLocationChange(latitude, longitude, radius, nearest || undefined);
        setUseCurrentLocation(true);
        setLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location');
        setLoading(false);
      }
    );
  };

  const handleRadiusChange = (value: number | [number, number]) => {
    const newRadius = Array.isArray(value) ? value[0] : value;
    setRadius(newRadius);
    const neighborhood = neighborhoods.find(n => n.id === selectedNeighborhood);
    if (neighborhood) {
      onLocationChange(neighborhood.centerLat, neighborhood.centerLng, newRadius, neighborhood);
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-primary-600" />
        <h3 className="font-semibold text-gray-900">Location & Radius</h3>
      </div>

      <div className="space-y-4">
        {/* Neighborhood Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Neighborhood
          </label>
          <select
            value={selectedNeighborhood}
            onChange={(e) => handleNeighborhoodChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Choose a neighborhood...</option>
            {neighborhoods.map(n => (
              <option key={n.id} value={n.id}>
                {n.name}, {n.city}
              </option>
            ))}
          </select>
        </div>

        {/* Current Location Button */}
        <button
          onClick={handleCurrentLocation}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors disabled:opacity-50"
        >
          <MapPin className="w-4 h-4" />
          {loading ? 'Getting location...' : 'Use My Current Location'}
        </button>

        {/* Radius Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius: {radius} km
          </label>
          <Slider
            min={1}
            max={20}
            step={0.5}
            value={radius}
            onChange={handleRadiusChange}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 km</span>
            <span>20 km</span>
          </div>
        </div>

        {useCurrentLocation && (
          <div className="text-sm text-green-600 flex items-center gap-1">
            <span>✓</span>
            <span>Using your current location</span>
          </div>
        )}
      </div>
    </div>
  );
};
