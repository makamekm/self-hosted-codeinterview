import { observer } from "mobx-react";
import classNames from "classnames";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-scss";
import "ace-builds/src-noconflict/theme-dracula";
import { useCallback, useContext, useState } from "react";
import { QuestionnaireService } from "~/services/QuestionnaireService";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.bubble.css";
import "@reach/tooltip/styles.css";
import { GradeDto, GradeNameDto } from "~/dto/result.questionnaire.dto";
import { LanguageName, LanguageType } from "~/dto/language.dto";
import { CloseDialogButton } from "./CloseDialogButton";

export const QuestionarieReview = observer(() => {
  const questionnaireService = useContext(QuestionnaireService);

  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const openSelectDialog = useCallback(() => setShowSelectDialog(true), []);
  const closeSelectDialog = useCallback(() => setShowSelectDialog(false), []);

  return (
    <>
      <button
        onClick={openSelectDialog}
        className="bg-gray-600 hover:bg-gray-500 focus:outline-none focus:bg-gray-500 text-white text-sm px-4 py-2 rounded-sm transition-colors duration-200"
      >
        Review
      </button>
      <Dialog
        isOpen={showSelectDialog}
        onDismiss={closeSelectDialog}
        aria-label="Select Questionaire Dialog"
      >
        <CloseDialogButton onClick={closeSelectDialog} />
        <div className="mb-4 flex flex-row justify-between items-center">
          <div className="font-semibold text-xl">Final Review</div>
          <div className="text-gray-400">
            {questionnaireService.questionnaire.name}
            <span className="mx-2">/</span>
            {LanguageName[questionnaireService.questionnaire.language]}
          </div>
        </div>
        <div className="w-full space-y-4">
          {questionnaireService.questionnaire.sections.map((section) => (
            <div className="w-full" key={section.id}>
              <div className="rounded-md shadow-xl bg-gray-700">
                <div className="px-2 py-2 w-full text-center font-semibold text-base hover:bg-gray-500 focus:bg-gray-500 focus:outline-none rounded-sm transition-colors duration-200">
                  {section.name} (
                  {section.questions.reduce((acc, q) => {
                    return (
                      acc +
                      (q.grade == null || q.grade === GradeDto.NotAssesed
                        ? 0
                        : 1)
                    );
                  }, 0)}{" "}
                  / {section.questions.length})
                </div>
                <div className="px-2 py-2 border-gray-600 border-t space-y-4">
                  {!!section.description && (
                    <ReactQuill
                      readOnly
                      theme={"bubble"}
                      value={section.description}
                    />
                  )}

                  <div className="w-full flex flex-col space-y-4">
                    {section.questions.map((question) => (
                      <div className="w-full" key={question.id}>
                        <div className="rounded-sm">
                          <div className="flex flex-row justify-start items-center px-2 py-2 w-full text-left hover:bg-gray-500 focus:bg-gray-500 focus:outline-none rounded-sm transition-colors duration-200">
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
                          </div>
                          <div className="px-2 py-2 space-y-4">
                            {!!question.description && (
                              <ReactQuill
                                readOnly
                                theme={"bubble"}
                                value={question.description}
                              />
                            )}
                            {!!question.code && (
                              <AceEditor
                                readOnly
                                mode={
                                  LanguageType[
                                    question.language ||
                                      questionnaireService.questionnaire
                                        .language
                                  ]
                                }
                                theme="dracula"
                                minLines={1}
                                maxLines={Infinity}
                                className="min-w-full max-w-full min-h-full max-h-full rounded-lg"
                                value={question.code}
                              />
                            )}
                            {!!question.comment && (
                              <ReactQuill
                                readOnly
                                theme={"bubble"}
                                value={question.comment}
                              />
                            )}
                            <div className="font-semibold text-right text-green-300">
                              {
                                GradeNameDto[
                                  question.grade || GradeDto.NotAssesed
                                ]
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Dialog>
    </>
  );
});
