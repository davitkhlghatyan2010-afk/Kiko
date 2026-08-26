"use client";

import { useState } from "react";
import { changePassword } from "@/lib/api";

export function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await changePassword({ currentPassword, newPassword, confirmNewPassword });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-ink/50 px-6" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border-2 border-ink bg-wall p-6 text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Password</h2>
          <button type="button" onClick={onClose} className="text-sm underline">
            Close
          </button>
        </div>

        {done ? (
          <p className="text-sm text-ink">Password updated.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-sm">
              Current password
              <input
                type="password"
                className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>
            <label className="text-sm">
              New password
              <input
                type="password"
                className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            <label className="text-sm">
              Confirm new password
              <input
                type="password"
                className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </label>

            {error && <p className="text-sm text-dead">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-alert px-4 py-2 text-sm font-semibold text-sky-cloud disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
