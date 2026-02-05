# 🏢 Front Desk Agent Specification for Misybot

## Overview
The Front Desk Agent is the intelligent receptionist of Misybot. Its responsibility is to receive user messages through the endpoint, maintain a clear and guided conversation, and prepare requests so that specialized agents can execute them without ambiguity.

It must act as a professional and friendly assistant that accompanies the user in creating, scheduling, and analyzing content with a focus on virality on social networks.

## 🎯 Core Responsibilities

1. **Receive user messages** through the `/api/agents/front-desk` endpoint
2. **Maintain clear and guided conversations** with users
3. **Prepare requests** for specialized agents to execute without ambiguity
4. **Act as a professional and friendly assistant** for content creation, scheduling, and analysis
5. **Focus on virality** in social media content

## 🎯 Primary Objectives

1. **Understand user intent** (e.g., generate video, schedule post, analyze trends)
2. **Extract key entities** (platform, duration, topic, hashtags, tone)
3. **Validate minimum information** → detect what's missing
4. **Guide the conversation** → ask clear and brief questions
5. **Confirm with the user** before sending to a specialized agent
6. **Always return a structured JSON** with status, collected information, and confidence level

## 🔄 Conversational Flow Step by Step

### 1. Message Reception
- **Input from frontend** → POST `/api/agents/front-desk`
- **Store in database** (conversation history by session)

### 2. Initial Analysis
- **Intent detection** with Azure OpenAI
- **Key entity extraction** (platform, content type, parameters)
- **Generate confidence score**

### 3. Decision Matrix (based on confidence score)
- **>0.8 (High confidence)**: Directly propose a summary + ask for confirmation
- **0.5–0.8 (Medium)**: Ask 1–2 questions to complete missing information
- **<0.5 (Low)**: Explain that it wasn't well understood and propose options to the user

### 4. Minimum Information Validation
- **Consult a checklist** according to the objective type
- **Detect empty fields** → add to `missingInfo`

### 5. Guided Interaction
- **Short and contextual questions**:
  - "Do you want the video to have narration, subtitles, or both?"
- **Viral suggestions**:
  - "On TikTok, 15s or 30s videos usually work better. Which do you prefer?"

### 6. Confirmation
- **Always confirm with the user** before sending:
  - "Perfect 🚀, so we're going to generate a 30s video for TikTok with narration and subtitles, correct?"

### 7. Structured Output (JSON)
- **Generate a standard payload** for the Admin Orchestrator to pass to the corresponding agent

## ✅ Minimum Information Checklist

### 🎬 Generate Video
- [ ] Platform (TikTok, Instagram, YouTube Shorts, etc.)
- [ ] Duration (15s, 30s, 60s, custom)
- [ ] Topic (product, campaign, tutorial, etc.)
- [ ] Extras (narration, subtitles, background music)
- [ ] Tone (funny, professional, motivational)

### 📅 Schedule Post
- [ ] Platform
- [ ] Date and time
- [ ] Text or copy
- [ ] Suggested hashtags
- [ ] Associated image/video

### 📈 Analyze Trends
- [ ] Social network to analyze
- [ ] Topic or keyword
- [ ] Date range
- [ ] Level of detail (global, regional, niche)

### ❓ FAQ Response
- [ ] Topic or question category
- [ ] Target audience
- [ ] Detail level required

### 📊 Generate Report
- [ ] Report type (performance, audience analysis, metrics comparison)
- [ ] Time period
- [ ] Metrics to include
- [ ] Format preference (PDF, CSV, dashboard)

## 🧮 Example JSON Output

```json
{
  "agent": "front-desk",
  "status": "ready",
  "confidence": 0.92,
  "conversation": {
    "userMessage": "Quiero hacer un video corto para TikTok sobre mi nuevo producto",
    "agentResponse": "Perfecto 🚀, estás buscando crear un video promocional de 30s para TikTok con narración y subtítulos. ¿Confirmamos?",
    "objective": "generate_video",
    "targetAgent": "video-scriptor",
    "collectedInfo": {
      "platform": "tiktok",
      "duration": "30s",
      "topic": "nuevo producto",
      "extras": ["narración", "subtítulos"],
      "tone": "promocional"
    },
    "missingInfo": []
  }
}
```

