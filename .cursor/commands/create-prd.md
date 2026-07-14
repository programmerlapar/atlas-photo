You are a Senior Product Manager + Senior UX/UI Architect.

Your task:
Create a **full Product Requirement Document (PRD)** that focuses on **product vision, user needs, and UI/UX design**. This includes generating a complete PRD with Landing/Home Page Layout Proposal and Background Design Proposal sections.

**IMPORTANT:** This PRD must be generated **section by section** using a structured todo list workflow. You will:

1. Create a todo list with all 17 sections first
2. Work through each section sequentially, marking them as complete as you go
3. Write each completed section to PRD.md incrementally
4. Verify all sections are complete before finalizing

Technical implementation details are handled separately by the implementation plan generator.

**SCOPE CLARIFICATION:**

- ✅ **FOCUS:** Product requirements, user experience, UI/UX design, visual systems
- ✅ **BE DETAILED:** UI components, design tokens, user flows, visual hierarchy, engagement patterns
- ❌ **AVOID:** Deep technical implementation details (package versions, config files, dependencies)
- ❌ **AVOID:** Detailed tech stack justifications (high-level framework recommendations only)
- ℹ️ **NOTE:** Technical implementation (how to build) is handled by `generate_v2_apple.mdc` - keep PRD focused on **what to build and why**

---

APP CONTEXT
{Name of the app}:
{Explain what the app does, target users, purpose, etc.}

---

PHASE 1 — ANALYZE THE CONTEXT

1. Identify:
   • The app category (choose one: Productivity / Finance / Social / Marketplace / Creator Tools / AI Assistants / Health / etc.)
   • The industry context (B2C / B2B SaaS / Enterprise / Consumer + prosumer)
   • User persona (primary & secondary) - Include demographics, goals, pain points, tech proficiency
   • Problem statement(s) - What problems does this solve? Why now?
   • JTBD (Jobs To Be Done) - What jobs are users hiring this product to do?
   • Why this product should exist now (market timing / trend opportunity)

PHASE 2 — DETERMINE THE IDEAL ENGAGEMENT MODEL (UI/UX STRATEGY)
Based on the app category, choose:
• The best **user engagement flow** (Onboarding → Auth → Home → Core task)
• Whether the app should use: - A landing page (marketing focus), OR - A home screen (functional app start), OR - Dashboard (for enterprise / SaaS / data-driven products)
• Onboarding format (minimal / interactive / progressive disclosure)
• Authentication type: - Email/password - OAuth (Google / Apple / Microsoft) - Passwordless (magic link) - SSO (enterprise-oriented)

Describe in detail:
• First session flow (brand impression + guidance) - What does the user see first? - How do we create trust and excitement? - What guidance do we provide?
• Returning session flow (speed to task completion) - How do we get users to their task quickly? - What shortcuts or personalized elements help?
• Engagement touchpoints throughout the journey
• Trust signals and social proof elements

PHASE 3 — VISUAL & UI SYSTEM DECISION
Choose the UI direction for this app (must pick ONE):

OPTION A: **iOS 26 Liquid Live UI System** (Apple "Liquid Glass")
• Depth, glassy surfaces, motion fluidity, holographic highlight
• Translucent materials with backdrop blur
• Layered elevation system with blur and tint opacity
• Friendly, large corner radii
• Contextual motion (sub-200ms for small UI, 240-320ms for sheets)

OPTION B: **Enterprise Premium UI**
• Minimalistic, structured spacing, subtle shadows, typographic hierarchy
• High contrast, clear information architecture
• Professional color palette
• Structured grid systems

Then explain WHY that design system fits the category and user personas.

PHASE 4 — DETAILED UI/UX SPECIFICATIONS
For the chosen design system, provide comprehensive UI/UX specifications:

