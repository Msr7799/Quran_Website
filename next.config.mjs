/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'build',
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
