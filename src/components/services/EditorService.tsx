import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { FirstService } from "./FirstService";

export const EditorService = createService(
  () => {
    const service = useLocalObservable(() => ({
      firstService: null as any, // TODO: remove
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
        }
      },
    }));
    return service;
  },
  (service) => {
    service.firstService = React.useContext(FirstService);
    React.useEffect(() => service.onLoad(), [service, service.onLoad]);
  }
);
