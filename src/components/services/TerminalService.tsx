import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { EmulatorState, OutputFactory, Outputs } from "javascript-terminal";
import { SocketService } from "./SocketService";
import { RoomService } from "./RoomService";

export enum OutputType {
  LOG = "log",
  ERROR = "error",
  GREEN = "green",
  NOTIFICATION = "notification",
}

export const createOutputRecord = (body, type: OutputType, data?: any) => {
  return new OutputFactory.OutputRecord({
    type: type,
    content: {
      ...data,
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
      addOutput: (
        text: string,
        type: OutputType = OutputType.LOG,
        data?: any
      ) => {
        const defaultOutputs = service.emulatorState.getOutputs();
        const newOutputs = Outputs.addRecord(
          defaultOutputs,
          // OutputFactory.makeTextOutput(text)
          createOutputRecord(text, type, data)
        );
        const emulatorState = service.emulatorState.setOutputs(newOutputs);
        service.emulatorState = emulatorState;
      },
      onStartCode: (text: string) => {
        service.addOutput(text, OutputType.GREEN);
      },
      onEndCode: (text: string) => {
        service.addOutput(text, OutputType.NOTIFICATION);
      },
      onEndDataCode: (text: string) => {
        service.addOutput(text);
      },
      onEndErrCode: (text: string) => {
        service.addOutput(text, OutputType.ERROR);
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.roomService = React.useContext(RoomService);
    service.socketService.useOn("room-start-code", service.onStartCode);
    service.socketService.useOn("room-end-code", service.onEndCode);
    service.socketService.useOn("room-end-code-data", service.onEndDataCode);
    service.socketService.useOn("room-end-code-err", service.onEndErrCode);
  }
);
