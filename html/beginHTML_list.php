<!DOCTYPE html>
<html>
<head>
  <title><?php include('../head_titles.php'); ?></title>
  <meta charset="windows-1252">

  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css">
<?php
if (PAGE_NAME == 'edit_register_page.php' || PAGE_NAME == 'edit_register_page_test.php') {
?>
  <link rel="stylesheet" href="registration/css/register-custom.css">
  <link rel="stylesheet" href="registration/css/edit_style.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
  <script src="registration/js/edit_page.js"></script>
<?php
}
if (PAGE_NAME == 'registrants.php') {
?>
  <link href="https://getbootstrap.com/docs/5.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
  .bd-placeholder-img {
    font-size: 1.125rem;
    text-anchor: middle;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }

  @media (min-width: 768px) {
    .bd-placeholder-img-lg {
      font-size: 3.5rem;
    }
  }
  </style>
  <!-- Custom styles for this template -->
  <link href="https://fonts.googleapis.com/css?family=Playfair&#43;Display:700,900&amp;display=swap" rel="stylesheet">
  <!-- Custom styles for this template -->
  <link href="https://getbootstrap.com/docs/5.0/examples/blog/blog.css" rel="stylesheet">
<?php } else { ?>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
<?php } ?>
  <link rel="stylesheet" href="css/sedga-custom.css">
  <link href="css/kdga_style.css" rel="stylesheet">
</head>

<body class="list_color">
