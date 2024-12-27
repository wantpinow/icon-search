import { ImageResponse } from "next/og";
// Image metadata
export const size = {
  width: 512,
  height: 512,
};
export function Favicon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 24,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "black",
          borderRadius: 10000,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="384"
          height="384"
          viewBox="0 0 24 24"
          fill="black"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-shapes"
        >
          <path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <circle cx="17.5" cy="17.5" r="3.5" />
        </svg>
      </div>
    ),
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    },
  );
}
