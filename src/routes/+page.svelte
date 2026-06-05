<svelte:head>
	<title>StudySpot ZHAW</title>
</svelte:head>

<!-- Hero -->
<section class="bg-primary text-white py-5">
	<div class="container text-center py-4">
		<h1 class="display-3 fw-bold mb-3">StudySpot ZHAW</h1>
		<p class="lead mb-4">Finde deinen perfekten Lernort</p>
		<a href="/spots" class="btn btn-light btn-lg px-5">Alle Spots anzeigen</a>
	</div>
</section>

<!-- Feature Cards -->
<section class="container py-5">
	<div class="row g-4 justify-content-center">
		<div class="col-md-4">
			<div class="card h-100 text-center shadow-sm">
				<div class="card-body p-4">
					<i class="bi bi-wifi display-4 text-primary mb-3 d-block"></i>
					<h5 class="card-title">WLAN</h5>
					<p class="card-text text-muted">
						Sieh auf einen Blick, ob ein Spot zuverlässiges WLAN bietet – damit du ohne Unterbruch
						arbeiten kannst.
					</p>
				</div>
			</div>
		</div>
		<div class="col-md-4">
			<div class="card h-100 text-center shadow-sm">
				<div class="card-body p-4">
					<i class="bi bi-volume-mute display-4 text-primary mb-3 d-block"></i>
					<h5 class="card-title">Lärmpegel</h5>
					<p class="card-text text-muted">
						Ruhig, mittel oder laut? Filtere Spots nach deinem gewünschten Geräuschpegel und
						konzentriere dich besser.
					</p>
				</div>
			</div>
		</div>
		<div class="col-md-4">
			<div class="card h-100 text-center shadow-sm">
				<div class="card-body p-4">
					<i class="bi bi-people-fill display-4 text-primary mb-3 d-block"></i>
					<h5 class="card-title">Live-Belegung</h5>
					<p class="card-text text-muted">
						Sieh live, wie voll ein Spot gerade ist – direkt von der Community gemeldet.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Call to Action -->
<section class="bg-light py-5">
	<div class="container text-center">
		<h2 class="mb-3">Kennst du einen guten Spot?</h2>
		<p class="text-muted mb-4">
			Teile deinen Lieblingsort mit der ZHAW-Community und hilf anderen Studierenden.
		</p>
		<a href="/spots/create" class="btn btn-primary btn-lg px-5">Spot eintragen</a>
	</div>
</section>
