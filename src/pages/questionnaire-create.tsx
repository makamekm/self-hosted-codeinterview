import { observer } from "mobx-react";
import React from "react";
import { TopPanel } from "~/components/TopPanel";

const Home: React.FC = observer(() => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen min-w-full">
      <TopPanel />
      <div className="flex-1 flex flex-col justify-start items-center w-1/2">
        Create Qu
      </div>
    </div>
  );
});

export default Home;
