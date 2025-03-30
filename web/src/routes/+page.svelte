<script>
  import axios from 'axios';
  import {API_URL} from '../config/constant.js'
  import Toast from "../lib/toast.svelte";
  import { showToast } from "../lib/stores/toastStore.js";

  let source = '';
  let destination = '';
  let unit = 'both';
  let distance = null;
  let kmDistance = null;
  let milesDistance = null;
  let errorMessage = '';
  let sourceLat = null;
  let sourceLng = null;
  let destLat = null;
  let destLng = null;
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

  async function calculateDistance() {
    errorMessage = '';
    distance = null;

    if (!source || !destination) {
      errorMessage = 'Please enter both source and destination.';
      showToast(errorMessage);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/location/distance`, {
        source,
        destination
      });
      sourceLat = response.data.source.lat;
      sourceLng = response.data.source.lng;
      destLat = response.data.destination.lat;
      destLng = response.data.destination.lng;


      kmDistance = (parseFloat(response.data.distanceInKMs)).toFixed(2);
      milesDistance = (kmDistance * 0.621371).toFixed(2);

      updateDistance();
    } catch (err) {
      if (err?.response?.status === 429) {
        errorMessage = err.response.data
      } else if(err?.response?.data?.error?.message){
        errorMessage = err.response.data.error.message
      } else {
        errorMessage = `Failed to fetch distance. Please try again.`;
      }
      showToast(errorMessage)
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

  let mapDiv;

  $: if (sourceLat && sourceLng && destLat && destLng && mapDiv) {
    (async () => {
      const { Loader } = await import('@googlemaps/js-api-loader');

      const loader = new Loader({
        apiKey: API_KEY,
        version: 'weekly'
      });

      await loader.load();
      const google = window.google;
      const map = new google.maps.Map(mapDiv, {
        center: { lat: sourceLat, lng: sourceLng },
        zoom: 7
      });

      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer();

      directionsRenderer.setMap(map);

      directionsService.route(
              {
                origin: { lat: sourceLat, lng: sourceLng },
                destination: { lat: destLat, lng: destLng },
                travelMode: google.maps.TravelMode.DRIVING
              },
              (response, status) => {
                if (status === 'OK') {
                  directionsRenderer.setDirections(response);
                } else {
                  console.error('Directions request failed due to: ' + status);
                }
              }
      );
    })();
  }




</script>

<Toast />

<main class="container mt-5">
  <div class="card shadow-sm">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h2 class="h5 m-0">Distance Calculator</h2>
      <a href="/history" class="btn btn-outline-dark">View Historical Queries</a>
    </div>

    <div class="card-body">
      <p class="text-muted">Enter the correct full address of source and destination.</p>

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

      {#if sourceLat && sourceLng && destLat && destLng}
        <div bind:this={mapDiv} style="height: 400px; width: 100%;" class="mt-4"></div>
      {/if}


      <!-- Error Message -->
      <!--{#if errorMessage}-->
      <!--  <p class="text-danger mt-3 text-center">{errorMessage}</p>-->
      <!--{/if}-->
    </div>
  </div>
</main>
