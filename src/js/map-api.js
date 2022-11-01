let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
  });


}



window.initMap = initMap;
