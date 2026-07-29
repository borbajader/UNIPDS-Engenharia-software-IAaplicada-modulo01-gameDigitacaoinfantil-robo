# 🎈 Jogo de Digitação Infantil (Alfabetização & Robozinho IA)

Um aplicativo web educativo, lúdico e altamente interativo desenvolvido para auxiliar crianças no início da alfabetização e no reconhecimento de teclado, letras, números, símbolos e palavras, com recursos de Inteligência Artificial TensorFlow.js.

---

## 🌟 Principais Recursos e Destaques

1. **4 Estágios de Aprendizado Progressivo:**
   - **Estágio 1 (Letras/Vogais):** Reconhecimento do alfabeto completo de A a Z com cores e balões animados.
   - **Estágio 2 (Números):** Numerais de 0 a 9 para fixação e contagem inicial.
   - **Estágio 3 (Palavras Curtas):** Palavras em formato de cápsula para leitura e digitação (ex: *BOLA*, *CASA*, *GATO*, *AMOR*, *SOL*).

2. **🤖 Robozinho IA Autônomo (TensorFlow.js Web Worker):**
   - **Auto-Pilot Tensor Play:** Robô inteligente que detecta e abate os alvos em queda na tela em tempo real usando avaliação por tensores no Web Worker em thread separada.
   - **Painel de Métricas em Tempo Real:**
     - **🎯 Acertos Robô:** Contador dinâmico de acertos acumulados pelo robô.
     - **⚡ Confiança Média (%):** Cálculo da média de acurácia dos tensores.
     - **⏱️ Latência Tensor (ms):** Métrica de tempo de processamento por inferência em tempo real.
     - **📍 BBox Alvo:** Coordenadas e bounding box do item em tela `[x:px, y:px]`.
     - **📊 Histórico de Predições:** Lista visual das últimas letras/números detectados com barra de confiança.
   - **Modo Interativo:** Durante a execução do robô, os alvos caindo também se tornam interativos por clique direto. No modo manual, a pontuação obedece estritamente ao teclado virtual/físico para reforço pedagógico de digitação.

3. **🎭 Mascote Animado Interativo com Voz Sintetizada:**
   - Sintetizador de voz (`Web Speech API`) que pronuncia em português o nome de cada letra, número ou palavra ao acertar.
   - Reações emocionais dinâmicas do mascote (Sorridente, Olhos de Estrela, Assustado, Pensativo, Surpreso) com balões de fala.

4. **🔊 Efeitos Sonoros e Músicas Infantis:**
   - Sons sintetizados usando a API `Web Audio` de alta fidelidade (sem dependências externas de áudio).
   - Músicas de fundo e efeitos de acerto, erro e recorde.

5. **📱 Layout Responsivo e Suporte a Tela Cheia:**
   - Design moderno e colorido adaptado para Smartphones, Tablets, Notebooks e Monitores Touch screen.
   - Suporte a modo **Tela Cheia (Fullscreen)** para imersão total da criança.

---

## 🛠️ Tecnologias Utilizadas

- **React 19 & TypeScript:** Interface moderna e gerenciamento de estado reativo.
- **Vite:** Bundler ultra rápido para compilação e desenvolvimento.
- **Tailwind CSS v4:** Estilização responsiva e animações de alta performance.
- **TensorFlow.js (Web Worker):** Pipeline de inferência paralela em segundo plano sem travar a interface do usuário.
- **Lucide React & Motion:** Ícones e transições fluidas.
- **Nginx Alpine & Docker Multi-stage:** Distribuição leve em container para qualquer ambiente.

---

## 🐳 Como Rodar via Docker & Docker Compose

### 1. Requisitos
- Docker e Docker Compose instalados na máquina.

### 2. Executando o Container
Na raiz do projeto, execute no terminal:

```bash
# Subir o container em segundo plano (Modo Daemon)
docker-compose up -d --build

# Verificar se o container está rodando
docker ps

# Para parar a execução
docker-compose down
```

Por padrão, a aplicação estará disponível na porta `8080` (ou na porta configurada na variável `APP_PORT` no arquivo `.env`):
- `http://localhost:8080`

---

## 🌐 Acesso em Outros Dispositivos (Tablets e Celulares na Mesma Rede Wi-Fi)

Para abrir o jogo no tablet ou celular da criança conectado no mesmo Wi-Fi da sua máquina:

1. **Descubra o IP da sua máquina host:**
   - **Windows (CMD):** `ipconfig` (procure por Endereço IPv4, ex: `192.168.1.15`)
   - **Linux / WSL2:** `hostname -I` ou `ip a`
   - **macOS (Terminal):** `ipconfig getifaddr en0`

2. **Acesse no navegador do Tablet/Smartphone:**
   - `http://<SEU_IP_LOCAL>:8080` (Exemplo: `http://192.168.1.15:8080`)

*(Nota para usuários do Windows 11 com WSL2: Recomendado ativar o modo `networkingMode=mirrored` no arquivo `.wslconfig` do seu perfil de usuário).*

---

## 📜 Licença e Propósito
Projeto desenvolvido com fins educativos para auxílio no aprendizado infantil, coordenação motora e introdução à tecnologia.
