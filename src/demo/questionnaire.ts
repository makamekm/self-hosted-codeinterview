import { Language } from "~/dto/language.dto";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";

export const questionnaireList = [
  {
    id: "bnmb",
    language: Language.JavaScript,
    name: "Demo JavaScript",
  },
  {
    id: "jjhkjhkj",
    language: Language.JavaScript,
    name: "Demo 2 JavaScript",
  },
];

export const questionnairies: QuestionnaireDto[] = [
  {
    id: "bnmb",
    language: Language.JavaScript,
    name: "Demo JavaScript",
    sections: [
      {
        id: "jhghj",
        description: "ggggjgghj h hjg",
        name: "First Section",
        questions: [
          {
            id: "jjhjkh",
            code: "console.log('Hello World')",
            name: "First Question",
            description: "jhggghjgj gjhghghj",
          },
          {
            id: "jjhjk",
            code: "console.log('Hello jhjkhjkhk')",
            name: "Second Question",
          },
          {
            id: "kljl",
            code: "",
            name: "First Question",
            description: "jhggghjgj gjhghghj",
          },
        ],
      },
      {
        id: "kjkjkljlk",
        name: "Second Section",
        questions: [
          {
            id: "lkjkljlk",
            name: "First Question jhkj",
            description: "jhggghjgj gjhghghj",
          },
          {
            id: "hkjhkjh",
            code: "console.log('Hello jhjkhjkhk')",
            name: "Second Question",
            description: "jhggghjgj gjhghghj",
          },
          {
            id: "lklklk",
            code: "",
            name: "First Question",
          },
        ],
      },
    ],
  },
  {
    id: "jjhkjhkj",
    language: Language.JavaScript,
    name: "Demo 2 JavaScript",
    sections: [
      {
        id: "jhghj",
        description: "ggggjgghj h hjg",
        name: "First Alt Section",
        questions: [
          {
            id: "jjhjkh",
            code: "console.log('Hello World')",
            name: "First Question",
            description: "jhggghjgj gjhghghj",
          },
          {
            id: "jjhjk",
            code: "console.log('Hello jhjkhjkhk')",
            name: "Second Question",
          },
          {
            id: "kljl",
            code: "",
            name: "First Question",
            description: "jhggghjgj gjhghghj",
          },
        ],
      },
      {
        id: "kjkjkljlk",
        name: "Second Section",
        questions: [
          {
            id: "lkjkljlk",
            name: "First Question jhkj",
            description: "jhggghjgj gjhghghj",
          },
          {
            id: "hkjhkjh",
            code: "console.log('Hello jhjkhjkhk')",
            name: "Second Question",
            description: "jhggghjgj gjhghghj",
          },
          {
            id: "lklklk",
            code: "",
            name: "First Question",
          },
        ],
      },
    ],
  },
];
