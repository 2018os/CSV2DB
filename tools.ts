import csv from "csv-parser";
import fs from "fs";

type Platform = "NAVER" | "DAUM";

export interface Genre {
  name: string;
  code: string;
}

export interface Author {
  id: string;
  name: string;
}

export interface Webtoon {
  id: string;
  title: string;
  genre_codes: string;
  isFinish: string;
  isAdult: string;
  isFree: string;
  platform: Platform;
  url: string;
  thumbnail: string;
  description: string;
  authors_id: string;
}

export type CsvData = Webtoon[] | Author[] | Genre[];

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
