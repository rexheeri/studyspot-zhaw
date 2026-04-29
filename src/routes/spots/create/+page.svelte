<script>
	import { enhance } from '$app/forms';
	let { form } = $props();
</script>

<svelte:head>
	<title>Spot eintragen – StudySpot ZHAW</title>
</svelte:head>

<div class="container py-5" style="max-width: 640px;">
	<h1 class="mb-4">Neuen Spot eintragen</h1>

	{#if form?.error}
		<div class="alert alert-danger">{form.error}</div>
	{/if}

	<form method="POST" use:enhance class="card shadow-sm p-4">
		<div class="mb-3">
			<label for="name" class="form-label">Name <span class="text-danger">*</span></label>
			<input
				type="text"
				id="name"
				name="name"
				class="form-control"
				value={form?.name ?? ''}
				required
			/>
		</div>

		<div class="mb-3">
			<label for="strasse" class="form-label">Strasse <span class="text-danger">*</span></label>
			<input
				type="text"
				id="strasse"
				name="strasse"
				class="form-control"
				value={form?.strasse ?? ''}
				required
			/>
		</div>

		<div class="row mb-3">
			<div class="col-4">
				<label for="plz" class="form-label">PLZ <span class="text-danger">*</span></label>
				<input
					type="number"
					id="plz"
					name="plz"
					class="form-control"
					value={form?.plz ?? ''}
					min="1000"
					max="9999"
					required
				/>
			</div>
			<div class="col-8">
				<label for="ort" class="form-label">Ort <span class="text-danger">*</span></label>
				<input
					type="text"
					id="ort"
					name="ort"
					class="form-control"
					value={form?.ort ?? ''}
					required
				/>
			</div>
		</div>

		<div class="mb-3">
			<label for="beschreibung" class="form-label">Beschreibung</label>
			<textarea id="beschreibung" name="beschreibung" class="form-control" rows="3"></textarea>
		</div>

		<div class="mb-3">
			<label for="laerm" class="form-label">Lärmpegel</label>
			<select id="laerm" name="laerm" class="form-select">
				<option value="ruhig">Ruhig</option>
				<option value="mittel">Mittel</option>
				<option value="laut">Laut</option>
			</select>
		</div>

		<div class="mb-3">
			<label for="bildUrl" class="form-label">Bild-URL</label>
			<input type="text" id="bildUrl" name="bildUrl" class="form-control" placeholder="/img/..." />
		</div>

		<div class="mb-3 d-flex gap-4">
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

		<div class="d-flex gap-2 mt-2">
			<button type="submit" class="btn btn-primary">
				<i class="bi bi-plus-circle me-1"></i>Spot eintragen
			</button>
			<a href="/spots" class="btn btn-outline-secondary">Abbrechen</a>
		</div>
	</form>
</div>
