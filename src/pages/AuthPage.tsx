import { useState } from "react";
import type { FormEvent } from "react";
import { AuthCard } from "@/components/auth/AuthCard";

type AuthForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  addressLine: string;
  password: string;
  logo: File | null;
};

type AuthPageProps = {
  type: "login" | "signup";
  onSubmit: (type: "login" | "signup", form: AuthForm) => Promise<void>;
  isAuthLoading: boolean;
};

export function AuthPage({ type, onSubmit, isAuthLoading }: AuthPageProps) {
  const [form, setForm] = useState<AuthForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    addressLine: "",
    password: "",
    logo: null,
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(type, form);
  }

  return (
    <AuthCard type={type} form={form} setForm={setForm} onSubmit={submit} isAuthLoading={isAuthLoading} />
  );
}
