"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Network, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [name, setName] = useState("Dr. Elena Vance");
  const [email, setEmail] = useState("ml-engineer@enterprise.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [role, setRole] = useState("ML Engineer");
  const [error, setError] = useState<string | null>(null);
  const { signup, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signup({ name, email, password, role });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to create account.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-6">
      <div className="w-full max-w-md space-y-6 bg-slate-900/90 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="text-center space-y-2">
          <div className="mx-auto h-11 w-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <Network className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Create ResolveML Account
          </h2>
          <p className="text-xs text-slate-400">
            Join your team to deploy, benchmark, and monitor entity matching pipelines.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Full Name
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
              placeholder="Full Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Work Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1 text-xs text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
            >
              <option value="ML Engineer">ML Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Admin">Admin</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            isLoading={isLoading}
          >
            Create Account <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
