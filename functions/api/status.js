export async function onRequestGet(context) {
    try {
        const urls = await context.env.statuspage_data.get("urls", { cacheTtl: 60 });
        const records = await context.env.statuspage_data.get("records", { cacheTtl: 60 });

        const latestRecord = records.sort((a, b) => new Date(b.time) - new Date(a.time))[0];
        let newServices = {};
        for (const service of JSON.parse(urls)) {
            try {
                service.status = latestRecord.services[service.name]?.online ? "Online" : "Offline";
            } catch {
                service.status = "Migrating";
            }

            newServices[service.name] = service;
        }


        return new Response(JSON.stringify({
            urls: newServices,
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
