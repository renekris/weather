export default function initMap(lat, lng) {
  // eslint-disable-next-line no-unused-vars
  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat, lng },
    zoom: 6,
    gestureHandling: "none",
    zoomControl: false,
    disableDefaultUI: true,
  });
}
