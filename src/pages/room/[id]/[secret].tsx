import { observer } from "mobx-react";
import dynamic from "next/dynamic";
import React, { useContext } from "react";
import { useRouter } from "next/router";
import { RoomService } from "~/components/services/RoomService";
// import  from "react-codemirror2";

const Editor = dynamic(() => import("~/components/Editor"), {
  ssr: false,
});

const Terminal = dynamic(() => import("~/components/Terminal"), {
  ssr: false,
});

const Page: React.FC = observer(() => {
  const router = useRouter();
  const service = useContext(RoomService);

  React.useEffect(() => {
    return () => {
      service.shouldKeepConnection = false;
    };
  });

  React.useEffect(() => {
    service.id = router.query.id as string;
    service.managerSecret = router.query.secret as string;

    service.shouldKeepConnection = true;
    service.connect();
  }, [service, service.connect, router.query.id, router.query.secret]);

  return (
    <div className="h-screen w-full max-h-screen max-w-screen flex flex-row justify-items-stretch items-stretch">
      <div className="w-1/2">
        <Editor />
      </div>
      <div className="w-1/2 border-l border-gray-700">
        <div className="relative min-w-full max-w-full min-h-full max-h-full flex flex-col">
          <div className="border-b border-gray-700">
            <ul className="flex cursor-pointer">
              <li className="py-2 px-6 rounded-t-lg border-b-2 border-gray-300">
                Terminal
              </li>
              <li className="py-2 px-6 rounded-t-lg text-gray-500 border-b-2 border-transparent">
                Questionarie
              </li>
              <li className="py-2 px-6 rounded-t-lg text-gray-500 border-b-2 border-transparent">
                Private Chat
              </li>
            </ul>
          </div>
          <div className="relative flex-1 flex flex-col min-h-full max-h-full">
            <Terminal />
          </div>
        </div>
      </div>
      <style jsx global>{`
        .tabs {
          border-bottom: 2px solid #eaeaea;
        }
      `}</style>
    </div>
  );
});

export default Page;
