import { useState } from 'react';
import { FootballLogo } from '../components/ui/FootballLogo';

const testLogos = [
  {
    name: 'Arsenal',
    url: 'https://ssl.gstatic.com/onebox/media/sports/logos/4us2nCgl6kgZc0t3hpW75Q_96x96.png'
  },
  {
    name: 'Chelsea',
    url: 'https://ssl.gstatic.com/onebox/media/sports/logos/fhBITrIlbQxhVB6IjxUO6Q_96x96.png'
  },
  {
    name: 'Liverpool',
    url: 'https://ssl.gstatic.com/onebox/media/sports/logos/0iShHhASp5q1SL4JhtwJiw_96x96.png'
  },
  {
    name: 'Manchester United',
    url: 'https://ssl.gstatic.com/onebox/media/sports/logos/udQ6ns69PctCv143h-GeYw_96x96.png'
  },
  {
    name: 'Barcelona',
    url: 'https://ssl.gstatic.com/onebox/media/sports/logos/paYnEE8hcrP96neHRNofhQ_96x96.png'
  },
  {
    name: 'Real Madrid',
    url: 'https://crests.football-data.org/86.png'
  }
];

export function TestLogosPage() {
  const [imageStates, setImageStates] = useState<Record<string, string>>({});

  const handleImageLoad = (name: string) => {
    setImageStates(prev => ({ ...prev, [name]: 'loaded' }));
  };

  const handleImageError = (name: string, e: any) => {
    console.error(`Failed to load ${name}:`, e);
    setImageStates(prev => ({ ...prev, [name]: 'error' }));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Football Logos</h1>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Direct Image Test</h2>
        <div className="grid grid-cols-3 gap-4">
          {testLogos.map(logo => (
            <div key={logo.name} className="text-center">
              <div className="relative">
                <img
                  src={logo.url}
                  alt={logo.name}
                  className="w-32 h-32 object-contain bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mx-auto"
                  onLoad={() => handleImageLoad(logo.name)}
                  onError={(e) => handleImageError(logo.name, e)}
                />
                {imageStates[logo.name] && (
                  <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
                    imageStates[logo.name] === 'loaded'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {imageStates[logo.name]}
                  </span>
                )}
              </div>
              <p className="mt-2 font-medium">{logo.name}</p>
              <p className="text-xs text-gray-500 break-all mt-1">{logo.url}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">FootballLogo Component Test</h2>
        <div className="grid grid-cols-3 gap-4">
          {testLogos.map(logo => (
            <div key={logo.name} className="text-center">
              <FootballLogo
                logoUrl={logo.url}
                teamName={logo.name}
                className="w-32 h-32 mx-auto"
              />
              <p className="mt-2 font-medium">{logo.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <h3 className="font-semibold text-amber-800 dark:text-amber-200">Check Browser Console</h3>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
          Open the browser console (F12) to see any CORS errors or loading issues.
        </p>
      </div>
    </div>
  );
}