/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',        // App Router sayfalarınız
    './components/**/*.{js,ts,jsx,tsx}',  // Varsa burada
    '../../packages/ui/**/*.{js,ts,jsx,tsx}' // Monorepo’daki ortak UI paketi
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
// Tailwind CSS yapılandırma dosyası
// Bu dosya Tailwind CSS'in hangi dosyaları tarayacağını ve tema ayarlarını içerir.
// `content` dizisi, Tailwind CSS'in hangi dosyaları tarayacağını belirtir.
// `theme` kısmında ise Tailwind CSS'in tema ayarlarını genişletebilirsiniz