import { SocketService } from "~/services/SocketService";
import { EditorService } from "~/services/EditorService";
import { RoomService } from "~/services/RoomService";
import { CreateRoomService } from "~/services/CreateRoomService";
import { TerminalService } from "~/services/TerminalService";
import { UserService } from "~/services/UserService";
import { QuestionnaireService } from "~/services/QuestionnaireService";

export const Services = [
  SocketService,
  EditorService,
  RoomService,
  CreateRoomService,
  TerminalService,
  UserService,
  QuestionnaireService,
];
