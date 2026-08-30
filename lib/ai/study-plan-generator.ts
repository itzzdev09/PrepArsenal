// PrepArsenal — AI Agentic Study Plan Generator
// Synthesizes diagnostic weakness profiles, exam timelines, and syllabus trends
// into an actionable, day-by-day adaptive study plan via LLM Gateway & Fallback heuristics.

import { chat, type ChatMessage } from '../llm';
import type { WeaknessProfile } from './weakness-analyzer';
import type { StudyPlanItem } from '../db';

export interface GeneratedPlanTask {
  id: string;
  dayOffset: number; // 0 = Today, 1 = Tomorrow, etc.
  dayLabel: string;  // e.g. "Day 1 (Monday)"
  subject: string;
  topicId: string;
  topicName: string;
  durationMinutes: number;
  type: 'practice' | 'revision' | 'notes' | 'mock';
  priority: 'High' | 'Medium' | 'Essential';
  reasoning: string;
}

export interface AIStudyPlanResponse {
  coachStrategy: string;
  weeklyTargetHours: number;
  primaryFocusSubject: string;
  tasks: GeneratedPlanTask[];
  dbItems: StudyPlanItem[]; // Ready for storage in profiles.exam_dates.study_plan
  generatedBy: string;      // provider name or 'deterministic-heuristic'
}

/**
 * Deterministic fallback plan when LLM is unavailable or cooling down
 */
function generateDeterministicFallback(
  weakness: WeaknessProfile,
  targetExams: string[]
): AIStudyPlanResponse {
  const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const tasks: GeneratedPlanTask[] = [];
  const dbItems: StudyPlanItem[] = [];

  const examCode = targetExams[0] || 'SSC_CGL';

  // Pull top weak topics or neglected high yield topics
  const candidateTopics = [
    ...weakness.criticalWeaknesses.slice(0, 4),
    ...weakness.neglectedHighYield.slice(0, 3),
  ];

  // If still empty, add default high yield topics
  if (candidateTopics.length === 0) {
    candidateTopics.push(
      { topicId: 'qa_percentage', topicName: 'Percentage', subject: 'Quantitative Aptitude', totalAttempts: 0, correctAttempts: 0, accuracy: 0, avgTimeSeconds: 0, severityScore: 0.8, trendPredictionScore: 92, lastAttemptedAt: null },
      { topicId: 'ga_polity', topicName: 'Indian Polity & Articles', subject: 'General Awareness', totalAttempts: 0, correctAttempts: 0, accuracy: 0, avgTimeSeconds: 0, severityScore: 0.8, trendPredictionScore: 95, lastAttemptedAt: null },
      { topicId: 'lr_syllogism', topicName: 'Syllogism', subject: 'Reasoning', totalAttempts: 0, correctAttempts: 0, accuracy: 0, avgTimeSeconds: 0, severityScore: 0.7, trendPredictionScore: 88, lastAttemptedAt: null }
    );
  }

  days.forEach((dayLabel, idx) => {
    const topic = candidateTopics[idx % candidateTopics.length];
    const isMockDay = idx === 6; // Sunday full mock test

    const taskType: GeneratedPlanTask['type'] = isMockDay ? 'mock' : idx % 3 === 0 ? 'revision' : 'practice';
    const taskId = `ai_plan_${Date.now()}_${idx}`;

    const task: GeneratedPlanTask = {
      id: taskId,
      dayOffset: idx,
      dayLabel,
      subject: isMockDay ? 'Full Syllabus' : topic.subject,
      topicId: isMockDay ? 'mock_full' : topic.topicId,
      topicName: isMockDay ? `${examCode} Tier-1 All India Mock Simulation` : topic.topicName,
      durationMinutes: isMockDay ? 60 : 45,
      type: taskType,
      priority: idx < 3 ? 'High' : 'Medium',
      reasoning: isMockDay
        ? 'Weekly benchmark test to calibrate speed and IRT latent ability score.'
        : `Targeted practice to address ${topic.accuracy ? `${topic.accuracy}% accuracy bottleneck` : 'unattempted high-yield syllabus weight'}.`,
    };

    tasks.push(task);

    dbItems.push({
      id: taskId,
      topicId: task.topicId,
      topicName: task.topicName,
      subject: task.subject,
      status: 'todo',
      addedAt: new Date(Date.now() + idx * 86400000).toISOString(),
    });
  });

  return {
    coachStrategy: `7-Day Sprint targeted at ${weakness.primarySubjectGap} with GraphRAG-informed prerequisite reinforcement and weekend full-length mock calibration.`,
    weeklyTargetHours: 6.5,
    primaryFocusSubject: weakness.primarySubjectGap,
    tasks,
    dbItems,
    generatedBy: 'deterministic-heuristic',
  };
}

