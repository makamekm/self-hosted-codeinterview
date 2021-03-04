import { observer } from "mobx-react";
import React from "react";
import ReactTerminal, {
  ReactThemes,
  ReactOutputRenderers,
} from "react-terminal-component";
import { OutputType, TerminalService } from "./services/TerminalService";

function NewlineText(props) {
  const text = props.text;
  const newText = text.split("\n").map((str, i) => <div key={i}>{str}</div>);

  return newText;
}

const NotificationOutput = ({ content }) => (
  <div className="px-1 py-2 text-gray-100">
    <NewlineText text={content.body} />
  </div>
);

const DataOutput = ({ content }) => (
  <div className="px-1 py-2 text-gray-300">
    <NewlineText text={content.body} />
  </div>
);

const ErrorOutput = ({ content }) => (
  <div className="px-1 py-2 text-red-500">
    <NewlineText text={content.body} />
  </div>
);

const GreenOutput = ({ content }) => (
  <div className="px-1 py-2 text-green-500">
    <NewlineText text={content.body} />
  </div>
);

const Terminal: React.FC = observer(() => {
  const service = React.useContext(TerminalService);

  React.useEffect(() => {
    service.addOutput("The console output will appear here.");
  }, [service]);

  return (
    <>
      <ReactTerminal
        theme={ReactThemes.dye}
        // ref={terminalRef}
        acceptInput={false}
        outputRenderers={{
          ...ReactOutputRenderers,
          [OutputType.NOTIFICATION]: NotificationOutput,
          [OutputType.LOG]: DataOutput,
          [OutputType.ERROR]: ErrorOutput,
          [OutputType.GREEN]: GreenOutput,
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
