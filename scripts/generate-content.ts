#!/usr/bin/env ts-node
/**
 * Content Generator Script
 * Generates JSON files for decks and sentences from the main app's mockAudioData
 */

import * as fs from 'fs';
import * as path from 'path';

// Language configuration
const LANGUAGES = [
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

// Level configuration
const LEVELS = [
  { code: 'A1', name: 'Beginner', description: 'Basic phrases and greetings' },
  { code: 'A2', name: 'Elementary', description: 'Simple conversations and daily activities' },
  { code: 'B1', name: 'Intermediate', description: 'Express opinions and discuss familiar topics' },
  { code: 'B2', name: 'Upper Intermediate', description: 'Discuss complex topics and current events' },
  { code: 'C1', name: 'Advanced', description: 'Express ideas fluently and spontaneously' },
  { code: 'C2', name: 'Proficient', description: 'Master level communication' },
];

// Mock sentence data (copied from main app's mockAudioData.ts structure)
interface MockSentence {
  id: string;
  text: string;
  translation: string;
  audioUrl: string;
  language: string;
  level: string;
}

// Import or define mock data here
// For now, we'll create a placeholder that reads from a JSON file
const MOCK_DATA_PATH = path.join(__dirname, '..', '..', 'satz', 'SatzApp', 'src', 'utils', 'mockAudioData.ts');

function getMockSentences(): MockSentence[] {
  // This is a simplified version - in practice, you'd parse the TypeScript file
  // or export the data as JSON from the main app
  
  // For now, return empty array - this will be populated when script is run with actual data
  console.log('Note: To populate with actual data, export mockAudioData from the main app');
  console.log(`Looking for data in: ${MOCK_DATA_PATH}`);
  
  // Return sample data for demonstration
  return generateSampleData();
}

function generateSampleData(): MockSentence[] {
  const sentences: MockSentence[] = [];
  
  for (const lang of LANGUAGES) {
    for (const level of LEVELS) {
      // Generate a few sample sentences for each combination
      const count = level.code === 'A1' ? 20 : level.code === 'A2' ? 15 : 10;
      
      for (let i = 1; i <= count; i++) {
        sentences.push({
          id: `${lang.code}-${level.code.toLowerCase()}-${i}`,
          text: `Sample ${lang.name} sentence ${i}`,
          translation: `Sample translation ${i}`,
          audioUrl: `https://translate.google.com/translate_tts?ie=UTF-8&q=Sample+${lang.name}+sentence+${i}&tl=${lang.code}&client=tw-ob`,
          language: lang.code,
          level: level.code,
        });
      }
    }
  }
  
  return sentences;
}

function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function generateDeckIndex(sentences: MockSentence[]) {
  const decks: any[] = [];
  
  for (const lang of LANGUAGES) {
    for (const level of LEVELS) {
      const deckSentences = sentences.filter(
        s => s.language === lang.code && s.level === level.code
      );
      
      if (deckSentences.length > 0) {
        const deckId = `deck_${lang.code}_${level.code.toLowerCase()}`;
        decks.push({
          id: deckId,
          language: lang.code,
          languageName: lang.name,
          level: level.code,
          title: `${level.code}: ${level.name} ${lang.name}`,
          description: `${level.description} in ${lang.name}`,
          sentenceCount: deckSentences.length,
          deckUrl: `/data/decks/${lang.code}/${level.code.toLowerCase()}.json`,
          sentencesUrl: `/data/sentences/${deckId}.json`,
        });
      }
    }
  }
  
  const index = {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    languages: LANGUAGES.map(l => l.code),
    levels: LEVELS.map(l => l.code),
    totalDecks: decks.length,
    totalSentences: sentences.length,
    decks,
  };
  
  const outputPath = path.join(__dirname, '..', 'data', 'decks', 'index.json');
  ensureDirectoryExists(path.dirname(outputPath));
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));
  
  console.log(`✓ Generated deck index: ${outputPath}`);
  console.log(`  - ${decks.length} decks`);
  console.log(`  - ${sentences.length} total sentences`);
}

