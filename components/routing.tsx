"use client";
import { useGetAuthUserQuery } from "@/state/api";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";

const Routing = () => {
  const { data: authUser, isLoading: authLoading } = useGetAuthUserQuery();

  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    if (authUser) {
        console.log("pathname:", pathname);
        
    //   router.push("/dashboard", { scroll: false });
    }else{
        // router.push("/login", { scroll: false });
    }
    // alert("Routing useEffect called");
  }, [authUser, router, pathname]);

  return <></>;
};

export default Routing;
