import { NextResponse } from "next/server";
import { User } from "@/types/api";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const user: User = {
      id: `usr_${Date.now().toString(36)}`,
      email: body.email || "new-user@enterprise.ai",
      name: body.name || "Enterprise User",
      role: body.role || "ML Engineer",
    };

    const response = NextResponse.json({
      access_token: `jwt_signup_${Date.now()}_token`,
      refresh_token: `refresh_${Date.now()}_token`,
      token_type: "bearer",
      expires_in: 86400,
      user,
    });

    response.cookies.set("auth_token", `jwt_signup_${Date.now()}_token`, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ detail: "Unable to complete signup" }, { status: 400 });
  }
}