function generateDeckFiles(sentences: MockSentence[]) {
  let deckCount = 0;
  
  for (const lang of LANGUAGES) {
    const langDir = path.join(__dirname, '..', 'data', 'decks', lang.code);
    ensureDirectoryExists(langDir);
    
    for (const level of LEVELS) {
      const deckSentences = sentences.filter(
        s => s.language === lang.code && s.level === level.code
      );
      
      if (deckSentences.length > 0) {
        const deckId = `deck_${lang.code}_${level.code.toLowerCase()}`;
        const deck = {
          id: deckId,
          language: lang.code,
          languageName: lang.name,
          nativeLanguageName: lang.nativeName,
          level: level.code,
          levelName: level.name,
          title: `${level.code}: ${level.name} ${lang.name}`,
          description: `${level.description} in ${lang.name}`,
          sentenceCount: deckSentences.length,
          sentencesUrl: `/data/sentences/${deckId}.json`,
        };
        
        const outputPath = path.join(langDir, `${level.code.toLowerCase()}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(deck, null, 2));
        deckCount++;
      }
    }
  }
  
  console.log(`✓ Generated ${deckCount} deck files`);
}

function generateSentenceFiles(sentences: MockSentence[]) {
  const sentencesDir = path.join(__dirname, '..', 'data', 'sentences');
  ensureDirectoryExists(sentencesDir);
  
  let fileCount = 0;
  
  for (const lang of LANGUAGES) {
    for (const level of LEVELS) {
      const deckSentences = sentences.filter(
        s => s.language === lang.code && s.level === level.code
      );
      
      if (deckSentences.length > 0) {
        const deckId = `deck_${lang.code}_${level.code.toLowerCase()}`;
        
        const sentenceData = {
          deckId,
          version: '1.0',
          lastUpdated: new Date().toISOString(),
          language: lang.code,
          level: level.code,
          sentenceCount: deckSentences.length,
          sentences: deckSentences.map((s, index) => ({
            id: s.id,
            order: index + 1,
            targetLanguage: {
              text: s.text,
              audioUrl: s.audioUrl,
              audioFile: `/audio/${lang.code}/${s.id}.mp3`,
            },
            nativeLanguage: {
              text: s.translation,
              audioUrl: `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(s.translation)}&tl=en&client=tw-ob`,
              audioFile: `/audio/en/${s.id}-en.mp3`,
            },
          })),
        };
        
        const outputPath = path.join(sentencesDir, `${deckId}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(sentenceData, null, 2));
        fileCount++;
      }
    }
  }
  
  console.log(`✓ Generated ${fileCount} sentence files`);
}

function generatePlaceholderReadme() {
  const audioReadme = path.join(__dirname, '..', 'audio', 'README.md');
  const content = `# Audio Files

This directory will contain MP3 audio files for sentence pronunciations.

## Structure

\`\`\`
audio/
├── de/  # German audio files
├── es/  # Spanish audio files
├── fr/  # French audio files
├── it/  # Italian audio files
├── pt/  # Portuguese audio files
├── ja/  # Japanese audio files
└── en/  # English audio files (translations)
\`\`\`

## File Naming Convention

Format: \`{language}-{level}-{number}.mp3\`

Examples:
- \`de-a1-1.mp3\` - German A1 sentence 1
- \`es-b2-15.mp3\` - Spanish B2 sentence 15
- \`de-a1-1-en.mp3\` - English translation of German A1 sentence 1

## Requirements

- **Format**: MP3
- **Bitrate**: 64-128 kbps
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Channels**: Mono
- **Duration**: Under 10 seconds per sentence

## Current Status

Currently using Google Translate TTS URLs. MP3 files can be added here as they become available.

The app will automatically check for MP3 files first and fall back to TTS URLs if not found.
`;
  
  ensureDirectoryExists(path.dirname(audioReadme));
  fs.writeFileSync(audioReadme, content);
  console.log(`✓ Generated audio README`);
}

// Main execution
function main() {
  console.log('🚀 Starting content generation...\n');
  
  const sentences = getMockSentences();
  
  if (sentences.length === 0) {
    console.log('⚠️  No sentence data found. Using sample data for demonstration.');
  }
  
  console.log(`\nProcessing ${sentences.length} sentences...\n`);
  
  // Generate all content files
  generateDeckIndex(sentences);
  generateDeckFiles(sentences);
  generateSentenceFiles(sentences);
  generatePlaceholderReadme();
  
  console.log('\n✅ Content generation complete!\n');
  console.log('Next steps:');
  console.log('  1. Run "npm run validate" to verify the generated files');
  console.log('  2. Commit and push to trigger GitHub Pages deployment');
  console.log('  3. Access content at: https://[username].github.io/satz-content/');
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main, getMockSentences, LANGUAGES, LEVELS };

