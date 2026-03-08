export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="min-h-screen min-h-[100dvh] w-full bg-black"
      style={{ colorScheme: "dark" }}
    >
      {children}
    </div>
  );
}
