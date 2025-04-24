export async function onRequestGet(context) {
    try {
        const urls = JSON.parse(await context.env.statuspage_data.get("urls", { cacheTtl: 60 }));
        const records = JSON.parse(await context.env.statuspage_data.get("records", { cacheTtl: 60 }));

        console.log(urls)

        let newServices = {};
        for (const service of urls) {
            try {
                service.status = records[Object.keys(records).length - 1].services[service.name]?.online ? "Online" : "Offline";
            } catch {
                service.status = "Error";
            }

            newServices[service.name] = service;
        }


        return new Response(JSON.stringify({
            urls: newServices,
            records: records
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
