import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const AUTH_COOKIE = "admin_auth";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Password is not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const password = body?.password;

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: AUTH_COOKIE,
    value: "true",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return NextResponse.json({ success: true });
}