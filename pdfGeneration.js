const puppeteer = require("puppeteer");

async function generatePdfBuffer() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent("<h1>Hello, World!</h1>"); // Replace with your HTML content
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();
  return pdfBuffer;
}

module.exports = { generatePdfBuffer };
