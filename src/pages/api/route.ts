import { NextApiResponse, NextApiRequest } from "next";
import { PrismClient } from "prism-sdk";

type ResponseData = {
  data?: any;
  error?: any;
}
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { action, address, publisher, winnerId } = JSON.parse(JSON.stringify(req.body));
    console.log('action::', process.env.PRISM_SDK_API_KEY);
    let responseData = null;
    const prismClient = new PrismClient('60f5388cb532c14b2fdd2e481ad45234326702037711b0324f629c816081d73f');
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
    return res.status(200).json({
      data: responseData,
    });

  } catch (error: any) {
    return res.status(500).json({ error: error });
  }
}
