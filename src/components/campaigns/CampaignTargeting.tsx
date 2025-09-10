import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CampaignTargetingProps {
  geoTargets: any;
  daypart: any;
  onChange: (targets: { geoTargets: any; daypart: any }) => void;
}

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' },
];

const DAYS = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: `${i.toString().padStart(2, '0')}:00`,
}));

export function CampaignTargeting({ geoTargets, daypart, onChange }: CampaignTargetingProps) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(
    geoTargets?.countries || []
  );
  const [selectedCities, setSelectedCities] = useState<string[]>(
    geoTargets?.cities || []
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    daypart?.days || []
  );
  const [selectedHours, setSelectedHours] = useState<number[]>(
    daypart?.hours || []
  );
  const [newCity, setNewCity] = useState('');

  const updateTargeting = (updates: Partial<{
    countries: string[];
    cities: string[];
    days: string[];
    hours: number[];
  }>) => {
    const newGeoTargets = {
      countries: updates.countries ?? selectedCountries,
      cities: updates.cities ?? selectedCities,
    };
    const newDaypart = {
      days: updates.days ?? selectedDays,
      hours: updates.hours ?? selectedHours,
    };

    if (updates.countries !== undefined) setSelectedCountries(updates.countries);
    if (updates.cities !== undefined) setSelectedCities(updates.cities);
    if (updates.days !== undefined) setSelectedDays(updates.days);
    if (updates.hours !== undefined) setSelectedHours(updates.hours);

    onChange({ geoTargets: newGeoTargets, daypart: newDaypart });
  };

  const addCity = () => {
    if (newCity.trim() && !selectedCities.includes(newCity.trim())) {
      updateTargeting({ cities: [...selectedCities, newCity.trim()] });
      setNewCity('');
    }
  };

  const removeCity = (city: string) => {
    updateTargeting({ cities: selectedCities.filter(c => c !== city) });
  };

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      updateTargeting({ countries: selectedCountries.filter(c => c !== country) });
    } else {
      updateTargeting({ countries: [...selectedCountries, country] });
    }
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      updateTargeting({ days: selectedDays.filter(d => d !== day) });
    } else {
      updateTargeting({ days: [...selectedDays, day] });
    }
  };

  const toggleHour = (hour: number) => {
    if (selectedHours.includes(hour)) {
      updateTargeting({ hours: selectedHours.filter(h => h !== hour) });
    } else {
      updateTargeting({ hours: [...selectedHours, hour] });
    }
  };

  const selectAllDays = () => {
    updateTargeting({ days: DAYS.map(d => d.value) });
  };

  const clearAllDays = () => {
    updateTargeting({ days: [] });
  };

  const selectBusinessHours = () => {
    updateTargeting({ hours: [9, 10, 11, 12, 13, 14, 15, 16, 17] });
  };

  const selectEveningHours = () => {
    updateTargeting({ hours: [18, 19, 20, 21, 22] });
  };

  const clearAllHours = () => {
    updateTargeting({ hours: [] });
  };

  return (
    <div className="space-y-6">
      {/* Geographic Targeting */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Geographic Targeting</h3>
        
        {/* Countries */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Countries</label>
          <div className="grid grid-cols-3 gap-2">
            {COUNTRIES.map((country) => (
              <label
                key={country.code}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={selectedCountries.includes(country.code)}
                  onChange={() => toggleCountry(country.code)}
                  className="rounded border-gray-400 dark:border-gray-600 text-primary focus:ring-primary"
                />
                <span>{country.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Cities</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newCity}
              onChange={(e) => setNewCity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCity())}
              placeholder="Add a city..."
              className="input input-sm flex-1"
            />
            <button
              type="button"
              onClick={addCity}
              className="btn btn-secondary btn-sm"
            >
              Add
            </button>
          </div>
          {selectedCities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCities.map((city) => (
                <span
                  key={city}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  {city}
                  <button
                    type="button"
                    onClick={() => removeCity(city)}
                    className="hover:text-red-600 dark:hover:text-red-400"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dayparting */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Dayparting</h3>
        
        {/* Days */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Days of Week</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllDays}
                className="text-xs text-primary hover:text-primary-dark"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllDays}
                className="text-xs text-gray-600 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DAYS.map((day) => (
              <label
                key={day.value}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={selectedDays.includes(day.value)}
                  onChange={() => toggleDay(day.value)}
                  className="rounded border-gray-400 dark:border-gray-600 text-primary focus:ring-primary"
                />
                <span>{day.label.slice(0, 3)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hours */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Hours of Day</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectBusinessHours}
                className="text-xs text-primary hover:text-primary-dark"
              >
                Business
              </button>
              <button
                type="button"
                onClick={selectEveningHours}
                className="text-xs text-primary hover:text-primary-dark"
              >
                Evening
              </button>
              <button
                type="button"
                onClick={clearAllHours}
                className="text-xs text-gray-600 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400"
              >
                Clear
              </button>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {HOURS.map((hour) => (
              <button
                key={hour.value}
                type="button"
                onClick={() => toggleHour(hour.value)}
                className={`px-2 py-1 text-xs rounded ${
                  selectedHours.includes(hour.value)
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {hour.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}