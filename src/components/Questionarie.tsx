import { observer } from "mobx-react";
import { useContext } from "react";
import { QuestionnaireService } from "~/services/QuestionnaireService";
import { QuestionarieContent } from "./QuestionarieContent";
import { QuestionarieReview } from "./QuestionarieReview";
import { QuestionarieSelectPanel } from "./QuestionarieSelectPanel";

export const Questionarie = observer(() => {
  const questionnaireService = useContext(QuestionnaireService);

  return (
    <div className="flex flex-col p-2 overflow-y-auto overflow-x-hidden">
      <QuestionarieSelectPanel />
      {questionnaireService.isLoadingQuestionaire ? (
        <div className="loader mt-4" />
      ) : (
        !!questionnaireService.questionnaire && (
          <div className="flex-col flex space-y-2">
            <QuestionarieContent />
            <QuestionarieReview />
          </div>
        )
      )}
    </div>
  );
});

export default Questionarie;
