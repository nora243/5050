'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/wagmi'
import RefreshButton from './RefreshButton'
import { useLanguage } from '@/hooks/useLanguage'

interface GameData {
  player: string
  betAmount: bigint
  isOdd: boolean
  blockNumber: bigint
  resolved: boolean
  won: boolean
  timestamp: bigint
  payout: bigint
}

interface PlayerStats {
  totalGames: bigint
  totalWins: bigint
  totalBetAmount: bigint
  totalPayout: bigint
}

export default function PlayerHistory() {
  const [mounted, setMounted] = useState(false)
  const { t, language } = useLanguage()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRefreshingStats, setIsRefreshingStats] = useState(false)
  const [isRefreshingGames, setIsRefreshingGames] = useState(false)
  const [isRefreshingRecent, setIsRefreshingRecent] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalGames, setTotalGames] = useState(0)
  const pageSize = 10
  const { address, isConnected } = useAccount()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Read player stats
  const { data: playerStats, refetch: refetchPlayerStats } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerStats',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  }) as { data: PlayerStats | undefined, refetch: () => void }

  // Read player game count
  const { data: playerGameCount, refetch: refetchPlayerGameCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerGameCount',
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  })

  // Read player games with pagination (newest first)
  const startIndex = Math.max(0, totalGames - (currentPage + 1) * pageSize)
  const { data: playerGames, refetch: refetchPlayerGames } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getPlayerGamesPaginated',
    args: [
      address as `0x${string}`, 
      BigInt(startIndex),
      BigInt(pageSize)
    ],
    query: { enabled: !!address && totalGames > 0 }
  }) as { data: GameData[] | undefined, refetch: () => void }

  // Update total games when playerGameCount changes
  useEffect(() => {
    if (playerGameCount) {
      setTotalGames(Number(playerGameCount))
    }
  }, [playerGameCount])

  // Read recent games from all players
  const { data: recentGames, refetch: refetchRecentGames } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRecentGames',
    args: [10n],
  }) as { data: GameData[] | undefined, refetch: () => void }

  // Listen for game transaction completion to refetch data
  useEffect(() => {
    const handleGameTransactionComplete = (event: CustomEvent) => {
      setIsRefreshing(true)
      // Add small delay to ensure blockchain data is updated
      setTimeout(() => {
        refetchPlayerStats()
        refetchPlayerGameCount() // Add this to update total games count
        refetchPlayerGames()
        refetchRecentGames()
        setIsRefreshing(false)
      }, 2000) // 2 second delay
    }

    window.addEventListener('gameTransactionComplete', handleGameTransactionComplete as EventListener)
    
    return () => {
      window.removeEventListener('gameTransactionComplete', handleGameTransactionComplete as EventListener)
    }
  }, [refetchPlayerStats, refetchPlayerGameCount, refetchPlayerGames, refetchRecentGames])

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const calculateWinRate = (wins: bigint, total: bigint) => {
    if (total === 0n) return 0
    return Number((wins * 100n) / total)
  }

  if (!mounted) {
    return <div className="text-white">{language === 'vi' ? 'Đang tải lịch sử...' : 'Loading history...'}</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Player Stats */}
      {isConnected && playerStats && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4 relative">
          <RefreshButton
            onRefresh={async () => {
              setIsRefreshingStats(true)
              try {
                await refetchPlayerStats()
              } finally {
                setTimeout(() => setIsRefreshingStats(false), 500)
              }
            }}
            title="Refetch player stats"
            isLoading={isRefreshingStats}
            disabled={isRefreshingStats}
          />
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white pr-8">📊 {language === 'vi' ? 'Thống kê của bạn' : 'Your Statistics'}</h2>
            {isRefreshing && (
              <div className="flex items-center text-yellow-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                {language === 'vi' ? 'Đang cập nhật...' : 'Updating...'}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded p-4 text-center">
              <div className="text-2xl font-bold text-white">{playerStats.totalGames.toString()}</div>
              <div className="text-gray-300">{language === 'vi' ? 'Tổng game' : 'Total Games'}</div>
            </div>
            <div className="bg-gray-700 rounded p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{playerStats.totalWins.toString()}</div>
              <div className="text-gray-300">{language === 'vi' ? 'Thắng' : 'Wins'}</div>
            </div>
            <div className="bg-gray-700 rounded p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {calculateWinRate(playerStats.totalWins, playerStats.totalGames).toFixed(1)}%
              </div>
              <div className="text-gray-300">{language === 'vi' ? 'Tỷ lệ thắng' : 'Win Rate'}</div>
            </div>
            <div className="bg-gray-700 rounded p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {formatEther(playerStats.totalPayout)} ETH
              </div>
              <div className="text-gray-300">{language === 'vi' ? 'Tổng thưởng' : 'Total Rewards'}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-4">
              <div className="text-lg font-semibold text-white">{language === 'vi' ? 'Tổng cược:' : 'Total Bet:'} {formatEther(playerStats.totalBetAmount)} ETH</div>
            </div>
            <div className="bg-gray-700 rounded p-4">
              <div className="text-lg font-semibold text-white">
                P&L: {' '}
                <span className={
                  playerStats.totalPayout >= playerStats.totalBetAmount 
                    ? 'text-green-400' 
                    : 'text-red-400'
                }>
                  {formatEther(playerStats.totalPayout - playerStats.totalBetAmount)} ETH
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Wallet Connected Message */}
      {!isConnected && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-gray-400 py-8">
            {language === 'vi' ? 'Vui lòng kết nối ví để xem lịch sử game' : 'Please connect your wallet to view game history'}
          </div>
        </div>
      )}

      {/* No Game History Message */}
      {isConnected && (!playerGames || playerGames.length === 0) && (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <div className="text-gray-400 py-8">
            {language === 'vi' ? 'Chưa có lịch sử game. Hãy chơi game đầu tiên!' : 'No game history yet. Play your first game!'}
          </div>
        </div>
      )}

      {/* Player Game History */}
      {isConnected && playerGames && playerGames.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6 space-y-4 relative">
          <RefreshButton
            onRefresh={async () => {
              setIsRefreshingGames(true)
              try {
                console.log('Refetching player games. Current totalGames:', totalGames)
                
                // Force refresh by incrementing key
                setRefreshKey(prev => prev + 1)
                
                // Refetch game count first, then games
                const gameCountResult = await refetchPlayerGameCount()
                console.log('New game count:', gameCountResult.data)
                
                // Wait for state update, then refetch games
                await new Promise(resolve => setTimeout(resolve, 200))
                await refetchPlayerGames()
                console.log('Player games refetched')
              } finally {
                setTimeout(() => setIsRefreshingGames(false), 500)
              }
            }}
            title="Refetch player games"
            isLoading={isRefreshingGames}
            disabled={isRefreshingGames}
          />
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white pr-8">🎮 {language === 'vi' ? 'Lịch sử game của bạn' : 'Your Game History'}</h2>
            {isRefreshing && (
              <div className="flex items-center text-yellow-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                {language === 'vi' ? 'Đang cập nhật...' : 'Updating...'}
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  <th className="px-4 py-2">{language === 'vi' ? 'Thời gian' : 'Time'}</th>
                  <th className="px-4 py-2">{language === 'vi' ? 'Cược' : 'Bet'}</th>
                  <th className="px-4 py-2">{language === 'vi' ? 'Chọn' : 'Choice'}</th>
                  <th className="px-4 py-2">{language === 'vi' ? 'Kết quả' : 'Result'}</th>
                  <th className="px-4 py-2">{language === 'vi' ? 'Thưởng' : 'Reward'}</th>
                </tr>
              </thead>
              <tbody>
                {playerGames.slice().reverse().map((game, index) => (
                  <tr key={index} className="bg-gray-800 border-b border-gray-700">
                    <td className="px-4 py-2">{formatTimestamp(game.timestamp)}</td>
                    <td className="px-4 py-2">{formatEther(game.betAmount)} ETH</td>
                    <td className="px-4 py-2">
                      <span className={game.isOdd ? 'text-blue-400' : 'text-purple-400'}>
                        {game.isOdd ? (language === 'vi' ? 'Lẻ' : 'Odd') : (language === 'vi' ? 'Chẵn' : 'Even')}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={game.won ? 'text-green-400' : 'text-red-400'}>
                        {game.won ? (language === 'vi' ? 'Thắng' : 'Win') : (language === 'vi' ? 'Thua' : 'Loss')}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {game.payout > 0n ? `${formatEther(game.payout)} ETH` : '0 ETH'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalGames > pageSize && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-400">
                {language === 'vi' ? 
                  `Hiển thị ${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, totalGames)} trong ${totalGames} game` :
                  `Showing ${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, totalGames)} of ${totalGames} games`
                }
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded"
                >
                  {language === 'vi' ? 'Trước' : 'Previous'}
                </button>
                <span className="px-3 py-1 text-gray-300">
                  {language === 'vi' ? 
                    `Trang ${currentPage + 1} / ${Math.ceil(totalGames / pageSize)}` :
                    `Page ${currentPage + 1} of ${Math.ceil(totalGames / pageSize)}`
                  }
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(totalGames / pageSize) - 1, currentPage + 1))}
                  disabled={currentPage >= Math.ceil(totalGames / pageSize) - 1}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded"
                >
                  {language === 'vi' ? 'Sau' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Global Recent Games */}
      <div className="bg-gray-800 rounded-lg p-6 space-y-4 relative">
        <RefreshButton
          onRefresh={async () => {
            setIsRefreshingRecent(true)
            try {
              await refetchRecentGames()
            } finally {
              setTimeout(() => setIsRefreshingRecent(false), 500)
            }
          }}
          title="Refetch recent games"
          isLoading={isRefreshingRecent}
          disabled={isRefreshingRecent}
        />
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white pr-8">🌍 {language === 'vi' ? 'Game gần đây (Tất cả người chơi)' : 'Recent Games (All Players)'}</h2>
          {isRefreshing && (
            <div className="flex items-center text-yellow-400 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
              {language === 'vi' ? 'Đang cập nhật...' : 'Updating...'}
            </div>
          )}
        </div>
        {recentGames && recentGames.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  <th className="px-4 py-2">{language === 'vi' ? 'Người chơi' : 'Player'}</th>
                  <th className="px-4 py-2">{language === 'vi' ? 'Thời gian' : 'Time'}</th>
                  <th className="px-4 py-2">{language === 'vi' ? 'Cược' : 'Bet'}</th>
                  <th className="px-4 py-2">{language === 'vi' ? 'Chọn' : 'Choice'}</th>
                  <th className="px-4 py-2">{language === 'vi' ? 'Kết quả' : 'Result'}</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.slice().reverse().map((game, index) => (
                  <tr key={index} className="bg-gray-800 border-b border-gray-700">
                    <td className="px-4 py-2">
                      <span className={game.player === address ? 'text-yellow-400 font-bold' : 'text-gray-300'}>
                        {game.player === address ? (language === 'vi' ? 'Bạn' : 'You') : formatAddress(game.player)}
                      </span>
                    </td>
                    <td className="px-4 py-2">{formatTimestamp(game.timestamp)}</td>
                    <td className="px-4 py-2">{formatEther(game.betAmount)} ETH</td>
                    <td className="px-4 py-2">
                      <span className={game.isOdd ? 'text-blue-400' : 'text-purple-400'}>
                        {game.isOdd ? (language === 'vi' ? 'Lẻ' : 'Odd') : (language === 'vi' ? 'Chẵn' : 'Even')}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={game.won ? 'text-green-400' : 'text-red-400'}>
                        {game.won ? (language === 'vi' ? 'Thắng' : 'Win') : (language === 'vi' ? 'Thua' : 'Loss')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            {language === 'vi' ? 'Chưa có game nào được chơi' : 'No games played yet'}
          </div>
        )}
      </div>
    </div>
  )
}