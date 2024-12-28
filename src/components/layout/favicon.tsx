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
          borderRadius: 20,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="384"
          height="384"
          viewBox="0 0 24 24"
          fill="transparent"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-shapes"
        >
          <path d="M21 6H3" />
          <path d="M10 12H3" />
          <path d="M10 18H3" />
          <circle cx="17" cy="15" r="3" />
          <path d="m21 19-1.9-1.9" />
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
