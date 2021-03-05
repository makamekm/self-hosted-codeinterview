import { observer } from "mobx-react";
import { ChangeEvent, useCallback, useContext, useRef, useState } from "react";
import { AlertDialog, AlertDialogLabel } from "@reach/alert-dialog";
import { QuestionnaireService } from "~/services/QuestionnaireService";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";
import { LanguageName } from "~/dto/language.dto";

export const QuestionarieSelectPanel = observer(() => {
  const questionnaireService = useContext(QuestionnaireService);

  const [showWarnDialog, setShowWarnDialog] = useState({
    show: false,
    id: null,
  });
  const [showSelectDialog, setShowSelectDialog] = useState(false);
  const openWarnDialog = useCallback(
    (id: string) =>
      setShowWarnDialog({
        show: true,
        id,
      }),
    []
  );
  const closeWarnRef = useRef();
  const closeWarnDialog = useCallback(
    () =>
      setShowWarnDialog({
        ...showWarnDialog,
        show: false,
      }),
    [showWarnDialog]
  );
  const openSelectDialog = useCallback(() => setShowSelectDialog(true), []);
  const closeSelectDialog = useCallback(() => setShowSelectDialog(false), []);
  const onChangeSearchName = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      questionnaireService.searchQuestionarieName = event.currentTarget.value;
      questionnaireService.search();
    },
    [questionnaireService]
  );
  const onChangeSearchLanguage = useCallback(
    (value) => {
      questionnaireService.searchQuestionarieLanguage = value;
      questionnaireService.search();
    },
    [questionnaireService]
  );
  const onClickItem = useCallback(
    (id: string) => () => {
      if (!questionnaireService.questionnaire) {
        questionnaireService.select(id);
        closeSelectDialog();
      } else {
        openWarnDialog(id);
      }
    },
    [closeSelectDialog, openWarnDialog, questionnaireService]
  );
  const onClickSelectYes = useCallback(() => {
    questionnaireService.select(showWarnDialog.id);
    closeWarnDialog();
    closeSelectDialog();
  }, [
    closeSelectDialog,
    closeWarnDialog,
    questionnaireService,
    showWarnDialog.id,
  ]);

  return (
    <>
      <button
        onClick={openSelectDialog}
        className="bg-gray-600 hover:bg-gray-500 focus:outline-none focus:bg-gray-500 text-white text-sm px-4 py-2 rounded-sm transition-colors duration-200"
      >
        Select Questionarie
      </button>
      <Dialog
        isOpen={showSelectDialog}
        onDismiss={closeSelectDialog}
        aria-label="Select Questionaire Dialog"
      >
        <div className="flex flex-row justify-items-center items-center">
          <div className="w-1/4">
            <Listbox
              className="w-full"
              value={String(questionnaireService.searchQuestionarieLanguage)}
              onChange={onChangeSearchLanguage}
            >
              {Object.keys(LanguageName).map((language) => (
                <ListboxOption key={language} value={String(language)}>
                  {LanguageName[language]}
                </ListboxOption>
              ))}
            </Listbox>
          </div>
          <input
            value={questionnaireService.searchQuestionarieName}
            onChange={onChangeSearchName}
            type="search"
            name="serch"
            placeholder="Search"
            className="py-2 px-4 ml-2 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
          />
        </div>

        {questionnaireService.isLoadingList ? (
          <div className="loader mt-4" />
        ) : (
          <div className="pt-2">
            {questionnaireService.questionnaireList.map((questionnaire) => {
              return (
                <div
                  onClick={onClickItem(questionnaire.id)}
                  className="widget mt-2 w-full p-4 rounded-lg bg-gray-900 focus-within:bg-gray-700 hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-col">
                      <div className="text-xs uppercase font-light text-gray-500">
                        {LanguageName[questionnaire.language]}
                      </div>
                      <div className="text-xl font-bold">
                        {questionnaire.name}
                      </div>
                    </div>
                    {/* <svg
                      className="stroke-current text-gray-500"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      viewbox="0 0 24 24"
                      width="24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg> */}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Dialog>
      {showWarnDialog.show && (
        <AlertDialog
          aria-label="Warning about applying questionaire"
          onDismiss={closeWarnDialog}
          leastDestructiveRef={closeWarnRef}
        >
          <AlertDialogLabel>
            <h3 className="font-bold text-pink-700">Please Confirm!</h3>
          </AlertDialogLabel>

          <p className="py-4 text-sm text-gray-400">
            Are you sure you want to select a new questionnaire? This action is
            permanent, and it will reset the currently selected values.
          </p>

          <div className="p-4 flex space-x-4">
            <button
              onClick={onClickSelectYes}
              className="transition-colors duration-300 focus:outline-none w-1/2 px-4 py-3 text-center text-pink-100 bg-pink-600 rounded-lg hover:bg-pink-700 hover:text-white font-bold text-sm"
            >
              Yes, apply
            </button>
            <button
              onClick={closeWarnDialog}
              ref={closeWarnRef}
              className="transition-colors duration-300 focus:outline-none w-1/2 px-4 py-3 text-center bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-black font-bold rounded-lg text-sm"
            >
              Nevermind, don't apply.
            </button>
          </div>
        </AlertDialog>
      )}
      <style jsx global>{`
        [data-reach-dialog-content] {
          background-color: #282a36 !important;
          color: #ddd !important;
        }
      `}</style>
    </>
  );
});
