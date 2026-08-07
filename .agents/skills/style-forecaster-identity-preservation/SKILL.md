---
name: style-forecaster-identity-preservation
description: Rules and prompt engineering guidelines for maintaining facial identity, posture, and physical consistency when generating alternative outfit images from user uploaded photos in Style Forecaster.
---

# Style Forecaster - Identity Preservation & Rating Guidelines

This skill defines the mandatory workflow and prompt engineering specifications for the Style Forecaster feature in AstroAI.

## Core Directives

### 1. Concise Current Outfit Analysis
- **Rule**: Do NOT over-explain the user's current clothes.
- **Rating Output**:
  - `current_outfit_rating`: Integer (0-100) representing astrological charm & color alignment for today.
  - `plus_points`: Array of 2-4 concise strings highlighting positive alignment factors (e.g., `["+15 Sky Blue Jeans align with Venus transit", "+10 Black shirt absorbs chaotic Rahu energy"]`).
  - `current_outfit_summary`: Maximum 1-2 short sentences summarizing the current vibe.

### 2. Alternative Outfit Recommendation
- **Rule**: Recommend a distinct alternative outfit suitable for the user's specified occasion (Date Night, Special Event, Office, Party, etc.) aligned with today's planetary transit.
- **Output**:
  - `headline`: Creative 4-7 word title for the alternative look.
  - `alternative_outfit_description`: 2-3 sentence description of garments, colors, textures, and accessories.
  - `colors`: Hex codes of the primary palette.
  - `color_names`: Names of the palette colors.
  - `astrological_reason`: 2 sentence astrological justification.

### 3. Identity Preserving Image Generation Workflow
When generating an image for the alternative outfit based on an uploaded user photo:

1. **Forensic Facial Extraction (Vision Phase)**:
   Analyze the uploaded image to generate a detailed model blueprint covering:
   - Facial structure (jawline, cheekbones, face shape)
   - Eyes (shape, color, brow line)
   - Nose bridge & lip structure
   - Skin undertone & complexions
   - Hair texture, length, color, and hairline style
   - Approximate age group and gender presentation

2. **Imagen / Gemini Prompt Blueprinting**:
   Construct the image generation prompt adhering strictly to identity consistency:
   ```text
   High-end full-body fashion photograph of the EXACT SAME PERSON described in this facial blueprint:
   [FACIAL_BLUEPRINT].
   CRITICAL REQUIREMENT: Retain exact facial features, face shape, eyes, skin tone, hair style, and body proportion without modification.
   OUTFIT: Wearing [ALTERNATIVE_OUTFIT_DESCRIPTION].
   OCCASION/SETTING: Elegant background tailored for [OCCASION].
   LIGHTING: Soft studio lighting, 8k resolution, photorealistic fashion editorial style.
   ```

3. **Constraints**:
   - Never alter skin color, facial structure, or ethnicity.
   - Only swap clothes, accessories, and setting background.
   - Do not obscure the user's face with heavy accessories unless explicitly requested.
