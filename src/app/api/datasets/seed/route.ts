import { NextResponse } from "next/server";
import { MOCK_DATASETS_SUMMARY } from "@/lib/mock-data";

export async function POST() {
  return NextResponse.json({
    message: "Standard business entity benchmark datasets seeded successfully.",
    datasets: MOCK_DATASETS_SUMMARY,
  });
}
