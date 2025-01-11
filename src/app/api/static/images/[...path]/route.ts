import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  try {
    const filePath = path.join(process.cwd(), 'images-created', ...params.path);
    
    if (!fs.existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const response = new NextResponse(fileBuffer);
    
    // Set appropriate content type
    const ext = path.extname(filePath).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 
                       ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 
                       'application/octet-stream';
    
    response.headers.set('Content-Type', contentType);
    return response;
  } catch (error) {
    console.error('[STATIC_IMAGE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
