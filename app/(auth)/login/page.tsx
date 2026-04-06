import { auth } from "@/lib/auth";
import { signInAction } from "../../actions/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import GoogleAuthButton from "@/components/GoogleAuthButton";

type SignInProps = {
  searchParams?: Promise<{ error?: string }> | { error?: string };
};

export default async function SignIn({ searchParams }: SignInProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const params = searchParams
    ? "then" in searchParams
      ? await searchParams
      : searchParams
    : undefined;
  const error = params?.error;

  if (session) {
    return redirect("/");
  }

  return (
    <div className="h-screen w-screen flex-center bg-black">
      <div className="w-[460px] flex flex-col gap-12 p-6">
        <h2 className="text-4xl font-bold text-white text-center">Log In</h2>
        {error ? (
          <p className="text-red-400 text-sm text-center bg-red-950/40 border border-red-900 rounded-lg p-2">
            {error}
          </p>
        ) : null}

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

          <AuthSubmitButton idleText="Sign In" pendingText="Signing In..." />
        </form>

        <GoogleAuthButton label="Sign in with Google" />
      </div>
    </div>
  );
}