import { PrismaClient } from "@prisma/client";

import { sleep, getData } from "./tools";

import { Genre, Webtoon, CsvData } from "./types";

const prisma = new PrismaClient();

async function insertGenres(value: Genre) {
  return prisma.genre.create({
    data: {
      name: value.name,
      code: value.code,
    },
  });
}

async function insertWebtoon(value: Webtoon) {
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
    url: {
      NAVER: `https://comic.naver.com/${url}`,
      DAUM: `http://webtoon.daum.net/webtoon/view/${url}`,
    }[platform],
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
    case "naver":
      return executeInsertData(insertWebtoon, "csv/naver.csv");
    case "daum":
      return executeInsertData(insertWebtoon, "csv/daum.csv");
    default:
      return 0;
  }
}

main().finally(() => {
  prisma.$disconnect();
});
