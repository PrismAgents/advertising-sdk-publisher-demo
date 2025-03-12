import { NextApiResponse, NextApiRequest } from "next";
import { PrismClient } from "prism-sdk";

type ResponseData = {
  data?: any;
  error?: any;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { path, userAddress, auctionWinnerId } = JSON.parse(JSON.stringify(req.body));
    let responseData = null;
    
    const publisherAddress = process.env.PUBLISHER_ADDRESS!;
    const publisherDomain = process.env.PUBLISHER_DOMAIN!;

    const prismClient = new PrismClient(process.env.PRISM_SDK_API_KEY!);
    switch (path) {
      case 'trigger-auction': {
        console.log('trigger-auction', publisherAddress, userAddress, publisherDomain);
        responseData = await prismClient.triggerAuction(publisherAddress, userAddress, publisherDomain);
        break;
      }
      case 'handleUserClick': {
        console.log('handleUserClick', publisherAddress, publisherDomain, auctionWinnerId);
        responseData = await prismClient.handleUserClick(publisherAddress, publisherDomain, auctionWinnerId);
        break;
      }
      case 'handleViewedFeedback': {
        console.log('handleViewedFeedback', publisherAddress, publisherDomain, auctionWinnerId);
        responseData = await prismClient.sendViewedFeedback(publisherAddress, publisherDomain, auctionWinnerId)
        break;
      }
      default:
        break;
    }
    if (responseData.error) return res.status(500).json({ error: responseData.error });
    return res.status(200).json({ data: responseData });
  } catch (error: any) {
    return res.status(500).json({ error: error });
  }
}
