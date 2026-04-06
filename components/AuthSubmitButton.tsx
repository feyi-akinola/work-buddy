"use client";

import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  idleText: string;
  pendingText: string;
};

const AuthSubmitButton = ({ idleText, pendingText }: AuthSubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 bg-white text-black/80 rounded-2xl py-4 px-16 flex-center cursor-pointer
      hover:bg-white/70 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <p className="text-lg font-bold">{pending ? pendingText : idleText}</p>
    </button>
  );
};

export default AuthSubmitButton;
