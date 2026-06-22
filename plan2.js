// Application State Management for Plan 2
const state = {
    currentSkill: 'listening',
    currentStage: 1,
    completedSkills: [],
    mindStateSelected: null,
    grammarSelected: [],
    listeningOralLogValid: false,
    weekendSelected: null,
    readingKeywordsSelected: [],
    readingQuotesValid: false,
    readingTextMapValid: false,
    speakingChatPartner: 1,
    speakingConfidenceRating: 0,
    writingScenariosValid: false,
    writingStrategiesValid: false,
    writingActionPlanValid: false
};

// Skill Metadata for objectives & outcomes
const skillMetadata = {
    listening: {
        topic: 'Skill Focus: Listening',
        objective: 'Students will be able to listen to a discussion about mindfulness practices and interpret key mental health suggestions in pairs during a note-taking and sharing task by the end of the lesson.',
        outcomes: [
            'Can demonstrate understanding of extended discussions about health technologies and long-term habits.',
            'Can identify key points in conversations about mental health practices (e.g., "You might need to practice mindfulness to reduce stress.").'
        ]
    },
    reading: {
        topic: 'Skill Focus: Reading',
        objective: 'Students will be able to read an editorial on balancing technology and health and analyze key arguments about screen-time habits individually during a text-mapping activity by the end of the lesson.',
        outcomes: [
            'Can analyze opinion editorials on health and wellness topics, identifying the writer\'s stance and supporting arguments.',
            'Can evaluate informational content from articles about using healthy technology to develop good habits, identifying key points and potential biases.'
        ]
    },
    speaking: {
        topic: 'Skill Focus: Speaking',
        objective: 'Students will be able to present about personal wellness goals and habits, using modals for possibility and polite tone in small groups during a peer feedback circle by the end of the lesson.',
        outcomes: [
            'Can describe personal dreams and ambitions related to health and wellness, using clear and organized speech.',
            'Can discuss general health habits and their impact on well-being in a conversation with peers.'
        ]
    },
    writing: {
        topic: 'Skill Focus: Writing',
        objective: 'Students will be able to write a health action plan, using present perfect continuous and modals in pairs during a collaborative drafting task by the end of the lesson.',
        outcomes: [
            'Can outline strategies for personal development related to health and balance in a well-organized text.',
            'Can write reflections on personal habits and suggest improvements by using health technology to achieve better life balance.'
        ]
    }
};

// TTS Speech Transcripts
const speechTranscripts = {
    'listening-intro': "Hello! Today we are discussing wellness. What habits have you been promoting recently? Coach: Lately, I have been practicing meditation to help clients achieve physical and mental balance. Daily mindfulness might help you reduce stress. Furthermore, many students have been tracking their screentime. Doing a digital detox could improve your sleep consistency.",
    'speaking-dating-1': "Partner: I hope to manage stress, but screens keep me busy in bed.",
    'speaking-dating-2': "Partner: I want to improve my fitness routine using an app. I could use suggestions.",
    'speaking-dating-3': "Partner: I hope to maintain a regular sleep schedule, but I checked my phone too much."
};

// Toast message handler
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    const msgEl = document.getElementById('toast-message');
    
    toast.className = 'toast-feedback';
    if (type === 'success') {
        toast.classList.add('toast-success');
        icon.textContent = '✅';
    } else if (type === 'warning') {
        toast.classList.add('toast-warning');
        icon.textContent = '⚠️';
    } else {
        icon.textContent = '💡';
    }
    
    msgEl.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Helper functions for student validation and evaluation results
function validateStudentInfo(prefix) {
    const nameInput = document.getElementById(`${prefix}-student-name`);
    const dateInput = document.getElementById(`${prefix}-student-date`);
    const timeInput = document.getElementById(`${prefix}-student-time`);
    
    if (!nameInput || !dateInput || !timeInput) return null;
    
    const name = nameInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    
    if (!name || !date || !time) {
        showToast('Por favor, ingresa tu nombre, fecha y hora antes de enviar.', 'warning');
        return null;
    }
    return { name, date, time };
}

