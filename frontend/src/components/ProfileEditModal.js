"use client";

import { useRef, useState } from "react";
import { updateProfile } from "@/lib/api";
import { PixelAvatar } from "@/components/PixelAvatar";
import { resizeImageToDataUrl } from "@/lib/resizeImage";

const AVATAR_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7];

export function ProfileEditModal({ user, onClose, onSaved }) {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [avatarPhoto, setAvatarPhoto] = useState(user.avatarPhoto);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      setAvatarPhoto(await resizeImageToDataUrl(file));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const patch = {};
    if (username.trim() !== user.username) patch.username = username.trim();
    if (avatar !== user.avatar) patch.avatar = avatar;
    if (avatarPhoto !== user.avatarPhoto) patch.avatarPhoto = avatarPhoto;
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
        className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl border-2 border-ink bg-wall p-6 text-ink"
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
            <p className="mb-2 text-sm">Photo</p>
            <div className="flex items-center gap-3">
              {avatarPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element -- data URL, not a served asset
                <img src={avatarPhoto} alt="" className="h-12 w-12 rounded-lg border-2 border-ink object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-ink text-xs text-stone">
                  none
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border-2 border-ink px-3 py-1 text-sm"
              >
                Upload
              </button>
              {avatarPhoto && (
                <button type="button" onClick={() => setAvatarPhoto(null)} className="text-sm underline">
                  Remove
                </button>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm">Pixel avatar {avatarPhoto && "(used if you remove your photo)"}</p>
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
