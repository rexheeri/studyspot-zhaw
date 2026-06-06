<script>
	import { enhance } from '$app/forms';

	let { data } = $props();

	const laermBadge = { ruhig: 'success', mittel: 'warning text-dark', laut: 'danger' };
	const statusBadge = { ruhig: 'success', mittel: 'warning', voll: 'danger' };
	const statusIcon = { ruhig: '🟢', mittel: '🟡', voll: '🔴' };
	const statusLabel = { ruhig: 'Ruhig', mittel: 'Mittel', voll: 'Voll' };

	function spotAdresse(spot) {
		return (
			spot.adresse ||
			[spot.strasse, spot.plz && spot.ort ? `${spot.plz} ${spot.ort}` : spot.ort]
				.filter(Boolean)
				.join(', ')
		);
	}
</script>

<svelte:head>
	<title>Meine Favoriten – StudySpot ZHAW</title>
</svelte:head>

<div class="container py-5">
	<h1 class="mb-4">Meine Favoriten</h1>

	{#if data.spots.length === 0}
		<div class="alert alert-info">
			<i class="bi bi-heart me-2"></i>Du hast noch keine Favoriten gespeichert.
			<a href="/spots" class="alert-link ms-1">Alle Spots entdecken</a>
		</div>
	{:else}
		<div class="row g-4">
			{#each data.spots as spot (spot._id)}
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

							<div class="d-flex gap-2 mt-auto">
								<a href="/spots/{spot._id}" class="btn btn-outline-primary flex-grow-1">
									Details <i class="bi bi-arrow-right ms-1"></i>
								</a>
								<form method="POST" action="?/removeFavorit" use:enhance class="mb-0">
									<input type="hidden" name="spotId" value={spot._id} />
									<button
										type="submit"
										class="btn btn-outline-danger"
										title="Aus Favoriten entfernen"
									>
										<i class="bi bi-heart-fill"></i>
									</button>
								</form>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