function showEvalResult(prefix, name, date, time, score, total) {
    const card = document.getElementById(`${prefix}-result-card`);
    if (card) {
        document.getElementById(`${prefix}-res-name`).textContent = name;
        document.getElementById(`${prefix}-res-datetime`).textContent = `${date} ${time}`;
        document.getElementById(`${prefix}-res-score`).textContent = `${score} / ${total}`;
        
        const pct = total > 0 ? (score / total) * 100 : 0;
        const bar = document.getElementById(`${prefix}-score-bar`);
        if (bar) {
            bar.style.width = `${pct}%`;
            if (pct >= 80) bar.style.backgroundColor = '#22c55e';
            else if (pct >= 50) bar.style.backgroundColor = '#eab308';
            else bar.style.backgroundColor = '#ef4444';
        }
        card.style.display = 'block';
        
        // Hide the student registration inputs after successful submission
        const infoDiv = document.getElementById(`${prefix}-student-info`);
        if (infoDiv) infoDiv.style.display = 'none';
    }
}


// Navigation Controllers
function switchSkill(skillName) {
    state.currentSkill = skillName;
    state.currentStage = 1;
    
    document.querySelectorAll('.skill-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const skillSec = document.getElementById(`${skillName}-section`);
    if (skillSec) skillSec.classList.add('active');
    
    const navItem = document.getElementById(`nav-${skillName}`);
    if (navItem) navItem.classList.add('active');
    
    const skillSectionContainer = document.getElementById(`${skillName}-section`);
    if (skillSectionContainer) {
        skillSectionContainer.querySelectorAll('.stage-container').forEach(container => {
            container.classList.remove('active');
        });
    }
    const stage1 = document.getElementById(`${skillName}-stage-1`);
    if (stage1) stage1.classList.add('active');
    
    const metadata = skillMetadata[skillName];
    if (metadata) {
        const currentTopic = document.getElementById('currentTopic');
        if (currentTopic) currentTopic.textContent = metadata.topic;
        
        const objectiveText = document.getElementById('objectiveText');
        if (objectiveText) objectiveText.textContent = metadata.objective;
        
        const outcomesList = document.getElementById('outcomesList');
        if (outcomesList) {
            outcomesList.innerHTML = '';
            metadata.outcomes.forEach(outcome => {
                const li = document.createElement('li');
                li.textContent = outcome;
                outcomesList.appendChild(li);
            });
        }
    }
    
    updateStepper();
    window.speechSynthesis.cancel();
    
    if (skillName === 'speaking') {
        if (typeof initSpeakingDatingChat === 'function') initSpeakingDatingChat();
    }
    
    showToast(`Loaded Plan 2 - ${skillName.charAt(0).toUpperCase() + skillName.slice(1)} Skill!`, 'info');
}

function updateStepper() {
    const stepper = document.getElementById('stageNav');
    if (!stepper) return;
    const steps = stepper.querySelectorAll('.stage-step');
    
    steps.forEach((step, idx) => {
        const stageNum = idx + 1;
        step.className = 'stage-step';
        
        if (stageNum === state.currentStage) {
            step.classList.add('active');
        } else if (stageNum < state.currentStage) {
            step.classList.add('completed');
        }
    });
}

function nextStage() {
    if (state.currentStage < 6) {
        const currentStageEl = document.getElementById(`${state.currentSkill}-stage-${state.currentStage}`);
        if (currentStageEl) currentStageEl.classList.remove('active');
        
        state.currentStage++;
        
        const nextStageEl = document.getElementById(`${state.currentSkill}-stage-${state.currentStage}`);
        if (nextStageEl) nextStageEl.classList.add('active');
        
        updateStepper();
        window.speechSynthesis.cancel();
        if (typeof stopRain === 'function') stopRain();
    }
}

function prevStage() {
    if (state.currentStage > 1) {
        const currentStageEl = document.getElementById(`${state.currentSkill}-stage-${state.currentStage}`);
        if (currentStageEl) currentStageEl.classList.remove('active');
        
        state.currentStage--;
        
        const prevStageEl = document.getElementById(`${state.currentSkill}-stage-${state.currentStage}`);
        if (prevStageEl) prevStageEl.classList.add('active');
        
        updateStepper();
        window.speechSynthesis.cancel();
        if (typeof stopRain === 'function') stopRain();
    }
}

function markSkillComplete(skillName) {
    if (!state.completedSkills.includes(skillName)) {
        state.completedSkills.push(skillName);
        const navItem = document.getElementById(`nav-${skillName}`);
        if (navItem) navItem.classList.add('completed');
    }
    
    showToast(`Congratulations! You have completed the ${skillName.toUpperCase()} skill.`, 'success');
    
    // Redirect back to Plan 2 Hub after 2 seconds
    setTimeout(() => {
        window.location.href = 'plan2hub.html';
    }, 2000);
}

// Side links event listener initialization
document.addEventListener('DOMContentLoaded', () => {
    // Read skill from body attribute if present
    const bodySkill = document.body.getAttribute('data-skill');
    if (bodySkill && ['listening','reading','speaking','writing'].includes(bodySkill)) {
        state.currentSkill = bodySkill;
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const skill = item.getAttribute('data-skill');
            switchSkill(skill);
        });
    });
    
    createWaveforms();
    if (typeof initListeningGrammarSelection === 'function') initListeningGrammarSelection();
    if (typeof initReadingKeywords === 'function') initReadingKeywords();
    
    // Initialize initial skill state
    switchSkill(state.currentSkill);
});

