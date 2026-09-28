import { NextResponse } from "next/server";
import { MOCK_BLOCKING_ANALYTICS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_BLOCKING_ANALYTICS);
}
