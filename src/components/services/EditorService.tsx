import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import AceEditor from "react-ace";
import { SocketService } from "./SocketService";
import { RoomService } from "./RoomService";

export const EditorService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      roomService: null as ReturnType<typeof RoomService.useState>,
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
      onEditorSelectionData: (clientId, selections) => {
        let session = service.editor.getSession();
        let doc = session.getDocument();

        console.log(clientId, selections);
      },
      onChange: async (text, event) => {
        if (service.suppressEvents) {
          return;
        }
        await service.roomService.emit("editor", event, text);
        await service.roomService.emit("editor-state", text);
      },
      onEditorData: (event) => {
        let session = service.editor.getSession();
        let doc = session.getDocument();
        service.suppressEvents = true;
        doc.applyDelta(event);
        service.suppressEvents = false;
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.roomService = React.useContext(RoomService);
    React.useEffect(() => service.onLoad(), [service, service.onLoad]);
    service.socketService.useOn("editor", service.onEditorData);
    service.socketService.useOn(
      "editor-selection",
      service.onEditorSelectionData
    );
  }
);
