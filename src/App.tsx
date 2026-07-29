/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';

interface LetraAtiva {
  id: string;
  char: string;
  x: number; // Porcentagem de 5 a 95
  y: number; // Pixels do topo ao fundo
  vel: number;
}

interface Particula {
  id: string;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  size: number;
}

interface PopupPonto {
  id: string;
  x: number;
  y: number;
  text: string;
}

const vogais = ['A', 'E', 'I', 'O', 'U'];
const numeros = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

interface PalavraObj {
  palavra: string;
  emoji: string;
  som: string;
}

const palavrasEstagio4: PalavraObj[] = [
  { palavra: 'GATO', emoji: '🐈', som: 'gato' },
  { palavra: 'CÃO', emoji: '🐕', som: 'cão' },
  { palavra: 'SAPO', emoji: '🐸', som: 'sapo' },
  { palavra: 'VACA', emoji: '🐄', som: 'vaca' },
  { palavra: 'LEÃO', emoji: '🦁', som: 'leão' },
  { palavra: 'RATO', emoji: '🐀', som: 'rato' },
  { palavra: 'PEIXE', emoji: '🐟', som: 'peixe' },
  { palavra: 'PATO', emoji: '🦆', som: 'pato' },
  { palavra: 'SOL', emoji: '☀️', som: 'sol' },
  { palavra: 'CASA', emoji: '🏠', som: 'casa' },
  { palavra: 'BOLA', emoji: '⚽', som: 'bola' },
  { palavra: 'UVA', emoji: '🍇', som: 'uva' },
  { palavra: 'MAÇÃ', emoji: '🍎', som: 'maçã' },
  { palavra: 'BOLO', emoji: '🍰', som: 'bolo' },
];

const coresLetras: { [key: string]: { bg: string; text: string; border: string; shadow: string } } = {
  'A': { bg: 'bg-rose-400', text: 'text-rose-950', border: 'border-rose-600', shadow: 'shadow-rose-300' },
  'E': { bg: 'bg-amber-400', text: 'text-amber-950', border: 'border-amber-600', shadow: 'shadow-amber-300' },
  'I': { bg: 'bg-emerald-400', text: 'text-emerald-950', border: 'border-emerald-600', shadow: 'shadow-emerald-300' },
  'O': { bg: 'bg-sky-400', text: 'text-sky-950', border: 'border-sky-600', shadow: 'shadow-sky-300' },
  'U': { bg: 'bg-indigo-400', text: 'text-indigo-950', border: 'border-indigo-600', shadow: 'shadow-indigo-300' },
  '1': { bg: 'bg-rose-400', text: 'text-rose-950', border: 'border-rose-600', shadow: 'shadow-rose-300' },
  '2': { bg: 'bg-orange-400', text: 'text-orange-950', border: 'border-orange-600', shadow: 'shadow-orange-300' },
  '3': { bg: 'bg-amber-400', text: 'text-amber-950', border: 'border-amber-600', shadow: 'shadow-amber-300' },
  '4': { bg: 'bg-emerald-400', text: 'text-emerald-950', border: 'border-emerald-600', shadow: 'shadow-emerald-300' },
  '5': { bg: 'bg-teal-400', text: 'text-teal-950', border: 'border-teal-600', shadow: 'shadow-teal-300' },
  '6': { bg: 'bg-sky-400', text: 'text-sky-950', border: 'border-sky-600', shadow: 'shadow-sky-300' },
  '7': { bg: 'bg-indigo-400', text: 'text-indigo-950', border: 'border-indigo-600', shadow: 'shadow-indigo-300' },
  '8': { bg: 'bg-purple-400', text: 'text-purple-950', border: 'border-purple-600', shadow: 'shadow-purple-300' },
  '9': { bg: 'bg-pink-400', text: 'text-pink-950', border: 'border-pink-600', shadow: 'shadow-pink-300' },
};

const coresSortidas = [
  { bg: 'bg-pink-400', border: 'border-pink-600', text: 'text-pink-950', shadow: 'shadow-pink-300' },
  { bg: 'bg-purple-400', border: 'border-purple-600', text: 'text-purple-950', shadow: 'shadow-purple-300' },
  { bg: 'bg-orange-400', border: 'border-orange-600', text: 'text-orange-950', shadow: 'shadow-orange-300' },
  { bg: 'bg-lime-400', border: 'border-lime-600', text: 'text-lime-950', shadow: 'shadow-lime-300' },
  { bg: 'bg-teal-400', border: 'border-teal-600', text: 'text-teal-950', shadow: 'shadow-teal-300' },
  { bg: 'bg-fuchsia-400', border: 'border-fuchsia-600', text: 'text-fuchsia-950', shadow: 'shadow-fuchsia-300' }
];

