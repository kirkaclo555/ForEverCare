import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let fileBase64 = '';
    let fileName = 'upload.jpg';

    if (contentType.includes('application/json')) {
      const json = await req.json();
      fileBase64 = json.base64 || json.fileBase64;
      fileName = json.name || 'mobile_upload.jpg';

      if (!fileBase64) {
        return NextResponse.json({ error: 'No image data provided in JSON body' }, { status: 400 });
      }
    } else {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      // Convert the uploaded file to a Buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`;
      fileName = file.name;
    }

    // Upload to Cloudinary (resource_type: 'auto' automatically handles both images and videos)
    const uploadResult = await cloudinary.uploader.upload(fileBase64, {
      folder: 'fureverpawcare',
      resource_type: 'auto',
    });

    // Get the secure web URL from the response
    const fileUrl = uploadResult.secure_url;
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl, 
      name: fileName 
    });
  } catch (error: any) {
    console.error('Cloudinary upload failed:', error);
    return NextResponse.json({ error: 'Upload failed', details: error.message }, { status: 500 });
  }
}

