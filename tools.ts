import csv from "csv-parser";
import fs from "fs";

import { CsvData } from "./types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const stringToBoolean = (text: string) => {
  return text === "TRUE";
};

function getData(path: string) {
  const results: CsvData = [];
  const stream = fs.createReadStream(path).pipe(csv());
  return new Promise<any>((resolve, reject) => {
    stream.on("data", (data: any) => {
      results.push(data);
    });
    stream.on("error", () => {
      resolve(reject);
    });
    stream.on("end", () => {
      resolve(results);
    });
  });
}

export { sleep, stringToBoolean, getData };
