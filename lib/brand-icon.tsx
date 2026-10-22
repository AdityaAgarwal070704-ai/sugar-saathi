import { ImageResponse } from "next/og";

// The app icon: a deep-green tile with a saffron leaf-and-drop mark.
export function brandIcon(size: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1b4d3e" }}>
        <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 64 64">
          <path d="M32 6 C46 22 52 31 52 40 A20 20 0 0 1 12 40 C12 31 18 22 32 6 Z" fill="#e9a23b" />
          <path d="M32 24 C32 36 32 44 32 54" stroke="#1b4d3e" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M32 38 C26 36 23 33 22 29 M32 44 C38 42 41 39 42 35" stroke="#1b4d3e" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
