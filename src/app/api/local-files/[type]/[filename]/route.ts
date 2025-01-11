import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  req: Request,
  { params }: { params: { type: string; filename: string } }
) {
  try {
    const { type, filename } = params;
    
    // Determine the correct directory based on type
    const baseDir = type === 'image' 
      ? path.join(process.cwd(), 'images-created')
      : path.join(process.cwd(), 'videos-created');

    const decodedFilename = decodeURIComponent(filename);
    const filePath = path.join(baseDir, decodedFilename);
    console.log('Attempting to serve file:', filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return new NextResponse('File not found', { status: 404 });
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type
    const ext = path.extname(decodedFilename).toLowerCase();
    let contentType = 'application/octet-stream';

    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';

    // Create and return the response with appropriate headers
    const response = new NextResponse(fileBuffer);
    response.headers.set('Content-Type', contentType);
    response.headers.set('Content-Length', fileBuffer.length.toString());
    response.headers.set('Accept-Ranges', 'bytes');
    response.headers.set('Cache-Control', 'public, max-age=31536000');
    return response;
  } catch (error) {
    console.error('[LOCAL_FILE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
