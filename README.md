# Wallet Service

A microservice for managing cryptocurrency wallets and transactions in the Trade-Lynk platform. This service handles wallet creation, transaction management, and blockchain integration for multiple cryptocurrencies (BTC, ETH, TRX, BNB).

## Features

- Multi-cryptocurrency wallet management
- Transaction processing and history
- Blockchain integration with adapters for different cryptocurrencies
- Webhook support for transaction notifications
- Secure authentication and authorization
- Rate limiting and caching with Redis
- MongoDB for data persistence

## Prerequisites

- Node.js 18+ or Bun.js
- MongoDB
- Redis
- Access to blockchain nodes (BTC, ETH, TRX, BNB)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/wallet-service
REDIS_URI=redis://localhost:6379
JWT_SECRET=your-jwt-secret
BTC_NODE_URL=your-btc-node-url
ETH_NODE_URL=your-eth-node-url
TRX_NODE_URL=your-trx-node-url
BNB_NODE_URL=your-bnb-node-url
WEBHOOK_SECRET=your-webhook-secret
```

## Installation

1. Install dependencies:
```bash
bun install
```

2. Start the development server:
```bash
bun run dev
```

## API Endpoints

### Wallets

- `POST /api/v1/wallets` - Create a new wallet
- `GET /api/v1/wallets/:currency` - Get a specific wallet
- `GET /api/v1/wallets` - Get all wallets for a user

### Transactions

- `POST /api/v1/wallets/:walletId/transactions` - Send a transaction
- `GET /api/v1/wallets/:walletId/transactions` - Get transaction history
- `GET /api/v1/wallets/transactions/:txHash` - Get a specific transaction

### Webhooks

- `POST /api/v1/wallets/webhooks/:currency` - Process blockchain notifications

## Architecture

The service follows a clean architecture pattern with the following components:

- **Adapters**: Blockchain-specific implementations for different cryptocurrencies
- **Controllers**: HTTP request handlers
- **Services**: Business logic implementation
- **Models**: Data structures and validation
- **Middleware**: Authentication, error handling, etc.
- **Routes**: API endpoint definitions

## Security

- JWT-based authentication
- Secure storage of private keys
- Input validation using Zod
- Rate limiting with Redis
- Error handling and logging

## Development

1. Install dependencies:
```bash
bun install
```

2. Run tests:
```bash
bun test
```

3. Build for production:
```bash
bun run build
```

## Production Deployment

1. Build the application:
```bash
bun run build
```

2. Start the production server:
```bash
bun run start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 