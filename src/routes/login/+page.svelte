<!-- src/routes/login/+page.svelte -->
<script>
  import { enhance } from '$app/forms';

  let { form } = $props();

  let activeTab = $state('login'); // 'login' | 'register'
</script>

<svelte:head>
  <title>Login – StudySpot ZHAW</title>
</svelte:head>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-5">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h1 class="h4 mb-1 fw-bold">StudySpot ZHAW</h1>
          <p class="text-muted small mb-4">Nur für ZHAW-Angehörige (@zhaw.ch)</p>

          <!-- Tabs -->
          <ul class="nav nav-tabs mb-4">
            <li class="nav-item">
              <button
                class="nav-link {activeTab === 'login' ? 'active' : ''}"
                onclick={() => (activeTab = 'login')}
              >
                Anmelden
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link {activeTab === 'register' ? 'active' : ''}"
                onclick={() => (activeTab = 'register')}
              >
                Registrieren
              </button>
            </li>
          </ul>

          <!-- Fehlermeldung / Erfolg -->
          {#if form?.error && form?.action === activeTab}
            <div class="alert alert-danger py-2 small">{form.error}</div>
          {/if}
          {#if form?.success && form?.action === 'register'}
            <div class="alert alert-success py-2 small">{form.success}</div>
          {/if}

          <!-- LOGIN-FORMULAR -->
          {#if activeTab === 'login'}
            <form method="POST" action="?/login" use:enhance>
              <div class="mb-3">
                <label for="login-email" class="form-label">ZHAW-E-Mail</label>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  class="form-control"
                  placeholder="vorname.nachname@students.zhaw.ch"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="login-password" class="form-label">Passwort</label>
                <input
                  id="login-password"
                  type="password"
                  name="password"
                  class="form-control"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary w-100">Anmelden</button>
            </form>
          {/if}

          <!-- REGISTRIERUNGS-FORMULAR -->
          {#if activeTab === 'register'}
            <form method="POST" action="?/register" use:enhance>
              <div class="mb-3">
                <label for="reg-email" class="form-label">ZHAW-E-Mail</label>
                <input
                  id="reg-email"
                  type="email"
                  name="email"
                  class="form-control"
                  placeholder="vorname.nachname@students.zhaw.ch"
                  required
                />
              </div>
              <div class="mb-3">
                <label for="reg-password" class="form-label">Passwort</label>
                <input
                  id="reg-password"
                  type="password"
                  name="password"
                  class="form-control"
                  placeholder="Mindestens 8 Zeichen"
                  required
                />
              </div>
              <button type="submit" class="btn btn-primary w-100">Konto erstellen</button>
              <p class="text-muted small mt-3 mb-0">
                Nach der Registrierung erhältst du eine Bestätigungsmail an deine ZHAW-Adresse.
              </p>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
