export default function decorate(block) {
  const imgCell = block.querySelector('img');
  const link = block.querySelector('a');
  
  const container = document.createElement('div');
  container.className = 'card-download';

  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'image';
  imgWrapper.appendChild(imgCell);

  const btn = document.createElement('a');
  btn.href = link.href;
  btn.textContent = 'Descargar';
  btn.className = 'button download';
  btn.setAttribute('download', '');

  const btnWrapper = document.createElement('div');
  btnWrapper.className = 'actions';
  btnWrapper.appendChild(btn);

  container.append(imgWrapper, btnWrapper);
  block.innerHTML = '';
  block.appendChild(container);
}
