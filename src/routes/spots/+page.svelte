<script>
	import { onMount } from 'svelte';
	import { PUBLIC_MAPBOX_TOKEN } from '$env/static/public';
	import 'mapbox-gl/dist/mapbox-gl.css';

	let { data } = $props();

	const laermBadge = { ruhig: 'success', mittel: 'warning text-dark', laut: 'danger' };
	const statusBadge = { ruhig: 'success', mittel: 'warning', voll: 'danger' };
	const statusIcon = { ruhig: '🟢', mittel: '🟡', voll: '🔴' };
	const statusLabel = { ruhig: 'Ruhig', mittel: 'Mittel', voll: 'Voll' };

	let belegungFilter = $state('alle');
	let nurWlan = $state(false);
	let nurSteckdosen = $state(false);
	let laermFilter = $state('alle');
	let mapDiv = $state(null);

	const gefilterteSpots = $derived(
		data.spots.filter((s) => {
			if (belegungFilter !== 'alle') {
				if (!s.currentStatus || s.currentStatus !== belegungFilter) return false;
			}
			if (nurWlan && !s.wlan) return false;
			if (nurSteckdosen && !s.steckdosen) return false;
			if (laermFilter !== 'alle' && s.laerm !== laermFilter) return false;
			return true;
		})
	);

	function spotAdresse(spot) {
		return (
			spot.adresse ||
			[spot.strasse, spot.plz && spot.ort ? `${spot.plz} ${spot.ort}` : spot.ort]
				.filter(Boolean)
				.join(', ')
		);
	}

	function addMarker(mapboxgl, map, spot, lng, lat) {
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

		const adresse = spotAdresse(spot);
		const popup = new mapboxgl.Popup({ offset: 22, className: 'spot-mapbox-popup' }).setHTML(`
			<div style="min-width:180px;padding:2px 0;">
				<div style="font-weight:600;font-size:0.875rem;color:#212529;margin-bottom:3px;">${spot.name}</div>
				<div style="font-size:0.75rem;color:#6c757d;margin-bottom:10px;line-height:1.4;">${adresse}</div>
				<a href="/spots/${spot._id}" style="color:#0d6efd;font-size:0.8rem;text-decoration:none;font-weight:500;">Details →</a>
			</div>`);

		new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).setPopup(popup).addTo(map);
	}

	onMount(async () => {
		if (!mapDiv || data.spots.length === 0) return;
		if (!PUBLIC_MAPBOX_TOKEN) return;

		// Dynamischer Import verhindert SSR-Fehler (mapbox-gl nutzt window)
		const mapboxgl = (await import('mapbox-gl')).default;
		const MapboxWorker = (await import('mapbox-gl/dist/mapbox-gl-csp-worker?worker')).default;
		mapboxgl.workerClass = MapboxWorker;
		mapboxgl.accessToken = PUBLIC_MAPBOX_TOKEN;

		const map = new mapboxgl.Map({
			container: mapDiv,
			style: 'mapbox://styles/mapbox/streets-v12',
			center: [8.727, 47.497],
			zoom: 12
		});

		map.addControl(new mapboxgl.NavigationControl(), 'top-right');
		map.on('error', (e) => console.error('Mapbox:', e?.error));

		// ResizeObserver stellt sicher, dass die Karte ihre korrekte Grösse bekommt,
		// auch wenn der Container beim Init noch nicht final gerendert war.
		const ro = new ResizeObserver(() => map.resize());
		ro.observe(mapDiv);

		const mitCoords = data.spots.filter((s) => s.lat && s.lng);
		const ohneCoords = data.spots.filter((s) => !s.lat || !s.lng);

		const bounds = new mapboxgl.LngLatBounds();

		map.on('load', () => {
			map.resize();
			for (const spot of mitCoords) {
				addMarker(mapboxgl, map, spot, spot.lng, spot.lat);
				bounds.extend([spot.lng, spot.lat]);
			}

			if (mitCoords.length === 1) {
				map.setCenter([mitCoords[0].lng, mitCoords[0].lat]);
				map.setZoom(15);
			} else if (mitCoords.length > 1) {
				map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
			}
		});

		// Fallback: Spots ohne Koordinaten nachtraeglich geocodieren (Nominatim: 1 req/s).
		// Fire-and-forget – onMount wartet nicht, Karte erscheint sofort.
		if (ohneCoords.length > 0) {
			(async () => {
				for (const spot of ohneCoords) {
					await new Promise((r) => setTimeout(r, 1100));
					try {
						const adresse = spotAdresse(spot);
						const res = await fetch(
							`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}&limit=1`,
							{ headers: { 'Accept-Language': 'de' } }
						);
						const results = await res.json();
						if (results.length) {
							addMarker(
								mapboxgl,
								map,
								spot,
								parseFloat(results[0].lon),
								parseFloat(results[0].lat)
							);
						}
					} catch {
						// Spot uebersprungen
					}
				}
			})();
		}
	});
