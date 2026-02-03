    <div class="col-md-3">
      <div class="row g-0 overflow-hidden flex-md-row mb-4 shadow-sm position-relative">
        <h4 class="fst-italic ctr">Total by Status</h4>
        <table class="table table-striped table-bordered">
        <tr class="table-secondary ctr">
          <th>Status</th>
          <th>Totals</th>
        </tr>
<?php $total_statuses = 0;
      foreach ($byStatus as $stat) {
?>
        <tr class="ctr">
          <td><?php echo $stat['Status']; ?></td>
          <td><?php echo $stat['TotalStatus']; ?></td>
        </tr>
<?php   $total_statuses += $stat['TotalStatus'];
      }
?>
        <tr><td class="ctr" style="font-weight:bold">Status Totals</td><td class="ctr" style="font-weight:bold"><?php echo $total_statuses; ?></td></tr>
        </table>
      </div>
    </div>
