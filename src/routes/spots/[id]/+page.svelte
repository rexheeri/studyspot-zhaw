<script>
	import { enhance } from '$app/forms';
	import { onMount, tick } from 'svelte';

	let { data, form } = $props();

	const laermBadge = { ruhig: 'success', mittel: 'warning', laut: 'danger' };
	const laermIcon = { ruhig: 'mute', mittel: 'down', laut: 'up' };

	function formatDatum(datum) {
		return new Date(datum).toLocaleDateString('de-CH', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	let karteAnzeigen = $state(false);
	let mapContainer = $state(null);
	let karteInitialisiert = false;

	async function toggleKarte() {
		karteAnzeigen = !karteAnzeigen;
		if (karteAnzeigen && !karteInitialisiert) {
			await tick();
			initKarte();
		}
	}

	function ladeLeafletScript() {
		return new Promise((resolve) => {
			if (window.L) { resolve(); return; }
			const script = document.createElement('script');
			script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
			script.onload = resolve;
			document.head.appendChild(script);
		});
	}

	async function initKarte() {
		await ladeLeafletScript();

		const res = await fetch(
			`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.spot.adresse)}&limit=1`,
			{ headers: { 'Accept-Language': 'de' } }
		);
		const results = await res.json();
		if (!results.length) return;

		const lat = parseFloat(results[0].lat);
		const lon = parseFloat(results[0].lon);
		const L = window.L;

		const map = L.map(mapContainer).setView([lat, lon], 16);
		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);
		L.marker([lat, lon]).addTo(map).bindPopup(data.spot.name).openPopup();

		karteInitialisiert = true;
	}

	onMount(async () => {
		if (window.innerWidth >= 768) {
			karteAnzeigen = true;
			await tick();
			initKarte();
		}
	});
</script>

<svelte:head>
	<title>{data.spot.name} – StudySpot ZHAW</title>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="container py-5" style="max-width: 800px;">
	<!-- Bild -->
	{#if data.spot.bildUrl}
		<img
			src={data.spot.bildUrl}
			alt={data.spot.name}
			class="w-100 rounded mb-4"
			style="max-height: 350px; object-fit: cover;"
		/>
	{/if}

	<!-- Titel & Adresse -->
	<h1 class="mb-1">{data.spot.name}</h1>
	<p class="text-muted mb-3">
		<i class="bi bi-geo-alt me-1"></i>{data.spot.adresse}
	</p>

	<!-- Badges -->
	<div class="d-flex flex-wrap gap-2 mb-4">
		<span class="badge bg-{laermBadge[data.spot.laerm] ?? 'secondary'}">
			<i class="bi bi-volume-{laermIcon[data.spot.laerm] ?? 'up'} me-1"></i>{data.spot.laerm}
		</span>
		{#if data.spot.wlan}
			<span class="badge bg-primary"><i class="bi bi-wifi me-1"></i>WLAN</span>
		{:else}
			<span class="badge bg-secondary"><i class="bi bi-wifi-off me-1"></i>Kein WLAN</span>
		{/if}
		{#if data.spot.steckdosen}
			<span class="badge bg-primary"><i class="bi bi-plug me-1"></i>Steckdosen</span>
		{:else}
			<span class="badge bg-secondary"><i class="bi bi-plug me-1"></i>Keine Steckdosen</span>
		{/if}
	</div>

	<!-- Beschreibung -->
	{#if data.spot.beschreibung}
		<p class="mb-4">{data.spot.beschreibung}</p>
	{/if}

	<!-- Karte -->
	<div class="mb-5">
		<!-- Toggle-Button nur auf Mobile -->
		<button
			type="button"
			class="btn btn-outline-secondary btn-sm mb-2 d-md-none"
			onclick={toggleKarte}
		>
			<i class="bi bi-map me-1"></i>{karteAnzeigen ? 'Karte ausblenden' : 'Karte anzeigen'}
		</button>

		<div
			bind:this={mapContainer}
			style="height: 300px; border-radius: 8px; overflow: hidden; {karteAnzeigen ? '' : 'display: none;'}"
			class="d-md-block"
		></div>
	</div>

	<hr />

	<!-- Bewertungen -->
	<h2 class="h4 mt-4 mb-3">Bewertungen</h2>

	{#if data.reviews.length === 0}
		<p class="text-muted">Noch keine Bewertungen.</p>
	{:else}
		<div class="d-flex flex-column gap-3 mb-4">
			{#each data.reviews as review}
				<div class="card shadow-sm">
					<div class="card-body">
						<div class="d-flex justify-content-between align-items-center mb-1">
							<strong>{review.autorName}</strong>
							<small class="text-muted">{formatDatum(review.erstelltAm)}</small>
						</div>
						<div class="text-warning mb-2" aria-label="{review.sterne} von 5 Sternen">
							{'★'.repeat(review.sterne)}{'☆'.repeat(5 - review.sterne)}
						</div>
						<p class="mb-0">{review.kommentar}</p>
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Review-Formular -->
	<h3 class="h5 mt-4 mb-3">Bewertung abgeben</h3>

	{#if form?.success}
		<div class="alert alert-success">
			<i class="bi bi-check-circle me-2"></i>Danke für deine Bewertung!
		</div>
	{/if}
	{#if form?.error}
		<div class="alert alert-danger">{form.error}</div>
	{/if}

	<form method="POST" use:enhance class="card shadow-sm p-4 mb-5">
		<div class="mb-3">
			<label for="autorName" class="form-label">Name</label>
			<input type="text" id="autorName" name="autorName" class="form-control" required />
		</div>
		<div class="mb-3">
			<label for="sterne" class="form-label">Bewertung</label>
			<select id="sterne" name="sterne" class="form-select" required>
				<option value="5">★★★★★ – Ausgezeichnet</option>
				<option value="4">★★★★☆ – Gut</option>
				<option value="3">★★★☆☆ – Befriedigend</option>
				<option value="2">★★☆☆☆ – Schlecht</option>
				<option value="1">★☆☆☆☆ – Sehr schlecht</option>
			</select>
		</div>
		<div class="mb-3">
			<label for="kommentar" class="form-label">Kommentar</label>
			<textarea id="kommentar" name="kommentar" class="form-control" rows="3" required></textarea>
		</div>
		<button type="submit" class="btn btn-primary">
			<i class="bi bi-send me-1"></i>Bewertung absenden
		</button>
	</form>

	<a href="/spots" class="btn btn-outline-secondary">
		<i class="bi bi-arrow-left me-1"></i>Zurück zur Übersicht
	</a>
</div>
