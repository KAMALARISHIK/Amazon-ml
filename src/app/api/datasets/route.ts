import { NextResponse } from "next/server";
import { MOCK_DATASETS_SUMMARY } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(MOCK_DATASETS_SUMMARY);
}
