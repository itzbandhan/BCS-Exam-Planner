// ============================================================
// NOTES.JS — Notes & AI Summarization
// Uses local storage and Gemini API
// ============================================================

let currentNoteSubject = null;
let saveTimeout = null;

function initNotes() {
    const tabsEl = document.getElementById('notes-subject-tabs');
    const editorEl = document.getElementById('note-editor');
    
    if (!tabsEl || !editorEl) return;

    // Build Tabs
    tabsEl.innerHTML = '';
    const sData = window.subjectsData || {};
    const keys = Object.keys(sData);
    
    keys.forEach((key, i) => {
        const btn = document.createElement('button');
        btn.className = 'subject-tab';
        btn.dataset.key = key;
        btn.textContent = sData[key].shortTitle || key;
        btn.onclick = () => selectNoteSubject(key);
        tabsEl.appendChild(btn);
    });

    // Default selection
    if (keys.length > 0) {
        selectNoteSubject(keys[0]);
    }

    // Editor Event Listeners
    editorEl.addEventListener('input', () => {
        updateWordCount(); // Immediate feedback
        // Debounce save
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveNotes, 500);
    });

    // Note: The generateAISummary button was removed and replaced with inline onclick handlers for executeAICommand
}

// Global scope definition for the new AI modes
const AI_PROMPTS = {
    summarize: "You are an expert technical examiner. Provide a highly condensed, maximum-yield summary of the following notes focusing strictly on exam probability and core concepts:\n\n",
    explain: "Explain the following concepts intuitively. Use a simple, brilliant analogy to make the core logic instantly click for someone who is confused:\n\n",
    flashcards: "Convert the essence of the following notes into 5 extremely concise Q&A flashcards. Format strictly as:\n**Q: [Question]**\n*A: [Answer]*\n\nNotes to process:\n\n",
    quiz: "Acting as a Senior University technical examiner, generate exactly 10 high-yield multiple-choice questions (MCQs) for a technical BSc CSNT exam based on the provided notes. Focus on critical definitions, architectural details, and probable problem-solving scenarios. Return ONLY a valid JSON array. Each object must have: 'q' (rigorous question), 'o' (array of 4 distinct choices), 'a' (correct index 0-3), and 'e' (a precise, one-sentence technical justification, max 20 words). Ensure the tone is formal, technically accurate, and concise.\n\nNotes Context:\n\n"
};

// --- API Resilience: Fetch with Exponential Backoff ---
async function fetchWithRetry(url, options, maxRetries = 3) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            
            // Only retry on 503 (Service Unavailable), 429 (Too Many Requests), or 500
            if (![500, 503, 429, 504].includes(response.status)) {
                return response; // Not a transient error
            }

            retries++;
            const delay = Math.pow(2, retries) * 1000 + (Math.random() * 1000);
            console.warn(`Gemini API 503/Transient Error. Retry ${retries}/${maxRetries} in ${Math.round(delay)}ms...`);
            await new Promise(r => setTimeout(r, delay));
        } catch (err) {
            retries++;
            if (retries >= maxRetries) throw err;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    throw new Error("Max retries exceeded for AI Hub request.");
}

