import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import SceneWrapper from "@/app/components/SceneWrapper";
import React from "react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "3D LipSync Case Study",
    description: "3D LipSync Case Study",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {/*background*/}
        <div className="fixed inset-0 -z-10">
            <SceneWrapper />
        </div>
        {/*main*/}
        {children}
        </body>
        </html>
    );
}
