import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { SocketService } from "./SocketService";
import { NextRouter, useRouter } from "next/router";
import { RoomMessage } from "~/dto/room-message.dto";

export const CreateRoomService = createService(
  () => {
    const service = useLocalObservable(() => ({
      router: null as NextRouter,
      socketService: null as ReturnType<typeof SocketService.useState>,
      isCreating: false,
      async create(): Promise<{
        id: string;
        managerSecret: string;
      }> {
        service.isCreating = true;

        const room = await service.socketService.emit(RoomMessage.CreateRoom);

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
    service.router = useRouter();
  }
);
