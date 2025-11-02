// src/app/api/metrics/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const lat = url.searchParams.get("lat") ?? "36.5";
        const lon = url.searchParams.get("lon") ?? "-98.0";

        const proxyUrl = `${req.url.replace(req.url.split(req.url).pop() ?? "", "")}/api/nasa/power?lat=${lat}&lon=${lon}`;
        // simpler: call internal route directly by absolute URL to same host
        // but since server can't easily know host in some environments, call NASA proxy above directly:
        const base = `${new URL(req.url).origin}/api/nasa/power?lat=${lat}&lon=${lon}`;
        // Try proxy:
        const r = await fetch(base);
        const js = await r.json();

        const latest = js.latest ?? {};
        const temp = latest.T2M?.value ?? null;
        const precip = latest.PRECTOTCORR?.value ?? null;
        const solar = latest.ALLSKY_SFC_SW_DWN?.value ?? null;

        return NextResponse.json({
            ok: true,
            location: { lat: Number(lat), lon: Number(lon) },
            tempC: temp === null ? null : Number(temp),
            precip_mm_day: precip === null ? null : Number(precip),
            solar: solar === null ? null : Number(solar),
            timestamp: js.timestamp ?? Date.now()
        });
    } catch (err: any) {
        return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
    }
}
