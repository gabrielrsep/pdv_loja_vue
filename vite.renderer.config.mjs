import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config
export default defineConfig({
    plugins: [
        svgr({
            include: 'src/assets/**/*.svg',
            svgrOptions: {
                icon: true,
            }
        }),
        tailwindcss(),
        vue(),
    ]
});
