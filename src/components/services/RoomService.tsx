import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { makeHotPromise } from "~/hot-promise.util";
import { SocketService } from "./SocketService";
import { EditorService } from "./EditorService";

export const RoomService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      editorService: null as ReturnType<typeof EditorService.useState>,
      connectHotPromise: makeHotPromise(),
      id: "",
      username: "",
      managerSecret: "",
      isConnected: false,
      isConnecting: false,
      clientId: "",
      isManager: false,
      clients: [] as {
        id: string;
        username: string;
        isManager: boolean;
      }[],
      shouldKeepConnection: false,

      async connect() {
        if (!service.id) return;

        service.isConnecting = true;
        service.isConnected = false;

        if (!global.window) return;

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
          service.clients = room.clients;
          service.isManager = room.isManager;
          service.username = room.username;
          service.isConnected = true;
          service.editorService.value = room.text;
          service.editorService.makeAnchors();
          service.connectHotPromise.resolve();
        }
      },
      emit: async (type: string, ...args): Promise<any> => {
        if (service.isConnected) {
          service.socketService.emit(type, service.id, ...args);
        }
      },
      onConnect: () => {
        if (service.shouldKeepConnection && !service.isConnecting) {
          service.connect();
        }
      },
      onDisconnect: () => {
        service.isConnected = false;
        service.editorService.clearAnchors();
        service.connectHotPromise.reinit();
      },
      onAddClient: (client) => {
        service.clients.push(client);
      },
      onRemoveClient: (client) => {
        service.clients.splice(
          service.clients.findIndex((c) => c.id === client.id),
          1
        );
      },
      onChangeClient: (client) => {
        service.clients.splice(
          service.clients.findIndex((c) => c.id === client.id),
          1,
          client
        );
      },
      async changeClient(username: string) {
        const result = await service.socketService.emit(
          "change-client",
          service.id,
          {
            username,
          }
        );
        if (result.error) {
          console.error(result.error);
        } else {
          service.username = result.username;
        }
      },
      execute: async () => {
        return await service.socketService.emit("execute-room", service.id);
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.editorService = React.useContext(EditorService);
    service.socketService.useOn("connect", service.onConnect);
    service.socketService.useOn("disconnect", service.onDisconnect);
    service.socketService.useOn("room-add-client", service.onAddClient);
    service.socketService.useOn("room-remove-client", service.onRemoveClient);
    service.socketService.useOn("room-change-client", service.onChangeClient);
  }
);
