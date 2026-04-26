const { createWorker } = require('tesseract.js');

async function run() {
    try {
        const worker = await createWorker('eng', 1, {
            cachePath: require('os').tmpdir(),
            logger: m => console.log(m)
        });
        console.log('Worker created successfully in tmpdir');
        await worker.terminate();
    } catch(e) {
        console.error(e);
    }
}
run();
