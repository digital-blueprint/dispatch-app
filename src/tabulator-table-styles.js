import {css} from 'lit';

export function getTabulatorStyles() {
    // language=css
    return css`
        /* Define the style when the column is not sorted */
        .tabulator .tabulator-header .tabulator-col.tabulator-sortable[aria-sort="none"] .tabulator-col-content .tabulator-col-sorter .tabulator-arrow{
            border-top: none;
            border-bottom: 6px solid var(--dbp-muted);
        }

        /* Define the style when the column is sorted in ascending order */
        .tabulator .tabulator-header .tabulator-col.tabulator-sortable[aria-sort="asc"] .tabulator-col-content .tabulator-col-sorter .tabulator-arrow{
            border-top: none;
            border-bottom: 6px solid var(--dbp-accent);
        }

        /* Define the style when the column is sorted in descending order */
        .tabulator .tabulator-header .tabulator-col.tabulator-sortable[aria-sort="desc"] .tabulator-col-content .tabulator-col-sorter .tabulator-arrow{
            border-bottom: none;
            border-top: 6px solid var(--dbp-accent);
            color: var(--dbp-accent);
        }        
        
        .tabulator-row, .tabulator-row.tabulator-row-even, .tabulator-row.tabulator-row-odd{
            padding-top: 0px;
            padding-bottom: 0px;
        }

        .tabulator-row .tabulator-cell{
            padding-top: 20px;
            padding-bottom: 20px;
        }

        .tabulator .tabulator-header .tabulator-frozen.tabulator-frozen-right, .tabulator-row .tabulator-frozen.tabulator-frozen-right{
            background-color:  var(--dbp-background);
            color: var(--dbp-content);
        }

        .tabulator .tabulator-footer .tabulator-paginator {
            text-align: center;
        }

        .tabulator[tabulator-layout=fitDataFill] .tabulator-tableHolder .tabulator-table {
            min-width: calc(100% - 41px);
        }
       
    `;
}