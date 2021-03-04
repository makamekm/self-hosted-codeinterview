import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { SocketService } from "./SocketService";
import { NextRouter, useRouter } from "next/router";
import Cookies from "js-cookie";

export const UserService = createService(
  () => {
    const service = useLocalObservable(() => ({
      router: null as NextRouter,
      socketService: null as ReturnType<typeof SocketService.useState>,
      user: null as {
        id: string;
        username: string;
        email: string;
        firstName: string;
        lastName: string;
        picture: string;
        accessToken: string;
      },
      isCreating: false,
      loginGoogle() {
        Cookies.set("redirect_to", window.location.pathname, {
          expires: 1,
          path: "/",
        });
        window.location.href = "/api/google";
        // service.router.push({
        //   pathname: "/api/google?from=" + window.location.pathname,
        // });
      },
      logout() {
        Cookies.remove("session");
        Cookies.remove("user_info");
        window.location.reload();
      },
      readUser() {
        const user = Cookies.get("user_info");
        service.user = user ? JSON.parse(user) : null;
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.router = useRouter();
    React.useEffect(() => {
      if (global.window) {
        service.readUser();
      }
    }, [service]);
  }
);
