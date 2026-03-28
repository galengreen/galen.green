# Lessons

- Before changing performance-related behavior, confirm whether the current behavior is intentional product UX. In this repo, preloading and mounting both theme image variants can be deliberate so theme switching feels instant.
- When changing Payload `upload.imageSizes`, verify how focal-point resizing interacts with the new config. Square `width`/`height` targets plus focal-point handling can silently crop every derivative to a square.
