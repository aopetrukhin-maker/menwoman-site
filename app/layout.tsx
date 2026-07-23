import type { Metadata } from "next";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import "@fontsource/cormorant-garamond/700.css";
import "./globals.css";
import "./visual-overrides.css";

export const metadata: Metadata = {
  title: "Мужчина и Женщина. Перезагрузка | Санкт-Петербург, 22 августа 2026",
  description:
    "Фестиваль о любви, деньгах, близости и взрослом партнерстве. 22 августа 2026, Дворец Кваренги, Санкт-Петербург.",
  keywords: [
    "фестиваль отношений Санкт-Петербург",
    "Мужчина и Женщина Перезагрузка",
    "фестиваль 22 августа 2026",
    "психология отношений",
  ],
  openGraph: {
    title: "Мужчина и Женщина. Перезагрузка",
    description: "О любви, власти, деньгах и партнерстве в современном мире.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