// ================= AUDIO SIMULATION WITH WEB SPEECH API & WEB AUDIO =================
let synthUtterance = null;
let waveInterval = null;
let audioCtx = null;
let rainSource = null;

function createWaveforms() {
    const waveContainers = ['waveform-l1', 'waveform-l2', 'waveform-s1'];
    waveContainers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
            for (let i = 0; i < 30; i++) {
                const bar = document.createElement('div');
                bar.className = 'wave-bar';
                bar.style.height = '4px';
                container.appendChild(bar);
            }
        }
    });
}

function speakText(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
}

function playRainfall() {
    const isPlaying = audioCtx && audioCtx.state === 'running';
    
    if (isPlaying) {
        stopRain();
        return;
    }
    
    // Start Web Audio noise synthesis
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        const bufferSize = 2 * audioCtx.sampleRate;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const whiteNoise = audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;
        
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 600;
        
        const gain = audioCtx.createGain();
        gain.gain.value = 0.12;
        
        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        
        whiteNoise.start();
        rainSource = whiteNoise;
        
        document.getElementById('playBtn-l1').textContent = '⏹';
        startWaveformAnimation(document.getElementById('waveform-l1'));
    } catch(err) {
        speakText("Shhhh. Listening to peaceful rain.");
    }
}

function stopRain() {
    if (rainSource) {
        rainSource.stop();
        rainSource = null;
    }
    if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
    }
    const playBtn = document.getElementById('playBtn-l1');
    if (playBtn) playBtn.textContent = '▶';
    stopWaveformAnimation(document.getElementById('waveform-l1'));
}

function playTTS(transcriptKey) {
    const isPlaying = synthUtterance && window.speechSynthesis.speaking;
    
    let activeBtn = null;
    let activeWave = null;
    
    if (transcriptKey === 'listening-intro') {
        activeBtn = document.getElementById('playBtn-l2');
        activeWave = document.getElementById('waveform-l2');
    } else if (transcriptKey.startsWith('speaking-dating')) {
        activeBtn = document.getElementById('playBtn-s1');
        activeWave = document.getElementById('waveform-s1');
    }
    
    if (isPlaying) {
        window.speechSynthesis.cancel();
        stopWaveformAnimation(activeWave, activeBtn);
        return;
    }
    
    const textToSpeak = speechTranscripts[transcriptKey];
    synthUtterance = new SpeechSynthesisUtterance(textToSpeak);
    synthUtterance.lang = 'en-US';
    synthUtterance.rate = 0.95;
    
    synthUtterance.onstart = () => {
        if (activeBtn) activeBtn.textContent = '⏹';
        if (activeWave) startWaveformAnimation(activeWave);
    };
    
    synthUtterance.onend = () => {
        stopWaveformAnimation(activeWave, activeBtn);
    };
    
    synthUtterance.onerror = () => {
        stopWaveformAnimation(activeWave, activeBtn);
    };
    
    window.speechSynthesis.speak(synthUtterance);
}

