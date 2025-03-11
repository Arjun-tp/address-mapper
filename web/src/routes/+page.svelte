<script>
  import axios from 'axios';

  let source = '';
  let destination = '';
  let unit = 'miles'; // Default to Miles
  let distance = null;
  let errorMessage = '';

  async function calculateDistance() {
    errorMessage = '';
    distance = null;

    if (!source || !destination) {
      errorMessage = 'Please enter both source and destination.';
      return;
    }

    try {
      const response = await axios.post('http://localhost:7004/location/distance', {
        source,
        destination
      });

      let kmDistance = response.data.distanceInKMs.toFixed(2);
      let milesDistance = (parseFloat(kmDistance) * 0.621371).toFixed(2);

      if (unit === 'km') {
        distance = `${kmDistance} km`;
      } else if (unit === 'miles') {
        distance = `${milesDistance} mi`;
      } else {
        distance = `${kmDistance} km / ${milesDistance} mi`;
      }
    } catch (err) {
      errorMessage = 'Failed to fetch distance. Please try again.';
    }
  }
</script>

<main class="container mt-5">
  <!-- Header -->
  <div class="d-flex justify-content-between align-items-center">
    <div>
      <h1 class="display-5">Distance Calculator</h1>
      <p class="text-muted">Prototype web application for calculating distances between addresses.</p>
    </div>
    <a href="/history" class="btn btn-dark d-flex align-items-center">
      View Historical Queries
    </a>
  </div>

  <!-- Input Fields -->
  <div class="row mt-4">
    <div class="col-md-6">
      <label class="form-label">Source Address</label>
      <input type="text" class="form-control" bind:value={source} placeholder="Enter Source Address" />
    </div>
    <div class="col-md-6">
      <label class="form-label">Destination Address</label>
      <input type="text" class="form-control" bind:value={destination} placeholder="Enter Destination Address" />
    </div>
  </div>

  <div class="d-flex justify-content-between align-items-center mt-3">
    <div class="text-end">
      <label class="form-label me-3">Unit</label>
      <div class="btn-group">
        <input type="radio" class="btn-check" id="miles" value="miles" bind:group={unit} />
        <label class="btn btn-outline-primary" for="miles">Miles</label>

        <input type="radio" class="btn-check" id="km" value="km" bind:group={unit} />
        <label class="btn btn-outline-primary" for="km">Kilometers</label>

        <input type="radio" class="btn-check" id="both" value="both" bind:group={unit} />
        <label class="btn btn-outline-primary" for="both">Both</label>
      </div>
    </div>

    <div class="text-end">
      <label class="form-label">Distance</label>
      <p class="h4 fw-bold">{distance || '--'}</p>
    </div>
  </div>


  <!-- Calculate Button -->
  <div class="mt-4">
    <button class="btn btn-danger w-15 d-flex align-items-center justify-content-center" on:click={calculateDistance}>
      Calculate Distance <i class="bi bi-arrow-right ms-2"></i>
    </button>
  </div>

  <!-- Error Message -->
  {#if errorMessage}
    <p class="text-danger mt-3 text-center">{errorMessage}</p>
  {/if}
</main>
