import { PrismaClient } from "@prisma/client";

import {
  sleep,
  stringToBoolean,
  getData,
  Genre,
  Author,
  Webtoon,
  CsvData,
} from "./tools";

const prisma = new PrismaClient();

const AUTHOR_ID_UNIT = 1000;
const WEBTOON_ID_UNIT = 10000;

async function insertGenres(value: Genre) {
  return prisma.genre.create({
    data: {
      name: value.name,
      code: value.code,
    },
  });
}

async function insertAuthors(value: Author) {
  const authorIdaddedUnit = Number(value.id) + AUTHOR_ID_UNIT;
  return prisma.author.create({
    data: {
      id: Buffer.from(String(authorIdaddedUnit)).toString("base64"),
      name: value.name,
    },
  });
}

async function insertWebtoons(value: Webtoon) {
  const {
    id, // base64 encoding
    title,
    // genres,
    genre_codes,
    isFinish,
    isAdult,
    isFree,
    // TODO: Enhance
    platform,
    url,
    thumbnail,
    description,
    authors_id,
  } = value;
  const genreArray = genre_codes.split("/");
  const genreObj = genreArray.map((genre) => ({ code: genre }));
  const authorArray = authors_id.split("/");
  const authorObj = authorArray.map((author) => {
    const authorIdaddedUnit = Number(author) + AUTHOR_ID_UNIT;
    return { id: Buffer.from(String(authorIdaddedUnit)).toString("base64") };
  });
  const webtoonIdaddedUnit = Number(id) + WEBTOON_ID_UNIT;
  const data = {
    id: Buffer.from(String(webtoonIdaddedUnit)).toString("base64"),
    title,
    description,
    isAdult: stringToBoolean(isAdult),
    isFinish: stringToBoolean(isFinish),
    isPay: !stringToBoolean(isFree),
    platform,
    thumbnail: thumbnail === "" ? "No thumbnail" : thumbnail,
    url: url === "" ? "No url" : url,
    authors: {
      connect: authorObj,
    },
    genres: {
      connect: genreObj,
    },
  };
  return prisma.webtoon.create({
    data,
  });
}

async function executeInsertData(action: Function, path: string) {
  const data: CsvData = await getData(path);
  for (let i = 0; i < data.length; i++) {
    sleep(2000);
    await action(data[i]);
  }
}
async function main() {
  const trigger = process.argv[2];
  switch (trigger) {
    case "genre":
      return executeInsertData(insertGenres, "csv/genre.csv");
    case "author":
      return executeInsertData(insertAuthors, "csv/author.csv");
    case "webtoon":
      return executeInsertData(insertWebtoons, "csv/webtoons.csv");
    default:
      return 0;
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.disconnect();
    return 0;
  });
