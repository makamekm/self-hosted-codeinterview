import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { makeHotPromise } from "~/hot-promise.util";
import { SocketService } from "./SocketService";

export const RoomService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      connectHotPromise: makeHotPromise(),
      id: "",
      username: "",
      managerSecret: "",
      isConnected: false,
      isConnecting: false,
      clientId: "",
      isManager: false,
      shouldKeepConnection: false,

      async connect() {
        if (!service.id) return;

        service.isConnecting = true;
        service.isConnected = false;

        if (!global.window) return;

        console.log(service.id, service.username, service.managerSecret);

        const room = await service.socketService.emit(
          "connect-room",
          service.id,
          service.username,
          service.managerSecret
        );

        service.isConnecting = false;

        if (room.error) {
          console.error(room.error);
          service.isConnected = false;
        } else {
          service.clientId = room.id;
          service.isManager = room.isManager;
          service.username = room.username;
          service.isConnected = true;
          service.connectHotPromise.resolve();
        }
      },
      emit: async (type: string, ...args): Promise<any> => {
        if (service.isConnected) {
          service.socketService.emit(type, service.id, ...args);
        }
      },
      onEditorData: (...args) => {
        console.log(...args);
      },
      onConnect: () => {
        if (service.shouldKeepConnection && !service.isConnecting) {
          service.connect();
        }
      },
      onDisconnect: () => {
        service.isConnected = false;
        service.connectHotPromise.reinit();
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.socketService.useOn("editor", service.onEditorData);
    service.socketService.useOn("connect", service.onConnect);
    service.socketService.useOn("disconnect", service.onDisconnect);
  }
);
