<script>
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import { cubicOut } from 'svelte/easing';

	let { form } = $props();

	let strasse = $state(form?.strasse ?? '');
	let plz = $state(form?.plz ?? '');
	let ort = $state(form?.ort ?? '');
	let lat = $state('');
	let lng = $state('');
	let adresseAnzeige = $state(
		strasse ? [strasse, plz && ort ? `${plz} ${ort}` : ort].filter(Boolean).join(', ') : ''
	);

	let vorschlaege = $state([]);
	let vorschlagOffen = $state(false);
	let aktiveIndex = $state(-1);
	let ladend = $state(false);
	let debounceTimer;

	function onAdresseInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => sucheAdresse(adresseAnzeige), 300);
	}

	async function sucheAdresse(query) {
		if (query.length < 3) {
			vorschlaege = [];
			vorschlagOffen = false;
			return;
		}
		ladend = true;
		try {
			const res = await fetch(
				`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=ch&limit=5`,
				{ headers: { 'Accept-Language': 'de' } }
			);
			vorschlaege = await res.json();
			aktiveIndex = -1;
			vorschlagOffen = vorschlaege.length > 0;
		} catch {
			vorschlaege = [];
		} finally {
			ladend = false;
		}
	}

	function onKeyDown(e) {
		if (!vorschlagOffen) return;
		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				aktiveIndex = Math.min(aktiveIndex + 1, vorschlaege.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				aktiveIndex = Math.max(aktiveIndex - 1, -1);
				break;
			case 'Enter':
				if (aktiveIndex >= 0) {
					e.preventDefault();
					vorschlagWaehlen(vorschlaege[aktiveIndex]);
				}
				break;
			case 'Escape':
				vorschlagOffen = false;
				aktiveIndex = -1;
				break;
		}
	}

	async function vorschlagWaehlen(v) {
		const a = v.address;
		strasse = [a.road, a.house_number].filter(Boolean).join(' ');
		plz = a.postcode?.replace(/\s/g, '') ?? '';
		ort = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? '';
		lat = v.lat;
		lng = v.lon;
		adresseAnzeige = [strasse, plz && ort ? `${plz} ${ort}` : ort].filter(Boolean).join(', ');
		vorschlagOffen = false;
		aktiveIndex = -1;
		await tick();
		await zeigeKarte(parseFloat(v.lat), parseFloat(v.lon));
	}

	// eslint-disable-next-line no-unused-vars
	function dropdownTransition(_node) {
		return {
			duration: 150,
			css: (t) => {
				const e = cubicOut(t);
				return `opacity: ${e}; transform: translateY(${(1 - e) * -6}px)`;
			}
		};
	}

	function zeile1(v) {
		const a = v.address;
		return [a.road, a.house_number].filter(Boolean).join(' ') || v.display_name.split(',')[0];
	}

	function zeile2(v) {
		const a = v.address;
		return [
			a.postcode?.replace(/\s/g, ''),
			a.city ?? a.town ?? a.village ?? a.municipality,
			a.state
		]
			.filter(Boolean)
			.join(', ');
	}

	// Karten-Vorschau
	let mapContainer = $state(null);
	let karteAnzeigen = $state(false);
	let karteInitialisiert = false;
	let mapInstance = null;
	let markerInstance = null;

	function ladeLeaflet() {
		return new Promise((resolve) => {
			if (window.L) { resolve(); return; }
			const s = document.createElement('script');
			s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
			s.onload = resolve;
			document.head.appendChild(s);
		});
	}

	async function zeigeKarte(lat, lon) {
		karteAnzeigen = true;
		await tick();
		await ladeLeaflet();
		const L = window.L;
		if (!karteInitialisiert) {
			mapInstance = L.map(mapContainer).setView([lat, lon], 16);
			L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(mapInstance);
			markerInstance = L.marker([lat, lon]).addTo(mapInstance);
			karteInitialisiert = true;
		} else {
			mapInstance.setView([lat, lon], 16);
			markerInstance.setLatLng([lat, lon]);
		}
	}
</script>

<svelte:head>
	<title>Spot eintragen – StudySpot ZHAW</title>
	<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
</svelte:head>

