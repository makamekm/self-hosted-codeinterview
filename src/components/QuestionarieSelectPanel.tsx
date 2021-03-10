import { observer } from "mobx-react";
import { ChangeEvent, useCallback, useContext, useRef, useState } from "react";
import { AlertDialog, AlertDialogLabel } from "@reach/alert-dialog";
import { QuestionnaireService } from "~/services/QuestionnaireService";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";
import { LanguageName } from "~/dto/language.dto";
import { QuestionnaireSearchPanel } from "./QuestionnaireSearchPanel";

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
  const onResetQuestionaire = useCallback(() => {
    openWarnDialog(null);
  }, [openWarnDialog]);
  const onClickItem = useCallback(
    (id: string) => {
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
        <QuestionnaireSearchPanel
          onSelect={onClickItem}
          addon={
            !!questionnaireService.questionnaire && (
              <button
                onClick={onResetQuestionaire}
                className="outline-none focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 bg-red-500 rounded-md font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-red-600 focus:bg-red-600"
              >
                Reset Questionaire
              </button>
            )
          }
        />
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
