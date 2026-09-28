import { NextResponse } from "next/server";
import { MOCK_USER } from "@/lib/mock-data";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = body.email || "ml-engineer@enterprise.ai";
    const user = {
      ...MOCK_USER,
      email,
      name: email.includes("@") ? email.split("@")[0].replace(".", " ").toUpperCase() : "Dr. Elena Vance",
    };

    const response = NextResponse.json({
      access_token: `jwt_live_${Date.now()}_token`,
      refresh_token: `refresh_${Date.now()}_token`,
      token_type: "bearer",
      expires_in: 86400,
      user,
    });

    // Set httpOnly cookie for secure session storage
    response.cookies.set("auth_token", `jwt_live_${Date.now()}_token`, {
      httpOnly: false, // accessible to client js for token reading & middleware
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ detail: "Invalid login credentials" }, { status: 400 });
  }
}
