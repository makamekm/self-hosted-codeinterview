import classNames from "classnames";
import { observer } from "mobx-react";
import { useContext } from "react";
import { LoadingService } from "~/services/LoadingService";

export const LoadingScreen = observer(() => {
  const service = useContext(LoadingService);
  return (
    <div
      className={classNames(
        "fixed left-0 right-0 bottom-0 top-0 transition-opacity duration-200 z-50 flex justify-stretch items-stretch bg",
        {
          "opacity-0 pointer-events-none": !service.isLoading,
          "opacity-100 pointer-events-all": service.isLoading,
        }
      )}
    >
      <div className="flex flex-col justify-center items-center h-full w-full space-y-4">
        <div className="loader" />
        <div className="font-mono text-lg font-semibold">Loading...</div>
      </div>
      <style jsx>{`
        .bg {
          background-color: #282a36;
          color: #ddd;
        }
      `}</style>
    </div>
  );
});
