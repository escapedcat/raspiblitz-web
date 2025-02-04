import { useContext, useEffect } from "react";
import { AppStatus } from "../models/app-status";
import { App } from "../models/app.model";
import { BtcInfo } from "../models/btc-info";
import { LnStatus } from "../models/ln-status";
import { SystemInfo } from "../models/system-info";
import { WalletBalance } from "../models/wallet-balance";
import { SSEContext, SSE_URL } from "../store/sse-context";

function useSSE() {
  const sseCtx = useContext(SSEContext);
  const { evtSource, setEvtSource } = sseCtx;

  useEffect(() => {
    if (!evtSource) {
      setEvtSource(new EventSource(SSE_URL));
    }

    const setApps = (event: Event) => {
      sseCtx.setAvailableApps((prev: App[]) => {
        const apps = JSON.parse((event as MessageEvent<string>).data);
        if (prev.length === 0) {
          return apps;
        } else {
          return prev.map(
            (old: App) =>
              apps.find((newApp: App) => old.id === newApp.id) || old
          );
        }
      });
    };

    const setAppStatus = (event: Event) => {
      sseCtx.setAppStatus((prev: AppStatus[]) => {
        const status = JSON.parse((event as MessageEvent<string>).data);

        if (prev.length === 0) {
          return status;
        } else {
          return prev.map(
            (old: AppStatus) =>
              status.find((newApp: AppStatus) => old.id === newApp.id) || old
          );
        }
      });
    };

    const setTx = (event: Event) => {
      const t = JSON.parse((event as MessageEvent<string>).data);
      sseCtx.setTransactions((prev) => {
        // add the newest transaction to the beginning
        const current = [t, ...prev];
        return current;
      });
    };

    const setInstall = (event: Event) => {
      sseCtx.setIsInstalling(
        JSON.parse((event as MessageEvent<string>).data).id
      );
    };

    const setSystemInfo = (event: Event) => {
      sseCtx.setSystemInfo((prev: SystemInfo) => {
        const message = JSON.parse((event as MessageEvent<string>).data);

        return {
          ...prev,
          ...message,
        };
      });
    };

    const setBtcInfo = (event: Event) => {
      sseCtx.setBtcInfo((prev: BtcInfo) => {
        const message = JSON.parse((event as MessageEvent<string>).data);

        return {
          ...prev,
          ...message,
        };
      });
    };

    const setLnStatus = (event: Event) => {
      sseCtx.setLnStatus((prev: LnStatus) => {
        const message = JSON.parse((event as MessageEvent<string>).data);

        return {
          ...prev,
          ...message,
        };
      });
    };

    const setBalance = (event: Event) => {
      sseCtx.setBalance((prev: WalletBalance) => {
        const message = JSON.parse((event as MessageEvent<string>).data);

        return {
          ...prev,
          ...message,
        };
      });
    };

    if (evtSource) {
      evtSource.addEventListener("system_info", setSystemInfo);
      evtSource.addEventListener("btc_info", setBtcInfo);
      evtSource.addEventListener("ln_info_lite", setLnStatus);
      evtSource.addEventListener("wallet_balance", setBalance);
      evtSource.addEventListener("transactions", setTx);
      evtSource.addEventListener("installed_app_status", setAppStatus);
      evtSource.addEventListener("apps", setApps);
      evtSource.addEventListener("install", setInstall);
    }

    return () => {
      // cleanup
      if (evtSource) {
        evtSource.removeEventListener("system_info", setSystemInfo);
        evtSource.removeEventListener("btc_info", setBtcInfo);
        evtSource.removeEventListener("ln_info_lite", setLnStatus);
        evtSource.removeEventListener("wallet_balance", setBalance);
        evtSource.removeEventListener("transactions", setTx);
        evtSource.removeEventListener("installed_app_status", setAppStatus);
        evtSource.removeEventListener("apps", setApps);
        evtSource.removeEventListener("install", setInstall);
      }
    };
  }, [evtSource, setEvtSource, sseCtx]);

  return {
    systemInfo: sseCtx.systemInfo,
    btcInfo: sseCtx.btcInfo,
    lnStatus: sseCtx.lnStatus,
    balance: sseCtx.balance,
    appStatus: sseCtx.appStatus,
    transactions: sseCtx.transactions,
    availableApps: sseCtx.availableApps,
    isInstalling: sseCtx.isInstalling,
  };
}

export default useSSE;
