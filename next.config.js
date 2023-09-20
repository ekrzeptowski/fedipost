/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                net: false,
                tls: false,
                dns: false,
                zlib: false,
                stream: require.resolve('stream-browserify'),
                events: require.resolve('events/'),
                buffer: require.resolve('buffer/'),
                url: require.resolve('url/'),
                http: require.resolve('stream-http'),
                https: require.resolve('https-browserify'),
                crypto: require.resolve('crypto-browserify'),
                querystring: require.resolve('querystring-es3'),
                os: require.resolve('os-browserify/browser'),
                assert: require.resolve('assert/')
            }
        }
        return config
    }
}

module.exports = nextConfig
