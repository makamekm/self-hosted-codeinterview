import { observer } from "mobx-react";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { QuestionnaireSearchPanel } from "~/components/QuestionnaireSearchPanel";
import { TopPanel } from "~/components/TopPanel";
import { UserService } from "~/services/UserService";

const Home: React.FC = observer(() => {
  const router = useRouter();
  const userService = useContext(UserService);
  const onCreateQuestionnaire = () => {
    router.push({ pathname: "/questionnaire-create" });
  };
  const onSelectQuestion = (id) => {
    router.push({ pathname: "/questionnaire/[id]", query: { id } });
  };
  return (
    <div className="flex flex-col justify-center items-center min-h-screen min-w-full">
      <TopPanel />
      <div className="flex-1 flex flex-col justify-start items-center mb-4 space-y-2 container-content">
        {!!userService.user && (
          <button
            onClick={onCreateQuestionnaire}
            className="w-full bg-gray-600 hover:bg-gray-500 focus:outline-none focus:bg-gray-500 text-white text-sm px-4 py-2 rounded-sm transition-colors duration-200"
          >
            Create Questionarie
          </button>
        )}

        <QuestionnaireSearchPanel onSelect={onSelectQuestion} />
      </div>
    </div>
  );
});

export default Home;