function startWaveformAnimation(waveContainer) {
    if (waveInterval) clearInterval(waveInterval);
    const bars = waveContainer.querySelectorAll('.wave-bar');
    
    waveInterval = setInterval(() => {
        bars.forEach(bar => {
            const height = Math.floor(Math.random() * 28) + 4;
            bar.style.height = `${height}px`;
            bar.classList.add('active');
        });
    }, 120);
}

function stopWaveformAnimation(waveContainer, playBtn) {
    if (waveInterval) {
        clearInterval(waveInterval);
        waveInterval = null;
    }
    if (playBtn) playBtn.textContent = '▶';
    if (waveContainer) {
        const bars = waveContainer.querySelectorAll('.wave-bar');
        bars.forEach(bar => {
            bar.style.height = '4px';
            bar.classList.remove('active');
        });
    }
}

function toggleTranscript(id) {
    const el = document.getElementById(id);
    el.classList.toggle('show');
}

// ================= LISTENING SKILL Plan 2 CONTROLLERS =================
function selectMindState(stateCode) {
    state.mindStateSelected = stateCode;
    document.querySelectorAll('.mind-diagram-card').forEach(card => card.classList.remove('selected'));
    document.getElementById(`mind-${stateCode}`).classList.add('selected');
    showToast(`Selected mind state: ${stateCode.toUpperCase()} mind.`, 'info');
}

function initListeningGrammarSelection() {
    const elements = document.querySelectorAll('#listening-stage-2 .selectable-word');
    elements.forEach(el => {
        el.addEventListener('click', () => {
            const type = el.getAttribute('data-grammar');
            const word = el.textContent;
            
            if (el.classList.contains('selected')) {
                el.classList.remove('selected');
                state.grammarSelected = state.grammarSelected.filter(w => w !== word);
            } else {
                el.classList.add('selected');
                state.grammarSelected.push(word);
            }
        });
    });
}

function verifyListeningGrammar() {
    const correctKeywords = ['have been practicing', 'have been tracking', 'might help', 'could improve'];
    const totalCorrect = state.grammarSelected.filter(w => correctKeywords.includes(w)).length;
    
    const elements = document.querySelectorAll('#listening-stage-2 .selectable-word');
    elements.forEach(el => {
        const word = el.textContent;
        if (correctKeywords.includes(word) && el.classList.contains('selected')) {
            el.classList.add('correct');
        }
    });
    
    if (totalCorrect === correctKeywords.length && state.grammarSelected.length === correctKeywords.length) {
        showToast("Brilliant! You highlighted all target grammar structures.", "success");
    } else {
        showToast(`You highlighted ${totalCorrect} / ${correctKeywords.length} correct structures. Keep finding!`, "warning");
    }
}

function checkListeningDetailsQuiz() {
    const c1 = document.getElementById('l3-c1').checked;
    const c2 = document.getElementById('l3-c2').checked;
    const c3 = document.getElementById('l3-c3').checked;
    const c4 = document.getElementById('l3-c4').checked;
    const c5 = document.getElementById('l3-c5').checked;
    
    const q1 = document.getElementById('l3-q1').value.trim().toLowerCase();
    const q2 = document.getElementById('l3-q2').value.trim().toLowerCase();
    const q3 = document.getElementById('l3-q3').value.trim().toLowerCase();
    
    const checklistCorrect = c1 && !c2 && c3 && !c4 && c5;
    
    let questionsCorrect = true;
    if (q1.includes('meditation')) {
        document.getElementById('l3-q1').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('l3-q1').style.borderColor = 'var(--color-error)';
        questionsCorrect = false;
    }
    
    if (q2.includes('stress')) {
        document.getElementById('l3-q2').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('l3-q2').style.borderColor = 'var(--color-error)';
        questionsCorrect = false;
    }
    
    if (q3.includes('sleep') || q3.includes('consistency')) {
        document.getElementById('l3-q3').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('l3-q3').style.borderColor = 'var(--color-error)';
        questionsCorrect = false;
    }
    
    if (checklistCorrect && questionsCorrect) {
        showToast("Awesome! All checklists and answers are correct.", "success");
    } else {
        showToast("Review checklist checkmarks or text fields. Highlighted ones are incorrect.", "warning");
    }
}

