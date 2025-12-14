import { Navbar } from "@/components/motion/Navbar";
import { HeroSection } from "@/components/motion/HeroSection";
import { LogoScroll } from "@/components/motion/LogoScroll";
import { AIToolsSection } from "@/components/motion/AIToolsSection";
import { TestimonialsSection } from "@/components/motion/TestimonialsSection";
import { ComparisonSection } from "@/components/motion/ComparisonSection";
import { FeatureSection } from "@/components/motion/FeatureSection";
import { Footer } from "@/components/motion/Footer";

const taskPlannerFeatures = [
  {
    id: "detect-prioritize",
    title: "Motion's AI detects and prioritizes your most urgent and important tasks, automatically",
    description: "Motion takes all of of your projects and tasks — their priorities, dependencies, deadlines, durations, and more — and prioritizes them based on your preferences. It builds a perfect plan that optimizes itself hundreds of times a day, automatically.",
  },
  {
    id: "do-date",
    title: "Do Date ≠ Due Date. Motion's AI ensures you'll never miss a deadline",
    description: "Just because you put a due date on something doesn't mean it'll get done. Motion's AI creates the perfect plan by matching between your workload and time. When Motion thinks a task is at-risk, it proactively warns you days or weeks in advance.",
  },
  {
    id: "gather-tasks",
    title: "Gather all tasks from other apps in one global list, automatically",
    description: "Create tasks in Motion from anywhere — forward Gmail/Outlook/iCloud emails, turn Zoom/Meet/Teams meetings or Slack/Teams messages into tasks, or tell Siri to add tasks via voice command.",
  },
];

const projectManagerFeatures = [
  {
    id: "create-projects",
    title: "Create entire projects with AI. Save 4 hours per project",
    description: "No more creating hundreds of tasks one by one. Describe your project and add relevant docs. Motion instantly builds the entire project — tasks with deadlines and assignees, project stages, and more.",
  },
  {
    id: "stop-babysitting",
    title: "Stop babysitting your project list and chasing your team for updates",
    description: "Projects in Motion get done 32% faster by eliminating idle time between tasks. Motion keeps work moving — automatically updating statuses, assigning next steps, and flagging delays.",
  },
  {
    id: "reclaim-time",
    title: "Reclaim 10+ hours a week from busywork",
    description: "Motion analyzes your team's work — tasks, projects, deadlines, assignees, priorities, dependencies, and more. Then builds the optimal plan for every team member.",
  },
  {
    id: "communicate",
    title: "Communicate and collaborate right inside Motion",
    description: "Ask your teammates questions right inside a project, task, doc, or anywhere in Motion - communication should happen where the context is.",
  },
];

const meetingFeatures = [
  {
    id: "ai-assistant",
    title: "Your AI executive assistant for every meeting",
    description: "Stop juggling note-taking, listening, and speaking. Motion's AI takes perfect notes so you can focus on the meeting. Trained on 10K+ hours of proprietary meeting video data.",
  },
  {
    id: "more-than-notes",
    title: "More than notes — summaries, action Items & follow-ups",
    description: "Worried you'll forget an action item? Motion autogenerates action items and assigns them. Can't attend? Get the key takeaways in 30 seconds with an AI summary.",
  },
  {
    id: "follow-up",
    title: "Don't waste 20 minutes after every meeting writing a follow-up email",
    description: "After a meeting, Motion can send a follow-up email to all attendees with summaries, notes, and action items.",
  },
  {
    id: "own-notes",
    title: "Still want to take your own notes? Your notes get combined with AI",
    description: "Don't completely trust AI to take notes? No problem. Write down key points and Motion's AI will magically combine its notes and yours for the full picture.",
  },
];

export default function Motion() {
  return (
    <div className="min-h-screen bg-background overflow-auto">
      <Navbar />
      <main>
        <HeroSection />
        <AIToolsSection />
        <LogoScroll />
        <TestimonialsSection />
        <ComparisonSection />
        <FeatureSection title="AI Task Planner" features={taskPlannerFeatures} />
        <FeatureSection title="AI Project Manager" features={projectManagerFeatures} />
        <FeatureSection title="AI Meeting Notetaker" features={meetingFeatures} />
      </main>
      <Footer />
    </div>
  );
}