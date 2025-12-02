/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {

        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",


        remotePatterns: [
            {
                protocol: "http",
                hostname: "example.com",
            },
            {
                protocol: "https",
                hostname: "placehold.co",
            },
            {
                protocol: "https",
                hostname: "via.placeholder.com",
            },
        ],
    },
};

export default nextConfig;