**Design Tokens & Visual System:**
• Primary Color (with HEX + RGB + usage rules - where to use, when not to use)
• Secondary Color
• Accent Color
• Neutral Gray Scale (10 levels with usage contexts)
• Component radius styles (specify exact values: buttons, cards, modals, inputs)
• Spacing scale (4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 - with usage examples)
• Typography scale (headings, body, captions - with line heights and weights)
• Shadow & Elevation styles (layers, when to use each)
• Interaction feedback (hover states, pressed states, motion curves, transition durations)
• Border styles (hairline, regular, when to use)
• Glass/blur effects (if Liquid Glass system - specify blur levels and tint opacities)

**Component Specifications (for each major screen/component):**
• Visual hierarchy (what draws attention first, second, third)
• Layout structure (grid system, spacing between elements)
• Component states (default, hover, active, focus, disabled, loading, error, empty)
• Interaction patterns (how users interact, what feedback they receive)
• Responsive behavior (mobile vs desktop layouts)
• Accessibility considerations (color contrast, focus states, keyboard navigation)
• Animation and motion (when things animate, how fast, what triggers)

**Screen-by-Screen UI Requirements:**
For each screen, specify:
• Layout structure and visual hierarchy
• Key components and their visual treatment
• User interactions and feedback
• Loading states and empty states
• Error handling and recovery paths
• Mobile vs desktop variations

PHASE 5 — USER FLOWS & INFORMATION ARCHITECTURE
• Information architecture diagram (how content is organized)
• User flow diagrams (primary user journeys)
• Navigation structure
• Content organization
• Feature discoverability

PHASE 6 — LANDING/HOME PAGE LAYOUT DESIGN
Based on the app category and engagement model determined in Phase 2:

1. Decide if the app **requires a Landing Page** (marketing-focused) or **Home Screen** (functional entry):
   - Landing Page = for public acquisition, trust-building, and conversion
   - Home Screen = for logged-in users performing tasks
   - Dashboard = for enterprise / SaaS / data-driven products

2. If a **Landing Page** exists or is suitable:
   - Design a **full layout concept** that drives engagement and conversion
   - Include:
     • Hero section (headline, subheadline, CTA)
     • Visual storytelling (mock illustration / animation cue)
     • Feature highlights (3–4 cards or sections)
     • Social proof (logos, testimonials, trust elements)
     • Conversion CTA (signup, join waitlist, or try demo)
     • Footer (links, contact, terms, branding)
   - Define layout spacing, hierarchy, typography, and component behavior following the chosen design system

3. If a **Home Screen** fits better:
   - Create an **engagement-first functional layout**:
     • Personalized welcome / overview area
     • Quick actions or core task shortcuts
     • Dynamic feed or status panels
     • User metrics or progress visualization
     • Persistent navigation and contextual CTA
   - Follow the PRD's tone, color tokens, and component specifications

4. Output for this phase:
   - Explain the decision (why Landing vs Home vs Dashboard)
   - Provide a **detailed wireframe description** (section-by-section layout, hierarchy, engagement triggers)
   - Include **motion / interaction ideas** consistent with the chosen design system
   - Keep it concise, readable, and implementable by a UI team

PHASE 7 — BACKGROUND DESIGN CONCEPT
Based on the PRD insights and design system:

1. Extract from the PRD:
   • Product name, brand values, and emotional tone
   • Chosen design system (Liquid Glass or Enterprise Premium)
   • Primary, secondary, and accent color tokens
   • Target audience (from Personas section)
   • UI/UX Strategy and visual hierarchy preferences

2. Design a dynamic background concept for the landing/home page that:
   • Reinforces the brand's mood and trust
   • Creates depth and engagement without distracting from core content
   • Scales responsively for desktop, tablet, and mobile
   • Can be implemented with Tailwind CSS + ShadCN UI styling

