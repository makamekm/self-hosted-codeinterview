import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { Language } from "~/dto/language.dto";
import { QuestionnaireDto } from "~/dto/questionnaire.dto";
import { UserService } from "./UserService";
import { useContext } from "react";
import { LoadingService } from "./LoadingService";

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
      userService: null as ReturnType<typeof UserService.useState>,
      loadingService: null as ReturnType<typeof LoadingService.useState>,
      id: null as string,
      readOnly: false,
      questionnaire: getEmpty(),
      isLoading: false,
      async load() {
        service.isLoading = true;
        service.loadingService.blockers++;
        const data = await fetch("/api/questionnaire/" + service.id).then((r) =>
          r.json()
        );
        service.questionnaire = data;
        service.readOnly =
          service.questionnaire.user?._id !== service.userService.user?._id;
        service.isLoading = false;
        service.loadingService.blockers--;
      },
      setEmpty() {
        service.questionnaire = getEmpty();
      },
      async save() {
        service.isLoading = true;
        const data = await fetch("/api/questionnaire", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(service.questionnaire),
        }).then((res) => res.json());
        service.questionnaire = data;
        service.isLoading = false;
        return data;
      },
      async create() {
        service.isLoading = true;
        const data = await fetch("/api/questionnaire", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(service.questionnaire),
        }).then((res) => res.json());
        service.isLoading = false;
        return data._id;
      },
      async delete() {
        service.isLoading = true;
        await fetch("/api/questionnaire/" + service.id, {
          method: "DELETE",
        }).then((res) => res.json());
        service.isLoading = false;
        return true;
      },
    }));
    return service;
  },
  (service) => {
    service.userService = useContext(UserService);
    service.loadingService = useContext(LoadingService);
    // useOnChangeDiff(service, "questionnaire", service._onChange, 100);
  }
);
