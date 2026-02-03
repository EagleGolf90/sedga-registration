    <div class="col-md-3">
      <div class="row g-0 overflow-hidden flex-md-row mb-4 shadow-sm position-relative">
        <h4 class="fst-italic ctr">Total by States</h4>
        <table class="table table-striped table-bordered">
        <tr class="table-secondary ctr">
          <th>State</th>
          <th>Totals</th>
        </tr>
<?php $total_states = 0;
      $number_of_states = 0;
      $old_country = '';
      foreach ($byState as $state_row) {
        if ($old_country != $state_row['Country'])
        {
          echo '<tr class="ctr">' . "\n";
          echo '<td colspan="2" style="background-color: lightgray">' . $state_row['Country'] . '</td>' . "\n";
          echo '</tr>' . "\n";
        }
?>
        <tr class="ctr">
          <td><?php echo $state_row['State']; ?></td>
          <td><?php echo $state_row['TotalStates']; ?></td>
        </tr>
<?php
        $total_states += $state_row['TotalStates'];
        $number_of_states += 1;
        $old_country = $state_row['Country'];
      }
?>
        <tr><td class="ctr" style="font-weight:bold"># of States</td><td class="ctr" style="font-weight:bold"><?php echo $number_of_states; ?></td></tr>
        <tr><td class="ctr" style="font-weight:bold">State Totals</td><td class="ctr" style="font-weight:bold"><?php echo $total_states; ?></td></tr>
        </table>
      </div>
    </div>
