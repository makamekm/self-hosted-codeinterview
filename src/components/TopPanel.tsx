import Link from "next/link";
import classNames from "classnames";
import { useRouter } from "next/router";

import { UserPanel } from "./UserPanel";

export const TopPanel = () => {
  const router = useRouter();

  return (
    <div className="px-3 flex flex-row justify-center items-center w-full py-3">
      <div className="flex-1 flex flex-row justify-start items-center text-sm font-semibold font-mono">
        <Link href="/">
          <div className="px-4 py-2 flex flex-row justify-start items-center space-x-2 top-menu-item">
            <div className="text-xl text-indigo-400">{"</>"}</div>
            <div>Code Interview</div>
          </div>
        </Link>
        <div className="px-4 py-2">|</div>
        <Link href="/presentation">
          <div
            className={classNames(
              {
                active: router.route === "/presentation",
              },
              "px-4 py-2 top-menu-item"
            )}
          >
            Presentation
          </div>
        </Link>
        <div className="px-4 py-2">|</div>
        <Link href="/prices">
          <div
            className={classNames(
              {
                active: router.route === "/prices",
              },
              "px-4 py-2 top-menu-item"
            )}
          >
            Enterprise Prices
          </div>
        </Link>
      </div>
      <div className="flex flex-row justify-between items-center text-sm font-semibold font-mono">
        <Link href="/questionnaire">
          <div
            className={classNames(
              {
                active: router.route === "/questionnaire",
              },
              "px-4 py-2 top-menu-item"
            )}
          >
            Questionaries
          </div>
        </Link>
        <div className="px-4 py-2">|</div>
        <UserPanel />
      </div>
    </div>
  );
};
