import { observer } from "mobx-react";
import React, { useContext } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { EditorService } from "./services/EditorService";
import useResizeObserver from "use-resize-observer";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-dracula";

const Editor: React.FC = observer(() => {
  const codemirrorRef = React.useRef<AceEditor>();
  const [editorHeight, setEditorHeight] = React.useState(1);
  const service = useContext(EditorService);
  const updateEditorSize = React.useCallback((height) => {
    if (height !== 1) {
      setEditorHeight(height);
    }
  }, []);
  const { ref, height = 1 } = useResizeObserver<HTMLDivElement>({
    onResize: ({ height }) => {
      updateEditorSize(height);
    },
  });
  React.useEffect(() => {
    service.editor = codemirrorRef.current?.editor;
  }, [service, codemirrorRef]);
  React.useEffect(() => {
    updateEditorSize(height);
  }, [updateEditorSize, height]);

  return (
    <div
      ref={ref}
      className="relative min-w-full max-w-full min-h-full max-h-full"
    >
      <AceEditor
        ref={codemirrorRef}
        mode="javascript"
        theme="dracula"
        // maxLines={Infinity}
        height={editorHeight + "px"}
        className="min-w-full max-w-full min-h-full max-h-full"
        // value={service.value}
        value={service.value}
        onChange={(value, event) => {
          service.value = value;
          service.onChange(value, event);
        }}
        onSelectionChange={(selections) => {
          service.onSelectionChange(selections);
        }}
        // defaultLanguage="javascript"
        // beforeMount={handleEditorWillMount}
        // onMount={handleEditorDidMount}
        // editorDidMount={(editor) => {
        //   service.editor = editor;
        // }}
        // onChange={(editor, data, value) => {
        //   service.value = value;
        // }}
      />
      <style jsx>{`
        :global(#editor) {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
});

export default Editor;
