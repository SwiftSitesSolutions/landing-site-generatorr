const express = require("express");
const puppeteer = require("puppeteer");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/generate", async (req, res) => {
  const { businessName, industry } = req.body;
  const prompt = `Create a modern landing page for a ${industry} business named "${businessName}" using GPT.`;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto("https://www.landingsite.ai/", { waitUntil: "networkidle0" });

    await page.waitForSelector("textarea");
    await page.type("textarea", prompt);

    await page.click("button[type='submit']");
    await page.waitForSelector("iframe", { timeout: 60000 });

    const previewUrl = await page.evaluate(() => {
      const iframe = document.querySelector("iframe");
      return iframe ? iframe.src : null;
    });

    await browser.close();

    if (previewUrl) {
      res.json({ previewUrl });
    } else {
      res.status(500).json({ error: "Preview URL not found." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
