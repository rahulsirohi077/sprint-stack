import type { NextConfig } from "next";

const appwriteEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;

const appwriteRemotePattern = (() => {
  if (!appwriteEndpoint) return null;

  try {
    const endpointUrl = new URL(appwriteEndpoint);
    const basePath = endpointUrl.pathname.replace(/\/$/, "");

    return {
      protocol: endpointUrl.protocol.replace(":", "") as "http" | "https",
      hostname: endpointUrl.hostname,
      port: endpointUrl.port,
      pathname: `${basePath}/storage/**`,
    };
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: appwriteRemotePattern ? [appwriteRemotePattern] : [],
  },
};

export default nextConfig;
