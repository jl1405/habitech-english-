// ============================================================
// PLAN 4 – Learning to Relax (Scenario: Learning to Balance)
// ============================================================

const state = {
    currentSkill: 'listening',
    currentStage: 1,
    completedSkills: [],
    selectedIllustration: null,
    wordCounts: { stress: 0, unwind: 0, prioritize: 0 },
    predictedKeywords: { pred1: '', pred2: '', pred3: '' },
    activeListeningThumb: null,
    brainstormNodes: [],
    selectedTransitions: [],
    assignedArguments: { benefits: [], limitations: [] },
    speakingWordAssembled: [],
    activeSpeakingStation: 1,
    teamThemeSelected: null,
    groupRoleSelected: null,
    redPenCorrections: []
};

const skillMetadata = {
    listening: {
        topic: 'Skill Focus: Listening',
        objective: 'Students will be able to listen to a discussion about school-life balance and interpret three relaxation strategies individually during a comprehension grid completion task by the end of the lesson.',
        outcomes: [
            'Can describe the storyline of an audio or visual narrative about balancing school and personal life (e.g., "The speaker shared how they\'ve been balancing their schoolwork with their passion for volunteering.").',
            'Can comprehend extended discussions on strategies for learning to relax and maintaining well-being (e.g., "The speaker explained that practicing relaxation techniques like deep breathing and time management is essential for mental health.").'
        ]
    },
    reading: {
        topic: 'Skill Focus: Reading',
        objective: 'Students will be able to read a persuasive article on the necessity of downtime and analyze the key arguments in pairs during a graphic organizer completion task by the end of the lesson.',
        outcomes: [
            'Can comprehend narratives about balancing school, social activities, and personal life.',
            'Can analyze persuasive pieces about managing relaxation effectively (e.g., "The article argues that students who set clear boundaries between school and personal time tend to have lower stress levels.").'
        ]
    },
    speaking: {
        topic: 'Skill Focus: Speaking',
        objective: 'Students will be able to present about their routine and ongoing relaxation efforts, using the present perfect continuous in small groups during a carousel sharing task by the end of the lesson.',
        outcomes: [
            'Can describe the process of balancing school and social activities, explaining strategies.',
            'Can analyze persuasive pieces and provide constructive feedback.'
        ]
    },
    writing: {
        topic: 'Skill Focus: Writing',
        objective: 'Students will be able to write a collaborative text with balance tips, using action verbs and modals in small groups during a digital draft layout task by the end of the lesson.',
        outcomes: [
            'Can write a reflective essay on the experience of balancing school and personal life.',
            'Can collaboratively write a digital text about learning to relax or maintaining school-life balance (e.g., "Take breaks during study sessions and make time for hobbies to relax and recharge.").'
        ]
    }
};

const speechTexts = {
    'listening-intro': "Student A: Hi Sofia, you look stressed. Have you been studying all night? Student B: Yes, I feel completely overwhelmed. I need to find active ways to reduce pressure. Student A: You should prioritize your sleep. Also, it's vital to unwind by taking physical walks or practicing deep breathing. If we schedule our relaxation, we won't burn out.",
    'listening-full': "Let's map out our relaxation strategies. Firstly, we have Deep Breathing. The main benefit is that it lowers cortisol levels and calms the heart rate instantly. Secondly, we should implement Time Boxing. By scheduling short blocks of downtime, we organize our tasks and protect our boundaries. Thirdly, taking a Physical Walk in nature triggers endorphin release, which boosts mood and clears focus. Use these three strategies in your pairs!"
};

// ===== TOAST =====
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    const icon = document.getElementById('toast-icon');
    const msgEl = document.getElementById('toast-message');
    toast.className = 'toast-feedback';
    icon.textContent = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '💡';
    if (type === 'success') toast.classList.add('toast-success');
    if (type === 'warning') toast.classList.add('toast-warning');
    msgEl.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// ===== STUDENT VALIDATION HELPERS =====
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
    if (!card) return;
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
    const infoDiv = document.getElementById(`${prefix}-student-info`);
    if (infoDiv) infoDiv.style.display = 'none';
}

