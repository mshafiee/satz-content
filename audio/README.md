# Audio Files

This directory will contain MP3 audio files for sentence pronunciations.

## Structure

```
audio/
├── de/  # German audio files
├── es/  # Spanish audio files
├── fr/  # French audio files
├── it/  # Italian audio files
├── pt/  # Portuguese audio files
├── ja/  # Japanese audio files
└── en/  # English audio files (translations)
```

## File Naming Convention

Format: `{language}-{level}-{number}.mp3`

Examples:
- `de-a1-1.mp3` - German A1 sentence 1
- `es-b2-15.mp3` - Spanish B2 sentence 15
- `de-a1-1-en.mp3` - English translation of German A1 sentence 1

## Requirements

- **Format**: MP3
- **Bitrate**: 64-128 kbps
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Channels**: Mono
- **Duration**: Under 10 seconds per sentence

## Current Status

Currently using Google Translate TTS URLs. MP3 files can be added here as they become available.

The app will automatically check for MP3 files first and fall back to TTS URLs if not found.
