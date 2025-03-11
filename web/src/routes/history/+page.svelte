<script>
  import { onMount } from 'svelte';
  import axios from 'axios';

  let history = [];
  let errorMessage = '';

  // Fetch history data when the page loads
  onMount(async () => {
    try {
      const response = await axios.get('http://localhost:7004/history');
      history = response.data.data;
    } catch (error) {
      errorMessage = `Failed to fetch history. Please try again. ${error}`
    }
  });
</script>

<main class="container mt-5">
  <div class="d-flex justify-content-between align-items-center">
    <h1 class="display-5">Historical Queries</h1>
    <a href="/" class="btn btn-outline-dark">Go Back</a>
  </div>


  <p class="text-muted">History of the user's queries.</p>

  <!-- Show Error Message if API Fails -->
  {#if errorMessage}
    <p class="text-danger">{errorMessage}</p>
  {/if}

  <!-- Show Table Only if History Exists -->
  {#if history.length > 0}
    <table class="table table-bordered mt-3">
      <thead class="table-dark">
      <tr>
        <th>Source</th>
        <th>Destination</th>
        <th>Distance in Miles</th>
        <th>Distance in Kilometers</th>
      </tr>
      </thead>
      <tbody>
      {#each history as entry}
        <tr>
          <td>{entry.source}</td>
          <td>{entry.destination}</td>
          <td>{entry.distanceInKMs}</td>
          <td>{(parseFloat(entry.distanceInKMs) * 0.621371).toFixed(3)}</td>
        </tr>
      {/each}
      </tbody>
    </table>
  {:else}
    <p class="text-center mt-4">No history available.</p>
  {/if}


</main>