function validateListeningOralLog() {
    const text = document.getElementById('l4-log').value.trim().toLowerCase();
    
    const ppcRegex = /(?:have|has)\s+(?:been\s+)\w+ing/;
    const hasPPC = ppcRegex.test(text);
    const hasModal = text.includes('could') || text.includes('might') || text.includes('may');
    
    if (hasPPC && hasModal) {
        document.getElementById('l4-log').style.borderColor = 'var(--color-success)';
        state.listeningOralLogValid = true;
        showToast("Oral reflection log draft looks excellent! Ready for peer evaluation.", "success");
    } else {
        document.getElementById('l4-log').style.borderColor = 'var(--color-error)';
        state.listeningOralLogValid = false;
        showToast("Log must use have been feeling (PPC) and could/might (Modals)!", "warning");
    }
}

function submitListeningEvaluation() {
    const studentInfo = validateStudentInfo('l5');
    if (!studentInfo) return;

    const c1 = document.getElementById('l5-c1').checked;
    const c2 = document.getElementById('l5-c2').checked;
    const c3 = document.getElementById('l5-c3').checked;
    
    const score = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
    
    if (score === 3) {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: 3 de 3`, "success");
    } else {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: ${score} de 3. Completa todos los criterios.`, "warning");
    }
    
    showEvalResult('l5', studentInfo.name, studentInfo.date, studentInfo.time, score, 3);
}

// ================= READING SKILL Plan 2 CONTROLLERS =================
function selectWeekend(type) {
    state.weekendSelected = type;
    document.querySelectorAll('.contrast-image-card').forEach(card => card.classList.remove('selected'));
    document.getElementById(`contrast-${type}`).classList.add('selected');
}

function initReadingKeywords() {
    const elements = document.querySelectorAll('#reading-section .selectable-word');
    elements.forEach(el => {
        el.addEventListener('click', () => {
            const word = el.getAttribute('data-word');
            if (word === 'have-been-using' || word === 'might-cause' || word === 'could-try') return; // skip grammar examples
            
            if (el.classList.contains('selected')) {
                el.classList.remove('selected');
                state.readingKeywordsSelected = state.readingKeywordsSelected.filter(w => w !== word);
            } else {
                if (state.readingKeywordsSelected.length >= 3) {
                    showToast("Highlight up to 3 technology keywords max.", "warning");
                    return;
                }
                el.classList.add('selected');
                state.readingKeywordsSelected.push(word);
            }
        });
    });
}

function verifyReadingKeywords() {
    const correctKeywords = ['devices', 'screen-time', 'notifications'];
    const totalCorrect = state.readingKeywordsSelected.filter(w => correctKeywords.includes(w)).length;
    
    const elements = document.querySelectorAll('#reading-section .selectable-word');
    elements.forEach(el => {
        const word = el.getAttribute('data-word');
        if (correctKeywords.includes(word) && el.classList.contains('selected')) {
            el.classList.add('correct');
        }
    });
    
    if (totalCorrect === 3 && state.readingKeywordsSelected.length === 3) {
        showToast("Outstanding! You mapped the technology keywords perfectly.", "success");
    } else {
        showToast(`You mapped ${totalCorrect} / 3 keywords correctly. Try finding them!`, "warning");
    }
}

function verifyReadingQuotes() {
    const q1 = document.getElementById('r3-quote1').value.trim().toLowerCase();
    const q2 = document.getElementById('r3-quote2').value.trim().toLowerCase();
    
    let isCorrect = true;
    
    if (q1.includes('disconnecting') || q1.includes('notifications') || q1.includes('balanced') || q1.includes('mind')) {
        document.getElementById('r3-quote1').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('r3-quote1').style.borderColor = 'var(--color-error)';
        isCorrect = false;
    }

    if (q2.includes('disconnecting') || q2.includes('notifications') || q2.includes('balanced') || q2.includes('mind')) {
        document.getElementById('r3-quote2').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('r3-quote2').style.borderColor = 'var(--color-error)';
        isCorrect = false;
    }
    
    if (isCorrect) {
        showToast("Quotes confirmed! Good text mapping skills.", "success");
        state.readingQuotesValid = true;
    } else {
        showToast("Review the quotes. Pull direct benefits recommendations from the article text.", "warning");
        state.readingQuotesValid = false;
    }
}

