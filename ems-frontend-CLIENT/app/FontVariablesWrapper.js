"use client";
import React, { useEffect, useState } from "react";

export default function FontVariablesWrapper({ geistSansVariable, geistMonoVariable, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={
        mounted
          ? `${geistSansVariable} ${geistMonoVariable} antialiased`
          : "antialiased"
      }
    >
      {children}
    </div>
  );
}
