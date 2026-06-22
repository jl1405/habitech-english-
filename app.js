// Application State Management
const state = {
    currentSkill: 'listening',
    currentStage: 1,
    completedSkills: [],
    wordCounts: {
        sleep: 0,
        track: 0,
        habits: 0
    },
    // Reading Draggable Organizers
    organizerAnswers: {
        benefits: [],
        limitations: []
    },
    readingTransitionsSelected: [],
    speakingRole: 'coach',
    speakingChatHistory: [],
    writingParagraphValid: false,
    confidenceRating: 0
};

// Skill Metadata for objectives & outcomes
const skillMetadata = {
    listening: {
        topic: 'Skill Focus: Listening',
        objective: 'Students will be able to listen to a fitness podcast and interpret recommendations about tracking sleep patterns in pairs during a chart-completion task by the end of the lesson.',
        outcomes: [
            'Can demonstrate understanding of extended discussions about health technologies and long-term habits (e.g. "I have been using a fitness app to improve my workout routine").',
            'Can follow a simulated negotiation between a patient and a health coach about creating a fitness plan.'
        ]
    },
    reading: {
        topic: 'Skill Focus: Reading',
        objective: 'Students will be able to read an informational article and analyze opinion editorials about wellness apps in small groups during a graphic organizer task by the end of the lesson.',
        outcomes: [
            'Can analyze opinion editorials on health and wellness topics, identifying the writer\'s stance and supporting arguments.',
            'Can evaluate informational content from articles about using healthy technology to develop good habits, identifying key points and potential biases.'
        ]
    },
    speaking: {
        topic: 'Skill Focus: Speaking',
        objective: 'Students will be able to negotiate about daily habits and fitness plans using modals for possibility in pairs during a simulated health coach consultation by the end of the lesson.',
        outcomes: [
            'Can describe personal dreams and ambitions related to health and wellness, using clear and organized speech.',
            'Can discuss general health habits and their impact on well-being in a conversation with peers.'
        ]
    },
    writing: {
        topic: 'Skill Focus: Writing',
        objective: 'Students will be able to write a personal health action plan using present perfect continuous individually during a journal drafting task by the end of the lesson.',
        outcomes: [
            'Can outline strategies for personal development related to health and balance in a well-organized text.',
            'Can collaboratively create a study guide on health and wellness topics, incorporating tips and strategies.'
        ]
    }
};

// TTS Speech Transcripts
const speechTranscripts = {
    'listening-intro': "Welcome back to the Daily Fitness podcast. Lately, I have been using a fitness app to improve my workout routine, and I have been tracking my sleep patterns. Understanding metrics like deep sleep, light sleep, and awake times is essential for establishing good health habits. Over the past month, we have been studying how wearables analyze our sleep schedules to optimize productivity.",
    'listening-full': "Let's break down the tracked data. On Monday night, the subject slept well, recording 2 hours of Deep Sleep, 5 hours of Light Sleep, and was Awake for 10 minutes. On Tuesday night, things fluctuated, showing 1.5 hours of Deep Sleep, 4 hours of Light Sleep, and they were Awake for 30 minutes. Finally, on Wednesday night, sleep improved dramatically with 2.5 hours of Deep Sleep, 5.5 hours of Light Sleep, and only 5 minutes Awake. Make sure to complete your templates!",
    'speaking-intro': "Coach: Hi there! How can I assist you with your habits today? Client: I want to feel more energetic, but I don't know where to start. I could try walking in the morning. Coach: That sounds great! You might also try cutting down on screentime before bed. We could check in next week. Client: Okay! I may struggle with screens, but I'll try."
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
    // Save current state or settings
    state.currentSkill = skillName;
    state.currentStage = 1;
    
    // UI clean up
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
    
    // Switch active stage container back to stage 1
    const skillSectionContainer = document.getElementById(`${skillName}-section`);
    if (skillSectionContainer) {
        skillSectionContainer.querySelectorAll('.stage-container').forEach(container => {
            container.classList.remove('active');
        });
    }
    const stage1 = document.getElementById(`${skillName}-stage-1`);
    if (stage1) stage1.classList.add('active');
    
    // Update active metadata headers
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
    
    // Update Stepper
    updateStepper();
    
    // Custom triggers per skill switch
    if (skillName === 'speaking') {
        if (typeof initSpeakingChat === 'function') initSpeakingChat();
    }
    
    showToast(`Loaded ${skillName.charAt(0).toUpperCase() + skillName.slice(1)} Skill Section!`, 'info');
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
        window.speechSynthesis.cancel(); // Cancel any running voice synthesis
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
    }
}

