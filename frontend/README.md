# Citizen Connect Dashboard

Build a complete frontend for an AI Petition Processing System used by government offices to automatically process citizen complaints and petitions.

Project Overview:

Citizens submit petitions through email. Zapier receives those emails and sends them to our FastAPI backend. The backend stores the petition in a PostgreSQL/Supabase database and uses Google Gemini AI to analyze the content.

The AI automatically:

- Generates a summary of the petition

- Identifies the responsible government department

- Assigns a priority level (HIGH, MEDIUM, LOW)

- Generates confidence scores

- Provides reasoning for the classification

All information is stored in the database and displayed to government officers through this dashboard.

Goal:

Create a modern, professional government administration dashboard that allows officers to review petitions, AI analysis, and forwarding decisions efficiently.

Core Features:

1. Dashboard

- Total petitions

- Pending petitions

- Analysed petitions

- High priority petitions

- Forwarded petitions

- Recent activity

2. Petition Inbox

Display petitions similar to Gmail.

Each petition should show:

- Subject

- Petition preview

- Date received

- Status

- Priority

- Assigned department

3. Petition Details Page

Display:

- Full petition content

- Sender information

- Submission date

- Current status

AI Analysis Panel:

- AI generated summary

- Department prediction

- Priority level

- Confidence score

- AI reasoning

4. Department Management

Departments include:

- Public Works Department (PWD)

- Revenue Department

- Health Department

- Water Authority

- Electricity Board

- Local Self Government

- Transport Department

- Education Department

- Police Department

Allow officers to view petitions assigned to each department.

5. Forwarding System

Officers should be able to:

- Review AI recommendation

- Select department

- Forward petition

- Track forwarding history

6. Petition Status Tracking

Statuses:

- Pending

- Analysed

- Under Review

- Forwarded

- Resolved

- Rejected

7. Search and Filtering

Search by:

- Petition ID

- Subject

- Department

- Priority

- Status

Filters:

- High Priority

- Pending

- Recently Received

- Department

8. Analytics

Show:

- Number of petitions by department

- Number of petitions by priority

- Daily petition volume

- Resolution statistics

Design Requirements:

- Inspired by Gmail's clean layout and workflow

- Professional government dashboard

- Modern Material Design style

- Clean white interface

- Responsive desktop-first design

- Sidebar navigation

- Top search bar

- Cards, tables, and detailed views

- Smooth animations

- Modern typography

Tech Stack:

- React

- TypeScript

- Tailwind CSS

- shadcn/ui

- Lucide Icons

Use realistic mock data and create a complete frontend MVP that can later be connected to a FastAPI backend and Supabase database.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://petition-wise.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1c8da039-08f2-4fc6-abd3-31951a7e46af).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
