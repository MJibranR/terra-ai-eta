// src/app/api/nasa/power/route.ts
import { NextResponse } from "next/server";

type CacheEntry = { ts: number; data: any };
const CACHE_TTL_MS = 5_000; // don't hit NASA more often than 5s per key
const cache: Record<string, CacheEntry> = {};

function formatDate(d: Date) {
    return d.toISOString().slice(0, 10).replace(/-/g, "");
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const lat = url.searchParams.get("lat") ?? "36.5";
        const lon = url.searchParams.get("lon") ?? "-98.0";
        // fetch last N days (7)
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);

        const key = `${lat}:${lon}:${formatDate(start)}:${formatDate(end)}`;
        const now = Date.now();
        if (cache[key] && now - cache[key].ts < CACHE_TTL_MS) {
            return NextResponse.json({ cached: true, timestamp: cache[key].ts, ...cache[key].data });
        }

        const base = "https://power.larc.nasa.gov/api/temporal/daily/point";
        const params = ["T2M", "PRECTOTCORR", "ALLSKY_SFC_SW_DWN"].join(",");
        const q = new URLSearchParams({
            start: formatDate(start),
            end: formatDate(end),
            latitude: lat,
            longitude: lon,
            community: "AG",
            parameters: params,
            format: "JSON",
        });
        if (process.env.NASA_API_KEY) q.set("api_key", process.env.NASA_API_KEY);

        const res = await fetch(`${base}?${q.toString()}`, { next: { revalidate: 0 } });
        if (!res.ok) {
            const txt = await res.text();
            return NextResponse.json({ error: "NASA error", details: txt }, { status: 502 });
        }
        const data = await res.json();

        // Build a compact "latest valid" summary
        const timeSeries = data?.properties?.parameter ?? {};
        const dates = Object.keys(timeSeries?.T2M ?? {});
        dates.sort();
        // find last valid (not -999) for each parameter
        const latest: Record<string, { date?: string; value?: number | null }> = {};
        for (const p of ["T2M", "PRECTOTCORR", "ALLSKY_SFC_SW_DWN"]) {
            latest[p] = { date: undefined, value: null };
            for (let i = dates.length - 1; i >= 0; i--) {
                const d = dates[i];
                const v = timeSeries[p]?.[d];
                if (v !== undefined && v !== null && v !== -999) {
                    latest[p] = { date: d, value: v };
                    break;
                }
            }
        }

        const payload = { cached: false, timestamp: now, timeSeries, latest };
        cache[key] = { ts: now, data: payload };
        return NextResponse.json(payload);
    } catch (err: any) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
