import { observer } from "mobx-react";
import React from "react";
import { InterviewRoom } from "~/components/Interview";

const Page: React.FC = observer(() => {
  return <InterviewRoom />;
});

export default Page;
