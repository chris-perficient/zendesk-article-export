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

let log = [];

async function downloadImage(brand, articleId) {
  let url = `https://${brand}.zendesk.com/api/v2/help_center/articles/${articleId}/attachments`;
  try {
    const response = await axios
      .get(url, {
        headers: { Authorization: `Basic ${encoded}` },
      })
      .catch((err) => console.log("ERROR IN downloadImage", err));

    let attachmentsArray = response.data.article_attachments;
    if (attachmentsArray.length >= 1) {
      for (let i = 0; i < attachmentsArray.length; i++) {
        let attachments_url = attachmentsArray[i].content_url;
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
  } catch {
    (e) => console.log("ERRORRR", e);
  }
}

async function exportTwilioFlex() {
  let brand = "perficient";
  let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  try {
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
  } catch {
    (e) => console.log("ERROR IN TWILIO FLEX", e);
  }
  console.log("FINISHED EXPORTING TWILIO FLEX");
  setTimeout(exportAmazonConnect, 60000);
}

async function exportAmazonConnect() {
  let brand = "prftamazonconnect";
  let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  try {
    while (url) {
      response = await axios.get(url, {
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
        downloadImage(brand, article.id);
        log.push(article);
      }
      url = data.next_page;
    }
  } catch {
    (e) => console.log("ERROR IN AMAZON CONNECT", e);
  }
  console.log("FINISHED EXPORTING AMAZON CONNECT");
  setTimeout(exportMso, 60000);
}

async function exportMso() {
  let brand = "prft-mso";
  let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  try {
    while (url) {
      response = await axios.get(url, {
        headers: { Authorization: `Basic ${encoded}` },
      }).catch((err) => console.log("ERROR IN MSO", err));

      if (response.status != 200) {
        console.log(
          `Failed to retrieve MSO articles with error ${response.status}`
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
  } catch {
    (e) => console.log("ERRORRR", e);
  }
  console.log("FINISHED EXPORTING MSO");
  setTimeout(exportConverge, 60000);
}

async function exportConverge() {
  let brand = "prft-converge";
  let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
      response = await axios.get(url, {
        headers: { Authorization: `Basic ${encoded}` },
      }).catch((err) => console.log("ERROR IN CONVERGE", err));

    if (response.status != 200) {
      console.log(
        `Failed to retrieve Converge articles with error ${response.status}`
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
  console.log("FINISHED EXPORTING CONVERGE");
  setTimeout(exportClarityConnect, 60000);
}

async function exportClarityConnect() {
  let brand = "prft-cconnect";
  let clarityArticles = [];
  let url = `https://${brand}.zendesk.com/api/v2/help_center/en-us/articles`;
  let response;
  while (url) {
    response = await axios
      .get(url, {
        headers: { Authorization: `Basic ${encoded}` },
      }).catch((err) => console.log("ERROR IN CLARITY CONNECT", err));
    if (response.status != 200) {
      console.log(
        `Failed to retrieve Clarity Connect articles with error ${response.status}`
      );
      return;
    }
    let data = response.data;
    for (const article of data["articles"]) {
      // setTimeout(() => {  console.log("World!"); }, 1000);
      // downloadImage(brand, article.id);
      clarityArticles.push(article);
      log.push(article);
    }
    url = data.next_page;
  }

  const half = Math.ceil(clarityArticles.length / 2);
  const firstHalf = clarityArticles.slice(0, half);
  const secondHalf = clarityArticles.slice(-half);

  for (const article of firstHalf) {
    downloadImage(brand, article.id);
  }

  setTimeout(exportClarityConnect2, 60000, secondHalf);

}

async function exportClarityConnect2(secondHalf) {
  let brand = "prft-cconnect";

  for (const article of secondHalf) {
    downloadImage(brand, article.id);
  }

  let jsonLogs = JSON.stringify(log);
  let today = new Date();
  let dd = String(today.getDate()).padStart(2, "0");
  let mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  let yyyy = today.getFullYear();

  today = mm + "-" + dd + "-" + yyyy;
  console.log("FINISHED EXPORTING CLARITY CONNECT");

  fs.writeFile(`backups/Backup-${today}.json`, jsonLogs, (err) => {
    if (err) console.log(err);
    else {
      console.log("File written successfully\n");
    }
    return;
  });


}

exportTwilioFlex();
