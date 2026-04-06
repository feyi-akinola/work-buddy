import { auth } from "@/lib/auth";
import { signInAction } from "../../actions/auth";
import Button from "@/components/Button";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function SignIn() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect("/");
  }

  return (
    <div className="h-screen w-screen flex-center bg-black">
      <div className="w-[460px] flex flex-col gap-14 p-6">
        <h2 className="text-4xl font-bold text-white text-center">Log In</h2>

        <form action={signInAction} className="flex flex-col gap-5 w-full">
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

          <button type="submit" className="mt-2">
            <Button text="Sign In" />
          </button>
        </form>
      </div>
    </div>
  );
}