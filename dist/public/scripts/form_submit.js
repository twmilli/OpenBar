"use strict";

var radius_input = document.getElementById("new_radius");
document.getElementById("radius-form").addEventListener("click", function (e) {
  var new_radius = e.target.dataset.value;
  radius_input.value = new_radius;
  this.submit();
});