import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { debounce } from "ts-debounce";
import { SocketService } from "./SocketService";
import { Language } from "~/dto/language.dto";
import { ResultQuestionnaireDto } from "~/dto/result.questionnaire.dto";
import { RoomService } from "./RoomService";
import { toJS } from "mobx";
import { applyDiff, getDiff } from "~/utils/diff.util";
import { RoomMessage } from "~/dto/room-message.dto";

export const QuestionnaireService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      roomService: null as ReturnType<typeof RoomService.useState>,
      questionnaire: null as ResultQuestionnaireDto,
      questionnairePrev: null as ResultQuestionnaireDto,
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
        await service.roomService.emit(RoomMessage.RoomQuestionnaire, {
          type: "replace",
          value: service.questionnaire,
        });
      },
      onQuestionnaireUpdate({ type, value: diffs }) {
        if (type === "replace") {
          service.questionnaire = diffs;
          service.questionnairePrev = toJS(service.questionnaire);
        } else if (type === "diff") {
          const prevValue = toJS(service.questionnaire);
          service.questionnaire = applyDiff(toJS(service.questionnaire), diffs);
          service.questionnairePrev = prevValue;
        }
      },
      async select(id?: string) {
        service.isLoadingQuestionaire = true;
        if (id == null) {
          service.questionnaire = null;
        } else {
          service.questionnaire = await fetch(
            `/api/questionnaire/${id}`
          ).then((res) => res.json());
        }
        await service.save();
        service.isLoadingQuestionaire = false;
      },
      async _onChange(diff) {
        await service.roomService.emit(RoomMessage.RoomQuestionnaire, {
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
    service.syncQuestionnaire = debounce(service._syncQuestionnaire, 100);
    service.socketService.useOn(
      RoomMessage.RoomQuestionnaire,
      service.onQuestionnaireUpdate
    );
    // useOnChangeDiff(service, "questionnaire", service._onChange, 100);
  }
);
