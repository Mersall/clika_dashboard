import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@services/supabase';
import { Database } from '@services/supabase';
import { ChartBarIcon, ClockIcon, UserGroupIcon, TrophyIcon, MagnifyingGlassIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useExport } from '../hooks/useExport';


export function SessionsPage() {
  const { t } = useTranslation();
  const { exportData } = useExport();
  
  const gameOptions = [
    { value: 'who_among_us', label: t('content.games.who_among_us') },
    { value: 'agree_disagree', label: t('content.games.agree_disagree') },
    { value: 'guess_the_person', label: t('content.games.guess_the_person') },
    { value: 'football_trivia', label: t('content.games.football_trivia') },
    { value: 'football_logos', label: t('content.games.football_logos') },
    { value: 'football_players', label: t('content.games.football_players') },
    { value: 'football_moments', label: t('content.games.football_moments') },
  ];
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minRounds, setMinRounds] = useState<number>(0);
  const [minDuration, setMinDuration] = useState<number>(0);

  // Fetch sessions with rounds count
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', selectedGame, selectedDateRange],
    queryFn: async () => {
      const dateFilter = {
        '1d': new Date(Date.now() - 24 * 60 * 60 * 1000),
        '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        'all': new Date(0),
      }[selectedDateRange] || new Date(0);

      let query = supabase
        .from('session')
        .select('*')
        .gte('started_at', dateFilter.toISOString())
        .order('started_at', { ascending: false })
        .limit(100);

      if (selectedGame !== 'all') {
        query = query.eq('game_key', selectedGame);
      }

      const { data: sessionData, error } = await query;
      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      // Fetch round counts separately for each session
      if (sessionData && sessionData.length > 0) {
        const sessionIds = sessionData.map(s => s.id);
        const { data: roundCounts, error: roundError } = await supabase
          .from('round')
          .select('session_id')
          .in('session_id', sessionIds);

        if (!roundError && roundCounts) {
          const countMap = roundCounts.reduce((acc, round) => {
            acc[round.session_id] = (acc[round.session_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          // Add round counts to sessions
          return sessionData.map(session => ({
            ...session,
            round: [{ count: countMap[session.id] || 0 }]
          }));
        }
      }

      return sessionData || [];
    },
  });

  // Fetch game statistics
  const { data: gameStats, isLoading: statsLoading } = useQuery({
    queryKey: ['game-stats', selectedGame, selectedDateRange],
    queryFn: async () => {
      const dateFilter = {
        '1d': new Date(Date.now() - 24 * 60 * 60 * 1000),
        '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        'all': new Date(0),
      }[selectedDateRange] || new Date(0);

      let query = supabase
        .from('session')
        .select('game_key, started_at')
        .gte('started_at', dateFilter.toISOString());

      if (selectedGame !== 'all') {
        query = query.eq('game_key', selectedGame);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group by game type
      const stats = data?.reduce((acc: any, session: any) => {
        const game = session.game_key;
        if (!acc[game]) {
          acc[game] = { count: 0, label: gameOptions.find(g => g.value === game)?.label || game };
        }
        acc[game].count++;
        return acc;
      }, {});

      return stats || {};
    },
  });

  // Fetch average session duration
  const { data: avgDuration } = useQuery({
    queryKey: ['avg-duration', selectedGame, selectedDateRange],
    queryFn: async () => {
      const dateFilter = {
        '1d': new Date(Date.now() - 24 * 60 * 60 * 1000),
        '7d': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        'all': new Date(0),
      }[selectedDateRange] || new Date(0);

      let query = supabase
        .from('session')
        .select('started_at, ended_at')
        .gte('started_at', dateFilter.toISOString())
        .not('ended_at', 'is', null);

      if (selectedGame !== 'all') {
        query = query.eq('game_key', selectedGame);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) return 0;

      const durations = data.map((s: any) => {
        const start = new Date(s.started_at).getTime();
        const end = new Date(s.ended_at).getTime();
        return end - start;
      });

      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      return Math.round(avg / 1000 / 60); // Convert to minutes
    },
  });

  // Filter sessions based on search query and advanced filters
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];

    let filtered = [...sessions];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((session: any) => {
        const sessionId = session.id.toLowerCase();
        const userId = session.user_id.toLowerCase();
        const gameKey = session.game_key.toLowerCase();
        const gameName = gameOptions.find(g => g.value === session.game_key)?.label.toLowerCase() || '';

        return sessionId.includes(query) ||
               userId.includes(query) ||
               gameKey.includes(query) ||
               gameName.includes(query);
      });
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((session: any) => {
        if (selectedStatus === 'active') return !session.ended_at;
        if (selectedStatus === 'ended') return session.ended_at;
        return true;
      });
    }

    // Apply minimum rounds filter
    if (minRounds > 0) {
      filtered = filtered.filter((session: any) => {
        const roundCount = session.round?.[0]?.count || 0;
        return roundCount >= minRounds;
      });
    }

    // Apply minimum duration filter (in minutes)
    if (minDuration > 0) {
      filtered = filtered.filter((session: any) => {
        if (!session.ended_at) return false;
        const duration = (new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000 / 60;
        return duration >= minDuration;
      });
    }

    return filtered;
  }, [sessions, searchQuery, selectedStatus, minRounds, minDuration, gameOptions]);

  const totalSessions = filteredSessions?.length || 0;

  // Count truly active sessions (started in last 30 minutes and not ended)
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const activeSessions = filteredSessions?.filter(s => {
    if (s.ended_at) return false; // Session has ended
    const startedAt = new Date(s.started_at);
    return startedAt >= thirtyMinutesAgo; // Started within last 30 minutes
  }).length || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">{t('sessions.title')}</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-400">{t('sessions.subtitle')}</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => {
            const dataToExport = filteredSessions.map((session: any) => ({
              id: session.id,
              user_id: session.user_id,
              game: gameOptions.find(g => g.value === session.game_key)?.label || session.game_key,
              started_at: session.started_at,
              ended_at: session.ended_at || 'Active',
              duration: session.ended_at 
                ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000 / 60)
                : 'N/A',
              rounds: session.round?.[0]?.count || 0,
              status: session.ended_at ? 'Ended' : 'Active'
            }));
            
            exportData(
              dataToExport,
              ['id', 'user_id', 'game', 'started_at', 'ended_at', 'duration', 'rounds', 'status'],
              { filename: 'sessions-export' }
            );
          }}
        >
          <ArrowDownTrayIcon className="mr-2 h-4 w-4" />
          {t('sessions.export')}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 sm:mb-6">
        {/* Search Bar */}
        <div className="mb-4 relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('sessions.search')}
            className="input w-full pl-10"
          />
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          <select
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="input"
          >
            <option value="all">{t('sessions.filters.allGames')}</option>
            {gameOptions.map((game) => (
              <option key={game.value} value={game.value}>
                {game.label}
              </option>
            ))}
          </select>

          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="input"
          >
            <option value="1d">{t('sessions.filters.last24Hours')}</option>
            <option value="7d">{t('sessions.filters.last7Days')}</option>
            <option value="30d">{t('sessions.filters.last30Days')}</option>
            <option value="all">{t('sessions.filters.allTime')}</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
          </select>

          <input
            type="number"
            value={minRounds}
            onChange={(e) => setMinRounds(Number(e.target.value) || 0)}
            placeholder="Min rounds (e.g. 5)"
            className="input"
            min="0"
          />

          <input
            type="number"
            value={minDuration}
            onChange={(e) => setMinDuration(Number(e.target.value) || 0)}
            placeholder="Min duration (minutes)"
            className="input"
            min="0"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-400 truncate">{t('sessions.stats.totalSessions')}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-100">{totalSessions}</p>
            </div>
            <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500 flex-shrink-0 ml-2" />
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-400 truncate">
                {t('sessions.stats.activeSessions')}
                <span className="text-xs text-gray-500 ml-1">(30 min)</span>
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-100">{activeSessions}</p>
            </div>
            <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 ml-2" />
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-400 truncate">{t('sessions.stats.avgDuration')}</p>
              <p className="text-lg sm:text-xl font-bold text-gray-100">{t('sessions.durationFormat', { duration: avgDuration || 0 })}</p>
            </div>
            <ClockIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0 ml-2" />
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-400 truncate">{t('sessions.stats.mostPlayed')}</p>
              <p className="text-sm sm:text-lg font-bold text-gray-100 truncate">
                {Object.values(gameStats || {}).length > 0 
                  ? Object.values(gameStats || {}).sort((a: any, b: any) => b.count - a.count)[0]?.label 
                  : t('common.na')}
              </p>
            </div>
            <TrophyIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 flex-shrink-0 ml-2" />
          </div>
        </div>
      </div>

      {/* Game Distribution */}
      {!statsLoading && Object.keys(gameStats || {}).length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('sessions.gameDistribution')}</h2>
          <div className="space-y-3">
            {Object.entries(gameStats || {})
              .sort(([,a]: [string, any], [,b]: [string, any]) => b.count - a.count)
              .map(([game, stats]: [string, any], index) => {
              const maxCount = Math.max(...Object.values(gameStats || {}).map((s: any) => s.count));
              const percentage = totalSessions > 0 ? (stats.count / totalSessions * 100).toFixed(1) : 0;
              const barWidth = maxCount > 0 ? (stats.count / maxCount * 100) : 0;

              // Different colors for each game
              const gameColors: Record<string, string> = {
                'who_among_us': 'bg-blue-500',
                'agree_disagree': 'bg-purple-500',
                'guess_the_person': 'bg-cyan-500',
                'football_trivia': 'bg-green-500',
                'football_logos': 'bg-yellow-500',
                'football_players': 'bg-orange-500',
                'football_moments': 'bg-pink-500'
              };

              const barColor = gameColors[game] || 'bg-primary-600';

              return (
                <div key={game}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-300">{stats.label}</span>
                    <span className="text-sm text-gray-400">{stats.count.toLocaleString()} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`${barColor} h-3 rounded-full transition-all duration-500`}
                      style={{
                        width: `${Math.max(barWidth, 2)}%`,
                        minWidth: '2%'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions - Desktop Table */}
      <div className="hidden lg:block card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold">{t('sessions.recentSessions')}</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>{t('sessions.tableHeaders.sessionId')}</th>
              <th>{t('sessions.tableHeaders.user')}</th>
              <th>{t('sessions.tableHeaders.game')}</th>
              <th>{t('sessions.tableHeaders.started')}</th>
              <th>{t('sessions.tableHeaders.duration')}</th>
              <th>{t('sessions.tableHeaders.rounds')}</th>
              <th>{t('sessions.tableHeaders.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {sessionsLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="inline-flex items-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
                    <span className="ml-2">{t('sessions.loading')}</span>
                  </div>
                </td>
              </tr>
            ) : filteredSessions?.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  {searchQuery ? t('sessions.noMatch') : t('sessions.noSessions')}
                </td>
              </tr>
            ) : (
              filteredSessions?.map((session: any) => {
                const duration = session.ended_at 
                  ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000 / 60)
                  : null;
                const roundCount = session.round?.[0]?.count || 0;

                return (
                  <tr key={session.id}>
                    <td className="font-mono text-xs">{session.id.slice(0, 8)}...</td>
                    <td className="font-mono text-xs">{session.user_id.slice(0, 8)}...</td>
                    <td>
                      <span className="badge badge-info">
                        {gameOptions.find(g => g.value === session.game_key)?.label}
                      </span>
                    </td>
                    <td className="text-sm">
                      {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                    </td>
                    <td className="text-sm">
                      {duration ? t('sessions.durationFormat', { duration }) : '-'}
                    </td>
                    <td className="text-center">{roundCount > 0 ? t('sessions.roundsFormat', { count: roundCount }) : '0'}</td>
                    <td>
                      <span className={`badge ${session.ended_at ? 'badge-secondary' : 'badge-success'}`}>
                        {session.ended_at ? t('sessions.status.ended') : t('sessions.status.active')}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Recent Sessions - Mobile Cards */}
      <div className="lg:hidden">
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold">{t('sessions.recentSessions')}</h2>
        </div>
        {sessionsLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
              <span className="ml-2">{t('sessions.loading')}</span>
            </div>
          </div>
        ) : filteredSessions?.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? t('sessions.noMatch') : t('sessions.noSessions')}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions?.map((session: any) => {
              const duration = session.ended_at 
                ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 1000 / 60)
                : null;
              const roundCount = session.round?.[0]?.count || 0;

              return (
                <div key={session.id} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-400">#{session.id.slice(0, 8)}</span>
                        <span className={`badge text-xs ${session.ended_at ? 'badge-secondary' : 'badge-success'}`}>
                          {session.ended_at ? t('sessions.status.ended') : t('sessions.status.active')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="badge badge-info text-xs">
                          {gameOptions.find(g => g.value === session.game_key)?.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(session.started_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                        <div>
                          <span className="text-gray-500">{t('sessions.tableHeaders.user')}:</span> {session.user_id.slice(0, 8)}...
                        </div>
                        <div>
                          <span className="text-gray-500">{t('sessions.tableHeaders.duration')}:</span> {duration ? t('sessions.durationFormat', { duration }) : '-'}
                        </div>
                        <div>
                          <span className="text-gray-500">{t('sessions.tableHeaders.rounds')}:</span> {roundCount > 0 ? t('sessions.roundsFormat', { count: roundCount }) : '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}