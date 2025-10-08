import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, safe, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || ''

const getConfig = () => {
  return createConfig({
    chains: [base],
    connectors: [
      injected(),
      walletConnect({ projectId }),
      safe(),
    ],
    ssr: true,
    transports: {
      [base.id]: http()
    },
  });
}

export const config = getConfig()

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE as `0x${string}`

export const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "bool", "name": "_isOdd", "type": "bool" }],
    "name": "createGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdrawWinnings",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "gameId", "type": "bytes32" }],
    "name": "getGame",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "player", "type": "address" },
          { "internalType": "uint256", "name": "betAmount", "type": "uint256" },
          { "internalType": "bool", "name": "isOdd", "type": "bool" },
          { "internalType": "uint256", "name": "blockNumber", "type": "uint256" },
          { "internalType": "bool", "name": "resolved", "type": "bool" },
          { "internalType": "bool", "name": "won", "type": "bool" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "payout", "type": "uint256" }
        ],
        "internalType": "struct FiftyFiftyGame.Game",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
    "name": "getPlayerWinnings",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractBalance",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBetLimits",
    "outputs": [
      { "internalType": "uint256", "name": "min", "type": "uint256" },
      { "internalType": "uint256", "name": "max", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_minBet", "type": "uint256" }],
    "name": "setMinBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_maxBet", "type": "uint256" }],
    "name": "setMaxBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_minBet", "type": "uint256" },
      { "internalType": "uint256", "name": "_maxBet", "type": "uint256" }
    ],
    "name": "setBetLimits",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "fundContract",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "withdrawFromContract",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "gameId", "type": "bytes32" }],
    "name": "resolveGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalPendingWinnings",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bool", "name": "_stop", "type": "bool" }],
    "name": "setEmergencyStop",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emergencyStop",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
    "name": "getPlayerGameHistory",
    "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
    "name": "getPlayerGameCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "player", "type": "address" }],
    "name": "getPlayerStats",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "totalGames", "type": "uint256" },
          { "internalType": "uint256", "name": "totalWins", "type": "uint256" },
          { "internalType": "uint256", "name": "totalBetAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "totalPayout", "type": "uint256" }
        ],
        "internalType": "struct FiftyFiftyGame.PlayerStats",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "player", "type": "address" },
      { "internalType": "uint256", "name": "offset", "type": "uint256" },
      { "internalType": "uint256", "name": "limit", "type": "uint256" }
    ],
    "name": "getPlayerGamesPaginated",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "player", "type": "address" },
          { "internalType": "uint256", "name": "betAmount", "type": "uint256" },
          { "internalType": "bool", "name": "isOdd", "type": "bool" },
          { "internalType": "uint256", "name": "blockNumber", "type": "uint256" },
          { "internalType": "bool", "name": "resolved", "type": "bool" },
          { "internalType": "bool", "name": "won", "type": "bool" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "payout", "type": "uint256" }
        ],
        "internalType": "struct FiftyFiftyGame.Game[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "count", "type": "uint256" }],
    "name": "getRecentGames",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "player", "type": "address" },
          { "internalType": "uint256", "name": "betAmount", "type": "uint256" },
          { "internalType": "bool", "name": "isOdd", "type": "bool" },
          { "internalType": "uint256", "name": "blockNumber", "type": "uint256" },
          { "internalType": "bool", "name": "resolved", "type": "bool" },
          { "internalType": "bool", "name": "won", "type": "bool" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "payout", "type": "uint256" }
        ],
        "internalType": "struct FiftyFiftyGame.Game[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "gameId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "betAmount", "type": "uint256" },
      { "indexed": false, "internalType": "bool", "name": "isOdd", "type": "bool" }
    ],
    "name": "GameCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "bytes32", "name": "gameId", "type": "bytes32" },
      { "indexed": true, "internalType": "address", "name": "player", "type": "address" },
      { "indexed": false, "internalType": "bool", "name": "won", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "payout", "type": "uint256" }
    ],
    "name": "GameResolved",
    "type": "event"
  }
] as const