/**
 * Calls LLM to generate an optimized, personalized study plan
 */
export async function generateAIStudyPlan(
  weakness: WeaknessProfile,
  targetExams: string[] = ['SSC_CGL'],
  examDates: Record<string, string> = {}
): Promise<AIStudyPlanResponse> {
  const prompt = `You are the PrepArsenal Chief Academic Mentor. Create an optimal 7-day adaptive study plan for a student targeting: ${targetExams.join(', ')}.

STUDENT DIAGNOSTIC PROFILE:
- Overall Accuracy: ${weakness.overallAccuracy}% (${weakness.totalAttempted} questions attempted)
- Primary Weak Subject: ${weakness.primarySubjectGap}
- Critical Weak Topics: ${weakness.criticalWeaknesses.map(w => `${w.topicName} (${w.accuracy}% acc)`).join(', ') || 'None identified yet'}
- At-Risk Prerequisite Topics (from Knowledge Graph): ${weakness.atRiskPropagated.flatMap(a => a.expandedTopics.map(e => e.topicName)).slice(0, 4).join(', ') || 'None'}
- Neglected High-Yield Topics: ${weakness.neglectedHighYield.map(n => n.topicName).join(', ') || 'None'}
- Upcoming Exam Target Dates: ${JSON.stringify(examDates)}

INSTRUCTIONS:
Return a strictly valid JSON object matching this exact structure:
{
  "coachStrategy": "2 sentence strategic directive outlining what the student must master this week",
  "weeklyTargetHours": 8.0,
  "primaryFocusSubject": "${weakness.primarySubjectGap}",
  "tasks": [
    {
      "dayOffset": 0,
      "dayLabel": "Day 1",
      "subject": "Subject Name",
      "topicId": "topic_id_code",
      "topicName": "Human Readable Topic",
      "durationMinutes": 45,
      "type": "practice",
      "priority": "High",
      "reasoning": "Clear explanation of why this topic is scheduled today"
    }
  ]
}
Ensure there are exactly 7 tasks (Day 1 through Day 7). Day 7 should be a full mock test simulation. Return ONLY the JSON.`;

  const messages: ChatMessage[] = [
    { role: 'user', content: prompt }
  ];

  try {
    const llmRes = await chat(messages);

    if (llmRes && llmRes.content) {
      // Clean possible markdown code fences
      const cleanJson = llmRes.content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanJson);

      if (parsed.tasks && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
        const dbItems: StudyPlanItem[] = parsed.tasks.map((t: any, i: number) => ({
          id: `ai_plan_${Date.now()}_${i}`,
          topicId: t.topicId || `topic_${i}`,
          topicName: t.topicName || t.subject || 'Study Task',
          subject: t.subject || 'General',
          status: 'todo' as const,
          addedAt: new Date(Date.now() + (t.dayOffset || i) * 86400000).toISOString(),
        }));

        const tasks: GeneratedPlanTask[] = parsed.tasks.map((t: any, i: number) => ({
          id: dbItems[i].id,
          dayOffset: t.dayOffset ?? i,
          dayLabel: t.dayLabel || `Day ${i + 1}`,
          subject: t.subject || 'General',
          topicId: t.topicId || `topic_${i}`,
          topicName: t.topicName || t.subject,
          durationMinutes: t.durationMinutes || 45,
          type: (['practice', 'revision', 'notes', 'mock'].includes(t.type) ? t.type : 'practice') as any,
          priority: (['High', 'Medium', 'Essential'].includes(t.priority) ? t.priority : 'High') as any,
          reasoning: t.reasoning || 'Personalized AI study task',
        }));

        return {
          coachStrategy: parsed.coachStrategy || `Focus on ${weakness.primarySubjectGap} and high-yield question patterns.`,
          weeklyTargetHours: parsed.weeklyTargetHours || 7,
          primaryFocusSubject: parsed.primaryFocusSubject || weakness.primarySubjectGap,
          tasks,
          dbItems,
          generatedBy: llmRes.provider,
        };
      }
    }
  } catch (err) {
    console.warn('AI Plan Generation via LLM failed, falling back to deterministic engine:', err);
  }

  return generateDeterministicFallback(weakness, targetExams);
}
