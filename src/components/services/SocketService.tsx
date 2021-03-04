import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import io from "socket.io-client";
import { SOCKET_SERVER } from "@env/config";
import { makeHotPromise } from "~/utils/hot-promise.util";
import Cookies from "js-cookie";

export const SocketService = createService(
  () => {
    const service = useLocalObservable(() => ({
      socket: null as SocketIOClient.Socket,
      socketManager: null as SocketIOClient.Manager,
      isConnected: false,
      onLoad: () => {
        if (global.window) {
          service.connect();
        }
      },
      initHotPromise: makeHotPromise(),
      async connect() {
        if (!global.window) return;
        if (service.socket != null && !service.socket.disconnected) {
          service.socket.disconnect();
          service.socket = null;
        }
        service.socket = io(SOCKET_SERVER, {
          // extraHeaders: {
          //   Authorization: "Bearer authorization_token_here"
          // }
          transportOptions: {
            polling: {
              extraHeaders: {
                Authorization: Cookies.get("session"),
                // Session: document.cookie,
              },
            },
          },
        });
        service.socket.on("connect", () => {
          service.isConnected = true;
          // await service.initPromise;
          service.initHotPromise.resolve();
        });
        service.socket.on("disconnect", () => {
          service.isConnected = false;
          service.initHotPromise.reinit();
        });
      },
      emit: async (type: string, ...args): Promise<any> => {
        await service.initHotPromise.promise;
        if (service.socket && !service.socket.disconnected) {
          return new Promise((r) => {
            service.socket.emit(type, ...args, r);
          });
        }
      },
      useOn: (type: string, onMessage: (...args: any) => void) => {
        React.useEffect(() => {
          if (!global.window) return;
          const fn = (...args) => {
            onMessage(...args);
          };
          let emitter: SocketIOClient.Emitter;
          let hasStopped = false;
          (async function () {
            await service.initHotPromise.promise;
            if (!hasStopped) {
              emitter = service.socket.on(type, fn);
            }
          })();
          return () => {
            hasStopped = true;
            if (emitter) {
              emitter.removeEventListener(type, fn);
            }
          };
        }, [type, onMessage]);
      },
    }));
    return service;
  },
  (service) => {
    React.useEffect(() => service.onLoad(), [service, service.onLoad]);
  }
);
