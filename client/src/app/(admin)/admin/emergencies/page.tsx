'use client';

import React from 'react';

export default function EmergencyHubPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="glass-card p-xl rounded-2xl border border-outline-variant/30 max-w-lg shadow-lg">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-md">
          Welcome to the Emergency Hub Page
        </h1>
        <p className="text-on-surface-variant font-body-md">
          This section contains all active operations, routing tracking, and live emergency hub logs.
        </p>
      </div>
    </div>
  );
}
