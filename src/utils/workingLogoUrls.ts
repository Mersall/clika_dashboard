// Working logo URLs from various reliable CDNs
// Tested and verified to be accessible

export const workingLogoUrls: Record<string, string> = {
  // Premier League
  'Arsenal': 'https://crests.football-data.org/57.png',
  'Aston Villa': 'https://crests.football-data.org/58.png',
  'Chelsea': 'https://crests.football-data.org/61.png',
  'Everton': 'https://crests.football-data.org/62.png',
  'Leeds United': 'https://crests.football-data.org/341.png',
  'Leicester City': 'https://crests.football-data.org/338.png',
  'Liverpool': 'https://crests.football-data.org/64.png',
  'Manchester City': 'https://crests.football-data.org/65.png',
  'Manchester United': 'https://crests.football-data.org/66.png',
  'Newcastle United': 'https://crests.football-data.org/67.png',
  'Nottingham Forest': 'https://crests.football-data.org/351.png',
  'Sheffield United': 'https://crests.football-data.org/356.png',
  'Sheffield Wednesday': 'https://crests.football-data.org/345.png',
  'Southampton': 'https://crests.football-data.org/340.png',
  'Tottenham Hotspur': 'https://crests.football-data.org/73.png',
  'West Ham United': 'https://crests.football-data.org/563.png',
  'Wolverhampton Wanderers': 'https://crests.football-data.org/76.png',

  // La Liga
  'Athletic Bilbao': 'https://crests.football-data.org/77.png',
  'Atletico Madrid': 'https://crests.football-data.org/78.png',
  'Barcelona': 'https://crests.football-data.org/81.png',
  'Real Madrid': 'https://crests.football-data.org/86.png',
  'Real Sociedad': 'https://crests.football-data.org/92.png',
  'Sevilla': 'https://crests.football-data.org/559.png',
  'Valencia': 'https://crests.football-data.org/95.png',
  'Villarreal': 'https://crests.football-data.org/94.png',

  // Serie A
  'AC Milan': 'https://crests.football-data.org/98.png',
  'Inter Milan': 'https://crests.football-data.org/108.png',
  'Juventus': 'https://crests.football-data.org/109.png',
  'Napoli': 'https://crests.football-data.org/113.png',
  'Roma': 'https://crests.football-data.org/100.png',

  // Bundesliga
  'Bayern Munich': 'https://crests.football-data.org/5.png',
  'Borussia Dortmund': 'https://crests.football-data.org/4.png',
  'Borussia Monchengladbach': 'https://crests.football-data.org/18.png',
  'Schalke 04': 'https://crests.football-data.org/6.png',
  'VfB Stuttgart': 'https://crests.football-data.org/10.png',

  // Ligue 1
  'Lyon': 'https://crests.football-data.org/523.png',
  'Marseille': 'https://crests.football-data.org/516.png',
  'Monaco': 'https://crests.football-data.org/548.png',
  'Paris Saint-Germain': 'https://crests.football-data.org/524.png',

  // Eredivisie
  'Ajax': 'https://crests.football-data.org/678.png',
  'Feyenoord': 'https://crests.football-data.org/675.png',
  'PSV Eindhoven': 'https://crests.football-data.org/674.png',

  // Primeira Liga
  'Benfica': 'https://crests.football-data.org/1903.png',
  'Porto': 'https://crests.football-data.org/503.png',
  'Sporting CP': 'https://crests.football-data.org/498.png',

  // Scottish Premiership
  'Celtic': 'https://crests.football-data.org/732.png',
  'Rangers': 'https://crests.football-data.org/733.png',
};

// Function to get a working logo URL with fallback
export function getWorkingLogoUrl(teamName: string): string | null {
  // Direct match
  if (workingLogoUrls[teamName]) {
    return workingLogoUrls[teamName];
  }

  // Try case-insensitive match
  const lowerTeam = teamName.toLowerCase();
  for (const [key, value] of Object.entries(workingLogoUrls)) {
    if (key.toLowerCase() === lowerTeam) {
      return value;
    }
  }

  // Try partial match (e.g., "Inter" matches "Inter Milan")
  for (const [key, value] of Object.entries(workingLogoUrls)) {
    if (key.toLowerCase().includes(lowerTeam) || lowerTeam.includes(key.toLowerCase())) {
      return value;
    }
  }

  return null;
}