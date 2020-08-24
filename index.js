const csv = require("csv-parser");
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

const AUTHOR_ID_UNIT = 1000;
const WEBTOON_ID_UNIT = 10000;

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

async function insertGenres(genre) {
  return prisma.genre.create({
    data: {
      name: genre.name,
      code: genre.code,
    },
  });
}

async function insertAuthors(author) {
  const authorIdaddedUnit = Number(author.id) + AUTHOR_ID_UNIT;
  return prisma.author.create({
    data: {
      id: Buffer.from(String(authorIdaddedUnit)).toString("base64"),
      name: author.name,
    },
  });
}

async function insertWebtoons(webtoon) {
  const {
    id, // base64 encoding
    title,
    // genres,
    genre_codes,
    isFinish,
    isAdult,
    isFree,
    platform,
    url,
    thumbnail,
    description,
    authors_id,
  } = webtoon;
  const genreArray = genre_codes.split("/");
  const genreObj = genreArray.map((genre) => ({ code: genre }));
  const authorArray = authors_id.split("/");
  const authorObj = authorArray.map((author) => {
    const authorIdaddedUnit = Number(author) + AUTHOR_ID_UNIT;
    return { id: Buffer.from(String(authorIdaddedUnit)).toString("base64") };
  });
  const webtoonIdaddedUnit = Number(id) + WEBTOON_ID_UNIT;
  // return prisma.webtoon.create({
  //   data: {
  //     id: Buffer.from(String(webtoonIdaddedUnit)).toString("base64"),
  //     title,
  //     description,
  //     isAdult: stringToBoolean(isAdult),
  //     isFinish: stringToBoolean(isFinish),
  //     isPay: !stringToBoolean(isFree),
  //     platform,
  //     thumbnail,
  //     url,
  //     authors: {
  //       connect: authorObj,
  //     },
  //     genres: {
  //       connect: genreObj,
  //     },
  //   },
  // });
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
  // console.dir(data, { depth: null });
  return prisma.webtoon.create({
    data,
  });
}

async function main() {
  const trigger = process.argv[2]; // "genre" or "author" or "webtoon"
  const data = await getData(`csv/${trigger}.csv`);
  const action =
    trigger === "genre"
      ? insertGenres
      : trigger === "author"
      ? insertAuthors
      : insertWebtoons;
  for (let i = 0; i < data.length; i++) {
    sleep(2000);
    await action(data[i]);
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
