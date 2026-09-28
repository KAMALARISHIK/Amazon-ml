import { NextResponse } from "next/server";
import { MOCK_MATCHES } from "@/lib/mock-data";
import { MatchedEntity } from "@/types/api";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("query") || "").toLowerCase().trim();
  const country = (searchParams.get("country") || "").toUpperCase().trim();
  const minConfidence = parseFloat(searchParams.get("min_confidence") || "0");
  const maxConfidence = parseFloat(searchParams.get("max_confidence") || "1");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("page_size") || "20", 10);

  let filtered: MatchedEntity[] = [...MOCK_MATCHES];

  if (query) {
    filtered = filtered.filter(
      (m) =>
        m.source1_record.name.toLowerCase().includes(query) ||
        (m.source2_record && m.source2_record.name.toLowerCase().includes(query)) ||
        (m.source3_record && m.source3_record.name.toLowerCase().includes(query)) ||
        m.source1_id.toLowerCase().includes(query) ||
        m.cluster_id.toLowerCase().includes(query) ||
        (m.source1_record.address && m.source1_record.address.toLowerCase().includes(query))
    );
  }

  if (country && country !== "ALL") {
    filtered = filtered.filter(
      (m) =>
        m.source1_record.country.toUpperCase() === country ||
        (m.source2_record && m.source2_record.country.toUpperCase() === country)
    );
  }

  filtered = filtered.filter(
    (m) => m.confidence_score >= minConfidence && m.confidence_score <= maxConfidence
  );

  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  const tripletsCount = filtered.filter((m) => m.source2_id && m.source3_id).length;
  const pairsCount = filtered.filter((m) => (m.source2_id && !m.source3_id) || (!m.source2_id && m.source3_id)).length;
  const singletonsCount = filtered.filter((m) => !m.source2_id && !m.source3_id).length;
  const avgConfidence =
    filtered.length > 0
      ? filtered.reduce((acc, m) => acc + m.confidence_score, 0) / filtered.length
      : 0;

  return NextResponse.json({
    matches: paginated,
    total,
    page,
    page_size: pageSize,
    summary: {
      total_clusters: total,
      triplets_count: tripletsCount,
      pairs_count: pairsCount,
      singletons_count: singletonsCount,
      avg_confidence: avgConfidence,
    },
  });
}
