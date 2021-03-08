import { observer } from "mobx-react";
import { useRouter } from "next/router";
import React, { useContext, useEffect } from "react";
import { QuestionarieBuilder } from "~/components/QuestionarieBuilder";
import { TopPanel } from "~/components/TopPanel";
import { QuestionnaireBuilderService } from "~/services/QuestionnaireBuilderService";

const Home: React.FC = observer(() => {
  const router = useRouter();
  const service = useContext(QuestionnaireBuilderService);

  useEffect(() => {
    service.id = router.query.id as string;
    if (service.id) service.load();
    else service.setEmpty();
  }, [router.query.id, service]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen min-w-full">
      <TopPanel />
      <div className="flex-1 flex flex-col justify-start items-center w-1/2 mb-4">
        <QuestionarieBuilder />
      </div>
    </div>
  );
});

export default Home;
