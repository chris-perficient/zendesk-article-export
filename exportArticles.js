/* Copyright (c) 2021 Perficient, Inc. - All Rights Reserved.
 *
 *  Unauthorized copying of this file, via any medium is strictly prohibited.
 *  Proprietary and confidential.
 */

"use strict";
require("dotenv").config();
const fs = require("fs");
const axios = require("axios");
const download = require("image-downloader");
const token = process.env.ZENDESK_TOKEN;
const encoded = Buffer.from(
  "lara.keenan@perficient.com/token:" + token
).toString("base64");

let log = [];

async function downloadImage(brand, articleId) {
  // console.log("URLLLLL", brand);
  let url = `https://${brand}.zendesk.com/api/v2/help_center/articles/${articleId}/attachments`;
  const response = await axios
    .get(url, {
      headers: { Authorization: `Basic ${encoded}` },
    })
    .catch((err) => console.log("ERRORRR", err));

  // console.log("RESPONSEEEE", response.data.article_attachments);
  let attachmentsArray = response.data.article_attachments;
  if (attachmentsArray.length >= 1) {
    for (let i = 0; i < attachmentsArray.length; i++) {
      let attachments_url = attachmentsArray[i].content_url
      axios
        .get(attachments_url, {
          method: "GET",
          responseType: "stream",
          headers: { Authorization: `Basic ${encoded}` },
        })
        .then((e) => {
          const path = `./backupImages/${articleId}-(${i}).png`;
          const writer = fs.createWriteStream(path);
          e.data.pipe(writer);
          return new Promise((resolve, reject) => {
            writer.on("finish", resolve);
            writer.on("error", reject);
          });
        });
    }
  }
}

async function exportTwilioFlex() {
  let brand = "perficient";
  let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios.get(url, {
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
      await downloadImage(brand, article.id);
      log.push(article);
    }

    url = data.next_page;
  }
  exportTwilioFlex2();
}

async function exportTwilioFlex2() {
  let brand = "prftamazonconnect";
  let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios.get(url, {
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
      // console.log("ARTICLE", article);

      downloadImage(brand, article.id);
      log.push(article);
    }
    url = data.next_page;
  }
  exportTwilioFlex3();
}

async function exportTwilioFlex3() {
  let brand = "prft-mso";
  let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios.get(url, {
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

      downloadImage(brand, article.id);
      log.push(article);
    }
    url = data.next_page;
  }
  exportTwilioFlex4();
}

async function exportTwilioFlex4() {
  let brand = "prft-converge";
  let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios.get(url, {
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

      downloadImage(brand, article.id);
      log.push(article);
    }
    url = data.next_page;
  }
  exportTwilioFlex5();
}

async function exportTwilioFlex5() {
  let brand = "prft-cconnect";
  let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios.get(url, {
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

      downloadImage(brand, article.id);
      log.push(article);
    }
    url = data.next_page;
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

exportTwilioFlex();
