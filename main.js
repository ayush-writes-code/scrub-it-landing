/* ═══════════════════════════════════════════
   SCRUB IT — Landing Page JavaScript
   Interactive demo, counter, horizontal scroll
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Elements ───
  const container = document.getElementById('horizontal-container');
  const dots = document.querySelectorAll('.dot');
  const navbar = document.getElementById('navbar');
  const counterEl = document.getElementById('global-counter');
  const tryBtn = document.getElementById('nav-try-btn');
  const scrubBtn = document.getElementById('demo-balanced-scrub-btn');
  const quickScrubBtn = document.getElementById('demo-quick-scrub-btn');
  const deepScrubBtn = document.getElementById('demo-deep-scrub-btn');
  const customScrubBtn = document.getElementById('demo-custom-scrub-btn');
  const ciModal = document.getElementById('custom-instruction-modal');
  const ciInput = document.getElementById('ci-input');
  const ciSaveBtn = document.getElementById('ci-save-btn');
  const ciCancelBtn = document.getElementById('ci-cancel-btn');
  const ciCloseBtn = document.getElementById('ci-close-btn');
  const demoInput = document.getElementById('demo-input');
  const demoOutput = document.getElementById('demo-output');
  const demoBadges = document.getElementById('demo-badges');
  const demoActionBar = document.getElementById('demo-action-bar');
  const copyBtn = document.getElementById('demo-copy-btn');
  const modelChips = document.querySelectorAll('.demo-chip');
  const panels = document.querySelectorAll('.panel');

  let selectedModel = 'chatgpt';
  let isTyping = false;
  let wasScrubbed = false;
  let lastScrubbedBadge = '';

  // 1. SMART HORIZONTAL PANEL SCROLLING
  // ═══════════════════════════════════════════
  let isScrollLocked = false;

  container.addEventListener('wheel', (e) => {
    // Let textareas and scrollable outputs scroll normally
    if (e.target.closest('#demo-input') || e.target.closest('#demo-output')) {
      return;
    }

    e.preventDefault();

    if (isScrollLocked) return;

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    
    // Ignore extremely tiny scrolls (noise)
    if (Math.abs(delta) < 10) return;

    const panelWidth = window.innerWidth;
    const currentPanel = Math.round(container.scrollLeft / panelWidth);
    let targetPanel = currentPanel;

    if (delta > 0) {
      // Scroll down/right -> Go to next panel
      if (currentPanel < panels.length - 1) {
        targetPanel = currentPanel + 1;
      }
    } else {
      // Scroll up/left -> Go to previous panel
      if (currentPanel > 0) {
        targetPanel = currentPanel - 1;
      }
    }

    if (targetPanel !== currentPanel) {
      isScrollLocked = true;
      container.scrollTo({
        left: targetPanel * panelWidth,
        behavior: 'smooth'
      });

      // Unlock after the transition finishes (approx 800ms)
      setTimeout(() => {
        isScrollLocked = false;
      }, 800);
    }
  }, { passive: false });

  // ═══════════════════════════════════════════
  // 2. SCROLL DOTS UPDATE
  // ═══════════════════════════════════════════
  function updateDots() {
    const scrollPos = container.scrollLeft;
    const panelWidth = window.innerWidth;
    const currentPanel = Math.round(scrollPos / panelWidth);

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentPanel);
    });

    // Navbar effect
    navbar.classList.toggle('scrolled', scrollPos > 50);
  }

  container.addEventListener('scroll', updateDots);

  // ═══════════════════════════════════════════
  // 3. DOT CLICK NAVIGATION
  // ═══════════════════════════════════════════
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const panelIndex = parseInt(dot.dataset.panel);
      container.scrollTo({
        left: panelIndex * window.innerWidth,
        behavior: 'smooth'
      });
    });
  });

  // ═══════════════════════════════════════════
  // 4. NAV TRY BUTTON
  // ═══════════════════════════════════════════
  tryBtn.addEventListener('click', () => {
    container.scrollTo({
      left: 0,
      behavior: 'smooth'
    });
    setTimeout(() => {
      if (demoInput) demoInput.focus();
    }, 500);
  });

  // ═══════════════════════════════════════════
  // 5. GLOBAL COUNTER
  // ═══════════════════════════════════════════
  const COUNTER_KEY = 'scrubItCounter';
  const BASE_COUNT = 1247;

  function getCount() {
    const stored = localStorage.getItem(COUNTER_KEY);
    if (stored) return parseInt(stored);
    localStorage.setItem(COUNTER_KEY, BASE_COUNT.toString());
    return BASE_COUNT;
  }

  function formatNumber(n) {
    return n.toLocaleString('en-US');
  }

  function incrementCounter() {
    let count = getCount() + 1;
    localStorage.setItem(COUNTER_KEY, count.toString());
    counterEl.textContent = formatNumber(count);
    // Bump animation
    counterEl.classList.add('bump');
    setTimeout(() => counterEl.classList.remove('bump'), 200);
  }

  // Animate counter from 0 to stored value on load
  function animateCounter() {
    const target = getCount();
    const duration = 2000;
    const startTime = performance.now();

    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const current = Math.floor(easedProgress * target);
      counterEl.textContent = formatNumber(current);
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counterEl.textContent = formatNumber(target);
      }
    }

    requestAnimationFrame(update);
  }

  animateCounter();

  // ═══════════════════════════════════════════
  // 6. MODEL CHIP SELECTOR & CONVERSATIONS
  // ═══════════════════════════════════════════
  const browserContent = document.getElementById('browser-ui-content');
  const demoUrl = document.getElementById('demo-url');

  const mockConversations = {
    chatgpt: {
      logo: 'ChatGPT',
      url: 'chatgpt.com',
      defaultInput: 'how to build and app',
      history: [
        '💡 startup branding',
        '💬 landing page hook',
        '⚡ performance optimization',
        '📧 quick client outreach'
      ],
      messages: [
        {
          sender: 'user',
          badge: 'Balanced Scrubbed',
          text: 'You are a conversion copywriting expert. Help me write the hero header for my new chrome extension, "Scrub It". It optimizes dirty, messy prompts into clean AI prompts in 1-click. Make it extremely punchy and appealing to developers and builders who use AI daily.'
        },
        {
          sender: 'assistant',
          avatarClass: 'chatgpt-icon',
          avatarText: 'GPT',
          text: 'Here are three high-converting hero headers tailored for your extension, optimized for builders and power-users:\n\n**Option 1: Bold & Provocative (Focus on efficiency)**\n> **scrub your prompts b*tch**\n> Messy ideas to flawless prompts. In one click.\n\n**Option 2: Value-Oriented (Focus on speed)**\n> **Stop wasting credits on bad prompts.**\n> Clean, structure, and optimize your drafts instantly without switching tabs.\n\n**Option 3: Professional (Focus on results)**\n> **Perfect AI outputs start with flawless inputs.**\n> The zero-friction Chrome extension that cleans your messy ideas in real-time.'
        }
      ]
    },
    claude: {
      logo: 'Claude',
      url: 'claude.ai',
      defaultInput: 'write me a blog post about ai',
      history: [
        '✍️ novel outline chapter 1',
        '📊 q3 database analysis',
        '🧠 deep philosophy questions',
        '📝 api specifications'
      ],
      messages: [
        {
          sender: 'user',
          badge: 'Deep Scrubbed',
          text: 'Act as an expert technical writer. Explain the difference between super-intelligent AI models and small language models. Focus on parameters, inference speed, and fine-tuning. Keep it concise, professional, and use a neat Markdown table.'
        },
        {
          sender: 'assistant',
          avatarClass: 'claude-icon',
          avatarText: 'C',
          text: 'Here is a technical comparison of Frontier (Super-Intelligent) Models vs. Small Language Models (SLMs):\n\n| Feature | Frontier Models (GPT-4o, Claude 3.5) | Small Models (Llama 3 8B, Phi-3) |\n| :--- | :--- | :--- |\n| **Parameters** | 500B+ (estimated) | 1B - 8B |\n| **Inference Speed** | Slower (requires distributed GPUs) | Sub-millisecond (runs locally) |\n| **Specialization** | Excellent at general reasoning | Highly efficient when fine-tuned |\n| **Deployment Cost** | High API pricing | Extremely low / Zero self-hosting |\n\n**Key Takeaway:** Use frontier models for complex multi-step reasoning, and SLMs for high-throughput, low-latency specialized tasks.'
        }
      ]
    },
    gemini: {
      logo: 'Gemini',
      url: 'gemini.google.com',
      defaultInput: 'explain quantum computing to me',
      history: [
        '✈️ japan travel itinerary',
        '💻 css bento box layout',
        '🍳 healthy lunch prep',
        '📈 target marketing metrics'
      ],
      messages: [
        {
          sender: 'user',
          badge: 'Quick Scrubbed',
          text: 'You are a Senior Frontend Architect. Generate a clean CSS grid mockup showing a bento box layout for a product features section. Include 5 cards: 2 large landscape, 1 tall portrait, and 2 standard cards. Provide only the CSS grid rules.'
        },
        {
          sender: 'assistant',
          avatarClass: 'gemini-icon',
          avatarText: 'G',
          text: 'Here is the clean CSS grid system for your modern bento box features layout:\n\n```css\n.bento-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  grid-auto-rows: 180px;\n  gap: 16px;\n}\n\n/* Card spans */\n.card-landscape-1 { grid-column: span 2; }\n.card-landscape-2 { grid-column: span 2; grid-row: span 1; }\n.card-tall { grid-row: span 2; }\n.card-standard-1 { grid-column: span 1; }\n.card-standard-2 { grid-column: span 1; }\n```\n\nThis setup creates a stunning, balanced modern design matching premium landing pages.'
        }
      ]
    }
  };

  // Simple Markdown Parser for Chat rendering
  function formatMarkdown(text) {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Handle code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="chat-code-block"><div class="code-header">$1</div><code>$2</code></pre>');

    // Handle inline code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Handle tables
    const lines = html.split('\n');
    let inTable = false;
    let tableRows = [];
    let processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line);
      } else {
        if (inTable) {
          let tableHtml = '<table class="chat-table">';
          for (let r = 0; r < tableRows.length; r++) {
            let row = tableRows[r];
            let cells = row.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
            if (cells.every(c => /^:?-+:?$/.test(c))) continue;
            let cellTag = (r === 0) ? 'th' : 'td';
            tableHtml += '<tr>' + cells.map(c => `<${cellTag}>${c}</${cellTag}>`).join('') + '</tr>';
          }
          tableHtml += '</table>';
          processedLines.push(tableHtml);
          inTable = false;
        }
        processedLines.push(lines[i]);
      }
    }
    
    if (inTable) {
      let tableHtml = '<table class="chat-table">';
      for (let r = 0; r < tableRows.length; r++) {
        let row = tableRows[r];
        let cells = row.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (cells.every(c => /^:?-+:?$/.test(c))) continue;
        let cellTag = (r === 0) ? 'th' : 'td';
        tableHtml += '<tr>' + cells.map(c => `<${cellTag}>${c}</${cellTag}>`).join('') + '</tr>';
      }
      tableHtml += '</table>';
      processedLines.push(tableHtml);
    }

    html = processedLines.join('\n');

    // Handle blockquotes
    html = html.replace(/^&gt;\s*(.*)$/gm, '<blockquote>$1</blockquote>');

    // Handle bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Handle list items
    html = html.replace(/^[•\-\*]\s*(.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/g, '<ul class="chat-list">$1</ul>');
    html = html.replace(/<\/ul>\s*<ul class="chat-list">/g, '');

    // Handle line breaks
    html = html.replace(/\n/g, '<br/>');

    // Clean up br tags before/after block elements
    html = html.replace(/<br\/><br\/>(<pre|<table|blockquote)/g, '$1');
    html = html.replace(/(<\/pre>|<\/table>|<\/blockquote>)<br\/><br\/>/g, '$1');
    html = html.replace(/(<\/pre>|<\/table>|<\/blockquote>)<br\/>/g, '$1');

    return html;
  }

  // Dynamic conversation renderer
  function renderConversation(model) {
    const data = mockConversations[model];
    if (!data) return;

    // 1. Update logo & URL bar
    const sidebarLogo = document.getElementById('sidebar-logo');
    if (sidebarLogo) sidebarLogo.textContent = data.logo;

    // 2. Render sidebar history
    const historyList = document.getElementById('sidebar-history');
    if (historyList) {
      historyList.innerHTML = '';
      data.history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'cg-history-item';
        historyItem.innerHTML = `
          <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          ${item}
        `;
        historyList.appendChild(historyItem);
      });
    }

    // 3. Render chat messages
    const chatContainer = document.getElementById('demo-output');
    if (chatContainer) {
      chatContainer.innerHTML = `
        <div id="demo-badges" style="display:none;"></div>
        <div id="demo-action-bar" style="display:none;">
          <button id="demo-copy-btn" style="display:none;"></button>
        </div>
      `;

      const wrapper = document.createElement('div');
      wrapper.className = 'chat-messages-wrapper';

      data.messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${msg.sender}`;
        
        if (msg.sender === 'user') {
          msgDiv.innerHTML = `
            <div class="chat-msg-content">
              <div class="scrubbed-badge-inline">⚡ ${msg.badge}</div>
              <div>${msg.text}</div>
            </div>
          `;
        } else {
          let avatarSvg = '';
          if (msg.avatarClass === 'chatgpt-icon') {
            avatarSvg = `<svg viewBox="0 0 24 24" width="11" height="11" fill="#fff"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>`;
          } else if (msg.avatarClass === 'claude-icon') {
            avatarSvg = `<svg viewBox="0 0 16 16" width="11" height="11" fill="#fff"><path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212"/></svg>`;
          } else if (msg.avatarClass === 'gemini-icon') {
            avatarSvg = `<svg viewBox="0 0 24 24" width="11" height="11" fill="#fff"><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"/></svg>`;
          }
          msgDiv.innerHTML = `
            <div class="chat-avatar ${msg.avatarClass}">${avatarSvg}</div>
            <div class="chat-msg-content">${formatMarkdown(msg.text)}</div>
          `;
        }
        wrapper.appendChild(msgDiv);
      });

      chatContainer.appendChild(wrapper);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // 4. Update input field
    if (demoInput) {
      demoInput.value = data.defaultInput;
    }
  }

  // Set up click handlers for chip select
  modelChips.forEach(chip => {
    chip.addEventListener('click', () => {
      modelChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedModel = chip.dataset.model;
      
      // Update theme
      browserContent.className = 'browser-ui-content theme-' + selectedModel;
      
      // Update URL mock & render conversation
      renderConversation(selectedModel);
      if (selectedModel === 'chatgpt') demoUrl.textContent = 'chatgpt.com';
      if (selectedModel === 'claude') demoUrl.textContent = 'claude.ai';
      if (selectedModel === 'gemini') demoUrl.textContent = 'gemini.google.com';
    });
  });

  // Render initial default conversation on page load
  renderConversation('chatgpt');

  // ═══════════════════════════════════════════
  // 6.5. CONTEXT MENU & SUGGESTION POPOVER
  // ═══════════════════════════════════════════
  const mockContext = document.getElementById('mock-context');
  const demoHint = document.getElementById('demo-hint');
  const mockSuggestion = document.getElementById('mock-suggestion');
  const suggText = document.getElementById('sugg-text');
  const suggAccept = document.getElementById('sugg-accept');
  const suggReject = document.getElementById('sugg-reject');
  let currentOutputText = '';

  demoInput.addEventListener('select', () => {
    const text = demoInput.value.substring(demoInput.selectionStart, demoInput.selectionEnd).trim();
    if (text.length > 0) {
      mockContext.style.opacity = '1';
      mockContext.style.pointerEvents = 'auto';
      if (demoHint) demoHint.style.opacity = '0';
    }
  });

  document.addEventListener('click', (e) => {
    // Hide context menu when clicking outside
    if (!mockContext.contains(e.target) && e.target !== demoInput) {
      mockContext.style.opacity = '0';
      mockContext.style.pointerEvents = 'none';
    }
  });

  // Suggestion Actions
  suggAccept.addEventListener('click', () => {
    demoInput.value = currentOutputText;
    mockSuggestion.style.opacity = '0';
    mockSuggestion.style.pointerEvents = 'none';
    wasScrubbed = true;
  });

  suggReject.addEventListener('click', () => {
    mockSuggestion.style.opacity = '0';
    mockSuggestion.style.pointerEvents = 'none';
  });

  // ═══════════════════════════════════════════
  // 7. SCRUB DEMO ENGINE
  // ═══════════════════════════════════════════
  const scrubExamples = [
    {
      keywords: ['blog', 'post', 'write', 'article', 'essay'],
      defaultInput: 'write me a blog post about ai',
      badges: ['Role assigned', 'Structure added', 'Constraints set'],
      outputs: {
        chatgpt: `You are a senior technology journalist with 10+ years covering AI for publications like Wired and MIT Technology Review.\n\nWrite a 1,200-word blog post about the practical impact of AI on knowledge work in 2025.\n\nRequirements:\n• Tone: Authoritative but accessible — no hype\n• Structure: Hook → Context → 3 key insights with examples → Implications → Conclusion\n• Include 2+ specific real-world case studies\n• Address both opportunities and legitimate concerns\n• Use subheadings for scannability\n\nAvoid: Generic AI hype, unsubstantiated claims, or listicles without analysis.\n\nOutput format: Markdown with proper heading hierarchy.`,
        claude: `<role>You are a senior technology journalist specializing in AI's impact on knowledge work, writing for a well-informed professional audience.</role>\n\n<task>Write a 1,200-word blog post on how AI is practically changing knowledge work in 2025.</task>\n\n<requirements>\n- Tone: Authoritative, nuanced, zero hype\n- Include 2+ concrete case studies from real companies\n- Structure: Compelling hook → Context → 3 insights → Implications → Forward-looking close\n- Balance opportunities with legitimate concerns\n- Use markdown subheadings\n</requirements>\n\n<constraints>\n- No generic AI evangelism\n- No unsubstantiated claims\n- Every insight must be grounded in a specific example\n</constraints>`,
        gemini: `You are a senior technology journalist with deep expertise in AI and knowledge work.\n\nTask: Write a 1,200-word blog post about AI's practical impact on knowledge work in 2025.\n\nStyle guidelines:\n- Authoritative but accessible tone\n- Evidence-based with real case studies\n- Balanced perspective (opportunities + concerns)\n\nStructure:\n1. Compelling opening hook\n2. Context and landscape\n3. Three key insights with concrete examples\n4. Broader implications\n5. Forward-looking conclusion\n\nConstraints: Avoid hype, generic claims, and listicle format. Use markdown formatting.`
      }
    },
    {
      keywords: ['code', 'login', 'page', 'build', 'create', 'app', 'website', 'component', 'function'],
      defaultInput: 'help me write code for a login page',
      badges: ['Role assigned', 'Context added', 'Format specified'],
      outputs: {
        chatgpt: `You are an expert full-stack developer specializing in authentication systems and security best practices.\n\nCreate a complete, production-ready login page with the following specifications:\n\nTech stack: React + TypeScript\n\nSecurity requirements:\n• JWT-based authentication with httpOnly cookies\n• CSRF protection\n• Rate limiting on login attempts\n• Input sanitization and XSS prevention\n• Password field with show/hide toggle\n\nUI requirements:\n• Clean, accessible form (WCAG AA compliant)\n• Email + password fields with validation\n• Error states with helpful messages\n• Loading state during authentication\n• "Remember me" option\n\nProvide: Complete component code with comments explaining each security decision.`,
        claude: `<role>Expert full-stack developer specializing in authentication and web security.</role>\n\n<task>Build a production-ready login page component.</task>\n\n<tech_stack>React + TypeScript</tech_stack>\n\n<security_requirements>\n- JWT auth with httpOnly cookies\n- CSRF protection\n- Rate limiting\n- Input sanitization\n- Bcrypt password hashing\n</security_requirements>\n\n<ui_requirements>\n- WCAG AA accessible form\n- Email/password with validation\n- Error + loading states\n- Show/hide password toggle\n</ui_requirements>\n\n<output>Complete component code with inline comments explaining security decisions.</output>`,
        gemini: `You are an expert full-stack developer focused on secure authentication.\n\nTask: Create a production-ready login page.\n\nTechnology: React + TypeScript\n\nSecurity checklist:\n1. JWT with httpOnly cookies\n2. CSRF protection\n3. Rate limiting\n4. Input sanitization\n5. Secure password handling\n\nUI checklist:\n1. Accessible form (WCAG AA)\n2. Validation with clear error messages\n3. Loading states\n4. Show/hide password toggle\n\nDeliver complete, commented component code.`
      }
    },
    {
      keywords: ['explain', 'quantum', 'what', 'how', 'understand', 'learn', 'teach'],
      defaultInput: 'explain quantum computing to me',
      badges: ['Role assigned', 'Structure added', 'Audience set'],
      outputs: {
        chatgpt: `You are a physics professor at MIT known for making complex topics intuitive for non-specialists.\n\nExplain quantum computing to someone who understands how regular computers work but has zero quantum physics background.\n\nStructure your explanation:\n1. Start with one clear analogy that captures the core difference between classical and quantum computing\n2. Explain qubits, superposition, and entanglement using everyday metaphors (no math)\n3. Give 3 concrete examples of problems quantum computers solve better\n4. Clarify the biggest misconception: quantum computers won't replace regular ones for most tasks\n5. Current state: what works today vs. what's theoretical\n\nConstraints:\n• Under 500 words\n• Zero unexplained jargon\n• Each concept gets exactly one metaphor\n• End with a one-sentence summary a 12-year-old could understand`,
        claude: `<role>Physics professor known for making quantum mechanics intuitive.</role>\n\n<audience>Someone who understands classical computers but has no quantum physics background.</audience>\n\n<task>Explain quantum computing clearly and concisely.</task>\n\n<structure>\n1. Core analogy: classical vs quantum\n2. Key concepts with everyday metaphors (qubits, superposition, entanglement)\n3. 3 real problems quantum computers solve better\n4. Biggest misconception to correct\n5. Current state of the technology\n</structure>\n\n<constraints>\n- Under 500 words\n- No unexplained jargon\n- One metaphor per concept\n- End with a one-line summary a child could grasp\n</constraints>`,
        gemini: `You are a physics professor celebrated for intuitive explanations.\n\nTask: Explain quantum computing.\nAudience: Knows regular computers, zero quantum background.\n\nCover these in order:\n1. One analogy for classical vs. quantum\n2. Qubits, superposition, entanglement — everyday metaphors only\n3. Three problems quantum solves better\n4. Correct the biggest misconception\n5. What works today vs. what's still theory\n\nRules: Under 500 words. No jargon without explanation. End with a one-sentence summary.`
      }
    },
    {
      keywords: ['email', 'marketing', 'campaign', 'newsletter', 'subject', 'launch', 'product'],
      defaultInput: 'write a marketing email for my new app',
      badges: ['Role assigned', 'Audience defined', 'Format specified'],
      outputs: {
        chatgpt: `You are a senior email marketing strategist who has written campaigns for apps with 100K+ downloads.\n\nWrite a product launch email for a new mobile app.\n\nEmail specifications:\n• Subject line: 3 options (curiosity-driven, benefit-driven, urgency-driven)\n• Preview text: Compelling 40-char snippet\n• Body structure: Hook (1 sentence) → Problem → Solution → 3 key features → Social proof placeholder → Single CTA\n• Tone: Confident, conversational, zero corporate speak\n• Length: Under 200 words body copy\n\nDesign notes:\n• Mobile-first layout\n• One primary CTA button (high contrast)\n• Minimal images — copy-driven\n\nAlso provide: Send time recommendation and A/B test suggestions.`,
        claude: `<role>Senior email marketing strategist with mobile app launch expertise.</role>\n\n<task>Write a product launch email for a new app.</task>\n\n<deliverables>\n1. Three subject line options (curiosity / benefit / urgency)\n2. 40-char preview text\n3. Email body (under 200 words)\n4. Send time recommendation\n5. A/B test suggestions\n</deliverables>\n\n<body_structure>\nHook → Problem → Solution → 3 features → Social proof → CTA\n</body_structure>\n\n<constraints>\n- Conversational, confident tone\n- Zero corporate jargon\n- One primary CTA\n- Mobile-first design\n</constraints>`,
        gemini: `You are a senior email marketing strategist specializing in app launches.\n\nTask: Write a complete product launch email.\n\nDeliver:\n1. 3 subject line options (curiosity, benefit, urgency angles)\n2. Preview text (40 chars)\n3. Email body following: Hook → Problem → Solution → Features → Social proof → CTA\n4. Send time recommendation\n5. A/B test ideas\n\nRules:\n- Under 200 words body\n- Conversational tone, no corporate speak\n- Single, clear CTA\n- Mobile-optimized structure`
      }
    }
  ];

  // Fallback generator for custom inputs
  function generateFallback(input, model) {
    const cleaned = input.trim();
    if (model === 'claude') {
      return `<role>You are an expert assistant with deep knowledge relevant to this task.</role>\n\n<task>${cleaned}</task>\n\n<requirements>\n- Be specific and actionable\n- Use clear structure with sections\n- Include relevant examples\n- Prioritize accuracy over breadth\n</requirements>\n\n<output_format>Well-organized response with clear headings and bullet points.</output_format>\n\n<constraints>Keep focused. Avoid unnecessary preamble.</constraints>`;
    } else if (model === 'gemini') {
      return `You are an expert assistant with relevant domain expertise.\n\nTask: ${cleaned}\n\nRequirements:\n1. Be specific and actionable\n2. Structure the response with clear sections\n3. Include concrete examples where helpful\n4. Prioritize accuracy\n\nFormat: Organized response with headings and bullet points.\nConstraint: Stay focused, avoid preamble.`;
    } else {
      return `You are an expert assistant with deep domain expertise relevant to the task below.\n\n${cleaned}\n\nRequirements:\n• Be specific and actionable in your response\n• Use clear structure with sections if the response is long\n• Include relevant examples where helpful\n• Prioritize accuracy over breadth\n\nOutput format: Well-organized response with clear headings and bullet points where appropriate.\n\nConstraints: Stay focused, avoid unnecessary preamble, and get straight to the substance.`;
    }
  }

  // Templates for dynamic prompt scrubbing based on category
  const blogTemplates = {
    chatgpt: (topic) => `You are a senior writer and subject matter expert with 10+ years covering ${topic}.\n\nWrite a 1,200-word blog post about ${topic}.\n\nRequirements:\n• Tone: Authoritative but accessible — engaging and well-researched\n• Structure: Hook → Context → 3 key insights with examples → Implications → Conclusion\n• Include 2+ specific real-world case studies or examples\n• Use subheadings for scannability\n\nAvoid: Generic filler, unsubstantiated claims, or listicles without real analysis.\n\nOutput format: Markdown with proper heading hierarchy.`,
    claude: (topic) => `<role>You are a senior writer and subject matter expert specializing in ${topic}, writing for a well-informed professional audience.</role>\n\n<task>Write a 1,200-word blog post on ${topic}.</task>\n\n<requirements>\n- Tone: Authoritative, nuanced, and engaging\n- Include 2+ concrete case studies or real-world examples\n- Structure: Compelling hook → Context → 3 insights → Implications → Forward-looking close\n- Use markdown subheadings\n</requirements>\n\n<constraints>\n- No generic high-level fluff\n- No unsubstantiated claims\n- Every insight must be grounded in a specific example\n</constraints>`,
    gemini: (topic) => `You are a senior writer and subject matter expert with deep expertise in ${topic}.\n\nTask: Write a 1,200-word blog post about ${topic}.\n\nStyle guidelines:\n- Authoritative but accessible tone\n- Evidence-based with real-world examples\n- Balanced perspective\n\nStructure:\n1. Compelling opening hook\n2. Context and landscape\n3. Three key insights with concrete examples\n4. Broader implications\n5. Forward-looking conclusion\n\nConstraints: Avoid generic claims and listicle format. Use markdown formatting.`
  };

  const codeTemplates = {
    chatgpt: (component) => `You are an expert software developer specializing in secure systems and modern architecture.\n\nCreate a complete, production-ready ${component} with the following specifications:\n\nTech stack: React + TypeScript (unless specified otherwise)\n\nKey requirements:\n• Robust error handling and input validation\n• Clean state management and optimal rendering performance\n• Security best practices (sanitization, XSS prevention)\n• Accessibility (WCAG AA compliant markup)\n• Clear loading and empty states\n\nProvide: Complete component code with comments explaining architectural decisions.`,
    claude: (component) => `<role>Expert software developer specializing in modern web architecture and secure systems.</role>\n\n<task>Build a production-ready ${component} component.</task>\n\n<tech_stack>React + TypeScript (unless specified otherwise)</tech_stack>\n\n<requirements>\n- Robust error handling and input validation\n- Optimal state management and performance\n- Security best practices (sanitization, protection against common exploits)\n- High accessibility (WCAG AA compliant markup)\n- Seamless loading and error states\n</requirements>\n\n<output>Complete component code with inline comments explaining architectural and design decisions.</output>`,
    gemini: (component) => `You are an expert developer focused on secure and performant components.\n\nTask: Create a production-ready ${component}.\n\nTechnology: React + TypeScript (unless specified otherwise)\n\nDevelopment checklist:\n1. Robust error handling and validation\n2. Optimal state management\n3. Security best practices\n4. Accessible markup (WCAG AA)\n5. Clean loading and empty states\n\nDeliver complete, commented component code.`
  };

  const explainTemplates = {
    chatgpt: (topic) => `You are a university professor known for making complex topics intuitive for non-specialists.\n\nExplain ${topic} to someone who has zero prior background in this field.\n\nStructure your explanation:\n1. Start with one clear analogy that captures the core concept\n2. Explain key sub-concepts using everyday metaphors (no mathematical or academic jargon)\n3. Give 3 concrete examples of how this is applied or why it matters\n4. Clarify the biggest misconception people have about this topic\n5. Current state: what is practical today vs. what is theoretical or future-facing\n\nConstraints:\n• Under 500 words\n• Zero unexplained jargon\n• Each concept gets exactly one metaphor\n• End with a one-sentence summary a 12-year-old could understand`,
    claude: (topic) => `<role>University professor celebrated for making complex fields highly intuitive.</role>\n\n<audience>A beginner with zero prior background in this subject.</audience>\n\n<task>Explain ${topic} clearly and concisely.</task>\n\n<structure>\n1. Core analogy capturing the central concept\n2. Key sub-concepts explained through everyday metaphors\n3. 3 practical examples of applications or relevance\n4. Biggest common misconception to correct\n5. Current real-world state vs future-facing theory\n</structure>\n\n<constraints>\n- Under 500 words\n- No unexplained jargon\n- One metaphor per concept\n- End with a one-line summary a child could grasp\n</constraints>`,
    gemini: (topic) => `You are a university professor celebrated for intuitive explanations.\n\nTask: Explain ${topic}.\nAudience: Beginner with zero background.\n\nCover these in order:\n1. One core analogy for the concept\n2. Key sub-concepts using everyday metaphors only\n3. Three practical applications or reasons why it matters\n4. Correct the biggest common misconception\n5. Real-world today vs. future theory\n\nRules: Under 500 words. No jargon without explanation. End with a one-sentence summary.`
  };

  const emailTemplates = {
    chatgpt: (product) => `You are a senior email marketing strategist who has written campaigns for high-growth brands.\n\nWrite a product launch email for ${product}.\n\nEmail specifications:\n• Subject line: 3 options (curiosity-driven, benefit-driven, urgency-driven)\n• Preview text: Compelling 40-char snippet\n• Body structure: Hook (1 sentence) → Problem → Solution → 3 key features/benefits → Social proof placeholder → Single CTA\n• Tone: Confident, conversational, zero corporate speak\n• Length: Under 200 words body copy\n\nDesign notes:\n• Mobile-first layout\n• One primary CTA button (high contrast)\n• Minimal images — copy-driven\n\nAlso provide: Send time recommendation and A/B test suggestions.`,
    claude: (product) => `<role>Senior email marketing strategist with high-growth product launch expertise.</role>\n\n<task>Write a product launch email for ${product}.</task>\n\n<deliverables>\n1. Three subject line options (curiosity / benefit / urgency)\n2. 40-char preview text\n3. Email body (under 200 words)\n4. Send time recommendation\n5. A/B test suggestions\n</deliverables>\n\n<body_structure>\nHook → Problem → Solution → 3 features → Social proof → CTA\n</body_structure>\n\n<constraints>\n- Conversational, confident tone\n- Zero corporate jargon\n- One primary CTA\n- Mobile-first design\n</constraints>`,
    gemini: (product) => `You are a senior email marketing strategist specializing in product launches.\n\nTask: Write a complete product launch email for ${product}.\n\nDeliver:\n1. 3 subject line options (curiosity, benefit, urgency angles)\n2. Preview text (40 chars)\n3. Email body following: Hook → Problem → Solution → Features → Social proof → CTA\n4. Send time recommendation\n5. A/B test ideas\n\nRules:\n- Under 200 words body\n- Conversational tone, no corporate speak\n- Single, clear CTA\n- Mobile-optimized structure`
  };

  // Stricter example matcher that supports dynamic extraction
  function matchAndFormatScrub(inputText, selectedModel) {
    const cleanedInput = inputText.trim();
    const lowerInput = cleanedInput.toLowerCase();

    // 1. Check EXACT or very close defaults first to keep original high fidelity
    if (lowerInput === 'write me a blog post about ai' || lowerInput === 'write me a blog post about artificial intelligence') {
      return {
        outputText: scrubExamples[0].outputs[selectedModel] || scrubExamples[0].outputs.chatgpt,
        badges: scrubExamples[0].badges
      };
    }
    if (lowerInput === 'help me write code for a login page' || lowerInput === 'write code for a login page') {
      return {
        outputText: scrubExamples[1].outputs[selectedModel] || scrubExamples[1].outputs.chatgpt,
        badges: scrubExamples[1].badges
      };
    }
    if (lowerInput === 'explain quantum computing to me' || lowerInput === 'explain quantum computing') {
      return {
        outputText: scrubExamples[2].outputs[selectedModel] || scrubExamples[2].outputs.chatgpt,
        badges: scrubExamples[2].badges
      };
    }
    if (lowerInput === 'write a marketing email for my new app' || lowerInput === 'write a marketing email for my app') {
      return {
        outputText: scrubExamples[3].outputs[selectedModel] || scrubExamples[3].outputs.chatgpt,
        badges: scrubExamples[3].badges
      };
    }

    // 2. Dynamic template matching
    // Blog post matcher
    const blogMatch = cleanedInput.match(/(?:blog post about|article about|essay about|write about|blog about|write me a blog about)\s+(.+)/i);
    if (blogMatch) {
      const topic = blogMatch[1].trim();
      return {
        outputText: blogTemplates[selectedModel](topic),
        badges: scrubExamples[0].badges
      };
    }

    // Code matcher
    const codeMatch = cleanedInput.match(/(?:write code for|code for|build a|create a|code a|program for|how to code a)\s+(.+)/i);
    if (codeMatch) {
      const component = codeMatch[1].trim();
      return {
        outputText: codeTemplates[selectedModel](component),
        badges: scrubExamples[1].badges
      };
    }

    // Explain matcher
    const explainMatch = cleanedInput.match(/(?:explain|what is|how does)\s+(.+?)(?:\s+to me|\s+work)?$/i);
    if (explainMatch) {
      const topic = explainMatch[1].trim();
      return {
        outputText: explainTemplates[selectedModel](topic),
        badges: scrubExamples[2].badges
      };
    }

    // Email matcher
    const emailMatch = cleanedInput.match(/(?:marketing email for|email for|newsletter for|write an email for)\s+(.+)/i);
    if (emailMatch) {
      const product = emailMatch[1].trim();
      return {
        outputText: emailTemplates[selectedModel](product),
        badges: scrubExamples[3].badges
      };
    }

    // 3. Fallback
    return {
      outputText: generateFallback(cleanedInput, selectedModel),
      badges: ['Expert Structured', 'Role Assigned', 'Constraints Set']
    };
  }


  async function executeScrub(type, btnElement, customInstruction = null) {
    if (isTyping) return;

    let inputText = demoInput.value.trim();

    // If empty, pick a random example
    if (!inputText) {
      const randomIdx = Math.floor(Math.random() * scrubExamples.length);
      inputText = scrubExamples[randomIdx].defaultInput;
      demoInput.value = inputText;
    }

    // Hide Context Menu
    mockContext.style.opacity = '0';
    mockContext.style.pointerEvents = 'none';

    // Set loading state
    isTyping = true;
    const originalText = btnElement.querySelector('.scrub-btn-text').textContent;
    btnElement.classList.add('loading');
    btnElement.querySelector('.scrub-btn-text').textContent = 'Scrubbing...';
    
    // Reset and show Suggestion Popover
    suggText.innerHTML = '';
    mockSuggestion.style.opacity = '1';
    mockSuggestion.style.pointerEvents = 'auto';

    let outputText = '';
    const mockResult = matchAndFormatScrub(inputText, selectedModel);
    outputText = mockResult.outputText;
    
    // Simulate network delay
    await sleep(400 + Math.random() * 400);

    lastScrubbedBadge = `${type} Scrubbed`;
    
    currentOutputText = outputText;

    // Type output character by character in the popover
    const pre = document.createElement('pre');
    pre.style.cssText = 'margin:0; white-space:pre-wrap; word-wrap:break-word; font-family:inherit; font-size:inherit; line-height:inherit; color:inherit;';
    suggText.appendChild(pre);

    for (let i = 0; i < outputText.length; i++) {
      pre.textContent += outputText[i];
      suggText.scrollTop = suggText.scrollHeight;
      await sleep(8 + Math.random() * 8);
    }

    // Done
    btnElement.classList.remove('loading');
    btnElement.querySelector('.scrub-btn-text').textContent = originalText;
    isTyping = false;

    // Increment counter
    incrementCounter();
  }

  // Bind Standard Buttons
  quickScrubBtn.addEventListener('click', () => executeScrub('Quick', quickScrubBtn));
  scrubBtn.addEventListener('click', () => executeScrub('Balanced', scrubBtn));
  deepScrubBtn.addEventListener('click', () => executeScrub('Deep', deepScrubBtn));

  // Custom Scrub Logic
  customScrubBtn.addEventListener('click', () => {
    if (isTyping) return;
    
    // Hide context menu
    mockContext.style.opacity = '0';
    mockContext.style.pointerEvents = 'none';
    
    // Show modal
    ciModal.classList.add('show');
    
    // Load existing instruction if any
    const savedInstruction = localStorage.getItem('scrubItCustomInstruction');
    if (savedInstruction) {
      ciInput.value = savedInstruction;
    }
    
    ciInput.focus();
  });

  const closeCiModal = () => {
    ciModal.classList.remove('show');
  };

  ciCancelBtn.addEventListener('click', closeCiModal);
  ciCloseBtn.addEventListener('click', closeCiModal);

  ciSaveBtn.addEventListener('click', () => {
    const instruction = ciInput.value.trim();
    if (!instruction) return;
    
    // Save to local storage
    localStorage.setItem('scrubItCustomInstruction', instruction);
    
    // Close modal
    closeCiModal();
    
    // Execute scrub
    executeScrub('Custom', customScrubBtn, instruction);
  });

  // ═══════════════════════════════════════════
  // 9. COPY BUTTON
  // ═══════════════════════════════════════════
  copyBtn.addEventListener('click', () => {
    const text = demoOutput.textContent;
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Copied
      `;
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        `;
        copyBtn.classList.remove('copied');
      }, 1800);
    });
  });

  // ═══════════════════════════════════════════
  // 10. KEYBOARD NAVIGATION
  // ═══════════════════════════════════════════
  document.addEventListener('keydown', (e) => {
    // Don't capture if user is typing in textarea
    if (document.activeElement === demoInput) return;

    const panelWidth = window.innerWidth;
    const currentPanel = Math.round(container.scrollLeft / panelWidth);

    if (e.key === 'ArrowRight' && currentPanel < panels.length - 1) {
      container.scrollTo({
        left: (currentPanel + 1) * panelWidth,
        behavior: 'smooth'
      });
    } else if (e.key === 'ArrowLeft' && currentPanel > 0) {
      container.scrollTo({
        left: (currentPanel - 1) * panelWidth,
        behavior: 'smooth'
      });
    }
  });

  // ═══════════════════════════════════════════
  // 10.5. MOCK CHAT SEND HANDLER
  // ═══════════════════════════════════════════
  const sendBtn = document.querySelector('.cg-send');
  
  // Inject typing indicator bounce styles dynamically
  const bounceStyle = document.createElement('style');
  bounceStyle.textContent = `
    @keyframes typing-bounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-5px); }
    }
  `;
  document.head.appendChild(bounceStyle);

  async function handleSend() {
    if (isTyping) return;
    
    const inputText = demoInput.value.trim();
    if (!inputText) return;

    const chatContainer = document.getElementById('demo-output');
    if (!chatContainer) return;

    let wrapper = chatContainer.querySelector('.chat-messages-wrapper');
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.className = 'chat-messages-wrapper';
      chatContainer.appendChild(wrapper);
    }

    // 1. Add user message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-msg user';
    
    if (wasScrubbed) {
      userMsgDiv.innerHTML = `
        <div class="chat-msg-content">
          <div class="scrubbed-badge-inline">⚡ ${lastScrubbedBadge || 'Balanced Scrubbed'}</div>
          <div>${inputText.replace(/\n/g, '<br/>')}</div>
        </div>
      `;
    } else {
      userMsgDiv.innerHTML = `
        <div class="chat-msg-content">
          <div>${inputText.replace(/\n/g, '<br/>')}</div>
        </div>
      `;
    }
    
    wrapper.appendChild(userMsgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Clear input & reset state
    demoInput.value = '';
    const tempWasScrubbed = wasScrubbed;
    wasScrubbed = false;
    isTyping = true;

    // 2. Add typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg assistant typing-indicator-msg';
    
    let avatarSvg = '';
    let avatarClass = '';
    let avatarText = '';
    if (selectedModel === 'chatgpt') {
      avatarClass = 'chatgpt-icon';
      avatarText = 'GPT';
      avatarSvg = `<svg viewBox="0 0 24 24" width="11" height="11" fill="#fff"><path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/></svg>`;
    } else if (selectedModel === 'claude') {
      avatarClass = 'claude-icon';
      avatarText = 'C';
      avatarSvg = `<svg viewBox="0 0 16 16" width="11" height="11" fill="#fff"><path d="m3.127 10.604 3.135-1.76.053-.153-.053-.085H6.11l-.525-.032-1.791-.048-1.554-.065-1.505-.08-.38-.081L0 7.832l.036-.234.32-.214.455.04 1.009.069 1.513.105 1.097.064 1.626.17h.259l.036-.105-.089-.065-.068-.064-1.566-1.062-1.695-1.121-.887-.646-.48-.327-.243-.306-.104-.67.435-.48.585.04.15.04.593.456 1.267.981 1.654 1.218.242.202.097-.068.012-.049-.109-.181-.9-1.626-.96-1.655-.428-.686-.113-.411a2 2 0 0 1-.068-.484l.496-.674L4.446 0l.662.089.279.242.411.94.666 1.48 1.033 2.014.302.597.162.553.06.17h.105v-.097l.085-1.134.157-1.392.154-1.792.052-.504.25-.605.497-.327.387.186.319.456-.045.294-.19 1.23-.37 1.93-.243 1.29h.142l.161-.16.654-.868 1.097-1.372.484-.545.565-.601.363-.287h.686l.505.751-.226.775-.707.895-.585.759-.839 1.13-.524.904.048.072.125-.012 1.897-.403 1.024-.186 1.223-.21.553.258.06.263-.218.536-1.307.323-1.533.307-2.284.54-.028.02.032.04 1.029.098.44.024h1.077l2.005.15.525.346.315.424-.053.323-.807.411-3.631-.863-.872-.218h-.12v.073l.726.71 1.331 1.202 1.667 1.55.084.383-.214.302-.226-.032-1.464-1.101-.565-.497-1.28-1.077h-.084v.113l.295.432 1.557 2.34.08.718-.112.234-.404.141-.444-.08-.911-1.28-.94-1.44-.759-1.291-.093.053-.448 4.821-.21.246-.484.186-.403-.307-.214-.496.214-.98.258-1.28.21-1.016.19-1.263.112-.42-.008-.028-.092.012-.953 1.307-1.448 1.957-1.146 1.227-.274.109-.477-.247.045-.44.266-.39 1.586-2.018.956-1.25.617-.723-.004-.105h-.036l-4.212"/></svg>`;
    } else if (selectedModel === 'gemini') {
      avatarClass = 'gemini-icon';
      avatarText = 'G';
      avatarSvg = `<svg viewBox="0 0 24 24" width="11" height="11" fill="#fff"><path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z"/></svg>`;
    }

    typingDiv.innerHTML = `
      <div class="chat-avatar ${avatarClass}">${avatarSvg}</div>
      <div class="chat-msg-content">
        <div class="typing-indicator" style="display: flex; gap: 4px; align-items: center; height: 20px;">
          <span style="width: 6px; height: 6px; background-color: #aaa; border-radius: 50%; display: inline-block; animation: typing-bounce 1.4s infinite ease-in-out; animation-delay: 0s;"></span>
          <span style="width: 6px; height: 6px; background-color: #aaa; border-radius: 50%; display: inline-block; animation: typing-bounce 1.4s infinite ease-in-out; animation-delay: 0.2s;"></span>
          <span style="width: 6px; height: 6px; background-color: #aaa; border-radius: 50%; display: inline-block; animation: typing-bounce 1.4s infinite ease-in-out; animation-delay: 0.4s;"></span>
        </div>
      </div>
    `;
    wrapper.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Simulated network/thinking delay
    await sleep(1200 + Math.random() * 600);
    
    // Remove typing indicator
    typingDiv.remove();

    // 3. Select custom reply based on the input
    let reply = '';
    const lowerInput = inputText.toLowerCase();

    if (!tempWasScrubbed) {
      // If the user didn't scrub their prompt, let the assistant give a slightly generic, but polite recommendation to use "Scrub It"
      reply = `I've received your request! While I can work with this, you might get significantly better, more structured, and professional results by selecting your text, right-clicking, and choosing **"Scrub with Scrub It"**! This will automatically format it with clear role descriptions, key constraints, and model-specific context. Let me know if you would like me to answer this current prompt as-is!`;
    } else {
      if (lowerInput.includes('code') || lowerInput.includes('build') || lowerInput.includes('create') || lowerInput.includes('react') || lowerInput.includes('tech stack')) {
        reply = `Certainly! Based on your optimized parameters, here is a clean, secure, and production-ready implementation that meets all specified constraints:\n\n\`\`\`tsx\n// Production-ready component implementation\nimport React, { useState, useEffect } from 'react';\n\ninterface ComponentProps {\n  title?: string;\n  onComplete?: () => void;\n}\n\nexport const SmartFeature: React.FC<ComponentProps> = ({ title = "Secure Feature", onComplete }) => {\n  const [data, setData] = useState<string | null>(null);\n  const [isLoading, setIsLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n\n  // Optimized state handling and secure request execution\n  const handleAction = async () => {\n    setIsLoading(true);\n    setError(null);\n    try {\n      // Execute with proper validation\n      if (onComplete) onComplete();\n    } catch (err) {\n      setError(err instanceof Error ? err.message : 'An error occurred');\n    }\n    setIsLoading(false);\n  };\n\n  return (\n    <div className="p-6 bg-zinc-950 border border-zinc-800 rounded-xl max-w-md shadow-lg">\n      <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>\n      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}\n      <button \n        onClick={handleAction}\n        disabled={isLoading}\n        className="mt-4 px-4 py-2 bg-white text-zinc-950 hover:bg-zinc-200 transition-colors font-medium rounded-lg text-sm disabled:opacity-50"\n      >\n        {isLoading ? 'Processing...' : 'Run Securely'}\n      </button>\n    </div>\n  );\n};\n\`\`\`\n\n**Architectural Decisions implemented:**\n• **Strict Typing:** Created TypeScript interfaces for props and states to prevent runtime bugs.\n• **Accessibility:** Form and buttons are designed with standard focus and tab targeting.\n• **State isolation:** Error and loading boundaries are local to avoid global UI layout shifts.\n\nLet me know if you would like to customize the styling, adjust the state structure, or run unit tests on this component!`;
      } else if (lowerInput.includes('explain') || lowerInput.includes('understand') || lowerInput.includes('what is') || lowerInput.includes('how does')) {
        reply = `Here is a highly intuitive, professor-grade breakdown of the topic, structured precisely to help a beginner build an immediate, accurate mental model.\n\n### 1. The Core Metaphor 🔄\nThink of this concept like an international airport terminal. Classic approaches are like a single luggage belt where all bags must wait in line. The optimized approach is like having smart, adaptive sorting systems that instantly route baggage direct to their specific passenger terminals simultaneously.\n\n### 2. Key Sub-concepts Explained Simply 🧠\n• **Dynamic Routing:** Instead of fixed schedules, decisions are made in real-time based on current flow.\n• **Superposition (Multi-tasking):** Processing multiple options at the exact same moment instead of checking them sequentialy.\n• **Entanglement (Interconnectedness):** When one system state updates, the corresponding systems adapt instantly, no matter how far away they are.\n\n### 3. Practical Applications 🚀\n1. **High-Frequency Trading:** Minimizing queue latencies to absolute fractions of a millisecond.\n2. **Molecular Simulation:** Simulating compound structures for faster medical discoveries.\n3. **Supply Chain Logistics:** Instantly rerouting thousands of packages during global disruptions.\n\n### 4. Common Misconception ❌\n*The biggest myth is that this will completely replace all standard systems.* In reality, it will work alongside them as a specialized acceleration layer for highly complex processing tasks.\n\n**One-Sentence Summary:** It's the difference between doing tasks one by one at lightning speed, versus doing all tasks at the exact same time. Let me know if you want to explore any of these applications further!`;
      } else if (lowerInput.includes('blog') || lowerInput.includes('post') || lowerInput.includes('article') || lowerInput.includes('essay') || lowerInput.includes('write')) {
        reply = `Here is the comprehensive draft outline and content structure created according to your expert tone and structural requirements:\n\n# The Shift to Calm Intelligence: Designing for Flow\n\n### Introduction (The Hook) 🌟\nEvery builder knows the feeling of tool friction. It's the silent killer of creative flow. But what happens when our interfaces become calm, native extensions of our thoughts rather than separate systems we have to command?\n\n### 3 Key Insights with Practical Examples 💡\n*   **Insight 1: Invisible Complexity is the New Standard.** The best tools hide the technical machinery. *Example:* Modern macOS-style overlay modals that do complex processing in under 200ms without drawing attention to themselves.\n*   **Insight 2: Opinionated Defaults Boost Speed.** Never present a user with a blank canvas when they want immediate value. Let them modify, not create from scratch.\n*   **Insight 3: Tactile Interaction Enhances Engagement.** Fine-tuned transitions, micro-spring curves, and audio feedback make the interface feel physical and real.\n\n### Implications & Conclusion 🔮\nAs AI continues to be woven natively into the operating system level of our daily tools, the premium will shift from *knowing how to use* a system to *how fluidly we can express our intent*.\n\n**Next Steps:** Let me know if you would like me to expand any of these subheadings into full 300-word sections, or adjust the overarching voice to be more technical!`;
      } else {
        reply = `Here is a structured, highly actionable response designed specifically to address your request with maximum precision:\n\n**Overview & Strategy:**\nTo achieve the best outcome, we focus on high-fidelity execution, clear constraints, and structural consistency.\n\n**Core Action Items:**\n• **Isolate Variables:** Ensure each task has a single, testable responsibility.\n• **Incorporate Context:** Never rely on the model to "guess" your implicit assumptions. State the role and audience explicitly.\n• **Define Format:** Request exact output boundaries (e.g., specific JSON schemas, markdown tables, or code templates).\n\nLet me know if you would like to specialize this approach for a particular platform or dive deeper into any of these steps!`;
      }
    }

    // 4. Add assistant message & stream the response
    const assistantMsgDiv = document.createElement('div');
    assistantMsgDiv.className = 'chat-msg assistant';
    assistantMsgDiv.innerHTML = `
      <div class="chat-avatar ${avatarClass}">${avatarSvg}</div>
      <div class="chat-msg-content"></div>
    `;
    wrapper.appendChild(assistantMsgDiv);
    const contentDiv = assistantMsgDiv.querySelector('.chat-msg-content');

    let currentText = '';
    for (let i = 0; i < reply.length; i++) {
      currentText += reply[i];
      contentDiv.innerHTML = formatMarkdown(currentText);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      // Faster typing speed for coding/long text blocks to prevent waiting too long
      const delay = reply[i] === '\n' ? 30 : (4 + Math.random() * 4);
      await sleep(delay);
    }

    isTyping = false;
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }

  demoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // ═══════════════════════════════════════════
  // 11. INTERACTIVE HERO LOGO (SCRUB & SOUND)
  // ═══════════════════════════════════════════
  const heroIcon = document.querySelector('.hero-icon');
  const scrubAudio = new Audio('assets/scrub-sound.mp3');
  
  // Preload sound
  scrubAudio.preload = 'auto';

  function triggerLogoScrub() {
    if (heroIcon.classList.contains('scrubbing')) return;

    // Trigger animation
    heroIcon.classList.add('scrubbing');
    
    // Play sound
    playScrubSound();

    // Increment global counter
    incrementCounter();

    // Remove class when animation completes (match CSS 0.6s)
    setTimeout(() => {
      heroIcon.classList.remove('scrubbing');
    }, 600);
  }

  function playScrubSound() {
    scrubAudio.currentTime = 0;
    scrubAudio.play().catch(err => {
      console.warn('Audio playback delayed or blocked until user interacts with the page.', err);
    });
  }

  const heroArrows = document.getElementById('hero-arrows');

  if (heroIcon) {
    // Handle touch/click (mobile & desktop) — hover trigger removed!
    heroIcon.addEventListener('click', triggerLogoScrub);
    heroIcon.addEventListener('touchstart', (e) => {
      e.preventDefault();
      triggerLogoScrub();
    }, { passive: false });
  }

  if (heroArrows) {
    // Touching or clicking the arrows also triggers the scrub
    heroArrows.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent duplicate event bubbling
      triggerLogoScrub();
    });
    heroArrows.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      triggerLogoScrub();
    }, { passive: false });
  }

  // ═══════════════════════════════════════════
  // 12. INSTALLATION MODAL LOGIC
  // ═══════════════════════════════════════════
  const installModal = document.getElementById('installation-modal');
  const closeInstallModalBtn = document.getElementById('close-install-modal');
  const installTriggers = document.querySelectorAll('.open-install-modal');

  if (installModal && closeInstallModalBtn) {
    installTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent jump to #
        installModal.style.opacity = '1';
        installModal.style.pointerEvents = 'auto';
      });
    });

    closeInstallModalBtn.addEventListener('click', () => {
      installModal.style.opacity = '0';
      installModal.style.pointerEvents = 'none';
    });

    // Close when clicking outside
    installModal.addEventListener('click', (e) => {
      if (e.target === installModal) {
        installModal.style.opacity = '0';
        installModal.style.pointerEvents = 'none';
      }
    });
  }

  // ═══════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

});
