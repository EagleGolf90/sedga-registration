    <div class="col-md-3">
      <div class="row g-0 overflow-hidden flex-md-row mb-4 shadow-sm position-relative">
        <h4 class="fst-italic ctr">Total by Clubs</h4>
        <table class="table table-striped table-bordered">
        <tr class="table-secondary ctr">
          <th>Club</th>
          <th>Totals</th>
        </tr>
<?php $total_clubs = 0;
      foreach ($byClubs as $club) {
?>
        <tr class="ctr">
          <td><?php echo $club['Clubs']; ?></td>
          <td><?php echo $club['TotalClubs']; ?></td>
        </tr>
<?php   $total_clubs += $club['TotalClubs'];
      }
?>
        <tr><td class="ctr" style="font-weight:bold">Club Totals</td><td class="ctr" style="font-weight:bold"><?php echo $total_clubs; ?></td></tr>
        </table>
      </div>
    </div>
