/** Runs blocking in <head> so the theme and the loader decision are made before first paint. */
export const THEME_KEY = "theme";

/**
 * - Theme: a saved visitor choice wins; otherwise the editor's default; "system" leaves it to the OS.
 * - `anim`: motion niceties (heading reveals) only for people and not for crawlers or reduced motion, so content is
 *   always visible to them.
 * - `show-loader`: only on the home page, only the first visit in a browser session, never for crawlers, audits
 *   or reduced motion, and only if the editor switched the opening animation on.
 */
export const themeScript = (defaultTheme: "system" | "light" | "dark", loaderEnabled: boolean) =>
  `(function(){var d=document.documentElement;d.classList.add('js');var t=null;try{t=localStorage.getItem('${THEME_KEY}')}catch(e){}if(t!=='light'&&t!=='dark')t=${JSON.stringify(defaultTheme)};if(t==='light'||t==='dark')d.setAttribute('data-theme',t);var rm=matchMedia('(prefers-reduced-motion: reduce)').matches;var bot=navigator.webdriver||/bot|crawl|spider|slurp|lighthouse|pagespeed|headless|prerender|gtmetrix|facebookexternalhit|whatsapp|linkedinbot|twitterbot/i.test(navigator.userAgent);if(!rm&&!bot){d.classList.add('anim');if(${loaderEnabled ? "true" : "false"}&&location.pathname==='/'){try{if(!sessionStorage.getItem('pk-loader')){sessionStorage.setItem('pk-loader','1');d.classList.add('show-loader')}}catch(e){d.classList.add('show-loader')}}}})()`;
