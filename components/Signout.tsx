"use client";
import { useState } from "react";

// import { useSessionStore } from "../../store";
import { logout } from "@/utils/actions";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { Spinner } from "./ui/spinner";
// Adjust the import to your actual logout action

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const clearSession = useSessionStore((state) => state.clearSession);

  const handleLogout = async () => {
    setError(null);
    setLoading(true);
    try {
      await logout(); // Call your async logout action here
      // Optionally, redirect or update state here
      // clearSession();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/login"; // Redirect to home or login page
    } catch (err: any) {
      setError(err.message || "Logout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenuItem onClick={handleLogout}>
        {loading ? (
          <>
            <Spinner /> Logging out
          </>
        ) : (
          <>
            <LogOut />
            Log out
          </>
        )}
      </DropdownMenuItem>

      {error && (
        <div className="alert alert-danger mt-3 mb-0 py-2 px-3 text-center">
          {error}
        </div>
      )}
    </>
  );
}

// import { createClient } from '@/utils/supabase/server'
// import React from 'react'

// const Signout = () => {

//     const logout = async() =>{
//         "use server"
//         const supabase = await createClient();
//         supabase.auth.signOut();
//         //redirect and all
//     }
//   return (
//     <div className=''>
//       <form action={logout}>
//         <button className="btn btn-dark container mb-3">Sign out</button>
//       </form>
//     </div>
//   )
// }

// export default Signout
