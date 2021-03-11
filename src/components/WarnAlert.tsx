import { useCallback, useRef, useState } from "react";
import { AlertDialog, AlertDialogLabel } from "@reach/alert-dialog";
import { observer } from "mobx-react";
import "@reach/dialog/styles.css";

export const WarnDialog = observer(
  ({
    text,
    onApprove,
    children,
  }: {
    text: string;
    onApprove: () => void;
    children: (ops: { open: () => void; close: () => void }) => JSX.Element;
  }) => {
    const [showWarnDialog, setShowWarnDialog] = useState(false);
    const openWarnDialog = useCallback(() => setShowWarnDialog(true), [
      setShowWarnDialog,
    ]);
    const closeWarnRef = useRef();
    const closeWarnDialog = useCallback(() => setShowWarnDialog(false), [
      setShowWarnDialog,
    ]);
    const onClickYes = useCallback(() => {
      onApprove();
      closeWarnDialog();
    }, [onApprove, closeWarnDialog]);

    return (
      <>
        {showWarnDialog && (
          <AlertDialog
            aria-label="Warning alert"
            onDismiss={closeWarnDialog}
            leastDestructiveRef={closeWarnRef}
            className="dialog-sm"
          >
            <AlertDialogLabel>
              <h3 className="font-bold text-pink-700">Please Confirm!</h3>
            </AlertDialogLabel>

            <p className="py-4 text-sm text-gray-400">{text}</p>

            <div className="p-4 flex space-x-4">
              <button
                onClick={onClickYes}
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
        {children({ open: openWarnDialog, close: closeWarnDialog })}
      </>
    );
  }
);
