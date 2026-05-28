<script>
	import { enhance } from '$app/forms';
	import { onMount, tick } from 'svelte';
	import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
	import 'mapbox-gl/dist/mapbox-gl.css';

	let { data, form } = $props();

	const laermBadge = { ruhig: 'success', mittel: 'warning text-dark', laut: 'danger' };
	const laermIcon = { ruhig: 'mute', mittel: 'down', laut: 'up' };
	const statusBadge = { ruhig: 'success', mittel: 'warning', voll: 'danger' };
	const statusIcon = { ruhig: '🟢', mittel: '🟡', voll: '🔴' };

	function formatDatum(datum) {
		return new Date(datum).toLocaleDateString('de-CH', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	const adresse =
		data.spot.adresse ||
		[data.spot.strasse, data.spot.plz && data.spot.ort
			? `${data.spot.plz} ${data.spot.ort}`
			: data.spot.ort]
			.filter(Boolean)
			.join(', ');

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

	async function initKarte() {
		let lng = data.spot.lng;
		let lat = data.spot.lat;

		if (!lat || !lng) {
			try {
				const res = await fetch(
					`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}&limit=1`,
					{ headers: { 'Accept-Language': 'de' } }
				);
				const results = await res.json();
				if (!results.length) return;
				lat = parseFloat(results[0].lat);
				lng = parseFloat(results[0].lon);
			} catch {
				return;
			}
		}

		const mapboxgl = (await import('mapbox-gl')).default;
		mapboxgl.accessToken = PUBLIC_MAPBOX_TOKEN;

		const map = new mapboxgl.Map({
			container: mapContainer,
			style: 'mapbox://styles/mapbox/streets-v12',
			center: [lng, lat],
			zoom: 15
		});

		map.addControl(new mapboxgl.NavigationControl(), 'top-right');

		const el = document.createElement('div');
		el.innerHTML = `<i class="bi bi-geo-alt-fill" style="color:white;font-size:16px;line-height:1;pointer-events:none;"></i>`;
		Object.assign(el.style, {
			width: '36px',
			height: '36px',
			background: '#0d6efd',
			borderRadius: '50%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			boxShadow: '0 2px 10px rgba(13,110,253,0.45)',
			transition: 'transform 200ms cubic-bezier(0.23,1,0.32,1)',
			cursor: 'pointer'
		});
		el.addEventListener('mouseenter', () => (el.style.transform = 'scale(1.15)'));
		el.addEventListener('mouseleave', () => (el.style.transform = 'scale(1)'));

		const popup = new mapboxgl.Popup({ offset: 22, className: 'spot-mapbox-popup' }).setHTML(
			`<div style="font-weight:600;font-size:0.9rem;color:#212529;">${data.spot.name}</div>`
		);

		new mapboxgl.Marker({ element: el })
			.setLngLat([lng, lat])
			.setPopup(popup)
			.addTo(map);

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
</svelte:head>

<div class="container py-5" style="max-width: 800px;">
	<a href="/spots" class="d-inline-flex align-items-center gap-1 text-decoration-none text-secondary mb-3">
		<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
			<path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
		</svg>
		Alle Spots
	</a>

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
		<i class="bi bi-geo-alt me-1"></i>{adresse}
	</p>

	<!-- Badges -->
	<div class="d-flex flex-wrap gap-2 mb-3">
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

	<!-- Live-Status Anzeige -->
	{#if data.currentStatus}
		<p class="mb-3">
			<span class="badge bg-{statusBadge[data.currentStatus.status]} fs-6">
				{statusIcon[data.currentStatus.status]} Aktuell: {data.currentStatus.status}
				({data.currentStatus.count}
				{data.currentStatus.count === 1 ? 'Meldung' : 'Meldungen'})
			</span>
		</p>
	{:else}
		<p class="mb-3 text-muted small"><i class="bi bi-clock me-1"></i>Kein aktueller Status</p>
	{/if}

	<!-- Beschreibung -->
	{#if data.spot.beschreibung}
		<p class="mb-3">{data.spot.beschreibung}</p>
	{/if}

	<!-- Offizielle Website -->
	{#if data.spot.websiteUrl}
		<a
			href={data.spot.websiteUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="btn btn-outline-secondary btn-sm mb-4"
		>
			<i class="bi bi-globe me-1"></i>Offizielle Website
		</a>
	{/if}

	<!-- Karte -->
	<div class="mb-5">
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

	<!-- Live-Status setzen (nur für eingeloggte User) -->
	{#if data.user}
		<div class="mb-4">
			<p class="small text-muted mb-2">Wie ist es gerade vor Ort?</p>
			{#if form?.rateLimitError}
				<div class="alert alert-warning py-2 small mb-2">{form.rateLimitError}</div>
			{/if}
			<form method="POST" action="?/setStatus" use:enhance>
				<div class="btn-group" role="group">
					<button type="submit" name="status" value="ruhig" class="btn btn-outline-success btn-sm">
						🟢 Ruhig
					</button>
					<button type="submit" name="status" value="mittel" class="btn btn-outline-warning btn-sm">
						🟡 Mittel
					</button>
					<button type="submit" name="status" value="voll" class="btn btn-outline-danger btn-sm">
						🔴 Voll
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Bewertungen -->
	<h2 class="h4 mb-3">Bewertungen</h2>

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

	<!-- Review-Formular (nur für eingeloggte User) -->
	{#if data.user}
		<h3 class="h5 mt-4 mb-3">Bewertung abgeben</h3>

		{#if form?.success}
			<div class="alert alert-success">
				<i class="bi bi-check-circle me-2"></i>Danke für deine Bewertung!
			</div>
		{/if}
		{#if form?.error}
			<div class="alert alert-danger">{form.error}</div>
		{/if}

		<form method="POST" action="?/addReview" use:enhance class="card shadow-sm p-4 mb-5">
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
	{:else}
		<p class="text-muted mb-5">
			<a href="/login">Einloggen</a>, um eine Bewertung abzugeben.
		</p>
	{/if}

	<div class="d-flex gap-2 align-items-center">
		<a href="/spots" class="btn btn-outline-secondary">
			<i class="bi bi-arrow-left me-1"></i>Zurück zur Übersicht
		</a>

		{#if data.isAdmin}
			<div class="ms-auto pt-3 border-top border-0 d-flex gap-2 align-items-center">
				<p class="text-muted small mb-0">🔐 Admin:</p>
				<a href="/spots/{data.spot._id}/edit" class="btn btn-outline-primary btn-sm">
					✏️ Bearbeiten
				</a>
				<form
					method="POST"
					action="?/deleteSpot"
					use:enhance
					onsubmit={(e) => {
						if (!confirm(`Spot «${data.spot.name}» wirklich löschen?`)) e.preventDefault();
					}}
				>
					<button type="submit" class="btn btn-danger btn-sm">🗑️ Löschen</button>
				</form>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(.spot-mapbox-popup .mapboxgl-popup-content) {
		border-radius: 10px;
		padding: 12px 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06);
		border: 1px solid rgba(0, 0, 0, 0.08);
	}

	:global(.spot-mapbox-popup .mapboxgl-popup-tip) {
		border-top-color: white;
	}
</style>
