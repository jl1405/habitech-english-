// ============================================================
// PLAN 3 – How to Balance Social and School Activities
// ============================================================

const state = {
    currentSkill: 'listening',
    currentStage: 1,
    completedSkills: [],
    scaleSelected: null,
    headlineSelected: null,
    conditionalSelected: [],
    thumbSelected: null,
    infographicSelected: null,
    roleSelected: null,
    confidenceRating: 0
};

const skillMetadata = {
    listening: {
        topic: 'Skill Focus: Listening',
        objective: 'Students will be able to listen to an interview about school-life balance and interpret key suggestions for relaxation in pairs during a graphic organizer completion activity.',
        outcomes: [
            'Can describe the storyline of an audio or visual narrative about balancing school and personal life (e.g., "The speaker shared how they\'ve been balancing their schoolwork with their passion for volunteering.").',
            'Can comprehend extended discussions on strategies for learning to relax and maintaining well-being (e.g., "The speaker explained that practicing relaxation techniques like deep breathing and time management is essential for mental health.").'
        ]
    },
    reading: {
        topic: 'Skill Focus: Reading',
        objective: 'Students will be able to read an editorial on student stress and analyze arguments for establishing healthy boundaries in small groups during a jigsaw reading task.',
        outcomes: [
            'Can comprehend narratives about balancing school, social activities, and personal life.',
            'Can analyze persuasive pieces about managing relaxation effectively (e.g., "The article argues that students who set clear boundaries between school and personal time tend to have lower stress levels.").'
        ]
    },
    speaking: {
        topic: 'Skill Focus: Speaking',
        objective: 'Students will be able to present schedules and talk about managing activities, using present perfect continuous in pairs during a structured peer-feedback session.',
        outcomes: [
            'Can describe the process of balancing school and social activities, explaining strategies to manage time and reduce stress.',
            'Can analyze persuasive pieces about managing relaxation effectively and provide constructive feedback during peer sessions.'
        ]
    },
    writing: {
        topic: 'Skill Focus: Writing',
        objective: 'Students will be able to compose draft copy for their infographic, using second conditional and modals in collaborative groups during a planning workshop.',
        outcomes: [
            'Can write a reflective essay on the experience of balancing school and personal life.',
            'Can collaboratively write a digital text about learning to relax or maintaining school-life balance (e.g., "Take breaks during study sessions and make time for hobbies to relax and recharge.").'
        ]
    }
};

const speechTexts = {
    'listening-intro': "Host: Today we are talking about school and social life. How do you manage your time? Speaker: It has been really challenging. I have been trying to prioritize my tasks, but the stress builds up. I learned that setting clear downtime helps a lot. You might schedule one afternoon a week just for yourself. That could reduce anxiety significantly.",
    'listening-full': "Full Interview: I have been coaching students for years. Tip one: You could set a weekly planner every Sunday. Tip two: Students might reduce stress by including one social event in their schedule. Tip three: You may want to communicate your needs to teachers early. Tip four: Taking short breaks during study sessions could boost focus. These strategies have helped many students achieve a better balance.",
    'listening-short': "Remember: managing balance is ongoing. You might start by writing 3 priorities each morning. Students could also talk to a counselor if stress becomes too great. Taking walks may help reset your mind between study sessions."
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

// ===== NAVIGATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Read skill from body attribute if present
    const bodySkill = document.body.getAttribute('data-skill');
    if (bodySkill && ['listening','reading','speaking','writing'].includes(bodySkill)) {
        state.currentSkill = bodySkill;
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            switchSkill(item.getAttribute('data-skill'));
        });
    });
    createAllWaveforms();

    // Keyword highlight toggle for Stage 2 transcript
    document.querySelectorAll('.kw-word').forEach(span => {
        span.addEventListener('click', function() {
            this.classList.toggle('kw-highlighted');
            if (this.classList.contains('kw-highlighted')) {
                this.style.background = '#fef08a';
                this.style.borderBottom = '2px solid #ca8a04';
            } else {
                this.style.background = '';
                this.style.borderBottom = '2px dashed var(--color-primary)';
            }
        });
    });

    // Initialize initial skill state
    switchSkill(state.currentSkill);
});

