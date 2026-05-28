import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return (
    <div
      style={{
        backgroundImage: "url('/assets/background.jpeg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
      className={`min-h-dvh w-full ${className}`}
    >
      <div className="flex min-h-dvh w-full flex-col overflow-x-hidden bg-black/75">
        {children}
      </div>
    </div>
  );
}
