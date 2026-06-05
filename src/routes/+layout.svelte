<!-- src/routes/+layout.svelte -->
<!-- ERSETZE die bestehende Navbar mit dieser Version. Den Rest deines Layouts (Bootstrap-Import etc.) beibehalten. -->

<script>
	import { enhance } from '$app/forms';

	let { data, children } = $props();
	let user = $derived(data.user);
</script>

<!-- Bootstrap CSS -->
<link
	rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
/>
<!-- Bootstrap Icons -->
<link
	rel="stylesheet"
	href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
/>

<nav class="navbar navbar-dark bg-primary">
	<div class="container">
		<a class="navbar-brand fw-bold" href="/">StudySpot ZHAW</a>
		<div class="d-flex align-items-center gap-3">
			<a class="nav-link text-white" href="/spots">Spots</a>

			{#if user}
				<!-- Eingeloggt: Spot eintragen + Logout -->
				<a class="nav-link text-white" href="/spots/create">Spot eintragen</a>
				<form method="POST" action="/login?/logout" use:enhance class="mb-0">
					<button type="submit" class="btn btn-outline-light btn-sm"> Abmelden </button>
				</form>
			{:else}
				<!-- Nicht eingeloggt: Login-Link -->
				<a class="btn btn-outline-light btn-sm" href="/login">Anmelden</a>
			{/if}
		</div>
	</div>
</nav>

{@render children()}
