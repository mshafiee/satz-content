# Satz Content Repository

## 📁 Repository Structure

```
satz-content/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions for automatic deployment
├── data/
│   ├── decks/
│   │   ├── index.json         # Master index of all decks
│   │   ├── de/                # German decks (A1-C2)
│   │   ├── es/                # Spanish decks
│   │   ├── fr/                # French decks
│   │   ├── it/                # Italian decks
│   │   ├── pt/                # Portuguese decks
│   │   ├── ja/                # Japanese decks
│   │   └── en/                # English decks
│   └── sentences/
│       ├── deck_de_a1.json    # Sentences for each deck
│       ├── deck_de_a2.json
│       └── ...
├── audio/                      # Audio files (MP3)
│   ├── de/                    # German audio
│   ├── es/                    # Spanish audio
│   ├── fr/                    # French audio
│   ├── it/                    # Italian audio
│   ├── pt/                    # Portuguese audio
│   ├── ja/                    # Japanese audio
│   └── en/                    # English audio
├── scripts/
│   ├── generate-content.ts    # Generate JSON from source data
│   └── validate-content.ts    # Validate JSON structure
├── index.html                 # Landing page
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/mshafiee/satz-content.git
cd satz-content

# Install dependencies
npm install

# Generate content from source data
npm run generate

# Validate content structure
npm run validate

# Serve locally for testing
npm run serve
```

### Generating Content

```bash
npm run generate
```

This creates:
- `data/decks/index.json` - Master deck index
- `data/decks/{language}/{level}.json` - Individual deck metadata
- `data/sentences/deck_{language}_{level}.json` - Sentence data for each deck

## 📊 Data Schema

### Deck Index (`data/decks/index.json`)

```json
{
  "version": "1.0",
  "lastUpdated": "2025-10-25T12:00:00Z",
  "languages": ["en", "de", "es", "fr", "it", "pt", "ja"],
  "levels": ["A1", "A2", "B1", "B2", "C1", "C2"],
  "decks": [
    {
      "id": "deck_de_a1",
      "language": "de",
      "languageName": "German",
      "level": "A1",
      "title": "A1: Beginner German",
      "description": "Basic phrases and greetings",
      "sentenceCount": 20,
      "deckUrl": "/data/decks/de/a1.json",
      "sentencesUrl": "/data/sentences/deck_de_a1.json"
    }
  ]
}
```

### Deck Metadata (`data/decks/{language}/{level}.json`)

```json
{
  "id": "deck_de_a1",
  "language": "de",
  "languageName": "German",
  "nativeLanguageName": "Deutsch",
  "level": "A1",
  "levelName": "Beginner",
  "title": "A1: Beginner German",
  "description": "Basic phrases and greetings in German",
  "sentenceCount": 20,
  "sentencesUrl": "/data/sentences/deck_de_a1.json"
}
```

### Sentence Data (`data/sentences/deck_{language}_{level}.json`)

```json
{
  "deckId": "deck_de_a1",
  "version": "1.0",
  "lastUpdated": "2025-10-25T12:00:00Z",
  "sentenceCount": 20,
  "sentences": [
    {
      "id": "de-a1-1",
      "order": 1,
      "targetLanguage": {
        "text": "Guten Morgen",
        "audioUrl": "https://translate.google.com/translate_tts?ie=UTF-8&q=Guten+Morgen&tl=de&client=tw-ob",
        "audioFile": "/audio/de/de-a1-1.mp3"
      },
      "nativeLanguage": {
        "text": "Good morning",
        "audioUrl": "https://translate.google.com/translate_tts?ie=UTF-8&q=Good+morning&tl=en&client=tw-ob",
        "audioFile": "/audio/en/de-a1-1-en.mp3"
      }
    }
  ]
}
```

## 🎵 Audio Files

### Current Approach

The app currently uses Google Translate TTS URLs for audio playback:
- **Advantages:** No storage needed, immediate availability
- **Disadvantages:** Requires internet, potential rate limiting

### Future Approach: Self-Hosted MP3 Files

As MP3 files become available, add them to the `/audio/{language}/` directory:

```
audio/
├── de/
│   ├── de-a1-1.mp3
│   ├── de-a1-2.mp3
│   └── ...
├── es/
│   ├── es-a1-1.mp3
│   └── ...
└── en/
    ├── de-a1-1-en.mp3    # English translation of German sentence
    └── ...
```

**File Naming Convention:** `{language}-{level}-{number}.mp3`

**Requirements:**
- Format: MP3
- Bitrate: 64-128 kbps
- Sample Rate: 44.1 kHz or 48 kHz
- Channels: Mono
- Max Duration: ~10 seconds per sentence

The app will automatically check for MP3 files first and fall back to TTS URLs if not available.

## 🌍 Supported Languages

| Code | Language   | Native Name |
|------|------------|-------------|
| `de` | German     | Deutsch     |
| `es` | Spanish    | Español     |
| `fr` | French     | Français    |
| `it` | Italian    | Italiano    |
| `pt` | Portuguese | Português   |
| `ja` | Japanese   | 日本語      |
| `en` | English    | English     |

## 📈 CEFR Levels

| Level | Name                | Description                                |
|-------|---------------------|--------------------------------------------|
| A1    | Beginner            | Basic phrases and greetings                |
| A2    | Elementary          | Simple conversations and daily activities  |
| B1    | Intermediate        | Express opinions and discuss familiar topics |
| B2    | Upper Intermediate  | Discuss complex topics and current events  |
| C1    | Advanced            | Express ideas fluently and spontaneously   |
| C2    | Proficient          | Master level communication                 |

## 🔧 Development

### Adding New Content

1. **Add sentences to the main app** in `SatzApp/src/utils/mockAudioData.ts`
2. **Generate JSON files:**
   ```bash
   npm run generate
   ```
3. **Validate structure:**
   ```bash
   npm run validate
   ```
4. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add new content for [language] [level]"
   git push
   ```
5. **Automatic deployment** via GitHub Actions

### Testing Locally

```bash
# Serve the content locally
npm run serve

# Access at http://localhost:8080
# Test endpoints:
# - http://localhost:8080/data/decks/index.json
# - http://localhost:8080/data/sentences/deck_de_a1.json
```

## 🚢 Deployment

### Automatic Deployment

Every push to the `main` branch triggers an automatic deployment via GitHub Actions. The workflow:

1. Checks out the repository
2. Configures GitHub Pages
3. Uploads artifacts
4. Deploys to GitHub Pages

### Manual Deployment

If needed, trigger deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to GitHub Pages** workflow
3. Click **Run workflow**

### Enabling GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** section
3. Set source to **GitHub Actions**
4. Save changes

## 📝 API Usage

### Fetching Deck Index

```javascript
fetch('https://mshafiee.github.io/satz-content/data/decks/index.json')
  .then(res => res.json())
  .then(data => console.log(data.decks));
```

### Fetching Sentences for a Deck

```javascript
const deckId = 'deck_de_a1';
fetch(`https://mshafiee.github.io/satz-content/data/sentences/${deckId}.json`)
  .then(res => res.json())
  .then(data => console.log(data.sentences));
```

### Audio Contributions

To contribute audio files:

1. Record high-quality audio following the requirements
2. Name files using the convention: `{language}-{level}-{number}.mp3`
3. Place in appropriate `/audio/{language}/` directory
4. Update sentence JSON to reference the new files
5. Submit a pull request
