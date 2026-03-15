"use client";

import { useEffect, useRef } from "react";

interface H5PEmbedProps {
  src: string;
  title: string;
  height?: number;
}

export default function H5PEmbed({ src, title, height = 400 }: H5PEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "H5P_xAPI") {
        const statement = event.data.statement;
        fetch("/api/xapi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statement }),
        }).catch(console.error);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "6px 6px 14px #c2c8d6, -6px -6px 14px #ffffff",
        marginBottom: 16,
      }}
    >
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        width="100%"
        height={height}
        style={{ border: "none", display: "block" }}
        allowFullScreen
        allow="autoplay; fullscreen"
      />
    </div>
  );
}
