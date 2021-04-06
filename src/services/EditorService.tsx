import React from "react";
import { createService, ServiceContextHook } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import AceEditor from "react-ace";
import { SocketService } from "./SocketService";
import { RoomService } from "./RoomService";
import {
  AceAnchor,
  addSelectionClient,
  clearAllSelectionClient,
  removeIdSelectionClient,
  setAnchorSelectionClient,
} from "../components/EditorSelection";
import { TerminalService } from "./TerminalService";
import { Language } from "~/dto/language.dto";
import { RoomMessage } from "~/dto/room-message.dto";

export const EditorService: ServiceContextHook<any> = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      roomService: null as ReturnType<typeof RoomService.useState>,
      terminalService: null as ReturnType<typeof TerminalService.useState>,
      editor: null as AceEditor["editor"],
      value: "",
      suppressEvents: false,
      onSelectionChange(selections) {
        service.roomService.emit(RoomMessage.EditorSelection, selections);
      },
      async onApplyCode(value: string, language: Language) {
        service.value = value;
        await service.roomService.emit(RoomMessage.Editor, {
          type: "apply",
          value,
        });
        await service.roomService.emit(RoomMessage.EditorState, value);
        service.roomService.changeLanguage(language);
      },
      onEditorSelectionData(clientId, selections: AceAnchor) {
        if (!service.editor) return;
        setAnchorSelectionClient(service.editor, clientId, selections);
      },
      async onChange(text, event) {
        if (service.suppressEvents) {
          return;
        }
        await service.roomService.emit(RoomMessage.Editor, event);
        await service.roomService.emit(RoomMessage.EditorState, text);
      },
      onEditorData(event) {
        if (event.type === "apply") {
          service.value = event.value;
        } else {
          let session = service.editor.getSession();
          let doc = session.getDocument();
          service.suppressEvents = true;
          doc.applyDelta(event);
          service.suppressEvents = false;
        }
      },
      clearAnchors() {
        clearAllSelectionClient(service.editor);
      },
      makeAnchors() {
        if (service.roomService.room) {
          clearAllSelectionClient(service.editor);
          Object.keys(service.roomService.room.clients).forEach((key) => {
            addSelectionClient(key);
          });
        }
      },
      onAddClient(client) {
        addSelectionClient(client.id);
      },
      onUpdateClients(clients) {
        service.roomService.room.clients = clients;
      },
      onRemoveClient(client) {
        removeIdSelectionClient(service.editor, client.id);
      },
      isExecuting: false,
      async onExecute() {
        if (service.isExecuting) {
          return;
        }
        service.isExecuting = true;
        try {
          service.terminalService.addOutput("Executing...");
          await service.roomService.execute();
        } catch (error) {
          console.error(error);
        } finally {
          service.isExecuting = false;
        }
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.roomService = React.useContext(RoomService);
    service.terminalService = React.useContext(TerminalService);
    service.socketService.useOn(RoomMessage.Editor, service.onEditorData);
    service.socketService.useOn(
      RoomMessage.EditorSelection,
      service.onEditorSelectionData
    );
    service.socketService.useOn(RoomMessage.RoomAddClient, service.onAddClient);
    service.socketService.useOn(RoomMessage.RoomUpdateClients, service.onUpdateClients);
    service.socketService.useOn(
      RoomMessage.RoomRemoveClient,
      service.onRemoveClient
    );
  }
);
