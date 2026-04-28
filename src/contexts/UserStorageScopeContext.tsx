import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { JEMULPO_AUTH_CHANGE } from "@/lib/authScopeEvents";
import { getUserStorageScope } from "@/lib/localUserScope";

const UserStorageScopeContext = createContext<string | null>(null);

export function UserStorageScopeProvider({ children }: { children: ReactNode }) {
  const [scope, setScope] = useState(getUserStorageScope);
  useEffect(() => {
    const onChange = () => setScope(getUserStorageScope());
    window.addEventListener(JEMULPO_AUTH_CHANGE, onChange);
    return () => window.removeEventListener(JEMULPO_AUTH_CHANGE, onChange);
  }, []);
  return (
    <UserStorageScopeContext.Provider value={scope}>
      {children}
    </UserStorageScopeContext.Provider>
  );
}

export function useUserStorageScopeValue() {
  const v = useContext(UserStorageScopeContext);
  if (v == null) {
    throw new Error(
      "useUserStorageScopeValue must be used within UserStorageScopeProvider",
    );
  }
  return v;
}
