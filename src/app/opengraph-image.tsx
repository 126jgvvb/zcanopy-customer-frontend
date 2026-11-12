import { ImageResponse } from "next/og";

export const alt = "ZCanopy - Verified properties across Uganda";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Branded social card, generated at build time for the static routes and on
 * demand for the dynamic ones. No external assets are used so it renders
 * identically everywhere.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background:
            "linear-gradient(135deg, #f4efe6 0%, #ece4d6 55%, #d1a054 100%)",
          color: "#4a322c",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              background: "#a9710e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fffcf8",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            Z
          </div>
          <div style={{ fontSize: 40, letterSpacing: 2 }}>ZCANOPY</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 74, lineHeight: 1.05, maxWidth: 960 }}>
            Verified properties across Uganda
          </div>
          <div style={{ fontSize: 32, color: "#7a6a60", maxWidth: 860 }}>
            Browse listings from trusted brokers and book a viewing directly.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 26, color: "#7a6a60" }}>
          zcanopy.com
        </div>
      </div>
    ),
    size,
  );
}
