# 🛠️ Front Desk Agent Conversation Flow Fix

## 🎯 Current Issue

The Front Desk Agent is getting stuck in repetitive questioning loops instead of progressing naturally through the conversation flow. For example:

```
User: quiero hacer un video
Agent: ¿Para qué plataforma quieres crear el video?

User: instagram
Agent: ¿Sobre qué tema quieres que sea el video?

User: gatos con forma humana
Agent: ¿Sobre qué tema quieres que sea el video?  <- Should ask about duration instead!

User: amor entre dos gatos romanticos
Agent: ¿Sobre qué tema quieres que sea el video?  <- Still repeating!
```

## ✅ Expected Behavior

The conversation should flow naturally:

```
User: quiero hacer un video
Agent: ¿Para qué plataforma quieres crear el video?

User: instagram
Agent: ¿Sobre qué tema quieres que sea el video?

User: gatos con forma humana
Agent: ¿Qué duración prefieres para el video? (30 segundos, 1 minuto, etc.)

User: 30 segundos
Agent: ¡Entendido! 🎬 Crearé un video de 30s para instagram sobre "gatos con forma humana". ¿Es correcto?
```

## 🛠️ Technical Fix

### 1. Improved Intent Analysis

The agent needs better context tracking to recognize when information has been provided:

```typescript
private analyzeIntentWithHistory(message: string, history: FrontDeskConversation[]): any {
  const lowerMessage = message.toLowerCase();
  
  // Start with the current objective from conversation history
  let objective = history.length > 0 ? history[0].objective : 'unknown';
  let confidence = 0.3; // Base confidence
  
  // If we don't have an objective yet, determine it
  if (objective === 'unknown') {
    if (lowerMessage.includes('video') || lowerMessage.includes('vídeo')) {
      objective = 'generate_video';
      confidence = 0.9;
    } else if (lowerMessage.includes('programar') || lowerMessage.includes('publicar') || lowerMessage.includes('post')) {
      objective = 'schedule_post';
      confidence = 0.9;
    }
    // ... other intent detection
  }
  
  // If we have an ongoing conversation, maintain context
  if (history.length > 0 && objective !== 'unknown') {
    // Check if this message provides new information for our current objective
    const lastConversation = history[0];
    
    // If we're asking about platform and user provides platform
    if (lastConversation.missingInfo.includes('plataforma') && 
        (lowerMessage.includes('tiktok') || lowerMessage.includes('instagram') || 
         lowerMessage.includes('facebook') || lowerMessage.includes('youtube'))) {
      confidence = Math.min(0.9, lastConversation.confidence + 0.1);
    }
    
    // If we're asking about topic and user provides topic (not asking the same question again)
    if (lastConversation.missingInfo.includes('tema') && 
        !lowerMessage.includes('tema') && 
        !lowerMessage.includes('sobre') &&
        message.length > 5) { // Simple heuristic: if message is long enough, it's likely the topic
      confidence = Math.min(0.9, lastConversation.confidence + 0.1);
    }
  }
  
  return {
    currentObjective: objective,
    confidence,
    previousObjective: history.length > 0 ? history[0].objective : 'unknown',
  };
}
```

### 2. Enhanced Entity Extraction

The entity extraction needs to be smarter about recognizing when information has been provided:

