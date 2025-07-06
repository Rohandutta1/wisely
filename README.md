# 📚 Wisely - AI-Powered Educational Platform

Welcome to **Wisely**, a quirky and comprehensive educational platform designed to help users test their English proficiency, find the best Indian colleges, and book personalized sessions with expert teachers.

---

## 🚀 Overview

Wisely offers:
- 🎯 **English proficiency tests** (Beginner, Intermediate, Advanced)
- 🏫 **Indian college search** with admission details
- 👩‍🏫 **Teacher booking system** for paid classes
- 🔐 **User authentication** and test history tracking
- 🎨 **Modern, quirky UI design**

---

## 🏗️ Project Architecture

| Layer       | Technology                                      |
|-------------|--------------------------------------------------|
| Frontend    | React + Vite, Tailwind CSS, `shadcn/ui`, TypeScript |
| Backend     | Node.js, TypeScript, PostgreSQL                 |
| Routing     | Wouter (lightweight SPA routing)                |
| State Mgmt  | TanStack Query (React Query)                    |
| Auth        | Firebase Authentication                         |
| AI Engine   | Gemini API (Google AI) for question generation  |

---

## ✨ Features

### 1. 📘 English Tests
- Beginner, Intermediate, and Advanced levels
- Time durations: 10 min, 30 min, 40 min, 1 hour
- AI-generated MCQs
- Result breakdown (correct vs incorrect)
- Timer, question navigation

### 2. 🏫 College Search
- Database of Indian colleges
- Admission criteria, eligibility
- Search and filter with AI-powered suggestions

### 3. 👩‍🏫 Teacher Booking
- View teacher profiles and subjects
- Book 1:1 sessions (payment integration coming soon)
- Seamless dialog-based booking interface

### 4. 👤 User Management
- Firebase-authenticated login/signup
- Saved test history
- Progress visualization

---

## 📦 Installation Guide

### 1. **Clone the Repository**

```bash
git clone https://github.com/your-username/wisely.git
cd wisely
