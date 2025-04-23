// Copyright (c) 2024 iiPython

export async function onRequestGet(context) {
    console.log("hi")
    try {
        const urls = await context.env.statuspage_data.get("urls", { cacheTtl: 60 });
        const records = await context.env.statuspage_data.get("records", { cacheTtl: 60 });

        let newServices = [];
        Object.values(JSON.parse(urls)).forEach((service) => {
            try {
                service.status = records[0].services[service.name]?.online ? "Online" : "Offline";
                
                newServices[service.name] = service
            } catch (e) {
                service.status = "Migrating";
                newServices[service.name] = service
            }
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
