<?php
function getSeparatorColor($event) {
  if ($event == 1) return "bg-primary text-white";
  if ($event == 2) return "bg-danger text-white";
  if ($event == 3) return "bg-success text-white";
  if ($event == 4) return "bg-info text-white";
  return "";
}

function getStatusColor($status) {
  if ($status == 'P') return "text-primary";
  if ($status == 'R') return "text-danger";
  if ($status == 'W') return "text-success";
  return "";
}
?>
