// /blocks/download/download.js
export default function decorate(block) {
  const url = block.querySelector('a')?.href;
  if (!url) return;
  const btn = document.createElement('a');
  btn.href = url;
  btn.textContent = 'Descargar';
  btn.className = 'button download';
  // Fuerza descarga del binario en navegadores compatibles
  btn.setAttribute('download', '');
  // Accesibilidad
  btn.setAttribute('aria-label', 'Descargar recurso');
  block.innerHTML = '';
  block.appendChild(btn);
}
