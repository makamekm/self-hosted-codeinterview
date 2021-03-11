import { useCallback, useState, useContext } from "react";
import { RoomService } from "~/services/RoomService";
import { Dialog } from "@reach/dialog";
import "@reach/dialog/styles.css";

export const ShareRoomLink = () => {
  const serviceRoom = useContext(RoomService);

  const [showShareDialog, setShowShareDialog] = useState(false);
  const openShareDialog = useCallback(() => setShowShareDialog(true), []);
  const closeShareDialog = useCallback(() => setShowShareDialog(false), []);

  return (
    <>
      <button
        onClick={openShareDialog}
        className="cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 bg-blue-500 rounded-lg font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-blue-600"
      >
        SHARE
      </button>
      <Dialog
        isOpen={showShareDialog}
        onDismiss={closeShareDialog}
        aria-label="Room Share Link"
      >
        <div className="mb-4 flex flex-row justify-between items-center">
          <div className="font-semibold text-xl">Room Share Link</div>
          <div className="text-gray-400">
            {serviceRoom.id}
            {"/"}
            {serviceRoom.managerSecret}
          </div>
        </div>
      </Dialog>
    </>
  );
};
