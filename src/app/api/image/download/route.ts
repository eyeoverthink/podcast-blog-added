import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { url } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!url) {
      return new NextResponse("URL is required", { status: 400 });
    }

    // Using RapidAPI to download media
    const options = {
      method: 'GET',
      url: 'https://url-download.p.rapidapi.com/download',
      params: {
        url: url
      },
      headers: {
        'X-RapidAPI-Key': 'a702149265msh04679705098dcf5p1c3f4cjsn79f5457e218b',
        'X-RapidAPI-Host': 'url-download.p.rapidapi.com'
      }
    };

    const response = await axios.request(options);
    
    // Process the downloaded content and store it
    // You'll need to implement storage logic here (e.g., using AWS S3 or similar)
    
    return NextResponse.json({
      imageUrl: response.data.url, // This should be the URL to your stored file
    });
  } catch (error) {
    console.log("[DOWNLOAD_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
