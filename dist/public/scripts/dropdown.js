"use strict";

function openDropdown(e, id) {
  document.getElementById(id).classList.toggle("show");
}

document.getElementById("radius-btn").addEventListener("click", openDropdown.bind(null, null, "radius-dropdown"));
document.getElementById("location-btn").addEventListener("click", openDropdown.bind(null, null, "location-dropdown"));

window.onclick = function (event) {
  if (!event.target.matches('.drop-btn') && !event.target.matches('#location')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};