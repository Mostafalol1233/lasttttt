# Bimora Blog Pro - Design Guidelines

## Design Approach

**Reference-Based Approach** drawing inspiration from Medium, Ghost, and Notion's content-first philosophy, adapted for a modern Arabic/English bilingual blog with premium features.

**Core Principles:**
- Content supremacy: Reading experience drives all decisions
- Refined elegance: Sophisticated without being minimal
- Purposeful density: Rich with features but organized hierarchically
- Bilingual harmony: RTL/LTR layouts that feel native, not mirrored

---

## Typography System

**Font Families:**
- **Primary (Latin):** 'Inter' for UI elements, 'Crimson Pro' for article headlines
- **Arabic:** 'IBM Plex Sans Arabic' for all Arabic content
- **Monospace:** 'JetBrains Mono' for code blocks in technical articles

**Type Scale:**
- Hero Headlines: text-5xl md:text-6xl lg:text-7xl, font-bold, leading-tight
- Article Titles: text-3xl md:text-4xl, font-bold, leading-snug
- Section Headers: text-2xl md:text-3xl, font-semibold
- Card Titles: text-xl font-semibold
- Body Text: text-base md:text-lg, leading-relaxed (optimal reading: 65-75 characters per line)
- Meta Info: text-sm font-medium
- Captions: text-xs uppercase tracking-wide

**Reading Experience:**
- Article content: max-w-prose (65ch) centered
- Line height: leading-relaxed (1.75) for body text
- Paragraph spacing: space-y-6 for article content

---

## Layout & Spacing System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24

**Container Strategy:**
- Full-width sections: w-full with inner max-w-7xl mx-auto
- Content sections: max-w-6xl mx-auto px-4 md:px-8
- Article content: max-w-prose mx-auto
- Sidebar width: w-full lg:w-80 (fixed sidebar on desktop)

**Vertical Rhythm:**
- Section padding: py-12 md:py-20 lg:py-24
- Component spacing: space-y-8 md:space-y-12
- Card grids: gap-6 md:gap-8
- Compact sections (ribbon, widgets): py-6 md:py-8

**Grid Systems:**
- Article cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Featured + grid: Featured spans 2 columns on desktop
- Sidebar layout: Main content (lg:col-span-8) + Sidebar (lg:col-span-4)

---

## Component Library

### Navigation Header
- Fixed/sticky header: h-16 md:h-20
- Logo on left (RTL: right), navigation center, language/dark mode toggle on right (RTL: left)
- Navigation links with subtle underline on hover
- Translucent backdrop blur when scrolled: backdrop-blur-md
- Mobile: Hamburger menu with slide-in drawer

### Hero Section (Home Page)
- Height: min-h-[70vh] md:min-h-[80vh]
- Featured article overlay with gradient treatment
- Large hero image with article preview card positioned bottom-left (RTL: bottom-right)
- Card includes: Category badge, title (text-4xl), summary, author info, CTA button
- Button on image: backdrop-blur-lg with semi-transparent treatment

### Article Cards
- Aspect ratio: Image 16:9 or 3:2
- Card structure: Image → Category badge (absolute top-left) → Content area
- Content includes: Tags (pills), Title, Summary (2-3 lines, line-clamp-3), Meta row (author, date, reading time)
- Hover state: Subtle lift (transform scale-105) with shadow increase
- Border treatment: Subtle border or contained shadow

### Events Ribbon
- Horizontal scrolling container: overflow-x-auto with custom scrollbar
- Height: h-16 md:h-20
- Event items: Inline cards with icon, title, date
- Smooth scroll snap: snap-x snap-mandatory
- Position: Below header or above footer

### Sidebar Widgets
- Widget containers: Contained cards with subtle borders
- Widget spacing: space-y-6
- "Recent Posts": Compact list with thumbnail (80x80), title, date
- "Popular Tags": Pill badges with counts
- "Most Viewed": Numbered list with view counts
- "Bimora's Picks": Featured styling with star/badge icon

