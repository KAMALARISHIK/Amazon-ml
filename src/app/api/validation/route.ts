import { NextResponse } from "next/server";
import { MOCK_VALIDATION_REPORT } from "@/lib/mock-data";

export async function POST() {
  return NextResponse.json(MOCK_VALIDATION_REPORT);
}
