import { observer } from "mobx-react";
import React from "react";
import { QuestionnaireSearchPanel } from "~/components/QuestionnaireSearchPanel";
import { TopPanel } from "~/components/TopPanel";

const Home: React.FC = observer(() => {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen min-w-full">
      <TopPanel />
      <div className="flex-1 flex flex-col justify-start items-center w-1/2 mb-4">
        <QuestionnaireSearchPanel />
      </div>
    </div>
  );
});

export default Home;
