import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { SocketService } from "./SocketService";

export const MakeRoomService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      isCreating: false,
      async create(): Promise<{
        id: string;
        managerSecret: string;
      }> {
        service.isCreating = true;

        const room = await service.socketService.emit("create-room");

        service.isCreating = true;

        if (room.error) {
          console.error(room.error);
        } else {
          return {
            id: room.id,
            managerSecret: room.managerSecret,
          };
        }
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
  }
);
