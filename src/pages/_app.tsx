import { observer, enableStaticRendering } from "mobx-react";
import { ToastProvider } from "react-toast-notifications";
import React from "react";
import { useServiceProvider } from "react-service-provider";
import "tailwindcss/tailwind.css";
import "~/components/index.css";
import "~/components/bg.scss";
import { Services } from "~/components/Services";
import { Header } from "~/components/Header";
import { LoadingScreen } from "~/components/LoadingScreen";

if (typeof window === "undefined") {
  enableStaticRendering(true);
}

const App = observer(({ Component, pageProps }) => {
  const [ServiceProvider, ServiceProviderHook] = useServiceProvider(
    ...Services
  );
  return (
    <ServiceProvider>
      <ServiceProviderHook>
        <ToastProvider
          autoDismiss
          autoDismissTimeout={4000}
          placement="bottom-right"
        >
          <Header />
          <Component {...pageProps} />
          <LoadingScreen />
        </ToastProvider>
      </ServiceProviderHook>
    </ServiceProvider>
  );
});

export default App;
