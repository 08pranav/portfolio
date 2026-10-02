/** Runs blocking in <head> so the theme is set before first paint. */
export const THEME_KEY = "theme";

/** A saved visitor choice wins; otherwise the editor's default theme; "system" leaves it to the OS. */
export const themeScript = (defaultTheme: "system" | "light" | "dark") =>
  `(function(){var d=document.documentElement;d.classList.add('js');var t=null;try{t=localStorage.getItem('${THEME_KEY}')}catch(e){}if(t!=='light'&&t!=='dark')t=${JSON.stringify(defaultTheme)};if(t==='light'||t==='dark')d.setAttribute('data-theme',t)})()`;
