# Decentralized Auction Platform

A modern, decentralized auction platform built on the Avalanche blockchain, featuring real-time updates, secure bidding, and NFT integration.

## Features

- 🚀 **Real-time Updates**: Live bid updates and auction status changes
- 💰 **Secure Bidding**: Blockchain-based bidding system with smart contract integration
- 🖼️ **NFT Support**: Create and trade NFTs through auctions
- 📱 **Responsive Design**: Optimized for all devices
- 🔄 **Auto-save Drafts**: Never lose your auction creation progress
- 🔗 **Wallet Integration**: Seamless wallet connection with persistence
- ⏰ **Live Countdown**: Real-time auction end time tracking
- 📊 **Bid History**: Comprehensive bid tracking and history
- 🔒 **Security**: Smart contract security and input validation
- 🌐 **WebSocket**: Real-time communication for instant updates

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Blockchain**: Avalanche, ethers.js
- **Real-time**: Socket.IO
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns
- **Icons**: Lucide Icons
- **Fonts**: Google Fonts (Raleway, Poppins)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or other Web3 wallet
- Avalanche C-Chain testnet account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/auction-app.git
   cd auction-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration.

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Smart Contract Deployment

1. Deploy the Auction contract:
   ```bash
   npx hardhat run scripts/deploy.ts --network avalanche
   ```

2. Update the contract address in your environment variables.

## Project Structure

```
auction-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auction/           # Auction pages
│   └── create/            # Auction creation
├── components/            # React components
├── contracts/            # Smart contracts
├── hooks/                # Custom hooks
├── lib/                  # Utilities
└── public/              # Static assets
```

## Key Features Implementation

### Real-time Updates
- WebSocket integration for live bid updates
- Auction status changes
- Connection state management
- Reconnection logic

### Bidding System
- Minimum bid increment validation
- Bid history tracking
- Transaction status monitoring
- Gas price optimization

### Mobile Responsiveness
- Responsive grid layouts
- Adaptive typography
- Touch-friendly interfaces
- Optimized images

### Wallet Integration
- Persistent wallet connection
- Chain ID management
- Connection state recovery
- Error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Avalanche](https://www.avax.network/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.IO](https://socket.io/)
- [ethers.js](https://docs.ethers.org/) 