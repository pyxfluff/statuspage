// Copyright (c) 2024 iiPython

export async function onRequestGet(context) {
    try {
        const urls = await context.env.statuspage_data.get("urls", { cacheTtl: 60 });
        const records = await context.env.statuspage_data.get("records", { cacheTtl: 60 });

        urls.forEach((service) => {
            service.online = records[0].services[service.name].online;
        });        

        return new Response(JSON.stringify({
            urls: JSON.parse(urls),
            records: JSON.parse(records)
        }), {
            headers: {
                "Content-Type": "application/json"
            }
        });
    } catch (e) {
        console.error(e);
        return new Response(`{"error": "${e}"}`, {
            status: 500,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }
}
