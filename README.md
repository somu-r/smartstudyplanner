# 🎓 Smart Campus: Smart Timetable & Study Planner 

> **Theme 1: Smart Campus and Student Life**  
> **Problem:** Students struggle to balance classes, assignments, and exam preparation.  
> **Task:** Build an app that takes subjects, deadlines, and available hours and generates a personalized weekly study plan.  
> **Expected Output:** A clear schedule that updates when inputs change.

---

## 🌟 Solution Overview

The **Smart Timetable & Study Planner** is a high-performance, responsive web application engineered to eliminate academic burnout and procrastination. Built with modern web standards, it dynamically transforms academic obligations into an actionable, balanced weekly study schedule that adapts in real-time as student constraints shift.

---

## 🚀 Key Features

### 1. ⚙️ Real-Time Dynamic Scheduling Engine
- **Proactive Input Reactivity:** Every slider movement (adjusting Monday–Sunday study capacity) or deadline addition immediately recalculates and refreshes the timetable without full-page reloads.
- **Cognitive Science Interleaving:** Prevents cognitive fatigue by automatically distributing study blocks across subjects rather than cramming one subject all day.
- **Urgency & Difficulty Prioritization:**
  $$\text{Priority} = (\text{Subject Difficulty} \times 1.5) + \left(\frac{1}{\text{Days Remaining}} \times 12\right)$$
  High-stakes exams (e.g., Midterms) are automatically front-loaded before their due dates.

### 2. 📅 Interactive Weekly Timetable Grid
- 7-day visual calendar grid (Monday to Sunday) showing allocated study slots, course tags, color codes, and time ranges (e.g., `09:00 - 10:30`).
- Mark sessions as completed with one click (accompanied by celebratory confetti particles 🎉).
- Highlighted indicator for "Today".

### 3. ✅ Today's Action Plan & Pomodoro Focus Companion
- Focused daily agenda showing today's specific high-priority study sessions.
- Built-in **25-minute Pomodoro focus timer** with audio chime and one-click task loading.

### 4. 📊 Workload & Stress Feasibility Analytics
- **Hours per Subject Donut Chart:** Visual breakdown of study allocation across enrolled courses.
- **Daily Capacity vs Scheduled Bar Chart:** Immediate visual check of daily student workload limits.
- **Feasibility Gauge:** Real-time indicator displaying whether student workload is **Optimal**, **Manageable**, or **High Stress** with automated balancing advice.

### 5. 📦 Presets & Export Capabilities
- **One-Click Presets:** Instant loading of realistic student profiles:
  - Computer Science Major (Lab & Code intensive)
  - Pre-Med / Biology Student (Heavy memorization & practicals)
  - Finals / Midterms Crunch Week
- **Export to iCalendar (.ICS):** Syncs directly with Google Calendar, Apple Calendar, and Microsoft Outlook.
- **Printer-Friendly Timetable:** Dedicated CSS print layout that strips controls and prints a clean study schedule on paper.

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (ES6+), HTML5, Tailwind CSS, Lucide Icons
- **Data Visualization:** Chart.js
- **Delight & Gamification:** Canvas-Confetti
- **Backend:** Node.js Zero-Dependency HTTP Server (runs out of the box)
- **Storage:** Client-side LocalStorage for offline persistence

---

## 🏃 Getting Started

### Option 1: Quick Launch via Node.js
```bash
# Navigate to the project directory
cd smart-study-planner

# Start the local server
npm start
# or: node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in any modern browser (Chrome, Edge, Firefox, Safari).

### Option 2: Direct Browser Launch (No server needed)
Double-click `index.html` directly in your file explorer to launch the application.
