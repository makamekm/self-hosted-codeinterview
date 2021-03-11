import React from "react";
import { createService } from "react-service-provider";
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

export const EditorService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      roomService: null as ReturnType<typeof RoomService.useState>,
      terminalService: null as ReturnType<typeof TerminalService.useState>,
      editor: null as AceEditor["editor"],
      value: "",
      suppressEvents: false,
      onLoad: () => {
        if (global.window) {
          setTimeout(() => service.onInit(), 100);
        }
      },
      onInit: () => {
        if (service.editor) {
          // TODO: remove
        }
      },
      onSelectionChange: (selections) => {
        service.roomService.emit(RoomMessage.EditorSelection, selections);

        // const doc = service.editor.getSession().getDocument();
        // const range = service.editor.getSelectionRange();
        // const stindex = doc.positionToIndex(range.start);
        // const edindex = doc.positionToIndex(range.end);
        // const anchorPos = service.editor.selection.getAnchor();
        // const prefixed =
        //   anchorPos.row !== range.start.row ||
        //   anchorPos.column !== range.start.column;

        // service.roomService.emit(RoomMessage.EditorSelection, {
        //   stindex,
        //   edindex,
        //   prefixed,
        // });
        // console.log({ stindex, edindex, prefixed });
      },
      async onApplyCode(value: string, language: Language) {
        service.value = value;
        await service.roomService.emit(RoomMessage.Editor, {
          type: "apply",
          value,
        });
        await service.roomService.emit(RoomMessage.EditorState, value);
        console.log(language);

        service.roomService.changeLanguage(language);
      },
      onEditorSelectionData: (clientId, selections: AceAnchor) => {
        if (!service.editor) return;
        setAnchorSelectionClient(service.editor, clientId, selections);
      },
      onChange: async (text, event) => {
        if (service.suppressEvents) {
          return;
        }
        await service.roomService.emit(RoomMessage.Editor, event);
        await service.roomService.emit(RoomMessage.EditorState, text);
      },
      onEditorData: (event) => {
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
      clearAnchors: () => {
        clearAllSelectionClient(service.editor);
      },
      makeAnchors: () => {
        if (service.roomService.room) {
          clearAllSelectionClient(service.editor);
          Object.keys(service.roomService.room.clients).forEach((key) => {
            addSelectionClient(key);
          });
        }
      },
      onAddClient: (client) => {
        addSelectionClient(client.id);
      },
      onRemoveClient: (client) => {
        removeIdSelectionClient(service.editor, client.id);
      },
      isExecuting: false,
      onExecute: async () => {
        if (service.isExecuting) {
          return;
        }
        service.isExecuting = true;
        try {
          service.terminalService.addOutput("Executing...");
          await service.roomService.execute();
          // service.terminalService.addOutput(
          //   `Finished running with status code: ${code}\nOutput:`
          // );
          // if (data) {
          //   service.terminalService.addOutput(data);
          // } else if (data) {
          //   service.terminalService.addOutput(err);
          // }
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
    React.useEffect(() => service.onLoad(), [service, service.onLoad]);
    service.socketService.useOn(RoomMessage.Editor, service.onEditorData);
    service.socketService.useOn(
      RoomMessage.EditorSelection,
      service.onEditorSelectionData
    );
    service.socketService.useOn(RoomMessage.RoomAddClient, service.onAddClient);
    service.socketService.useOn(
      RoomMessage.RoomRemoveClient,
      service.onRemoveClient
    );
  }
);
