---name: ai-contentdescription: Generate and manage AI-powered content for mantras, articles, and wellness contentlicense: MITcompatibility: opencodemetadata:  audience: developers  domain: ai-content  project: arunachala-web---
## What I do
- Generate daily mantras using OpenAI API
- Create SEO-optimized articles for yoga and wellness
- Implement content moderation and quality control
- Set up automated content scheduling
- Manage content templates and prompts
- Implement multilingual content support
- Create content personalization algorithms
- Set up content analytics and feedback

## When to use me
Use this when you need to:
- Generate daily inspirational content
- Create blog posts about yoga/therapy
- Implement automated content workflows
- Set up content personalization
- Create content moderation systems
- Implement multilingual content
- Generate SEO-optimized articles
- Set up content scheduling

## My patterns for Arunachala Web
### Daily Mantra Generation
- Use OpenAI API with custom prompts
- Generate content in multiple languages (Spanish, English)
- Store generated content in PostgreSQL
- Schedule daily generation with cron jobs
- Distribute via WhatsApp Business API
- Display on website with attractive formatting

### Content Categories
- **Mantras**: Short inspirational quotes (2-3 sentences)
- **Articles**: Long-form SEO content (800-1500 words)
- **Wellness Tips**: Practical advice (150-300 words)
- **Class Descriptions**: Yoga and therapy info (100-200 words)
- **Instructor Bios**: Professional profiles (200-300 words)

### Content Workflow
```python
# Generation Workflow
1. Trigger: Daily schedule (mantra) / user request (articles)
2. AI Generation: OpenAI API with specific prompts
3. Quality Check: Automated moderation + manual review option
4. Storage: Save to database with metadata
5. Distribution: Website, WhatsApp, email newsletter
6. Analytics: Track engagement and user feedback
```

### Prompt Templates
```
Mantra Template:
"Generate a daily inspirational mantra about [topic] for yoga practitioners. 
Keep it to 2-3 sentences, make it uplifting and spiritual. 
Language: [language]"

Article Template:
"Write a SEO-optimized article about [topic] for yoga website. 
Include: introduction, 5-7 key points, conclusion. 
Target keywords: [keywords]. Language: [language]"
```

## Technology specifics
- OpenAI API (GPT-4) for content generation
- PostgreSQL for content storage
- n8n for workflow automation
- Meta WhatsApp API for distribution
- Content moderation with OpenAI + custom filters
- SEO optimization with keyword research
- Multi-language support with translation APIs

## Integration Points
- Daily generation scheduled via n8n
- WhatsApp Business API for mantra distribution
- Website API for content display
- Email newsletter integration
- Social media posting automation
- Content analytics dashboard