3. Include:
   - **Background Type:** gradient / glass blur / geometric pattern / subtle texture / animated particles / canvas motion
   - **Color Composition:** which colors to blend and how (linear, radial, layered blur, etc.)
   - **Depth Layers:** how to separate hero, mid, and base layers (z-index or blur intensity)
   - **Motion Concept:** optional parallax / fade / scroll reveal / soft floating elements
   - **Implementation Hint:** Tailwind + CSS example or WebGL/Canvas idea for visual reference
   - **Accessibility Note:** ensure sufficient contrast for text and buttons

4. Output format for this phase:
   - Mood & Purpose (emotional tone and connection to product vision)
   - Color & Light Composition (color layers, gradients, opacities)
   - Depth & Motion (how layers or particles move or react to user scroll/hover)
   - Implementation Suggestion (Tailwind CSS or Canvas pseudocode for background)
   - Accessibility & Responsiveness (contrast, device adaptation, reduced motion considerations)

OUTPUT FORMAT:

---

⚙ PRODUCT REQUIREMENT DOCUMENT (PRD)

1. Overview
   - Product name and purpose
   - Target audience summary
   - Core value proposition (one-line pitch)

2. Problem Statement
   - What problems does this solve?
   - Why is this a problem now?
   - Who has this problem?

3. User Personas
   - Primary persona (detailed: demographics, goals, pain points, tech proficiency, motivations)
   - Secondary persona (if applicable)
   - User journey contexts (when/where/why do they use this?)

4. Value Proposition
   - How does this differentiate from competitors?
   - Unique selling points
   - Why would users choose this over alternatives?

5. Use Cases & User Stories
   - Use case descriptions
   - User stories in format: "As a {role}, I want to {action} so that {benefit}"
   - Prioritization of use cases

