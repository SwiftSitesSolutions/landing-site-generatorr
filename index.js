const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// POST endpoint to handle automation
app.post('/', async (req, res) => {
  let browser;
  try {
    // Launch Puppeteer with Railway-compatible settings
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      ignoreDefaultArgs: ['--disable-extensions']
    });
    const page = await browser.newPage();

    // Navigate to login page
    await page.goto('https://www.landingsite.ai/login', {
      waitUntil: 'networkidle2'
    });

    // Log in using environment variables
    await page.type('input[name="email"]', process.env.LANDINGSITE_EMAIL);
    await page.type('input[name="password"]', process.env.LANDINGSITE_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // Step 1: Fill business description from POST request body
    const { businessDescription } = req.body;
    if (!businessDescription) {
      throw new Error('Business description is required in POST body');
    }
    await page.waitForSelector('textarea[name="description"]');
    await page.type('textarea[name="description"]', businessDescription);

    // Step 2: Select a template (assuming a dropdown or clickable template cards)
    // Adjust selector based on actual LandingSite.ai template selection UI
    await page.waitForSelector('.template-card'); // Example selector
    await page.click('.template-card:nth-child(1)'); // Select first template

    // Click Continue/Generate button
    await page.waitForSelector('button#generate-button'); // Adjust ID as needed
    await page.click('button#generate-button');

    // Wait for preview link to appear (adjust selector based on actual UI)
    await page.waitForSelector('a.preview-link', { timeout: 60000 });
    const previewUrl = await page.$eval('a.preview-link', el => el.href);

    // Return JSON response
    res.json({ previewUrl });
  } catch (error) {
    console.error('Automation error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
