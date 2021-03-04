import classNames from "classnames";
import { observer, useLocalObservable } from "mobx-react";
import { useContext, useEffect, useRef } from "react";
import { UserService } from "~/services/UserService";

export enum TabTypes {
  Terminal,
  Questionarie,
  ManagerChat,
  Settings,
}

export const UserPanel = observer(() => {
  const ref = useRef<HTMLDivElement>();
  const userService = useContext(UserService);
  const state = useLocalObservable(() => ({
    open: false,
    onToggle() {
      state.open = !state.open;
    },
  }));
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        state.open = false;
      }
    };
    document.addEventListener("click", fn);
    return () => {
      document.removeEventListener("click", fn);
    };
  }, [state]);
  if (!userService.user) {
    return (
      <div className="p-px bg-gray-300 rounded-full relative mx-2">
        <img
          tabIndex={0}
          src="https://i2.wp.com/www.techgeekandmore.com/wp-content/uploads/2018/05/Google.jpg?w=246&ssl=1"
          alt=""
          className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
          onClick={userService.loginGoogle}
        />
      </div>
    );
  }
  return (
    <div className="p-px bg-gray-300 rounded-full relative mx-2" ref={ref}>
      <img
        tabIndex={0}
        src={userService.user.picture}
        alt=""
        className="w-8 h-8 rounded-full cursor-pointer hover:ring-2 hover:ring-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        onClick={state.onToggle}
      />
      <div
        className={classNames(
          "absolute right-0 w-40 mt-2 bg-white border rounded shadow-xl z-10",
          {
            hidden: !state.open,
          }
        )}
      >
        {/* <button className="transition-colors duration-200 block px-4 py-2 text-sm text-left text-gray-900 rounded hover:bg-blue-400 hover:text-white w-full">
          Settings
        </button>
        <hr /> */}
        <button
          onClick={userService.logout}
          className="transition-colors duration-200 block px-4 py-2 text-sm text-left text-gray-900 rounded hover:bg-blue-400 hover:text-white w-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
});