6. Main Features (with prioritization: Must / Should / Nice to Have)
   - Feature descriptions (what it does, not how it's built)
   - User value for each feature
   - Dependencies between features

7. Information Architecture
   - Content organization structure
   - Navigation hierarchy
   - Feature grouping and discoverability

8. User Flow Diagram
   - ASCII diagram showing primary user journeys
   - Decision points and branches
   - Entry points and exit points

9. UI/UX Strategy & Engagement Model
   - **Design system choice** and rationale
   - **First session flow** (detailed: what users see, how they're guided)
   - **Returning session flow** (detailed: how users get to tasks quickly)
   - **Engagement patterns** (how we keep users engaged)
   - **Trust signals** (how we build trust)
   - **Onboarding approach** (minimal/interactive/progressive - with rationale)

10. Screen Requirements (DETAILED UI/UX SPECIFICATIONS)
    For each screen, include:
    - **Layout structure** (visual hierarchy, component placement)
    - **Component specifications** (what components, how they look, states)
    - **User interactions** (what users can do, what feedback they get)
    - **Responsive behavior** (mobile vs desktop)
    - **Loading/empty/error states**
    - **Visual design notes** (colors, spacing, typography used)

    Screens to detail:
    - Landing page (if applicable)
    - Onboarding screens
    - Authentication screens (login, signup, verification, password reset)
    - Home / Dashboard
    - All core feature screens
    - Settings/profile screens

11. Non-Functional Requirements
    - Performance targets (high-level: "fast page loads", "smooth animations")
    - Security requirements (high-level: "secure authentication", "data privacy")
    - Scalability considerations (high-level: "handle X users")
    - Accessibility requirements (WCAG AA compliance, keyboard navigation, screen readers)
    - Browser/device support

12. Success Metrics / KPIs
    - User engagement metrics
    - Feature adoption metrics
    - Performance benchmarks (user-focused: time to complete task)
    - Business metrics (if applicable)

13. Tech Stack Recommendation (HIGH-LEVEL ONLY)
    - Frontend framework (Next.js / React / Vue - with brief rationale)
    - Backend approach (Amplify / Serverless / etc. - brief rationale)
    - Infrastructure (Amplify Gen 2 / Vercel / AWS - brief rationale)
    - Key libraries (UI library, state management - brief rationale)
    - **NOTE:** Detailed tech stack, dependencies, and configuration are handled by the implementation plan generator

14. Release Plan
    - MVP scope (what's in the first release)
    - Phase 2 features (what comes next)
    - Future roadmap (vision for scaling)
    - Timeline estimates (high-level, not detailed technical estimates)

15. Design System (COMPREHENSIVE)
    Include complete design system specifications:
    - **Color System:**
      - Primary colors (HEX, RGB, HSL)
      - Secondary colors
      - Accent colors
      - Neutral grayscale (10 levels with usage contexts)
      - Semantic colors (success, error, warning, info)
      - Usage rules for each color
    - **Typography System:**
      - Font families
      - Type scale (all sizes: headings, body, captions)
      - Line heights
      - Font weights
      - Usage contexts
    - **Spacing System:**
      - Base unit (typically 4 or 8)
      - Spacing scale with usage examples
      - Padding/margin patterns
    - **Component Styles:**
      - Border radius values (buttons, cards, inputs, modals)
      - Border styles (width, color, usage)
      - Shadow system (all elevation levels)
      - Blur effects (if Liquid Glass - all blur levels and tint opacities)
    - **Interaction Patterns:**
      - Hover states (visual treatment)
      - Active/pressed states
      - Focus states (accessibility)
      - Disabled states
      - Transition durations and easing curves
      - Animation timing and triggers
    - **Component Recipes** (if Liquid Glass system):
      - Glass surface classes and elevation levels
      - Hairline border patterns
      - Inner rim highlight patterns
      - Usage examples for cards, buttons, modals, etc.
    - **Responsive Breakpoints:**
      - Mobile, tablet, desktop breakpoints
      - Layout changes at each breakpoint
    - **Accessibility Standards:**
      - Color contrast requirements (4.5:1 minimum)
      - Focus indicator styles
      - Keyboard navigation patterns
      - Screen reader considerations

16. Landing/Home Page Layout Proposal
    - **Decision Rationale:** Explain why Landing Page vs Home Screen vs Dashboard (based on app category and engagement model)
    - **Layout Structure:** Section-by-section layout description
      • Hero section (headline, subheadline, CTA)
      • Visual storytelling (mock illustration / animation cue)
      • Feature highlights (3–4 cards or sections)
      • Social proof (logos, testimonials, trust elements)
      • Conversion CTA (signup, join waitlist, or try demo)
      • Footer (links, contact, terms, branding)
      OR (if Home Screen):
      • Personalized welcome / overview area
      • Quick actions or core task shortcuts
      • Dynamic feed or status panels
      • User metrics or progress visualization
      • Persistent navigation and contextual CTA
    - **Visual Hierarchy:** What draws attention first, second, third
    - **Layout Spacing:** Spacing between elements following design system
    - **Typography:** Type scale and weights used
    - **Component Behavior:** How components interact and behave
    - **Motion / Interaction Ideas:** Animation and interaction patterns consistent with design system

17. Background Design Proposal
    - **Mood & Purpose:** Emotional tone and how it connects to product vision
    - **Background Type:** gradient / glass blur / geometric pattern / subtle texture / animated particles / canvas motion
    - **Color & Light Composition:** Color layers, gradients, opacities, and how colors blend
    - **Depth Layers:** How to separate hero, mid, and base layers (z-index or blur intensity)
    - **Motion Concept:** Parallax / fade / scroll reveal / soft floating elements (if applicable)
    - **Implementation Suggestion:** Tailwind CSS or Canvas pseudocode for background reference
    - **Accessibility & Responsiveness:**
      - Contrast considerations for text and buttons
      - Device adaptation (desktop, tablet, mobile)
      - Reduced motion considerations

---

**CRITICAL WORKFLOW INSTRUCTION:**

You MUST follow this structured workflow to generate the PRD section by section:

**STEP 1 — CREATE TODO LIST FIRST**

Before starting any PRD generation, create a comprehensive todo list using the `todo_write` tool with ALL 17 sections:

1. Overview
2. Problem Statement
3. User Personas
4. Value Proposition
5. Use Cases & User Stories
6. Main Features
7. Information Architecture
8. User Flow Diagram
9. UI/UX Strategy & Engagement Model
10. Screen Requirements
11. Non-Functional Requirements
12. Success Metrics / KPIs
13. Tech Stack Recommendation
14. Release Plan
15. Design System
16. Landing/Home Page Layout Proposal
17. Background Design Proposal

Set all initial todos to "pending" status.

**STEP 2 — WORK SECTION BY SECTION**

Work through each section sequentially:

1. **Read the current PRD.md** (if it exists) to understand what's already been written
2. **Select the next pending section** from the todo list
3. **Mark that section as "in_progress"** in the todo list
4. **Generate the content** for that section following the corresponding phase and OUTPUT FORMAT specifications above
5. **Write/append the section** to `PRD.md`:
   - **For Section 1 (Overview):**
     - If `PRD.md` doesn't exist, create it with a proper header (e.g., "# Product Requirement Document") and Section 1
     - If `PRD.md` exists, read it first to understand the structure, then either append or update as needed
   - **For Sections 2-17:**
     - Append the new section to the existing `PRD.md` file
     - Maintain proper markdown structure and hierarchy
     - Use proper markdown headers: ## for section titles (e.g., "## 2. Problem Statement"), ### for subsections
     - Ensure proper spacing between sections
6. **Mark the section as "completed"** in the todo list
7. **Move to the next pending section** and repeat

**STEP 3 — SECTION GENERATION RULES**

**Phase-to-Section Mapping:**

- **Phase 1** (Analyze Context) → Sections 1-3: Overview, Problem Statement, User Personas
- **Phase 1** (Analyze Context) → Section 4: Value Proposition
- **Phase 1** (Analyze Context) → Section 5: Use Cases & User Stories
- **Phase 1** (Analyze Context) → Section 6: Main Features
- **Phase 2** (Engagement Model) → Section 9: UI/UX Strategy & Engagement Model
- **Phase 3** (Visual & UI System) → Section 9: UI/UX Strategy & Engagement Model (Design system choice)
- **Phase 3** (Visual & UI System) → Section 15: Design System
- **Phase 4** (UI/UX Specifications) → Section 10: Screen Requirements
- **Phase 4** (UI/UX Specifications) → Section 15: Design System
- **Phase 5** (User Flows & IA) → Sections 7-8: Information Architecture, User Flow Diagram
- **Phase 6** (Landing/Home Layout) → Section 16: Landing/Home Page Layout Proposal
- **Phase 7** (Background Design) → Section 17: Background Design Proposal
- **Additional Sections** → Sections 11-14: Non-Functional Requirements, Success Metrics, Tech Stack, Release Plan

For each section:

- Follow the corresponding phase instructions and OUTPUT FORMAT specifications above
- Use the detailed OUTPUT FORMAT specifications for structure
- Ensure content is comprehensive and detailed
- Maintain consistency with previously written sections
- Reference related sections when appropriate (e.g., Design System references in other sections)

**STEP 4 — COMPLETION CHECK**

After completing all 17 sections:

1. **Verify all todos are marked "completed"**
2. **Read the final PRD.md** to ensure:
   - All 17 sections are present and complete
   - Proper markdown structure throughout
   - No missing content or placeholders
   - Consistent formatting and style
3. **Provide final confirmation**:
   - ✅ PRD.md has been generated/updated successfully with all 17 sections
   - Brief summary of what was generated
   - Note any sections that may need refinement or expansion

**IMPORTANT NOTES:**

- Work through sections sequentially - do not skip ahead
- Only mark a section as completed after it has been written to PRD.md
- If you need to reference information from earlier sections, read the PRD.md file to ensure consistency
- Maintain the section order as specified in the OUTPUT FORMAT
- Each section should be comprehensive and ready for implementation teams
