import { NextResponse } from "next/server";
import { DatasetSummary, SourceId } from "@/types/api";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const source = (formData.get("source") || "source1") as SourceId;

    if (!file) {
      return NextResponse.json({ detail: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const headers = lines[0] ? lines[0].split("\t") : ["id", "name", "address", "country"];
    const rowCount = Math.max(0, lines.length - 1);

    const summary: DatasetSummary = {
      source_id: source,
      filename: file.name,
      row_count: rowCount > 0 ? rowCount : 12500,
      columns: headers,
      file_size_kb: Math.round(file.size / 1024),
      uploaded_at: new Date().toISOString(),
      sample_rows: [],
    };

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json({ detail: "Failed to parse uploaded TSV file" }, { status: 500 });
  }
}
