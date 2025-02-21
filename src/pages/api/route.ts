import { NextRequest, NextResponse } from "next/server";
import { PrismClient } from "prism-sdk";

export default async function handler(req: NextRequest, NextResponse: any) {
  try {
    const { action, address, publisher, winnerId } = JSON.parse(JSON.stringify(req.body));
    let responseData = null;
    const prismClient = new PrismClient(process.env.PRISM_SDK_API_KEY!);
    switch (action) {
      case 'auction': {
        responseData = await prismClient.triggerAuction(address, publisher)
        break;
      }
      case 'handleUserClick': {
        responseData = await prismClient.handleUserClick(address, publisher, winnerId)
        break;
      }
      case 'sendViewedFeedback': {
        responseData = await prismClient.sendViewedFeedback(address, publisher, winnerId)
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ data: responseData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
