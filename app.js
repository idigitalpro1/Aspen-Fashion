/* ============================================================
   Aspen Fashion – AI Style Intelligence
   JavaScript Application Logic
   Uses Google Gemini API via AI Studio
   ============================================================ */

'use strict';

// ---------- Constants ----------
const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

// ---------- Gemini generation config ----------
const GENERATION_CONFIG = {
  temperature: 0.9,   // Slightly creative but grounded
  topP: 0.95,
  maxOutputTokens: 1024,
};

// ---------- State ----------
const STATE = {
  apiKey: null,
  history: [],          // Gemini conversation history
  pendingImageBase64: null,
  pendingImageMimeType: null,
  pendingImageName: null,
  isSending: false,
};

// ---------- Gemini API ----------
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const SYSTEM_PROMPT = `You are Aspen, a highly knowledgeable and enthusiastic AI fashion stylist for the AspenFashion app. 
You specialize in:
- Outfit recommendations and coordination
- Current fashion trends (seasonal and runway)
- Personal style development and capsule wardrobes
- Color theory and palette matching for different skin tones
- Body type styling advice
- Occasion-appropriate dressing (business, casual, formal, events)
- Sustainable and budget-conscious fashion choices
- Accessory pairing and layering techniques
- Brand and shopping recommendations across all price points

Your tone is warm, encouraging, and stylish. You give specific, actionable advice. 
When analyzing images, describe what you see in detail and give targeted feedback.
Always end responses with a brief, encouraging tip or next styling step.
Keep responses concise but comprehensive — use bullet points or short paragraphs for readability.`;

async function callGeminiAPI(userMessage, imageData) {
  const url = `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${STATE.apiKey}`;

  // Build the user turn parts
  const parts = [];

  // Add image if present
  if (imageData) {
    parts.push({
      inlineData: {
        mimeType: imageData.mimeType,
        data: imageData.base64,
      },
    });
  }

  // Add text
  parts.push({ text: userMessage });

  // Build full contents array (history + new message)
  const contents = [
    // Inject system context as first user turn if history is empty
    ...(STATE.history.length === 0
      ? [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Understood! I\'m Aspen, your personal AI fashion stylist. I\'m ready to help you look and feel amazing. What can I style for you today? ✨' }] },
        ]
      : []),
    ...STATE.history,
    { role: 'user', parts },
  ];

  const body = {
    contents,
    generationConfig: GENERATION_CONFIG,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const msg = err?.error?.message || `API error ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response generated. Please try again.');
  }

  // Update history
  STATE.history.push({ role: 'user', parts });
  STATE.history.push({ role: 'model', parts: [{ text }] });

  // Keep history bounded to last 20 turns to avoid token limits
  if (STATE.history.length > 20) {
    STATE.history = STATE.history.slice(-20);
  }

  return text;
}

// ---------- API Connection ----------
function connectAPI() {
  const input = document.getElementById('apiKeyInput');
  const key = input.value.trim();

  if (!key) {
    showInputError(input, 'Please enter your API key');
    return;
  }

  if (!key.startsWith('AI') || key.length < 20) {
    showInputError(input, 'This doesn\'t look like a valid Gemini API key');
    return;
  }

  STATE.apiKey = key;

  document.getElementById('apiSetup').classList.add('hidden');
  document.getElementById('chatInterface').classList.remove('hidden');
}

function disconnectAPI() {
  STATE.apiKey = null;
  STATE.history = [];
  document.getElementById('chatInterface').classList.add('hidden');
  document.getElementById('apiSetup').classList.remove('hidden');
  document.getElementById('apiKeyInput').value = '';
}

function showInputError(input, msg) {
  input.style.borderColor = '#f87171';
  input.placeholder = msg;
  input.value = '';
  setTimeout(() => {
    input.style.borderColor = '';
    input.placeholder = 'Paste your Gemini API key here...';
  }, 3000);
}

// ---------- Messaging ----------
async function sendMessage() {
  if (STATE.isSending) return;

  const inputEl = document.getElementById('userInput');
  const text = inputEl.value.trim();
  const imageData = STATE.pendingImageBase64
    ? { base64: STATE.pendingImageBase64, mimeType: STATE.pendingImageMimeType }
    : null;

  if (!text && !imageData) return;

  // Build display message
  let displayHtml = '';
  if (imageData) {
    displayHtml += `<img src="data:${imageData.mimeType};base64,${imageData.base64}" alt="Uploaded outfit" />`;
  }
  if (text) {
    displayHtml += `<span>${escapeHtml(text)}</span>`;
  }

  appendMessage('user', displayHtml);
  inputEl.value = '';
  autoResize(inputEl);
  removeImage();

  // Disable send
  STATE.isSending = true;
  setSendDisabled(true);

  // Show typing indicator
  const typingId = showTyping();

  try {
    const reply = await callGeminiAPI(text || 'Please analyze this outfit image.', imageData);
    removeTyping(typingId);
    appendMessage('assistant', formatAIResponse(reply));
    // Hide quick prompts after first exchange
    document.getElementById('quickPrompts').style.display = 'none';
  } catch (err) {
    removeTyping(typingId);
    appendMessage('assistant', `<p>⚠️ <strong>Error:</strong> ${escapeHtml(err.message)}</p><p>Please check your API key and try again.</p>`);
  } finally {
    STATE.isSending = false;
    setSendDisabled(false);
    inputEl.focus();
  }
}

function sendQuickPrompt(prompt) {
  const inputEl = document.getElementById('userInput');
  inputEl.value = prompt;
  autoResize(inputEl);
  sendMessage();
}

function appendMessage(role, html) {
  const container = document.getElementById('chatMessages');

  const msg = document.createElement('div');
  msg.className = `message ${role === 'user' ? 'user-message' : 'assistant-message'}`;

  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'message-avatar';
  avatarDiv.textContent = role === 'user' ? '👤' : '✦';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.innerHTML = html;

  msg.appendChild(avatarDiv);
  msg.appendChild(contentDiv);
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
}

function showTyping() {
  const container = document.getElementById('chatMessages');
  const id = `typing-${Date.now()}`;

  const msg = document.createElement('div');
  msg.className = 'message assistant-message typing-indicator';
  msg.id = id;
  msg.innerHTML = `
    <div class="message-avatar">✦</div>
    <div class="message-content">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;

  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function clearChat() {
  STATE.history = [];
  const container = document.getElementById('chatMessages');
  container.innerHTML = `
    <div class="message assistant-message">
      <div class="message-avatar">✦</div>
      <div class="message-content">
        <p>Chat cleared! I'm ready to help you with fresh fashion advice. ✨ What would you like to explore?</p>
      </div>
    </div>`;
  document.getElementById('quickPrompts').style.display = 'flex';
}

// ---------- Image Handling ----------
function triggerImageUpload() {
  document.getElementById('imageUpload').click();
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a JPEG, PNG, WebP, or GIF image.');
    return;
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    alert('Image must be under 4 MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    // dataUrl = "data:<mimeType>;base64,<data>"
    const [header, base64] = dataUrl.split(',');
    const mimeType = header.match(/data:([^;]+)/)[1];

    STATE.pendingImageBase64 = base64;
    STATE.pendingImageMimeType = mimeType;
    STATE.pendingImageName = file.name;

    document.getElementById('uploadPreviewText').textContent = `📎 ${file.name}`;
    document.getElementById('removeImageBtn').classList.remove('hidden');
  };
  reader.readAsDataURL(file);

  // Reset the file input so the same file can be re-selected
  event.target.value = '';
}

function removeImage() {
  STATE.pendingImageBase64 = null;
  STATE.pendingImageMimeType = null;
  STATE.pendingImageName = null;
  document.getElementById('uploadPreviewText').textContent = 'No image selected';
  document.getElementById('removeImageBtn').classList.add('hidden');
}

// ---------- Input Helpers ----------
function handleKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
}

