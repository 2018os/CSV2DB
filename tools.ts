import csv from "csv-parser";
import fs from "fs";

import { CsvData } from "./types";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const stringToBoolean = (text: string) => {
  return text === "TRUE";
};

export function getData(path: string) {
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

export function convertGenre(genre: string) {
  switch (genre.trim()) {
    case "개그":
      return "코믹";
    case "시대극":
      return "역사";
    default:
      return genre.trim();
  }
}

export function convertAuthor(author: string) {
  switch (author.trim()) {
    case "meen" || "Meen":
      return "MEEN";
    default:
      return author.trim();
  }
}
