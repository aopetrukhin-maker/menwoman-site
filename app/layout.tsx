import type { Metadata } from "next";
import { festivalEvent as event } from "./festival-event";
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
  title: `МЖ — вечер знакомств и разговоров об отношениях | ${event.dateLabel}, ${event.city}`,
  description: `${event.name}: ${event.dateLabel}, ${event.timeLabel}. «${event.venue}», ${event.city}, ${event.address}. Метро «${event.metro}». Выступления, экспозона, консультации и практики.`,
  keywords: [
    "фестиваль отношений Санкт-Петербург",
    "МЖ Мужчина и Женщина",
    "фестиваль 3 декабря 2026",
    "психология отношений",
  ],
  openGraph: {
    title: `Фестиваль МЖ · ${event.dateLabel} · ${event.venue}`,
    description: `${event.timeLabel} · ${event.city}, ${event.address} · метро «${event.metro}».`,
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredEvent = {
    "@context": "https://schema.org",
    "@type": "Festival",
    name: event.name,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address,
        addressLocality: event.city,
        addressCountry: "RU",
      },
    },
  };
  return (
    <html lang="ru">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredEvent).replace(/</g, "\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
