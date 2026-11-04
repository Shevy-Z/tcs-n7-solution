import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://tcs-detail-reports.captaincroe.chatgpt.site"),
  title: "明细报表 · 微信客户调研平台 TCS",
  description: "问题表、客户表与问卷报表明细查询原型",
  openGraph: {
    title: "TCS 明细报表",
    description: "问题表、客户表与问卷报表明细查询页面",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "TCS 明细报表" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TCS 明细报表",
    description: "问题表、客户表与问卷报表明细查询页面",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
