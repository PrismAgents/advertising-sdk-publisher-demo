# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production application
- `npm run start` - Start production server on port 3000

## Architecture Overview

This is a Next.js-based publisher demo application for the Prism advertising SDK. The app demonstrates how publishers can integrate Prism ads into their websites.

### Key Components

- **Prism SDK Integration**: Uses `prism-sdk` (v1.2.0) to fetch and display ads from the Prism advertising network
- **Wallet Connection**: Implements RainbowKit + wagmi for Web3 wallet connectivity, targeting Arbitrum Sepolia testnet
- **Ad Display Flow**: Loads ads based on publisher address/domain, tracks impressions when images load, handles click events

### Core Files

- `src/pages/index.tsx` - Main page with ad display logic and banner testing functionality
- `src/wagmi.ts` - Wallet configuration for Arbitrum Sepolia chain
- `src/signer.ts` - Utilities for converting viem clients to ethers signers
- `src/pages/_app.tsx` - App wrapper with Web3 providers

### Configuration

- Publisher settings are configured via hardcoded values in `index.tsx` (publisherAddress, publisherDomain)
- Environment variables can be used via `NEXT_PUBLIC_PUBLISHER_ADDRESS` and `NEXT_PUBLIC_PUBLISHER_DOMAIN`
- CORS headers are configured in `next.config.ts` for API routes
- Webpack externals exclude 'pino-pretty', 'lokijs', 'encoding' to resolve build issues

### Ad Integration Pattern

1. Initialize PrismClient with publisher details and connected wallet
2. Handle ad winner selection via onSuccess callback
3. Track impressions when ad images load successfully
4. Handle clicks by calling PrismClient.clicks() before opening destination URL