const Tesseract = require('tesseract.js');

async function testOCR() {
    try {
        console.log('Starting OCR...');
        // We will just supply a dummy image url.
        // Actually, we can generate a simple image with text using canvas, but let's just test if Tesseract can be imported.
        console.log(Tesseract);
        console.log('Tesseract is installed.');
    } catch (e) {
        console.error(e);
    }
}
testOCR();
