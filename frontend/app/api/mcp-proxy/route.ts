import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { url, body } = await req.json();

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream",
            },
            body: JSON.stringify(body),
        });

        // If it's a stream, we want to pipe it back
        if (response.headers.get("content-type")?.includes("text/event-stream")) {
            return new NextResponse(response.body, {
                headers: {
                    "Content-Type": "text/event-stream",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                },
            });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
