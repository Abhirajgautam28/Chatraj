import { withCache, invalidateCache } from './Backend/utils/cache.js';

async function benchmark() {
    const fetcher = async () => {
        // Simulate DB latency
        await new Promise(r => setTimeout(r, 100));
        return { data: "result" };
    };

    console.log("Starting Tiered Cache Benchmark...");

    // 1. Cold Start
    const start1 = Date.now();
    await withCache("test-key", 60, fetcher);
    console.log(`Cold Start (DB Fetch): ${Date.now() - start1}ms`);

    // 2. L1 Cache Hit (Process Memory)
    const start2 = Date.now();
    await withCache("test-key", 60, fetcher);
    console.log(`L1 Cache Hit: ${Date.now() - start2}ms`);

    // 3. Thundering Herd Protection (Request Collapsing)
    console.log("Simulating Thundering Herd...");
    const start3 = Date.now();
    const results = await Promise.all([
        withCache("collapsing-key", 60, fetcher),
        withCache("collapsing-key", 60, fetcher),
        withCache("collapsing-key", 60, fetcher),
        withCache("collapsing-key", 60, fetcher)
    ]);
    console.log(`Request Collapsing (4 concurrent requests): ${Date.now() - start3}ms`);
    console.log("All results same:", results.every(r => r.data === "result"));

    process.exit(0);
}

benchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
