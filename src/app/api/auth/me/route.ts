import { NextResponse } from "next/server";
import { MOCK_USER } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_USER);
}
