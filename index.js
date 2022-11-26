const Spreadsheet = require("./Spreadsheet.js")
const XboxPriceScraper = require("./XboxPriceListScraper.js")

const run = async () => {
  // Step 1: Scrape the data
  const scraper = new XboxPriceScraper()
  await scraper.init()
  const results = await scraper.scrape()

  // Step 2: Add to Google Sheets
  const spreadsheet = new Spreadsheet()
  await spreadsheet.init()
  await spreadsheet.populate(results)
  console.log(`Task completed.`)
}

run()
