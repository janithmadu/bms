"use client";

import { useLocationsStore } from "@/stores/useLocationsStore";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const UseStoreInitiate = () => {
  const { data: session, status } = useSession();

  const UserID = session?.user.id;
  const Role = session?.user.role;
  const getLoacations = useLocationsStore((state) => state.fetchLocation);
  useEffect(() => {
    if (status === "authenticated") {
      getLoacations(UserID as string, Role as string);
    }
  }, [getLoacations, status, session?.user.id, session?.user.role]);

  return null; // no UI, just initializer
};

export default UseStoreInitiate;
