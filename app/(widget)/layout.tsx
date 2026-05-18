// Public layout for iframe-embedded widget runtime. No auth. No user account data.
export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background: transparent;
        }
      `}</style>
      {children}
    </>
  );
}
