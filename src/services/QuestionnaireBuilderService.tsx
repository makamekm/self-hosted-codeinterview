import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { Language } from "~/dto/language.dto";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";

const getEmpty = (): QuestionnaireDto => ({
  user: undefined,
  isPublic: false,
  language: Language.JavaScript,
  name: "New Questionnaire",
  sections: [],
});

export const QuestionnaireBuilderService = createService(
  () => {
    const service = useLocalObservable(() => ({
      id: null as string,
      readOnly: false,
      questionnaire: getEmpty(),
      isLoading: false,
      async load() {
        service.isLoading = true;
        service.questionnaire = await fetch(
          "/api/questionnaire/" + service.id
        ).then((r) => r.json());
        service.isLoading = false;
      },
      setEmpty() {
        service.questionnaire = getEmpty();
      },
      async create() {
        const data = await fetch("/api/questionnaire", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(service.questionnaire),
        }).then((res) => res.json());
        console.log(data);
      },
    }));
    return service;
  },
  (service) => {
    // useOnChangeDiff(service, "questionnaire", service._onChange, 100);
  }
);
