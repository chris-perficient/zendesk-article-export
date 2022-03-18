/* Copyright (c) 2021 Perficient, Inc. - All Rights Reserved.
 *
 *  Unauthorized copying of this file, via any medium is strictly prohibited.
 *  Proprietary and confidential.
 */

"use strict";
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const token = process.env.ZENDESK_TOKEN;
const encoded = Buffer.from(
  "lara.keenan@perficient.com/token:" + token
).toString("base64");

let log = [];
let brands = [
  `https://prft-mso.zendesk.com/api/v2/help_center/en-us/articles`,
  `https://prft-converge.zendesk.com/api/v2/help_center/en-us/articles`,
  `https://prftamazonconnect.zendesk.com/api/v2/help_center/en-us/articles`,
  `https://prft-cconnect.zendesk.com/api/v2/help_center/en-us/articles`,
];

async function exportArticles() {
  let url = `https://perficient.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios.get(`${url}`, {
      headers: { Authorization: `Basic ${encoded}` },
    });

    if (response.status != 200) {
      console.log(
        `Failed to retrieve Twilio Flex articles with error ${response.status}`
      );
      return;
    }

    let data = response.data;
    for (const article of data["articles"]) {
      log.push(article);
    }

    if (data.next_page != null) {
      console.log("not null", data.next_page);
      url = data.next_page;
    } else {
      let temp = brands.shift();
      url = temp;
      console.log("Brand", url);
    }
  }
  let jsonLogs = JSON.stringify(log);
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();

  today = mm + "-" + dd + "-" + yyyy;
  fs.writeFile(`backups/Backup-${today}.json`, jsonLogs, (err) => {
    if (err) console.log(err);
    else {
      console.log("File written successfully\n");
    }
  });
}

exportArticles();
