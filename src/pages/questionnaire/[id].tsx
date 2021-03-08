import { observer } from "mobx-react";
import { useRouter } from "next/router";
import React from "react";
import { TopPanel } from "~/components/TopPanel";

const Home: React.FC = observer(() => {
  const router = useRouter();
  const id = router.query.id as string;

  return (
    <div className="flex flex-col justify-center items-center min-h-screen min-w-full">
      <TopPanel />
      <div className="flex-1 flex flex-col justify-start items-center w-1/2 mb-4">
        {id}
      </div>
    </div>
  );
});

export default Home;
