# 🔄 Front Desk Agent Flowchart

## Visual Representation of the Conversational Flow

```mermaid
graph TD
    A[User sends message] --> B[Receive via POST /api/agents/front-desk]
    B --> C[Store in DB - Get conversation history]
    C --> D[Intent Analysis with Azure OpenAI]
    D --> E[Extract Entities with Azure OpenAI]
    E --> F[Generate Confidence Score]
    F --> G{Confidence Score}
    
    G --> |High > 0.8| H[Generate Summary Proposal]
    H --> I[Ask for Confirmation]
    I --> J{User Confirms?}
    J --> |Yes| K[Set status = ready]
    J --> |No| L[Clarify Requirements]
    L --> M[Update collectedInfo]
    M --> N[Reassess Confidence]
    
    G --> |Medium 0.5-0.8| O[Ask 1-2 Clarification Questions]
    O --> P[Update collectedInfo]
    P --> Q[Reassess Confidence]
    Q --> G
    
    G --> |Low < 0.5| R[Explain misunderstanding]
    R --> S[Propose options to user]
    S --> T[Get user selection]
    T --> U[Update objective]
    U --> G
    
    K --> V[Validate Minimum Information]
    V --> W{All info collected?}
    W --> |Yes| X[Set targetAgent]
    W --> |No| Y[Identify missingInfo]
    Y --> Z[Ask missing questions]
    Z --> V
    
    X --> AA[Generate Final Confirmation]
    AA --> AB{User confirms final info?}
    AB --> |Yes| AC[Generate Structured JSON Output]
    AB --> |No| AD[Return to clarification]
    AD --> L
    
    AC --> AE[Return to Frontend]
    AE --> AF[Store conversation in DB]
    AF --> AG[End]
```

## 🎯 Detailed Flow States

### 1. Initial Reception State
```mermaid
stateDiagram-v2
    [*] --> MessageReceived
    MessageReceived --> StoreInDB: Store conversation history
    StoreInDB --> IntentAnalysis: Retrieve session context
```

### 2. Analysis State
```mermaid
stateDiagram-v2
    IntentAnalysis --> EntityExtraction: Parse user intent
    EntityExtraction --> ConfidenceScoring: Extract key entities
    ConfidenceScoring --> DecisionMatrix: Generate confidence score
    DecisionMatrix --> HighConfidence: Score > 0.8
    DecisionMatrix --> MediumConfidence: Score 0.5-0.8
    DecisionMatrix --> LowConfidence: Score < 0.5
```

### 3. High Confidence Path
```mermaid
stateDiagram-v2
    HighConfidence --> GenerateSummary: Create proposal
    GenerateSummary --> AskConfirmation: Present to user
    AskConfirmation --> UserResponse: Wait for feedback
    UserResponse --> Confirmed: User agrees
    UserResponse --> NotConfirmed: User disagrees
    NotConfirmed --> ClarificationLoop: Get more details
    ClarificationLoop --> IntentAnalysis: Re-analyze
```

### 4. Medium Confidence Path
```mermaid
stateDiagram-v2
    MediumConfidence --> AskQuestions: 1-2 targeted questions
    AskQuestions --> CollectAnswers: Get user responses
    CollectAnswers --> UpdateInfo: Merge with existing data
    UpdateInfo --> Reassess: New confidence score
    Reassess --> DecisionMatrix: Evaluate new score
```

### 5. Low Confidence Path
```mermaid
stateDiagram-v2
    LowConfidence --> ExplainIssue: Clear communication
    ExplainIssue --> ProposeOptions: Suggest alternatives
    ProposeOptions --> GetUserChoice: Wait for selection
    GetUserChoice --> UpdateObjective: Refine intent
    UpdateObjective --> IntentAnalysis: Re-analyze with new context
```

### 6. Validation and Output State
```mermaid
stateDiagram-v2
    Confirmed --> ValidateInfo: Check minimum requirements
    ValidateInfo --> InfoComplete: All fields filled
    ValidateInfo --> InfoMissing: Missing required fields
    InfoMissing --> AskMissing: Request remaining info
    AskMissing --> CollectAnswers: Get responses
    CollectAnswers --> ValidateInfo: Re-validate
    InfoComplete --> GenerateJSON: Create structured output
    GenerateJSON --> ReturnResponse: Send to frontend
    ReturnResponse --> [*]: End process
```

## 📊 Decision Matrix Visualization

### Confidence-Based Routing
```mermaid
pie
    title Confidence Distribution
    "High (>0.8)" : 45
    "Medium (0.5-0.8)" : 35
    "Low (<0.5)" : 20
```

### Objective Mapping
```mermaid
graph LR
    A[User Intent] --> B{Objective Type}
    B --> C[generate_video]
    B --> D[schedule_post]
    B --> E[analyze_trends]
    B --> F[faq_response]
    B --> G[generate_report]
    
    C --> H[video-scriptor]
    D --> I[post-scheduler]
    E --> J[trend-scanner]
    F --> K[faq-responder]
    G --> L[analytics-reporter]
```

## 🛠 Process Flow with Error Handling

```mermaid
graph TD
    A[Start] --> B[Process Message]
    B --> C{AI Service Available?}
    C --> |Yes| D[Use Azure OpenAI]
    C --> |No| E[Fallback to Rule-Based]
    D --> F[Analyze Intent]
    E --> F
    F --> G{Intent Clear?}
    G --> |Yes| H[Extract Entities]
    G --> |No| I[Ask Clarifying Questions]
    I --> J[Get More Info]
    J --> F
    H --> K[Validate Information]
    K --> L{All Required Info?}
    L --> |Yes| M[Generate Response]
    L --> |No| N[Request Missing Info]
    N --> O[Update Conversation]
    O --> K
    M --> P[Return JSON to Frontend]
    P --> Q[End]
```

## 📈 Monitoring and Feedback Loop

```mermaid
graph LR
    A[User Interaction] --> B[Process Conversation]
    B --> C[Store Metrics]
    C --> D[Analyze Performance]
    D --> E{Performance OK?}
    E --> |Yes| F[Continue Operations]
    E --> |No| G[Adjust AI Parameters]
    G --> H[Update Prompts]
    H --> B
    F --> I[Generate Reports]
    I --> J[Dashboard Updates]
```

## 🎨 Response Generation Flow

```mermaid
graph TD
    A[Collected Information] --> B{Status}
    B --> |Ready| C[Generate Confirmation]
    B --> |Clarification Needed| D[Generate Question]
    C --> E[Add Viral Suggestions]
    D --> E
    E --> F[Apply Tone Guidelines]
    F --> G[Add Emojis]
    G --> H[Localize to Spanish]
    H --> I[Return to User]
```

## 🔧 Technical Implementation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant A as Azure OpenAI
    participant D as Database

    U->>F: Send message
    F->>B: POST /api/agents/front-desk
    B->>D: Get conversation history
    B->>A: Intent analysis request
    A-->>B: Intent + confidence score
    B->>A: Entity extraction request
    A-->>B: Extracted entities
    B->>B: Validate information
    B->>D: Store conversation
    B-->>F: JSON response
    F-->>U: Display agent response
```

This flowchart documentation provides a comprehensive visual representation of how the Front Desk Agent processes user messages, makes decisions based on confidence scores, and routes requests to specialized agents while maintaining a guided, coaching-oriented conversation.