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
  title: string;
  genres: string;
  isFinish: string;
  isAdult: string;
  isPay: string;
  platform: Platform;
  url: string;
  thumbnail: string;
  description: string;
  author: string;
}

export type CsvData = Webtoon[] | Author[] | Genre[];
