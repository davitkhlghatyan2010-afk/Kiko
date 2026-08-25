"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminProofs, setProofFlagged } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PixelBackdrop } from "@/components/PixelBackdrop";

function ProofRow({ proof, onToggleFlag, busy }) {
  return (
    <li className={`rounded-2xl border-2 p-4 ${proof.flagged ? "border-alert bg-alert/10" : "border-ink"}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{proof.username}</span>
        <span className="font-mono text-xs text-stone">
          {new Date(proof.date).toLocaleDateString()}
        </span>
      </div>

      <p className="mb-2 text-sm text-ink">
        {proof.taskText} — {proof.taskAmount}
      </p>

      <p className="mb-1 text-xs uppercase tracking-wide text-stone">Summary</p>
      <p className="mb-2 text-sm text-ink">{proof.summary}</p>

      <p className="mb-1 text-xs uppercase tracking-wide text-stone">{proof.aiQuestion}</p>
      <p className="mb-3 text-sm text-ink">{proof.userAnswer}</p>

      <button
        type="button"
        onClick={() => onToggleFlag(proof)}
        disabled={busy}
        className={`rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60 ${
          proof.flagged ? "border-2 border-ink bg-wall text-ink" : "bg-alert text-sky-cloud"
        }`}
      >
        {busy ? "Saving..." : proof.flagged ? "Unflag" : "Flag as fake"}
      </button>
    </li>
  );
}

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [proofs, setProofs] = useState(undefined);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!user.isAdmin) {
      router.push("/");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user?.isAdmin) return;
    getAdminProofs()
      .then(({ proofs }) => setProofs(proofs))
      .catch((err) => setError(err.message));
  }, [user]);

  async function handleToggleFlag(proof) {
    setBusyId(proof.id);
    try {
      const { proof: updated } = await setProofFlagged(proof.id, !proof.flagged);
      setProofs((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  if (loading || !user || !user.isAdmin) {
    return (
      <PixelBackdrop>
        <p className="rounded-xl border-2 border-ink bg-wall px-4 py-2 text-sm text-ink">Loading...</p>
      </PixelBackdrop>
    );
  }

  return (
    <PixelBackdrop stretch>
      <div className="flex w-full max-w-md flex-1 flex-col gap-4 py-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Review proofs</h1>
          <p className="text-sm text-stone">Your group&apos;s completed proofs, most recent first.</p>
        </div>

        <div className="flex-1 overflow-y-auto rounded-2xl">
          {error && (
            <p className="rounded-xl border-2 border-ink bg-wall p-4 text-sm text-dead">{error}</p>
          )}

          {!error && proofs === undefined && (
            <p className="rounded-xl border-2 border-ink bg-wall p-4 text-sm text-stone">Loading...</p>
          )}

          {!error && proofs?.length === 0 && (
            <p className="rounded-xl border-2 border-ink bg-wall p-4 text-sm text-stone">
              Nothing to review yet.
            </p>
          )}

          {!error && proofs && proofs.length > 0 && (
            <ul className="flex flex-col gap-3">
              {proofs.map((proof) => (
                <ProofRow
                  key={proof.id}
                  proof={proof}
                  busy={busyId === proof.id}
                  onToggleFlag={handleToggleFlag}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </PixelBackdrop>
  );
}
