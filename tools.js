const csv = require("csv-parser");
const fs = require("fs");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stringToBoolean(text) {
  return text === "TRUE";
}

function getData(path) {
  const results = [];
  const stream = fs.createReadStream(path).pipe(csv());
  return new Promise((resolve, reject) => {
    stream.on("data", (data) => {
      results.push(data);
    });
    stream.on("error", (err) => {
      resolve(reject);
    });
    stream.on("end", () => {
      resolve(results);
    });
  });
}

module.exports = {
  sleep,
  stringToBoolean,
  getData,
};
