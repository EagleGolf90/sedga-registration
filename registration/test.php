<html>
<head>
  <title>reCAPTCHA Example</title>
  <!-- Include this in the <head> or before </body> -->
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</head>

<!-- Your HTML form -->
<form action="verify-recaptcha.php" method="post">
  <input type="text" name="name" placeholder="Your Name" required>
  
  <!-- reCAPTCHA widget -->
  <div class="g-recaptcha" data-sitekey="6LcO9vErAAAAACrXaBNfrSQmeR8A3sw62g1rzxr-"></div>
  
  <button type="submit">Submit</button>
</form>

</body>
</html>
