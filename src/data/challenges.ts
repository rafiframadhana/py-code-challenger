import challengeDataJson from './py-coding-challenges.json';

export interface TestCase {
  input: string;
  expected: unknown;
  description?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  hint: string;
  testCases: TestCase[];
  starterCode?: string;
}

export interface Topic {
  [key: string]: Challenge[];
}

export interface Level {
  [key: string]: Topic;
}

export interface ChallengeData {
  levels: Level;
}

export const challengeData: ChallengeData = challengeDataJson as ChallengeData;
 