// Count word clicks from transcript spans
function countWordClick(el) {
    const target = el.getAttribute('data-target');
    if (!target) return;
    // toggle highlight
    el.classList.toggle('clicked');
    if (el.classList.contains('clicked')) {
        el.style.background = '#fef08a';
        el.style.borderBottom = '2px solid #ca8a04';
        state.wordCounts[target] = (state.wordCounts[target] || 0) + 1;
    } else {
        el.style.background = '';
        el.style.borderBottom = '2px dashed var(--color-primary)';
        state.wordCounts[target] = Math.max(0, (state.wordCounts[target] || 0) - 1);
    }
    // Update displayed counter
    const counterEl = document.getElementById(`count-${target}`);
    if (counterEl) counterEl.textContent = state.wordCounts[target];
}

// ===== NAVIGATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Read skill from body attribute if present
    const bodySkill = document.body.getAttribute('data-skill');
    if (bodySkill && ['listening','reading','speaking','writing'].includes(bodySkill)) {
        state.currentSkill = bodySkill;
    }

    document.querySelectorAll('.nav-menu .nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            switchSkill(item.getAttribute('data-skill'));
        });
    });
    createAllWaveforms();

    // Initialize initial skill state
    switchSkill(state.currentSkill);
});

function switchSkill(skillName) {
    state.currentSkill = skillName;
    state.currentStage = 1;
    document.querySelectorAll('.skill-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-menu .nav-item').forEach(n => n.classList.remove('active'));
    
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
    
    const m = skillMetadata[skillName];
    if (m) {
        const currentTopic = document.getElementById('currentTopic');
        if (currentTopic) currentTopic.textContent = m.topic;
        
        const objectiveText = document.getElementById('objectiveText');
        if (objectiveText) objectiveText.textContent = m.objective;
        
        const ol = document.getElementById('outcomesList');
        if (ol) {
            ol.innerHTML = '';
            m.outcomes.forEach(o => {
                const li = document.createElement('li');
                li.textContent = o;
                ol.appendChild(li);
            });
        }
    }
    
    updateStepper();
    window.speechSynthesis.cancel();
    showToast(`Relax Plan 4 – ${skillName.charAt(0).toUpperCase() + skillName.slice(1)} loaded!`, 'info');
}

function updateStepper() {
    const stepper = document.getElementById('stageNav');
    if (!stepper) return;
    stepper.querySelectorAll('.stage-step').forEach((step, idx) => {
        step.className = 'stage-step';
        const n = idx + 1;
        if (n === state.currentStage) step.classList.add('active');
        else if (n < state.currentStage) step.classList.add('completed');
    });
}

function nextStage() {
    if (state.currentStage >= 6) return;
    const currentStageEl = document.getElementById(`${state.currentSkill}-stage-${state.currentStage}`);
    if (currentStageEl) currentStageEl.classList.remove('active');
    
    state.currentStage++;
    
    const nextStageEl = document.getElementById(`${state.currentSkill}-stage-${state.currentStage}`);
    if (nextStageEl) nextStageEl.classList.add('active');
    
    updateStepper();
    window.speechSynthesis.cancel();
}

function prevStage() {
    if (state.currentStage <= 1) return;
    const currentStageEl = document.getElementById(`${state.currentSkill}-stage-${state.currentStage}`);
    if (currentStageEl) currentStageEl.classList.remove('active');
    
    state.currentStage--;
    
    const prevStageEl = document.getElementById(`${state.currentSkill}-stage-${state.currentStage}`);
    if (prevStageEl) prevStageEl.classList.add('active');
    
    updateStepper();
    window.speechSynthesis.cancel();
}

function markSkillComplete(skillName) {
    if (!state.completedSkills.includes(skillName)) {
        state.completedSkills.push(skillName);
        const navItem = document.getElementById(`nav-${skillName}`);
        if (navItem) navItem.classList.add('completed');
    }
    showToast(`Congratulations! ${skillName.charAt(0).toUpperCase() + skillName.slice(1)} Skill completed!`, 'success');
    
    // Redirect back to Plan 4 Hub after 2 seconds
    setTimeout(() => {
        window.location.href = 'plan4hub.html';
    }, 2000);
}

// ===== AUDIO & TTS =====
let waveInterval = null;
let synthUtt = null;

function createAllWaveforms() {
    ['waveform-l2','waveform-l4'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '';
        for (let i = 0; i < 28; i++) {
            const b = document.createElement('div');
            b.className = 'wave-bar';
            b.style.height = '4px';
            el.appendChild(b);
        }
    });
}

