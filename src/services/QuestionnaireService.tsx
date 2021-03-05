import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { debounce } from "ts-debounce";
import { SocketService } from "./SocketService";
import { Language } from "~/dto/language.dto";
import { questionnaireList, questionnairies } from "~/demo/questionnaire";
import { ResultQuestionnaireDto } from "~/dto/result.questionnaire.dto";
import { RoomService } from "./RoomService";
import { useOnChangeDiff } from "~/utils/on-change.hook";
import { toJS } from "mobx";
import { applyDiff, getDiff } from "~/utils/diff.util";

export const QuestionnaireService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      roomService: null as ReturnType<typeof RoomService.useState>,
      questionnaire: null as ResultQuestionnaireDto,
      questionnairePrev: null as ResultQuestionnaireDto,
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
      _syncQuestionnaire() {
        const newValue = toJS(service.questionnaire);
        const diffs = getDiff(toJS(service.questionnairePrev), newValue);
        if (diffs.length > 0) {
          service._onChange(diffs);
        }
        service.questionnairePrev = newValue;
      },
      syncQuestionnaire: null as () => void,
      async save() {
        await service.roomService.emit("room-questionnaire", {
          type: "replace",
          value: service.questionnaire,
        });
      },
      onQuestionnaireUpdate({ type, value: diffs }) {
        if (type === "replace") {
          service.questionnaire = diffs;
        } else if (type === "diff") {
          console.log(diffs);
          const prevValue = toJS(service.questionnaire);
          service.questionnaire = applyDiff(toJS(service.questionnaire), diffs);
          service.questionnairePrev = prevValue;
        }
      },
      async select(id: string) {
        service.isLoadingQuestionaire = true;
        await new Promise((r) => setTimeout(r, 1000)); // DEMO
        service.questionnaire = JSON.parse(
          JSON.stringify(questionnairies.find((q) => q.id === id))
        );
        await service.save();
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
      async _onChange(diff) {
        await service.roomService.emit("room-questionnaire", {
          type: "diff",
          value: diff,
        });
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.roomService = React.useContext(RoomService);
    service._debounceSearch = debounce(service._search, 100);
    service.syncQuestionnaire = debounce(service._syncQuestionnaire, 100);
    service.socketService.useOn(
      "room-questionnaire",
      service.onQuestionnaireUpdate
    );
    React.useEffect(() => {
      if (global.window) service.search();
    });
    // useOnChangeDiff(service, "questionnaire", service._onChange, 100);
  }
);
