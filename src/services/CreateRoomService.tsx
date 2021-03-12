import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { SocketService } from "./SocketService";
import { NextRouter, useRouter } from "next/router";
import { RoomMessage } from "~/dto/room-message.dto";
import { LoadingService } from "./LoadingService";

export const CreateRoomService = createService(
  () => {
    const service = useLocalObservable(() => ({
      router: null as NextRouter,
      socketService: null as ReturnType<typeof SocketService.useState>,
      loadingService: null as ReturnType<typeof LoadingService.useState>,
      isCreating: false,
      async create(): Promise<{
        id: string;
        managerSecret: string;
      }> {
        service.loadingService.blockers++;
        service.isCreating = true;

        const room = await service.socketService.emit(RoomMessage.CreateRoom);

        service.isCreating = false;
        setTimeout(() => {
          service.loadingService.blockers--;
        }, 100);

        if (room.error) {
          console.error(room.error);
        } else {
          return {
            id: room.id,
            managerSecret: room.managerSecret,
          };
        }
      },
      openRoom(id: string, managerSecret: string) {
        service.router.push({
          pathname: "/room/[id]/[secret]",
          query: { id, secret: managerSecret },
        });
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.loadingService = React.useContext(LoadingService);
    service.router = useRouter();
  }
);
