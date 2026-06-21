import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	experimental: {
		turbopackFileSystemCacheForDev: false,
	},
	turbopack: {
		root: process.cwd(),
		rules: {
			"*.svg": {
				loaders: [
					{
						loader: "@svgr/webpack",
						options: {
							icon: true,
						},
					},
				],
				as: "*.js",
			},
		},
	},
};

export default nextConfig;
