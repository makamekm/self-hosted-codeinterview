import { observer } from "mobx-react";
import classNames from "classnames";
import React, { useContext } from "react";
import { EditorService } from "~/services/EditorService";
import useResizeObserver from "use-resize-observer";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-typescript";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-dracula";
import useKeyboardShortcut from "use-keyboard-shortcut";
import Tooltip from "@reach/tooltip";
import "@reach/tooltip/styles.css";
import { Listbox, ListboxOption } from "@reach/listbox";
import "@reach/listbox/styles.css";

import { LanguageName, LanguageType } from "~/dto/language.dto";
import { RoomService } from "~/services/RoomService";

const Editor: React.FC = observer(() => {
  const codemirrorRef = React.useRef<AceEditor>();
  const service = useContext(EditorService);
  const roomService = useContext(RoomService);

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
    updateEditorSize(height);
  }, [updateEditorSize, height]);

  useKeyboardShortcut(["Control", "S"], service.onExecute, {
    overrideSystem: true,
  });

  if (service.editor !== codemirrorRef.current?.editor) {
    service.editor = codemirrorRef.current?.editor;
  }

  if (!roomService.room) {
    return <></>;
  }

  return (
    <div
      ref={ref}
      className="relative min-w-full max-w-full min-h-full max-h-full"
    >
      <AceEditor
        ref={codemirrorRef}
        mode={LanguageType[roomService.room.language]}
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
      <div className="absolute bottom-4 left-4 z-10 space-x-2 flex flex-row">
        <Tooltip label="Control + S">
          <button
            disabled={service.isExecuting}
            onClick={service.onExecute}
            className={classNames(
              {
                "pointer-events-none opacity-40": service.isExecuting,
              },
              "cursor-pointer outline-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 bg-blue-500 rounded-lg font-medium text-white text-xs text-center px-4 py-2 transition duration-300 ease-in-out hover:bg-blue-600"
            )}
          >
            RUN
          </button>
        </Tooltip>
        <Listbox
          className="w-40"
          value={roomService.room.language}
          onChange={roomService.changeLanguage}
        >
          {Object.keys(LanguageName).map((language) => (
            <ListboxOption key={language} value={language}>
              {LanguageName[language]}
            </ListboxOption>
          ))}
        </Listbox>
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
