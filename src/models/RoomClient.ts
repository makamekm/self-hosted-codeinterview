import { Socket } from "socket.io";
import { RoomClientDto } from "~/dto/room.dto";

export class RoomClient implements RoomClientDto {
  id: string = "";
  socket: Socket;
  username: string;
  isManager: boolean = false;

  constructor(
    id: string,
    socket: Socket,
    username: string,
    isManager: boolean = false
  ) {
    this.id = id;
    this.socket = socket;
    this.username = username;
    this.isManager = isManager;
  }

  serialize(): RoomClientDto {
    return {
      id: this.id,
      isManager: this.isManager,
      username: this.username,
    };
  }
}
