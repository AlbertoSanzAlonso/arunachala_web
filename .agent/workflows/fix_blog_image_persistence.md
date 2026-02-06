---
description: Fix Blog Image Persistence in n8n
---

# Fix Blog Image Persistence in n8n

The automated blog generation workflow currently saves temporary URLs (from DALL-E or KIE.ai) into the database. These URLs expire quickly (1 hour for DALL-E), causing images to disappear.

To fix this, we need to modify the n8n workflow to:

1.  **Download the Image:**
    *   Add an HTTP Request node after image generation.
    *   Method: GET.
    *   URL: The temporary URL from the AI provider.
    *   Response Format: File (Binary).

2.  **Save/Upload the Image:**
    *   **Option A (API Upload):** Use an HTTP Request (POST) to the backend `api/upload` endpoint (check existing endpoints in `activities.py` or create a new one for generic uploads).
    *   **Option B (Local File Write):** Use the "Write Binary File" node to save directly to the `static/uploads` directory (requires docker volume mapping visibility).

3.  **Update Database Insert:**
    *   Use the *new* local/permanent URL returned by the upload process (e.g., `/static/uploads/image.jpg`) instead of the temporary AI URL.

## Current State
- Workflow `arunachala-blog-auto.json` is functional and inserts articles with translations.
- `thumbnail_url` is currently receiving the temporary URL.

## Next Steps
- Implement step 2 (decide between API Upload or File Write).
- Update the Insert Query to use the permanent path.
