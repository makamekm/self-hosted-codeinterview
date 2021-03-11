import classNames from "classnames";
import { Shake } from "reshake";
import { observer, useLocalObservable } from "mobx-react";
import { useContext, useEffect } from "react";
import { RoomService } from "~/services/RoomService";
import { ShareRoomLink } from "./ShareRoomLink";
import { UserPanel } from "./UserPanel";

export enum TabTypes {
  Terminal,
  Questionarie,
  ManagerChat,
  Settings,
  Room,
}

export const Tabs = observer(
  ({ render }: { render: (type: TabTypes) => JSX.Element }) => {
    const roomService = useContext(RoomService);
    const state = useLocalObservable(() => ({
      isShakingShare: false,
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
      onClickRoom: () => {
        state.currentTab = TabTypes.Room;
      },
    }));

    useEffect(() => {
      if (global.window) {
        let timeout = setTimeout(() => {
          if (Object.keys(roomService.room?.clients || {}).length < 2) {
            state.isShakingShare = true;
            timeout = setTimeout(() => (state.isShakingShare = false), 1500);
          }
        }, 1000);
        return () => clearTimeout(timeout);
      }
    }, [roomService, state]);

    return (
      <>
        <div className="border-b border-gray-700 flex flex-row justify-between items-center text-xs">
          <ul className="flex flex-row flex-wrap cursor-pointer">
            <li
              onClick={state.onClickTerminal}
              className={classNames("py-2 px-4 border-b-2", {
                "border-gray-300": state.currentTab === TabTypes.Terminal,
                "border-transparent text-gray-500":
                  state.currentTab !== TabTypes.Terminal,
              })}
            >
              Console
            </li>
            <li
              onClick={state.onClickQuestionarie}
              className={classNames("py-2 px-4 border-b-2", {
                "border-gray-300": state.currentTab === TabTypes.Questionarie,
                "border-transparent text-gray-500":
                  state.currentTab !== TabTypes.Questionarie,
                hidden: !roomService.client?.isManager,
              })}
            >
              Questionarie
            </li>
            <li
              onClick={state.onClickRoom}
              className={classNames("py-2 px-4 border-b-2", {
                "border-gray-300": state.currentTab === TabTypes.Room,
                "border-transparent text-gray-500":
                  state.currentTab !== TabTypes.Room,
              })}
            >
              Room Info
            </li>
            {roomService.client?.isManager && (
              <div className="flex justify-center items-center px-2">
                <Shake
                  dur={600}
                  r={10}
                  int={15}
                  fixed
                  active={state.isShakingShare}
                >
                  <ShareRoomLink />
                </Shake>
              </div>
            )}
            {/* <li
              onClick={state.onClickManagerChat}
              className={classNames("py-2 px-4 border-b-2", {
                "border-gray-300": state.currentTab === TabTypes.ManagerChat,
                "border-transparent text-gray-500":
                  state.currentTab !== TabTypes.ManagerChat,
                hidden: !roomService.client?.isManager,
              })}
            >
              Manager's Chat
            </li> */}
            {/* <li
              onClick={state.onClickSettings}
              className={classNames("py-2 px-4 border-b-2", {
                "border-gray-300": state.currentTab === TabTypes.Settings,
                "border-transparent text-gray-500":
                  state.currentTab !== TabTypes.Settings,
              })}
            >
              Settings
            </li> */}
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
