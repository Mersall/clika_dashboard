import { useState } from 'react';

interface FootballLogoProps {
  logoUrl?: string;
  teamName?: string;
  className?: string;
}

export function FootballLogo({ logoUrl, teamName, className = "h-32 w-32" }: FootballLogoProps) {
  const [hasError, setHasError] = useState(false);

  // Generate initials from team name
  const getInitials = () => {
    if (!teamName) return 'FC';
    const words = teamName.split(' ');
    if (words.length === 1) {
      return teamName.substring(0, 3).toUpperCase();
    }
    return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  };

  if (!logoUrl || hasError) {
    return (
      <div className={`${className} bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800 rounded-lg flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
        {getInitials()}
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={teamName || 'Football club logo'}
      className={`${className} object-contain bg-gray-100 dark:bg-gray-800 rounded-lg p-2`}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}