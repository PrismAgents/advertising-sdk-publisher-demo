import { NextApiResponse, NextApiRequest } from "next";
import { PrismClient } from "prism-sdk";

type ResponseData = {
  data?: any;
  error?: any;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { path, userAddress, hostUrl, auctionWinnerId, websiteUrl } = JSON.parse(JSON.stringify(req.body));
    let responseData = null;
    const publisherAddress = process.env.PUBLISHER_ADDRESS!;
    const prismClient = new PrismClient(process.env.PRISM_SDK_API_KEY!);
    switch (path) {
      case 'trigger-auction': {
        console.log('trigger-auction', publisherAddress, userAddress, websiteUrl);
        responseData = await prismClient.triggerAuction(publisherAddress,userAddress, websiteUrl);
        break;
      }
      case 'handleUserClick': {
        responseData = await prismClient.handleUserClick(publisherAddress,hostUrl, auctionWinnerId);
        break;
      }
      case 'handleViewedFeedback': {
        responseData = await prismClient.sendViewedFeedback(publisherAddress, hostUrl, auctionWinnerId)
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
