/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/admin/curso", destination: "/admin/cursos", permanent: true },
      { source: "/admin/course", destination: "/admin/cursos", permanent: true },
      { source: "/cursos", destination: "/curso", permanent: true },
    ];
  },
};
module.exports = nextConfig;
