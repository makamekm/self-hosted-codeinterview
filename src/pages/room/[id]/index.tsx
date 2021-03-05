import { observer } from "mobx-react";
import React from "react";
import { Interview } from "~/components/Interview";

const Page: React.FC = observer(() => {
  return <Interview />;
});

export default Page;