### Article Page Layout
- Header section: Title, author card (avatar, name, date), cover image (full-width or constrained)
- Content area: Prose styling with enhanced typography
- Table of Contents: Sticky sidebar on desktop (if article is long)
- Related Articles: 3-column grid at bottom
- Comments Section: Threaded layout with avatar, name, content, timestamp

### Search & Filter Bar
- Prominent placement below header on home
- Search input with icon, category dropdown, sort toggle
- Pill-style active filters with dismiss buttons
- Mobile: Expandable/collapsible interface

### Admin Dashboard
- Sidebar navigation: Fixed left (RTL: right), w-64
- Dashboard cards: Grid of statistics with large numbers, icons, trend indicators
- Post editor: Split view (markdown editor + live preview)
- Tables: Sortable columns, row actions (edit/delete), pagination controls
- Forms: Stacked labels, full-width inputs, prominent submit buttons

### Category Filters
- Horizontal scrolling pills on mobile, grid on desktop
- Active state: Filled treatment
- Include "All" option
- Icon + label for each category

### Comments System
- Comment card: Avatar (left/right based on locale), name, timestamp, content
- Reply button beneath each comment
- Nested replies: Indented with connecting lines
- Input form: Avatar, textarea, submit button

### Footer
- Multi-column layout: About, Quick Links, Categories, Newsletter
- Newsletter: Heading, description, email input + submit
- Social icons row
- Copyright: "© 2025 Bimora Blog Pro — All Rights Reserved" centered below
- Responsive: Stacks to single column on mobile

---

## Images & Media

**Large Hero Image:** Yes - Featured article on home page with full-bleed hero treatment

**Image Placement:**
- Hero Section: Large landscape image (1920x1080 recommended) as background
- Article Cards: Landscape thumbnails (16:9 ratio, 800x450)
- Article Cover: Full-width banner (1200x600) or constrained (max-w-4xl)
- Sidebar Thumbnails: Small squares (80x80)
- Author Avatars: Circular (40x40 in cards, 64x64 in article header)
- Admin Dashboard: Icons instead of images for statistics

**Image Treatment:**
- Subtle border-radius: rounded-lg for cards, rounded-xl for hero
- Lazy loading: All images below fold
- Aspect ratio containers: Prevent layout shift
- Overlay gradients: On hero and featured cards for text legibility

---

## Animation & Interactions

**Minimal Animation Strategy:**
- Page transitions: Subtle fade (200ms)
- Card hover: Scale 1.02 + shadow increase (300ms ease-out)
- Button hover: No special treatment (uses Button component defaults)
- Scroll reveals: Fade-up for article cards on initial load only
- Dark mode toggle: Smooth theme transition (300ms)
- Mobile menu: Slide-in drawer (250ms)

**No Animations For:**
- Buttons on hero images (blur backdrop only)
- Text content
- Form interactions
- Sidebar widgets

---

## Responsive Breakpoints

- Mobile: Base styles (320px+)
- Tablet: md: (768px+) - 2-column grids, sidebar appears
- Desktop: lg: (1024px+) - 3-column grids, full sidebar
- Wide: xl: (1280px+) - Max content width constraints

**Mobile-Specific:**
- Stack all grids to single column
- Collapsible sidebar widgets (accordion style)
- Bottom navigation for key actions
- Horizontal scroll for events ribbon and category filters

---

## Bilingual (RTL/LTR) Considerations

- Use `dir="rtl"` attribute for Arabic
- Flip layouts: Navigation, sidebar positions, card image positions
- Typography: Increase line-height slightly for Arabic (leading-loose)
- Maintain visual balance: Elements should feel mirrored, not just reversed
- Icons: Some icons may need flipping (arrows, directional indicators)

---

**Implementation Note:** This design creates a sophisticated, content-rich blog platform that balances visual appeal with reading comfort. The multi-column grids, featured sections, and sidebar create information density without overwhelming users. Every component serves a clear purpose in the content discovery and consumption journey.