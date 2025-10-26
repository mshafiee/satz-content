#!/usr/bin/env ts-node
/**
 * Content Validation Script
 * Validates the structure and integrity of generated JSON files
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationError {
  file: string;
  error: string;
}

const errors: ValidationError[] = [];

function validateFileExists(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    errors.push({
      file: filePath,
      error: 'File does not exist',
    });
    return false;
  }
  return true;
}

function validateJSON(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    errors.push({
      file: filePath,
      error: `Invalid JSON: ${err instanceof Error ? err.message : String(err)}`,
    });
    return null;
  }
}

function validateDeckIndex() {
  console.log('Validating deck index...');
  
  const indexPath = path.join(__dirname, '..', 'data', 'decks', 'index.json');
  
  if (!validateFileExists(indexPath)) return;
  
  const index = validateJSON(indexPath);
  if (!index) return;
  
  // Validate structure
  const requiredFields = ['version', 'lastUpdated', 'languages', 'levels', 'decks'];
  for (const field of requiredFields) {
    if (!(field in index)) {
      errors.push({
        file: indexPath,
        error: `Missing required field: ${field}`,
      });
    }
  }
  
  // Validate languages array
  if (!Array.isArray(index.languages) || index.languages.length === 0) {
    errors.push({
      file: indexPath,
      error: 'languages must be a non-empty array',
    });
  }
  
  // Validate levels array
  if (!Array.isArray(index.levels) || index.levels.length === 0) {
    errors.push({
      file: indexPath,
      error: 'levels must be a non-empty array',
    });
  }
  
  // Validate decks array
  if (!Array.isArray(index.decks)) {
    errors.push({
      file: indexPath,
      error: 'decks must be an array',
    });
  } else {
    // Validate each deck entry
    index.decks.forEach((deck: any, i: number) => {
      const deckFields = ['id', 'language', 'level', 'title', 'sentenceCount', 'deckUrl', 'sentencesUrl'];
      deckFields.forEach(field => {
        if (!(field in deck)) {
          errors.push({
            file: indexPath,
            error: `Deck ${i}: Missing required field: ${field}`,
          });
        }
      });
      
      // Validate sentence count is a positive number
      if (typeof deck.sentenceCount !== 'number' || deck.sentenceCount <= 0) {
        errors.push({
          file: indexPath,
          error: `Deck ${i} (${deck.id}): sentenceCount must be a positive number`,
        });
      }
    });
  }
  
  console.log(`  ✓ Index contains ${index.decks?.length || 0} decks`);
}

function validateDeckFiles() {
  console.log('Validating deck files...');
  
  const decksDir = path.join(__dirname, '..', 'data', 'decks');
  const indexPath = path.join(decksDir, 'index.json');
  
  if (!fs.existsSync(indexPath)) return;
  
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  let validCount = 0;
  let totalCourses = 0;
  let coursesValidated = 0;
  
  for (const deck of index.decks || []) {
    const deckPath = path.join(__dirname, '..', deck.deckUrl);
    
    if (!validateFileExists(deckPath)) continue;
    
    const deckData = validateJSON(deckPath);
    if (!deckData) continue;
    
    // Validate deck structure
    const requiredFields = ['id', 'language', 'level', 'title', 'sentenceCount', 'sentencesUrl', 'courseCount'];
    for (const field of requiredFields) {
      if (!(field in deckData)) {
        errors.push({
          file: deckPath,
          error: `Missing required field: ${field}`,
        });
      }
    }
    
    // Validate ID matches
    if (deckData.id !== deck.id) {
      errors.push({
        file: deckPath,
        error: `ID mismatch: expected ${deck.id}, got ${deckData.id}`,
      });
    }
    
    // Validate courses array
    if (deckData.courses) {
      if (!Array.isArray(deckData.courses)) {
        errors.push({
          file: deckPath,
          error: 'courses must be an array',
        });
      } else {
        // Validate course count matches
        if (deckData.courses.length !== deckData.courseCount) {
          errors.push({
            file: deckPath,
            error: `Course count mismatch: courseCount=${deckData.courseCount}, but courses array has ${deckData.courses.length} items`,
          });
        }
        
        // Validate each course
        deckData.courses.forEach((course: any, i: number) => {
          const courseFields = ['id', 'order', 'title', 'description', 'sentenceCount'];
          courseFields.forEach(field => {
            if (!(field in course)) {
              errors.push({
                file: deckPath,
                error: `Course ${i}: Missing required field: ${field}`,
              });
            }
          });
          
          // Validate course order is sequential
          if (course.order !== i + 1) {
            errors.push({
              file: deckPath,
              error: `Course ${i}: order should be ${i + 1}, got ${course.order}`,
            });
          }
          
          coursesValidated++;
        });
        
        totalCourses += deckData.courses.length;
      }
    }
    
    validCount++;
  }
  
  console.log(`  ✓ Validated ${validCount} deck files`);
  console.log(`  ✓ Validated ${coursesValidated} courses (course structure, order, fields)`);
  console.log(`  ✓ Total courses across all decks: ${totalCourses}`);
}

function validateSentenceFiles() {
  console.log('Validating sentence files...');
  
  const sentencesDir = path.join(__dirname, '..', 'data', 'sentences');
  
  if (!fs.existsSync(sentencesDir)) {
    errors.push({
      file: sentencesDir,
      error: 'Sentences directory does not exist',
    });
    return;
  }
  
  const files = fs.readdirSync(sentencesDir).filter(f => f.endsWith('.json'));
  let validCount = 0;
  let totalSentences = 0;
  let sentencesWithCourseId = 0;
  let courseIdValidations = 0;
  
  for (const file of files) {
    const filePath = path.join(sentencesDir, file);
    const data = validateJSON(filePath);
    
    if (!data) continue;
    
    // Validate structure
    const requiredFields = ['deckId', 'version', 'sentenceCount', 'sentences'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        errors.push({
          file: filePath,
          error: `Missing required field: ${field}`,
        });
      }
    }
    
    // Validate sentences array
    if (!Array.isArray(data.sentences)) {
      errors.push({
        file: filePath,
        error: 'sentences must be an array',
      });
      continue;
    }
    
    // Validate sentence count matches
    if (data.sentences.length !== data.sentenceCount) {
      errors.push({
        file: filePath,
        error: `Sentence count mismatch: expected ${data.sentenceCount}, got ${data.sentences.length}`,
      });
    }
    
    // Load corresponding deck to validate courseIds
    let validCourseIds: string[] = [];
    if (data.deckId) {
      try {
        const indexPath = path.join(__dirname, '..', 'data', 'decks', 'index.json');
        const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
        const deckEntry = index.decks.find((d: any) => d.id === data.deckId);
        
        if (deckEntry) {
          const deckPath = path.join(__dirname, '..', deckEntry.deckUrl);
          const deckData = JSON.parse(fs.readFileSync(deckPath, 'utf8'));
          
          if (deckData.courses && Array.isArray(deckData.courses)) {
            validCourseIds = deckData.courses.map((c: any) => c.id);
          }
        }
      } catch (err) {
        // Continue validation even if deck loading fails
      }
    }
    
    // Validate each sentence
    data.sentences.forEach((sentence: any, i: number) => {
      const sentenceFields = ['id', 'order', 'courseId', 'targetLanguage', 'nativeLanguage'];
      sentenceFields.forEach(field => {
        if (!(field in sentence)) {
          errors.push({
            file: filePath,
            error: `Sentence ${i}: Missing required field: ${field}`,
          });
        }
      });
      
      // Count sentences with courseId
      if (sentence.courseId) {
        sentencesWithCourseId++;
      }
      
      // Validate courseId format
      if (sentence.courseId && typeof sentence.courseId !== 'string') {
        errors.push({
          file: filePath,
          error: `Sentence ${i}: courseId must be a string`,
        });
      }
      
      // Validate courseId exists in deck
      if (sentence.courseId && validCourseIds.length > 0) {
        courseIdValidations++;
        if (!validCourseIds.includes(sentence.courseId)) {
          errors.push({
            file: filePath,
            error: `Sentence ${i} (${sentence.id}): courseId "${sentence.courseId}" does not exist in deck ${data.deckId}`,
          });
        }
      }
      
      // Validate language objects
      ['targetLanguage', 'nativeLanguage'].forEach(langField => {
        if (sentence[langField]) {
          const langFields = ['text', 'audioUrl'];
          langFields.forEach(field => {
            if (!(field in sentence[langField])) {
              errors.push({
                file: filePath,
                error: `Sentence ${i} ${langField}: Missing required field: ${field}`,
              });
            }
          });
        }
      });
    });
    
    validCount++;
    totalSentences += data.sentences.length;
  }
  
  console.log(`  ✓ Validated ${validCount} sentence files`);
  console.log(`  ✓ Total sentences: ${totalSentences}`);
  console.log(`  ✓ Sentences with courseId: ${sentencesWithCourseId}`);
  console.log(`  ✓ CourseId cross-references validated: ${courseIdValidations}`);
}

function validateDirectoryStructure() {
  console.log('Validating directory structure...');
  
  const requiredDirs = [
    'data',
    'data/decks',
    'data/sentences',
    'audio',
    'scripts',
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      errors.push({
        file: dirPath,
        error: 'Required directory does not exist',
      });
    }
  }
  
  console.log(`  ✓ Directory structure validated`);
}

function main() {
  console.log('🔍 Starting content validation...\n');
  
  validateDirectoryStructure();
  validateDeckIndex();
  validateDeckFiles();
  validateSentenceFiles();
  
  console.log('\n' + '='.repeat(60));
  
  if (errors.length === 0) {
    console.log('✅ Validation passed! All content files are valid.\n');
    process.exit(0);
  } else {
    console.log(`❌ Validation failed with ${errors.length} error(s):\n`);
    
    errors.forEach((error, i) => {
      console.log(`${i + 1}. ${error.file}`);
      console.log(`   ${error.error}\n`);
    });
    
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { main };

