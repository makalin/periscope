# Periscope

[![CI](https://img.shields.io/github/actions/workflow/status/makalin/periscope/ci.yml?label=CI)](https://github.com/makalin/periscope/actions)
[![License](https://img.shields.io/badge/license-MIT-informational)](#license)
[![Coverage](https://img.shields.io/badge/coverage-—-blueviolet)](https://github.com/makalin/periscope)
[![Made with](https://img.shields.io/badge/made_with-Node.js_%2B_Postgres-1f425f.svg)](#tech-stack)

> Track public predictions (economy, earthquakes, tech, politics), verify outcomes, and score forecasters with a single, transparent accuracy metric: **Perimeter**.

---

## 🌐 Project

**Periscope** — an open-source intelligence app that tracks public predictions across economy, earthquakes, politics, and technology, linking each claim to real-world outcomes.  
Using a custom scoring system called **Perimeter**, it calculates the accuracy and reliability of forecasters through verifiable data and transparent metrics.

🔗 **GitHub Repository:** [github.com/makalin/periscope](https://github.com/makalin/periscope)

---

## ⚙️ Overview

Periscope collects and evaluates **claims** from sources like Twitter/X, YouTube, RSS feeds, or manual entries.  
Each claim is verified against real-world data (e.g., CPI, elections, earthquakes) and assigned a **Perimeter Score (0–100)** measuring its accuracy and credibility.

---

## 🧮 Perimeter Metric

The **Perimeter** metric provides a universal accuracy measure:

```text
Perimeter = 100 * (1 - |Predicted - Actual| / Range)
````

* Numeric forecasts use rolling domain-specific ranges (e.g., CPI %, USD/TRY).
* Categorical or probabilistic claims use Brier-style scoring.
* Weighted averages compute reliability per forecaster, topic, or time period.

---

## 🗂️ Database Schema (Simplified)

| Table        | Purpose                                 |
| ------------ | --------------------------------------- |
| `forecaster` | Person or entity making the prediction  |
| `source`     | Original source (tweet, article, video) |
| `claim`      | Prediction text and metadata            |
| `outcome`    | Actual results linked to datasets       |
| `claim_tag`  | Keywords, topics, or regions            |

---

## 🏗️ Architecture

* **Frontend:** Next.js + TailwindCSS
* **Backend:** Node.js (Fastify/NestJS)
* **Database:** PostgreSQL
* **Queue/Workers:** Redis + BullMQ
* **Evaluation:** Custom Perimeter scoring engine

---

## 🧠 Example Workflow

```bash
# Add a new prediction
periscope add "CPI will reach 62% in October" --domain economy --source https://x.com/example

# Resolve claim when outcome is available
periscope resolve <claim_id> --actual 61.8

# Generate leaderboard
periscope leaderboard --domain economy --period 1y
```

---

## 🧩 API Endpoints

| Method | Endpoint                 | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| `POST` | `/v1/claims`             | Add a new prediction                      |
| `POST` | `/v1/claims/:id/resolve` | Submit real outcome and compute Perimeter |
| `GET`  | `/v1/leaderboard`        | Retrieve accuracy ranking                 |

---

## 📊 Roadmap

* [ ] Auto-ingest from verified experts (X, YouTube, RSS)
* [ ] Public dashboard with live accuracy scores
* [ ] Confidence calibration and topic weighting
* [ ] Open “Perimeter API” for media and researchers

---

## 👤 Credits

**Author:** [Mehmet T. Akalın](https://github.com/makalin)
**GitHub:** [github.com/makalin/periscope](https://github.com/makalin/periscope)
**License:** MIT

> blending data, AI, and social accountability into one open prediction intelligence framework.

---

© 2025 Mehmet T. Akalın — All rights reserved.
