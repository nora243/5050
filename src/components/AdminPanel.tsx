'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useReadContract, useChainId } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { CONTRACT_ADDRESS_MAINNET, CONTRACT_ADDRESS_SEPOLIA, CONTRACT_ABI } from '@/lib/wagmi'
import RefreshButton from './RefreshButton'

export default function AdminPanel() {
    const [mounted, setMounted] = useState(false)
    const { address, isConnected } = useAccount()
    const [minBet, setMinBet] = useState('0.000001')
    const [maxBet, setMaxBet] = useState('0.001')
    const [fundAmount, setFundAmount] = useState('0.1')
    const [withdrawAmount, setWithdrawAmount] = useState('0.01')
    const [isRefreshingContract, setIsRefreshingContract] = useState(false)

    const { writeContract, isPending } = useWriteContract()

    const chainId = useChainId()
    // Determine contract address based on connected chain
    const CONTRACT_ADDRESS = chainId == Number(process.env.NEXT_PUBLIC_CHAIN_ID_BASE_MAINNET)
        ? CONTRACT_ADDRESS_MAINNET
        : chainId == Number(process.env.NEXT_PUBLIC_CHAIN_ID_BASE_SEPOLIA)
            ? CONTRACT_ADDRESS_SEPOLIA
            : CONTRACT_ADDRESS_SEPOLIA

    // Read contract owner
    const { data: contractOwner } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'owner',
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

    useEffect(() => {
        setMounted(true)
        if (betLimits) {
            setMinBet(formatEther(betLimits[0]))
            setMaxBet(formatEther(betLimits[1]))
        }
    }, [betLimits])

    const updateMinBet = async () => {
        if (!isConnected) return
        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'setMinBet',
                args: [parseEther(minBet)],
            })
        } catch (error) {
            console.error('Error updating min bet:', error)
        }
    }

    const updateMaxBet = async () => {
        if (!isConnected) return
        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'setMaxBet',
                args: [parseEther(maxBet)],
            })
        } catch (error) {
            console.error('Error updating max bet:', error)
        }
    }

    const updateBothLimits = async () => {
        if (!isConnected) return
        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'setBetLimits',
                args: [parseEther(minBet), parseEther(maxBet)],
            })
        } catch (error) {
            console.error('Error updating bet limits:', error)
        }
    }

    const fundContract = async () => {
        if (!isConnected || !fundAmount) return
        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'fundContract',
                value: parseEther(fundAmount),
            })
        } catch (error) {
            console.error('Error funding contract:', error)
        }
    }

    const withdrawFromContract = async () => {
        if (!isConnected || !withdrawAmount) return
        try {
            writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'withdrawFromContract',
                args: [parseEther(withdrawAmount)],
            })
        } catch (error) {
            console.error('Error withdrawing from contract:', error)
        }
    }

    if (!mounted) {
        return <div className="text-white">Đang tải Admin Panel...</div>
    }

    // Only show admin panel if user is the contract owner
    if (!isConnected || !address || !contractOwner || address.toLowerCase() !== contractOwner.toLowerCase()) {
        return null
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="bg-red-900 rounded-lg p-6 space-y-6">
                <h2 className="text-2xl font-semibold text-white">🔧 Admin Panel (Chỉ Owner)</h2>

                {/* Contract Info */}
                <div className="bg-gray-800 rounded p-4 space-y-2 relative">
                    <RefreshButton
                        onRefresh={async () => {
                            setIsRefreshingContract(true)
                            try {
                                await Promise.all([
                                    refetchBetLimits(),
                                    refetchContractBalance()
                                ])
                            } finally {
                                setTimeout(() => setIsRefreshingContract(false), 500)
                            }
                        }}
                        title="Refetch contract info"
                        className="absolute top-2 right-2"
                        isLoading={isRefreshingContract}
                        disabled={isRefreshingContract}
                    />
                    <h3 className="text-lg font-semibold text-white pr-8">Thông tin Contract</h3>
                    <p className="text-gray-300">
                        <strong>Contract Balance:</strong> {contractBalance ? formatEther(contractBalance) : '0'} ETH
                    </p>
                    <p className="text-gray-300">
                        <strong>Min Bet hiện tại:</strong> {betLimits ? formatEther(betLimits[0]) : '0'} ETH
                    </p>
                    <p className="text-gray-300">
                        <strong>Max Bet hiện tại:</strong> {betLimits ? formatEther(betLimits[1]) : '0'} ETH
                    </p>
                </div>

                {/* Update Bet Limits */}
                <div className="bg-gray-800 rounded p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Cập nhật Mức cược</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300">
                                Min Bet (ETH)
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={minBet}
                                onChange={(e) => setMinBet(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isPending}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">
                                Max Bet (ETH)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={maxBet}
                                onChange={(e) => setMaxBet(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isPending}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={updateMinBet}
                            disabled={isPending || !isConnected}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Cập nhật Min Bet
                        </button>

                        <button
                            onClick={updateMaxBet}
                            disabled={isPending || !isConnected}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Cập nhật Max Bet
                        </button>

                        <button
                            onClick={updateBothLimits}
                            disabled={isPending || !isConnected}
                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Cập nhật Cả Hai
                        </button>
                    </div>
                </div>

                {/* Fund Contract */}
                <div className="bg-gray-800 rounded p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-white">Quản lý Tài chính</h3>

                    {/* Fund Contract Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                💰 Nạp tiền vào Contract (ETH)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={fundAmount}
                                    onChange={(e) => setFundAmount(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    disabled={isPending}
                                    placeholder="Nhập số ETH muốn nạp..."
                                />
                                <button
                                    onClick={fundContract}
                                    disabled={isPending || !isConnected || !fundAmount}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors whitespace-nowrap"
                                >
                                    💰 Nạp
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                💸 Rút tiền từ Contract (ETH)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    disabled={isPending}
                                    placeholder="Nhập số ETH muốn rút..."
                                />
                                <button
                                    onClick={withdrawFromContract}
                                    disabled={isPending || !isConnected || !withdrawAmount}
                                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors whitespace-nowrap"
                                >
                                    💸 Rút
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-400 mb-2">⚡ Nhanh - Nạp tiền:</p>
                            <div className="flex gap-2 flex-wrap">
                                {['0.01', '0.05', '0.1', '0.5', '1.0'].map((amount) => (
                                    <button
                                        key={`fund-${amount}`}
                                        onClick={() => setFundAmount(amount)}
                                        className="bg-green-500 hover:bg-green-600 text-white text-xs py-1 px-3 rounded transition-colors"
                                    >
                                        {amount} ETH
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm text-gray-400 mb-2">⚡ Nhanh - Rút tiền:</p>
                            <div className="flex gap-2 flex-wrap">
                                {['0.01', '0.05', '0.1', '0.5'].map((amount) => (
                                    <button
                                        key={`withdraw-${amount}`}
                                        onClick={() => setWithdrawAmount(amount)}
                                        className="bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-3 rounded transition-colors"
                                    >
                                        {amount} ETH
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {!isConnected && (
                    <div className="bg-red-800 border border-red-600 rounded p-4">
                        <p className="text-red-200">⚠️ Vui lòng kết nối ví để sử dụng Admin Panel</p>
                    </div>
                )}
            </div>
        </div>
    )
}