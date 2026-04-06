"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { FcGoogle } from "react-icons/fc";

type GoogleAuthButtonProps = {
  label?: string;
};  

const GoogleAuthButton = ({ label = "Continue with Google" }: GoogleAuthButtonProps) => {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });

    if (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={loading}
      className="flex-center gap-4 w-full px-4 py-3 rounded-xl bg-zinc-900 text-white ring-2 ring-zinc-800 outline-none
      hover:ring-zinc-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-lg font-semibold cursor-pointer"
    >
      <FcGoogle size={36} />
      {loading ? "Redirecting..." : label}
    </button>
  );
};

export default GoogleAuthButton;
