import { auth } from "@/lib/auth";
import { signUpAction } from "../../actions/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import GoogleAuthButton from "@/components/GoogleAuthButton";

export default async function SignUp() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    return redirect("/");
  }

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

          <AuthSubmitButton idleText="Sign Up" pendingText="Creating Account..." />
        </form>

        <GoogleAuthButton label="Sign up with Google" />
      </div>
    </div>
  );
}