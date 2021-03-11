import { observer } from "mobx-react";
import classNames from "classnames";
import { ChangeEvent, useCallback, useContext } from "react";
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
import {
  GradeDto,
  GradeNameDto,
  ResultQuestionnaireSectionQuestionDto,
} from "~/dto/result.questionnaire.dto";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import { LanguageName } from "~/dto/language.dto";
import { EditorService } from "~/services/EditorService";
import { RoomService } from "~/services/RoomService";

export const QuestionarieContent = observer(() => {
  const questionnaireService = useContext(QuestionnaireService);
  const roomService = useContext(RoomService);
  const editorService = useContext(EditorService);

  const onChangeGrade = useCallback(
    (question: ResultQuestionnaireSectionQuestionDto) => (value) => {
      question.grade = value;
      questionnaireService.syncQuestionnaire();
    },
    [questionnaireService]
  );
  const onChangeComment = useCallback(
    (question: ResultQuestionnaireSectionQuestionDto) => (
      event: ChangeEvent<HTMLInputElement>
    ) => {
      question.comment = event.currentTarget.value;
      questionnaireService.syncQuestionnaire();
    },
    [questionnaireService]
  );
  const onSendCodeToEditorGrade = useCallback(
    (question: ResultQuestionnaireSectionQuestionDto) => () => {
      editorService.onApplyCode(
        question.code,
        question.language || questionnaireService.questionnaire.language
      );
    },
    [editorService, questionnaireService]
  );

  return (
    <div>
      <Accordion className="w-full">
        {questionnaireService.questionnaire.sections.map((section) => (
          <AccordionItem className="w-full mt-2" key={section.id}>
            <div className="rounded-md shadow-xl bg-gray-700">
              <AccordionButton className="px-2 py-2 w-full text-center font-semibold text-base hover:bg-gray-500 focus:bg-gray-500 focus:outline-none rounded-sm transition-colors duration-200">
                {section.name} (
                {section.questions.reduce((acc, q) => {
                  return (
                    acc +
                    (q.grade == null || q.grade === GradeDto.NotAssesed ? 0 : 1)
                  );
                }, 0)}{" "}
                / {section.questions.length})
              </AccordionButton>
              <AccordionPanel className="px-2 py-2 border-gray-600 border-t space-y-4">
                {!!section.description && (
                  <ReactQuill
                    readOnly
                    theme={"bubble"}
                    value={section.description || ""}
                  />
                )}

                <Accordion className="w-full flex flex-col space-y-4">
                  {section.questions.map((question) => (
                    <AccordionItem className="w-full" key={question.id}>
                      <div className="rounded-sm">
                        <AccordionButton className="flex flex-row justify-start items-center px-2 py-2 w-full text-left hover:bg-gray-500 focus:bg-gray-500 focus:outline-none rounded-sm transition-colors duration-200">
                          <div
                            className={classNames("text-6xl mr-2 -mt-2", {
                              "text-green-500":
                                question.grade != null &&
                                question.grade !== GradeDto.NotAssesed,
                              "text-gray-500":
                                question.grade == null ||
                                question.grade === GradeDto.NotAssesed,
                            })}
                            style={{ lineHeight: 0 }}
                          >
                            &bull;
                          </div>
                          <div className="flex-1">{question.name}</div>
                          <div className="text-gray-400">
                            {
                              LanguageName[
                                question.language ||
                                  questionnaireService.questionnaire.language
                              ]
                            }
                          </div>
                        </AccordionButton>
                        <AccordionPanel className="px-2 py-2 space-y-4">
                          {!!question.description && (
                            <ReactQuill
                              readOnly
                              theme={"bubble"}
                              value={question.description || ""}
                            />
                          )}
                          <div className="flex flex-row justify-between items-center w-full space-x-4">
                            <Listbox
                              className="w-40"
                              value={question.grade || GradeDto.NotAssesed}
                              onChange={onChangeGrade(question)}
                            >
                              {Object.keys(GradeNameDto).map((grade) => (
                                <ListboxOption key={grade} value={grade}>
                                  {GradeNameDto[grade]}
                                </ListboxOption>
                              ))}
                            </Listbox>

                            <ReactQuill
                              theme={"bubble"}
                              placeholder="Comments..."
                              value={question.comment || ""}
                              onChange={(value) => (question.comment = value)}
                            />

                            {!!question.code && (
                              <Tooltip label={question.code}>
                                <button
                                  onClick={onSendCodeToEditorGrade(question)}
                                  className="outline-none focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 bg-indigo-500 rounded-md font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-indigo-600 focus:bg-indigo-600"
                                >
                                  Send code to Editor
                                </button>
                              </Tooltip>
                            )}
                          </div>
                        </AccordionPanel>
                      </div>
                    </AccordionItem>
                  ))}
                </Accordion>
              </AccordionPanel>
            </div>
          </AccordionItem>
        ))}
      </Accordion>
      <style jsx global>{`
        [data-reach-dialog-content] {
          background-color: #282a36 !important;
          color: #ddd !important;
        }
      `}</style>
    </div>
  );
});
