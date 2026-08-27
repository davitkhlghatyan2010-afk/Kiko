"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminProofs, setProofFlagged } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PixelBackdrop } from "@/components/PixelBackdrop";

const ROOM_STATES = [
  { value: "work", label: "Work" },
  { value: "break", label: "Rest" },
  { value: "done", label: "Done" },
];

// Same PixelBackdrop, same scene="room", same everything the real
// concentration screen uses -- switching states here is switching states
// there, not a smaller stand-in for it.
function RoomPreview({ roomState, onSelect, onClose }) {
  return (
    <PixelBackdrop scene="room" roomState={roomState}>
      <div className="fixed left-4 top-24 z-30 flex gap-2">
        {ROOM_STATES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={`border-2 border-ink px-3 py-1 font-pixel-body text-[10px] uppercase tracking-wide ${
              roomState === value ? "bg-wood-mid text-sky-cloud" : "bg-wall text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="fixed bottom-8 left-1/2 z-30 -translate-x-1/2 border-2 border-ink bg-wall px-5 py-2 font-pixel-body text-[10px] uppercase tracking-wide text-ink hover:bg-wood-mid hover:text-sky-cloud"
      >
        Back to admin
      </button>
    </PixelBackdrop>
  );
}

function ProofRow({ proof, onToggleFlag, busy }) {
  return (
    <li
      className={`border-4 p-4 shadow-[4px_4px_0_0_var(--color-ink)] ${proof.flagged ? "border-alert bg-alert/10" : "border-ink bg-wall/70"}`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink">{proof.username}</span>
        <span className="font-mono text-xs text-stone">
          {new Date(proof.date).toLocaleDateString()}
        </span>
      </div>

      <p className="mb-2 text-sm text-ink">
        {proof.taskText} — {proof.taskAmount}
      </p>

      <p className="mb-1 font-pixel-body text-[10px] uppercase tracking-wide text-stone">Summary</p>
      <p className="mb-2 text-sm text-ink">{proof.summary}</p>

      <p className="mb-1 font-pixel-body text-[10px] uppercase tracking-wide text-stone">{proof.aiQuestion}</p>
      <p className="mb-3 text-sm text-ink">{proof.userAnswer}</p>

      <button
        type="button"
        onClick={() => onToggleFlag(proof)}
        disabled={busy}
        className={`border-4 border-ink px-4 py-2 font-pixel-display text-[10px] uppercase tracking-wide shadow-[3px_3px_0_0_var(--color-ink)] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60 ${
          proof.flagged ? "bg-wall text-ink" : "bg-alert text-sky-cloud"
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
  const [previewState, setPreviewState] = useState(null);

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
        <p className="border-2 border-ink bg-wall px-4 py-2 font-pixel-body text-xs text-ink">Loading...</p>
      </PixelBackdrop>
    );
  }

  if (previewState) {
    return <RoomPreview roomState={previewState} onSelect={setPreviewState} onClose={() => setPreviewState(null)} />;
  }

  return (
    <PixelBackdrop stretch>
      <div className="flex w-full max-w-md flex-1 flex-col gap-4 py-8">
        <div>
          <h1 className="font-pixel-display text-lg tracking-wide text-ink">Review proofs</h1>
          <p className="mt-2 text-sm text-stone">Your group&apos;s completed proofs, most recent first.</p>
        </div>

        <div className="flex flex-col gap-3 border-4 border-ink bg-wall p-4 shadow-[6px_6px_0_0_var(--color-ink)]">
          <p className="font-pixel-display text-xs tracking-wide text-ink">Room preview</p>
          <div className="flex gap-2">
            {ROOM_STATES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPreviewState(value)}
                className="border-2 border-ink bg-wall px-4 py-1.5 font-pixel-body text-[10px] uppercase tracking-wide text-ink hover:bg-wood-mid hover:text-sky-cloud"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <p className="border-2 border-ink bg-wall p-4 font-pixel-body text-xs text-dead">{error}</p>
          )}

          {!error && proofs === undefined && (
            <p className="border-2 border-ink bg-wall p-4 font-pixel-body text-xs text-stone">Loading...</p>
          )}

          {!error && proofs?.length === 0 && (
            <p className="border-2 border-ink bg-wall p-4 font-pixel-body text-xs text-stone">
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
