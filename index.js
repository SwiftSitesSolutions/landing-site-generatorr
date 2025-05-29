const express = require("express");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

app.post("/", async (req, res) => {
  const { businessName, industry } = req.body;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    // STEP 1: Go to login page
    await page.goto("https://www.landingsite.ai/login", { waitUntil: "networkidle2" });

    // STEP 2: Fill in login form
    await page.type('input[type="email"]', process.env.LANDING_EMAIL, { delay: 100 });
    await page.type('input[type="password"]', process.env.LANDING_PASSWORD, { delay: 100 });

    // STEP 3: Submit login form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: "networkidle2" }),
    ]);

    console.log("✅ Logged in to LandingSite.ai");

    // TEMP: Just return success message for now
    await browser.close();
    res.json({ success: true, message: "Login successful (filling page next)" });

  } catch (error) {
    console.error("❌ Error during Puppeteer script:", error);
    await browser.close();
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