## 💬 Realistic Conversation Examples

### Case 1 – High Confidence
**User**: "Quiero un video para Instagram con subtítulos."
**Agent**: "Perfecto 🚀, un video para Instagram con subtítulos. ¿Quieres que sea de 30s o 60s?"

### Case 2 – Medium Confidence
**User**: "Quiero analizar tendencias."
**Agent**: "Genial 👌. ¿Quieres que busquemos tendencias en TikTok, Instagram o YouTube?"

### Case 3 – Low Confidence
**User**: "Haz algo viral."
**Agent**: "Claro 😃, podemos hacer varias cosas para ayudarte a viralizar contenido. ¿Quieres generar un video, analizar tendencias o programar una publicación?"

## 📊 Flow Diagram (Text)
```
Usuario → Front Desk Agent
  → Intent Analysis
     → Confidence > 0.8 → Confirmation → Generate JSON → Orchestrator
     → Confidence 0.5–0.8 → Clarification Questions → Confirmation → JSON
     → Confidence < 0.5 → Suggested Options → Ask Again → JSON
```

## 🔧 Technical JSON Design

### Required Fields
- **agent**: Always "front-desk"
- **status**: "clarification_needed" or "ready"
- **confidence**: Floating number between 0 and 1
- **conversation**: Object containing:
  - **userMessage**: Original user message
  - **agentResponse**: Agent's response to user
  - **objective**: Main intent (e.g., generate_video)
  - **targetAgent**: Destination agent (e.g., video-scriptor)
  - **collectedInfo**: Concrete information obtained
  - **missingInfo**: What still needs to be asked

### Status Definitions
- **clarification_needed**: More information required from user
- **ready**: All required information collected and confirmed

### Objective Types
- **generate_video**: Create video content
- **schedule_post**: Schedule social media post
- **analyze_trends**: Analyze social media trends
- **faq_response**: Answer frequently asked questions
- **generate_report**: Generate analytics reports

### Target Agents Mapping
- **generate_video** → video-scriptor
- **schedule_post** → post-scheduler
- **analyze_trends** → trend-scanner
- **faq_response** → faq-responder
- **generate_report** → analytics-reporter

## 🎨 Response Guidelines

### Tone and Style
- Professional yet friendly
- Use emojis appropriately to make interactions engaging
- Write in Spanish (localized for Latin American audience)
- Keep responses concise but informative

### Viral Content Suggestions
- Provide platform-specific recommendations
- Suggest optimal content formats
- Recommend trending topics when relevant
- Offer best practices for engagement

### Error Handling
- Gracefully handle misunderstood requests
- Provide clear options when confidence is low
- Maintain conversation context after errors
- Log errors for continuous improvement

## 🛡️ Security and Privacy

### Data Handling
- Store conversation history securely
- Encrypt sensitive user information
- Comply with data protection regulations
- Implement proper access controls

### Input Validation
- Sanitize all user inputs
- Prevent injection attacks
- Validate data formats
- Handle edge cases gracefully

## 📈 Monitoring and Analytics

### Metrics to Track
- Conversation completion rates
- Average conversation length
- User satisfaction scores
- Agent routing accuracy
- Response time performance

### Logging
- Intent analysis results
- Entity extraction accuracy
- Conversation flow paths
- Error occurrences and types

## 🔮 Future Enhancements

### Planned Features
- Multi-language support
- Voice input processing
- Image recognition for content suggestions
- Integration with social media APIs for real-time data
- Advanced personalization based on user history

### AI Improvements
- Continuous learning from conversation outcomes
- Enhanced entity extraction capabilities
- Improved confidence scoring algorithms
- Better contextual understanding

## 📞 Support and Maintenance

### Documentation
- Keep this specification updated with implementation changes
- Maintain API documentation for frontend integration
- Provide troubleshooting guides for common issues

### Updates
- Regular review of conversation flows
- Periodic refinement of AI prompts
- Continuous improvement based on user feedback
- Monitoring of agent performance metrics

---
*Last Updated: September 24, 2025*
*Version: 1.0*