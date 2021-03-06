import { observer } from "mobx-react";
import classNames from "classnames";
import { useCallback, useContext } from "react";
import { QuestionnaireService } from "~/services/QuestionnaireService";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
} from "@reach/accordion";
import "@reach/accordion/styles.css";
import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";
import { GradeDto, GradeNameDto } from "~/dto/result.questionnaire.dto";
import { LanguageName } from "~/dto/language.dto";
import { EditorService } from "~/services/EditorService";
import { RoomService } from "~/services/RoomService";
import { idToColor } from "~/utils/id-to-color.util";

export const RoomInfo = observer(() => {
  const roomService = useContext(RoomService);
  const questionnaireService = useContext(QuestionnaireService);
  const editorService = useContext(EditorService);

  return (
    <div className="overflow-y-auto px-2 py-2">
      <div className="rounded-sm shadow-md bg-gray-700 px-4 py-2 space-y-2">
        <div className="font-semibold text-md">Participants</div>
        <div className="space-y-2 flex flex-col">
          {Object.keys(roomService.room?.clients).map((id) => {
            const client = roomService.room.clients[id];
            return (
              <div
                key={id}
                className="bg-gray-900 w-full flex flex-row justify-start items-center p-2 rounded-md shadow"
              >
                <div className="flex flex-row justify-start items-center px-2 py-2 w-full text-left rounded-sm">
                  <div
                    className="text-6xl mr-2 -mt-2"
                    style={{ lineHeight: 0, color: idToColor(id) }}
                  >
                    &bull;
                  </div>
                  <div className="flex-1">{client.username}</div>
                  <div className="text-gray-500">
                    {client.isManager ? "Interviewer" : "Candidate"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
