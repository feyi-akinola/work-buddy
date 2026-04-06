"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const toMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

export async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim();

  if (!email || !password || !name) {
    redirect("/signup?error=Please%20fill%20all%20fields");
  }

  if (password.length < 8) {
    redirect("/signup?error=Password%20must%20be%20at%20least%208%20characters");
  }

  try {
    await auth.api.signUpEmail({
      body: { email, password, name }
    });
    redirect("/");
  } catch (error) {
    const msg = toMessage(error, "Unable to sign up right now");
    redirect(`/signup?error=${encodeURIComponent(msg)}`);
  }
};

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Please%20provide%20email%20and%20password");
  }

  try {
    await auth.api.signInEmail({ body: { email, password } });
    redirect("/");
  } catch (error) {
    const msg = toMessage(error, "Invalid credentials");
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }
};

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    const msg = toMessage(error, "Sign out failed");
    redirect(`/chat?error=${encodeURIComponent(msg)}`);
  }
  redirect("/");
};