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
  "christopher.mcardle@perficient.com/token:" + token
).toString("base64");

let brand = "perficient";
let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
let log = [];
// Fetches the article to be moved
async function exportArticles() {
  let response;
  while (url) {
    response = await axios.get(`${url}`, {
      headers: { Authorization: `Basic ${encoded}` },
    });

    if (response.status != 200) {
      console.log(`Failed to retrieve articles with error ${response.status}`);
      return;
    }

    let data = response.data;
    console.log("RESPONSEEEE", data["articles"]);

    for (const article of data["articles"]) {
      console.log("copied!", article);
      log.push(article);
    }
    url = data.next_page;
  }

  let jsonLogs = JSON.stringify(log);

  fs.writeFile("articles5.json", jsonLogs, (err) => {
    if (err) console.log(err);
    else {
      console.log("File written successfully\n");
      // console.log("The written has the following contents:");
      // console.log(fs.readFileSync("articles3.txt", "utf8"));
    }
  });
}

exportArticles();

//   let domainName;
//   if (twilioFlexIds.includes(fromSection)) {
//     domainName = "perficient";
//   } else if (amazonConnectIds.includes(fromSection)) {
//     domainName = "prftamazonconnect";
//   } else if (clarityConnectIds.includes(fromSection)) {
//     domainName = "prft-cconnect";
//   } else if (convergeIds.includes(fromSection)) {
//     domainName = "prft-converge";
//   } else if (msoIds.includes(fromSection)) {
//     domainName = "prft-mso";
//   } else {
//     console.log("COULDNT FIND A MATCH. PLEASE ENSURE YOUR IDS ARE ACCURATE");
//     return;
//   }

