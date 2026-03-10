// Copyright (c) 2024 iiPython
// also moreso pyxfluff 2025

const services = [
    { name: "Homepage", url: "https://pyxfluff.dev" },
    { name: "Music Server", url: "https://music.pyxfluff.dev" },
    { name: "Roblox Proxy", url: "https://proxy.pyxfluff.dev" },
    { name: "Spotify Embed Service", url: "https://spotifysvc.pyxfluff.dev/ping" },
    { name: "Discourse Test Site", url: "https://blog.admsoftware.org" },
    { name: "Nginx", url: "https://nginx.pyxfluff.dev" },
    { name: "CDN", url: "https://cdn.pyxfluff.dev" }
];

const warnings = {
    "Spotify Embed Service": "Currently down due to stupid Spotify policy changes, looking into alternatives"
}

async function fetch_status() {
    const slice = { time: Date.now() / 1000 | 0, services: {} };
    for (let { name, url } of services) {
        const control = new AbortController();
        const timeout = setTimeout(control.abort, 10000);

        try {
            const start = performance.now()
            const result = (await fetch(url, { redirect: "manual" }));
            const up = (result.status === 200 || result.status === 404 || result.status === 302 || result.status === 400);

            clearTimeout(timeout);
            slice.services[name] = {
                "online": up,
                "latency": Math.round(performance.now() - start),
                "statusCode": result.status,
                "message": warnings[name] || ""
            }

        } catch {
            slice.services[name] = {
                "online": false,
                "latency": 0,
                "statusCode": 500,
                "message": "Statuspage backend did not process this run."
            }
        }
    }
    return slice;
}

export default {
    async scheduled(_, env, ctx) {
        ctx.waitUntil((async () => {
            await env.statuspage_data.put("urls", JSON.stringify(services));

            // Handle existing data
            let records = JSON.parse(await env.statuspage_data.get("records")) || [];
            if (records.length === 350) records = records.slice(1);

            // Go fetch status information
            records.push(await fetch_status());

            // Save new data
            await env.statuspage_data.put("records", JSON.stringify(records));
        })());
    }
}
