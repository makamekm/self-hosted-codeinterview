import { observer } from "mobx-react";
import classNames from "classnames";
import React, { useContext } from "react";
import { EditorService } from "~/services/EditorService";
import useResizeObserver from "use-resize-observer";
import AceEditor from "react-ace";
import Tooltip from "@reach/tooltip";
import useKeyboardShortcut from "use-keyboard-shortcut";
import "@reach/tooltip/styles.css";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-dracula";

const Editor: React.FC = observer(() => {
  const codemirrorRef = React.useRef<AceEditor>();
  const service = useContext(EditorService);

  const [editorHeight, setEditorHeight] = React.useState(1);
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

  useKeyboardShortcut(["Control", "S"], service.onExecute, {
    overrideSystem: true,
  });
  useKeyboardShortcut(["Control", "T"], service.onExecute, {
    overrideSystem: true,
  });

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
      <div className="absolute bottom-4 left-4 z-10 space-x-2">
        <Tooltip label="Control + S">
          <button
            disabled={service.isExecuting}
            onClick={service.onExecute}
            className={classNames(
              {
                "pointer-events-none opacity-40": service.isExecuting,
              },
              "outline-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 bg-blue-500 rounded-lg font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-blue-600"
            )}
          >
            RUN
          </button>
        </Tooltip>
        <Tooltip label="Control + T">
          <button
            disabled={service.isExecuting}
            onClick={service.onExecute}
            className={classNames(
              {
                "pointer-events-none opacity-40": service.isExecuting,
              },
              "outline-none focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-opacity-50 bg-indigo-500 rounded-lg font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-indigo-600"
            )}
          >
            TEST
          </button>
        </Tooltip>
      </div>
      <style jsx global>{`
        #editor {
          width: 100%;
          height: 100%;
        }

        .ace_marker-layer div {
          border-radius: 0;
          position: absolute;
          opacity: 0.5;
        }

        .ace_marker-layer .cursor {
          animation: cursorThrob 1s infinite;
        }
      `}</style>
    </div>
  );
});

export default Editor;
