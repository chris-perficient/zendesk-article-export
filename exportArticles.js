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

async function exportTwilioFlex() {
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
    url = data.next_page;
  }
  exportAmazonConnect();
}

async function exportAmazonConnect() {
  let url = `https://prftamazonconnect.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios.get(`${url}`, {
      headers: { Authorization: `Basic ${encoded}` },
    });

    if (response.status != 200) {
      console.log(
        `Failed to retrieve Amazon Connect articles with error ${response.status}`
      );
      return;
    }

    let data = response.data;
    for (const article of data["articles"]) {
      log.push(article);
    }
    url = data.next_page;
  }
  exportClarityConnect();
}

async function exportClarityConnect() {
  let url = `https://prft-cconnect.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios.get(`${url}`, {
      headers: { Authorization: `Basic ${encoded}` },
    });

    if (response.status != 200) {
      console.log(
        `Failed to retrieve Clarity Connect articles with error ${response.status}`
      );
      return;
    }

    let data = response.data;
    for (const article of data["articles"]) {
      log.push(article);
    }
    url = data.next_page;
  }
  exportConverge();
}

async function exportConverge() {
  let url = `https://prft-converge.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios.get(`${url}`, {
      headers: { Authorization: `Basic ${encoded}` },
    });

    if (response.status != 200) {
      console.log(
        `Failed to retrieve Converge articles with error ${response.status}`
      );
      return;
    }

    let data = response.data;
    for (const article of data["articles"]) {
      log.push(article);
    }
    url = data.next_page;
  }
  exportMso();
}

async function exportMso() {
  let url = `https://prft-mso.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios.get(`${url}`, {
      headers: { Authorization: `Basic ${encoded}` },
    });

    if (response.status != 200) {
      console.log(
        `Failed to retrieve MSO articles with error ${response.status}`
      );
      return;
    }

    let data = response.data;
    for (const article of data["articles"]) {
      log.push(article);
    }
    url = data.next_page;
  }

  let jsonLogs = JSON.stringify(log);
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  today = mm + "-" + dd + "-" + yyyy;
  fs.writeFile(`backups/Backup-${today}.json`, jsonLogs, (err) => {
    if (err) console.log(err);
    else {
      console.log("File written successfully\n");
    }
  });
}

exportTwilioFlex();
