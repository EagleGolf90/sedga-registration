<?php
class RegistrationHandler {
  private $sqlTable;
  private $generator;

  public function __construct($sqlTable) {
    $this->sqlTable = $sqlTable;
    $this->generator = new KDGAGenerator();
  }

  public function generateSecureID() {
    return $this->generator->getGUID();
  }

  public function getUniqueId() {
    return $this->sqlTable->load('getUniqueID', array('SEDGA', 'RegisterID'));
  }

}
?>
