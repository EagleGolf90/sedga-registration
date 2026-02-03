    <div class="col-md-3">
      <div class="row g-0 overflow-hidden flex-md-row mb-4 shadow-sm position-relative">
        <h4 class="fst-italic ctr">Total by Divisions</h4>
        <table class="table table-striped table-bordered">
        <tr class="table-secondary ctr">
          <th>Division</th>
          <th>Totals</th>
        </tr>
<?php $total_divisions = 0;
      foreach ($byDivisions as $division) {
?>
        <tr class="ctr">
          <td><?php echo $division['Division']; ?></td>
          <td><?php echo $division['TotalDivision']; ?></td>
        </tr>
<?php   $total_divisions += $division['TotalDivision'];
      }
?>
        <tr><td class="ctr" style="font-weight:bold">Division Totals</td><td class="ctr" style="font-weight:bold"><?php echo $total_divisions; ?></td></tr>
        </table>
      </div>
    </div>
