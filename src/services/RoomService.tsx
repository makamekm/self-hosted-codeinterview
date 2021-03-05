import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { makeHotPromise } from "~/utils/hot-promise.util";
import { SocketService } from "./SocketService";
import { EditorService } from "./EditorService";
import { RoomClientDto, RoomDto } from "~/dto/room.dto";
import { QuestionnaireService } from "./QuestionnaireService";

export const RoomService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      editorService: null as ReturnType<typeof EditorService.useState>,
      questionnaireService: null as ReturnType<
        typeof QuestionnaireService.useState
      >,
      connectHotPromise: makeHotPromise(),
      room: null as RoomDto,
      client: null as RoomClientDto,
      id: "",
      managerSecret: "",
      isConnected: false,
      isConnecting: false,
      // clientId: "",
      // isManager: false,
      // clients: [] as {
      //   id: string;
      //   username: string;
      //   isManager: boolean;
      // }[],
      shouldKeepConnection: false,

      async connect() {
        if (!service.id) return;

        service.isConnecting = true;
        service.isConnected = false;

        if (!global.window) return;

        const data = await service.socketService.emit(
          "connect-room",
          service.id,
          service.managerSecret
        );

        service.isConnecting = false;

        if (data.error) {
          console.error(data.error);
          service.isConnected = false;
        } else {
          service.room = data.room;
          service.client = data.client;
          service.questionnaire = data.questionnaire || null;
          service.isConnected = true;
          service.editorService.value = service.room.text;
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
        service.room.clients[client.id] = client;
      },
      onRemoveClient: (client) => {
        delete service.room.clients[client.id];
      },
      onChangeClient: (client) => {
        service.room.clients[client.id] = client;
      },
      // async changeClient(username: string) {
      //   const result = await service.socketService.emit(
      //     "change-client",
      //     service.id,
      //     {
      //       username,
      //     }
      //   );
      //   if (result.error) {
      //     console.error(result.error);
      //   } else {
      //     service.username = result.username;
      //   }
      // },
      execute: async () => {
        return await service.socketService.emit("execute-room", service.id);
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.editorService = React.useContext(EditorService);
    service.questionnaireService = React.useContext(QuestionnaireService);
    service.socketService.useOn("connect", service.onConnect);
    service.socketService.useOn("disconnect", service.onDisconnect);
    service.socketService.useOn("room-add-client", service.onAddClient);
    service.socketService.useOn("room-remove-client", service.onRemoveClient);
    service.socketService.useOn("room-change-client", service.onChangeClient);
  }
);
