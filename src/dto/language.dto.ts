import { ARCH } from "@env/config";

export enum Language {
  // TypeScript = "TypeScript",
  JavaScript = "JavaScript",
  Java = "Java",
  HTML = "HTML",
  CSS = "CSS",
  SCSS = "SCSS",
}

export const LanguageName = {
  // [Language.TypeScript]: "TypeScript",
  [Language.JavaScript]: "JavaScript",
  [Language.Java]: "Java",
  [Language.HTML]: "HTML",
  [Language.CSS]: "CSS",
  [Language.SCSS]: "SCSS",
};

export const LanguageType = {
  // [Language.TypeScript]: "typescript",
  [Language.JavaScript]: "javascript",
  [Language.Java]: "java",
  [Language.HTML]: "html",
  [Language.CSS]: "css",
  [Language.SCSS]: "scss",
};

export const LanguageRunnerData: {
  [key: string]: [image: string, command: string[], fileName: string];
} = {
  // [Language.TypeScript]: [
  //   "wjdgusdlek11/ts-node-12",
  //   ["ts-node", "file.ts"],
  //   "file.ts",
  // ],
  [Language.JavaScript]: ["node", ["node", "file.js"], "file.js"],
  [Language.Java]: [
    ARCH === "arm" ? "makame/rp-node-java" : "openjdk:8",
    ["javac", "Main.java", "&&", "java", "Main"],
    "Main.java",
  ],
};
