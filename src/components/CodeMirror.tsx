import { observer } from "mobx-react";
import React, { useContext } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { EditorService } from "./services/EditorService";
import useResizeObserver from "use-resize-observer";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

require("codemirror/mode/xml/xml");
require("codemirror/mode/javascript/javascript");

const Editor: React.FC = observer(() => {
  const service = useContext(EditorService);
  const updateEditorSize = React.useCallback(
    (height) => {
      if (service.editor && height !== 1) {
        service.editor.display.wrapper.style.height = height + "px";
      }
    },
    [service.editor]
  );
  const { ref, height = 1 } = useResizeObserver<HTMLDivElement>({
    onResize: ({ height }) => {
      updateEditorSize(height);
    },
  });
  const codemirrorRef = React.useRef();
  React.useEffect(() => {
    // service.editorRef = codemirrorRef.current;
  }, [service, codemirrorRef]);
  React.useEffect(() => {
    updateEditorSize(height);
  }, [updateEditorSize, height]);
  return (
    <div ref={ref} className="min-w-full max-w-full min-h-full max-h-full">
      <CodeMirror
        ref={codemirrorRef}
        className="min-w-full max-w-full min-h-full max-h-full"
        value={service.value}
        options={{
          mode: "javascript",
          theme: "material",
          lineNumbers: true,
        }}
        editorDidMount={(editor) => {
          service.editor = editor;
        }}
        onChange={(editor, data, value) => {
          service.value = value;
        }}
      />
      <style jsx>{`
        :global(.react-codemirror2) {
          height: calc(100% - 32px);
          overflow: auto;
        }
        :global(.CodeMirror-hscrollbar) {
          left: 0px !important;
        }
      `}</style>
    </div>
  );
});

export default Editor;
