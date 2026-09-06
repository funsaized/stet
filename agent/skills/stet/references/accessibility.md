# Meaning, interaction and motion

Stet's SVG is decorative. A meaningful circle/check/cross needs a `description`
unless the meaning is already conveyed adequately by adjacent application text.
Sticky `text` and arrow `label` are HTML linked with aria-describedby; an arrow
label describes its destination. Avoid repetitive label/description narration.
Check the target's resulting accessible description in the browser.

Dangerous actions need accurate, concise consequences. Preserve application
warnings, confirmations and validation. An ephemeral note is not the only safety
instruction. Never change button type, disabled state, focus order, handlers or
form ownership merely to add a mark. Notes ignore pointer events and cannot host
interactive confirmation controls. Do not use color as the sole verdict.

Leave room for text and inspect narrow layouts; notes do not avoid neighboring
controls. Explicit sticky sides are preferences and may flip. Keep motion still
unless the user asks otherwise. Reduced motion is honored live. Set a fixed seed
for reproducible screenshots; inspect text contrast on the actual background and
use existing app checks for keyboard and focus behavior.
