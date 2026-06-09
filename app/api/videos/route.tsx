import type { NextRequest } from "next/server";

// Convert ISO 8601 duration (e.g. PT8M32S) to "8:32".
function formatDuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return "";
  const h = parseInt(m[1] ?? "0", 10);
  const min = parseInt(m[2] ?? "0", 10);
  const s = parseInt(m[3] ?? "0", 10);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}

export async function GET(req: NextRequest) {
  const key = process.env.YOUTUBE_API_KEY;
  const q = req.nextUrl.searchParams.get("q") ?? "";

  // Fail silently if no key or no query — never surface an error.
  if (!key || !q.trim()) return Response.json({ videos: [] });

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", `${q} repair how to`);
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", "2");
    searchUrl.searchParams.set("videoEmbeddable", "true");
    searchUrl.searchParams.set("key", key);

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) return Response.json({ videos: [] });
    const searchData = await searchRes.json();

    const items: { id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: { medium?: { url: string }; default?: { url: string } } } }[] = searchData.items ?? [];
    if (items.length === 0) return Response.json({ videos: [] });

    const ids = items.map((it) => it.id.videoId).filter(Boolean);

    // Fetch durations
    const detailsUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    detailsUrl.searchParams.set("part", "contentDetails");
    detailsUrl.searchParams.set("id", ids.join(","));
    detailsUrl.searchParams.set("key", key);
    const detailsRes = await fetch(detailsUrl.toString());
    const detailsData = detailsRes.ok ? await detailsRes.json() : { items: [] };
    const durations: Record<string, string> = {};
    for (const d of detailsData.items ?? []) {
      durations[d.id] = formatDuration(d.contentDetails?.duration ?? "");
    }

    const videos = items.map((it) => ({
      id: it.id.videoId,
      title: it.snippet.title,
      channel: it.snippet.channelTitle,
      thumbnail: it.snippet.thumbnails.medium?.url ?? it.snippet.thumbnails.default?.url ?? "",
      duration: durations[it.id.videoId] ?? "",
    }));

    return Response.json({ videos });
  } catch {
    return Response.json({ videos: [] });
  }
}
