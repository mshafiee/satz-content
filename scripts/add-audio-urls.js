const fs = require('fs');
const path = require('path');

// Read the JSON file
const filePath = path.join(__dirname, '../data/sentences/deck_de_a1.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Function to generate audio URL
function generateAudioUrl(text, language) {
  const encodedText = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${language}&client=tw-ob`;
}

// Update each sentence with audio URLs
data.sentences.forEach(sentence => {
  // Add audio URL for target language (German)
  sentence.targetLanguage.audioUrl = generateAudioUrl(
    sentence.targetLanguage.text,
    'de'
  );
  
  // Add audio URL for native language (English)
  sentence.nativeLanguage.audioUrl = generateAudioUrl(
    sentence.nativeLanguage.text,
    'en'
  );
});

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Successfully updated ${data.sentences.length} sentences with audio URLs!`);

