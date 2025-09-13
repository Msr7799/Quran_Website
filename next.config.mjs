/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    images: {
        unoptimized: true,
    },
    poweredByHeader: false,
    productionBrowserSourceMaps: false,
    
    
    eslint: {
        ignoreDuringBuilds: true,
    },
    
    typescript: {
        ignoreBuildErrors: false,
    },
};

export default nextConfig;
