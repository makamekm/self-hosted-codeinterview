export interface RoomClientDto {
  id: string;
  username: string;
  isManager: boolean;
}

export interface RoomDto {
  id: string;
  text: string;
  managerSecret?: string;
  clients: {
    [id: string]: RoomClientDto;
  };
}
