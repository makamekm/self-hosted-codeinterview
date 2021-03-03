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
} from "../EditorSelection";
import { TerminalService } from "./TerminalService";

export const EditorService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      roomService: null as ReturnType<typeof RoomService.useState>,
      terminalService: null as ReturnType<typeof TerminalService.useState>,
      editor: null as AceEditor["editor"],
      value: "<h1>I ♥ react-codemirror2</h1>",
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
        service.roomService.emit("editor-selection", selections);

        // const doc = service.editor.getSession().getDocument();
        // const range = service.editor.getSelectionRange();
        // const stindex = doc.positionToIndex(range.start);
        // const edindex = doc.positionToIndex(range.end);
        // const anchorPos = service.editor.selection.getAnchor();
        // const prefixed =
        //   anchorPos.row !== range.start.row ||
        //   anchorPos.column !== range.start.column;

        // service.roomService.emit("editor-selection", {
        //   stindex,
        //   edindex,
        //   prefixed,
        // });
        // console.log({ stindex, edindex, prefixed });
      },
      onEditorSelectionData: (clientId, selections: AceAnchor) => {
        if (!service.editor) return;
        console.log(clientId, selections);
        setAnchorSelectionClient(service.editor, clientId, selections);
      },
      onChange: async (text, event) => {
        if (service.suppressEvents) {
          return;
        }
        await service.roomService.emit("editor", event);
        await service.roomService.emit("editor-state", text);
      },
      onEditorData: (event) => {
        let session = service.editor.getSession();
        let doc = session.getDocument();
        service.suppressEvents = true;
        doc.applyDelta(event);
        service.suppressEvents = false;
      },
      clearAnchors: () => {
        clearAllSelectionClient(service.editor);
      },
      makeAnchors: () => {
        clearAllSelectionClient(service.editor);
        service.roomService.clients.forEach((client) => {
          addSelectionClient(client.id);
        });
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
          const { data, err, code } = await service.roomService.execute();
          service.terminalService.addOutput(
            `Finished running with status code: ${code}\nOutput:`
          );
          if (data) {
            service.terminalService.addOutput(data);
          } else if (data) {
            service.terminalService.addOutput(err);
          }
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
    service.socketService.useOn("editor", service.onEditorData);
    service.socketService.useOn(
      "editor-selection",
      service.onEditorSelectionData
    );
    service.socketService.useOn("room-add-client", service.onAddClient);
    service.socketService.useOn("room-remove-client", service.onRemoveClient);
  }
);
