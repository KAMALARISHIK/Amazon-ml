import { NextResponse } from "next/server";
import { MOCK_ANALYTICS_DATA } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_ANALYTICS_DATA);
}
