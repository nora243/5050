'use client'

import { useState, useEffect } from 'react'

export type Language = 'en' | 'vi'

const translations = {
  en: {
    // Header
    tagline: "CHOOSE ODD OR EVEN • PLACE YOUR BET • LET THE BLOCKCHAIN DECIDE YOUR FATE!",
    
    // Game Zone
    gameZone: "GAME ZONE",
    contractVault: "CONTRACT VAULT:",
    betAmount: "BET AMOUNT (ETH)",
    chooseYourSide: "CHOOSE YOUR SIDE",
    odd: "ODD",
    even: "EVEN",
    playGame: "PLAY GAME!",
    sendingTx: "SENDING TX...",
    confirming: "CONFIRMING...",
    
    // Game Result
    gameResult: "GAME RESULT",
    processingResult: "PROCESSING GAME RESULT...",
    victory: "VICTORY!",
    defeat: "DEFEAT!",
    yourChoice: "YOUR CHOICE",
    betAmountLabel: "BET AMOUNT",
    payout: "PAYOUT",
    txHash: "TX HASH",
    
    // Winnings
    winningsVault: "WINNINGS VAULT",
    balance: "BALANCE:",
    withdraw: "WITHDRAW",
    
    // Game Rules
    gameRules: "GAME RULES & MECHANICS",
    rulesTitle: "Game Rules & Mechanics",
    expand: "Expand",
    collapse: "Collapse",
    howToPlay: "How to Play",
    algorithm: "Result Algorithm",
    payoutMechanism: "Payout Mechanism",
    fairness: "Fairness",
    
    // Rules content
    rules: {
      howTo: [
        "Choose bet amount (use quick bet or enter manually)",
        "Choose Odd or Even",
        "Click 'Play Game!' to send transaction",
        "Wait for transaction confirmation on blockchain",
        "Receive result and winnings automatically (if won)"
      ],
      algorithmSteps: [
        "Smart Contract generates random number:",
        "Convert to number:",
        "Determine Odd/Even:"
      ],
      payoutRules: [
        "If win: Payout = Bet × 2 × 95% = Bet × 1.9",
        "House Edge: 5% (operation fee)",
        "If lose: Lose entire bet amount",
        "Example: Bet 0.1 ETH → Win 0.19 ETH → Profit 0.09 ETH"
      ],
      fairnessPoints: [
        "Provably Fair: All calculations on blockchain, 100% transparent",
        "Tamper-proof: Results based on immutable blockchain data",
        "Unpredictable: Uses multiple entropy sources",
        "Open Source: Smart contract code publicly auditable"
      ]
    },
    
    // PlayerHistory
    playerStats: "Your Statistics",
    updating: "Updating...",
    totalGames: "Total Games",
    wins: "Wins",
    winRate: "Win Rate",
    totalRewards: "Total Rewards",
    totalBet: "Total Bet:",
    profitLoss: "P&L:",
    playerHistory: "Your Game History",
    recentGames: "Recent Games (All Players)",
    noHistory: "No game history yet",
    noRecentGames: "No recent games",
    loadingHistory: "Loading history...",
    choice: "Choice",
    result: "Result",
    bet: "Bet",
    reward: "Reward",
    time: "Time",
    player: "Player",
    page: "Page",
    of: "of",
    
    // Errors
    betTooHigh: "Bet amount ({amount} ETH) is higher than contract balance ({balance} ETH). Please reduce bet amount.",
    transactionError: "Error occurred while sending transaction. Please try again.",
    loading: "Loading..."
  },
  vi: {
    // Header
    tagline: "CHỌN CHẴN LẺ • ĐẶT CƯỢC • ĐỂ BLOCKCHAIN QUYẾT ĐỊNH SỐ PHẬN BẠN!",
    
    // Game Zone
    gameZone: "KHU VỰC GAME",
    contractVault: "KHO HỢP ĐỒNG:",
    betAmount: "SỐ TIỀN CƯỢC (ETH)",
    chooseYourSide: "CHỌN PHÍA",
    odd: "LẺ",
    even: "CHẴN",
    playGame: "CHƠI GAME!",
    sendingTx: "ĐANG GỬI TX...",
    confirming: "ĐANG XÁC NHẬN...",
    
    // Game Result
    gameResult: "KẾT QUẢ GAME",
    processingResult: "ĐANG XỬ LÝ KẾT QUẢ GAME...",
    victory: "THẮNG!",
    defeat: "THUA!",
    yourChoice: "LỰA CHỌN",
    betAmountLabel: "TIỀN CƯỢC",
    payout: "TIỀN THƯỞNG",
    txHash: "HASH GD",
    
    // Winnings
    winningsVault: "KHO TIỀN THƯỞNG",
    balance: "SỐ DƯ:",
    withdraw: "RÚT TIỀN",
    
    // Game Rules
    gameRules: "LUẬT CHƠI & CƠ CHẾ",
    rulesTitle: "Luật chơi & Cơ chế hoạt động",
    expand: "Mở rộng",
    collapse: "Thu gọn",
    howToPlay: "Cách chơi",
    algorithm: "Thuật toán xác định kết quả",
    payoutMechanism: "Cơ chế thanh toán",
    fairness: "Tính công bằng",
    
    // Rules content
    rules: {
      howTo: [
        "Chọn số tiền cược (sử dụng quick bet hoặc nhập tự do)",
        "Chọn Lẻ (Odd) hoặc Chẵn (Even)",
        "Click 'Chơi Game!' để gửi giao dịch",
        "Đợi transaction được confirm trên blockchain",
        "Nhận kết quả và tiền thưởng tự động (nếu thắng)"
      ],
      algorithmSteps: [
        "Smart Contract tạo số ngẫu nhiên:",
        "Chuyển đổi thành số:",
        "Xác định Chẵn/Lẻ:"
      ],
      payoutRules: [
        "Nếu thắng: Payout = Bet × 2 × 95% = Bet × 1.9",
        "House Edge: 5% (phí vận hành)",
        "Nếu thua: Mất toàn bộ tiền cược",
        "Ví dụ: Cược 0.1 ETH → Thắng nhận 0.19 ETH → Lãi 0.09 ETH"
      ],
      fairnessPoints: [
        "Provably Fair: Tất cả tính toán trên blockchain, minh bạch 100%",
        "Không thể can thiệp: Kết quả dựa trên dữ liệu blockchain bất biến",
        "Không thể dự đoán: Sử dụng nhiều nguồn entropy khác nhau",
        "Open Source: Smart contract code công khai, có thể audit"
      ]
    },
    
    // PlayerHistory
    playerStats: "Thống kê của bạn",
    updating: "Đang cập nhật...",
    totalGames: "Tổng game",
    wins: "Thắng",
    winRate: "Tỷ lệ thắng",
    totalRewards: "Tổng thưởng",
    totalBet: "Tổng cược:",
    profitLoss: "P&L:",
    playerHistory: "Lịch sử game của bạn",
    recentGames: "Game gần đây (Tất cả người chơi)",
    noHistory: "Chưa có lịch sử game",
    noRecentGames: "Không có game gần đây",
    loadingHistory: "Đang tải lịch sử...",
    choice: "Lựa chọn",
    result: "Kết quả",
    bet: "Cược",
    reward: "Thưởng",
    time: "Thời gian",
    player: "Người chơi",
    page: "Trang",
    of: "của",
    
    // Errors
    betTooHigh: "Số tiền cược ({amount} ETH) lớn hơn số dư hợp đồng ({balance} ETH). Vui lòng giảm số tiền cược.",
    transactionError: "Có lỗi xảy ra khi gửi giao dịch. Vui lòng thử lại.",
    loading: "Đang tải..."
  }
}

export const useLanguage = () => {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const savedLanguage = localStorage.getItem('game-language') as Language
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'vi')) {
      setLanguage(savedLanguage)
    }
  }, [])

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem('game-language', newLanguage)
  }

  const t = translations[language]

  return {
    language,
    changeLanguage,
    t
  }
}