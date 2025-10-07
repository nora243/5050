'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import RefreshButton from './RefreshButton'
import PixelTitle from './PixelTitle'
import PixelButton from './PixelButton'
import PixelCard from './PixelCard'
import LanguageSwitcher from './LanguageSwitcher'
import TransactionPopup from './TransactionPopup'
import { useLanguage } from '@/hooks/useLanguage'

export default function GameInterface() {
    const [mounted, setMounted] = useState(false)
    const { address, isConnected } = useAccount()
    const { t, language } = useLanguage()

    const [betAmount, setBetAmount] = useState('0.0000001')
    const [selectedChoice, setSelectedChoice] = useState<'odd' | 'even'>('odd')
    const [errorMessage, setErrorMessage] = useState('')
    const [isRulesExpanded, setIsRulesExpanded] = useState(false)

    const [lastGameBet, setLastGameBet] = useState('')
    const [lastGameChoice, setLastGameChoice] = useState<'odd' | 'even'>('odd')
    const [lastGameResult, setLastGameResult] = useState<{ won: boolean, payout: string } | null>(null)
    const [isLoadingResult, setIsLoadingResult] = useState(false)
  const [lastGameHash, setLastGameHash] = useState<string>('')
  const [isRefreshingContract, setIsRefreshingContract] = useState(false)
  const [isRefreshingWinnings, setIsRefreshingWinnings] = useState(false)

  // Transaction popup states
  const [showTxPopup, setShowTxPopup] = useState(false)
  const [txPopupStatus, setTxPopupStatus] = useState<'pending' | 'success' | 'error' | null>(null)
  const [txErrorMessage, setTxErrorMessage] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

    const { writeContract, data: hash, isPending } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash })

    // Read player winnings
    const { data: winnings, refetch: refetchWinnings } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getPlayerWinnings',
        args: [address as `0x${string}`],
    })

    // Read current bet limits
    const { data: betLimits, refetch: refetchBetLimits } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getBetLimits',
    })

    // Read contract balance
    const { data: contractBalance, refetch: refetchContractBalance } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getContractBalance',
    })

    // Quick bet amounts
    const quickBetAmounts = ['0.0000001', '0.000001', '0.00001', '0.0001']

    const setQuickBet = (amount: string) => {
        setBetAmount(amount)
        setErrorMessage('')
    }

    // Set game info when transaction succeeds - only once per transaction
    useEffect(() => {
        if (hash && txSuccess && hash !== lastGameHash) {
            setLastGameBet(betAmount)
            setLastGameChoice(selectedChoice)
            setLastGameHash(hash)
            setIsLoadingResult(true)
        }
    }, [hash, txSuccess, betAmount, selectedChoice, lastGameHash])

    // Read latest game ID for the player
    const { data: playerGameIds, refetch: refetchPlayerGameIds } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getPlayerGameHistory',
        args: [address as `0x${string}`],
        query: {
            enabled: !!address && !!hash && txSuccess
        }
    })

    // Get the latest game ID (last in array)
    const latestGameId = playerGameIds && Array.isArray(playerGameIds) && playerGameIds.length > 0
        ? playerGameIds[playerGameIds.length - 1]
        : null

    // Read game result using the latest game ID
    const { data: gameData, refetch: refetchGameData } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getGame',
        args: latestGameId ? [latestGameId] : undefined,
        query: {
            enabled: !!latestGameId
        }
    })

    // Update game result when data is available
    useEffect(() => {
        if (gameData && txSuccess) {

            if (gameData.resolved) {
                setLastGameResult({
                    won: gameData.won,
                    payout: formatEther(gameData.payout)
                })
                setIsLoadingResult(false)
                console.log('Game result set:', { won: gameData.won, payout: formatEther(gameData.payout) })
            } else {
                console.log('Game not resolved yet, retrying in 2 seconds...')
                // If game is not resolved yet, try again after a delay
                setTimeout(() => {
                    refetchGameData()
                }, 2000)
            }
        }
    }, [gameData, txSuccess, refetchGameData])

    // Additional effect to fetch game data after transaction success with delay
    useEffect(() => {
        if (hash && txSuccess) {
            // Try to fetch player game IDs first, then game data
            const timer = setTimeout(() => {
                refetchPlayerGameIds().then(() => {
                    // After getting new game IDs, refetch game data
                    setTimeout(() => {
                        refetchGameData()
                    }, 1000)
                })
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [hash, txSuccess, refetchPlayerGameIds, refetchGameData])

    const playGame = async () => {
        if (!isConnected || !address) return

        try {
            setErrorMessage('')

            // Reset previous game result and popup states
            setLastGameResult(null)
            setIsLoadingResult(false)
            setLastGameHash('')
            setTxErrorMessage('')

            // Check if bet amount is greater than contract balance
            const betAmountWei = parseEther(betAmount)
            if (contractBalance && betAmountWei > contractBalance) {
                setErrorMessage(t.betTooHigh.replace('{amount}', betAmount).replace('{balance}', formatEther(contractBalance)))
                return
            }

            const isOdd = selectedChoice === 'odd'

            // Show pending popup
            setTxPopupStatus('pending')
            setShowTxPopup(true)

            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'createGame',
                args: [isOdd],
                value: parseEther(betAmount),
            })
        } catch (error) {
            console.error('Error playing game:', error)
            setErrorMessage(t.transactionError)
            setTxErrorMessage(error instanceof Error ? error.message : 'Unknown error')
            setTxPopupStatus('error')
            setShowTxPopup(true)
        }
    }

    // Handle transaction status changes
    useEffect(() => {
        if (hash && !isPending) {
            setErrorMessage('')
        }
    }, [hash, isPending])

    // Update popup status based on transaction status
    useEffect(() => {
        if (hash && txSuccess) {
            setTxPopupStatus('success')
            setShowTxPopup(true)
        }
    }, [hash, txSuccess])

    // Handle writeContract errors
    useEffect(() => {
        if (hash === undefined && isPending === false && txPopupStatus === 'pending') {
            // Transaction was rejected or failed to send
            setTxPopupStatus('error')
            setTxErrorMessage(language === 'vi' ? 'Giao dịch bị từ chối hoặc thất bại' : 'Transaction rejected or failed')
            setShowTxPopup(true)
        }
    }, [hash, isPending, txPopupStatus, language])

    // Function to close transaction popup
    const closeTxPopup = () => {
        setShowTxPopup(false)
        setTxPopupStatus(null)
        setTxErrorMessage('')
    }

    // Refetch data when transaction is confirmed
    useEffect(() => {
        if (txSuccess && hash) {
            // Refetch contract data
            refetchWinnings()
            refetchContractBalance()

            // Trigger refetch for PlayerHistory component via custom event
            window.dispatchEvent(new CustomEvent('gameTransactionComplete', {
                detail: { hash, address }
            }))
        }
    }, [txSuccess, hash, address, refetchWinnings, refetchContractBalance])

    const withdrawWinnings = async () => {
        if (!isConnected) return

        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'withdrawWinnings',
            })
        } catch (error) {
            console.error('Error withdrawing winnings:', error)
        }
    }

    if (!mounted) {
        return (
            <div className="max-w-4xl mx-auto p-6 space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white">50-50 Game</h1>
                    <p className="text-gray-300">
                        {t.loading}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pixel-bg-animated">
            <div className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Pixel Header */}
                <div className="text-center space-y-6">
                    <PixelTitle />
                    <div className="flex justify-center items-center space-x-4">
                        <span className="meme-emoji">🎮</span>
                        <p className="text-xl text-white pixel-font retro-cyan">
                            {t.tagline}
                        </p>
                        <span className="meme-emoji">🚀</span>
                    </div>
                    <div className="flex justify-center items-center space-x-4">
                        <ConnectButton />
                        <LanguageSwitcher />
                    </div>
                </div>

                {isConnected && (
                    <>
                        {/* Game Interface */}
                        <PixelCard title={t.gameZone} emoji="🎯" glowing className="rounded-2xl">
                            <div className="space-y-6">

                                {/* Contract Balance Info */}
                                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 relative border-2 border-white">
                                    <RefreshButton
                                        onRefresh={async () => {
                                            setIsRefreshingContract(true)
                                            try {
                                                await refetchContractBalance()
                                            } finally {
                                                setTimeout(() => setIsRefreshingContract(false), 500)
                                            }
                                        }}
                                        title="Refetch contract balance"
                                        className="absolute top-2 right-2"
                                        variant="primary"
                                        isLoading={isRefreshingContract}
                                        disabled={isRefreshingContract}
                                    />
                                    <div className="flex items-center space-x-3 pr-8">
                                        <span className="text-3xl">🏦</span>
                                        <div>
                                            <p className="pixel-font text-white font-bold">{t.contractVault}</p>
                                            <p className="text-2xl font-bold retro-green glitch-text">
                                                {contractBalance ? formatEther(contractBalance) : '0'} ETH
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bet Amount */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">💎</span>
                                        <label className="pixel-font text-lg font-bold retro-cyan">
                                            {t.betAmount} <span className="text-gray-400">(MIN: {betLimits ? formatEther(betLimits[0]) : '0.0000001'} - MAX: {betLimits ? formatEther(betLimits[1]) : '0.0001'})</span>
                                        </label>
                                    </div>

                                    {/* Quick Bet Buttons */}
                                    <div className="grid grid-cols-4 gap-3 mb-4">
                                        {quickBetAmounts.map((amount) => (
                                            <PixelButton
                                                key={amount}
                                                onClick={() => setQuickBet(amount)}
                                                variant={betAmount === amount ? 'warning' : 'secondary'}
                                                disabled={isPending || isConfirming}
                                                size="sm"
                                            >
                                                💎 {amount}
                                            </PixelButton>
                                        ))}
                                    </div>

                                    <input
                                        type="number"
                                        step="0.0000001"
                                        min="0.0000001"
                                        max="0.0001"
                                        value={betAmount}
                                        onChange={(e) => {
                                            setBetAmount(e.target.value)
                                            setErrorMessage('')
                                        }}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={isPending || isConfirming}
                                        placeholder="Nhập số tiền cược..."
                                    />
                                </div>

                                {/* Choice Selection */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">🎮</span>
                                        <label className="pixel-font text-lg font-bold retro-cyan">
                                            {t.chooseYourSide}
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <PixelButton
                                            onClick={() => setSelectedChoice('odd')}
                                            variant={selectedChoice === 'odd' ? 'primary' : 'secondary'}
                                            disabled={isPending || isConfirming}
                                            size="lg"
                                            className="relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                <span className="text-2xl">🎲</span>
                                                <span>{t.odd}</span>
                                            </div>
                                        </PixelButton>
                                        <PixelButton
                                            onClick={() => setSelectedChoice('even')}
                                            variant={selectedChoice === 'even' ? 'primary' : 'secondary'}
                                            disabled={isPending || isConfirming}
                                            size="lg"
                                            className="relative overflow-hidden"
                                        >
                                            <div className="flex items-center justify-center space-x-2">
                                                <span className="text-2xl">🎯</span>
                                                <span>{t.even}</span>
                                            </div>
                                        </PixelButton>
                                    </div>
                                </div>

                                {/* Error Message */}
                                {errorMessage && (
                                    <div className="bg-red-800 border border-red-600 rounded p-4">
                                        <p className="text-red-200 text-sm">⚠️ {errorMessage}</p>
                                    </div>
                                )}

                                {/* Play Button */}
                                <PixelButton
                                    onClick={playGame}
                                    disabled={isPending || isConfirming || !betAmount || !!errorMessage}
                                    variant="success"
                                    size="lg"
                                    loading={isPending || isConfirming}
                                    className="w-full"
                                >
                                    {isPending ? `🚀 ${t.sendingTx}` : isConfirming ? `⏳ ${t.confirming}` : `🎮 ${t.playGame}`}
                                </PixelButton>
                            </div>
                        </PixelCard>

                        {/* Latest Game Result */}
                        {(lastGameResult || isLoadingResult) && (
                            <PixelCard title={t.gameResult} emoji="🎲" className="rounded-2xl"
                                glowing={lastGameResult?.won}>

                                {isLoadingResult && !lastGameResult ? (
                                    <div className="text-center py-8">
                                        <div className="flex justify-center items-center space-x-2 mb-4">
                                            <div className="pixel-loading"></div>
                                            <div className="pixel-loading"></div>
                                            <div className="pixel-loading"></div>
                                        </div>
                                        <p className="text-xl pixel-font retro-yellow glitch-text">
                                            🔮 {t.processingResult}
                                        </p>
                                    </div>
                                ) : lastGameResult ? (
                                    <div className="space-y-6">
                                        {/* Win/Loss Status */}
                                        <div className="text-center">
                                            <div className={`text-6xl mb-4 ${lastGameResult.won ? 'animate-bounce' : 'glitch-text'}`}>
                                                {lastGameResult.won ? '🎉' : '💥'}
                                            </div>
                                            <h2 className={`text-4xl pixel-title-font font-bold ${lastGameResult.won ? 'retro-green' : 'retro-red'
                                                }`}>
                                                {lastGameResult.won ? t.victory : t.defeat}
                                            </h2>
                                        </div>

                                        {/* Game Details */}
                                        <div className="grid grid-cols-2 gap-6 text-lg pixel-font">
                                            <div className="text-center p-4 bg-gray-700 rounded-lg border-2 border-gray-500">
                                                <p className="retro-cyan mb-2">{t.yourChoice}</p>
                                                <p className="text-yellow-400 font-bold text-xl">
                                                    {lastGameChoice === 'odd' ? `🎲 ${t.odd}` : `🎯 ${t.even}`}
                                                </p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-700 rounded-lg border-2 border-gray-500">
                                                <p className="retro-cyan mb-2">{t.betAmountLabel}</p>
                                                <p className="text-white font-bold text-xl">{lastGameBet} ETH</p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-700 rounded-lg border-2 border-gray-500">
                                                <p className="retro-cyan mb-2">{t.payout}</p>
                                                <p className={`font-bold text-xl ${lastGameResult.won ? 'retro-green' : 'retro-red'}`}>
                                                    {lastGameResult.won ? `+${lastGameResult.payout} ETH` : '0 ETH'}
                                                </p>
                                            </div>
                                            <div className="text-center p-4 bg-gray-700 rounded-lg border-2 border-gray-500">
                                                <p className="retro-cyan mb-2">{t.txHash}</p>
                                                <p className="text-blue-300 font-mono text-xs break-all">
                                                    {lastGameHash}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </PixelCard>
                        )}

                        {/* Winnings */}
                        <PixelCard title={t.winningsVault} emoji="💰" className="rounded-2xl relative">
                            <RefreshButton
                                onRefresh={async () => {
                                    setIsRefreshingWinnings(true)
                                    try {
                                        await refetchWinnings()
                                    } finally {
                                        setTimeout(() => setIsRefreshingWinnings(false), 500)
                                    }
                                }}
                                title="Refetch winnings"
                                variant="success"
                                isLoading={isRefreshingWinnings}
                                disabled={isRefreshingWinnings}
                            />
                            <div className="flex items-center justify-between">
                                <div className="text-xl pixel-font retro-green">
                                    {t.balance} <span className="text-white font-bold glitch-text">
                                        {winnings ? formatEther(winnings) : '0'} ETH
                                    </span>
                                </div>
                                <PixelButton
                                    onClick={withdrawWinnings}
                                    disabled={isPending || isConfirming || !winnings || winnings === 0n}
                                    variant="warning"
                                    size="md"
                                >
                                    💸 {t.withdraw}
                                </PixelButton>
                            </div>
                        </PixelCard>

                    </>
                )}

                {/* Game Rules - Always visible */}
                <PixelCard title={t.gameRules} emoji="📋" className="rounded-2xl">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold text-white">📋 {t.rulesTitle}</h2>
                            <button
                                onClick={() => setIsRulesExpanded(!isRulesExpanded)}
                                className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                                <span className="text-gray-300 text-sm">
                                    {isRulesExpanded ? t.collapse : t.expand}
                                </span>
                                <svg
                                    className={`w-4 h-4 text-gray-300 transition-transform ${isRulesExpanded ? 'rotate-180' : ''
                                        }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {isRulesExpanded && (
                            <>
                                {/* Basic Rules */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-blue-300">🎮 {t.howToPlay}</h3>
                                    <ul className="text-gray-300 space-y-2 ml-4">
                                        {t.rules.howTo.map((rule, index) => (
                                            <li key={index}>• {rule}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Algorithm Details */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-blue-300">🔬 {t.algorithm}</h3>
                                    <div className="bg-gray-700 rounded p-4 space-y-3">
                                        <div>
                                            <p className="text-yellow-300 font-semibold">
                                                1. {language === 'vi' ? 'Smart Contract tạo số ngẫu nhiên' : 'Smart Contract generates random number'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-yellow-300 font-semibold">
                                                2. {language === 'vi' ? 'Chuyển đổi thành số:' : 'Convert to number:'}
                                            </p>
                                            <p className="text-gray-300 text-sm ml-4">
                                                <span className="font-mono bg-gray-800 px-2 py-1 rounded">uint256(randomHash) % 10</span> → {language === 'vi' ? 'Lấy chữ số cuối (0-9)' : 'Get last digit (0-9)'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-yellow-300 font-semibold">
                                                3. {language === 'vi' ? 'Xác định Chẵn/Lẻ:' : 'Determine Odd/Even:'}
                                            </p>
                                            <p className="text-gray-300 text-sm ml-4">
                                                <span className="font-mono bg-gray-800 px-2 py-1 rounded">lastDigit % 2 == 1</span> →
                                                <span className="text-blue-400 ml-2">true = {language === 'vi' ? 'Lẻ' : 'Odd'}</span>,
                                                <span className="text-purple-400 ml-2">false = {language === 'vi' ? 'Chẵn' : 'Even'}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Payout Rules */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-blue-300">💰 {t.payoutMechanism}</h3>
                                    <div className="bg-gray-700 rounded p-4 space-y-2">
                                        {t.rules.payoutRules.map((rule, index) => (
                                            <p key={index} className="text-gray-300">
                                                {index === 0 && <><strong>{rule.split(':')[0]}:</strong> <span className="text-green-400">{rule.split(':')[1]}</span></>}
                                                {index === 1 && <><strong>{rule.split(':')[0]}:</strong> <span className="text-yellow-400">{rule.split(':')[1]}</span></>}
                                                {index === 2 && <><strong>{rule.split(':')[0]}:</strong> <span className="text-red-400">{rule.split(':')[1]}</span></>}
                                                {index === 3 && <em>{rule}</em>}
                                            </p>
                                        ))}
                                    </div>
                                </div>

                                {/* Fairness */}
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold text-blue-300">✅ {t.fairness}</h3>
                                    <ul className="text-gray-300 space-y-1 ml-4">
                                        {t.rules.fairnessPoints.map((point, index) => (
                                            <li key={index}>• <strong>{point.split(':')[0]}:</strong> {point.split(':')[1]}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>
                </PixelCard>

                {/* Transaction Popup */}
                <TransactionPopup
                    isOpen={showTxPopup}
                    onClose={closeTxPopup}
                    status={txPopupStatus}
                    hash={hash}
                    errorMessage={txErrorMessage}
                    language={language}
                />
            </div>
        </div>
    )
}