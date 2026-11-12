export const metadata = {
  title: "API REST Bolsa de Empleo UNIPAZ",
  description: "Backend Next.js + Prisma ORM + MySQL para UniEmpleo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "sans-serif", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
