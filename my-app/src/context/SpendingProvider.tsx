'use client';

import { useIDB } from '@/hooks/useIDB';
import { getItems } from '@/services/getRecords';
import {
  createContext,
  ReactNode,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const INIT_CTX_VAL: {
  loading: boolean;
  data: SpendingRecord[];
  syncData: (groupId?: string, email?: string, time?: string) => void;
} = {
  loading: true,
  data: [],
  syncData: () => {},
};

export const SpendingProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SpendingRecord[]>([]);
  const { db: IDB, getData: getDataFromIDB, setData: setData2IDB } = useIDB();
  const controllerRef = useRef<AbortController>(new AbortController());

  const handleSetState = useCallback((_data: SpendingRecord[]) => {
    setData(_data);
    startTransition(() => {
      setLoading(false);
    });
  }, []);

  const queryItem = useCallback(
    (email?: string, groupId?: string, time?: string) => {
      if (!email && !groupId) return;
      getItems(groupId, email, time)
        .then((res) => {
          controllerRef.current.abort();
          handleSetState(res.data);
          setData2IDB(IDB, res.data, time)
            .then(() => {
              console.log('Update IDB success.');
            })
            .catch((err) => {
              console.log('Update IDB failed: ', err);
            });
        })
        .catch(console.error);
    },
    [IDB, handleSetState, setData2IDB],
  );

  const syncData = useCallback(
    (groupId?: string, email?: string, time?: string) => {
      queryItem(email, groupId, time);
    },
    [queryItem],
  );

  const ctxVal = useMemo(
    () => ({
      loading,
      data,
      syncData,
    }),
    [loading, data, syncData],
  );

  useEffect(() => {
    const controller = (controllerRef.current = new AbortController());
    if (IDB) {
      console.log('Get Data from IDB');
      getDataFromIDB(IDB, controller.signal)
        .then((res) => {
          if (res && res.length === 1) {
            handleSetState(JSON.parse(res[0].data));
          }
        })
        .catch((err) => {
          console.log('Error while syncing data: ', err);
        });
    }
    return () => controller.abort();
  }, [IDB, getDataFromIDB, handleSetState]);

  return <Ctx.Provider value={ctxVal}>{children}</Ctx.Provider>;
};

const Ctx = createContext(INIT_CTX_VAL);
export const useGetSpendingCtx = () => useContext(Ctx);
