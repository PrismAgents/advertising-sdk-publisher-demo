import { NextApiResponse, NextApiRequest } from "next";
import { PrismClient,PrismResponse } from "prism-sdk";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { path, userAddress, campaignId } = req.body;
    let responseData : PrismResponse = {status: 0, message: "", data: null};
    
    const publisher = process.env.PUBLISHER_ADDRESS!;
    const publisherDomain = process.env.PUBLISHER_DOMAIN!;
    const prismClient = new PrismClient(process.env.PRISM_SDK_API_KEY!);

    switch (path) {
      case 'auction': {
        if (!userAddress) {
          return res.status(400).json({ status: 400, message: "Missing userAddress for auction path" });
        }
        responseData = await prismClient.auction(publisher, publisherDomain, userAddress);
        break;
      }
      case 'clicks': {
        if (!campaignId) {
          responseData = await prismClient.clicks(publisher, publisherDomain, campaignId);
          break;
        }
        return res.status(400).json({ status: 400, message: "Missing auctionWinnerId for clicks path" });

      }
      case 'impressions': {
        console.log('campaignId', campaignId);

        if (!campaignId) {
            console.error('Missing auctionWinnerId for impressions path');
            return res.status(400).json({ status: 400, message: "Missing auctionWinnerId for impressions path" });
        }
        responseData = await prismClient.impressions(publisher, publisherDomain, campaignId);
        break;
      }
      default:
        return res.status(400).json({ status: 400, message: `Unknown path: ${path}` });
    }

    if (!responseData) {
        console.error(`No response data generated for path: ${path}`);
        return res.status(500).json({ status: 500, message: `Handler for path ${path} did not return data` });
    }

    const data = responseData.data;
    if (responseData.status >= 200 && responseData.status < 300) {
      return res.status(responseData.status).json(data);
    } else {
      return res.status(responseData.status).json({ error: responseData.message || `An error occurred (status: ${responseData.status})` });
    }
  } catch (error: any) {
    console.error(`Unhandled error in API handler:`, error);
    return res.status(500).json({ status: 500, message: error.message || 'Internal Server Error' });
  }
}
