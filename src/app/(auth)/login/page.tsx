"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Network, ArrowRight, ShieldCheck, Zap, Database, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("ml-engineer@enterprise.ai");
  const [password, setPassword] = useState("••••••••••••");
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate. Please check credentials.");
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    try {
      await login({ email: "ml-engineer@enterprise.ai", password: "demo" });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to authenticate.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900 text-slate-100">
      {/* Left Brand Feature Panel */}
      <div className="md:w-1/2 p-8 md:p-14 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 bg-gradient-to-br from-slate-900 via-neutral-950 to-indigo-950/40">
        <div>
          <div className="flex items-center space-x-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block">
                ResolveML
              </span>
              <span className="text-xs text-indigo-400 font-medium tracking-wide">
                Business Entity Resolution Platform
              </span>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
              High-Precision Entity Disambiguation for Enterprise Data.
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              De-duplicate, link, and cluster dirty multi-source vendor, customer, and supplier records with sub-quadratic blocking and neural graph clustering.
            </p>
          </div>
        </div>

        {/* Feature bullets */}
        <div className="my-10 space-y-4 max-w-md">
          <div className="flex items-start space-x-3 text-xs text-slate-300">
            <Zap className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong>99.98% Search Space Pruning:</strong> Q-gram & MinHash blocking with candidate set distribution analytics.
            </span>
          </div>
          <div className="flex items-start space-x-3 text-xs text-slate-300">
            <Database className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong>3-Source Cross-Resolution:</strong> Multi-way entity matching with transitive closure consistency.
            </span>
          </div>
          <div className="flex items-start space-x-3 text-xs text-slate-300">
            <ShieldCheck className="h-4 w-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Target Metric F_0.5 &gt; 0.95:</strong> Optimized for high precision with strict false-positive penalties.
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-500">
          © 2026 ResolveML Inc. All rights reserved. JWT Secured Session.
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="md:w-1/2 p-8 md:p-14 flex items-center justify-center bg-slate-900/50">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Sign In to Workspace
            </h2>
            <p className="text-xs text-slate-400">
              Enter your enterprise credentials or launch the instant demo workspace.
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">
                  Password
                </label>
                <span className="text-[11px] text-indigo-400 cursor-pointer hover:underline">
                  Forgot password?
                </span>
              </div>
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
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 absolute font-mono">
              or quick access
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            className="w-full border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-slate-200"
            isLoading={isLoading}
          >
            <Lock className="mr-2 h-3.5 w-3.5 text-indigo-400" />
            Continue with Instant Demo Sandbox
          </Button>

          <p className="text-center text-xs text-slate-400 pt-2">
            Don&apos;t have an enterprise account?{" "}
            <Link href="/signup" className="text-indigo-400 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