<div class="container py-5" style="max-width: 640px;">
	<h1 class="mb-4">Neuen Spot eintragen</h1>

	{#if form?.error}
		<div class="alert alert-danger">{form.error}</div>
	{/if}

	<form method="POST" action="?/createSpot" use:enhance class="card shadow p-4 p-md-5">
		<div class="mb-3">
			<label for="name" class="form-label fw-medium">
				Name <span class="text-danger">*</span>
			</label>
			<input
				type="text"
				id="name"
				name="name"
				class="form-control"
				value={form?.name ?? ''}
				required
			/>
		</div>

		<!-- Adresse (Ein-Feld mit Autocomplete) -->
		<div class="mb-3">
			<label for="adresse" class="form-label fw-medium">
				Adresse <span class="text-danger">*</span>
			</label>
			<div class="position-relative">
				<input
					type="text"
					id="adresse"
					class="form-control"
					class:pe-5={ladend}
					placeholder="z.B. Technikumstrasse 9, 8400 Winterthur"
					bind:value={adresseAnzeige}
					oninput={onAdresseInput}
					onkeydown={onKeyDown}
					onblur={() => setTimeout(() => { vorschlagOffen = false; aktiveIndex = -1; }, 150)}
					autocomplete="off"
					aria-autocomplete="list"
					aria-expanded={vorschlagOffen}
					required
				/>

				{#if ladend}
					<div class="spinner-pos">
						<span class="spinner-border spinner-border-sm text-secondary" role="status">
							<span class="visually-hidden">Suche läuft…</span>
						</span>
					</div>
				{/if}

				{#if vorschlagOffen && vorschlaege.length > 0}
					<div
						class="adresse-dropdown"
						role="listbox"
						transition:dropdownTransition
					>
						{#each vorschlaege as v, i (v.place_id ?? i)}
							<button
								type="button"
								role="option"
								aria-selected={i === aktiveIndex}
								class="adresse-option"
								class:aktiv={i === aktiveIndex}
								onmousedown={() => vorschlagWaehlen(v)}
							>
								<i class="bi bi-geo-alt adresse-icon"></i>
								<div class="adresse-text">
									<span class="adresse-zeile1">{zeile1(v)}</span>
									<span class="adresse-zeile2">{zeile2(v)}</span>
								</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Hidden inputs für MongoDB -->
		<input type="hidden" name="strasse" bind:value={strasse} />
		<input type="hidden" name="plz" bind:value={plz} />
		<input type="hidden" name="ort" bind:value={ort} />
		<input type="hidden" name="lat" bind:value={lat} />
		<input type="hidden" name="lng" bind:value={lng} />

		<!-- Karten-Vorschau -->
		{#if karteAnzeigen}
			<div
				bind:this={mapContainer}
				class="mb-3 rounded-3 border"
				style="height: 220px; overflow: hidden;"
			></div>
		{/if}

		<div class="mb-3">
			<label for="beschreibung" class="form-label fw-medium">Beschreibung</label>
			<textarea id="beschreibung" name="beschreibung" class="form-control" rows="3"
				>{form?.beschreibung ?? ''}</textarea
			>
		</div>

		<div class="mb-3">
			<label for="laerm" class="form-label fw-medium">Lärmpegel</label>
			<select id="laerm" name="laerm" class="form-select">
				<option value="ruhig">Ruhig</option>
				<option value="mittel">Mittel</option>
				<option value="laut">Laut</option>
			</select>
		</div>

		<div class="mb-3">
			<label for="bildUrl" class="form-label fw-medium">Bild-URL</label>
			<input
				type="text"
				id="bildUrl"
				name="bildUrl"
				class="form-control"
				placeholder="/img/..."
				value={form?.bildUrl ?? ''}
			/>
		</div>

		<div class="mb-3">
			<label for="websiteUrl" class="form-label fw-medium">Offizielle Website</label>
			<input
				type="url"
				id="websiteUrl"
				name="websiteUrl"
				class="form-control"
				placeholder="https://..."
				value={form?.websiteUrl ?? ''}
			/>
		</div>

		<div class="mb-4 d-flex gap-4">
			<div class="form-check">
				<input type="checkbox" id="wlan" name="wlan" class="form-check-input" />
				<label for="wlan" class="form-check-label">
					<i class="bi bi-wifi me-1"></i>WLAN vorhanden
				</label>
			</div>
			<div class="form-check">
				<input type="checkbox" id="steckdosen" name="steckdosen" class="form-check-input" />
				<label for="steckdosen" class="form-check-label">
					<i class="bi bi-plug me-1"></i>Steckdosen vorhanden
				</label>
			</div>
		</div>

		<div class="d-flex gap-2">
			<button type="submit" class="btn btn-primary btn-submit">
				<i class="bi bi-plus-circle me-1"></i>Spot eintragen
			</button>
			<a href="/spots" class="btn btn-outline-secondary">Abbrechen</a>
		</div>
	</form>
</div>

<style>
	/* ── Autocomplete Dropdown ─────────────────────────────────── */
	.adresse-dropdown {
		position: absolute;
		left: 0;
		right: 0;
		top: 100%;
		margin-top: 3px;
		z-index: 1050;
		background: #fff;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 8px;
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.1),
			0 1px 6px rgba(0, 0, 0, 0.06);
		max-height: 280px;
		overflow-y: auto;
	}

	.adresse-option {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 10px 14px;
		background: none;
		border: none;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		text-align: left;
		cursor: pointer;
		transition: background 100ms ease;
	}

	.adresse-option:last-child {
		border-bottom: none;
		border-radius: 0 0 8px 8px;
	}

	.adresse-option:first-child {
		border-radius: 8px 8px 0 0;
	}

	.adresse-option:only-child {
		border-radius: 8px;
	}

	.adresse-option:hover {
		background: #f0f4ff;
	}

	.adresse-option.aktiv {
		background: #dde7ff;
	}

	.adresse-icon {
		color: #6c757d;
		font-size: 1rem;
		flex-shrink: 0;
		line-height: 1;
		margin-top: 1px;
	}

	.adresse-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.adresse-zeile1 {
		font-weight: 600;
		font-size: 0.875rem;
		color: #212529;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.adresse-zeile2 {
		font-size: 0.75rem;
		color: #6c757d;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* ── Spinner im Eingabefeld ────────────────────────────────── */
	.spinner-pos {
		position: absolute;
		top: 50%;
		right: 10px;
		transform: translateY(-50%);
		pointer-events: none;
		display: flex;
		align-items: center;
	}

	/* ── Button Press-Feedback (Emil: Buttons müssen reaktiv sein) */
	.btn-submit:active {
		transform: scale(0.97);
	}
</style>
