export enum Language {
  TypeScript = "TypeScript",
  JavaScript = "JavaScript",
  Java = "Java",
}

export const LanguageName = {
  [Language.TypeScript]: "TypeScript",
  [Language.JavaScript]: "JavaScript",
  [Language.Java]: "Java",
};

export const LanguageType = {
  [Language.TypeScript]: "typescript",
  [Language.JavaScript]: "javascript",
  [Language.Java]: "java",
};

export const LanguageRunnerData: {
  [key: string]: [image: string, command: string[], fileName: string];
} = {
  [Language.TypeScript]: ["node", ["npx", "ts-node"], "file.ts"],
  [Language.JavaScript]: ["node", ["node"], "file.js"],
  [Language.Java]: ["java", ["java"], "file.java"],
};
