<script>
	import favicon from '$lib/assets/favicon.svg';
	import 'bootstrap/dist/css/bootstrap.min.css';
	import 'bootstrap-icons/font/bootstrap-icons.css';
let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav class="navbar navbar-expand-md navbar-dark bg-primary">
	<div class="container">
		<a class="navbar-brand fw-bold" href="/">StudySpot ZHAW</a>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#mainNav"
			aria-controls="mainNav"
			aria-expanded="false"
			aria-label="Navigation umschalten"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="mainNav">
			<ul class="navbar-nav ms-auto mb-2 mb-md-0">
				<li class="nav-item">
					<a class="nav-link" href="/spots">Spots</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="/spots/create">Spot eintragen</a>
				</li>
			</ul>
		</div>
	</div>
</nav>

{@render children()}
