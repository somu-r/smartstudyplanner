/**
 * Smart Campus - Timetable and Study Planner
 * Core Application Logic & Dynamic Scheduling Engine
 */

// --- Default Configuration & Presets ---
const PRESETS = {
  cs: {
    name: "Computer Science Major",
    hours: { mon: 4, tue: 3, wed: 4, thu: 3, fri: 2, sat: 5, sun: 4 },
    slotDuration: 1.5,
    preferredWindow: "balanced",
    subjects: [
      { id: "cs1", name: "CS301 Algorithms & Data Structures", difficulty: 4, minHours: 6, color: "#ef4444" },
      { id: "cs2", name: "CS305 Operating Systems", difficulty: 3, minHours: 5, color: "#3b82f6" },
      { id: "cs3", name: "MATH210 Linear Algebra", difficulty: 3, minHours: 4, color: "#10b981" },
      { id: "cs4", name: "AI401 Intro to Machine Learning", difficulty: 4, minHours: 5, color: "#8b5cf6" }
    ],
    deadlines: [
      { id: "cd1", title: "OS Midterm Exam", subjectId: "cs2", type: "Exam", dueDate: getRelativeDate(3), estimatedHours: 7, completedHours: 0 },
      { id: "cd2", title: "Algorithms Lab 3", subjectId: "cs1", type: "Assignment", dueDate: getRelativeDate(5), estimatedHours: 5, completedHours: 0 },
      { id: "cd3", title: "Linear Algebra Problem Set", subjectId: "cs3", type: "Assignment", dueDate: getRelativeDate(2), estimatedHours: 3, completedHours: 0 },
      { id: "cd4", title: "ML Project Phase 1", subjectId: "cs4", type: "Project", dueDate: getRelativeDate(6), estimatedHours: 6, completedHours: 0 }
    ]
  },
  premed: {
    name: "Pre-Med / Biology Student",
    hours: { mon: 5, tue: 4, wed: 5, thu: 4, fri: 3, sat: 6, sun: 5 },
    slotDuration: 1.5,
    preferredWindow: "morning",
    subjects: [
      { id: "pm1", name: "CHEM301 Organic Chemistry", difficulty: 4, minHours: 7, color: "#f97316" },
      { id: "pm2", name: "BIOL202 Human Anatomy & Phys", difficulty: 3, minHours: 6, color: "#06b6d4" },
      { id: "pm3", name: "CHEM405 Biochemistry", difficulty: 4, minHours: 6, color: "#ec4899" },
      { id: "pm4", name: "STAT200 Biostatistics", difficulty: 2, minHours: 4, color: "#14b8a6" }
    ],
    deadlines: [
      { id: "pd1", title: "Orgo Reaction Mechanisms Exam", subjectId: "pm1", type: "Exam", dueDate: getRelativeDate(3), estimatedHours: 9, completedHours: 0 },
      { id: "pd2", title: "Anatomy Cadaver Lab Practical", subjectId: "pm2", type: "Exam", dueDate: getRelativeDate(5), estimatedHours: 6, completedHours: 0 },
      { id: "pd3", title: "Biochemistry Enzyme Lab Report", subjectId: "pm3", type: "Assignment", dueDate: getRelativeDate(4), estimatedHours: 4, completedHours: 0 }
    ]
  },
  examweek: {
    name: "Exam Crunch Week",
    hours: { mon: 6, tue: 6, wed: 6, thu: 6, fri: 5, sat: 7, sun: 6 },
    slotDuration: 2,
    preferredWindow: "balanced",
    subjects: [
      { id: "ex1", name: "Advanced Thermodynamics", difficulty: 4, minHours: 10, color: "#ef4444" },
      { id: "ex2", name: "Signals and Systems", difficulty: 4, minHours: 10, color: "#6366f1" },
      { id: "ex3", name: "Electromagnetics II", difficulty: 3, minHours: 8, color: "#f59e0b" }
    ],
    deadlines: [
      { id: "ed1", title: "Thermo Final Exam", subjectId: "ex1", type: "Exam", dueDate: getRelativeDate(2), estimatedHours: 12, completedHours: 0 },
      { id: "ed2", title: "Signals Comprehensive Quiz", subjectId: "ex2", type: "Exam", dueDate: getRelativeDate(4), estimatedHours: 10, completedHours: 0 },
      { id: "ed3", title: "Electromagnetics Paper & Oral", subjectId: "ex3", type: "Project", dueDate: getRelativeDate(6), estimatedHours: 8, completedHours: 0 }
    ]
  }
};

const COLOR_PALETTE = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981", 
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"
];

const DAYS_OF_WEEK = [
  { key: "mon", name: "Monday", short: "Mon" },
  { key: "tue", name: "Tuesday", short: "Tue" },
  { key: "wed", name: "Wednesday", short: "Wed" },
  { key: "thu", name: "Thursday", short: "Thu" },
  { key: "fri", name: "Friday", short: "Fri" },
  { key: "sat", name: "Saturday", short: "Sat" },
  { key: "sun", name: "Sunday", short: "Sun" }
];

// Helper to get ISO date string relative to today
function getRelativeDate(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

// --- Application State ---
let state = {
  hours: { mon: 4, tue: 3, wed: 4, thu: 3, fri: 2, sat: 5, sun: 4 },
  slotDuration: 1.5,
  preferredWindow: "balanced",
  subjects: [],
  deadlines: [],
  completedSessions: {}, // key: "dayIndex-slotIndex", val: true
  activePomodoro: {
    isRunning: false,
    timeLeft: 25 * 60,
    interval: null,
    currentTaskTitle: null,
    sessionId: null
  }
};

// Global Chart References
let subjectChartInstance = null;
let dailyChartInstance = null;
let currentMobileDayFilter = "all";

// --- Initialize App ---
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  initColorPicker();
  renderHoursControls();
  renderSubjectList();
  renderDeadlineList();
  setupEventListeners();
  updateSchedule();
  setupPomodoro();
});

// --- State Persistence ---
function saveState() {
  localStorage.setItem("smart_campus_planner_state", JSON.stringify({
    hours: state.hours,
    slotDuration: state.slotDuration,
    preferredWindow: state.preferredWindow,
    subjects: state.subjects,
    deadlines: state.deadlines,
    completedSessions: state.completedSessions
  }));
}