function playTTS(key) {
    const map = { 'listening-intro': 'waveform-l2', 'listening-full': 'waveform-l4' };
    const btnMap = { 'listening-intro': 'playBtn-l2', 'listening-full': 'playBtn-l4' };
    const waveEl = document.getElementById(map[key]);
    const btnEl = document.getElementById(btnMap[key]);
    
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        stopWave(waveEl, btnEl);
        return;
    }
    
    synthUtt = new SpeechSynthesisUtterance(speechTexts[key]);
    synthUtt.lang = 'en-US';
    synthUtt.rate = 0.95;
    synthUtt.onstart = () => {
        if(btnEl) btnEl.textContent = '⏹';
        startWave(waveEl);
    };
    synthUtt.onend = synthUtt.onerror = () => stopWave(waveEl, btnEl);
    window.speechSynthesis.speak(synthUtt);
}

function speakText(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
}

function startWave(el) {
    if (!el) return;
    if (waveInterval) clearInterval(waveInterval);
    waveInterval = setInterval(() => {
        el.querySelectorAll('.wave-bar').forEach(b => {
            b.style.height = (Math.random()*26+4)+'px';
            b.classList.add('active');
        });
    }, 120);
}

function stopWave(el, btn) {
    if (waveInterval) { clearInterval(waveInterval); waveInterval = null; }
    if (btn) btn.textContent = '▶';
    if (el) el.querySelectorAll('.wave-bar').forEach(b => {
        b.style.height='4px';
        b.classList.remove('active');
    });
}

function toggleTranscript(id) {
    document.getElementById(id).classList.toggle('show');
}

// ===== LISTENING INTERACTION =====
function selectIllustration(num) {
    state.selectedIllustration = num;
    [1, 2, 3].forEach(i => {
        document.getElementById(`ill-${i}`).classList.toggle('active', i === num);
    });
    showToast(`Selected illustration: ${num === 1 ? 'Stressed Alex' : num === 2 ? 'Overwhelmed Sofia' : 'Relaxed Leo'}`, 'info');
}

function changeCount(word, val) {
    state.wordCounts[word] = Math.max(0, state.wordCounts[word] + val);
    document.getElementById(`count-${word}`).textContent = state.wordCounts[word];
}

function checkWordCounts() {
    const stressOk = state.wordCounts.stress === 2; // Sofia (stressed), Student A (stressed) or Student B (overwhelmed/pressure) - in transcript: stressed (1), overwhelmed (1), pressure (1).
    // Word frequency transcript counts:
    // "stress" or "stressed" matches: Sofia you look "stressed" (1), active ways to reduce "pressure" (1), reduce study "stress" (0) - Wait, in text we have:
    // "Sofia, you look stressed" (1), "completely overwhelmed" (1), "reduce pressure" (1). Let's count them: 
    // We expect: stress/pressure = 2, unwind/relax = 2 (unwind, relaxation), prioritize/schedule = 2 (prioritize, schedule).
    // Let's set the correct validation conditions:
    const answers = { stress: 2, unwind: 2, prioritize: 2 };
    let ok = true;
    for (const [w, count] of Object.entries(answers)) {
        if (state.wordCounts[w] !== count) ok = false;
    }
    showToast(ok ? 'Word counters correct! Great listening.' : 'Keep listening. Check counts for stress/pressure (2), unwind/relax (2), prioritize/schedule (2).', ok ? 'success' : 'warning');
}

function submitPredictions() {
    const p1 = document.getElementById('l3-pred1').value.trim();
    const p2 = document.getElementById('l3-pred2').value.trim();
    const p3 = document.getElementById('l3-pred3').value.trim();
    if (p1 && p2 && p3) {
        showToast('Predictions logged! Listen carefully to see if you predicted correct keywords.', 'success');
    } else {
        showToast('Please fill in predictions for all 3 strategies.', 'warning');
    }
}

