export async function onRequestGet(context) {
    try {
        const urls = await context.env.statuspage_data.get("urls", { cacheTtl: 60 });
        const records = await context.env.statuspage_data.get("records", { cacheTtl: 60 });

        const newServices = {};

        for (const service of JSON.parse(urls)) {
            try {
                service.status = records[0].services[service.name]?.online ? "Online" : "Offline";
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
