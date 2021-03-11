import { observer } from "mobx-react";
import dynamic from "next/dynamic";
import React, { useContext } from "react";
import { useRouter } from "next/router";
import { RoomService } from "~/services/RoomService";
import { Tabs, TabTypes } from "~/components/Tabs";
import { RoomInfo } from "./RoomInfo";
import { ShareRoomLink } from "./ShareRoomLink";
// import  from "react-codemirror2";

const Editor = dynamic(() => import("~/components/Editor"), {
  ssr: false,
});

const Terminal = dynamic(() => import("~/components/Terminal"), {
  ssr: false,
});

const Questionarie = dynamic(() => import("~/components/Questionarie"), {
  ssr: false,
});

export const InterviewRoom: React.FC = observer(() => {
  const router = useRouter();
  const serviceRoom = useContext(RoomService);

  React.useEffect(() => {
    return () => {
      serviceRoom.shouldKeepConnection = false;
    };
  });

  React.useEffect(() => {
    serviceRoom.id = router.query.id as string;
    serviceRoom.managerSecret = router.query.secret as string;

    serviceRoom.shouldKeepConnection = true;
    serviceRoom.connect();
  }, [serviceRoom, router.query.id, router.query.secret]);

  return (
    <div className="h-screen w-full max-h-screen max-w-screen flex flex-row justify-items-stretch items-stretch">
      <div className="w-1/2">
        <Editor />
      </div>
      <div className="w-1/2 border-l border-gray-700">
        <div className="relative min-w-full max-w-full min-h-full max-h-full flex flex-col">
          <Tabs
            render={(type) => {
              let container: JSX.Element;
              if (type === TabTypes.Terminal) {
                container = <Terminal />;
              } else if (type === TabTypes.Questionarie) {
                container = <Questionarie />;
              } else if (type === TabTypes.Room) {
                container = <RoomInfo />;
              }
              return (
                <div className="relative flex-1 flex flex-col min-h-full max-h-full space-x-2">
                  {serviceRoom.client?.isManager && <ShareRoomLink />}
                  {container}
                </div>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
});
