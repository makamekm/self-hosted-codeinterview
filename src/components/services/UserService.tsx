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
        email: string;
        firstName: string;
        lastName: string;
        picture: string;
        accessToken: string;
      },
      isCreating: false,
      loginGoogle() {
        service.router.push({
          pathname: "/api/google",
        });
      },
      logout() {
        Cookies.remove("session", { path: "" });
        Cookies.remove("user_info", { path: "" });
        window.location.reload();
      },
      readUser() {
        const user = Cookies.get("user_info");
        service.user = user;
      },
    }));
    return service;
  },
  (service) => {
    service.socketService = React.useContext(SocketService);
    service.router = useRouter();
    React.useEffect(() => {
      service.readUser();
    }, [service]);
  }
);
