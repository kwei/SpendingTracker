'use client';

import { getGroups } from '@/services/groupServices';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const INIT_CTX_VAL: {
  loading: boolean;
  groups: Group[];
  syncGroup: (groupId: string | string[]) => void;
  setter: (_groups: Group[]) => void;
} = {
  loading: true,
  groups: [],
  syncGroup: () => {},
  setter: () => {},
};

export const GroupProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);

  const handleState = (res: Group[]) => {
    setGroups(res);
    setLoading(false);
  };

  const queryGroup = useCallback((groupId: string | string[]) => {
    setLoading(true);
    getGroups(groupId)
      .then(({ data: res }) => {
        handleState(res);
      })
      .catch(console.error);
  }, []);

  const ctxVal = useMemo(
    () => ({
      loading,
      groups,
      syncGroup: queryGroup,
      setter: handleState,
    }),
    [groups, loading, queryGroup],
  );

  return <Ctx.Provider value={ctxVal}>{children}</Ctx.Provider>;
};

const Ctx = createContext(INIT_CTX_VAL);
export const useGroupCtx = () => useContext(Ctx);
