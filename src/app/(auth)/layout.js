import { Open_Sans } from "next/font/google";
import "../globals.css";


const geistOpen = Open_Sans({
    variable: "--font-open-sans",
    subsets: ["latin"],
});

export const metadata = {
    title: "Equivalencia - Psicologia",
    description: "Equivalencia de la nueva malla",
    icons: {
        icon: "./usco-logo.ico",
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body
                className={`${geistOpen.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
