import { performance } from 'perf_hooks';

// Simulate a database with a delay
const simulateDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runBenchmark() {
  const users = Array.from({ length: 1000 }, (_, i) => ({ email: `user${i}@benchmark.com`, googleApiKey: 'OLD_KEY' }));

  console.log('Testing N+1 Approach...');
  const startNPlusOne = performance.now();
  for (const user of users) {
    user.googleApiKey = 'REAL_KEY';
    await simulateDelay(2); // Simulate network/DB latency for individual save
  }
  const endNPlusOne = performance.now();
  const timeNPlusOne = endNPlusOne - startNPlusOne;
  console.log(`N+1 Approach took: ${timeNPlusOne.toFixed(2)} ms`);

  console.log('Testing updateMany Approach...');
  const startUpdateMany = performance.now();
  // Simulate a single DB operation that updates all users
  await simulateDelay(10); // UpdateMany takes a slightly longer single operation but much less than N * 2ms
  const endUpdateMany = performance.now();
  const timeUpdateMany = endUpdateMany - startUpdateMany;
  console.log(`updateMany Approach took: ${timeUpdateMany.toFixed(2)} ms`);

  console.log(`\nImprovement: ${(timeNPlusOne / timeUpdateMany).toFixed(2)}x faster`);
}

runBenchmark().catch(err => {
  console.error(err);
  process.exit(1);
});
