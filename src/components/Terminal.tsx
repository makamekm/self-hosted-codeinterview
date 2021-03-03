import { observer } from "mobx-react";
import React from "react";
import ReactTerminal, {
  ReactThemes,
  ReactOutputRenderers,
} from "react-terminal-component";
import { PAPER_TYPE, TerminalService } from "./services/TerminalService";

function NewlineText(props) {
  const text = props.text;
  const newText = text.split("\n").map((str) => <div>{str}</div>);

  return newText;
}

const DataOutput = ({ content }) => (
  <div className="px-1 py-2 text-gray-300">
    <NewlineText text={content.body} />
  </div>
);

const Terminal: React.FC = observer(() => {
  const service = React.useContext(TerminalService);

  React.useEffect(() => {
    service.addOutput("test test");
  }, [service]);

  return (
    <>
      <ReactTerminal
        theme={ReactThemes.dye}
        // ref={terminalRef}
        acceptInput={false}
        outputRenderers={{
          ...ReactOutputRenderers,
          [PAPER_TYPE]: DataOutput,
        }}
        emulatorState={service.emulatorState}
        inputStr={service.inputStr}
        onInputChange={(inputStr) => (service.inputStr = inputStr)}
        onStateChange={(emulatorState) =>
          (service.emulatorState = emulatorState)
        }
      />
      <style jsx global>{`
        .terminalContainer {
          flex: 1;
          height: 100%;
          width: 100%;
        }
      `}</style>
    </>
  );
});

export default Terminal;
