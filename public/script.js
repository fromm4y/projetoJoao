// Chatbot
const botaoChat = document.getElementById("btnAbrirChatbot");
const dfMessenger = document.querySelector("df-messenger");

botaoChat.addEventListener("click", () => {
    dfMessenger.classList.toggle("aberto");
    dfMessenger.setAttribute("opened", dfMessenger.classList.contains("aberto"));
});

// pequena função para escapar HTML de entrada do usuário
function escapeHtml(str) {
  return str.replace(/[&<>"'\/]/g, function (s) {
    const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;' };
    return map[s];
  });
}
// ----------------- Variáveis globais -----------------
let stream = null;
let modelosCarregados = false;

// Elementos DOM
document.addEventListener("DOMContentLoaded", () => {
const abrirIA = document.getElementById('abrirIA');
const cameraModal = document.getElementById('cameraModal');
const fecharModal = document.getElementById('fecharModal');
const video = document.getElementById('video');
const tirarFoto = document.getElementById('tirarFoto');
const fotoCanvas = document.getElementById('fotoCanvas');
const modalStatus = document.getElementById('modalStatus');

// ----------------- Carregar modelos -----------------
async function carregarModelos() {
  if (modelosCarregados) return;
  modalStatus.innerText = 'Carregando modelos...';
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/models');
    modelosCarregados = true;
    modalStatus.innerText = 'Modelos carregados.';
  } catch (err) {
    console.error('Erro carregando modelos:', err);
    modalStatus.innerText = 'Erro ao carregar modelos. Veja console.';
  }
}

// ----------------- Abrir modal e ativar câmera -----------------
abrirIA.addEventListener('click', async () => {
  cameraModal.style.display = 'flex';
  cameraModal.setAttribute('aria-hidden', 'false');
  modalStatus.innerText = 'Carregando...';
  await carregarModelos();

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640 } });
    video.srcObject = stream;
    await video.play();
    modalStatus.innerText = 'Câmera ativa. Posicione seu rosto e clique em 📸';
  } catch (err) {
    console.error('Erro ao acessar a câmera:', err);
    modalStatus.innerText = 'Não foi possível acessar a câmera.';
  }
});

// ----------------- Fechar modal e parar câmera -----------------
fecharModal.addEventListener('click', () => {
  pararCamera();
  cameraModal.style.display = 'none';
  cameraModal.setAttribute('aria-hidden', 'true');
  modalStatus.innerText = 'Aguardando...';
});

// ----------------- Parar câmera -----------------
function pararCamera() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  video.srcObject = null;
}

// ----------------- Tirar foto, enviar para backend e detectar emoção -----------------
tirarFoto.addEventListener('click', async () => {
  if (!video || video.readyState < 2) {
    modalStatus.innerText = 'Vídeo não pronto. Tente novamente.';
    return;
  }

  // Desenha no canvas
  fotoCanvas.width = video.videoWidth || 640;
  fotoCanvas.height = video.videoHeight || 480;
  const ctx = fotoCanvas.getContext('2d');
  ctx.drawImage(video, 0, 0, fotoCanvas.width, fotoCanvas.height);

  modalStatus.innerText = 'Enviando foto para processamento...';

  // Para a câmera e fecha modal
  pararCamera();
  cameraModal.style.display = 'none';
  cameraModal.setAttribute('aria-hidden', 'true');

  // Converte canvas em blob para envio
  fotoCanvas.toBlob(async (blob) => {
    if (!blob) {
      modalStatus.innerText = 'Erro ao capturar a foto.';
      return;
    }

    const formData = new FormData();
    formData.append('foto', blob, 'foto.png');

    try {
      const response = await fetch(`${window.location.origin}/processar-foto`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.facesEncontradas === 0) {
        modalStatus.innerText = 'Nenhuma face detectada na foto.';
        return;
      }

      // Salva imagem no sessionStorage para página de resultado
      const dataUrl = fotoCanvas.toDataURL('image/png');
      sessionStorage.setItem('ultimaFoto', dataUrl);

      // Redireciona para a página resultado com emoção e confiança
      const emocao = data.emocao || 'neutral';
      const confianca = data.confianca || 0;
      window.location.href = `resultado.html?emocao=${encodeURIComponent(emocao)}&conf=${encodeURIComponent(confianca)}`;

    } catch (err) {
      modalStatus.innerText = 'Erro ao enviar foto para o servidor.';
      console.error('Erro fetch:', err);
    }
  }, 'image/png');
});
});

    /* ===========================
       SCRIPT (Salvar como script.js)
       ===========================
       TODO: Integrar com backend / ESP32-CAM quando disponível.
    */

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const root = document.documentElement;

    function setLightTheme(on){
      if(on){
        root.classList.add('light');
        themeToggle.setAttribute('aria-pressed','true');
        themeToggle.textContent = '🌞';
      } else {
        root.classList.remove('light');
        themeToggle.setAttribute('aria-pressed','false');
        themeToggle.textContent = '🌗';
      }
      // Persist preference (local)
      try { localStorage.setItem('blueThemeLight', on ? '1' : '0'); } catch(e){}
    }

    themeToggle.addEventListener('click', () => {
      const isLight = root.classList.contains('light');
      setLightTheme(!isLight);
    });

    // Initialize theme from storage
    try {
      const pref = localStorage.getItem('blueThemeLight');
      if(pref === '1') setLightTheme(true);
      else setLightTheme(false);
    } catch(e){ setLightTheme(false); }

    // Footer year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Back to top
    document.getElementById('backToTop').addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Keyboard accessibility: ESC to close chatbot
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape'){
        if(panel.classList.contains('open')) abrirChatbot();
      }
    });

    // Smooth in-view animations (simple fade-in)
    document.addEventListener('DOMContentLoaded', () => {
      const els = document.querySelectorAll('main section, .card, .curio, .thumb');
      els.forEach((el, i) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        setTimeout(() => {
          el.style.transition = 'opacity 700ms ease, transform 700ms ease';
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 80 * i);
      });
    });

    // TODO: pontos para personalização:
    // - Alterar textos do hero, imagens, fontes e cores conforme o tema do time.
    // - Conectar o reconhecimento facial ao hardware/servidor quando pronto.
