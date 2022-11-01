/* eslint-disable object-shorthand */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 6,
  });


}



window.initMap = initMap;
