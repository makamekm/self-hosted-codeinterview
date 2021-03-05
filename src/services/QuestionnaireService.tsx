import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { debounce } from "ts-debounce";
import { SocketService } from "./SocketService";
import { Language } from "~/dto/language.dto";
import { questionnaireList, questionnairies } from "~/demo/questionnaire";
import { ResultQuestionnaireDto } from "~/dto/result.questionnaire.dto";

export const QuestionnaireService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      questionnaire: null as ResultQuestionnaireDto,
      questionnaireList: [] as {
        id: string;
        name: string;
        language: Language;
      }[],
      searchQuestionarieLanguage: Language.JavaScript,
      searchQuestionarieName: "",
      searchQuestionarieLimit: 10,
      _debounceSearch: null as () => void,
      isLoadingList: false,
      isLoadingQuestionaire: false,
      async select(id: string) {
        service.isLoadingQuestionaire = true;
        await new Promise((r) => setTimeout(r, 1000)); // DEMO
        service.questionnaire = JSON.parse(
          JSON.stringify(questionnairies.find((q) => q.id === id))
        );
        service.isLoadingQuestionaire = false;
      },
      async _search() {
        await new Promise((r) => setTimeout(r, 1000)); // DEMO
        service.questionnaireList.splice(
          0,
          service.questionnaireList.length,
          ...questionnaireList
            .filter(
              (q) =>
                q.language === service.searchQuestionarieLanguage &&
                (!service.searchQuestionarieName ||
                  q.name.includes(service.searchQuestionarieName))
            )
            .slice(0, service.searchQuestionarieLimit - 1)
        );
        service.isLoadingList = false;
      },
      async search() {
        service.isLoadingList = true;
        await service._debounceSearch();
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service._debounceSearch = debounce(service._search, 100);
    React.useEffect(() => {
      if (global.window) service.search();
    });
  }
);
