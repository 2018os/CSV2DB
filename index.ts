import { PrismaClient } from "@prisma/client";

import { sleep, getData } from "./tools";

import { Genre, Author, Webtoon, CsvData } from "./types";

const prisma = new PrismaClient();

const AUTHOR_ID_UNIT = 1000;

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
    title,
    genres,
    isFinish,
    isAdult,
    isPay,
    platform,
    url,
    thumbnail,
    description,
    author,
  } = value;
  const genreArray = genres.split("/");
  const genreObj = genreArray.map((genre) => ({ name: genre.trim() }));
  const authorArray = author.split("/");
  const authorObj = authorArray.map((author) => {
    return {
      id: Buffer.from(author.trim()).toString("base64"),
      name: author.trim(),
    };
  });
  const data = {
    id: Buffer.from(title + author).toString("base64"),
    title,
    description,
    isAdult: !!isAdult,
    isFinish: !!isFinish,
    isPay: !!isPay,
    platform,
    thumbnail: thumbnail === "" ? "No thumbnail" : thumbnail,
    url: url === "" ? "No url" : url,
    authors: {
      connectOrCreate: authorObj.map((author) => {
        return {
          where: {
            id: author.id,
          },
          create: {
            id: author.id,
            name: author.name,
          },
        };
      }),
    },
    genres: {
      connect: genreObj,
    },
  };
  console.log(data.title);
  return prisma.webtoon.upsert({
    where: {
      id: Buffer.from(title + author).toString("base64"),
    },
    create: data,
    update: data,
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
      return executeInsertData(insertWebtoons, "csv/naver-wed.csv");
    default:
      return 0;
  }
}

main().finally(() => {
  prisma.$disconnect();
});