// --- Interactive Quiz Controller ---
const QuizManager = {
    questions: [],
    currentIndex: 0,
    score: 0,
    locked: false,

    start: function(data) {
        this.questions = data;
        this.currentIndex = 0;
        this.score = 0;
        this.render();
    },

    render: function() {
        const aiContent = document.getElementById('ai-content');
        if (!aiContent || !this.questions[this.currentIndex]) return;

        const q = this.questions[this.currentIndex];
        const progress = Math.round(((this.currentIndex) / this.questions.length) * 100);

        aiContent.innerHTML = `
            <div class="quiz-container animate-fade-in p-1">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Step ${this.currentIndex + 1} of 10</span>
                    <span class="text-[10px] font-bold text-slate-500">${this.score} pts</span>
                </div>
                
                <div class="progress-track mb-6 h-1">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>

                <h3 class="text-lg font-bold text-white mb-6 leading-relaxed">${q.q}</h3>
                
                <div class="grid gap-3" id="quiz-options">
                    ${q.o.map((opt, i) => `
                        <button class="quiz-btn" onclick="QuizManager.select(${i})">${opt}</button>
                    `).join('')}
                </div>
                
                <div id="quiz-feedback" class="mt-6 hidden">
                    <div class="p-4 rounded-lg border border-opacity-20" id="feedback-box">
                        <p id="feedback-text" class="text-sm font-semibold mb-2"></p>
                        <p id="explanation-text" class="text-xs text-slate-400 leading-relaxed"></p>
                        <button class="btn-primary w-full mt-4 justify-center" onclick="QuizManager.next()">
                            ${this.currentIndex === this.questions.length - 1 ? 'Finish Session' : 'Proceed to Next Target'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    select: function(idx) {
        if (this.locked) return;
        this.locked = true;

        const q = this.questions[this.currentIndex];
        const isCorrect = idx === q.a;
        if (isCorrect) this.score += 10;

        const options = document.querySelectorAll('.quiz-btn');
        options[idx].classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) options[q.a].classList.add('correct');

        const feedback = document.getElementById('quiz-feedback');
        const box = document.getElementById('feedback-box');
        const fText = document.getElementById('feedback-text');
        const eText = document.getElementById('explanation-text');

        fText.textContent = isCorrect ? "🎯 DATA VERIFIED" : "🚨 MISMATCH DETECTED";
        fText.style.color = isCorrect ? "var(--accent-emerald)" : "var(--accent-rose)";
        box.style.borderColor = isCorrect ? "var(--accent-emerald)" : "var(--accent-rose)";
        box.style.background = isCorrect ? "rgba(16, 185, 129, 0.05)" : "rgba(244, 63, 94, 0.05)";
        
        eText.textContent = q.e;
        feedback.classList.remove('hidden');
        
        if (typeof showToast === 'function') {
            showToast(isCorrect ? "+10 Analysis Points" : "Concept review required", isCorrect ? 'success' : 'locked');
        }
    },

    next: function() {
        this.locked = false;
        this.currentIndex++;
        if (this.currentIndex < this.questions.length) {
            this.render();
        } else {
            this.finish();
        }
    },

    finish: function() {
        const aiContent = document.getElementById('ai-content');
        const pct = Math.round((this.score / (this.questions.length * 10)) * 100);
        
        aiContent.innerHTML = `
            <div class="text-center py-8 animate-fade-in">
                <div class="text-5xl mb-4">🏆</div>
                <h2 class="text-2xl font-bold text-white mb-2">Session Complete</h2>
                <p class="text-slate-400 mb-6">Final accuracy achieved: ${pct}%</p>
                
                <div class="p-6 rounded-xl border border-white border-opacity-10 bg-white bg-opacity-5 mb-6">
                    <div class="text-4xl font-mono font-bold text-gradient mb-1">${this.score}</div>
                    <div class="text-[10px] uppercase tracking-widest text-slate-500">Analysis Points Earned</div>
                </div>

                <button class="btn-primary w-full justify-center" onclick="selectNoteSubject(currentNoteSubject)">
                    Return to Mission Hub
                </button>
            </div>
        `;
        
        if (typeof triggerConfetti === 'function' && pct >= 70) triggerConfetti();
        // Save history
        PlannerStorage.set(`ai_history_${currentNoteSubject}`, aiContent.innerHTML);
    }
};

window.QuizManager = QuizManager;

function selectNoteSubject(key) {
    currentNoteSubject = key;
    
    // Update active tab
    document.querySelectorAll('#notes-subject-tabs .subject-tab').forEach(t => {
        t.classList.toggle('active-tab', t.dataset.key === key);
    });

    // Load Notes
    const editorEl = document.getElementById('note-editor');
    if (editorEl) {
        editorEl.value = PlannerStorage.get(`notes_${key}`) || '';
        updateWordCount();
    }

    // Load Cached Summary if exists
    const aiContent = document.getElementById('ai-content');
    if (aiContent) {
        const cachedHistory = PlannerStorage.get(`ai_history_${key}`);
        if (cachedHistory) {
            aiContent.innerHTML = cachedHistory;
        } else {
            aiContent.innerHTML = '<p class="text-sm text-slate-500 italic mt-4">Select an AI module to process your notes. Responses will append here.</p>';
        }
    }
}

function saveNotes() {
    if (!currentNoteSubject) return;
    const editorEl = document.getElementById('note-editor');
    if (editorEl) {
        PlannerStorage.set(`notes_${currentNoteSubject}`, editorEl.value);
    }
}

function updateWordCount() {
    const editorEl = document.getElementById('note-editor');
    const countEl = document.getElementById('note-word-count');
    if (!editorEl || !countEl) return;
    
    const text = editorEl.value || '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    countEl.textContent = `${words} words • ${chars} chars`;
}

function extractJSON(text) {
    try {
        // Try direct parse first
        return JSON.parse(text);
    } catch (e) {
        // Look for JSON array or object pattern
        const startArr = text.indexOf('[');
        const endArr = text.lastIndexOf(']');
        const startObj = text.indexOf('{');
        const endObj = text.lastIndexOf('}');

        let start = -1;
        let end = -1;

        if (startArr !== -1 && (startObj === -1 || startArr < startObj)) {
            start = startArr;
            end = endArr;
        } else if (startObj !== -1) {
            start = startObj;
            end = endObj;
        }

        if (start !== -1 && end !== -1 && end > start) {
            const possibleJSON = text.substring(start, end + 1);
            return JSON.parse(possibleJSON);
        }
        throw new Error("No JSON structure found in AI response");
    }
}

window.executeAICommand = async function(mode) {
    const editorEl = document.getElementById('note-editor');
    const aiContent = document.getElementById('ai-content');
    const aiLoading = document.getElementById('ai-loading');
    
    if (!editorEl || !currentNoteSubject || !aiContent) return;
    
    const text = editorEl.value.trim();
    if (!text) {
        showToast("Enter some notes to process first", 'locked');
        return;
    }
    
    const apiKey = PlannerStorage.get('gemini_api_key');
    if (!apiKey) {
        showToast("API Key required. Please set it in Settings.", 'locked');
        setTimeout(() => toggleSettings(), 1000);
        return;
    }

    const modeTitles = {
        summarize: "📝 Summary Execution",
        explain: "🧠 ELI5 Concept Breakdown",
        flashcards: "⚡ Smart Flashcards",
        quiz: "🎯 Target Quiz Generator"
    };

    // UI Loading State (append a loading skeleton at top)
    const promptText = AI_PROMPTS[mode];

    // Add loading indicator
    const loadId = 'ai-loading-' + Date.now();
    const tempDiv = document.createElement('div');
    tempDiv.id = loadId;
    tempDiv.className = "mb-6 p-4 rounded-lg bg-indigo-900 bg-opacity-20 border border-indigo-500 border-opacity-30";
    tempDiv.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-indigo-400 border-t-transparent"></div>
            <h4 class="font-bold text-indigo-400">${modeTitles[mode]}...</h4>
        </div>
        <p class="animate-pulse text-sm text-slate-400 mt-2">Connecting to AI Hub — Gemini Flash Latest...</p>
    `;
    aiContent.prepend(tempDiv);
    
    // Smooth scroll to top of AI output
    aiContent.scrollTo({ top: 0, behavior: 'smooth' });

    try {
        const promptContext = promptText + text;
        const body = {
            contents: [{ parts: [{ text: promptContext }] }],
            generationConfig: {
                temperature: mode === 'quiz' ? 0.2 : 0.3, 
                maxOutputTokens: mode === 'quiz' ? 4096 : 1000,
            }
        };

        // If quiz mode, we strongly suggest JSON format
        if (mode === 'quiz') {
            body.generationConfig.response_mime_type = "application/json";
        }

        const response = await fetchWithRetry(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        let aiResult;
        if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
           aiResult = data.candidates[0].content.parts[0].text;
        } else {
            throw new Error("Invalid response format from Gemini");
        }

        if (mode === 'quiz') {
            try {
                // Use robust extraction
                const quizData = extractJSON(aiResult);
                QuizManager.start(quizData);
                if (aiLoading) aiLoading.style.display = 'none';
                return; // Quiz takes over UI
            } catch (pErr) {
                console.error("Quiz Parse Error:", pErr, aiResult);
                throw new Error("Invalid Format Detected. Try simplifying your notes or shortening the text.");
            }
        }

        // Replace loading div with actual content for standard markdown modes
        const markdownHtml = formatMarkdown(aiResult);
        const finalBlock = `
            <div class="mb-6 p-4 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10 shadow-lg">
                <h4 class="font-bold text-violet-400 mb-3 border-b border-white border-opacity-10 pb-2">${modeTitles[mode]}</h4>
                <div>${markdownHtml}</div>
            </div>
        `;
        
        document.getElementById(loadId).outerHTML = finalBlock;

        // Save to cache (Continuous History)
        PlannerStorage.set(`ai_history_${currentNoteSubject}`, aiContent.innerHTML);
        
        showToast("Processing complete!", 'success');
        
        if (aiLoading) aiLoading.style.display = 'none';
        
    } catch (err) {
        console.error("AI execution failed:", err);
        showToast("Failed to process command. Check API key.", 'locked');
        const loadEl = document.getElementById(loadId);
        if (loadEl) {
            loadEl.innerHTML = `<h4 class="font-bold text-rose-400 mb-2">${modeTitles[mode]} Failed</h4><p class="text-rose-300 text-sm">Error: ${err.message}</p>`;
        }
    }
}

// Simple markdown formatter since we don't have a library
function formatMarkdown(text) {
    if (!text) return '';
    
    let html = text
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        // Bold
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Lists
        .replace(/^\s*\-\s(.*$)/gim, '<ul><li>$1</li></ul>')
        // Combine adjacent lists
        .replace(/<\/ul>\n<ul>/g, '\n')
        // Paragraphs
        .replace(/\n\n/g, '</p><p>');
        
    return `<p>${html}</p>`;
}

// Call on startup is handled via app.js


// Cloud Sync Listener
PlannerStorage.addListener(() => {
    if (document.getElementById('notes').classList.contains('active')) {
        const activeTab = document.querySelector('#notes-subject-tabs .subject-tab.active-tab');
        if (activeTab) selectNoteSubject(activeTab.dataset.key);
    }
});

