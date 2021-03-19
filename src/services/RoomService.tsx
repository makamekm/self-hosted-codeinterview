import React from "react";
import { createService, ServiceContextHook } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { makeHotPromise } from "~/utils/hot-promise.util";
import { SocketService } from "./SocketService";
import { EditorService } from "./EditorService";
import { RoomClientDto, RoomDto } from "~/dto/room.dto";
import { QuestionnaireService } from "./QuestionnaireService";
import { toJS } from "mobx";
import { RoomMessage } from "~/dto/room-message.dto";
import { LoadingService } from "./LoadingService";

export const RoomService: ServiceContextHook<any> = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      loadingService: null as ReturnType<typeof LoadingService.useState>,
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
        // service.loadingService.blockers++;

        if (!global.window) return;

        let data = await service.socketService.emit(
          RoomMessage.ConnectRoom,
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
          service.questionnaireService.questionnaire =
            data.questionnaire || null;
          service.questionnaireService.questionnairePrev = toJS(
            data.questionnaire
          );
          service.editorService.value = service.room.text;
          service.editorService.makeAnchors();
          service.isConnected = true;
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
      onChangeLanguage: (language) => {
        service.room.language = language;
      },
      changeLanguage: (language) => {
        service.room.language = language;
        service.emit(RoomMessage.RoomChangeLanguage, language);
      },
      // async changeClient(username: string) {
      //   const result = await service.socketService.emit(
      //     RoomMessage.ChangeClient,
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
        return await service.socketService.emit(
          RoomMessage.ExecuteRoom,
          service.id
        );
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.editorService = React.useContext(EditorService);
    service.loadingService = React.useContext(LoadingService);
    service.questionnaireService = React.useContext(QuestionnaireService);
    service.socketService.useOn("connect", service.onConnect);
    service.socketService.useOn("disconnect", service.onDisconnect);
    service.socketService.useOn(RoomMessage.RoomAddClient, service.onAddClient);
    service.socketService.useOn(
      RoomMessage.RoomRemoveClient,
      service.onRemoveClient
    );
    service.socketService.useOn(
      RoomMessage.RoomChangeClient,
      service.onChangeClient
    );
    service.socketService.useOn(
      RoomMessage.RoomChangeLanguage,
      service.onChangeLanguage
    );
  }
);
