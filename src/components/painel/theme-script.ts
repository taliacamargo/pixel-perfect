export const THEME_STORAGE_KEY = "painel-tema";

// Roda no <head>, antes da página aparecer, para não piscar no tema errado.
// Sem escolha salva, segue o tema do sistema.
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";var d=document.documentElement;d.classList.remove("light","dark");d.classList.add(t);d.dataset.theme=t;}catch(e){}})()`;
