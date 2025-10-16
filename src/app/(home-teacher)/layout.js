import "../globals.css";
import TeacherShell from './TeacherShell';

export const metadata = {
    title: "Dashboard - Equivalencias",
    description: "Equivalencia de la nueva malla",
    icons: {
        icon: "/usco-logo.ico",
    },
};

export default function TeacherLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <TeacherShell>{children}</TeacherShell>
            </body>
        </html>
    );
}