function verifyReadingTextMap() {
    const d = document.getElementById('r4-drawback').value.trim().toLowerCase();
    const r = document.getElementById('r4-recommendation').value.trim().toLowerCase();
    
    let isCorrect = true;
    
    if (d.includes('anxiety') || d.includes('concentration') || d.includes('affecting')) {
        document.getElementById('r4-drawback').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('r4-drawback').style.borderColor = 'var(--color-error)';
        isCorrect = false;
    }

    if (r.includes('offline') || r.includes('schedule') || r.includes('disconnect') || r.includes('notifications')) {
        document.getElementById('r4-recommendation').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('r4-recommendation').style.borderColor = 'var(--color-error)';
        isCorrect = false;
    }
    
    if (isCorrect) {
        showToast("Text-Map validated successfully! Good visual mapping.", "success");
        state.readingTextMapValid = true;
    } else {
        showToast("Check arguments and recommendations inputs.", "warning");
        state.readingTextMapValid = false;
    }
}

function submitReadingEvaluation() {
    const studentInfo = validateStudentInfo('r5');
    if (!studentInfo) return;

    const comment = document.getElementById('r5-comment').value.trim();
    const suggestion = document.getElementById('r5-suggestion').value.trim();
    
    if (comment === '' || suggestion === '') {
        showToast("Please enter peer comment and suggestion.", "warning");
        return;
    }
    
    const score = 2;
    showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: 2 de 2`, "success");
    showEvalResult('r5', studentInfo.name, studentInfo.date, studentInfo.time, score, 2);
}

function submitReadingGoals() {
    const goal = document.getElementById('r6-goal').value.trim();
    
    if (state.speakingConfidenceRating === 0 || goal === '') {
        showToast("Please rate your comprehension and write a personal goal.", "warning");
        return;
    }
    
    showToast("Personal goals and rating saved!", "success");
}

// ================= SPEAKING SKILL Plan 2 CONTROLLERS =================
function tossBallTo(character, percentage) {
    const ball = document.getElementById('ballEl');
    ball.style.left = `${percentage}%`;
    ball.style.transform = `translate(-50%, -80%) scale(1.2)`;
    
    setTimeout(() => {
        ball.style.transform = `translate(-50%, -50%) scale(1.0)`;
    }, 4000);
    
    const habits = {
        alex: "Alex: I hope to manage exam stress and improve my weekly study schedules.",
        maria: "Maria: I hope to maintain a regular sleep pattern using wellness trackers.",
        john: "John: I hope to improve concentration and manage my daily screen habits."
    };
    
    document.getElementById('toss-habit-display').textContent = habits[character];
}

function rotateDatingPartner() {
    state.speakingChatPartner = state.speakingChatPartner === 3 ? 1 : state.speakingChatPartner + 1;
    document.getElementById('dating-partner-name').textContent = `Partner: Student ${state.speakingChatPartner} (${state.speakingChatPartner === 1 ? 'Inner' : 'Outer'} Circle)`;
    initSpeakingDatingChat();
}

function initSpeakingDatingChat() {
    const container = document.getElementById('dating-chat-history');
    if (!container) return;
    
    container.innerHTML = '';
    
    const welcomeKey = `speaking-dating-${state.speakingChatPartner}`;
    const welcomeMsg = speechTranscripts[welcomeKey];
    
    appendChatBubble(`Student ${state.speakingChatPartner}`, welcomeMsg, 'client');
}

function sendDatingChatMessage() {
    const inputEl = document.getElementById('dating-chat-input');
    const msgText = inputEl.value.trim();
    
    if (msgText === '') return;
    
    appendChatBubble('You', msgText, 'coach');
    inputEl.value = '';
    
    const hasModal = msgText.toLowerCase().includes('could') || 
                     msgText.toLowerCase().includes('might') || 
                     msgText.toLowerCase().includes('may');
                     
    const hasEmpathy = msgText.toLowerCase().includes('feel') || 
                       msgText.toLowerCase().includes('understand') ||
                       msgText.toLowerCase().includes('difficult');
                       
    setTimeout(() => {
        let reply = "";
        
        if (hasModal && hasEmpathy) {
            reply = `Student ${state.speakingChatPartner}: Thanks! I understand your point. I might practice that technique.`;
            showToast("Speech Success: High marks! Empathy and modals are used correctly.", "success");
        } else if (hasEmpathy) {
            reply = `Student ${state.speakingChatPartner}: Okay. What specific wellness tracker tools could I use?`;
            showToast("Speech checklist: Make sure to include could, might or may in your advice!", "warning");
        } else {
            reply = `Student ${state.speakingChatPartner}: Interesting suggestion, but I feel it might be difficult to do daily.`;
            showToast("Speech checklist: Try adding polite empathy phrases like 'I understand how you feel'!", "warning");
        }
        
        appendChatBubble(`Student ${state.speakingChatPartner}`, reply, 'client');
    }, 1000);
}

function submitSpeakingDatingEvaluation() {
    const studentInfo = validateStudentInfo('s5');
    if (!studentInfo) return;

    const m = document.getElementById('s5-modal').checked;
    const e = document.getElementById('s5-empathy').checked;
    const p = document.getElementById('s5-proposal').value.trim();
    
    const score = (m ? 1 : 0) + (e ? 1 : 0) + (p !== '' ? 1 : 0);
    
    if (m && e && p !== '') {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: 3 de 3`, "success");
    } else {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: ${score} de 3. Completa todos los criterios.`, "warning");
    }
    
    showEvalResult('s5', studentInfo.name, studentInfo.date, studentInfo.time, score, 3);
}

function selectConfidence(stars) {
    state.speakingConfidenceRating = stars;
    document.querySelectorAll('.confidence-button').forEach((btn, idx) => {
        if (idx < stars) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function submitSpeakingConfidenceReflection() {
    const text = document.getElementById('s6-reflection-text').value.trim();
    if (text === '') {
        showToast("Please complete your reflection sentence first.", "warning");
        return;
    }
    showToast("Speaking confidence reflection posted!", "success");
}

// ================= WRITING SKILL Plan 2 CONTROLLERS =================
function verifyWritingScenarios() {
    const s1 = document.getElementById('w1-sol1').value.trim().toLowerCase();
    const s2 = document.getElementById('w1-sol2').value.trim().toLowerCase();
    const s3 = document.getElementById('w1-sol3').value.trim().toLowerCase();
    
    const ppcRegex = /(?:have|has)\s+(?:been\s+)\w+ing/;
    
    let isCorrect = true;
    
    [s1, s2, s3].forEach((sol, idx) => {
        const elId = `w1-sol${idx + 1}`;
        if (ppcRegex.test(sol)) {
            document.getElementById(elId).style.borderColor = 'var(--color-success)';
        } else {
            document.getElementById(elId).style.borderColor = 'var(--color-error)';
            isCorrect = false;
        }
    });
    
    if (isCorrect) {
        showToast("Scenarios tenses verified! Excellent present perfect continuous.", "success");
        state.writingScenariosValid = true;
    } else {
        showToast("Suggest solutions using Present Perfect Continuous (e.g. have been sleeping, has been doing).", "warning");
        state.writingScenariosValid = false;
    }
}

function verifyWritingTransitions() {
    const transitions = document.getElementById('w2-transitions').value.trim().toLowerCase();
    
    const hasTransitions = transitions.includes('first') || 
                           transitions.includes('second') || 
                           transitions.includes('furthermore') || 
                           transitions.includes('additionally') || 
                           transitions.includes('then') || 
                           transitions.includes('after');
                           
    if (hasTransitions) {
        document.getElementById('w2-transitions').style.borderColor = 'var(--color-success)';
        showToast("Transition words saved successfully!", "success");
    } else {
        document.getElementById('w2-transitions').style.borderColor = 'var(--color-error)';
        showToast("Try connecting action steps with logic indicators (e.g. First, Additionally).", "warning");
    }
}

function verifyWritingStrategies() {
    const st1 = document.getElementById('w3-strat1').value.trim();
    const st2 = document.getElementById('w3-strat2').value.trim();
    const st3 = document.getElementById('w3-strat3').value.trim();
    
    const selectedTopic = document.querySelector('input[name="w3-topic"]:checked');
    
    if (st1 !== '' && st2 !== '' && st3 !== '' && selectedTopic) {
        document.getElementById('w3-strat1').style.borderColor = 'var(--color-success)';
        document.getElementById('w3-strat2').style.borderColor = 'var(--color-success)';
        document.getElementById('w3-strat3').style.borderColor = 'var(--color-success)';
        showToast("Strategies brainstorm saved successfully!", "success");
        state.writingStrategiesValid = true;
    } else {
        showToast("Complete all 3 strategies and select a station topic.", "warning");
        state.writingStrategiesValid = false;
    }
}

function updateWritingAnalytics() {
    const text = document.getElementById('w4-paragraph').value.trim();
    
    const words = text === '' ? 0 : text.split(/\s+/).length;
    const wordCountEl = document.getElementById('wordCountText');
    wordCountEl.textContent = `Words: ${words} / 60-80`;
    
    if (words >= 60 && words <= 80) {
        wordCountEl.classList.add('limit-hit');
    } else {
        wordCountEl.classList.remove('limit-hit');
    }
    
    const ppcRegex = /(?:have|has)\s+(?:been\s+)\w+ing/i;
    const hasPPC = ppcRegex.test(text);
    const hasModal = text.toLowerCase().includes('could') || text.toLowerCase().includes('might') || text.toLowerCase().includes('may');
    const hasMaintain = text.toLowerCase().includes('maintain');
    const hasImprove = text.toLowerCase().includes('improve');
    const hasManage = text.toLowerCase().includes('manage');
    
    updateBadgeStatus('w4-has-ppc', hasPPC);
    updateBadgeStatus('w4-has-modal', hasModal);
    updateBadgeStatus('w4-has-maintain', hasMaintain);
    updateBadgeStatus('w4-has-improve', hasImprove);
    updateBadgeStatus('w4-has-manage', hasManage);
    
    state.writingActionPlanValid = hasPPC && hasModal && hasMaintain && hasImprove && hasManage && (words >= 60 && words <= 80);
}

function updateBadgeStatus(badgeId, isValid) {
    const el = document.getElementById(badgeId);
    if (isValid) {
        el.classList.add('valid');
    } else {
        el.classList.remove('valid');
    }
}

function submitWritingActionPlan() {
    updateWritingAnalytics();
    
    if (state.writingActionPlanValid) {
        showToast("Collaborative workshop guide poster draft submitted!", "success");
    } else {
        showToast("Verify grammar checklists. Word size must be between 60-80 words.", "warning");
    }
}

function submitWritingEvaluation() {
    const studentInfo = validateStudentInfo('w5');
    if (!studentInfo) return;

    const r1 = document.getElementById('w5-r1').checked;
    const r2 = document.getElementById('w5-r2').checked;
    const r3 = document.getElementById('w5-r3').checked;
    const r4 = document.getElementById('w5-r4').checked;
    const r5 = document.getElementById('w5-r5').checked;
    
    const score = (r1 ? 1 : 0) + (r2 ? 1 : 0) + (r3 ? 1 : 0) + (r4 ? 1 : 0) + (r5 ? 1 : 0);
    
    if (score === 5) {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: 5 de 5`, "success");
    } else {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: ${score} de 5. Completa todos los criterios.`, "warning");
    }
    
    showEvalResult('w5', studentInfo.name, studentInfo.date, studentInfo.time, score, 5);
}

function submitWritingJournalReflection() {
    const text = document.getElementById('w6-reflection').value.trim();
    
    const sentences = text === '' ? 0 : text.split(/[.!?]+/).filter(Boolean).length;
    
    if (sentences >= 2) {
        showToast("Reflective journal entry posted successfully!", "success");
    } else {
        showToast("Reflection must be at least 2 sentences long.", "warning");
    }
}
