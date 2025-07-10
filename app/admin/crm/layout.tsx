import { ReactNode } from 'react';

export default function CRMLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="crm-layout">
      {children}
    </div>
  );
}
