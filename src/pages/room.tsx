import { observer } from "mobx-react";
import dynamic from "next/dynamic";
import React, { useContext } from "react";
import { useRouter } from "next/router";
import { RoomService } from "~/components/services/RoomService";
// import  from "react-codemirror2";

const Editor = dynamic(() => import("~/components/CodeMirror"), {
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
    <div className="h-screen">
      <Editor />
    </div>
  );
});

export default Page;
