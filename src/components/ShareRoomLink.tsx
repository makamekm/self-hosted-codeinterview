import { useCallback, useState, useContext } from "react";
import { useToasts } from "react-toast-notifications";
import { RoomService } from "~/services/RoomService";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";
import { URI } from "@env/config";

export const ShareRoomLink = () => {
  const serviceRoom = useContext(RoomService);
  const { addToast } = useToasts();

  const [showShareDialog, setShowShareDialog] = useState(false);
  const openShareDialog = useCallback(() => setShowShareDialog(true), []);
  const closeShareDialog = useCallback(() => setShowShareDialog(false), []);

  const onClickSelectAll = useCallback((e) => {
    e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
  }, []);

  const onFocusCandidate = useCallback(
    (e) => {
      e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
      navigator.clipboard.writeText(`${URI}/room/${serviceRoom.id}`);
      addToast("Candidate link has been copied!", {
        appearance: "info",
        autoDismiss: true,
      });
    },
    [addToast, serviceRoom]
  );

  const onFocusInterviewer = useCallback(
    (e) => {
      e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
      navigator.clipboard.writeText(
        `${URI}/room/${serviceRoom.id}/${serviceRoom.managerSecret}`
      );
      addToast("Interviewer link has been copied!", {
        appearance: "warning",
        autoDismiss: true,
      });
    },
    [addToast, serviceRoom]
  );

  return (
    <>
      <button
        onClick={openShareDialog}
        className="cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 bg-indigo-500 rounded-lg font-medium text-white text-xs text-center px-3 py-1 transition duration-300 ease-in-out hover:bg-indigo-600"
      >
        Share
      </button>
      <Dialog
        isOpen={showShareDialog}
        onDismiss={closeShareDialog}
        aria-label="Shared Room Link"
        className="dialog-sm"
      >
        <div className="mb-4 flex flex-col justify-center items-stretch space-y-4">
          <div
            onClick={closeShareDialog}
            className="absolute right-2 top-2 w-8 h-8 text-gray-500 px-2 py-1 rounded-md flex justify-center items-center cursor-pointer hover:bg-gray-500 focus:bg-gray-500 hover:text-gray-100 focus:text-gray-100 transition-colors duration-200"
          >
            <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path
                d="m350.273438 320.105469c8.339843 8.34375 8.339843 21.824219 0 30.167969-4.160157 4.160156-9.621094 6.25-15.085938 6.25-5.460938 0-10.921875-2.089844-15.082031-6.25l-64.105469-64.109376-64.105469 64.109376c-4.160156 4.160156-9.621093 6.25-15.082031 6.25-5.464844 0-10.925781-2.089844-15.085938-6.25-8.339843-8.34375-8.339843-21.824219 0-30.167969l64.109376-64.105469-64.109376-64.105469c-8.339843-8.34375-8.339843-21.824219 0-30.167969 8.34375-8.339843 21.824219-8.339843 30.167969 0l64.105469 64.109376 64.105469-64.109376c8.34375-8.339843 21.824219-8.339843 30.167969 0 8.339843 8.34375 8.339843 21.824219 0 30.167969l-64.109376 64.105469zm0 0"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="font-semibold text-xl pb-4 text-left">
            Shared Room Link
          </div>
          <div className="font-semibold text-sm">For Candidate</div>
          <input
            className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
            onClick={onClickSelectAll}
            onFocus={onFocusCandidate}
            readOnly
            value={`${URI}/room/${serviceRoom.id}`}
          />
          <div className="font-semibold text-sm pt-4 text-left">
            For Interviewer
          </div>
          <input
            className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
            onClick={onClickSelectAll}
            onFocus={onFocusInterviewer}
            readOnly
            value={`${URI}/room/${serviceRoom.id}/${serviceRoom.managerSecret}`}
          />
        </div>
      </Dialog>
    </>
  );
};