function verifyComprehensionGrid() {
    const b1 = document.getElementById('l4-strat1-benefit').value.trim().toLowerCase();
    const b2 = document.getElementById('l4-strat2-benefit').value.trim().toLowerCase();
    const b3 = document.getElementById('l4-strat3-benefit').value.trim().toLowerCase();
    
    let ok = true;
    const check = (el, cond) => {
        el.style.borderColor = cond ? 'var(--color-success)' : 'var(--color-error)';
        if(!cond) ok = false;
    };
    
    check(document.getElementById('l4-strat1-benefit'), b1.includes('cortisol') || b1.includes('heart') || b1.includes('calm'));
    check(document.getElementById('l4-strat2-benefit'), b2.includes('boundar') || b2.includes('downtime') || b2.includes('organ'));
    check(document.getElementById('l4-strat3-benefit'), b3.includes('endorphin') || b3.includes('mood') || b3.includes('focus') || b3.includes('clear'));
    
    showToast(ok ? 'All benefits verified correctly!' : 'Refine benefits. Read transcript or listen again.', ok ? 'success' : 'warning');
}

function selectListeningThumb(type) {
    state.activeListeningThumb = type;
    document.getElementById('thumb-l5-up').classList.toggle('selected', type === 'up');
    document.getElementById('thumb-l5-down').classList.toggle('selected', type === 'down');
    showToast(`Understood level reported as: ${type === 'up' ? 'Good' : 'Needs practice'}.`, 'info');
}

function submitListeningEvaluation() {
    const feedback = document.getElementById('l5-feedback').value.trim();
    if (feedback.length < 5) {
        showToast('Please write a feedback tip before submitting.', 'warning');
        return;
    }
    if (!state.activeListeningThumb) {
        showToast('Please select a thumb rating for your understanding level.', 'warning');
        return;
    }
    const studentInfo = validateStudentInfo('l5');
    if (!studentInfo) return;
    // Score: 2 criteria (feedback provided + thumb selected)
    const score = (feedback.length >= 5 ? 1 : 0) + (state.activeListeningThumb ? 1 : 0);
    showEvalResult('l5', studentInfo.name, studentInfo.date, studentInfo.time, score, 2);
    showToast(`Listening evaluation submitted! Score: ${score}/2`, score === 2 ? 'success' : 'warning');
}

function postStickyNote(skill, inputId) {
    const val = document.getElementById(inputId).value.trim();
    if (!val) { showToast('Please write something before posting!', 'warning'); return; }
    const wall = document.getElementById(`${skill}-sticky-wall`);
    const note = document.createElement('div');
    note.className = 'sticky-note';
    note.innerHTML = `<p>"${val}"</p><span class="sticky-author">You (Now)</span>`;
    wall.appendChild(note);
    document.getElementById(inputId).value = '';
    showToast('Reflection note posted to classroom board!', 'success');
}

// ===== READING INTERACTION =====
function addBrainstormNode() {
    const input = document.getElementById('r1-brainstorm-input');
    const val = input.value.trim();
    if (!val) return;
    
    const wrapper = document.getElementById('web-map-dynamic');
    const node = document.createElement('div');
    node.className = 'web-map-node node-added';
    
    // Position dynamically inside web map
    const top = Math.random() * 180 + 30;
    const left = Math.random() * 200 + 40;
    node.style.top = `${top}px`;
    node.style.left = `${left}px`;
    node.textContent = `🌿 ${val}`;
    
    wrapper.appendChild(node);
    state.brainstormNodes.push(val);
    input.value = '';
    showToast(`Added brainstorm node: "${val}"`, 'success');
}

function selectTransition(el) {
    const word = el.getAttribute('data-word');
    if (el.classList.contains('correct')) return;
    
    if (state.selectedTransitions.includes(word)) {
        state.selectedTransitions = state.selectedTransitions.filter(w => w !== word);
        el.classList.remove('selected');
    } else {
        state.selectedTransitions.push(word);
        el.classList.add('selected');
    }
}

function verifyTransitions() {
    const expected = ['However', 'Nevertheless'];
    let correctCount = 0;
    
    document.querySelectorAll('.selectable-word').forEach(el => {
        const word = el.getAttribute('data-word');
        if (state.selectedTransitions.includes(word) && expected.includes(word)) {
            el.classList.remove('selected');
            el.classList.add('correct');
            correctCount++;
        }
    });
    
    if (correctCount === 2) {
        showToast('Both contrast transition words highlighted correctly!', 'success');
    } else {
        showToast(`Highlighted ${correctCount}/2 transitions. Keep scanning!`, 'warning');
    }
}

