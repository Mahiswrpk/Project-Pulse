import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/prisma";

interface ClerkUserEvent {
  data: {
    id: string;
    email_addresses: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    image_url?: string;
  };
  type: string;
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "No webhook secret" }, { status: 500 });
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);

  let event: ClerkUserEvent;
  try {
    event = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkUserEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { id: clerkId, email_addresses, first_name, last_name, image_url } = event.data;
  const email = email_addresses?.[0]?.email_address ?? "";
  const name = [first_name, last_name].filter(Boolean).join(" ") || null;

  try {
    if (event.type === "user.created") {
      await prisma.user.upsert({
        where: { clerkId },
        update: { email, name, imageUrl: image_url ?? null },
        create: {
          clerkId,
          email,
          name,
          imageUrl: image_url ?? null,
          notificationPreference: { create: {} },
        },
      });
    } else if (event.type === "user.updated") {
      await prisma.user.update({
        where: { clerkId },
        data: { email, name, imageUrl: image_url ?? null },
      });
    } else if (event.type === "user.deleted") {
      await prisma.user.delete({ where: { clerkId } });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook DB error:", err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