export default function App() {
  const [estagio, setEstagio] = useState<number>(1); // 1 = Vogais, 2 = A-Z
  const [pontos, setPontos] = useState<number>(0);
  const [recorde, setRecorde] = useState<number>(() => {
    return parseInt(localStorage.getItem('typing_kids_high_score') || '0', 10);
  });
  const [letras, setLetras] = useState<LetraAtiva[]>([]);
  const [iniciado, setIniciado] = useState<boolean>(false);
  const [somAtivo, setSomAtivo] = useState<boolean>(false);
  const [mascoteMood, setMascoteMood] = useState<'padrao' | 'acerto' | 'erro' | 'alerta'>('padrao');
  const [teclaPressionada, setTeclaPressionada] = useState<string | null>(null);
  const [particulas, setParticulas] = useState<Particula[]>([]);
  const [popups, setPopups] = useState<PopupPonto[]>([]);
  const [pausado, setPausado] = useState<boolean>(false);
  const [telaCheia, setTelaCheia] = useState<boolean>(false);

  // Estados do Robozinho Autônomo IA (Auto-Pilot / Predição por Tensores)
  const [roboAtivo, setRoboAtivo] = useState<boolean>(false);
  const [roboStatus, setRoboStatus] = useState<'desligado' | 'carregando' | 'jogando'>('desligado');
  const [delayRespostaRoboMs, setDelayRespostaRoboMs] = useState<number>(450);
  const [acuraciaRoboPercentual, setAcuraciaRoboPercentual] = useState<number>(92);
  const [historicoPredicoes, setHistoricoPredicoes] = useState<Array<{
    id: string;
    char: string;
    score: string;
    x: number;
    y: number;
    bbox: number[];
    tensorTimeMs: string;
    timestamp: string;
  }>>([]);
  const [statsRobo, setStatsRobo] = useState({
    totalAcertos: 0,
    mediaConfianca: 96.5,
    ultimoChar: '',
    ultimoScore: '0',
    latenciaMs: '4.8',
    ultimoBbox: '[0, 0, 0, 0]'
  });

  // Refs de tempo, worker e áudio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const loopRef = useRef<number | null>(null);
  const ultimoSpawnRef = useRef<number>(0);
  const mascotTimerRef = useRef<NodeJS.Timeout | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const roboIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const delayRespostaRoboRef = useRef(delayRespostaRoboMs);
  const acuraciaRoboRef = useRef(acuraciaRoboPercentual);

  useEffect(() => {
    delayRespostaRoboRef.current = delayRespostaRoboMs;
  }, [delayRespostaRoboMs]);

  useEffect(() => {
    acuraciaRoboRef.current = acuraciaRoboPercentual;
  }, [acuraciaRoboPercentual]);

  // Determinar limites do palco
  const [alturaPalco, setAlturaPalco] = useState<number>(480);

  useEffect(() => {
    const handleResize = () => {
      if (stageRef.current) {
        const height = stageRef.current.clientHeight;
        setAlturaPalco(height > 100 ? (height - 32) : 480);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Timer para recalcular após a montagem do layout e renderização
    const timer1 = setTimeout(handleResize, 100);
    const timer2 = setTimeout(handleResize, 600);
    const timer3 = setTimeout(handleResize, 1500);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [iniciado]);

  // Inicializa o AudioContext de forma tardia (user gesture)
  const iniciarAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  // Sintetizador de Som Infantil Original
  const tocarSom = (tipo: 'acerto' | 'erro' | 'recorde') => {
    if (!somAtivo) return;
    iniciarAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    try {
      if (tipo === 'acerto') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (tipo === 'erro') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220.00, ctx.currentTime); // A3
        osc.frequency.linearRampToValueAtTime(110.00, ctx.currentTime + 0.25); // A2
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (tipo === 'recorde') {
        const notas = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notas.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, ctx.currentTime + (idx * 0.1));
          g.gain.setValueAtTime(0.1, ctx.currentTime + (idx * 0.1));
          g.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + (idx * 0.1) + 0.25);
          o.start(ctx.currentTime + (idx * 0.1));
          o.stop(ctx.currentTime + (idx * 0.1) + 0.25);
        });
      }
    } catch (e) {
      console.warn('Falha áudio:', e);
    }
  };

  const mudarHumor = (mood: 'padrao' | 'acerto' | 'erro' | 'alerta') => {
    setMascoteMood(mood);
    if (mascotTimerRef.current) clearTimeout(mascotTimerRef.current);
    if (mood === 'acerto' || mood === 'erro') {
      mascotTimerRef.current = setTimeout(() => {
        setMascoteMood('padrao');
      }, 700);
    }
  };

  const alternarSom = () => {
    const novoSom = !somAtivo;
    setSomAtivo(novoSom);
    if (novoSom) {
      // Pequeno som inicial para confirmar que está ativo
      setTimeout(() => {
        iniciarAudio();
        // tocar som de acerto
        const ctx = audioCtxRef.current;
        if (ctx) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          gain.gain.setValueAtTime(0.05, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.start(); osc.stop(ctx.currentTime + 0.15);
        }
      }, 50);
    }
  };

  const alternarPlayPause = () => {
    if (iniciado) {
      setIniciado(false);
      setPausado(true);
    } else {
      iniciarAudio();
      setIniciado(true);
      setPausado(false);
      setSomAtivo(true);
      tocarSom('acerto');
    }
  };

  const alternarTelaCheia = () => {
    const doc = window.document;
    const docEl = doc.documentElement;

    const requestFullScreen = docEl.requestFullscreen || (docEl as any).mozRequestFullScreen || (docEl as any).webkitRequestFullScreen || (docEl as any).msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || (doc as any).mozCancelFullScreen || (doc as any).webkitExitFullscreen || (doc as any).msExitFullscreen;

    try {
      if (!doc.fullscreenElement && !(doc as any).mozFullScreenElement && !(doc as any).webkitFullscreenElement && !(doc as any).msFullscreenElement) {
        if (requestFullScreen) {
          requestFullScreen.call(docEl);
          setTelaCheia(true);
        }
      } else {
        if (cancelFullScreen) {
          cancelFullScreen.call(doc);
          setTelaCheia(false);
        }
      }
    } catch (e) {
      console.warn("Fullscreen API not fully supported or blocked in current frame context:", e);
    }
  };

  // Lógica de digitacão acertada (funciona para clique e teclado físico)
  const falarLetra = (letra: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Parar fala anterior

      let texto = letra.toLowerCase();
      // Ajustar som para letra "o" soar como "ó" (perfeito para alfabetização de crianças brasileiras)
      if (texto === 'o') {
        texto = 'ó';
      }

      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8; // Velocidade bem devagar, pausada e nítida para crianças
      utterance.pitch = 1.25; // Voz infantil divertida

      // Tentar fixar uma das vozes em português
      const vozes = window.speechSynthesis.getVoices();
      const vozPt = vozes.find(v => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt_BR'));
      if (vozPt) {
        utterance.voice = vozPt;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const falarPalavra = (palavra: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Parar fala anterior

      const texto = palavra.toLowerCase();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8; // Velocidade bem devagar e pausada para fala de palavras
      utterance.pitch = 1.35; // Voz um tiquinho mais infantil/divertida

      const vozes = window.speechSynthesis.getVoices();
      const vozPt = vozes.find(v => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt_BR'));
      if (vozPt) {
        utterance.voice = vozPt;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const processarDerrubadaLetra = (char: string, clientX?: number, clientY?: number) => {
    setLetras(prev => {
      // Encontrar letra com maior Y (mais em perigo)
      let melhorIdx = -1;
      let maxY = -9999;
      for (let i = 0; i < prev.length; i++) {
        if (prev[i].char === char && prev[i].y > maxY) {
          maxY = prev[i].y;
          melhorIdx = i;
        }
      }

      if (melhorIdx !== -1) {
        const letraMatch = prev[melhorIdx];

        // Calcular posições de tela aproximadas para as partículas
        const posX = stageRef.current ? (letraMatch.x / 100) * stageRef.current.clientWidth : 150;
        const posY = letraMatch.y + 30;

        // Disparar explosão de confete
        triggerParticulas(posX, posY);
        triggerPopup(posX, posY, '+10');

        tocarSom('acerto');
        mudarHumor('acerto');

        // Atualizar pontuação e recorde
        setPontos(p => {
          const novaPontuacao = p + 10;
          if (novaPontuacao > recorde) {
            setRecorde(novaPontuacao);
            localStorage.setItem('typing_kids_high_score', novaPontuacao.toString());
            // Recorde batido barulho alegre retro
            if (novaPontuacao % 50 === 0) tocarSom('recorde');
          }
          return novaPontuacao;
        });

        return prev.filter((_, idx) => idx !== melhorIdx);
      } else {
        mudarHumor('alerta');
        return prev;
      }
    });
  };

  const processarDerrubadaRobo = (targetId: string, char: string, rawX?: number, rawY?: number) => {
    if (!iniciado || !roboAtivo) {
      return;
    }

    setLetras(prev => {
      let letraMatch = prev.find(l => l.id === targetId);
      if (!letraMatch) {
        const candidates = prev.filter(l => l.char === char);
        if (candidates.length > 0) {
          letraMatch = candidates.reduce((max, cur) => cur.y > max.y ? cur : max, candidates[0]);
        }
      }

      if (letraMatch) {
        const matchId = letraMatch.id;
        const stageWidth = stageRef.current ? stageRef.current.clientWidth : 400;
        const posX = (letraMatch.x / 100) * stageWidth;
        const posY = letraMatch.y + 30;

        triggerParticulas(posX, posY);
        triggerPopup(posX, posY, '+10 🤖');

        tocarSom('acerto');
        mudarHumor('acerto');

        setPontos(p => {
          const novaPontuacao = p + 10;
          if (novaPontuacao > recorde) {
            setRecorde(novaPontuacao);
            localStorage.setItem('typing_kids_high_score', novaPontuacao.toString());
            if (novaPontuacao % 50 === 0) tocarSom('recorde');
          }
          return novaPontuacao;
        });

        return prev.filter(l => l.id !== matchId);
      } else {
        mudarHumor('alerta');
        return prev;
      }
    });
  };

  const normalizarNumero = (value: unknown, fallback: number) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return fallback;
  };

  const escolherCharAlternativoRobo = (charAtual: string, estagioAtual: number) => {
    const pool = estagioAtual === 1
      ? vogais
      : estagioAtual === 2
        ? numeros
        : estagioAtual === 3
          ? alfabeto
          : palavrasEstagio4.map(p => p.palavra);

    const alternativas = pool.filter(item => item !== charAtual);
    if (alternativas.length === 0) {
      return charAtual;
    }

    const indice = Math.floor(Math.random() * alternativas.length);
    return alternativas[indice];
  };

  const validarPredicaoRobo = (data: any) => {
    const rawChar = typeof data?.targetChar === 'string' ? data.targetChar.trim().toUpperCase() : '';
    const palavraValida = palavrasEstagio4.some(p => p.palavra === rawChar);
    const charValido =
      (estagio === 1 && vogais.includes(rawChar)) ||
      (estagio === 2 && numeros.includes(rawChar)) ||
      (estagio === 3 && alfabeto.includes(rawChar)) ||
      (estagio === 4 && palavraValida);

    if (!rawChar || !charValido) {
      return null;
    }

    const targetId = typeof data?.targetId === 'string' ? data.targetId.trim() : '';
    if (!targetId || targetId.length > 120) {
      return null;
    }

    const x = normalizarNumero(data?.x, 50);
    const y = normalizarNumero(data?.y, 100);
    const score = normalizarNumero(data?.score, 98);
    const tensorTimeMs = normalizarNumero(data?.tensorTimeMs, 4.8);

    const bbox = Array.isArray(data?.bbox) && data.bbox.length === 4
      ? data.bbox.map((value: unknown) => normalizarNumero(value, 0))
      : [Math.max(0, Math.round(x - 25)), Math.max(0, Math.round(y - 25)), 50, 50];

    return {
      char: rawChar,
      targetId,
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(1000, Math.max(0, y)),
      score: Math.min(100, Math.max(0, score)),
      tensorTimeMs: Math.max(0.1, tensorTimeMs),
      bbox
    };
  };

  // Gerenciamento do Robozinho Autônomo IA com Web Worker TensorFlow.js
  const desativarRobo = () => {
    setRoboAtivo(false);
    setRoboStatus('desligado');
    if (roboIntervalRef.current) {
      clearInterval(roboIntervalRef.current);
      roboIntervalRef.current = null;
    }
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };

  const ativarRobo = () => {
    try {
      setRoboStatus('carregando');
      setRoboAtivo(true);

      // Inicializar Web Worker com modelo TensorFlow.js
      const worker = new Worker('/yolo-worker.js');
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const data = e.data;
        if (data.type === 'robot-action') {
          const predicaoValidada = validarPredicaoRobo(data);
          if (!predicaoValidada) {
            return;
          }

          const { char, targetId, x, y, score, tensorTimeMs, bbox } = predicaoValidada;
          const delayMs = Math.max(0, Math.min(5000, delayRespostaRoboRef.current));
          const acuraciaAtual = Math.max(10, Math.min(100, acuraciaRoboRef.current));
          const scoreAjustado = Math.min(99.9, Math.max(0, score * (acuraciaAtual / 100)));
          const deveErro = acuraciaAtual < 70 && Math.random() < (1 - acuraciaAtual / 100);
          const charExecutado = deveErro ? escolherCharAlternativoRobo(char, estagio) : char;
          const targetIdExecutado = deveErro ? '' : targetId;

          const executarAcaoRobo = () => {
            if (!workerRef.current || !iniciado || !roboAtivo) return;

            // Simular tecla pressionada no teclado virtual
            setTeclaPressionada(charExecutado);
            setTimeout(() => setTeclaPressionada(null), 250);

            // Disparar áudio e derrubada precisa do alvo em queda
            if (charExecutado.length > 1) {
              falarPalavra(charExecutado);
            } else {
              falarLetra(charExecutado);
            }
            processarDerrubadaRobo(targetIdExecutado, charExecutado, x, y);

            // Posições e métricas reais de predição por tensores
            const stageWidth = stageRef.current ? stageRef.current.clientWidth : 400;
            const posX = Math.round((x / 100) * stageWidth);
            const posY = Math.round(y || 100);

            const novaPredicao = {
              id: Math.random().toString(36).substring(2, 9),
              char: charExecutado,
              score: scoreAjustado.toFixed(1),
              x: posX,
              y: posY,
              bbox: bbox || [posX - 25, posY - 25, 50, 50],
              tensorTimeMs: tensorTimeMs.toFixed(1),
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour12: false, minute: '2-digit', second: '2-digit' })
            };

            setHistoricoPredicoes(prev => [novaPredicao, ...prev].slice(0, 7));

            setStatsRobo(prev => {
              const novosAcertos = prev.totalAcertos + 1;
              const confNum = scoreAjustado;
              const mediaAtualizada = ((prev.mediaConfianca * prev.totalAcertos + confNum) / novosAcertos).toFixed(1);
              return {
                totalAcertos: novosAcertos,
                mediaConfianca: parseFloat(mediaAtualizada),
                ultimoChar: charExecutado,
                ultimoScore: scoreAjustado.toFixed(1),
                latenciaMs: tensorTimeMs.toFixed(1),
                ultimoBbox: `[x:${posX}px, y:${posY}px]`
              };
            });
          };

          if (delayMs > 0) {
            setTimeout(executarAcaoRobo, delayMs);
          } else {
            executarAcaoRobo();
          }
        } else if (data.type === 'model-loaded') {
          setRoboStatus('jogando');
        }
      };

      setRoboStatus('jogando');

      // Loop do Robozinho enviando alvos caindo para o Worker
      roboIntervalRef.current = setInterval(() => {
        if (!workerRef.current) return;

        setLetras(currentLetters => {
          if (currentLetters && currentLetters.length > 0) {
            workerRef.current?.postMessage({
              type: 'auto-play-tensor',
              activeLetters: currentLetters,
              stageHeight: alturaPalco,
              estagio
            });
          }
          return currentLetters;
        });
      }, 700);

    } catch (err: any) {
      console.error('Erro ao iniciar Robozinho IA:', err);
      desativarRobo();
    }
  };

  const alternarRobo = () => {
    if (roboAtivo) {
      desativarRobo();
    } else {
      ativarRobo();
    }
  };

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      desativarRobo();
    };
  }, []);

  const triggerParticulas = (x: number, y: number) => {
    const novasParticulas: Particula[] = [];
    const cores = ['#fda4af', '#fcd34d', '#6ee7b7', '#93c5fd', '#c084fc', '#fb923c'];
    for (let i = 0; i < 8; i++) {
      const angulo = (i / 8) * 2 * Math.PI + Math.random() * 0.4;
      const raioDist = 30 + Math.random() * 30;
      novasParticulas.push({
        id: Math.random().toString(),
        x,
        y,
        tx: Math.cos(angulo) * raioDist,
        ty: Math.sin(angulo) * raioDist,
        color: cores[Math.floor(Math.random() * cores.length)],
        size: 8 + Math.random() * 8
      });
    }
    setParticulas(prev => [...prev, ...novasParticulas]);
    setTimeout(() => {
      setParticulas(prev => prev.filter(p => !novasParticulas.find(np => np.id === p.id)));
    }, 600);
  };

  const triggerPopup = (x: number, y: number, text: string) => {
    const id = Math.random().toString();
    setPopups(prev => [...prev, { id, x, y, text }]);
    setTimeout(() => {
      setPopups(prev => prev.filter(p => p.id !== id));
    }, 850);
  };

  const triggerSalpicoAgua = (xPercent: number) => {
    if (!stageRef.current) return;
    const clientX = (xPercent / 100) * stageRef.current.clientWidth;
    const clientY = alturaPalco;

    triggerPopup(clientX, clientY - 10, 'Plop! 💧');
    tocarSom('erro');
    mudarHumor('erro');

    setPontos(p => Math.max(0, p - 5));
  };

  // Gerar letra cadente
  const gerarLetra = () => {
    let char = '';
    if (estagio === 1) {
      char = vogais[Math.floor(Math.random() * vogais.length)];
    } else if (estagio === 2) {
      char = numeros[Math.floor(Math.random() * numeros.length)];
    } else if (estagio === 3) {
      char = alfabeto[Math.floor(Math.random() * alfabeto.length)];
    } else {
      const item = palavrasEstagio4[Math.floor(Math.random() * palavrasEstagio4.length)];
      char = item.palavra;
    }

    const id = 'letra-' + Math.random();
    const xPercent = 8 + Math.random() * 80;
    // Velocidade bem suave para crianças pequenas lerem e acharem as teclas sem pressa
    const baseVel = window.innerWidth < 640 ? 0.45 : 0.65;
    const vel = baseVel + (Math.random() * 0.15);

    setLetras(prev => [
      ...prev,
      { id, char, x: xPercent, y: -60, vel }
    ]);
  };

  // Loop do Game (Physics e Colisões)
  useEffect(() => {
    if (!iniciado) return;

    let ultimoFrame = performance.now();
    const deltaSpawnMin = estagio === 1 ? 3000 : estagio === 2 ? 2800 : estagio === 3 ? 2300 : 3200;

    const gameLoop = (now: number) => {
      const delta = now - ultimoFrame;
      ultimoFrame = now;

      // Movimentação das letras para baixo
      setLetras(prev => {
        const noLimite: LetraAtiva[] = [];
        const filtradas = prev.map(letra => {
          const velocidadeAjustada = letra.vel * (1.0 + Math.floor(pontos / 300) * 0.04);
          const novoY = letra.y + (velocidadeAjustada * (delta / 16.66)); // Sincronizado a 60FPS fictício

          if (novoY >= alturaPalco) {
            noLimite.push(letra);
            return null;
          }
          return { ...letra, y: novoY };
        }).filter(Boolean) as LetraAtiva[];

        // Tratar colisão com água
        if (noLimite.length > 0) {
          noLimite.forEach(l => triggerSalpicoAgua(l.x));
        }

        // Se uma letra estiver quase chegando perto (a 70px da água), dá o alerta do mascote!
        const temGenteProxima = filtradas.some(l => alturaPalco - l.y < 75);
        if (temGenteProxima && mascoteMood === 'padrao') {
          mudarHumor('alerta');
        }

        return filtradas;
      });

      // Gerador de letra baseado no tempo
      if (now - ultimoSpawnRef.current > deltaSpawnMin) {
        gerarLetra();
        ultimoSpawnRef.current = now;
      }

      loopRef.current = requestAnimationFrame(gameLoop);
    };

    ultimoSpawnRef.current = performance.now();
    loopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [iniciado, estagio, alturaPalco, pontos, mascoteMood]);

  // Teclado físico do notebook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!iniciado) return;
      const key = e.key.toUpperCase();

      if (key === ' ' || (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
        e.preventDefault();
      }

      if (estagio === 1) {
        if (vogais.includes(key)) {
          setTeclaPressionada(key);
          setTimeout(() => setTeclaPressionada(null), 120);
          falarLetra(key);
          processarDerrubadaLetra(key);
        }
      } else if (estagio === 2) {
        if (numeros.includes(key)) {
          setTeclaPressionada(key);
          setTimeout(() => setTeclaPressionada(null), 120);
          falarLetra(key);
          processarDerrubadaLetra(key);
        }
      } else if (estagio === 3) {
        if (alfabeto.includes(key)) {
          setTeclaPressionada(key);
          setTimeout(() => setTeclaPressionada(null), 120);
          falarLetra(key);
          processarDerrubadaLetra(key);
        }
      } else if (estagio === 4) {
        if (alfabeto.includes(key)) {
          setTeclaPressionada(key);
          setTimeout(() => setTeclaPressionada(null), 120);
          const matchWord = palavrasEstagio4.find(p => p.palavra.startsWith(key));
          if (matchWord) {
            falarPalavra(matchWord.palavra);
            processarDerrubadaLetra(matchWord.palavra);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [iniciado, estagio, alturaPalco]);

  const obterEstiloMascote = () => {
    // Retorna atributos dos olhos e boquinha dinamicamente
    switch (mascoteMood) {
      case 'acerto':
        return {
          mouth: 'M 30,55 Q 50,85 70,55', // Sorriso rasgado feliz
          eyeY: '45',
          scale: 'scale-[1.15] rotate-3',
        };
      case 'erro':
        return {
          mouth: 'M 35,68 Q 50,52 65,68', // Biquinho de triste
          eyeY: '45',
          scale: 'translate-y-1',
        };
      case 'alerta':
        return {
          mouth: 'M 42,60 Q 50,60 58,60', // Boca circular preocupado
          eyeY: '42',
          scale: 'scale-[1.04]',
        };
      default:
        return {
          mouth: 'M 35,58 Q 50,72 65,58', // Sorriso fofinho
          eyeY: '45',
          scale: 'scale-100',
        };
    }
  };

  const configMascote = obterEstiloMascote();

  // Definir cor das letras
  const obterEstilosLetra = (char: string) => {
    if (coresLetras[char]) return coresLetras[char];
    // Hash simples para as outras letras do alfabeto
    const hashIdx = char.charCodeAt(0) % coresSortidas.length;
    return coresSortidas[hashIdx];
  };

  const mudarNivel = (idx: number) => {
    setEstagio(idx);
    setLetras([]);
    tocarSom('acerto');
    mudarHumor('acerto');
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col p-4 md:p-6 justify-between gap-3 max-w-5xl mx-auto select-none"
      id="app"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      
      {/* CABEÇALHO DO JOGO */}
      <header className="bg-white rounded-3xl p-4 shadow-xl border-4 border-emerald-400 flex flex-wrap items-center justify-between gap-4 z-40 bg-opacity-95">
        <div className="flex items-center gap-3">
          {/* Mascote Dinâmico SVG */}
          <div className="w-16 h-16 bg-amber-100 rounded-full border-4 border-amber-400 flex items-center justify-center shadow-md relative overflow-hidden">
            <svg 
              viewBox="0 0 100 100" 
              className={`w-full h-full p-1 transition-all duration-150 ${configMascote.scale}`}
            >
              <ellipse cx="25" cy="55" rx="10" ry="6" fill="#fca5a5" opacity="0.6"/>
              <ellipse cx="75" cy="55" rx="10" ry="6" fill="#fca5a5" opacity="0.6"/>
              <g>
                <circle cx="35" cy={configMascote.eyeY} r="8" fill="#1e293b"/>
                <circle cx="65" cy={configMascote.eyeY} r="8" fill="#1e293b"/>
                <circle cx="32" cy={parseFloat(configMascote.eyeY) - 3} r="3" fill="#ffffff"/>
                <circle cx="62" cy={parseFloat(configMascote.eyeY) - 3} r="3" fill="#ffffff"/>
              </g>
              <path 
                d={configMascote.mouth} 
                fill="none" 
                stroke="#1e293b" 
                strokeWidth="6" 
                strokeLinecap="round"
                className="transition-all duration-150"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-title font-extrabold text-emerald-600 tracking-tight leading-none">
              Letrinhas Caindo!
            </h1>
            <p className="text-xs md:text-sm font-cartoon text-slate-500 mt-1">Super divertido digitação infantil ✨</p>
          </div>
        </div>

        {/* Níveis do Estágio */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-300 gap-1 flex-wrap justify-center sm:flex-nowrap">
          <button 
            onClick={() => mudarNivel(1)} 
            className={`px-3 py-2 md:px-4 md:py-2 rounded-xl font-title font-bold text-xs md:text-sm cursor-pointer transform active:scale-95 transition-all ${
              estagio === 1 
                ? 'bg-emerald-400 text-white shadow-md border-b-4 border-emerald-600' 
                : 'text-slate-600 hover:text-emerald-600 bg-transparent'
            }`}
          >
            🅰️ Estágio 1 (Vogais)
          </button>
          <button 
            onClick={() => mudarNivel(2)} 
            className={`px-3 py-2 md:px-4 md:py-2 rounded-xl font-title font-bold text-xs md:text-sm cursor-pointer transform active:scale-95 transition-all ${
              estagio === 2 
                ? 'bg-emerald-400 text-white shadow-md border-b-4 border-emerald-600' 
                : 'text-slate-600 hover:text-emerald-600 bg-transparent'
            }`}
          >
            🔢 Estágio 2 (Números 1-9)
          </button>
          <button 
            onClick={() => mudarNivel(3)} 
            className={`px-3 py-2 md:px-4 md:py-2 rounded-xl font-title font-bold text-xs md:text-sm cursor-pointer transform active:scale-95 transition-all ${
              estagio === 3 
                ? 'bg-emerald-400 text-white shadow-md border-b-4 border-emerald-600' 
                : 'text-slate-600 hover:text-emerald-600 bg-transparent'
            }`}
          >
            🔠 Estágio 3 (A-Z)
          </button>
          <button 
            onClick={() => mudarNivel(4)} 
            className={`px-3 py-2 md:px-4 md:py-2 rounded-xl font-title font-bold text-xs md:text-sm cursor-pointer transform active:scale-95 transition-all ${
              estagio === 4 
                ? 'bg-emerald-400 text-white shadow-md border-b-4 border-emerald-600' 
                : 'text-slate-600 hover:text-emerald-600 bg-transparent'
            }`}
          >
            🐼 Estágio 4 (Palavras)
          </button>
        </div>

        {/* Placar */}
        <div className="flex items-center gap-4 bg-amber-50 px-4 py-2 rounded-2xl border-2 border-amber-300">
          <div className="text-center">
            <div className="text-2xl font-title font-extrabold text-amber-600 leading-none">
              {pontos < 10 ? '00' + pontos : pontos < 100 ? '0' + pontos : pontos}
            </div>
            <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mt-0.5">Pontos</div>
          </div>
          <div className="w-px h-8 bg-amber-200"></div>
          <div className="text-center">
            <div className="text-lg font-title font-bold text-indigo-500 leading-none">{recorde}</div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide mt-0.5">Melhor</div>
          </div>
        </div>
      </header>

      {/* PALCO CENTRAL DE QUEDA */}
      <section 
        ref={stageRef}
        className="flex-1 bg-sky-100 rounded-3xl border-4 border-sky-400 relative overflow-hidden shadow-inner flex flex-col justify-end min-h-[320px]"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Nuvens decorativas de fundo */}
        <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
          <svg className="absolute top-[10%] left-[8%] w-16 md:w-24 text-white fill-current" viewBox="0 0 100 100">
            <path d="M 20,40 A 15,15 0 0,1 50,40 A 20,20 0 0,1 85,50 A 15,15 0 0,1 70,70 L 20,70 A 12,12 0 0,1 20,40" />
          </svg>
          <svg className="absolute top-[25%] right-[12%] w-24 md:w-32 text-white fill-current" viewBox="0 0 100 100">
            <path d="M 20,40 A 15,15 0 0,1 50,40 A 20,20 0 0,1 85,50 A 15,15 0 0,1 70,70 L 20,70 A 12,12 0 0,1 20,40" transform="scale(-1, 1) translate(-100, 0)"/>
          </svg>
          <svg className="absolute top-[55%] left-[40%] w-12 md:w-20 text-white fill-current" viewBox="0 0 100 100">
            <path d="M 20,40 A 15,15 0 0,1 50,40 A 20,20 0 0,1 85,50 A 15,15 0 0,1 70,70 L 20,70 A 12,12 0 0,1 20,40" />
          </svg>
        </div>

        {/* Letras em Queda */}
        <div className="absolute inset-0 z-10">
          {letras.map((letra) => {
            const estilo = obterEstilosLetra(letra.char);
            const tamanho = window.innerWidth < 640 ? 54 : 68;
            
            const isEstagio4 = estagio === 4;
            const match = palavrasEstagio4.find(p => p.palavra === letra.char);
            const displayText = isEstagio4 && match ? `${match.emoji} ${letra.char}` : letra.char;

            return (
              <div
                key={letra.id}
                onClick={() => {
                  if (roboAtivo) {
                    falarLetra(letra.char);
                    processarDerrubadaRobo(letra.id, letra.char, letra.x, letra.y);
                  }
                }}
                className={`absolute select-none flex items-center justify-center font-bold font-title tracking-tight rounded-full border-4 shadow-lg bubble-letter ${
                  roboAtivo 
                    ? 'pointer-events-auto cursor-pointer hover:scale-110 active:scale-95 border-purple-400 animate-pulse' 
                    : 'pointer-events-none'
                } ${estilo.bg} ${estilo.border} ${estilo.text} ${isEstagio4 ? 'px-4 gap-1' : ''}`}
                style={{
                  height: `${tamanho}px`,
                  width: isEstagio4 ? undefined : `${tamanho}px`,
                  minWidth: isEstagio4 ? `${tamanho * 1.8}px` : undefined,
                  fontSize: isEstagio4 ? `${tamanho * 0.35}px` : `${tamanho * 0.58}px`,
                  left: `calc(${letra.x}% - ${tamanho / 2}px)`,
                  top: `${letra.y}px`
                }}
              >
                {displayText}
              </div>
            );
          })}

          {/* Renderização de Partículas de Estouros */}
          {particulas.map((p) => (
            <div
              key={p.id}
              className="absolute pointer-events-none rounded-full"
              style={{
                background: p.color,
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${p.x - p.size / 2}px`,
                top: `${p.y - p.size / 2}px`,
                transform: 'translate(0, 0)',
                animation: 'burst 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
                '--tx': `${p.tx}px`,
                '--ty': `${p.ty}px`
              } as any}
            />
          ))}

          {/* Renderização de Popups de Pontos */}
          {popups.map((pop) => (
            <div
              key={pop.id}
              className="absolute pointer-events-none text-amber-500 font-title font-extrabold text-xl filter drop-shadow-sm"
              style={{
                left: `${pop.x}px`,
                top: `${pop.y}px`,
                animation: 'floatUp 0.82s ease-out forwards',
              }}
            >
              {pop.text}
            </div>
          ))}
        </div>

        {/* Painel de Controles Flutuantes: Play, Pause, Robozinho IA, Tela Cheia e Som */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
          {/* Botão Robozinho IA (Auto-Pilot / Predição por Tensores) */}
          <button 
            onClick={alternarRobo} 
            className={`p-2.5 rounded-full border-2 shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center w-11 h-11 transition-all ${
              roboAtivo 
                ? 'bg-purple-600 border-purple-700 text-white animate-bounce' 
                : 'bg-white border-purple-400 text-purple-600'
            }`}
            title={roboAtivo ? "Desativar Robozinho Autônomo" : "Ativar Robozinho IA (Jogar Sozinho por Tensores)"}
          >
            <span className="text-xl">🤖</span>
          </button>
          {/* Botão Tela Cheia */}
          <button 
            onClick={alternarTelaCheia} 
            className="bg-white p-2.5 rounded-full border-2 border-indigo-400 text-indigo-500 shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center w-11 h-11"
            title="Tela Cheia"
          >
            <span className="text-xl">{telaCheia ? '⏹️' : '📺'}</span>
          </button>
          {/* Botão Iniciar / Parar (Play/Pause) */}
          <button 
            onClick={alternarPlayPause} 
            className="bg-white p-2.5 rounded-full border-2 border-emerald-400 text-emerald-500 shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center w-11 h-11"
            title="Parar/Iniciar"
          >
            <span className="text-xl">{iniciado ? '⏸️' : '▶️'}</span>
          </button>
          {/* Controle do Áudio */}
          <button 
            onClick={alternarSom} 
            className="bg-white p-2.5 rounded-full border-2 border-amber-400 text-amber-500 shadow-md hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center w-11 h-11"
            title="Som"
          >
            <span className="text-xl">{somAtivo ? '🔊' : '🔇'}</span>
          </button>
        </div>

        {/* Painel do Robozinho IA Jogando & Predição por Tensores (Lado Esquerdo da Tela) */}
        {roboAtivo && (
          <div className="absolute left-2 right-2 top-2 z-30 bg-white/95 backdrop-blur-md p-3 rounded-2xl border-2 border-purple-400 shadow-2xl flex flex-col gap-2 w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] max-h-[85%] overflow-hidden animate-fade-in text-slate-800 sm:left-3 sm:right-auto sm:top-3 sm:w-72 sm:max-w-none">
            {/* Header do Robozinho */}
            <div className="flex items-center justify-between border-b border-purple-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center text-xl shadow animate-bounce">
                  🤖
                </div>
                <div>
                  <h3 className="font-title font-extrabold text-sm text-purple-900 leading-tight">
                    Robozinho IA
                  </h3>
                  <p className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Auto-Pilot Tensor Play
                  </p>
                </div>
              </div>
              <button 
                onClick={desativarRobo}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold bg-rose-50 px-2 py-1 rounded-lg border border-rose-200 cursor-pointer"
                title="Parar Robozinho"
              >
                ✕ Parar
              </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-1.5 text-center">
              <div className="bg-purple-50 p-1.5 rounded-xl border border-purple-200">
                <span className="text-[10px] text-purple-600 font-bold block">🎯 Acertos Robô</span>
                <span className="font-extrabold text-sm text-purple-900">{statsRobo.totalAcertos}</span>
              </div>
              <div className="bg-emerald-50 p-1.5 rounded-xl border border-emerald-200">
                <span className="text-[10px] text-emerald-600 font-bold block">⚡ Confiança Média</span>
                <span className="font-extrabold text-sm text-emerald-800">{statsRobo.mediaConfianca}%</span>
              </div>
              <div className="bg-sky-50 p-1.5 rounded-xl border border-sky-200">
                <span className="text-[10px] text-sky-600 font-bold block">⏱️ Latência Tensor</span>
                <span className="font-extrabold text-xs text-sky-800">{statsRobo.latenciaMs} ms</span>
              </div>
              <div className="bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                <span className="text-[10px] text-amber-700 font-bold block">📍 BBox Alvo</span>
                <span className="font-extrabold text-[10px] text-amber-900 truncate block">{statsRobo.ultimoBbox}</span>
              </div>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50 p-2">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-purple-700">
                <span>⚙️ Atraso da resposta</span>
                <span className="font-mono text-purple-900">{delayRespostaRoboMs} ms</span>
              </div>
              <input
                type="range"
                min="0"
                max="2500"
                step="50"
                value={delayRespostaRoboMs}
                onChange={(e) => setDelayRespostaRoboMs(Number(e.target.value))}
                className="mt-2 w-full accent-purple-600"
                aria-label="Atraso da resposta do robô"
              />
              <div className="mt-1 flex justify-between text-[10px] text-purple-500">
                <span>Mais rápido</span>
                <span>Mais lento</span>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-2">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-700">
                <span>🎯 Acurácia do robô</span>
                <span className="font-mono text-amber-900">{acuraciaRoboPercentual}%</span>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAcuraciaRoboPercentual(prev => Math.min(100, prev + 5))}
                  className="flex-1 rounded-lg border border-emerald-300 bg-emerald-100 px-2 py-1.5 text-[10px] font-bold text-emerald-700"
                >
                  ⬆️ Melhorar
                </button>
                <button
                  type="button"
                  onClick={() => setAcuraciaRoboPercentual(prev => Math.max(10, prev - 5))}
                  className="flex-1 rounded-lg border border-rose-300 bg-rose-100 px-2 py-1.5 text-[10px] font-bold text-rose-700"
                >
                  ⬇️ Piorar
                </button>
              </div>
            </div>

            {/* Stream de Predições de Letras / Números */}
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-600 px-0.5">
                <span>📊 Predições de Letras & Números</span>
                <span className="text-[9px] text-purple-500 font-mono">TFJS YOLOv5</span>
              </div>

              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                {historicoPredicoes.length === 0 ? (
                  <div className="text-center text-[11px] text-slate-400 py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Aguardando alvos caindo na tela... 🎈
                  </div>
                ) : (
                  historicoPredicoes.map((pred) => (
                    <div 
                      key={pred.id} 
                      className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex flex-col gap-1 shadow-sm text-xs animate-fade-in"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-lg bg-purple-500 text-white font-title font-extrabold flex items-center justify-center text-xs shadow-sm">
                            {pred.char}
                          </span>
                          <span className="font-bold text-slate-700">Letra {pred.char}</span>
                        </div>
                        <span className="font-mono font-extrabold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                          {pred.score}%
                        </span>
                      </div>

                      {/* Progress bar visual de confiança */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(10, parseFloat(pred.score)))}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                        <span>Coord: [{pred.x}px, {pred.y}px]</span>
                        <span>{pred.tensorTimeMs}ms</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Overlay do Jogo Pausado/Inicial */}
        {!iniciado && (
          <div className="absolute inset-0 bg-sky-200/90 flex flex-col items-center justify-center text-center p-6 z-30">
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-4 border-amber-400 max-w-sm">
              <div className="text-6xl mb-4">{pausado ? '⏸️' : '🎈'}</div>
              <h2 className="text-2xl md:text-3xl font-title font-bold text-amber-500">
                {pausado ? 'Jogo Pausado!' : 'Pronto para Jogar?'}
              </h2>
              <p className="text-sm text-slate-500 font-cartoon my-3 leading-relaxed">
                {pausado 
                  ? 'Brincadeira em pausa! Clique no botão abaixo para continuar jogando e estourar mais letrinhas!'
                  : 'As letrinhas vão cair do céu! Aperte as teclas no seu teclado ou toque nas letras coloridas aqui na tela para ganhar muitos pontos!'
                }
              </p>
              <button 
                onClick={() => {
                  iniciarAudio();
                  setIniciado(true);
                  setPausado(false);
                  setSomAtivo(true);
                  tocarSom('acerto');
                }} 
                className="w-full bg-amber-400 text-white font-title text-xl font-bold py-3 px-6 rounded-2xl shadow-lg border-b-6 border-amber-600 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
              >
                {pausado ? 'Continuar Jogando! 🚀' : 'Começar Jogo! 🚀'}
              </button>
            </div>
          </div>
        )}

        {/* LINHA ONDINHA LIMITE DE ÁGUA */}
        <div className="w-full h-8 river-wave flex items-center justify-center border-t-2 border-sky-200 relative z-20 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-70">
            <div className="w-full border-t-4 border-dashed border-white/85 mx-2"></div>
          </div>
          <span className="text-xs font-title font-bold tracking-widest text-sky-100 uppercase drop-shadow z-30">
            Ondinha Limite 💧
          </span>
        </div>
      </section>

      {/* TECLADO VIRTUAL */}
      <section className="bg-white rounded-3xl p-4 shadow-xl border-4 border-emerald-400 z-30">
        <div className="flex flex-col gap-2 md:gap-3 w-full">
          {estagio === 1 ? (
            <div className="flex justify-center gap-4 py-2 w-full">
              {vogais.map(letra => {
                const estilo = obterEstilosLetra(letra);
                const isPressed = teclaPressionada === letra;
                return (
                  <button
                    key={letra}
                    onClick={() => {
                      falarLetra(letra);
                      processarDerrubadaLetra(letra);
                    }}
                    className={`w-16 h-16 md:w-20 md:h-20 text-3xl md:text-5xl font-title rounded-2xl key-btn uppercase text-slate-900 border-2 border-b-6 flex items-center justify-center cursor-pointer select-none font-bold active:translate-y-1 transition-all ${
                      estilo.bg
                    } ${estilo.border} ${estilo.text} ${isPressed ? 'pressed' : ''}`}
                    style={{ '--shadow-color': (estilo as any).shadow } as any}
                  >
                    {letra}
                  </button>
                );
              })}
            </div>
          ) : estagio === 2 ? (
            <div className="flex justify-center gap-2 sm:gap-3 py-2 w-full flex-wrap">
              {numeros.map(num => {
                const estilo = obterEstilosLetra(num);
                const isPressed = teclaPressionada === num;
                return (
                  <button
                    key={num}
                    onClick={() => {
                      falarLetra(num);
                      processarDerrubadaLetra(num);
                    }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 text-2xl sm:text-3xl md:text-4xl font-title rounded-2xl key-btn uppercase text-slate-900 border-2 border-b-6 flex items-center justify-center cursor-pointer select-none font-bold active:translate-y-1 transition-all ${
                      estilo.bg
                    } ${estilo.border} ${estilo.text} ${isPressed ? 'pressed' : ''}`}
                    style={{ '--shadow-color': (estilo as any).shadow } as any}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          ) : estagio === 3 ? (
            [
              ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
              ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
              ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
            ].map((linha, idx) => (
              <div key={idx} className="flex justify-center gap-1 md:gap-2 w-full">
                {linha.map(letra => {
                  const estilo = obterEstilosLetra(letra);
                  const isPressed = teclaPressionada === letra;
                  return (
                    <button
                      key={letra}
                      onClick={() => {
                        falarLetra(letra);
                        processarDerrubadaLetra(letra);
                      }}
                      className={`w-8 h-10 sm:w-10 sm:h-12 md:w-12 md:h-14 text-sm sm:text-lg md:text-xl font-title rounded-xl key-btn uppercase text-slate-800 border-2 border-b-6 flex items-center justify-center cursor-pointer select-none font-bold active:translate-y-1 transition-all ${
                        estilo.bg
                      } ${estilo.border} ${estilo.text} ${isPressed ? 'pressed' : ''}`}
                      style={{ '--shadow-color': (estilo as any).shadow } as any}
                    >
                      {letra}
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-2.5 w-full p-2 max-h-[220px] overflow-y-auto">
              {palavrasEstagio4.map(item => (
                <button
                  key={item.palavra}
                  onClick={() => {
                    falarPalavra(item.palavra);
                    processarDerrubadaLetra(item.palavra);
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-b-6 bg-white border-amber-400 text-amber-950 font-title hover:scale-105 active:translate-y-1 transition-all cursor-pointer select-none min-h-[75px] shadow-sm"
                  style={{ '--shadow-color': '#d97706' } as any}
                >
                  <span className="text-3xl sm:text-4xl active:scale-110 transition-transform">{item.emoji}</span>
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wide mt-1 text-slate-700">{item.palavra}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
