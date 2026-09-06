<script lang="ts">
let { enabled = true, destination = 1 }: { enabled?: boolean; destination?: number } = $props();
let saved = $state(true);
function remove() { if (confirm('Delete saved settings?')) saved = false; }
</script>
<main><h1>Workspace settings</h1>
<label for="workspace-name">Workspace name</label><input id="workspace-name" value="Sketchbook" required />
<button id="save" type="submit">Save settings</button>
<button id="delete" type="button" aria-describedby="native-warning" onclick={remove}>Delete saved settings</button>
<p id="native-warning">Deletes saved settings on this device. Your account and documents are kept.</p>
{#if destination > 0}{#key destination}<p id="consequences">You can set your preferences again after deletion.</p>{/key}{/if}
<output id="status">{saved ? 'Settings saved' : 'Saved settings deleted'}</output>
<section><h2>Form examples</h2><label for="good-email">Email</label><input id="good-email" type="email" /><input id="bad-email" placeholder="Email" /></section>
<section><h2>Included features</h2><p id="local-feature">Settings stay on this device.</p><p id="export-feature">Use Save settings to keep your preferences.</p></section>
</main>
