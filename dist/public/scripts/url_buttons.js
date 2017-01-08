"use strict";

var buttons = document.getElementById("dashboard").getElementsByTagName("button");
var arr = [].slice.call(buttons);
arr.forEach(function (button) {
  button.addEventListener("click", function (e) {
    var url = button.dataset.url;
    window.location.href = "/going/" + url;
  });
});