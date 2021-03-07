import React from "react";
import { CreateRoomService } from "~/services/CreateRoomService";
import { UserPanel } from "~/components/UserPanel";
import { UserService } from "~/services/UserService";
import { BG } from "~/components/BG";
import { TopPanel } from "~/components/TopPanel";

const Home: React.FC = () => {
  const service = React.useContext(CreateRoomService);
  const userService = React.useContext(UserService);
  const onClickCreate = React.useCallback(async () => {
    const room = await service.create();
    if (room) {
      service.openRoom(room.id, room.managerSecret);
    }
  }, [service]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen min-w-full">
      <TopPanel />
      <div className="flex-1 flex flex-col justify-center items-center">
        <button
          disabled={service.isCreating}
          onClick={onClickCreate}
          className="font-semibold font-mono outline-none focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-50 bg-green-600 rounded-lg text-white text-base text-center px-6 py-4 transition duration-300 ease-in-out hover:bg-green-700"
        >
          Create Interview
        </button>
      </div>
      <div className="px-3 flex flex-row justify-center items-center w-full py-3">
        <div className="flex-1 flex flex-row justify-center items-center text-xs font-semibold font-mono text-gray-500">
          <div>Maxim Karpov in 2021</div>
        </div>
      </div>
      <BG />
    </div>
  );
};

export default Home;
