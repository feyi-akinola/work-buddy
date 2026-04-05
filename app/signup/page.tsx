"use client";
import { signUpAction } from "../actions/auth";
import Button from "@/components/Button";

export default function SignUp() {
  return (
    <div className="h-screen w-screen flex-center bg-black">
      <div className="w-[460px] flex flex-col gap-14 p-6">
        <h2 className="text-4xl font-bold text-white text-center">Create An Account</h2>

        <form action={signUpAction} className="flex flex-col gap-5 w-full">
          <input
            name="name"
            placeholder="Name"
            type="text"
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 text-white 
              ring-2 ring-zinc-800 outline-none
              focus:ring-zinc-300 transition-all"
          />
          
          <input
            name="email"
            placeholder="Email"
            type="email"
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 text-white 
              ring-2 ring-zinc-800 outline-none
              focus:ring-zinc-300 transition-all"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 text-white 
              ring-2 ring-zinc-800 outline-none
              focus:ring-zinc-300 transition-all"
          />

          <div className="mt-2">
            <Button text="Sign Up" />
          </div>
        </form>
      </div>
    </div>
  );
}