function switchSkill(skillName) {
    state.currentSkill = skillName;
    state.currentStage = 1;
    document.querySelectorAll('.skill-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
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
    showToast(`Plan 3 – ${skillName.charAt(0).toUpperCase() + skillName.slice(1)} Skill loaded!`, 'info');
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
    
    // Redirect back to Plan 3 Hub after 2 seconds
    setTimeout(() => {
        window.location.href = 'plan3hub.html';
    }, 2000);
}

// ===== AUDIO / TTS =====
let waveInterval = null;
let synthUtt = null;

function createAllWaveforms() {
    ['waveform-l2','waveform-l4','waveform-l5'].forEach(id => {
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
    const map = { 'listening-intro': 'waveform-l2', 'listening-full': 'waveform-l4', 'listening-short': 'waveform-l5' };
    const btnMap = { 'listening-intro': 'playBtn-l2', 'listening-full': 'playBtn-l4', 'listening-short': 'playBtn-l5' };
    const waveEl = document.getElementById(map[key]);
    const btnEl = document.getElementById(btnMap[key]);
    if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); stopWave(waveEl, btnEl); return; }
    synthUtt = new SpeechSynthesisUtterance(speechTexts[key]);
    synthUtt.lang = 'en-US'; synthUtt.rate = 0.95;
    synthUtt.onstart = () => { if(btnEl) btnEl.textContent = '⏹'; startWave(waveEl); };
    synthUtt.onend = synthUtt.onerror = () => stopWave(waveEl, btnEl);
    window.speechSynthesis.speak(synthUtt);
}

function speakText(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.95;
    window.speechSynthesis.speak(u);
}

function startWave(el) {
    if (!el) return;
    if (waveInterval) clearInterval(waveInterval);
    waveInterval = setInterval(() => {
        el.querySelectorAll('.wave-bar').forEach(b => { b.style.height = (Math.random()*26+4)+'px'; b.classList.add('active'); });
    }, 120);
}

function stopWave(el, btn) {
    if (waveInterval) { clearInterval(waveInterval); waveInterval = null; }
    if (btn) btn.textContent = '▶';
    if (el) el.querySelectorAll('.wave-bar').forEach(b => { b.style.height='4px'; b.classList.remove('active'); });
}

function toggleTranscript(id) { document.getElementById(id).classList.toggle('show'); }

// ===== LISTENING CONTROLLERS =====
function playSound(type) {
    const msgs = { alarm: 'Morning alarm ringing loudly.', typing: 'Typing homework on keyboard.', crowd: 'Noisy hallway with students chattering.' };
    speakText(msgs[type] || type);
    showToast(`Playing: ${type} sound effect`, 'info');
}

function toggleScale(side) {
    state.scaleSelected = side;
    document.getElementById('scale-school').classList.toggle('active', side === 'school');
    document.getElementById('scale-social').classList.toggle('active', side === 'social');
    showToast(`Selected: ${side === 'school' ? 'School Activities' : 'Social Activities'} side of the scale.`, 'info');
}

function checkListeningQuestions() {
    const q1 = document.getElementById('l2-q1').value.trim().toLowerCase();
    const q2 = document.getElementById('l2-q2').value.trim().toLowerCase();
    const q3 = document.getElementById('l2-q3').value.trim().toLowerCase();
    let ok = true;
    const check = (el, cond) => { el.style.borderColor = cond ? 'var(--color-success)' : 'var(--color-error)'; if (!cond) ok = false; };
    check(document.getElementById('l2-q1'), q1.includes('prioritiz') || q1.includes('task') || q1.includes('balance'));
    check(document.getElementById('l2-q2'), q2.includes('afternoon') || q2.includes('downtime') || q2.includes('free'));
    check(document.getElementById('l2-q3'), q3.includes('anxiety') || q3.includes('stress') || q3.includes('reduce'));
    showToast(ok ? 'All answers correct! Well done.' : 'Check highlighted fields and try again.', ok ? 'success' : 'warning');
}

function checkFourBoxes() {
    const filled = ['box1','box2','box3','box4'].every(id => document.getElementById(id).value.trim() !== '');
    showToast(filled ? 'Graphic organizer submitted! Great ideas.' : 'Please fill in all 4 boxes before submitting.', filled ? 'success' : 'warning');
}

function checkListeningTips() {
    const modalRe = /\b(could|might|may)\b/i;
    const tips = ['l4-tip1','l4-tip2','l4-tip3','l4-tip4'];
    let allOk = true;
    tips.forEach(id => {
        const val = document.getElementById(id).value.trim().toLowerCase();
        const ok = modalRe.test(val) && val.length > 5;
        document.getElementById(id).style.borderColor = ok ? 'var(--color-success)' : 'var(--color-error)';
        if (!ok) allOk = false;
    });
    const summary = document.getElementById('l4-summary').value.trim();
    const sentCount = summary.split(/[.!?]+/).filter(Boolean).length;
    if (sentCount < 3) { document.getElementById('l4-summary').style.borderColor = 'var(--color-error)'; allOk = false; }
    else document.getElementById('l4-summary').style.borderColor = 'var(--color-success)';
    showToast(allOk ? 'Tips and summary validated! Excellent work.' : 'Ensure each tip uses could/might/may and summary has 3+ sentences.', allOk ? 'success' : 'warning');
}

function checkListeningSummary() {
    const text = document.getElementById('l5-summary').value.trim().toLowerCase();
    const modalCount = (text.match(/\b(could|might|may)\b/gi) || []).length;
    if (modalCount >= 3) {
        document.getElementById('l5-summary').style.borderColor = 'var(--color-success)';
        showToast(`Great! You used ${modalCount} modal verbs in your summary.`, 'success');
    } else {
        document.getElementById('l5-summary').style.borderColor = 'var(--color-error)';
        showToast(`Found ${modalCount} modal verbs. You need at least 3 (could, might, may).`, 'warning');
    }
}

function submitListeningEvaluation() {
    const summary = document.getElementById('l5-summary').value.trim();
    if (summary.length < 10) {
        showToast('Please write your summary before submitting.', 'warning');
        return;
    }
    const studentInfo = validateStudentInfo('l5');
    if (!studentInfo) return;

    // Score: 3 checkboxes
    const c1 = document.getElementById('l5-c1').checked ? 1 : 0;
    const c2 = document.getElementById('l5-c2').checked ? 1 : 0;
    const c3 = document.getElementById('l5-c3').checked ? 1 : 0;
    const score = c1 + c2 + c3;
    showEvalResult('l5', studentInfo.name, studentInfo.date, studentInfo.time, score, 3);
    showToast(`Evaluation submitted! Score: ${score}/3`, score >= 2 ? 'success' : 'warning');
}

function addStickyNote(skill, inputId) {
    const val = document.getElementById(inputId).value.trim();
    if (!val) { showToast('Please write something before posting!', 'warning'); return; }
    const wall = document.getElementById(`${skill}-sticky-wall`);
    const note = document.createElement('div');
    note.className = 'sticky-note';
    note.innerHTML = `<p>"${val}"</p><span class="sticky-author">You (Now)</span>`;
    wall.appendChild(note);
    document.getElementById(inputId).value = '';
    showToast('Sticky note posted to the board!', 'success');
}

// ===== READING CONTROLLERS =====
function selectHeadline(n) {
    state.headlineSelected = n;
    [1,2,3].forEach(i => document.getElementById(`hl-${i}`).classList.toggle('selected', i === n));
    showToast(`Headline ${n} selected as most relatable.`, 'info');
}

function selectConditional(word, el) {
    if (el.classList.contains('correct')) return;
    el.classList.toggle('selected');
    if (el.classList.contains('selected')) {
        el.classList.add('correct');
        el.style.background = '#dcfce7';
        el.style.borderBottom = '2px solid var(--color-success)';
        showToast('Second conditional sentence highlighted!', 'success');
    } else {
        el.classList.remove('correct');
        el.style.background = '';
        el.style.borderBottom = '';
    }
}

function checkReadingQuestions() {
    const q1 = document.getElementById('r2-q1').value.trim().toLowerCase();
    const q2 = document.getElementById('r2-q2').value.trim().toLowerCase();
    const q3 = document.getElementById('r2-q3').value.trim().toLowerCase();
    let ok = true;
    const chk = (el, cond) => { el.style.borderColor = cond ? 'var(--color-success)' : 'var(--color-error)'; if(!cond) ok=false; };
    chk(document.getElementById('r2-q1'), q1.includes('boundar') || q1.includes('clear') || q1.includes('set'));
    chk(document.getElementById('r2-q2'), q2.includes('schedule') || q2.includes('weekly') || q2.includes('downtime'));
    chk(document.getElementById('r2-q3'), q3.includes('time') || q3.includes('skill') || q3.includes('teach'));
    showToast(ok ? 'Correct answers!' : 'Review highlighted fields.', ok ? 'success' : 'warning');
}

function checkJigsawOrganizer() {
    const c1 = document.getElementById('r3-col1').value.trim();
    const c2 = document.getElementById('r3-col2').value.trim();
    if (c1 && c2) {
        showToast('Comparative organizer submitted! Great jigsaw work.', 'success');
    } else {
        showToast('Please fill in both columns of the organizer.', 'warning');
    }
}

function checkReadingArguments() {
    const filled = ['r4-arg1','r4-arg2','r4-arg3','r4-arg4'].every(id => document.getElementById(id).value.trim().length > 5);
    showToast(filled ? '4 arguments submitted successfully!' : 'Please complete all 4 argument fields.', filled ? 'success' : 'warning');
}

function gradeReadingQuiz() {
    const answers = { 'r5-q1':'b', 'r5-q2':'b', 'r5-q3':'b', 'r5-q4':'b', 'r5-q5':'b' };
    let score = 0;
    for (const [name, correct] of Object.entries(answers)) {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        document.querySelectorAll(`input[name="${name}"]`).forEach(radio => {
            const lbl = radio.closest('.quiz-option');
            lbl.classList.remove('correct','incorrect');
            if (radio.value === correct) lbl.classList.add('correct');
            else if (selected === radio && radio.value !== correct) lbl.classList.add('incorrect');
        });
        if (selected?.value === correct) score++;
    }
    showToast(`Quiz score: ${score}/5`, score >= 4 ? 'success' : 'warning');
}

function gradeReadingEvaluation() {
    const sc1 = document.getElementById('r5-sc1').value.trim();
    const sc2 = document.getElementById('r5-sc2').value.trim();
    if (!sc1 || !sc2) {
        showToast('Please complete the second conditional sentences before submitting.', 'warning');
        return;
    }
    const studentInfo = validateStudentInfo('r5');
    if (!studentInfo) return;

    // Score based on 5-question quiz
    const answers = { 'r5-q1':'b', 'r5-q2':'b', 'r5-q3':'b', 'r5-q4':'b', 'r5-q5':'b' };
    let score = 0;
    for (const [name, correct] of Object.entries(answers)) {
        const selected = document.querySelector(`input[name="${name}"]:checked`);
        if (selected?.value === correct) score++;
    }
    showEvalResult('r5', studentInfo.name, studentInfo.date, studentInfo.time, score, 5);
    showToast(`Reading evaluation submitted! Score: ${score}/5`, score >= 4 ? 'success' : 'warning');
}

function checkSecondConditional() {
    const s1 = document.getElementById('r5-sc1').value.trim().toLowerCase();
    const s2 = document.getElementById('r5-sc2').value.trim().toLowerCase();
    const re = /if\s+\w.+?(would|could|might)/;
    const ok1 = re.test(s1); const ok2 = re.test(s2);
    document.getElementById('r5-sc1').style.borderColor = ok1 ? 'var(--color-success)' : 'var(--color-error)';
    document.getElementById('r5-sc2').style.borderColor = ok2 ? 'var(--color-success)' : 'var(--color-error)';
    showToast(ok1 && ok2 ? 'Both second conditionals are correct!' : 'Ensure structure: If + past simple, ... would/could.', ok1&&ok2 ? 'success' : 'warning');
}

function selectThumb(type) {
    state.thumbSelected = type;
    document.getElementById('thumb-up').classList.toggle('selected', type === 'up');
    document.getElementById('thumb-down').classList.toggle('selected', type === 'down');
}

function submitReadingReflection() {
    const challenge = document.getElementById('r6-challenge').value.trim();
    if (!state.thumbSelected || !challenge) { showToast('Select a thumb rating and describe your challenge.', 'warning'); return; }
    showToast('Reading reflection submitted!', 'success');
}

// ===== SPEAKING CONTROLLERS =====
function checkSpeakingStage1() {
    const problems = document.getElementById('s1-problems').value.trim();
    const activities = document.getElementById('s1-activities').value.trim().toLowerCase();
    const ppcRe = /have been \w+ing/;
    const okProbs = problems.split('\n').filter(Boolean).length >= 1 || problems.length > 10;
    const okAct = ppcRe.test(activities);
    document.getElementById('s1-activities').style.borderColor = okAct ? 'var(--color-success)' : 'var(--color-error)';
    showToast(okAct ? 'PPC sentences verified!' : 'Use "have been + verb-ing" for your activities.', okAct ? 'success' : 'warning');
}

function checkDialoguePPC() {
    const p1 = document.getElementById('s2-ppc1').value.trim().toLowerCase();
    const p2 = document.getElementById('s2-ppc2').value.trim().toLowerCase();
    const ok1 = p1.includes('have') && p1.includes('been') || p1.includes('doing');
    const ok2 = p2.includes('have') && p2.includes('been') || p2.includes('trying');
    document.getElementById('s2-ppc1').style.borderColor = ok1 ? 'var(--color-success)' : 'var(--color-error)';
    document.getElementById('s2-ppc2').style.borderColor = ok2 ? 'var(--color-success)' : 'var(--color-error)';
    showToast(ok1&&ok2 ? 'Both PPC examples identified correctly!' : 'Look for "have/has been + verb-ing" in the dialogue.', ok1&&ok2 ? 'success' : 'warning');
}

function checkSpeakingQuestions() {
    const ppcQRe = /\b(have|has)\s+you\s+been\b|\bwhat\s+have\s+you\s+been\b|\bhow\s+long\s+have\s+you\s+been\b/i;
    const ids = ['s3-q1','s3-q2','s3-q3'];
    let allOk = true;
    ids.forEach(id => {
        const val = document.getElementById(id).value.trim();
        const ok = ppcQRe.test(val) || (val.toLowerCase().includes('have') && val.toLowerCase().includes('been'));
        document.getElementById(id).style.borderColor = ok ? 'var(--color-success)' : 'var(--color-error)';
        if (!ok) allOk = false;
    });
    showToast(allOk ? 'All 3 questions use Present Perfect Continuous correctly!' : 'Questions must use "have/has been" structure.', allOk ? 'success' : 'warning');
}

function checkSpeakingInterview() {
    const share = document.getElementById('s4-share').value.trim().toLowerCase();
    const ppcRe = /has been|have been/;
    const ok = ppcRe.test(share) && share.length > 20;
    document.getElementById('s4-share').style.borderColor = ok ? 'var(--color-success)' : 'var(--color-error)';
    showToast(ok ? 'PPC usage verified in partner summary!' : 'Summary must include "has/have been" to describe partner\'s activities.', ok ? 'success' : 'warning');
}

function submitSpeakingChecklist() {
    const c1 = document.getElementById('s5-c1').checked;
    const c2 = document.getElementById('s5-c2').checked;
    const c3 = document.getElementById('s5-c3').checked;
    const studentInfo = validateStudentInfo('s5');
    if (!studentInfo) return;

    const score = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
    showEvalResult('s5', studentInfo.name, studentInfo.date, studentInfo.time, score, 3);
    showToast(c1&&c2&&c3 ? 'Peer-feedback checklist submitted!' : `Checklist submitted with score ${score}/3.`, score === 3 ? 'success' : 'warning');
}

function submitSpeakingReflection() {
    const ch = document.getElementById('s6-challenge').value.trim();
    const i1 = document.getElementById('s6-improve1').value.trim();
    const i2 = document.getElementById('s6-improve2').value.trim();
    if (ch && i1 && i2) { showToast('Speaking reflection posted!', 'success'); }
    else { showToast('Please fill in the challenge and both improvement ways.', 'warning'); }
}

// ===== WRITING CONTROLLERS =====
function selectInfog(type) {
    state.infographicSelected = type;
    document.getElementById('info-a').classList.toggle('selected', type === 'a');
    document.getElementById('info-b').classList.toggle('selected', type === 'b');
}

function checkWritingStage1() {
    const f1 = document.getElementById('w1-feat1').value.trim();
    const f2 = document.getElementById('w1-feat2').value.trim();
    const modal = document.getElementById('w1-modal').value.trim().toLowerCase();
    const hasModal = /\b(could|would|might|may|can)\b/.test(modal);
    if (f1 && f2 && hasModal) { showToast('Features and modal sentence validated!', 'success'); }
    else if (!hasModal) { showToast('Your sample sentence must include a modal verb (could, might, would, may).', 'warning'); }
    else { showToast('Please fill in both key features.', 'warning'); }
}

function checkWritingSecondConditional() {
    const text = document.getElementById('w2-sc').value.trim().toLowerCase();
    const ok = /if\s+\w.+?(would|could|might)/.test(text);
    document.getElementById('w2-sc').style.borderColor = ok ? 'var(--color-success)' : 'var(--color-error)';
    showToast(ok ? 'Second conditional structure is correct!' : 'Use: If + past simple, ... would/could/might...', ok ? 'success' : 'warning');
}

function selectRole(role) {
    state.roleSelected = role;
    ['scribe','designer','researcher'].forEach(r => document.getElementById(`role-${r}`).classList.toggle('selected', r === role));
    showToast(`Role assigned: ${role.charAt(0).toUpperCase()+role.slice(1)}`, 'info');
}

function checkWritingTips() {
    const tips = ['w3-tip1','w3-tip2','w3-tip3','w3-tip4','w3-tip5'];
    const allFilled = tips.every(id => document.getElementById(id).value.trim().length > 5);
    const hasRole = !!state.roleSelected;
    if (allFilled && hasRole) { showToast('5 tips brainstormed and role assigned!', 'success'); }
    else if (!hasRole) { showToast('Please select a group role first.', 'warning'); }
    else { showToast('Fill in all 5 tips before submitting.', 'warning'); }
}

function updateWritingBadges() {
    const text = document.getElementById('w4-draft').value.trim();
    const words = text === '' ? 0 : text.split(/\s+/).length;
    document.getElementById('w4-wordcount').textContent = `Words: ${words}`;
    const hasSC = /if\s+\w.+?(would|could|might)/i.test(text);
    const hasModal = /\b(could|might|may|would)\b/i.test(text);
    const hasIf = /\bif\b/i.test(text);
    const badge = (id, ok) => { const el = document.getElementById(id); el.classList.toggle('valid', ok); };
    badge('badge-second-cond', hasSC);
    badge('badge-modal', hasModal);
    badge('badge-if', hasIf);
}

function submitWritingDraft() {
    const text = document.getElementById('w4-draft').value.trim();
    const hasSC = /if\s+\w.+?(would|could|might)/i.test(text);
    const hasModal = /\b(could|might|may|would)\b/i.test(text);
    if (hasSC && hasModal && text.length > 30) { showToast('Draft captions submitted! Ready for peer editing.', 'success'); }
    else { showToast('Ensure you use second conditional (If + past, would/could) and modal verbs.', 'warning'); }
}

function submitPeerEditing() {
    const revised = document.getElementById('w5-revised').value.trim();
    if (!revised) {
        showToast('Please write your revised paragraph before submitting.', 'warning');
        return;
    }
    const studentInfo = validateStudentInfo('w5');
    if (!studentInfo) return;

    const c1 = document.getElementById('w5-c1').checked;
    const c2 = document.getElementById('w5-c2').checked;
    const c3 = document.getElementById('w5-c3').checked;
    const score = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
    showEvalResult('w5', studentInfo.name, studentInfo.date, studentInfo.time, score, 3);
    showToast(c1&&c2&&c3 ? 'Peer editing rubric and final draft submitted!' : `Writing evaluation submitted with score ${score}/3.`, score === 3 ? 'success' : 'warning');
}

function submitWritingReflection() {
    const improved = document.getElementById('w6-improved').value.trim();
    const commitment = document.getElementById('w6-commitment').value.trim();
    if (!improved || !commitment) { showToast('Please complete both fields before posting.', 'warning'); return; }
    const wall = document.getElementById('writing-sticky-wall');
    const note = document.createElement('div');
    note.className = 'sticky-note';
    note.innerHTML = `<p>"${commitment}"</p><span class="sticky-author">You (Now)</span>`;
    wall.appendChild(note);
    document.getElementById('w6-improved').value = '';
    document.getElementById('w6-commitment').value = '';
    showToast('Reflection Circle note posted!', 'success');
}
