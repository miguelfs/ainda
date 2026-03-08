import type { Metadata } from "next"
import { Lora } from "next/font/google"
import "./globals.css"

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ainda Estou Aqui... Estudando",
  description:
    "Prepare-se para o Exame de Qualificação da UERJ com questões sobre o livro Ainda Estou Aqui, de Marcelo Rubens Paiva.",
  openGraph: {
    title: "Ainda Estou Aqui... Estudando",
    description:
      "Questões preparatórias para o Exame de Qualificação da UERJ sobre o livro Ainda Estou Aqui.",
    siteName: "Ainda Estou Aqui... Estudando",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ainda Estou Aqui... Estudando",
    description:
      "Questões preparatórias para o Exame de Qualificação da UERJ sobre o livro Ainda Estou Aqui.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={lora.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if(matchMedia("(prefers-color-scheme:dark)").matches)document.documentElement.classList.add("dark")`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
