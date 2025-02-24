import { NextApiResponse, NextApiRequest } from "next";
import { PrismClient } from "prism-sdk";

type ResponseData = {
  data?: any;
  error?: any;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { action, address, publisher, winnerId } = JSON.parse(JSON.stringify(req.body));
    let responseData = null;
    const prismClient = new PrismClient(process.env.PRISM_SDK_API_KEY!);
    switch (action) {
      case 'auction': {
        responseData = await prismClient.triggerAuction(address, publisher);
        break;
      }
      case 'handleUserClick': {
        responseData = await prismClient.handleUserClick(address, publisher, winnerId);
        break;
      }
      case 'sendViewedFeedback': {
        console.log('sendViewedFeedback::', address, publisher, winnerId);
        responseData = await prismClient.sendViewedFeedback(address, publisher, winnerId)
        break;
      }
      default:
        break;
    }
    if(responseData.error) {
      return res.status(500).json({ error: responseData.error });
    }
    return res.status(200).json({
      data: responseData,
    });

  } catch (error: any) {
    return res.status(500).json({ error: error });
  }
}
