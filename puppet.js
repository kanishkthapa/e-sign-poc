const express = require("express");
const fs = require("fs");
const puppeteer = require("puppeteer");
const handlebars = require("handlebars");
const path = require("path");
// const mime = require("mime");

const generatePdf = async () => {
  const templateSource = fs.readFileSync("policyPdf.hbs", "utf-8");

  // const app = express();

  // app.use(express.urlencoded({ extended: false }));
  // app.use(express.json());

  // app.listen(8080, () => {
  //   console.log("app listening on 8080");
  // });

  // function getImageBase64(filePath) {
  //   const image = fs.readFileSync(filePath);
  //   return `data:image/png;base64,${image.toString("base64")}`;
  // }

  handlebars.registerHelper("switch", function (value, options) {
    this.switch_value = value;
    return options.fn(this);
  });

  handlebars.registerHelper("case", function (value, options) {
    if (value == this.switch_value) {
      return options.fn(this);
    }
  });

  const template = handlebars.compile(templateSource);
  // const imagePath = path.join(__dirname, "images", "once-logo.png");

  // fs.writeFileSync("imageB64.txt", getImageBase64(imagePath));

  let data = {
    insurer_name: "Tony Stark",
    location_address: "Block Top",
    location_street: "Stark Tower",
    location_city: "NYC",
    location_zip: "09420",
    issue_date: "2024-05-05",
    expiration_date: "2029-05-05",
    item_insured: "Ring",
    insured_value: "$ 1,000",
    premium: "$ 200",
    deductible: "$ 0",
    //   imageBase64: getImageBase64(imagePath),
    state: "NH",
  };

  const html = template(data);

  let puppeteerConfig = {
    headless: "new",
    args: [
      "--single-process",
      "--no-zygote",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
    ],
    devtools: false,
  };

  let pdf;

  const browser = await puppeteer.launch(puppeteerConfig);
  const page = await browser.newPage();
  await page.setContent(html, {
    waitUntil: "domcontentloaded",
  });
  // await page.waitForSelector("img");
  // await page.screenshot({ path: "screenshot.png" });
  pdf = await page.pdf({
    format: "A4",
    printBackground: true,
  });
  console.log("Show PDF buffer", pdf);
  await browser.close();

  return pdf;
};

export { generatePdf };
