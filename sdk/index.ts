import { ethers } from "ethers";
import accountingAbi from "./abi/PrismAccounting.json";
import dotenv from 'dotenv';
dotenv.config();

class Web3Api {
    public accountingContract: any;
    public url: any;
    constructor() {
        this.url = process.env.NEXT_PUBLIC_NETWORK_RPC_URL;
        console.log('this.url', this.url);
        const provider = new ethers.JsonRpcProvider(this.url);
        this.accountingContract = new ethers.Contract(process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_PRISM_ACCOUNTING_CONTRACT_ADDRESS!, accountingAbi, provider);
    }
}

class Web2Api {
    public url: any;
    constructor() {
        const isProd = process.env.NODE_ENV === 'production';
        this.url = isProd ? process.env.NEXT_PUBLIC_PRISM_API_URL : `http://localhost:3001/api`;
    }

    async triggerAuction(wallet: string,publisher: string): Promise<any> {
        try {
            return await this.fetchData(`/auction/${wallet}/${publisher}`, 'POST');
        } catch (error) {
            console.error('Error in triggerAuction:', error);
            throw error;
        }
    }

    async handleUserClick(publisher: string, websiteUrl: string, winnerId: any): Promise<any> {
        try {
            return await this.fetchData(`/publisher/click/${publisher}/${websiteUrl}/${winnerId}`, 'POST');
        } catch (error) {
            console.error('Error in handleUserClick:', error);
            throw error;
        }
    }

    async sendViewedFeedback(publisher: string, websiteUrl: string, winnerId: any): Promise<any> {
        try {
            return await this.fetchData(`/publisher/impressions/${publisher}/${websiteUrl}/${winnerId}`, 'POST');
        } catch (error) {
            console.error('Error in sendViewedFeedback:', error);
            throw error;
        }
    }

    async getAllPublisherStatsForOwnerByWebsiteUrl(publisher: string, websiteUrl: string): Promise<any> {
        try {
            return await this.fetchData(`/publisher/${publisher}/${websiteUrl}`, 'GET');
        } catch (error) {
            console.error('Error fetching publisher stats:', error);
            throw error;
        }
    }

    async fetchData(endpoint: string, method: string, body?: any): Promise<any> {
        try {
            const response = await fetch(`${this.url}${endpoint}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined,
            });
            if (!response.ok) { throw new Error(`HTTP error! status: ${response.status}`); }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error with fetch operation:`, endpoint, error);
            return error;
        }
    }
}

export class PrismClient {
    public web3Api: Web3Api;
    public web2Api: Web2Api;
    public publisherAddress;
    public websiteUrl;

    constructor(publisherAddress: string, websiteUrl: string) {
        this.web3Api = new Web3Api();
        this.web2Api = new Web2Api();

        this.web3Api.accountingContract.isPublisher(publisherAddress).then((isPublisher: boolean) => {
            if (!isPublisher) throw new Error('Publisher not whitelisted, please register on www.prismprotocol.xyz/publishers');

        });
        this.publisherAddress = publisherAddress;
        this.websiteUrl = websiteUrl;
    }

    async triggerAuction(wallet: string): Promise<any> {
        return this.web2Api.triggerAuction(wallet,this.publisherAddress);
    }

    async handleUserClick(winnerId: string): Promise<any> {
        return this.web2Api.handleUserClick(this.publisherAddress, this.websiteUrl, winnerId);
    }

    async sendViewedFeedback(campaignId: string): Promise<any> {
        return this.web2Api.sendViewedFeedback(this.publisherAddress, this.websiteUrl, campaignId);
    }
}