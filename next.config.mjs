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
    
    async redirects() {
        return [
            {
                source: '/Quran_pdf/index.html',
                destination: '/quran-pdf',
                permanent: true, 
            }
        ];
    },
    
    eslint: {
        ignoreDuringBuilds: true,
    },
    
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
