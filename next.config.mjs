/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'www.usco.edu.co',
                port: '',
                pathname: '/imagen-institucional/**',
            },
        ],
    },
};

export default nextConfig;
