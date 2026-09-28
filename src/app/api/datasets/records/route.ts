import { NextResponse } from "next/server";
import {
  MOCK_SOURCE1_RECORDS,
  MOCK_SOURCE2_RECORDS,
  MOCK_SOURCE3_RECORDS,
} from "@/lib/mock-data";
import { BusinessEntityRecord, SourceId } from "@/types/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = (searchParams.get("source") || "source1") as SourceId;
  const query = (searchParams.get("query") || "").toLowerCase().trim();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("page_size") || "20", 10);

  let records: BusinessEntityRecord[] = [];
  if (source === "source1") records = [...MOCK_SOURCE1_RECORDS];
  else if (source === "source2") records = [...MOCK_SOURCE2_RECORDS];
  else if (source === "source3") records = [...MOCK_SOURCE3_RECORDS];
  else records = [...MOCK_SOURCE1_RECORDS];

  // Apply search query filter across name, address, city, country, tax_id
  if (query) {
    records = records.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        (r.address && r.address.toLowerCase().includes(query)) ||
        (r.city && r.city.toLowerCase().includes(query)) ||
        r.country.toLowerCase().includes(query) ||
        (r.tax_id && r.tax_id.toLowerCase().includes(query)) ||
        r.id.toLowerCase().includes(query)
    );
  }

  const total = records.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedRecords = records.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    records: paginatedRecords,
    total,
    page,
    page_size: pageSize,
  });
}
