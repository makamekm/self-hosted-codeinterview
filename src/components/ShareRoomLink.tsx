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
        <div className="mb-4 flex flex-col justify-start items-center space-y-4">
          <div className="font-semibold text-xl pb-4">Shared Room Link</div>
          <div className="font-semibold text-sm">For Candidate</div>
          <input
            className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
            onClick={(e) => {
              e.currentTarget.setSelectionRange(
                0,
                e.currentTarget.value.length
              );
              navigator.clipboard.writeText(`${URI}/room/${serviceRoom.id}`);
              addToast("Candidate link has been copied!", {
                appearance: "info",
                autoDismiss: true,
              });
            }}
            onFocus={(e) =>
              e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
            }
            readOnly
            value={`${URI}/room/${serviceRoom.id}`}
          />
          <div className="font-semibold text-sm pt-4">For Interviewer</div>
          <input
            className="w-full py-2 px-4 text-sm text-white bg-gray-900 rounded-md focus:outline-none focus:bg-white focus:text-gray-900 flex-1 transition-colors duration-200"
            onClick={(e) => {
              e.currentTarget.setSelectionRange(
                0,
                e.currentTarget.value.length
              );
              navigator.clipboard.writeText(
                `${URI}/room/${serviceRoom.id}/${serviceRoom.managerSecret}`
              );
              addToast("Interviewer link has been copied!", {
                appearance: "warning",
                autoDismiss: true,
              });
            }}
            onFocus={(e) =>
              e.currentTarget.setSelectionRange(0, e.currentTarget.value.length)
            }
            readOnly
            value={`${URI}/room/${serviceRoom.id}/${serviceRoom.managerSecret}`}
          />
        </div>
      </Dialog>
    </>
  );
};
