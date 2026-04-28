import { createContext, useContext, type ReactNode } from "react";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

const UserStorageScopeContext = createContext<string | null>(null);

export function UserStorageScopeProvider({ children }: { children: ReactNode }) {
  const { user, loading, sessionKey } = useSupabaseAuth();
  // sessionKey가 바뀌면 로그아웃 → providers 강제 re-mount → 이전 상태 초기화
  const scope = loading ? "loading" : `${user?.id ?? "no-user"}-${sessionKey}`;
  return (
    <UserStorageScopeContext.Provider value={scope}>
      {children}
    </UserStorageScopeContext.Provider>
  );
}

export function useUserStorageScopeValue() {
  const v = useContext(UserStorageScopeContext);
  if (v == null) {
    throw new Error("useUserStorageScopeValue must be used within UserStorageScopeProvider");
  }
  return v;
}
