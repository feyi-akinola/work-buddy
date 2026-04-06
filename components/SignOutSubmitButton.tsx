"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";

const SignOutSubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="nav-text flex-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <span>{pending ? "Signing Out..." : "Sign Out"}</span>
      <LogOut className="w-5 h-5" />
    </button>
  );
};

export default SignOutSubmitButton;
