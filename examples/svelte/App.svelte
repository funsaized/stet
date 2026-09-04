<script lang="ts">
  import { circle, mark, sticky } from "stet/svelte";
  import "stet/style.css";
</script>

<h1>Create an account</h1>
<input use:circle={{ stroke: "crimson" }} type="email" aria-label="Email" />
<button use:sticky={{ text: "save this", side: "right" }}>Save</button>
<span use:mark={{ kind: "right" }}>Accessible</span>