function assignArgument(id, column) {
    const el = document.getElementById(`arg-${id}`);
    if (el.classList.contains('assigned')) return;
    
    // Add to state
    state.assignedArguments[column].push(el.textContent);
    
    // Visual transfer
    el.classList.add('assigned');
    const targetCol = document.getElementById(`list-${column}`);
    const clone = document.createElement('div');
    clone.className = 'draggable-item';
    clone.style.cursor = 'default';
    clone.style.borderColor = column === 'benefits' ? 'var(--color-success)' : 'var(--color-warning)';
    clone.textContent = el.textContent;
    targetCol.appendChild(clone);
    
    showToast(`Assigned to ${column.toUpperCase()}`, 'info');
}

function verifyReadingOrganizer() {
    // Check if benefits contains b1, b2, b3 and limitations contains l1, l2, l3
    const benefitsOk = state.assignedArguments.benefits.length >= 3;
    const limitationsOk = state.assignedArguments.limitations.length >= 3;
    
    if (benefitsOk && limitationsOk) {
        showToast('Graphic organizer successfully completed and verified!', 'success');
    } else {
        showToast('Please assign all 6 statements to their respective columns.', 'warning');
    }
}

function gradeReadingQuiz() {
    const a1 = document.querySelector('input[name="r5-q1"]:checked');
    const a2 = document.querySelector('input[name="r5-q2"]:checked');
    
    if (!a1 || !a2) {
        showToast('Please answer all quiz questions.', 'warning');
        return;
    }
    
    let score = 0;
    const checkAnswer = (selected, correct, name) => {
        document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
            const container = radio.closest('.quiz-option');
            container.classList.remove('correct', 'incorrect');
            if (radio.value === correct) container.classList.add('correct');
            else if (selected === radio && radio.value !== correct) container.classList.add('incorrect');
        });
        if (selected?.value === correct) score++;
    };
    
    checkAnswer(a1, 'essential', 'r5-q1');
    checkAnswer(a2, 'nevertheless', 'r5-q2');
    
    showToast(`Quiz completed! Score: ${score}/2`, score === 2 ? 'success' : 'warning');
}

function gradeReadingEvaluation() {
    const studentInfo = validateStudentInfo('r5');
    if (!studentInfo) return;

    const a1 = document.querySelector('input[name="r5-q1"]:checked');
    const a2 = document.querySelector('input[name="r5-q2"]:checked');
    if (!a1 || !a2) {
        showToast('Please answer all quiz questions before submitting.', 'warning');
        return;
    }

    let score = 0;
    if (a1.value === 'essential') score++;
    if (a2.value === 'nevertheless') score++;

    showEvalResult('r5', studentInfo.name, studentInfo.date, studentInfo.time, score, 2);
    showToast(`Reading evaluation submitted! Score: ${score}/2`, score === 2 ? 'success' : 'warning');
}

function submitDowntimeCommitment() {
    const text = document.getElementById('r6-commitment').value.trim();
    if (text.length > 15) {
        showToast('Your downtime commitment has been registered! Keep it up.', 'success');
    } else {
        showToast('Please write a detailed commitment sentence.', 'warning');
    }
}

// ===== SPEAKING INTERACTION =====
function verifySpeakingPPCFormula() {
    const selected = document.querySelector('input[name="s1-q1"]:checked');
    if (!selected) { showToast('Please select a formula.', 'warning'); return; }
    
    document.querySelectorAll('input[name="s1-q1"]').forEach(radio => {
        const lbl = radio.closest('.quiz-option');
        lbl.classList.remove('correct', 'incorrect');
        if (radio.value === 'ppc') lbl.classList.add('correct');
        else if (radio === selected) lbl.classList.add('incorrect');
    });
    
    if (selected.value === 'ppc') {
        showToast('Correct! Present Perfect Continuous uses have/has + been + verb-ing.', 'success');
    } else {
        showToast('Incorrect formula selected. Look at the teacher habit example.', 'warning');
    }
}

function selectWordBlock(word) {
    if (state.speakingWordAssembled.includes(word)) return;
    
    // Update state
    state.speakingWordAssembled.push(word);
    
    // Find el
    document.querySelectorAll('.word-block').forEach(b => {
        if (b.textContent === word) b.classList.add('selected');
    });
    
    // Update assembly area
    const area = document.getElementById('assembly-area');
    const placeholder = document.getElementById('assembly-placeholder');
    if (placeholder) placeholder.remove();
    
    const token = document.createElement('span');
    token.className = 'assembled-word';
    token.textContent = word;
    area.appendChild(token);
}

