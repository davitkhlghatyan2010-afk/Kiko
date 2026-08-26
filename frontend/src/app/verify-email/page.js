"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { confirmEmailChange } from "@/lib/api";
import { PixelBackdrop } from "@/components/PixelBackdrop";

function VerifyEmailStatus() {
  const token = useSearchParams().get("token") || "";
  const [status, setStatus] = useState(token ? "confirming" : "missing");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!token) return;
    confirmEmailChange(token)
      .then((res) => {
        setStatus("done");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [token]);

  if (status === "missing") {
    return <p className="text-sm">This link is missing its token. Request a new one from your Profile page.</p>;
  }
  if (status === "confirming") {
    return <p className="text-sm">Confirming...</p>;
  }
  if (status === "error") {
    return <p className="text-sm text-dead">{message}</p>;
  }
  return (
    <p className="text-sm">
      {message} You can close this tab, or{" "}
      <a href="/login" className="underline">
        log in
      </a>{" "}
      if you weren&apos;t already.
    </p>
  );
}

export default function VerifyEmailPage() {
  return (
    <PixelBackdrop>
      <div className="w-full max-w-sm rounded-2xl border-2 border-ink bg-wall p-6 text-ink">
        <h1 className="mb-6 text-2xl font-semibold">Confirm your email</h1>
        <Suspense fallback={<p className="text-sm">Loading...</p>}>
          <VerifyEmailStatus />
        </Suspense>
      </div>
    </PixelBackdrop>
  );
}
