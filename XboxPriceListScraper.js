const puppeteer = require("puppeteer")

module.exports = class XboxPriceScraper {
  constructor() {
    this.url =
      "https://www.xbox.com/es-es/games/all-games?cat=all"
    this.visibleSelector = ".gameDivLink"
    this.arr = []
    this.list = []
  }

  async init() {
    this.browser = await puppeteer.launch()
    this.page = await this.browser.newPage()
    console.log(`Opening Xbox store. Please wait.`)
    try {
      await this.page.goto(this.url, { timeout: 300000 })
    } catch (error) {
      console.log(
        "Sorry. There was a problem with loading the page. Please check your internet connection and try again."
      )
    }

    console.log("Page loaded. Waiting for content.")

    try {
      await this.page.waitForSelector(this.visibleSelector, {
        visible: true,
        timeout: 300000,
      })
    } catch (error) {
      console.log(
        "Sorry. It looks like there is a problem with loading the games list. Please check your internet connection and try again."
      )
    }
    await this.page.click(
      `#unique-id-for-paglist-generated-select-menu-trigger`
    )
    await this.page.click(`li[data-gamesmax="200"]`)
    await this.getNumberOfPages()
    console.log("Ready to scrape.")
    return
  }

  async getNumberOfPages() {
    this.numberOfPages = await this.page.evaluate(async () => {
      return Array.from(
        document.querySelectorAll(".paginatenum")
      )
    })
  }

  async scrapePage() {
    return await this.page.evaluate(async () => {
      return Array.from(
        document.querySelectorAll(".gameDiv"),
        (e) => {
          const cleanPrice = (price) =>
            parseFloat(
              price.replace("€", "").replace(",", ".").trim()
            )
          const availableToBuy = e.querySelector(".textpricenew")
          const onOffer = e.querySelector(".f-highlight")
            ? e.querySelector(".f-highlight").innerText ===
              "EN OFERTA"
            : false
          const oldPrice = onOffer
            ? cleanPrice(
                e
                  .querySelector("s")
                  .textContent.replace(
                    "El precio original era ",
                    ""
                  )
              )
            : null
          const currentPrice = availableToBuy
            ? parseFloat(
                e.getAttribute("data-listprice")
              ).toFixed(2)
            : "Only available on Game Pass"
          return {
            title: e
              .querySelector(".x1GameName")
              .innerText.toUpperCase(),
            url: e
              .querySelector(".gameDivLink")
              .getAttribute("href"),
            releaseDate: e.getAttribute("data-releasedate"),
            price: {
              onOffer,
              oldPrice,
              currentPrice,
            },
          }
        }
      )
    })
  }

  async cleanPrice(price) {
    return parseFloat(
      price.replace("€", "").replace(",", ".").trim()
    )
  }

  async scrape() {
    for (let i in this.numberOfPages) {
      console.log(
        `Scraping page ${parseInt(i) + 1} of ${
          this.numberOfPages.length
        }`
      )
      const results = await this.scrapePage()
      if (parseInt(i) !== this.numberOfPages.length - 1) {
        await this.page.click(".paginatenext a")
      }
      this.list = this.list.concat(results)
    }
    await this.browser.close()
    return this.list
  }
}
