import React from "react";
import { TopPanel } from "~/components/TopPanel";
import { QuestionnaireService } from "~/services/QuestionnaireService";

const Home: React.FC = () => {
  const service = React.useContext(QuestionnaireService);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen min-w-full">
      <TopPanel />
      <div className="flex-1 flex flex-col justify-start items-center">
        ghjghjgjhgjhg
      </div>
    </div>
  );
};

export default Home;
