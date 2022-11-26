const { GoogleSpreadsheet } = require("google-spreadsheet")
const moment = require("moment")
moment.locale("en-gb")
const creds = require("./cred.json")

module.exports = class Spreadsheet {
  constructor() {
    this.doc = new GoogleSpreadsheet(
      "19x43s5j_4rOybXw1LWA-QNoZpc7olBrNIrifvl_PYdQ"
    )
  }

  // AUTHORISE AND PREPARE THE GOOGLE SHEET
  async init() {
    console.log(`Authorising Google Sheet. Please wait...`)
    await this.doc.useServiceAccountAuth(creds)
    await this.doc.loadInfo()
    this.sheet = this.doc.sheetsByIndex[0]
    await this.sheet.clearRows()
    this.sheet.updateProperties({
      title: `XBOX STORE PRICE LIST (${moment(new Date()).format(
        "L"
      )})`,
    })
    this.sheet.setHeaderRow([
      `TITLE`,
      `RELEASED`,
      `PRICE`,
      `OFFER`,
      `PREVIOUS`,
      `REDUCTION`,
      `URL`,
    ])
  }

  // MAPS THE DATA TO A ROWS ARRAY AND POPULATES THE GOOGLE SHEET IN ONE HIT
  async populate(data) {
    console.log(`Populating data. Please wait...`)

    // convert date format back to American. (NB: Easier to convert date format on the spreadsheet)
    moment.locale("en")

    const rows = data.map((i, ind) => ({
      TITLE: i.title,
      RELEASED: moment(new Date(i.releaseDate)).format("L"),
      PRICE: i.price.currentPrice,
      OFFER: i.price.onOffer ? "Y" : "N",
      PREVIOUS: i.price.oldPrice ? i.price.oldPrice : "",
      REDUCTION: i.price.onOffer
        ? `=((E${ind + 2} - C${ind + 2}) / E${ind + 2})`
        : "",
      URL: i.url,
    }))
    await this.sheet.addRows(rows)
  }
}