```typescript
private extractEntities(message: string, objective: string, history: FrontDeskConversation[]): any {
  const collectedInfo: any = {};
  const lowerMessage = message.toLowerCase();
  
  // If we have conversation history, start with previously collected info
  if (history.length > 0) {
    Object.assign(collectedInfo, history[0].collectedInfo);
  }
  
  // Extract platform
  if (lowerMessage.includes('tiktok')) {
    collectedInfo.platform = 'tiktok';
  } else if (lowerMessage.includes('instagram')) {
    collectedInfo.platform = 'instagram';
  } else if (lowerMessage.includes('facebook')) {
    collectedInfo.platform = 'facebook';
  } else if (lowerMessage.includes('youtube')) {
    collectedInfo.platform = 'youtube';
  }
  
  // Extract duration based on objective
  if (objective === 'generate_video') {
    if (lowerMessage.includes('corto') || lowerMessage.includes('30s') || lowerMessage.includes('15s')) {
      collectedInfo.duration = '30s';
    } else if (lowerMessage.includes('largo') || lowerMessage.includes('1min') || lowerMessage.includes('minuto')) {
      collectedInfo.duration = '1min';
    } else if (lowerMessage.includes('60s') || lowerMessage.includes('60 segundos')) {
      collectedInfo.duration = '60s';
    }
  }
  
  // Extract topic - but only if we don't already have one or if this seems like a topic response
  if (!collectedInfo.topic || this.isLikelyTopicResponse(message, history)) {
    const topic = this.extractTopic(message, history);
    if (topic) {
      collectedInfo.topic = topic;
    }
  }
  
  return collectedInfo;
}

private isLikelyTopicResponse(message: string, history: FrontDeskConversation[]): boolean {
  // If the last message was asking about the topic, this is likely a topic response
  if (history.length > 0 && history[0].agentResponse.includes('tema')) {
    // But exclude responses that are just asking the same question
    const lowerMessage = message.toLowerCase();
    return !lowerMessage.includes('tema') && 
           !lowerMessage.includes('sobre qué') &&
           message.length > 5;
  }
  return false;
}

private extractTopic(message: string, history: FrontDeskConversation[]): string | null {
  const lowerMessage = message.toLowerCase();
  
  // Simple heuristic: if this isn't a question and isn't just confirming the previous question,
  // and it's reasonably long, treat it as the topic
  if (!message.endsWith('?') && message.length > 5) {
    // Exclude common question words that might indicate they're asking for clarification
    if (!lowerMessage.includes('qué') && 
        !lowerMessage.includes('como') && 
        !lowerMessage.includes('cuál') &&
        !lowerMessage.includes('tema')) {
      return message;
    }
  }
  
  return null;
}
```

### 3. Improved Missing Information Detection

The agent needs to better track what information is still missing:

```typescript
private identifyMissingInfo(objective: string, collectedInfo: any, history: FrontDeskConversation[]): string[] {
  const missingInfo: string[] = [];
  
  // Always check for platform
  if (!collectedInfo.platform) {
    missingInfo.push('plataforma');
  }
  
  switch (objective) {
    case 'generate_video':
      // Check if we already have duration from previous conversation
      if (!collectedInfo.duration) {
        missingInfo.push('duración');
      }
      // Check if we already have topic from previous conversation
      if (!collectedInfo.topic) {
        missingInfo.push('tema');
      }
      break;
      
    case 'schedule_post':
      if (!collectedInfo.topic) {
        missingInfo.push('contenido');
      }
      break;
  }
  
  return missingInfo;
}
```

## 🚀 Implementation Plan

1. **Update the FrontDeskService** with the improved logic above
2. **Test with various conversation flows** to ensure natural progression
3. **Add logging** to track conversation state for debugging
4. **Implement better error recovery** for when conversations get stuck

## 🧪 Testing Scenarios

### Scenario 1: Video Creation Flow
```
User: quiero hacer un video
Agent: ¿Para qué plataforma quieres crear el video?
User: instagram
Agent: ¿Sobre qué tema quieres que sea el video?
User: gatos con forma humana
Agent: ¿Qué duración prefieres para el video?
User: 30 segundos
Agent: ¡Entendido! 🎬 Crearé un video de 30s para instagram sobre "gatos con forma humana". ¿Es correcto?
```

### Scenario 2: Recovery from Stuck Conversations
```
User: quiero hacer un video
Agent: ¿Para qué plataforma quieres crear el video?
User: instagram
Agent: ¿Sobre qué tema quieres que sea el video?
User: (sends same question back) ¿Sobre qué tema quieres que sea el video?
Agent: Lo siento, creo que hubo un malentendido. ¿Podrías decirme sobre qué tema quieres que sea el video?
```

## 📈 Benefits of This Fix

1. **More Natural Conversations**: Users won't get stuck in repetitive loops
2. **Better User Experience**: Fluid, human-like interaction
3. **Higher Completion Rates**: More conversations will successfully complete
4. **Reduced Frustration**: Users won't feel like the agent isn't listening

This fix will make the Front Desk Agent feel much more intelligent and responsive to actual user needs.