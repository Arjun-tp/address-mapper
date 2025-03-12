<script>
  import axios from 'axios';

  let source = '';
  let destination = '';
  let unit = 'miles';
  let distance = null;
  let kmDistance = null;
  let milesDistance = null;
  let errorMessage = '';

  /*
  let sourceSuggestions = [];
  let destinationSuggestions = [];

  async function fetchSuggestions(query, type) {
    if (!query) {
      if (type === 'source') sourceSuggestions = [];
      if (type === 'destination') destinationSuggestions = [];
      return;
    }

    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: 5
        }
      });

      if (type === 'source') {
        sourceSuggestions = response.data;
      } else {
        destinationSuggestions = response.data;
      }
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
    }
  }

  function selectSuggestion(suggestion, type) {
    if (type === 'source') {
      source = suggestion.display_name;
      sourceSuggestions = [];
    } else {
      destination = suggestion.display_name;
      destinationSuggestions = [];
    }
  }
  */

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

      kmDistance = (parseFloat(response.data.distanceInKMs)).toFixed(2);
      milesDistance = (kmDistance * 0.621371).toFixed(2);

      updateDistance();
    } catch (err) {
      console.log(err);
      errorMessage = `Failed to fetch distance. Please try again.`;
    }
  }

  function updateDistance() {
    if (!kmDistance || !milesDistance) return;

    if (unit === 'km') {
      distance = `${kmDistance} km`;
    } else if (unit === 'miles') {
      distance = `${milesDistance} mi`;
    } else {
      distance = `${kmDistance} km / ${milesDistance} mi`;
    }
  }
</script>

<main class="container mt-5">
  <div class="card shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h2 class="h5 m-0">Distance Calculator</h2>
      <a href="/history" class="btn btn-outline-dark">View Historical Queries</a>
    </div>

    <div class="card-body">
      <p class="text-muted">Prototype web application for calculating distances between addresses.</p>

      <!-- Input Fields with Autocomplete -->
      <!--  <div class="row mt-4">-->
      <!--    <div class="col-md-6">-->
      <!--      <label class="form-label fw-bold">Source Address</label>-->
      <!--      <input-->
      <!--        type="text"-->
      <!--        class="form-control"-->
      <!--        bind:value={source}-->
      <!--        on:input={(e) => fetchSuggestions(e.target.value, 'source')}-->
      <!--        placeholder="Enter Source Address"-->
      <!--      />-->
      <!--      {#if sourceSuggestions.length > 0}-->
      <!--        <ul class="list-group position-absolute w-100 mt-1 shadow">-->
      <!--          {#each sourceSuggestions as suggestion}-->
      <!--            <li class="list-group-item list-group-item-action" on:click={() => selectSuggestion(suggestion, 'source')} role="button">-->
      <!--              {suggestion.display_name}-->
      <!--            </li>-->
      <!--          {/each}-->
      <!--        </ul>-->
      <!--      {/if}-->
      <!--    </div>-->
      <!--    <div class="col-md-6 position-relative">-->
      <!--      <label class="form-label fw-bold">Destination Address</label>-->
      <!--      <input-->
      <!--        type="text"-->
      <!--        class="form-control"-->
      <!--        bind:value={destination}-->
      <!--        on:input={(e) => fetchSuggestions(e.target.value, 'destination')}-->
      <!--        placeholder="Enter Destination Address"-->
      <!--      />-->
      <!--      {#if destinationSuggestions.length > 0}-->
      <!--        <ul class="list-group position-absolute w-100 mt-1 shadow">-->
      <!--          {#each destinationSuggestions as suggestion}-->
      <!--            <li class="list-group-item list-group-item-action" on:click={() => selectSuggestion(suggestion, 'destination')} role="button">-->
      <!--              {suggestion.display_name}-->
      <!--            </li>-->
      <!--          {/each}-->
      <!--        </ul>-->
      <!--      {/if}-->
      <!--    </div>-->
      <!--  </div>-->



      <!-- Input Fields -->
      <div class="row mt-3">
        <div class="col-md-6">
          <label class="form-label">Source Address</label>
          <input type="text" class="form-control" bind:value={source} placeholder="Enter Source Address" />
        </div>
        <div class="col-md-6">
          <label class="form-label">Destination Address</label>
          <input type="text" class="form-control" bind:value={destination} placeholder="Enter Destination Address" />
        </div>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-4">
        <!-- Unit Selection -->
        <div class="text-start">
          <div class="form-label"><b>Unit</b></div>
          <div class="btn-group">
            <input type="radio" class="btn-check" id="miles" value="miles" bind:group={unit} on:change={updateDistance} />
            <label class="btn btn-outline-dark" for="miles">Miles</label>

            <input type="radio" class="btn-check" id="km" value="km" bind:group={unit} on:change={updateDistance} />
            <label class="btn btn-outline-dark" for="km">Kilometers</label>

            <input type="radio" class="btn-check" id="both" value="both" bind:group={unit} on:change={updateDistance} />
            <label class="btn btn-outline-dark" for="both">Both</label>
          </div>
        </div>

        <!-- Distance Display -->
        <div class="text-end">
          <label class="form-label"><b>Distance</b></label>
          <p class="h4"><b>{distance || '--'}</b></p>
        </div>
      </div>

      <!-- Calculate Button -->
      <div class="mt-4 text-center">
        <button class="btn btn-danger px-4 py-2" on:click={calculateDistance} disabled={!destination || !source}>
          Calculate Distance <i class="bi bi-arrow-right ms-2"></i>
        </button>
      </div>

      <!-- Error Message -->
      {#if errorMessage}
        <p class="text-danger mt-3 text-center">{errorMessage}</p>
      {/if}
    </div>
  </div>
</main>
