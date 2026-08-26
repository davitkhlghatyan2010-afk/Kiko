"use client";

import { useState } from "react";
import { updateProfile } from "@/lib/api";
import { PixelAvatar } from "@/components/PixelAvatar";

const AVATAR_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7];

export function ProfileEditModal({ user, onClose, onSaved }) {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const patch = {};
    if (username.trim() !== user.username) patch.username = username.trim();
    if (avatar !== user.avatar) patch.avatar = avatar;
    if (Object.keys(patch).length === 0) {
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      const { user: updated } = await updateProfile(patch);
      onSaved(updated);
      onClose();
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
          <h2 className="text-lg font-semibold">Edit profile</h2>
          <button type="button" onClick={onClose} className="text-sm underline">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-sm">
            Name
            <input
              className="mt-1 w-full border-b-2 border-ink bg-transparent px-1 py-2 text-ink outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={3}
              required
            />
          </label>

          <div>
            <p className="mb-2 text-sm">Avatar</p>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_OPTIONS.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAvatar(v)}
                  className={`rounded-lg p-1 ${avatar === v ? "ring-2 ring-alert" : ""}`}
                >
                  <PixelAvatar v={v} scale={2} />
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-dead">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-alert px-4 py-2 text-sm font-semibold text-sky-cloud disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