</script>

<svelte:head>
	<title>Alle Spots – StudySpot ZHAW</title>
</svelte:head>

<div class="container py-5">
	<h1 class="mb-4">Lernorte</h1>

	{#if data.spots.length === 0}
		<div class="alert alert-info">
			<i class="bi bi-info-circle me-2"></i>Noch keine Spots erfasst.
			<a href="/spots/create" class="alert-link ms-1">Ersten Spot eintragen</a>
		</div>
	{:else}
		<!-- Filterleiste -->
		<div class="card shadow-sm mb-4 p-3">
			<div class="d-flex flex-wrap gap-3 align-items-center">
				<!-- Belegung -->
				<div class="d-flex align-items-center gap-2 flex-wrap">
					<span class="text-muted small fw-medium">Belegung:</span>
					<div class="btn-group" role="group" aria-label="Nach Belegung filtern">
						{#each [['alle', '– Alle'], ['ruhig', '🟢 Ruhig'], ['mittel', '🟡 Mittel'], ['voll', '🔴 Voll']] as [val, lbl] (val)}
							<button
								type="button"
								class="btn btn-sm {belegungFilter === val
									? 'btn-primary'
									: 'btn-outline-secondary'}"
								onclick={() => (belegungFilter = val)}>{lbl}</button
							>
						{/each}
					</div>
				</div>

				<!-- Lärmpegel -->
				<div class="d-flex align-items-center gap-2 flex-wrap">
					<span class="text-muted small fw-medium">Lärm:</span>
					<div class="btn-group" role="group" aria-label="Nach Lärmpegel filtern">
						{#each [['alle', 'Alle'], ['ruhig', '🤫 Ruhig'], ['mittel', '🔉 Mittel'], ['laut', '🔊 Laut']] as [val, lbl] (val)}
							<button
								type="button"
								class="btn btn-sm {laermFilter === val ? 'btn-primary' : 'btn-outline-secondary'}"
								onclick={() => (laermFilter = val)}>{lbl}</button
							>
						{/each}
					</div>
				</div>

				<!-- WLAN & Steckdosen -->
				<div class="d-flex align-items-center gap-3">
					<div class="form-check mb-0">
						<input
							type="checkbox"
							id="filter-wlan"
							class="form-check-input"
							bind:checked={nurWlan}
						/>
						<label for="filter-wlan" class="form-check-label small">
							<i class="bi bi-wifi me-1"></i>Nur mit WLAN
						</label>
					</div>
					<div class="form-check mb-0">
						<input
							type="checkbox"
							id="filter-steckdosen"
							class="form-check-input"
							bind:checked={nurSteckdosen}
						/>
						<label for="filter-steckdosen" class="form-check-label small">
							<i class="bi bi-plug me-1"></i>Nur mit Steckdosen
						</label>
					</div>
				</div>

				<!-- Treffer-Zähler -->
				{#if belegungFilter !== 'alle' || laermFilter !== 'alle' || nurWlan || nurSteckdosen}
					<span class="text-muted small ms-auto">
						{gefilterteSpots.length}
						{gefilterteSpots.length === 1 ? 'Spot' : 'Spots'} gefunden
					</span>
				{/if}
			</div>
		</div>

		<!-- Spot-Karten -->
		<div class="row g-4 mb-5">
			{#if gefilterteSpots.length === 0}
				<div class="col-12">
					<p class="text-muted">Keine Spots entsprechen den gewählten Filtern.</p>
				</div>
			{:else}
				{#each gefilterteSpots as spot (spot._id)}
					<div class="col-md-4">
						<div class="card h-100 shadow-sm">
							{#if spot.bildUrl}
								<img
									src={spot.bildUrl}
									alt={spot.name}
									style="width:100%; height:180px; object-fit:cover; border-radius:4px 4px 0 0;"
								/>
							{/if}
							<div class="card-body d-flex flex-column">
								<div class="d-flex justify-content-between align-items-start mb-1">
									<h5 class="card-title mb-0">{spot.name}</h5>
									{#if spot.currentStatus}
										<span class="badge bg-{statusBadge[spot.currentStatus]} ms-2">
											{statusIcon[spot.currentStatus]}
											{statusLabel[spot.currentStatus]}
										</span>
									{:else}
										<span class="badge bg-secondary ms-2" style="opacity:0.6;">⚪ Unbekannt</span>
									{/if}
								</div>
								<p class="card-text text-muted mb-2">
									<i class="bi bi-geo-alt me-1"></i>{spotAdresse(spot)}
								</p>

								<div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
									<span class="badge bg-{laermBadge[spot.laerm] ?? 'secondary'}">
										<i
											class="bi bi-volume-{spot.laerm === 'ruhig'
												? 'mute'
												: spot.laerm === 'mittel'
													? 'down'
													: 'up'} me-1"
										></i>
										{spot.laerm}
									</span>
									{#if spot.wlan}
										<span class="badge bg-primary"><i class="bi bi-wifi me-1"></i>WLAN</span>
									{:else}
										<span class="badge bg-secondary"
											><i class="bi bi-wifi-off me-1"></i>Kein WLAN</span
										>
									{/if}
									{#if spot.steckdosen}
										<span class="badge bg-primary"><i class="bi bi-plug me-1"></i>Steckdosen</span>
									{:else}
										<span class="badge bg-secondary"
											><i class="bi bi-plug me-1"></i>Keine Steckdosen</span
										>
									{/if}
								</div>

								<a href="/spots/{spot._id}" class="btn btn-outline-primary mt-auto">
									Details <i class="bi bi-arrow-right ms-1"></i>
								</a>
							</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Übersichtskarte -->
		<h2 class="h4 mb-3">Alle Lernorte auf der Karte</h2>
		{#if PUBLIC_MAPBOX_TOKEN}
			<div bind:this={mapDiv} class="map-container"></div>
		{:else}
			<div
				class="map-container d-flex align-items-center justify-content-center bg-light text-muted"
			>
				<span><i class="bi bi-map me-2"></i>Karte nicht verfügbar (Konfiguration fehlt)</span>
			</div>
		{/if}
	{/if}
</div>

<style>
	.map-container {
		height: 450px;
		border-radius: 12px;
		overflow: hidden;
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.1),
			0 1px 6px rgba(0, 0, 0, 0.06);
	}

	/* Mapbox Popup Card-Styling */
	:global(.spot-mapbox-popup .mapboxgl-popup-content) {
		border-radius: 10px;
		padding: 14px 16px;
		box-shadow:
			0 4px 20px rgba(0, 0, 0, 0.12),
			0 1px 4px rgba(0, 0, 0, 0.06);
		border: 1px solid rgba(0, 0, 0, 0.08);
	}

	:global(.spot-mapbox-popup .mapboxgl-popup-tip) {
		border-top-color: white;
	}
</style>
