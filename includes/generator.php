<?php
class IDGenerator {
  private $hyphen = '-';
  private $sqlTable;

  public function __construct($sqlTable) {
    $this->sqlTable = $sqlTable;
  }

  private function concatenateFirst8GUID($charid) {
    return substr($charid, 0, 8) . $this->hyphen . substr($charid, 8, 4) . $this->hyphen . substr($charid,12, 4) . $this->hyphen . substr($charid,16, 4) . $this->hyphen . substr($charid,20,12);
  }

  public function getGUID() {
    mt_srand((double)microtime()*10000);
    $charid = strtoupper(md5(uniqid(rand(), true)));
    return $this->concatenateFirst8GUID($charid);
  }

  private function concatenateFirst3GUID($charid) {
    return substr($charid, 0, 3) . $this->hyphen . substr($charid, 3, 3) . $this->hyphen . substr($charid, 6, 3) . $this->hyphen . substr($charid, 9, 3);
  }

  private function checkSecureID($id) {
    $rows = $this->sqlTable->load('checkSecureID', array($id));
    foreach ($rows as $row) return $row['Total'];
  }

  public function getSecureID() {
    $original_string = '0123456789';
    $flag = true;
    $card_id = '';
    while ($flag) {
      $charid = $this->getRandomString($original_string, 12);
      $card_id = $this->concatenateFirst3GUID($charid);
      if ($this->checkSecureID($card_id) == 0) $flag = false;
    }
    return $card_id;
  }

  private function getRandomString($valid_chars, $length) {
    // start with an empty random string
    $random_string = "";

    // count the number of chars in the valid chars string so we know how many choices we have
    $num_valid_chars = strlen($valid_chars);

    // repeat the steps until we've created a string of the right length
    for ($i = 0; $i < $length; $i++)
    {
        // pick a random number from 1 up to the number of valid chars
        $random_pick = mt_rand(1, $num_valid_chars);

        // take the random character out of the string of valid chars
        // subtract 1 from $random_pick because strings are indexed starting at 0, and we started picking at 1
        $random_char = $valid_chars[$random_pick-1];

        // add the randomly-chosen char onto the end of our string so far
        $random_string .= $random_char;
    }

    // return our finished random string
    return $random_string;
  }

  private function registerGUID($charid) {
    return substr($charid, 0, 8) . substr($charid, 8, 3) . substr($charid,12, 5);
  }

  public function getRegisterGUID() {
    mt_srand((double)microtime()*10000);
    $charid = strtoupper(md5(uniqid(rand(), true)));
    return $this->registerGUID($charid);
  }
}
?>
