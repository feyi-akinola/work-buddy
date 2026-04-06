"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

type SessionLike = {
  user?: {
    name?: string;
    id?: string;
  };
} | null;

export default function UserHydrator({ session }: { session: SessionLike }) {
  const setName = useUserStore(s => s.setName);
  const setId = useUserStore(s => s.setId);
  const clear = useUserStore(s => s.clear);

  useEffect(() => {
    if (session?.user?.name && session?.user?.id) {
      setName(session.user.name);
      setId(session.user.id);
    } else {
      clear();
    }
  }, [session, setId, setName, clear]);

  return null;
}