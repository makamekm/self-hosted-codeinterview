import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { SocketService } from "./SocketService";

// import * as CodeMirrorCollabExt from "@convergencelabs/codemirror-collab-ext";

export const EditorService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      editor: null as any,
      editorRef: null as any,
      value: "<h1>I ♥ react-codemirror2</h1>",
      onLoad: () => {
        if (global.window) {
          setTimeout(() => service.onInit(), 100);
        }
      },
      onInit: () => {
        if (service.editor) {
          console.log(service.editor);
          console.log(service.editorRef);

          // const remoteSelectionManager = new CodeMirrorCollabExt.RemoteSelectionManager(
          //   { editor: service.editor }
          // );

          // const selection = remoteSelectionManager.addSelection("jDoe", "blue");

          // // Set the range of the selection using zero-based offsets.
          // selection.setIndices(5, 10);

          // // Hide the selection
          // // selection.hide();

          // // Show the selection
          // selection.show();

          // service.socketService
        }
      },
      onEditorData: (...args) => {
        // console.log(...args);
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    React.useEffect(() => service.onLoad(), [service, service.onLoad]);
    service.socketService.useOn("editor", service.onEditorData);
  }
);
