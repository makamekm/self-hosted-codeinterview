import React from "react";
import { CreateRoomService } from "~/components/services/CreateRoomService";

const Home: React.FC = () => {
  const service = React.useContext(CreateRoomService);
  const onClickCreate = React.useCallback(async () => {
    const room = await service.create();
    if (room) {
      service.openRoom(room.id, room.managerSecret);
    }
  }, [service]);

  return (
    <div className="container">
      <button
        disabled={service.isCreating}
        onClick={onClickCreate}
        className="border-2 border-transparent bg-blue-500 ml-3 py-2 px-4 font-bold uppercase text-white rounded transition-all hover:border-blue-500 hover:bg-transparent hover:text-blue-500"
      >
        Create Interview
      </button>

      <style jsx>
        {`
          .container {
            min-height: 100vh;
            min-width: 100vw;
            padding: 0 0.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
        `}
      </style>
    </div>
  );
};

export default Home;