function clearSentenceAssembly() {
    state.speakingWordAssembled = [];
    document.querySelectorAll('.word-block').forEach(b => b.classList.remove('selected'));
    
    const area = document.getElementById('assembly-area');
    area.innerHTML = '<span style="color:var(--text-muted); font-style:italic;" id="assembly-placeholder">Click blocks above in order to construct the sentence...</span>';
}

function verifySpeakingSentenceAndModal() {
    const modalInput = document.getElementById('s2-modal').value.trim().toLowerCase();
    const hasModal = /\b(could|might|should)\b/.test(modalInput);
    
    const assembledText = state.speakingWordAssembled.join(' ');
    const correctAssembled = assembledText === 'Lately, I have been sleeping 8 hours to unwind';
    
    let ok = true;
    if (!correctAssembled) {
        showToast('Sentence assembly order is incorrect. Rebuild starting with Lately, I...', 'warning');
        ok = false;
    }
    
    const modalField = document.getElementById('s2-modal');
    modalField.style.borderColor = hasModal ? 'var(--color-success)' : 'var(--color-error)';
    if (!hasModal) ok = false;
    
    if (ok) {
        showToast('Sentence assembly and modal suggestion validated!', 'success');
    } else if (correctAssembled && !hasModal) {
        showToast('Sentence assembled correctly! But check that your modal suggestion uses could/might/should.', 'warning');
    }
}

function verifyCarouselTemplate() {
    const b1 = document.getElementById('s3-blank1').value.trim();
    const b2 = document.getElementById('s3-blank2').value.trim();
    const b3 = document.getElementById('s3-blank3').value.trim();
    
    if (b1 && b2 && b3) {
        showToast('Speaking guide template complete! Practise reading it aloud.', 'success');
    } else {
        showToast('Please complete all 3 blanks in the speaking template.', 'warning');
    }
}

function switchStation(num) {
    state.activeSpeakingStation = num;
    document.querySelectorAll('.station-pin').forEach((pin, idx) => {
        pin.classList.toggle('active', idx + 1 === num);
    });
    
    document.querySelectorAll('.station-card').forEach((card, idx) => {
        card.classList.toggle('active', idx + 1 === num);
    });
    
    showToast(`Switched to Carousel Station ${num}`, 'info');
}

function verifyStationLog() {
    const log = document.getElementById('s4-log').value.trim().toLowerCase();
    const usesPPC = /has been|have been/.test(log);
    const hasName = log.includes('mariana') || log.includes('elena') || log.includes('diego') || log.includes('carlos');
    
    const logField = document.getElementById('s4-log');
    const ok = usesPPC && hasName && log.length > 12;
    logField.style.borderColor = ok ? 'var(--color-success)' : 'var(--color-error)';
    
    showToast(ok ? 'Station summary verified! Nice grammar.' : 'Ensure summary includes student\'s name and uses "has been + verb-ing".', ok ? 'success' : 'warning');
}

function submitSpeakingRubric() {
    const c1 = document.getElementById('s5-check1').checked;
    const c2 = document.getElementById('s5-check2').checked;
    const c3 = document.getElementById('s5-check3').checked;
    const studentInfo = validateStudentInfo('s5');
    if (!studentInfo) return;

    const score = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
    showEvalResult('s5', studentInfo.name, studentInfo.date, studentInfo.time, score, 3);
    showToast(c1&&c2&&c3 ? 'Speaking peer feedback scorecard submitted!' : `Speaking evaluation submitted! Score: ${score}/3.`, score === 3 ? 'success' : 'warning');
}

function submitSpeakingReflection() {
    const fav = document.getElementById('s6-favorite').value.trim();
    const anx = document.getElementById('s6-anxiety').value.trim();
    if (fav && anx) {
        showToast('Speaking reflections recorded successfully.', 'success');
    } else {
        showToast('Please describe both your favorite routine and anxiety notes.', 'warning');
    }
}

// ===== WRITING INTERACTION =====
function selectTeamTheme(num) {
    state.teamThemeSelected = num;
    [1, 2, 3].forEach(i => {
        document.getElementById(`theme-${i}`).classList.toggle('selected', i === num);
    });
    showToast(`Theme Selected: ${num === 1 ? 'Mindful Time Management' : num === 2 ? 'Active Recharging' : 'Stress-Free Study Planning'}`, 'info');
}

