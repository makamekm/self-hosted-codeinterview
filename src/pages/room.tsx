import { observer } from "mobx-react";
import dynamic from "next/dynamic";
import React, { useContext } from "react";
import { EditorService } from "~/components/services/EditorService";
// import  from "react-codemirror2";

const Editor = dynamic(() => import("~/components/CodeMirror"), {
  ssr: false,
});

const Page: React.FC = observer(() => {
  const service = useContext(EditorService);
  return (
    <div className="h-screen">
      <Editor />
    </div>
  );
});

export default Page;