function loadState() {
  const saved = localStorage.getItem("smart_campus_planner_state");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.hours = parsed.hours || PRESETS.cs.hours;
      state.slotDuration = parsed.slotDuration || 1.5;
      state.preferredWindow = parsed.preferredWindow || "balanced";
      state.subjects = parsed.subjects || PRESETS.cs.subjects;
      state.deadlines = parsed.deadlines || PRESETS.cs.deadlines;
      state.completedSessions = parsed.completedSessions || {};
      return;
    } catch (e) {
      console.warn("Could not parse saved state, using default preset", e);
    }
  }
  // Load Default Preset (Computer Science)
  loadPreset("cs");
}

function loadPreset(presetKey) {
  const p = PRESETS[presetKey] || PRESETS.cs;
  state.hours = JSON.parse(JSON.stringify(p.hours));
  state.slotDuration = p.slotDuration;
  state.preferredWindow = p.preferredWindow;
  state.subjects = JSON.parse(JSON.stringify(p.subjects));
  state.deadlines = JSON.parse(JSON.stringify(p.deadlines));
  state.completedSessions = {};

  // Update controls UI
  document.getElementById("slotDurationSelect").value = state.slotDuration;
  document.getElementById("preferredWindowSelect").value = state.preferredWindow;
  renderHoursControls();
  renderSubjectList();
  renderDeadlineList();
  saveState();
  updateSchedule();
}

// --- Dynamic Scheduling Algorithm ---
/**
 * Analyzes:
 * 1. Available hours per day
 * 2. Slot duration (1h, 1.5h, 2h)
 * 3. Deadlines urgency & estimated hours required
 * 4. Subject difficulty & minimum maintenance hours
 * 5. Generates optimized, anti-cramming schedule across Monday-Sunday
 */
