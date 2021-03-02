import { observer } from "mobx-react";
import React, { useContext } from "react";
import { SecondService } from "~/components/services/SecondService";

const Page: React.FC = observer(() => {
  const service = useContext(SecondService);
  return (
    <div>
      <h1 className="text-xl text-center font-bold uppercase mb-5">
        Fade-out buttons
      </h1>
      <div className="flex justify-center w-max mx-auto p-5 rounded border-2 border-gray-200">
        <button className="border-2 border-transparent bg-blue-500 ml-3 py-2 px-4 font-bold uppercase text-white rounded transition-all hover:border-blue-500 hover:bg-transparent hover:text-blue-500">
          primary
        </button>
        <button className="border-2 border-transparent bg-purple-500 ml-3 py-2 px-4 font-bold uppercase text-white rounded transition-all hover:border-purple-500 hover:bg-transparent hover:text-purple-500">
          secondary
        </button>
        <button className="border-2 border-transparent bg-green-500 ml-3 py-2 px-4 font-bold uppercase text-white rounded transition-all hover:border-green-500 hover:bg-transparent hover:text-green-500">
          success
        </button>
        <button className="border-2 border-transparent bg-red-500 ml-3 py-2 px-4 font-bold uppercase text-white rounded transition-all hover:border-red-500 hover:bg-transparent hover:text-red-500">
          danger
        </button>
        <button className="border-2 border-transparent bg-yellow-500 ml-3 py-2 px-4 font-bold uppercase text-white rounded transition-all hover:border-yellow-500 hover:bg-transparent hover:text-yellow-500">
          warning
        </button>
      </div>
      <button onClick={service.increaseCounter}>Click Me</button>
      <div>Counter: {service.counterValue}</div>
    </div>
  );
});

export default Page;
