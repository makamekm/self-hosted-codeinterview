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
import {
  GradeDto,
  GradeNameDto,
  ResultQuestionnaireSectionQuestionDto,
} from "~/dto/result.questionnaire.dto";
import { LanguageName } from "~/dto/language.dto";
import { EditorService } from "~/services/EditorService";

export const QuestionarieContent = observer(() => {
  const questionnaireService = useContext(QuestionnaireService);
  const editorService = useContext(EditorService);

  const onChangeGrade = useCallback(
    (question: ResultQuestionnaireSectionQuestionDto) => (value) => {
      question.grade = value;
      questionnaireService.syncQuestionnaire();
    },
    [questionnaireService]
  );
  const onSendCodeToEditorGrade = useCallback(
    (question: ResultQuestionnaireSectionQuestionDto) => () => {
      editorService.onApplyCode(question.code);
    },
    [editorService]
  );

  return (
    <div>
      <Accordion className="w-full">
        {questionnaireService.questionnaire.sections.map((section) => (
          <AccordionItem className="w-full mt-2" key={section.id}>
            <div className="border-gray-600 border rounded-sm">
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
                {!!section.description && <div>{section.description}</div>}

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
                          <div className="text-gray-500">
                            {LanguageName[question.language]}
                          </div>
                        </AccordionButton>
                        <AccordionPanel className="px-2 py-2 space-y-4">
                          {!!question.description && (
                            <div>{question.description}</div>
                          )}
                          <div className="flex flex-row justify-start items-center w-full">
                            <Listbox
                              className="mr-6"
                              value={question.grade || GradeDto.NotAssesed}
                              onChange={onChangeGrade(question)}
                            >
                              {Object.keys(GradeNameDto).map((grade) => (
                                <ListboxOption key={grade} value={grade}>
                                  {GradeNameDto[grade]}
                                </ListboxOption>
                              ))}
                            </Listbox>

                            {!!question.code && (
                              <Tooltip label={question.code}>
                                <button
                                  onClick={onSendCodeToEditorGrade(question)}
                                  className="outline-none focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 bg-indigo-500 rounded-lg font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-indigo-600 focus:bg-indigo-600 mr-6"
                                >
                                  Code to Editor
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
