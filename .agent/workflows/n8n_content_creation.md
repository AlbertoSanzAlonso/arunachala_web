# N8N Content Creation & Filtering

## Overview
This workflow describes how to create content via the API as an AI Agent (ArunachalaBot) and how the author filtering works in the Content Manager.

## AI Agent User
- **Name**: ArunachalaBot
- **ID**: 4
- **Email**: ai_agent@arunachala.com
- **Role**: Admin (or specialized Agent role)

## Creating Content as Agent (n8n)
To attribute content to the AI Agent, send a POST request to `/api/content` with the following field in the JSON body:

```json
{
  "title": "Your Generated Article",
  "type": "article",
  "category": "yoga",
  "author_id": 4,  // CRITICAL: Force correct attribution
  "status": "published",
  ...
}
```

The backend will respect this `author_id` if the value is provided.

## Filtering in Content Manager
The Content Manager now includes an "Author" filter:
- **All**: Show all content.
- **Human**: Show content where `author_id != 4`.
- **AI (Bot)**: Show content where `author_id == 4` or name is "ArunachalaBot".

This allows easy separation of manually written content vs automated/generated content.
