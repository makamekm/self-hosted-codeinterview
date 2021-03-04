import classNames from "classnames";
import { observer, useLocalObservable } from "mobx-react";
import { useContext } from "react";
import { RoomService } from "./services/RoomService";
import { UserPanel } from "./UserPanel";

export enum TabTypes {
  Terminal,
  Questionarie,
  ManagerChat,
  Settings,
}

export const Tabs = observer(
  ({ render }: { render: (type: TabTypes) => JSX.Element }) => {
    const roomService = useContext(RoomService);
    const state = useLocalObservable(() => ({
      currentTab: TabTypes.Terminal,
      onClickTerminal: () => {
        state.currentTab = TabTypes.Terminal;
      },
      onClickQuestionarie: () => {
        state.currentTab = TabTypes.Questionarie;
      },
      onClickManagerChat: () => {
        state.currentTab = TabTypes.ManagerChat;
      },
      onClickSettings: () => {
        state.currentTab = TabTypes.Settings;
      },
    }));
    return (
      <>
        <div className="border-b border-gray-700 flex flex-row justify-between items-center">
          <ul className="flex cursor-pointer">
            <li
              onClick={state.onClickTerminal}
              className={classNames("py-2 px-6 border-b-2", {
                "border-gray-300": state.currentTab === TabTypes.Terminal,
                "border-transparent text-gray-500":
                  state.currentTab !== TabTypes.Terminal,
              })}
            >
              Console
            </li>
            <li
              onClick={state.onClickQuestionarie}
              className={classNames("py-2 px-6 border-b-2", {
                "border-gray-300": state.currentTab === TabTypes.Questionarie,
                "border-transparent text-gray-500":
                  state.currentTab !== TabTypes.Questionarie,
                hidden: !roomService.isManager,
              })}
            >
              Questionarie
            </li>
            <li
              onClick={state.onClickManagerChat}
              className={classNames("py-2 px-6 border-b-2", {
                "border-gray-300": state.currentTab === TabTypes.ManagerChat,
                "border-transparent text-gray-500":
                  state.currentTab !== TabTypes.ManagerChat,
                hidden: !roomService.isManager,
              })}
            >
              Manager's Chat
            </li>
            <li
              onClick={state.onClickSettings}
              className={classNames("py-2 px-6 border-b-2", {
                "border-gray-300": state.currentTab === TabTypes.Settings,
                "border-transparent text-gray-500":
                  state.currentTab !== TabTypes.Settings,
              })}
            >
              Settings
            </li>
          </ul>
          <div>
            <UserPanel />
          </div>
        </div>
        {render(state.currentTab)}
      </>
    );
  }
);