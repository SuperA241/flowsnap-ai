// Public layout for iframe-embedded widget runtime. No auth. No user account data.
export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