function markSkillComplete(skillName) {
    if (!state.completedSkills.includes(skillName)) {
        state.completedSkills.push(skillName);
        const navItem = document.getElementById(`nav-${skillName}`);
        if (navItem) navItem.classList.add('completed');
    }
    
    showToast(`Congratulations! You have completed the ${skillName.toUpperCase()} skill.`, 'success');
    
    // Redirect back to Plan 1 Hub after 2 seconds
    setTimeout(() => {
        window.location.href = 'plan1hub.html';
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
    
    // Initialize waveforms
    createWaveforms();
    
    // Initialize reading select handles
    initReadingLogoSelectors();
    
    // Initialize reading selectable words
    initReadingTransitions();
    
    // Drag and Drop setups
    initDragAndDrop();

    // Set initial skill state
    switchSkill(state.currentSkill);

    // --- URL parameter: ?skill=listening|reading|speaking|writing ---
    const urlParams = new URLSearchParams(window.location.search);
    const skillParam = urlParams.get('skill');
    if (skillParam && ['listening','reading','speaking','writing'].includes(skillParam)) {
        switchSkill(skillParam);
    }
});

// ================= AUDIO SIMULATION WITH WEB SPEECH API =================
let synthUtterance = null;
let waveInterval = null;

function createWaveforms() {
    const waveContainers = ['waveform-l2', 'waveform-l4', 'waveform-s1'];
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

function playTTS(transcriptKey) {
    const isPlaying = synthUtterance && window.speechSynthesis.speaking;
    
    // Determine target play buttons and waveforms
    let activeBtn = null;
    let activeWave = null;
    
    if (transcriptKey === 'listening-intro') {
        activeBtn = document.getElementById('playBtn-l2');
        activeWave = document.getElementById('waveform-l2');
    } else if (transcriptKey === 'listening-full') {
        activeBtn = document.getElementById('playBtn-l4');
        activeWave = document.getElementById('waveform-l4');
    } else if (transcriptKey === 'speaking-intro') {
        activeBtn = document.getElementById('playBtn-s1');
        activeWave = document.getElementById('waveform-s1');
    }
    
    if (isPlaying) {
        window.speechSynthesis.cancel();
        stopWaveformAnimation(activeWave, activeBtn);
        return;
    }
    
    // Start Speaking
    const textToSpeak = speechTranscripts[transcriptKey];
    synthUtterance = new SpeechSynthesisUtterance(textToSpeak);
    synthUtterance.lang = 'en-US';
    synthUtterance.rate = 0.95;
    
    synthUtterance.onstart = () => {
        activeBtn.textContent = '⏹';
        startWaveformAnimation(activeWave);
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

// ================= LISTENING EXERCISE CONTROLS =================
function changeCount(word, val) {
    const currentVal = state.wordCounts[word];
    if (currentVal + val >= 0) {
        state.wordCounts[word] += val;
        document.getElementById(`count-${word}`).textContent = state.wordCounts[word];
    }
}

function countWordClick(el) {
    const wordType = el.getAttribute('data-word');
    if (el.classList.contains('selected')) {
        el.classList.remove('selected');
        state.wordCounts[wordType] = Math.max(0, state.wordCounts[wordType] - 1);
    } else {
        el.classList.add('selected');
        state.wordCounts[wordType]++;
    }
    document.getElementById(`count-${wordType}`).textContent = state.wordCounts[wordType];
}

function checkWordCounts() {
    const answers = { sleep: 4, track: 1, habits: 1 };
    
    let isCorrect = true;
    for (let word in answers) {
        if (state.wordCounts[word] !== answers[word]) {
            isCorrect = false;
        }
    }
    
    if (isCorrect) {
        showToast("Correct word frequencies logged! Great listening skill.", "success");
    } else {
        showToast("Some word counts are incorrect. Read the transcript or listen again!", "warning");
    }
}

function checkSleepTracking() {
    const userAnswers = {
        mDeep: parseFloat(document.getElementById('l4-mon-deep').value),
        mLight: parseFloat(document.getElementById('l4-mon-light').value),
        mAwake: parseInt(document.getElementById('l4-mon-awake').value),
        tDeep: parseFloat(document.getElementById('l4-tue-deep').value),
        tLight: parseFloat(document.getElementById('l4-tue-light').value),
        tAwake: parseInt(document.getElementById('l4-tue-awake').value),
        wDeep: parseFloat(document.getElementById('l4-wed-deep').value),
        wLight: parseFloat(document.getElementById('l4-wed-light').value),
        wAwake: parseInt(document.getElementById('l4-wed-awake').value),
    };
    
    const correctAnswers = {
        mDeep: 2, mLight: 5, mAwake: 10,
        tDeep: 1.5, tLight: 4, tAwake: 30,
        wDeep: 2.5, wLight: 5.5, wAwake: 5
    };
    
    let isCorrect = true;
    for (let key in correctAnswers) {
        const inputEl = document.getElementById(getSleepTrackingInputId(key));
        if (userAnswers[key] === correctAnswers[key]) {
            inputEl.style.borderColor = 'var(--color-success)';
        } else {
            inputEl.style.borderColor = 'var(--color-error)';
            isCorrect = false;
        }
    }
    
    if (isCorrect) {
        showToast("Sleep tracking template filled out correctly! Excellent work.", "success");
    } else {
        showToast("Review the podcast tracking numbers. Highlighted cells are incorrect.", "warning");
    }
}

function getSleepTrackingInputId(key) {
    const mapping = {
        mDeep: 'l4-mon-deep', mLight: 'l4-mon-light', mAwake: 'l4-mon-awake',
        tDeep: 'l4-tue-deep', tLight: 'l4-tue-light', tAwake: 'l4-tue-awake',
        wDeep: 'l4-wed-deep', wLight: 'l4-wed-light', wAwake: 'l4-wed-awake'
    };
    return mapping[key];
}

function gradeListeningQuiz() {
    const studentInfo = validateStudentInfo('l5');
    if (!studentInfo) return;

    const answerKeys = {
        'l5-q1': 'wednesday',
        'l5-q2': '30',
        'l5-q3': '14.5',
        'l5-q4': 'wednesday',
        'l5-q5': 'habits'
    };
    
    let score = 0;
    
    for (let key in answerKeys) {
        const selectedRadio = document.querySelector(`input[name="${key}"]:checked`);
        const optionsList = document.querySelectorAll(`input[name="${key}"]`);
        
        optionsList.forEach(radio => {
            const parentLabel = radio.closest('.quiz-option');
            parentLabel.classList.remove('correct', 'incorrect');
            
            if (radio.value === answerKeys[key]) {
                parentLabel.classList.add('correct');
            }
            
            if (selectedRadio && selectedRadio === radio && radio.value !== answerKeys[key]) {
                parentLabel.classList.add('incorrect');
            }
        });
        
        if (selectedRadio && selectedRadio.value === answerKeys[key]) {
            score++;
        }
    }
    
    showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: ${score} de 5`, score >= 4 ? 'success' : 'warning');
    showEvalResult('l5', studentInfo.name, studentInfo.date, studentInfo.time, score, 5);
}

function addStickyNote(skill) {
    const textEl = document.getElementById(`${skill === 'listening' ? 'l' : 'w'}6-reflection`);
    const val = textEl.value.trim();
    
    if (val === '') {
        showToast('Please type a reflection sentence first!', 'warning');
        return;
    }
    
    const container = document.getElementById(`${skill}-sticky-wall`);
    const note = document.createElement('div');
    note.className = 'sticky-note';
    
    note.innerHTML = `
        <p>"${val}"</p>
        <span class="sticky-author">You (Just Now)</span>
    `;
    
    container.appendChild(note);
    textEl.value = '';
    
    showToast('Your reflection note has been posted to the board!', 'success');
}

// ================= READING EXERCISE CONTROLS =================
function initReadingLogoSelectors() {
    const logoMap = {
        'r1-logo1': 'meditation',
        'r1-logo2': 'fitness',
        'r1-logo3': 'nutrition'
    };
    
    for (let selectId in logoMap) {
        const el = document.getElementById(selectId);
        if (el) {
            el.addEventListener('change', () => {
                if (el.value === logoMap[selectId]) {
                    el.style.borderColor = 'var(--color-success)';
                } else {
                    el.style.borderColor = 'var(--color-error)';
                }
            });
        }
    }
}

function initReadingTransitions() {
    const words = document.querySelectorAll('.selectable-word');
    words.forEach(word => {
        word.addEventListener('click', () => {
            const val = word.getAttribute('data-word');
            
            if (word.classList.contains('selected')) {
                word.classList.remove('selected');
                state.readingTransitionsSelected = state.readingTransitionsSelected.filter(w => w !== val);
            } else {
                if (state.readingTransitionsSelected.length >= 3) {
                    showToast("You can highlight up to 3 transition words maximum.", "warning");
                    return;
                }
                word.classList.add('selected');
                state.readingTransitionsSelected.push(val);
            }
        });
    });
}

function verifyReadingTransitions() {
    const correctTransitions = ['However', 'Furthermore', 'In contrast', 'Consequently', 'Therefore'];
    const totalCorrect = state.readingTransitionsSelected.filter(w => correctTransitions.includes(w)).length;
    
    const words = document.querySelectorAll('.selectable-word');
    words.forEach(word => {
        const val = word.getAttribute('data-word');
        if (correctTransitions.includes(val) && word.classList.contains('selected')) {
            word.classList.add('correct');
        }
    });
    
    if (totalCorrect === 3 && state.readingTransitionsSelected.length === 3) {
        showToast("Outstanding! You found 3 transition words.", "success");
    } else {
        showToast(`You successfully identified ${totalCorrect} / 3 correct transitions. Keep searching!`, "warning");
    }
}

// Graphic Organizer Drag and Drop
function initDragAndDrop() {
    const draggableItems = document.querySelectorAll('.draggable-item');
    draggableItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.id);
        });
    });
}

function allowDrop(e) {
    e.preventDefault();
}

function dropItem(e, listType) {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    assignTo(itemId.replace('item-', ''), listType);
}

// Assigns item using click or drag method
function assignTo(itemCode, targetCol) {
    const itemId = `item-${itemCode}`;
    const itemEl = document.getElementById(itemId);
    
    if (!itemEl) return;
    
    const targetList = document.getElementById(`list-${targetCol}`);
    targetList.appendChild(itemEl);
    
    state.organizerAnswers.benefits = state.organizerAnswers.benefits.filter(item => item !== itemCode);
    state.organizerAnswers.limitations = state.organizerAnswers.limitations.filter(item => item !== itemCode);
    
    state.organizerAnswers[targetCol].push(itemCode);
}

function verifyGraphicOrganizer() {
    const correctBenefits = ['b1', 'b2', 'b3'];
    const correctLimitations = ['l1', 'l2', 'l3'];
    
    let score = 0;
    
    state.organizerAnswers.benefits.forEach(code => {
        const itemEl = document.getElementById(`item-${code}`);
        if (correctBenefits.includes(code)) {
            itemEl.style.borderColor = 'var(--color-success)';
            score++;
        } else {
            itemEl.style.borderColor = 'var(--color-error)';
        }
    });

    state.organizerAnswers.limitations.forEach(code => {
        const itemEl = document.getElementById(`item-${code}`);
        if (correctLimitations.includes(code)) {
            itemEl.style.borderColor = 'var(--color-success)';
            score++;
        } else {
            itemEl.style.borderColor = 'var(--color-error)';
        }
    });
    
    if (score === 6) {
        showToast("Organizer matches opinion editorial claims perfectly!", "success");
    } else {
        showToast(`You have placed ${score} / 6 statements correctly. Red border elements are incorrect.`, "warning");
    }
}

function gradeReadingEvaluation() {
    const studentInfo = validateStudentInfo('r5');
    if (!studentInfo) return;

    const q1 = document.querySelector('input[name="r5-q1"]:checked');
    const q2 = document.querySelector('input[name="r5-q2"]:checked');
    const q3 = document.getElementById('r5-q3').value.toLowerCase();
    
    let score = 0;
    
    if (q1 && q1.value === 'balanced') {
        q1.closest('.quiz-option').classList.add('correct');
        score++;
    } else {
        if (q1) q1.closest('.quiz-option').classList.add('incorrect');
    }

    if (q2 && q2.value === 'Furthermore') {
        q2.closest('.quiz-option').classList.add('correct');
        score++;
    } else {
        if (q2) q2.closest('.quiz-option').classList.add('incorrect');
    }
    
    const hasAssistants = q3.includes('assistant') || q3.includes('assistants');
    const hasRules = q3.includes('rules') || q3.includes('rule');
    
    if (hasAssistants || hasRules) {
        document.getElementById('r5-q3').style.borderColor = 'var(--color-success)';
        score++;
    } else {
        document.getElementById('r5-q3').style.borderColor = 'var(--color-error)';
    }
    
    if (score === 3) {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: 3 de 3`, "success");
    } else {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: ${score} de 3. Revisa los campos resaltados.`, "warning");
    }
    
    showEvalResult('r5', studentInfo.name, studentInfo.date, studentInfo.time, score, 3);
}

function submitStarsAndWish() {
    const star1 = document.getElementById('r6-star1').value.trim();
    const star2 = document.getElementById('r6-star2').value.trim();
    const wish = document.getElementById('r6-wish').value.trim();
    
    if (star1 === '' || star2 === '' || wish === '') {
        showToast("Please make sure both stars and the wish comments are filled out.", "warning");
        return;
    }
    
    showToast("Feedback submitted successfully!", "success");
    document.getElementById('r6-star1').value = '';
    document.getElementById('r6-star2').value = '';
    document.getElementById('r6-wish').value = '';
}

// ================= SPEAKING EXERCISE CONTROLS =================
function validateSpeakingDrafts() {
    const d1 = document.getElementById('s3-draft1').value.trim().toLowerCase();
    const d2 = document.getElementById('s3-draft2').value.trim().toLowerCase();
    const d3 = document.getElementById('s3-draft3').value.trim().toLowerCase();
    
    let isCorrect = true;
    
    if (d1.includes('could')) {
        document.getElementById('s3-draft1').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('s3-draft1').style.borderColor = 'var(--color-error)';
        isCorrect = false;
    }

    if (d2.includes('might')) {
        document.getElementById('s3-draft2').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('s3-draft2').style.borderColor = 'var(--color-error)';
        isCorrect = false;
    }

    if (d3.includes('may')) {
        document.getElementById('s3-draft3').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('s3-draft3').style.borderColor = 'var(--color-error)';
        isCorrect = false;
    }
    
    if (isCorrect) {
        showToast("Great drafts! Modal verbs are integrated correctly.", "success");
    } else {
        showToast("Check modal placement (could, might, may) in red textboxes.", "warning");
    }
}

function selectSpeakingRole(role) {
    state.speakingRole = role;
    document.querySelectorAll('.role-card').forEach(card => card.classList.remove('selected'));
    document.getElementById(`role-${role}`).classList.add('selected');
    
    initSpeakingChat();
}

function initSpeakingChat() {
    const chatContainer = document.getElementById('consultation-chat');
    if (!chatContainer) return;
    
    chatContainer.innerHTML = '';
    state.speakingChatHistory = [];
    
    let welcomeMsg = "";
    if (state.speakingRole === 'coach') {
        welcomeMsg = "Client: Hello Coach! I have been struggling to stay consistent with my fitness app workouts. I'm always too tired. What can I do?";
        appendChatBubble('Client', welcomeMsg, 'client');
    } else {
        welcomeMsg = "Coach: Hello! Welcome to your consultation. What habits have you been trying to form, and where could we improve?";
        appendChatBubble('Health Coach', welcomeMsg, 'coach');
    }
}

function appendChatBubble(sender, message, type) {
    const container = document.getElementById('consultation-chat');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${type}`;
    
    bubble.innerHTML = `
        <span class="chat-sender">${sender}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function toggleTranscript(id) {
    const el = document.getElementById(id);
    el.classList.toggle('show');
}

function sendSpeakingChatMessage() {
    const inputEl = document.getElementById('speaking-chat-input');
    const msgText = inputEl.value.trim();
    
    if (msgText === '') return;
    
    const userSender = state.speakingRole === 'coach' ? 'Health Coach' : 'Client';
    const userType = state.speakingRole === 'coach' ? 'coach' : 'client';
    appendChatBubble(userSender, msgText, userType);
    
    inputEl.value = '';
    
    const hasModal = msgText.toLowerCase().includes('could') || 
                     msgText.toLowerCase().includes('might') || 
                     msgText.toLowerCase().includes('may');
                     
    setTimeout(() => {
        let response = "";
        
        if (state.speakingRole === 'coach') {
            if (hasModal) {
                response = "Client: That makes a lot of sense! I might try that. It could help me stay energized in the long term.";
                showToast("Grammar Success: You successfully negotiated using possibility modals!", "success");
            } else {
                response = "Client: Okay. But how exactly could I start that? I need some options to make it easier for my schedule.";
                showToast("Grammar Checklist: Remember to suggest options using 'could', 'might', or 'may'!", "warning");
            }
            appendChatBubble('Client', response, 'client');
        } else {
            if (hasModal) {
                response = "Coach: That is a wonderful goal. Since you are motivated, you could set up simple app reminders to keep a consistent log.";
                showToast("Grammar Success: You described details using correct modal verbs!", "success");
            } else {
                response = "Coach: I see. Remember, to make suggestions polite, we could say what we 'might' do or what 'may' happen. Give that a try!";
                showToast("Grammar Checklist: Try describing your goals with 'could', 'might' or 'may'!", "warning");
            }
            appendChatBubble('Health Coach', response, 'coach');
        }
        
    }, 1000);
}

function submitSpeakingEvaluation() {
    const studentInfo = validateStudentInfo('s5');
    if (!studentInfo) return;

    const c1 = document.getElementById('s5-c1').checked;
    const c2 = document.getElementById('s5-c2').checked;
    const c3 = document.getElementById('s5-c3').checked;
    
    const score = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
    
    if (score === 3) {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: 3 de 3`, "success");
    } else {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: ${score} de 3. Completa todos los criterios.`, "warning");
    }
    
    showEvalResult('s5', studentInfo.name, studentInfo.date, studentInfo.time, score, 3);
}

function selectConfidence(stars) {
    state.confidenceRating = stars;
    document.querySelectorAll('.confidence-button').forEach((btn, idx) => {
        if (idx < stars) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

function submitSpeakingConfidence() {
    const explanation = document.getElementById('s6-explanation').value.trim();
    if (state.confidenceRating === 0 || explanation === '') {
        showToast("Please rate your confidence and provide an explanation.", "warning");
        return;
    }
    showToast("Confidence feedback submitted successfully!", "success");
}

// ================= WRITING EXERCISE CONTROLS =================
function validateWritingAdjectives() {
    const s1 = document.getElementById('w2-s1').value.trim().toLowerCase();
    const s2 = document.getElementById('w2-s2').value.trim().toLowerCase();
    
    let isCorrect = true;
    
    if (s1.includes('balanced')) {
        document.getElementById('w2-s1').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('w2-s1').style.borderColor = 'var(--color-error)';
        isCorrect = false;
    }

    if (s2.includes('consistent')) {
        document.getElementById('w2-s2').style.borderColor = 'var(--color-success)';
    } else {
        document.getElementById('w2-s2').style.borderColor = 'var(--color-error)';
        isCorrect = false;
    }
    
    if (isCorrect) {
        showToast("Vocabulary validated! Sentences integrate the adjectives correctly.", "success");
    } else {
        showToast("Ensure 'balanced' is in Sentence 1 and 'consistent' is in Sentence 2.", "warning");
    }
}

function validateWritingBrainstorm() {
    const a1 = document.getElementById('w3-act1').value.trim().toLowerCase();
    const a2 = document.getElementById('w3-act2').value.trim().toLowerCase();
    const a3 = document.getElementById('w3-act3').value.trim().toLowerCase();
    
    let isCorrect = true;
    const ppcRegex = /(?:have|has)\s+(?:been\s+)\w+ing/;
    
    [a1, a2, a3].forEach((act, idx) => {
        const inputId = `w3-act${idx + 1}`;
        if (ppcRegex.test(act)) {
            document.getElementById(inputId).style.borderColor = 'var(--color-success)';
        } else {
            document.getElementById(inputId).style.borderColor = 'var(--color-error)';
            isCorrect = false;
        }
    });
    
    if (isCorrect) {
        showToast("PPC structures validated! Good brainstorming.", "success");
    } else {
        showToast("Review the red textboxes. Make sure they use have/has been + verb-ing.", "warning");
    }
}

// Live writing analytics check
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
    const hasBalanced = text.toLowerCase().includes('balanced');
    const hasConsistent = text.toLowerCase().includes('consistent');
    const hasMaintain = text.toLowerCase().includes('maintain');
    const hasTrack = text.toLowerCase().includes('track');
    
    updateBadgeStatus('w4-has-ppc', hasPPC);
    updateBadgeStatus('w4-has-balanced', hasBalanced);
    updateBadgeStatus('w4-has-consistent', hasConsistent);
    updateBadgeStatus('w4-has-maintain', hasMaintain);
    updateBadgeStatus('w4-has-track', hasTrack);
    
    state.writingParagraphValid = hasPPC && hasBalanced && hasConsistent && hasMaintain && hasTrack && (words >= 60 && words <= 80);
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
    const d1Sleep = document.getElementById('w4-d1-sleep').value;
    const d1Water = document.getElementById('w4-d1-water').value;
    const d1Active = document.getElementById('w4-d1-active').value;
    const d2Sleep = document.getElementById('w4-d2-sleep').value;
    const d2Water = document.getElementById('w4-d2-water').value;
    const d2Active = document.getElementById('w4-d2-active').value;
    
    const logFilled = d1Sleep && d1Water && d1Active && d2Sleep && d2Water && d2Active;
    
    updateWritingAnalytics();
    
    if (!state.writingParagraphValid) {
        showToast("Review your Action Plan paragraph. Check the tags and make sure the word count is between 60-80 words.", "warning");
        return;
    }
    
    if (!logFilled) {
        showToast("Please fill in all values for the Daily Metrics Log table.", "warning");
        return;
    }
    
    showToast("Health Action Plan and Daily Log saved! Proceed to final evaluation.", "success");
}

function submitWritingEvaluation() {
    const studentInfo = validateStudentInfo('w5');
    if (!studentInfo) return;

    const c1 = document.getElementById('w5-c1').checked;
    const c2 = document.getElementById('w5-c2').checked;
    const c3 = document.getElementById('w5-c3').checked;
    
    const score = (c1 ? 1 : 0) + (c2 ? 1 : 0) + (c3 ? 1 : 0);
    
    if (score === 3) {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: 3 de 3`, "success");
    } else {
        showToast(`¡Evaluación enviada! Puntaje de ${studentInfo.name}: ${score} de 3. Completa todos los criterios.`, "warning");
    }
    
    showEvalResult('w5', studentInfo.name, studentInfo.date, studentInfo.time, score, 3);
}
