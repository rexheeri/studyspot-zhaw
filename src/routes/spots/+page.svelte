<script>
	let { data } = $props();

	const laermBadge = {
		ruhig: 'success',
		mittel: 'warning',
		laut: 'danger'
	};
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
		<div class="row g-4">
			{#each data.spots as spot (spot._id)}
				<div class="col-md-4">
					<div class="card h-100 shadow-sm">
						{#if spot.bildUrl}
							<img src={spot.bildUrl} alt={spot.name} style="width:100%; height:180px; object-fit:cover; border-radius:4px 4px 0 0;" />
						{/if}
						<div class="card-body d-flex flex-column">
							<h5 class="card-title">{spot.name}</h5>
							<p class="card-text text-muted mb-2">
								<i class="bi bi-geo-alt me-1"></i>{spot.adresse}
							</p>

							<div class="d-flex align-items-center gap-2 mb-3 flex-wrap">
								<span class="badge bg-{laermBadge[spot.laerm] ?? 'secondary'}">
									<i class="bi bi-volume-{spot.laerm === 'ruhig' ? 'mute' : spot.laerm === 'mittel' ? 'down' : 'up'} me-1"></i>
									{spot.laerm}
								</span>

								{#if spot.wlan}
									<span class="badge bg-primary">
										<i class="bi bi-wifi me-1"></i>WLAN
									</span>
								{:else}
									<span class="badge bg-secondary">
										<i class="bi bi-wifi-off me-1"></i>Kein WLAN
									</span>
								{/if}

								{#if spot.steckdosen}
									<span class="badge bg-primary">
										<i class="bi bi-plug me-1"></i>Steckdosen
									</span>
								{:else}
									<span class="badge bg-secondary">
										<i class="bi bi-plug me-1"></i>Keine Steckdosen
									</span>
								{/if}
							</div>

							<a href="/spots/{spot._id}" class="btn btn-outline-primary mt-auto">
								Details <i class="bi bi-arrow-right ms-1"></i>
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
