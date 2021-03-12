export enum Language {
  // TypeScript = "TypeScript",
  JavaScript = "JavaScript",
  Java = "Java",
}

export const LanguageName = {
  // [Language.TypeScript]: "TypeScript",
  [Language.JavaScript]: "JavaScript",
  [Language.Java]: "Java",
};

export const LanguageType = {
  // [Language.TypeScript]: "typescript",
  [Language.JavaScript]: "javascript",
  [Language.Java]: "java",
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
    "openjdk",
    ["javac", "Main.java", "&&", "java", "Main"],
    "Main.java",
  ],
};