function setSendDisabled(disabled) {
  const btn = document.getElementById('sendBtn');
  btn.disabled = disabled;
  btn.innerHTML = disabled
    ? '<span>Sending…</span>'
    : '<span>Send</span><span class="send-icon">→</span>';
}

// ---------- Text Formatting ----------
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatAIResponse(text) {
  // Convert markdown-like formatting to HTML
  let html = escapeHtml(text);

  // Bold: **text** or __text__ (must be replaced before italic)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* or _text_
  // All ** and __ are already replaced, so any remaining * or _ are singles.
  // Use simple patterns without lookbehind for broad browser compatibility.
  html = html.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_\n]+?)_/g, '<em>$1</em>');

  // List items: lines starting with "- ", "• ", or a number followed by ". "
  html = html.replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> lines in <ul> using a line-by-line approach
  // to avoid ReDoS-prone regex on large inputs.
  html = wrapListItems(html);

  // Paragraphs: double newlines
  const blocks = html.split(/\n{2,}/);
  html = blocks
    .map((block) => {
      block = block.trim();
      if (!block) return '';
      if (block.startsWith('<ul>') || block.startsWith('<li>') || block.startsWith('<ol>')) {
        return block;
      }
      // Single newlines within a block → <br>
      return '<p>' + block.replace(/\n/g, '<br />') + '</p>';
    })
    .filter(Boolean)
    .join('');

  return html;
}

/**
 * Wraps consecutive <li>…</li> lines in a <ul> element.
 * Iterates line-by-line to avoid ReDoS-vulnerable regex on list content.
 */
function wrapListItems(html) {
  var lines = html.split('\n');
  var out = [];
  var inList = false;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var trimmed = line.trim();
    var isListItem = trimmed.startsWith('<li>') && trimmed.endsWith('</li>');

    if (isListItem) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(trimmed);
    } else {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(line);
    }
  }

  if (inList) {
    out.push('</ul>');
  }

  return out.join('\n');
}

// ---------- Navigation ----------
function scrollToAdvisor() {
  document.getElementById('advisor').scrollIntoView({ behavior: 'smooth' });
}

function scrollToFeatures() {
  document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// App is ready; no persistent session state to restore.
