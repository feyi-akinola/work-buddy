"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

export default function UserHydrator({ session }: any) {
  const setName = useUserStore(s => s.setName);
  const setId = useUserStore(s => s.setId);
  const clear = useUserStore(s => s.clear);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name);
      setId(session.user.id);
    } else {
      clear();
    }
  }, [session, setId, setName, clear]);

  return null;
}