function generateSchedule() {
  const scheduleByDay = { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
  const slotDuration = parseFloat(state.slotDuration) || 1.5;
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
  const dayOffsetMap = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };

  // 1. Calculate Required Task Workloads
  // Priority score for each deadline = (Urgency / DaysLeft) * SubjectDifficulty * Effort
  const taskPool = [];

  state.deadlines.forEach(deadline => {
    const subject = state.subjects.find(s => s.id === deadline.subjectId) || {
      name: "General Task",
      difficulty: 2,
      color: "#6366f1"
    };

    const dueDate = new Date(deadline.dueDate);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysLeft = Math.max(0.5, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    
    // High difficulty & near deadline gives high priority
    const urgency = 1 / daysLeft;
    const priority = (subject.difficulty * 1.5) + (urgency * 12);

    const neededHours = Math.max(1, deadline.estimatedHours - (deadline.completedHours || 0));
    const totalSlotsNeeded = Math.ceil(neededHours / slotDuration);

    taskPool.push({
      id: deadline.id,
      title: deadline.title,
      type: deadline.type,
      subjectId: subject.id,
      subjectName: subject.name,
      color: subject.color,
      priority: priority,
      dueDate: deadline.dueDate,
      daysLeft: daysLeft,
      slotsRemaining: totalSlotsNeeded,
      isDeadlineTask: true
    });
  });

  // 2. Add Baseline Maintenance Sessions for Subjects
  state.subjects.forEach(subject => {
    const assignedDeadlineSlots = taskPool
      .filter(t => t.subjectId === subject.id)
      .reduce((acc, t) => acc + t.slotsRemaining, 0);

    const minSlots = Math.ceil(subject.minHours / slotDuration);
    const maintenanceSlotsNeeded = Math.max(1, minSlots - Math.floor(assignedDeadlineSlots * 0.5));

    taskPool.push({
      id: `maint-${subject.id}`,
      title: `${subject.name} - Concept Review & Practice`,
      type: "Core Review",
      subjectId: subject.id,
      subjectName: subject.name,
      color: subject.color,
      priority: subject.difficulty * 1.8,
      daysLeft: 7,
      slotsRemaining: maintenanceSlotsNeeded,
      isDeadlineTask: false
    });
  });

  // Sort task pool by priority descending
  taskPool.sort((a, b) => b.priority - a.priority);

  // 3. Define daily slots available per day
  const dailyCapacity = {};
  DAYS_OF_WEEK.forEach(day => {
    const hours = state.hours[day.key] || 0;
    const numSlots = Math.floor(hours / slotDuration);
    dailyCapacity[day.key] = numSlots;
  });

  // 4. Time Window Generator (09:00, 10:45, 14:00, etc.)
  function getTimeSlotLabel(index, windowPref) {
    let startHour = 9;
    if (windowPref === "morning") startHour = 8;
    if (windowPref === "evening") startHour = 16;
    
    const minutesPerSlot = Math.round(slotDuration * 60);
    const bufferMinutes = 15; // 15m break between study blocks
    const totalStartMin = (startHour * 60) + (index * (minutesPerSlot + bufferMinutes));

    const sH = Math.floor(totalStartMin / 60) % 24;
    const sM = totalStartMin % 60;
    const endTotalMin = totalStartMin + minutesPerSlot;
    const eH = Math.floor(endTotalMin / 60) % 24;
    const eM = endTotalMin % 60;

    const pad = (n) => n.toString().padStart(2, "0");
    return `${pad(sH)}:${pad(sM)} - ${pad(eH)}:${pad(eM)}`;
  }

  // 5. Intelligent Allocation with Interleaving & Anti-Cramming
  // We distribute across days such that:
  // - High priority tasks placed on earlier days before deadlines
  // - Avoid repeating same subject more than twice in same day
  DAYS_OF_WEEK.forEach((day, dayIndex) => {
    const slotsAvailable = dailyCapacity[day.key];
    const scheduledToday = [];
    const subjectCountToday = {};

    for (let slot = 0; slot < slotsAvailable; slot++) {
      // Find candidate task with highest priority that hasn't exceeded 2 slots today
      let selectedTask = null;

      for (let t of taskPool) {
        if (t.slotsRemaining <= 0) continue;

        // Check deadline constraint: Don't schedule tasks AFTER deadline has passed!
        const targetDayOffset = dayOffsetMap[day.key];
        if (t.isDeadlineTask && targetDayOffset > t.daysLeft + 1) {
          // Deadline already passed relative to this day
          continue;
        }

        const countForSubject = subjectCountToday[t.subjectId] || 0;
        // Limit subject to 2 sessions per day max to encourage interleaving
        if (countForSubject < 2) {
          selectedTask = t;
          break;
        }
      }

      // If all candidate subjects reached daily limit but slots remain, allow any remaining task
      if (!selectedTask) {
        selectedTask = taskPool.find(t => t.slotsRemaining > 0);
      }

      if (selectedTask) {
        selectedTask.slotsRemaining--;
        subjectCountToday[selectedTask.subjectId] = (subjectCountToday[selectedTask.subjectId] || 0) + 1;

        const sessionObj = {
          id: `${day.key}-${slot}`,
          dayKey: day.key,
          slotIndex: slot,
          time: getTimeSlotLabel(slot, state.preferredWindow),
          durationHours: slotDuration,
          title: selectedTask.title,
          type: selectedTask.type,
          subjectName: selectedTask.subjectName,
          subjectColor: selectedTask.color,
          isDeadline: selectedTask.isDeadlineTask,
          completed: !!state.completedSessions[`${day.key}-${slot}`]
        };

        scheduledToday.push(sessionObj);
      } else {
        // Free Slot
        scheduledToday.push({
          id: `${day.key}-${slot}`,
          dayKey: day.key,
          slotIndex: slot,
          time: getTimeSlotLabel(slot, state.preferredWindow),
          durationHours: slotDuration,
          title: "Flex / Self-Study Buffer",
          type: "Free Slot",
          subjectName: "Open Focus",
          subjectColor: "#94a3b8",
          isDeadline: false,
          completed: !!state.completedSessions[`${day.key}-${slot}`]
        });
      }
    }

    scheduleByDay[day.key] = scheduledToday;
  });

  return scheduleByDay;
}

// --- Schedule Render & Update Workflow ---
function updateSchedule() {
  const schedule = generateSchedule();

  renderKPIs(schedule);
  renderWeeklyGrid(schedule);
  renderTodayAgenda(schedule);
  renderWorkloadCharts(schedule);
  renderRecommendations(schedule);
  
  if (window.lucide) {
    lucide.createIcons();
  }
}

// --- KPI Card Calculation ---
function renderKPIs(schedule) {
  // Available Hours
  const totalAvailable = Object.values(state.hours).reduce((a, b) => a + (parseFloat(b) || 0), 0);
  document.getElementById("kpiAvailableHours").textContent = totalAvailable.toFixed(1);

  // Required Hours = Sum of upcoming deadlines estimated hours + baseline subjects minimum
  const deadlinesHours = state.deadlines.reduce((a, b) => a + (parseFloat(b.estimatedHours) || 0), 0);
  const subjectsMinHours = state.subjects.reduce((a, b) => a + (parseFloat(b.minHours) || 0), 0);
  const totalRequired = Math.round(deadlinesHours + (subjectsMinHours * 0.7)); // Adjusted for overlap
  document.getElementById("kpiRequiredHours").textContent = totalRequired;
  document.getElementById("kpiSubjectCount").textContent = `${state.subjects.length} Subjects active`;

  // Deadline Count
  document.getElementById("kpiDeadlineCount").textContent = state.deadlines.length;
  if (state.deadlines.length > 0) {
    const sorted = [...state.deadlines].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    const next = sorted[0];
    const days = Math.ceil((new Date(next.dueDate) - new Date()) / (1000 * 3600 * 24));
    document.getElementById("kpiNextDeadline").textContent = `Next: ${next.title} (${days <= 0 ? 'Due Today' : `in ${days}d`})`;
  } else {
    document.getElementById("kpiNextDeadline").textContent = "No urgent deadlines!";
  }

  // Workload Feasibility Status
  const ratio = totalAvailable / Math.max(1, totalRequired);
  const statusText = document.getElementById("kpiFeasibilityText");
  const progressBar = document.getElementById("feasibilityProgressBar");
  const iconWrap = document.getElementById("feasibilityIconWrap");

  if (ratio >= 1.05) {
    statusText.textContent = "Optimal";
    statusText.className = "text-2xl font-extrabold text-emerald-600 dark:text-emerald-400";
    progressBar.className = "bg-emerald-500 h-full rounded-full transition-all duration-500";
    progressBar.style.width = "90%";
    iconWrap.className = "p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400";
  } else if (ratio >= 0.8) {
    statusText.textContent = "Manageable";
    statusText.className = "text-2xl font-extrabold text-amber-600 dark:text-amber-400";
    progressBar.className = "bg-amber-500 h-full rounded-full transition-all duration-500";
    progressBar.style.width = "65%";
    iconWrap.className = "p-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400";
  } else {
    statusText.textContent = "High Stress";
    statusText.className = "text-2xl font-extrabold text-rose-600 dark:text-rose-400";
    progressBar.className = "bg-rose-500 h-full rounded-full transition-all duration-500";
    progressBar.style.width = "35%";
    iconWrap.className = "p-2 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400";
  }
}

// --- Render Weekly Grid View ---
function renderWeeklyGrid(schedule) {
  const container = document.getElementById("timetableGrid");
  container.innerHTML = "";

  const todayIndex = (new Date().getDay() + 6) % 7; // Convert Sun(0)..Sat(6) to Mon(0)..Sun(6)

  DAYS_OF_WEEK.forEach((day, index) => {
    const isToday = index === todayIndex;

    // Check visibility based on mobile day filter
    let isVisibleOnMobile = true;
    if (currentMobileDayFilter === 'today') {
      isVisibleOnMobile = isToday;
    } else if (currentMobileDayFilter !== 'all') {
      isVisibleOnMobile = (day.key === currentMobileDayFilter);
    }

    const isSingleDayView = (currentMobileDayFilter !== 'all');
    const widthClasses = isSingleDayView 
      ? "w-full" 
      : "w-[275px] sm:w-[285px] lg:w-auto shrink-0 lg:shrink";

    const col = document.createElement("div");
    col.className = `day-column ${widthClasses} ${isVisibleOnMobile ? 'flex' : 'hidden lg:flex'} rounded-2xl border p-3 flex-col space-y-2.5 transition snap-start ${
      isToday 
        ? "border-indigo-400 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20" 
        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
    }`;

    const sessions = schedule[day.key] || [];
    const dailyHours = state.hours[day.key] || 0;

    col.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800 pb-2">
        <div>
          <div class="flex items-center space-x-1.5">
            <span class="font-bold text-xs ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}">${day.name}</span>
            ${isToday ? '<span class="text-[9px] px-1.5 py-0.2 rounded bg-indigo-600 text-white font-semibold">Today</span>' : ''}
          </div>
          <span class="text-[10px] text-slate-400 font-medium">${dailyHours} hrs cap</span>
        </div>
        <span class="text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
          ${sessions.length} slots
        </span>
      </div>

      <div class="flex-1 space-y-2 overflow-y-auto max-h-[580px] pr-0.5" id="day-slots-${day.key}">
        ${sessions.length === 0 ? `
          <div class="h-32 flex flex-col items-center justify-center text-center p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <i data-lucide="coffee" class="w-5 h-5 text-slate-300 dark:text-slate-600 mb-1"></i>
            <span class="text-[11px] font-medium text-slate-400">Rest / Break Day</span>
          </div>
        ` : ''}
      </div>
    `;

    const slotsContainer = col.querySelector(`#day-slots-${day.key}`);

    sessions.forEach(session => {
      const isCompleted = !!session.completed;
      const card = document.createElement("div");
      card.className = `session-block p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-xs shadow-sm hover:shadow-md cursor-pointer transition ${
        isCompleted ? "completed" : ""
      }`;
      card.style.borderLeftColor = session.subjectColor;

      card.innerHTML = `
        <div class="flex items-start justify-between gap-1 mb-1">
          <span class="text-[10px] font-bold tracking-tight text-slate-400 font-mono flex items-center gap-1">
            <i data-lucide="clock-3" class="w-3 h-3 text-slate-400"></i>
            ${session.time}
          </span>
          <input type="checkbox" ${isCompleted ? "checked" : ""} class="session-checkbox w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer" data-session-id="${session.id}">
        </div>

        <div class="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 mb-0.5">
          ${session.title}
        </div>

        <div class="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/50 mt-1">
          <span class="truncate font-medium" style="color: ${session.subjectColor}">
            ${session.subjectName}
          </span>
          <span class="px-1.5 py-0.5 rounded text-[9px] font-semibold ${
            session.type === 'Exam' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
            session.type === 'Assignment' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
            'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
          }">
            ${session.type}
          </span>
        </div>
      `;

      // Event: clicking checkbox marks completed
      const checkbox = card.querySelector(".session-checkbox");
      checkbox.addEventListener("change", (e) => {
        e.stopPropagation();
        toggleSessionComplete(session.id);
      });

      // Event: clicking session loads into Pomodoro
      card.addEventListener("click", () => {
        loadSessionIntoPomodoro(session);
      });

      slotsContainer.appendChild(card);
    });

    container.appendChild(col);
  });
}

// --- Toggle Session Complete with Confetti ---
function toggleSessionComplete(sessionId) {
  if (state.completedSessions[sessionId]) {
    delete state.completedSessions[sessionId];
  } else {
    state.completedSessions[sessionId] = true;
    // Trigger celebratory confetti
    if (window.confetti) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }
  saveState();
  updateSchedule();
}

// --- Render Today's Action Plan Agenda ---
function renderTodayAgenda(schedule) {
  const container = document.getElementById("todayTasksList");
  container.innerHTML = "";

  const todayIndex = (new Date().getDay() + 6) % 7;
  const todayKey = DAYS_OF_WEEK[todayIndex].key;
  const sessions = schedule[todayKey] || [];

  const completedCount = sessions.filter(s => !!s.completed).length;
  document.getElementById("todayProgressBadge").textContent = `${completedCount} / ${sessions.length} Completed`;
  document.getElementById("todayAgendaTitle").innerHTML = `
    <i data-lucide="check-square" class="w-4 h-4 text-emerald-500"></i>
    Today's Action Plan (${DAYS_OF_WEEK[todayIndex].name})
  `;

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="text-center py-10 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
        <i data-lucide="smile" class="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2"></i>
        <h4 class="font-bold text-sm text-slate-700 dark:text-slate-300">No scheduled study sessions for today!</h4>
        <p class="text-xs text-slate-400 mt-1">Enjoy your rest day or increase today's available hours in the left panel.</p>
      </div>
    `;
    return;
  }

  sessions.forEach(session => {
    const isCompleted = !!session.completed;
    const item = document.createElement("div");
    item.className = `p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-4 transition hover:border-indigo-300 ${
      isCompleted ? "opacity-60 bg-slate-50 dark:bg-slate-850 line-through" : ""
    }`;

    item.innerHTML = `
      <div class="flex items-center space-x-3.5">
        <input type="checkbox" ${isCompleted ? "checked" : ""} class="today-checkbox w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500 accent-indigo-600 cursor-pointer">
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-mono font-bold text-slate-400">${session.time}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold text-white" style="background-color: ${session.subjectColor}">
              ${session.subjectName}
            </span>
          </div>
          <h4 class="font-bold text-sm text-slate-900 dark:text-white mt-0.5">${session.title}</h4>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button class="focus-pomo-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center space-x-1 transition">
          <i data-lucide="play" class="w-3.5 h-3.5"></i>
          <span>Focus</span>
        </button>
      </div>
    `;

    item.querySelector(".today-checkbox").addEventListener("change", () => {
      toggleSessionComplete(session.id);
    });

    item.querySelector(".focus-pomo-btn").addEventListener("click", () => {
      loadSessionIntoPomodoro(session);
      startPomodoro();
    });

    container.appendChild(item);
  });
}

// --- Render Workload Analytics (Charts) ---
function renderWorkloadCharts(schedule) {
  // 1. Subject Hours Aggregation
  const subjectHours = {};
  state.subjects.forEach(s => subjectHours[s.name] = { hours: 0, color: s.color });

  // Sum hours from generated schedule
  Object.values(schedule).forEach(daySessions => {
    daySessions.forEach(session => {
      if (subjectHours[session.subjectName]) {
        subjectHours[session.subjectName].hours += session.durationHours;
      }
    });
  });

  const subjectLabels = Object.keys(subjectHours);
  const subjectData = subjectLabels.map(l => subjectHours[l].hours);
  const subjectColors = subjectLabels.map(l => subjectHours[l].color);

  const subjectCtx = document.getElementById("subjectChart").getContext("2d");
  if (subjectChartInstance) subjectChartInstance.destroy();

  subjectChartInstance = new Chart(subjectCtx, {
    type: "doughnut",
    data: {
      labels: subjectLabels,
      datasets: [{
        data: subjectData,
        backgroundColor: subjectColors,
        borderWidth: 2,
        borderColor: document.documentElement.classList.contains("dark") ? "#1e293b" : "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 10,
            font: { size: 10 }
          }
        }
      },
      cutout: "68%"
    }
  });

  // 2. Daily Hours vs Capacity Bar Chart
  const dailyLabels = DAYS_OF_WEEK.map(d => d.short);
  const dailyCapacities = DAYS_OF_WEEK.map(d => state.hours[d.key] || 0);
  const dailyScheduled = DAYS_OF_WEEK.map(d => {
    const sessions = schedule[d.key] || [];
    return sessions.length * state.slotDuration;
  });

  const dailyCtx = document.getElementById("dailyChart").getContext("2d");
  if (dailyChartInstance) dailyChartInstance.destroy();

  dailyChartInstance = new Chart(dailyCtx, {
    type: "bar",
    data: {
      labels: dailyLabels,
      datasets: [
        {
          label: "Scheduled Hours",
          data: dailyScheduled,
          backgroundColor: "#6366f1",
          borderRadius: 6
        },
        {
          label: "Available Capacity",
          data: dailyCapacities,
          backgroundColor: "#cbd5e1",
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 10, font: { size: 10 } }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 2 }
        }
      }
    }
  });
}

// --- Render Smart Planner Recommendations ---
function renderRecommendations(schedule) {
  const list = document.getElementById("recommendationsList");
  list.innerHTML = "";

  const totalAvailable = Object.values(state.hours).reduce((a, b) => a + (parseFloat(b) || 0), 0);
  const deadlinesHours = state.deadlines.reduce((a, b) => a + (parseFloat(b.estimatedHours) || 0), 0);
  const recommendations = [];

  // Insight 1: Workload balance
  if (deadlinesHours > totalAvailable * 0.9) {
    recommendations.push("⚠️ High workload detected: Your upcoming deadline effort demands almost 90% of your total study time. Consider temporarily increasing Friday or weekend study hours by 1-2 hours.");
  } else {
    recommendations.push("✅ Balanced workload: You have ample flex buffers this week. Spaced repetition algorithm will prevent cramming fatigue.");
  }

  // Insight 2: High urgency deadline
  const urgentDeadline = state.deadlines
    .map(d => ({ ...d, days: Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 3600 * 24)) }))
    .filter(d => d.days >= 0 && d.days <= 3)
    .sort((a, b) => a.days - b.days)[0];

  if (urgentDeadline) {
    recommendations.push(`🎯 Priority focus: "${urgentDeadline.title}" is due in ${urgentDeadline.days} days. Study blocks for this course are front-loaded into Monday and Tuesday.`);
  }

  // Insight 3: Cognitive Interleaving
  recommendations.push("🧠 Cognitive Science rule applied: Consecutive study sessions interleave distinct subjects rather than block-cramming, maximizing long-term memory consolidation.");

  recommendations.forEach(rec => {
    const li = document.createElement("li");
    li.textContent = rec;
    list.appendChild(li);
  });
}

// --- Left Panel Inputs: Available Hours Controls ---
function renderHoursControls() {
  const container = document.getElementById("dailyHoursContainer");
  container.innerHTML = "";

  DAYS_OF_WEEK.forEach(day => {
    const currentVal = state.hours[day.key] || 0;
    const row = document.createElement("div");
    row.className = "flex items-center justify-between text-xs space-x-3";

    row.innerHTML = `
      <span class="w-20 font-semibold text-slate-700 dark:text-slate-300">${day.name}</span>
      <input type="range" min="0" max="10" step="0.5" value="${currentVal}" class="day-hour-slider flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer" data-day="${day.key}">
      <span class="w-12 text-right font-mono font-bold text-slate-900 dark:text-white">${currentVal} hrs</span>
    `;

    const slider = row.querySelector(".day-hour-slider");
    slider.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      state.hours[day.key] = val;
      row.querySelector("span:last-child").textContent = `${val} hrs`;
      saveState();
      updateSchedule();
    });

    container.appendChild(row);
  });
}

// --- Left Panel Inputs: Subject Management ---
function renderSubjectList() {
  const container = document.getElementById("subjectList");
  container.innerHTML = "";

  if (state.subjects.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No subjects added yet. Click "+ Add" to add your courses.</p>`;
    return;
  }

  state.subjects.forEach(subject => {
    const div = document.createElement("div");
    div.className = "p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-2";

    div.innerHTML = `
      <div class="flex items-center space-x-2.5">
        <div class="w-3.5 h-3.5 rounded-full shrink-0" style="background-color: ${subject.color}"></div>
        <div>
          <h4 class="font-bold text-xs text-slate-900 dark:text-white">${subject.name}</h4>
          <span class="text-[10px] text-slate-400">Diff: ${subject.difficulty}/4 • Min ${subject.minHours}h/wk</span>
        </div>
      </div>
      <div class="flex items-center space-x-1">
        <button class="edit-subject-btn p-1 text-slate-400 hover:text-indigo-600 rounded">
          <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
        </button>
        <button class="del-subject-btn p-1 text-slate-400 hover:text-rose-600 rounded">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;

    div.querySelector(".edit-subject-btn").addEventListener("click", () => editSubject(subject));
    div.querySelector(".del-subject-btn").addEventListener("click", () => deleteSubject(subject.id));

    container.appendChild(div);
  });

  // Also update Deadline Subject Select Dropdown
  const select = document.getElementById("deadlineSubjectSelect");
  select.innerHTML = "";
  state.subjects.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    select.appendChild(opt);
  });
}

// --- Left Panel Inputs: Deadlines Management ---
function renderDeadlineList() {
  const container = document.getElementById("deadlineList");
  container.innerHTML = "";

  if (state.deadlines.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No upcoming deadlines tracked. Click "+ Add" to add exams or assignments.</p>`;
    return;
  }

  state.deadlines.forEach(deadline => {
    const subject = state.subjects.find(s => s.id === deadline.subjectId) || { name: "General", color: "#6366f1" };
    const div = document.createElement("div");
    div.className = "p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-2";

    const daysLeft = Math.ceil((new Date(deadline.dueDate) - new Date()) / (1000 * 3600 * 24));
    const urgencyBadge = daysLeft <= 2 
      ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 font-bold">Urgent</span>' 
      : `<span class="text-[9px] text-slate-400">${daysLeft}d left</span>`;

    div.innerHTML = `
      <div class="flex-1">
        <div class="flex items-center space-x-1.5">
          <span class="w-2 h-2 rounded-full" style="background-color: ${subject.color}"></span>
          <span class="text-[10px] font-bold text-slate-500">${subject.name}</span>
          ${urgencyBadge}
        </div>
        <h4 class="font-bold text-xs text-slate-900 dark:text-white mt-0.5">${deadline.title}</h4>
        <div class="text-[10px] text-slate-400 mt-0.5">Due: ${deadline.dueDate} • Est: ${deadline.estimatedHours}h needed</div>
      </div>
      <div class="flex items-center space-x-1">
        <button class="del-deadline-btn p-1 text-slate-400 hover:text-rose-600 rounded">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    `;

    div.querySelector(".del-deadline-btn").addEventListener("click", () => deleteDeadline(deadline.id));
    container.appendChild(div);
  });
}

// --- Subject CRUD Actions ---
function openSubjectModal(subjectToEdit = null) {
  const modal = document.getElementById("subjectModal");
  const title = document.getElementById("subjectModalTitle");
  const idInput = document.getElementById("editSubjectId");
  const nameInput = document.getElementById("subjectNameInput");
  const diffInput = document.getElementById("subjectDifficultyInput");
  const hoursInput = document.getElementById("subjectMinHoursInput");
  const colorInput = document.getElementById("subjectColorInput");

  if (subjectToEdit) {
    title.textContent = "Edit Subject";
    idInput.value = subjectToEdit.id;
    nameInput.value = subjectToEdit.name;
    diffInput.value = subjectToEdit.difficulty;
    hoursInput.value = subjectToEdit.minHours;
    colorInput.value = subjectToEdit.color;
    selectColorSwatch(subjectToEdit.color);
  } else {
    title.textContent = "Add New Subject";
    idInput.value = "";
    nameInput.value = "";
    diffInput.value = "2";
    hoursInput.value = "4";
    const randColor = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    colorInput.value = randColor;
    selectColorSwatch(randColor);
  }

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeSubjectModal() {
  const modal = document.getElementById("subjectModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function editSubject(subject) {
  openSubjectModal(subject);
}

function deleteSubject(subjectId) {
  state.subjects = state.subjects.filter(s => s.id !== subjectId);
  // Also remove deadlines tied to this subject
  state.deadlines = state.deadlines.filter(d => d.subjectId !== subjectId);
  saveState();
  renderSubjectList();
  renderDeadlineList();
  updateSchedule();
}

// --- Deadline CRUD Actions ---
function openDeadlineModal() {
  if (state.subjects.length === 0) {
    alert("Please add at least one subject first before creating a deadline.");
    return;
  }
  const modal = document.getElementById("deadlineModal");
  document.getElementById("deadlineTitleInput").value = "";
  document.getElementById("deadlineDateInput").value = getRelativeDate(4);
  document.getElementById("deadlineHoursInput").value = "6";

  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeDeadlineModal() {
  const modal = document.getElementById("deadlineModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function deleteDeadline(deadlineId) {
  state.deadlines = state.deadlines.filter(d => d.id !== deadlineId);
  saveState();
  renderDeadlineList();
  updateSchedule();
}

// --- Color Picker Helper ---
function initColorPicker() {
  const wrap = document.getElementById("colorPickerWrap");
  wrap.innerHTML = "";
  COLOR_PALETTE.forEach(color => {
    const swatch = document.createElement("div");
    swatch.className = "color-swatch";
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.addEventListener("click", () => {
      selectColorSwatch(color);
      document.getElementById("subjectColorInput").value = color;
    });
    wrap.appendChild(swatch);
  });
}

function selectColorSwatch(color) {
  document.querySelectorAll(".color-swatch").forEach(s => {
    if (s.dataset.color === color) {
      s.classList.add("ring-2", "ring-indigo-600", "ring-offset-2");
    } else {
      s.classList.remove("ring-2", "ring-indigo-600", "ring-offset-2");
    }
  });
}

// --- Pomodoro Focus Companion Logic ---
function setupPomodoro() {
  const timeDisplay = document.getElementById("pomoTimeDisplay");
  const startBtn = document.getElementById("pomoStartBtn");
  const resetBtn = document.getElementById("pomoResetBtn");
  const completeBtn = document.getElementById("pomoCompleteBtn");

  startBtn.addEventListener("click", () => {
    if (state.activePomodoro.isRunning) {
      pausePomodoro();
    } else {
      startPomodoro();
    }
  });

  resetBtn.addEventListener("click", () => {
    resetPomodoro();
  });

  completeBtn.addEventListener("click", () => {
    if (state.activePomodoro.sessionId) {
      toggleSessionComplete(state.activePomodoro.sessionId);
    }
  });
}

function loadSessionIntoPomodoro(session) {
  state.activePomodoro.currentTaskTitle = `${session.subjectName}: ${session.title}`;
  state.activePomodoro.sessionId = session.id;
  document.getElementById("pomoTaskLabel").textContent = state.activePomodoro.currentTaskTitle;
}

function startPomodoro() {
  state.activePomodoro.isRunning = true;
  document.getElementById("pomoStartText").textContent = "Pause Session";
  const chime = document.getElementById("chimeAudio");

  if (state.activePomodoro.interval) clearInterval(state.activePomodoro.interval);

  state.activePomodoro.interval = setInterval(() => {
    if (state.activePomodoro.timeLeft > 0) {
      state.activePomodoro.timeLeft--;
      renderPomodoroDisplay();
    } else {
      clearInterval(state.activePomodoro.interval);
      state.activePomodoro.isRunning = false;
      document.getElementById("pomoStartText").textContent = "Start Session";
      try { chime.play(); } catch(e){}
      alert("Focus block completed! Great work. Time for a well-deserved break.");
    }
  }, 1000);
}

function pausePomodoro() {
  state.activePomodoro.isRunning = false;
  clearInterval(state.activePomodoro.interval);
  document.getElementById("pomoStartText").textContent = "Resume Session";
}

function resetPomodoro() {
  state.activePomodoro.isRunning = false;
  clearInterval(state.activePomodoro.interval);
  state.activePomodoro.timeLeft = 25 * 60;
  document.getElementById("pomoStartText").textContent = "Start Session";
  renderPomodoroDisplay();
}

function renderPomodoroDisplay() {
  const m = Math.floor(state.activePomodoro.timeLeft / 60);
  const s = state.activePomodoro.timeLeft % 60;
  const pad = (n) => n.toString().padStart(2, "0");
  document.getElementById("pomoTimeDisplay").textContent = `${pad(m)}:${pad(s)}`;
}

// --- Export to iCalendar (.ICS) ---
function exportToIcs() {
  const schedule = generateSchedule();
  let icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Smart Campus//Smart Study Planner//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  const now = new Date();
  // Find current Monday
  const dayIndex = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayIndex);

  DAYS_OF_WEEK.forEach((d, dIdx) => {
    const sessions = schedule[d.key] || [];
    const sessionDate = new Date(monday);
    sessionDate.setDate(monday.getDate() + dIdx);

    sessions.forEach(sess => {
      const times = sess.time.split(" - ");
      if (times.length < 2) return;
      const [startH, startM] = times[0].split(":").map(Number);
      const [endH, endM] = times[1].split(":").map(Number);

      const dtStart = new Date(sessionDate);
      dtStart.setHours(startH, startM, 0, 0);

      const dtEnd = new Date(sessionDate);
      dtEnd.setHours(endH, endM, 0, 0);

      const formatICSDate = (date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      icsLines.push("BEGIN:VEVENT");
      icsLines.push(`SUMMARY:${sess.subjectName} - ${sess.title}`);
      icsLines.push(`DESCRIPTION:Study session (${sess.type}) generated by Smart Campus Planner`);
      icsLines.push(`DTSTART:${formatICSDate(dtStart)}`);
      icsLines.push(`DTEND:${formatICSDate(dtEnd)}`);
      icsLines.push(`UID:study-${Date.now()}-${Math.random().toString(36).substring(2)}@smartcampus`);
      icsLines.push("STATUS:CONFIRMED");
      icsLines.push("END:VEVENT");
    });
  });

  icsLines.push("END:VCALENDAR");

  const icsContent = icsLines.join("\r\n");
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Smart_Study_Plan_${getRelativeDate(0)}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Setup All Event Listeners ---
function setupEventListeners() {
  // Theme toggle
  document.getElementById("themeToggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
  });

  // Export .ICS
  document.getElementById("exportIcsBtn").addEventListener("click", exportToIcs);

  // Print button
  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });

  // Presets modal
  const presetsModal = document.getElementById("presetsModal");
  document.getElementById("sampleDataBtn").addEventListener("click", () => {
    presetsModal.classList.remove("hidden");
    presetsModal.classList.add("flex");
  });

  document.getElementById("closePresetsModalBtn").addEventListener("click", () => {
    presetsModal.classList.add("hidden");
    presetsModal.classList.remove("flex");
  });

  document.getElementById("cancelPresetsBtn").addEventListener("click", () => {
    presetsModal.classList.add("hidden");
    presetsModal.classList.remove("flex");
  });

  document.querySelectorAll(".preset-choice-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pKey = btn.dataset.preset;
      loadPreset(pKey);
      presetsModal.classList.add("hidden");
      presetsModal.classList.remove("flex");
    });
  });

  // Input Tabs: Available Hours / Subjects / Deadlines
  document.querySelectorAll(".input-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetPanel = btn.dataset.tab;
      document.querySelectorAll(".input-tab-btn").forEach(b => {
        b.classList.remove("bg-indigo-600", "text-white", "shadow");
        b.classList.add("text-slate-600", "dark:text-slate-400");
      });
      btn.classList.add("bg-indigo-600", "text-white", "shadow");
      btn.classList.remove("text-slate-600", "dark:text-slate-400");

      document.querySelectorAll(".input-panel").forEach(p => p.classList.add("hidden"));
      document.getElementById(targetPanel).classList.remove("hidden");
    });
  });

  // Slot duration select
  document.getElementById("slotDurationSelect").addEventListener("change", (e) => {
    state.slotDuration = parseFloat(e.target.value);
    saveState();
    updateSchedule();
  });

  // Preferred window select
  document.getElementById("preferredWindowSelect").addEventListener("change", (e) => {
    state.preferredWindow = e.target.value;
    saveState();
    updateSchedule();
  });

  // Reset hours button
  document.getElementById("resetHoursBtn").addEventListener("click", () => {
    state.hours = { mon: 4, tue: 3, wed: 4, thu: 3, fri: 2, sat: 5, sun: 4 };
    renderHoursControls();
    saveState();
    updateSchedule();
  });

  // Subject Modal Triggers
  document.getElementById("openAddSubjectBtn").addEventListener("click", () => openSubjectModal());
  document.getElementById("closeSubjectModalBtn").addEventListener("click", closeSubjectModal);
  document.getElementById("cancelSubjectBtn").addEventListener("click", closeSubjectModal);

  document.getElementById("subjectForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("editSubjectId").value;
    const name = document.getElementById("subjectNameInput").value.trim();
    const difficulty = parseInt(document.getElementById("subjectDifficultyInput").value);
    const minHours = parseFloat(document.getElementById("subjectMinHoursInput").value);
    const color = document.getElementById("subjectColorInput").value;

    if (id) {
      // Edit existing
      const s = state.subjects.find(sub => sub.id === id);
      if (s) {
        s.name = name;
        s.difficulty = difficulty;
        s.minHours = minHours;
        s.color = color;
      }
    } else {
      // Create new
      state.subjects.push({
        id: "sub-" + Date.now(),
        name,
        difficulty,
        minHours,
        color
      });
    }

    closeSubjectModal();
    saveState();
    renderSubjectList();
    updateSchedule();
  });

  // Deadline Modal Triggers
  document.getElementById("openAddDeadlineBtn").addEventListener("click", openDeadlineModal);
  document.getElementById("closeDeadlineModalBtn").addEventListener("click", closeDeadlineModal);
  document.getElementById("cancelDeadlineBtn").addEventListener("click", closeDeadlineModal);

  document.getElementById("deadlineForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("deadlineTitleInput").value.trim();
    const subjectId = document.getElementById("deadlineSubjectSelect").value;
    const type = document.getElementById("deadlineTypeSelect").value;
    const dueDate = document.getElementById("deadlineDateInput").value;
    const estimatedHours = parseFloat(document.getElementById("deadlineHoursInput").value);

    state.deadlines.push({
      id: "dl-" + Date.now(),
      title,
      subjectId,
      type,
      dueDate,
      estimatedHours,
      completedHours: 0
    });

    closeDeadlineModal();
    saveState();
    renderDeadlineList();
    updateSchedule();
  });

  // Schedule View Toggles (Timetable vs Agenda vs Analytics)
  const viewGridBtn = document.getElementById("viewGridBtn");
  const viewAgendaBtn = document.getElementById("viewAgendaBtn");
  const viewAnalyticsBtn = document.getElementById("viewAnalyticsBtn");

  const weeklyGridView = document.getElementById("weeklyGridView");
  const todayAgendaView = document.getElementById("todayAgendaView");
  const workloadAnalyticsView = document.getElementById("workloadAnalyticsView");

  function switchScheduleView(activeBtn, activeView) {
    [viewGridBtn, viewAgendaBtn, viewAnalyticsBtn].forEach(b => {
      b.classList.remove("bg-indigo-600", "text-white", "shadow-sm");
      b.classList.add("text-slate-600", "dark:text-slate-400");
    });
    activeBtn.classList.add("bg-indigo-600", "text-white", "shadow-sm");
    activeBtn.classList.remove("text-slate-600", "dark:text-slate-400");

    [weeklyGridView, todayAgendaView, workloadAnalyticsView].forEach(v => v.classList.add("hidden"));
    activeView.classList.remove("hidden");
  }

  viewGridBtn.addEventListener("click", () => switchScheduleView(viewGridBtn, weeklyGridView));
  viewAgendaBtn.addEventListener("click", () => switchScheduleView(viewAgendaBtn, todayAgendaView));
  viewAnalyticsBtn.addEventListener("click", () => switchScheduleView(viewAnalyticsBtn, workloadAnalyticsView));

  // Rebalance button
  document.getElementById("rebalanceBtn").addEventListener("click", () => {
    updateSchedule();
  });

  // Mobile Top Navigation Switcher (< lg screens)
  const mobileTabScheduleBtn = document.getElementById("mobileTabScheduleBtn");
  const mobileTabInputsBtn = document.getElementById("mobileTabInputsBtn");
  const leftInputsAside = document.getElementById("leftInputsAside");
  const rightScheduleSection = document.getElementById("rightScheduleSection");

  if (mobileTabScheduleBtn && mobileTabInputsBtn) {
    mobileTabScheduleBtn.addEventListener("click", () => {
      mobileTabScheduleBtn.classList.add("bg-indigo-600", "text-white", "shadow");
      mobileTabScheduleBtn.classList.remove("text-slate-600", "dark:text-slate-400");
      mobileTabInputsBtn.classList.remove("bg-indigo-600", "text-white", "shadow");
      mobileTabInputsBtn.classList.add("text-slate-600", "dark:text-slate-400");

      leftInputsAside.classList.add("hidden");
      leftInputsAside.classList.remove("block");
      rightScheduleSection.classList.remove("hidden");
      rightScheduleSection.classList.add("block");
    });

    mobileTabInputsBtn.addEventListener("click", () => {
      mobileTabInputsBtn.classList.add("bg-indigo-600", "text-white", "shadow");
      mobileTabInputsBtn.classList.remove("text-slate-600", "dark:text-slate-400");
      mobileTabScheduleBtn.classList.remove("bg-indigo-600", "text-white", "shadow");
      mobileTabScheduleBtn.classList.add("text-slate-600", "dark:text-slate-400");

      leftInputsAside.classList.remove("hidden");
      leftInputsAside.classList.add("block");
      rightScheduleSection.classList.add("hidden");
      rightScheduleSection.classList.remove("block");
    });
  }

  // Mobile Day Filter Buttons (< lg screens)
  document.querySelectorAll(".mobile-day-filter").forEach(btn => {
    btn.addEventListener("click", () => {
      currentMobileDayFilter = btn.dataset.day;

      document.querySelectorAll(".mobile-day-filter").forEach(b => {
        b.classList.remove("bg-indigo-600", "text-white", "shadow-sm");
        b.classList.add("text-slate-600", "dark:text-slate-400");
      });
      btn.classList.add("bg-indigo-600", "text-white", "shadow-sm");
      btn.classList.remove("text-slate-600", "dark:text-slate-400");

      renderWeeklyGrid(generateSchedule());
      if (window.lucide) lucide.createIcons();
    });
  });

  // Handle window resizing to reset mobile hidden/block classes if crossing breakpoint
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      if (leftInputsAside) leftInputsAside.classList.remove("hidden");
      if (rightScheduleSection) rightScheduleSection.classList.remove("hidden");
    }
  });
}
