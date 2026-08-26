import { NCERT_TRACKS, type NcertQuestion, type NcertTrack } from './ncert-booster';

export interface BuiltChapterQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string;
  /** 'chapter' = authored for this chapter; 'revision' = pulled from a nearby chapter in the same track. */
  origin: 'chapter' | 'revision';
  sourceChapterTitle: string;
}

function toBuilt(
  question: NcertQuestion,
  origin: BuiltChapterQuestion['origin'],
  sourceChapterTitle: string
): BuiltChapterQuestion {
  return {
    id: question.id,
    question_text: question.questionText,
    options: question.options,
    correct_option: question.correctOption,
    explanation: question.explanation,
    origin,
    sourceChapterTitle,
  };
}

/**
 * Assemble a chapter test without calling any language model.
 *
 * Every question returned was written by hand against an NCERT chapter, so the
 * test can never contain a fabricated fact. The chapter's own questions come
 * first; because most chapters currently carry only one or two, the remainder is
 * topped up with questions from the nearest chapters in the same track, walking
 * outwards from the current chapter. Those are marked `origin: 'revision'` so the
 * UI can label them honestly as spaced revision rather than new material.
 */
export function buildChapterTest(chapterId: string, size = 5): BuiltChapterQuestion[] {
  let track: NcertTrack | undefined;
  let index = -1;

  for (const candidate of NCERT_TRACKS) {
    const found = candidate.chapters.findIndex(chapter => chapter.id === chapterId);
    if (found !== -1) {
      track = candidate;
      index = found;
      break;
    }
  }
  if (!track) return [];

  const chapter = track.chapters[index];
  const test: BuiltChapterQuestion[] = chapter.questions.map(question =>
    toBuilt(question, 'chapter', chapter.title)
  );

  // Walk outwards — previous chapter, next chapter, two back, two forward — so
  // top-up questions stay close to what the learner has just read.
  for (let distance = 1; distance < track.chapters.length && test.length < size; distance += 1) {
    for (const neighbour of [track.chapters[index - distance], track.chapters[index + distance]]) {
      if (!neighbour) continue;
      for (const question of neighbour.questions) {
        if (test.length >= size) break;
        if (test.some(existing => existing.id === question.id)) continue;
        test.push(toBuilt(question, 'revision', neighbour.title));
      }
    }
  }

  return test.slice(0, size);
}
