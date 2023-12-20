import React from 'react'

export const NoResultsFoundText = (
  <span data-testid="no-result-found-only">
    No results found.
  </span>
)
export const NoSelectedIndexText = (
  <span data-testid="no-result-select-index">
    Select an index and enter a query to search per values of keys.
  </span>
)

export const FullScanNoResultsFoundText = (
  <>
    <span data-test-subj="no-result-found">No results found.</span>
    <br />
    <span data-test-subj="search-advices">
      Check the spelling.
      <br />
      Check upper and lower cases.
      <br />
      Use an asterisk (*) in your request for more generic results.
    </span>
  </>
)
export const ScanNoResultsFoundText = (
  <>
    <span data-testid="scan-no-results-found">No results found.</span>
    <br />
    <span>
      Use &quot;Scan more&quot; button to proceed or filter per exact Key Name to scan more efficiently.
    </span>
  </>
)

// export const lastDeliveredIDTooltipText = (
//   <>
//     Specify the ID of the last delivered entry in the stream from the new group's perspective.
//     <br />
//     Otherwise, <b>$</b> represents the ID of the last entry in the stream,&nbsp;
//     <b>0</b> fetches the entire stream from the beginning.
//   </>
// )
