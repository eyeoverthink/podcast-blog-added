import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prismadb } from '@/lib/prismadb'
import { NextResponse } from 'next/server'
 
export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
 
  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new NextResponse('Error occured -- no svix headers', {
      status: 400
    })
  }
 
  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);
 
  // Create a new Svix instance with your secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
 
  let evt: WebhookEvent
 
  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new NextResponse('Error occured', {
      status: 400
    })
  }
 
  // Handle the webhook
  const eventType = evt.type;
 
  if (eventType === 'user.created') {
    const { id, email_addresses, image_url, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address;

    // Create user with initial credits
    await prismadb.user.create({
      data: {
        id: id,
        email: email,
        name: `${first_name || ''} ${last_name || ''}`.trim() || undefined,
        imageUrl: image_url,
        credits: 1000 // Initial credits for new users
      }
    });

    return NextResponse.json({ message: 'User created with 1000 credits' });
  }
 
  return new NextResponse('', { status: 200 });
}
