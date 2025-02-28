import { NextApiResponse, NextApiRequest } from "next";
import { PrismClient } from "prism-sdk";

type ResponseData = {
  data?: any;
  error?: any;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { path, userAddress, publisherAddress, hostUrl, auctionWinnerId } = JSON.parse(JSON.stringify(req.body));
    let responseData = null;
    const prismClient = new PrismClient(process.env.PRISM_SDK_API_KEY!);
    switch (path) {
      case 'trigger-auction': {
        responseData = await prismClient.triggerAuction(publisherAddress,userAddress);
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
