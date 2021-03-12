import React from "react";
import { createService } from "react-service-provider";
import { useLocalObservable } from "mobx-react";
import { debounce } from "ts-debounce";
import { useRouter } from "next/router";

export const LoadingService = createService(
  () => {
    const service = useLocalObservable(() => ({
      get isLoading() {
        return service._isLoading || service.blockers > 0;
      },
      _isLoading: false,
      blockers: 0,
      setLoading(value: boolean) {
        service._isLoading = value;
      },
    }));
    return service;
  },
  (service) => {
    const router = useRouter();
    React.useEffect(() => {
      const debounceSetLoadingShort = debounce(service.setLoading, 100);
      const debounceSetLoadingLong = debounce(service.setLoading, 400);

      const handleStart = () => {
        (debounceSetLoadingLong as any).cancel();
        debounceSetLoadingShort(true);
      };
      const handleComplete = () => {
        (debounceSetLoadingShort as any).cancel();
        debounceSetLoadingLong(false);
      };

      router.events.on("routeChangeStart", handleStart);
      router.events.on("routeChangeComplete", handleComplete);
      router.events.on("routeChangeError", handleComplete);

      return () => {
        router.events.off("routeChangeStart", handleStart);
        router.events.off("routeChangeComplete", handleComplete);
        router.events.off("routeChangeError", handleComplete);
      };
    }, [router, service]);
  }
);
