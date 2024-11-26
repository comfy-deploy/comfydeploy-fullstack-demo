// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['comfy-deploy-output.s3.amazonaws.com'], // Agrega el dominio aquí
  },
  webpack: (config, { isServer }) => {
    // Alias 'react-konva' para usar la versión core
    config.resolve.alias['react-konva'] = 'react-konva/lib/ReactKonvaCore';

    if (isServer) {
      // Asegurarse de que 'externals' está definido
      config.externals = config.externals || [];
      // Excluir 'konva' y 'canvas' del build del servidor
      config.externals.push({
        konva: 'konva',
        canvas: 'canvas',
      });
    }

    return config;
  },
};

module.exports = nextConfig;