function selectGroupRole(role) {
    state.groupRoleSelected = role;
    ['planner', 'writer', 'reviewer', 'designer'].forEach(r => {
        document.getElementById(`role-${r}`).classList.toggle('selected', r === role);
    });
    showToast(`Assigned Group Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`, 'success');
}

function verifyWritingModalsLive() {
    const text = document.getElementById('w3-modal-check').value.trim().toLowerCase();
    const hasModal = /\b(should|could|must|might|can|would)\b/.test(text);
    
    document.getElementById('badge-modal').classList.toggle('valid', hasModal);
}

function updateWritingLiveMetrics() {
    const text = document.getElementById('w4-text').value.trim();
    const words = text === '' ? 0 : text.split(/\s+/).length;
    
    const countBadge = document.getElementById('badge-w4-wordcount');
    countBadge.textContent = `Word count: ${words} / 40`;
    countBadge.classList.toggle('valid', words >= 40);
    
    const hasModal = /\b(should|could|must|might|can|would)\b/i.test(text);
    document.getElementById('badge-w4-modal').classList.toggle('valid', hasModal);
    
    const actionVerbs = ['prioritize', 'unwind', 'schedule', 'breathe', 'rest', 'walk'];
    let countActions = 0;
    actionVerbs.forEach(v => {
        if (text.toLowerCase().includes(v)) countActions++;
    });
    document.getElementById('badge-w4-action').classList.toggle('valid', countActions >= 2);
}

function submitWritingPlanDraft() {
    const text = document.getElementById('w4-text').value.trim();
    const words = text === '' ? 0 : text.split(/\s+/).length;
    const hasModal = /\b(should|could|must|might|can|would)\b/i.test(text);
    
    const actionVerbs = ['prioritize', 'unwind', 'schedule', 'breathe', 'rest', 'walk'];
    let countActions = 0;
    actionVerbs.forEach(v => {
        if (text.toLowerCase().includes(v)) countActions++;
    });
    
    if (words >= 40 && hasModal && countActions >= 2) {
        showToast('Writing draft validated! Ready for peer editing workshop.', 'success');
    } else {
        showToast('Ensure your draft has 40+ words, uses modal suggestions, and includes stress-relief verbs.', 'warning');
    }
}

function applyCorrection(num) {
    const el = document.getElementById(`markup-${num}`);
    if (el.classList.contains('corrected')) return;
    
    const corrections = {
        1: { text: 'should', speak: 'should' },
        2: { text: 'could forget', speak: 'could forget' },
        3: { text: 'does', speak: 'does' }
    };
    
    el.textContent = corrections[num].text;
    el.classList.add('corrected');
    
    state.redPenCorrections.push(num);
    speakText(`Corrected to: ${corrections[num].speak}`);
    showToast(`Corrected grammatical error ${num}/3!`, 'success');
}

function submitPeerEditReport() {
    const c1 = document.getElementById('w5-c1').checked;
    const c2 = document.getElementById('w5-c2').checked;
    const c3 = document.getElementById('w5-c3').checked;
    const allCorrected = state.redPenCorrections.length === 3;

    if (!allCorrected) {
        showToast('Please complete all 3 grammatical red-pen corrections in the paragraph first.', 'warning');
        return;
    }

    const studentInfo = validateStudentInfo('w5');
    if (!studentInfo) return;

    const score = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
    showEvalResult('w5', studentInfo.name, studentInfo.date, studentInfo.time, score, 3);
    showToast(c1&&c2&&c3&&allCorrected ? 'Peer editing report submitted successfully!' : `Writing evaluation submitted! Score: ${score}/3.`, score === 3 ? 'success' : 'warning');
}

function finishWritingLessons() {
    const challenge = document.getElementById('w6-challenge').value.trim();
    const c1 = document.getElementById('w6-check1').checked;
    const c2 = document.getElementById('w6-check2').checked;
    const c3 = document.getElementById('w6-check3').checked;
    
    if (challenge && c1 && c2 && c3) {
        markSkillComplete('writing');
    } else {
        showToast('Describe your group challenge and check all collaboration values.', 'warning');
    }
}
