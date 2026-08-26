"use client";

import { PixelAvatar } from "@/components/PixelAvatar";

const SIZES = { 2: "h-8 w-8", 3: "h-12 w-12" };

// Shows the uploaded photo if the user has one, otherwise their chosen
// drawn portrait.
export function UserAvatar({ user, scale = 2 }) {
  if (user.avatarPhoto) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URL, not a served asset
      <img
        src={user.avatarPhoto}
        alt=""
        className={`${SIZES[scale] || SIZES[2]} rounded-lg border-2 border-ink object-cover`}
      />
    );
  }
  return <PixelAvatar v={user.avatar} scale={scale} />;
}
