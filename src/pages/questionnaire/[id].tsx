import { observer } from "mobx-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useCallback, useContext, useEffect } from "react";
import { TopPanel } from "~/components/TopPanel";
import { WarnDialog } from "~/components/WarnAlert";
import { QuestionnaireBuilderService } from "~/services/QuestionnaireBuilderService";
import { UserService } from "~/services/UserService";

const QuestionarieBuilder = dynamic(
  () => import("~/components/QuestionarieBuilder"),
  {
    ssr: false,
  }
);

const Home: React.FC = observer(() => {
  const router = useRouter();
  const service = useContext(QuestionnaireBuilderService);
  const userService = useContext(UserService);

  useEffect(() => {
    service.id = router.query.id as string;
    service.readOnly = false;
    if (service.id) service.load();
    else service.setEmpty();
  }, [router.query.id, service]);

  const onDuplicate = useCallback(async () => {
    const id = await service.create();
    router.push({ pathname: "/questionnaire/[id]", query: { id } });
  }, [service, router]);

  const onSave = useCallback(async () => {
    await service.save();
  }, [service]);

  const onDelete = useCallback(async () => {
    await service.delete();
    router.push({ pathname: "/questionnaire" });
  }, [service, router]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen min-w-full">
      <TopPanel />
      <div className="flex-1 flex flex-col justify-start items-center mb-4 space-y-4 container-content">
        {!service.isLoading && <div className="w-full flex flex-row items-stretch justify-end space-x-2">
          {!service.readOnly && (
            <WarnDialog
              onApprove={onDelete}
              text="Removing the question cannot be reverted."
            >
              {({ open }) => (
                <button
                  onClick={open}
                  className="cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50 bg-red-500 rounded-lg font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-red-600"
                >
                  DELETE
                </button>
              )}
            </WarnDialog>
          )}
          {!!userService.user && (
            <button
              onClick={onDuplicate}
              className="cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 bg-indigo-500 rounded-lg font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-indigo-600"
            >
              DUPLICATE
            </button>
          )}
          {!service.readOnly && (
            <button
              onClick={onSave}
              className="cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 bg-blue-500 rounded-lg font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-blue-600"
            >
              SAVE
            </button>
          )}
        </div>}
        <QuestionarieBuilder />
      </div>
    </div>
  );
});

export default Home;
