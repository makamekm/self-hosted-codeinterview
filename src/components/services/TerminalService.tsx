import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { EmulatorState, OutputFactory, Outputs } from "javascript-terminal";
import { SocketService } from "./SocketService";
import { RoomService } from "./RoomService";

export const PAPER_TYPE = "paper";

export const createDataRecord = (body) => {
  return new OutputFactory.OutputRecord({
    type: PAPER_TYPE,
    content: {
      body,
    },
  });
};

export const TerminalService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socketService: null as ReturnType<typeof SocketService.useState>,
      roomService: null as ReturnType<typeof RoomService.useState>,
      emulatorState: EmulatorState.createEmpty(),
      inputStr: "",
      addOutput: (text: string) => {
        const defaultOutputs = service.emulatorState.getOutputs();
        const newOutputs = Outputs.addRecord(
          defaultOutputs,
          // OutputFactory.makeTextOutput(text)
          createDataRecord(text)
        );
        const emulatorState = service.emulatorState.setOutputs(newOutputs);
        service.emulatorState = emulatorState;
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.roomService = React.useContext(RoomService);
  }
);
