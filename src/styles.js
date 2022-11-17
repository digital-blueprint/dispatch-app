import {css} from 'lit';

export function getShowDispatchRequestsCss() {
    // language=css
    return css`
        /**********************************\\
            Tabulator table styles
         \\*********************************/

        .tabulator .tabulator-header .tabulator-col .tabulator-col-content {
            display: inline-flex;
            padding: 0px;
        }

        .checkmark {
            height: 20px;
            width: 20px;
            left: 10px;
            top: 8px;
        }
        
        .button-container .checkmark::after {
            left: 7px;
            top: 2px;
            width: 5px;
            height: 11px;
        }
        
        .force-no-select {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        
        .filename {
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
            white-space: nowrap;
        }


        .select-all-icon {
            height: 40px;
            position: absolute;
            top: -27px;
        }
        
        .tabulator {
            overflow: unset;
        }




        /**************************************************************************************************************/

        /* Toggle Button Styles */

     
        
            .tabulator-row .tabulator-responsive-collapse {
                border: none;
            }
                
        .tabulator-row .tabulator-cell.tabulator-row-handle {
            display: inline-block!important;
        }
    
        /* TODO sets the grey color to white */
        .tabulator-row .tabulator-cell .tabulator-responsive-collapse-toggle {
            height: 100%;
            width: 100%;
            /*background-color: unset;*/
        }
    
            .tabulator-responsive-collapse-toggle-open,
            .tabulator-responsive-collapse-toggle-close {
                content: none;
                visibility: hidden;
            }
    
    
            .tabulator-responsive-collapse-toggle-open::after,
            .tabulator-responsive-collapse-toggle-close::after {
                content: '\\00a0\\00a0\\00a0\\00a0\\00a0';
                background-color: var(--dbp-content);
                -webkit-mask-repeat: no-repeat;
                mask-repeat: no-repeat;
                -webkit-mask-position: center center;
                mask-position: center center;
                margin: 0 0 0 4px;
                padding: 0 0 0.25% 0;
                -webkit-mask-size: 100%;
                mask-size: 100%;
                visibility: visible;
            }
            
        /*.tabulator-responsive-collapse-toggle.dbp-open {
            content: url("data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e %3c!-- Generator: Adobe Illustrator 26.1.0%2c SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3e %3csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 24.6 62.4' style='enable-background:new 0 0 24.6 62.4%3b' xml:space='preserve'%3e%3cg transform='translate(-382.21 -336.98)'%3e%3cg%3e%3cpath d='M388%2c380.5c-0.2%2c0-0.4-0.1-0.6-0.3c-0.3-0.3-0.3-0.8%2c0.1-1.1l12.5-10.9l-12.5-10.9c-0.3-0.3-0.4-0.8-0.1-1.1 c0.3-0.3%2c0.8-0.4%2c1.1-0.1l13.1%2c11.5c0.2%2c0.2%2c0.3%2c0.4%2c0.3%2c0.6s-0.1%2c0.5-0.3%2c0.6l-13.1%2c11.5C388.4%2c380.4%2c388.2%2c380.5%2c388%2c380.5z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e");
        }
        
        .tabulator-responsive-collapse-toggle {
            content: url("data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e %3c!-- Generator: Adobe Illustrator 26.1.0%2c SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3e %3csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 24.6 62.4' style='enable-background:new 0 0 24.6 62.4%3b' xml:space='preserve'%3e%3cg transform='translate(-382.21 -336.98)'%3e%3cg%3e%3cpath d='M382.2%2c361.7c0-0.2%2c0.1-0.4%2c0.3-0.6c0.3-0.3%2c0.8-0.3%2c1.1%2c0.1l10.9%2c12.5l10.9-12.5c0.3-0.3%2c0.8-0.4%2c1.1-0.1 c0.3%2c0.3%2c0.4%2c0.8%2c0.1%2c1.1l-11.5%2c13.1c-0.2%2c0.2-0.4%2c0.3-0.6%2c0.3s-0.5-0.1-0.6-0.3l-11.5-13.1C382.3%2c362.1%2c382.2%2c361.9%2c382.2%2c361.7z '/%3e%3c/g%3e%3c/g%3e%3c/svg%3e");
        }*/
    
            .tabulator-responsive-collapse-toggle-open::after {
                -webkit-mask-image: url("data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e %3c!-- Generator: Adobe Illustrator 26.1.0%2c SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3e %3csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 24.6 62.4' style='enable-background:new 0 0 24.6 62.4%3b' xml:space='preserve'%3e%3cg transform='translate(-382.21 -336.98)'%3e%3cg%3e%3cpath d='M388%2c380.5c-0.2%2c0-0.4-0.1-0.6-0.3c-0.3-0.3-0.3-0.8%2c0.1-1.1l12.5-10.9l-12.5-10.9c-0.3-0.3-0.4-0.8-0.1-1.1 c0.3-0.3%2c0.8-0.4%2c1.1-0.1l13.1%2c11.5c0.2%2c0.2%2c0.3%2c0.4%2c0.3%2c0.6s-0.1%2c0.5-0.3%2c0.6l-13.1%2c11.5C388.4%2c380.4%2c388.2%2c380.5%2c388%2c380.5z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e");
                mask-image: url("data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e %3c!-- Generator: Adobe Illustrator 26.1.0%2c SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3e %3csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 24.6 62.4' style='enable-background:new 0 0 24.6 62.4%3b' xml:space='preserve'%3e%3cg transform='translate(-382.21 -336.98)'%3e%3cg%3e%3cpath d='M388%2c380.5c-0.2%2c0-0.4-0.1-0.6-0.3c-0.3-0.3-0.3-0.8%2c0.1-1.1l12.5-10.9l-12.5-10.9c-0.3-0.3-0.4-0.8-0.1-1.1 c0.3-0.3%2c0.8-0.4%2c1.1-0.1l13.1%2c11.5c0.2%2c0.2%2c0.3%2c0.4%2c0.3%2c0.6s-0.1%2c0.5-0.3%2c0.6l-13.1%2c11.5C388.4%2c380.4%2c388.2%2c380.5%2c388%2c380.5z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e");
                margin-left: -9px;
            }
    
            .tabulator-responsive-collapse-toggle-close::after {
                -webkit-mask-image: url("data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e %3c!-- Generator: Adobe Illustrator 26.1.0%2c SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3e %3csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 24.6 62.4' style='enable-background:new 0 0 24.6 62.4%3b' xml:space='preserve'%3e%3cg transform='translate(-382.21 -336.98)'%3e%3cg%3e%3cpath d='M382.2%2c361.7c0-0.2%2c0.1-0.4%2c0.3-0.6c0.3-0.3%2c0.8-0.3%2c1.1%2c0.1l10.9%2c12.5l10.9-12.5c0.3-0.3%2c0.8-0.4%2c1.1-0.1 c0.3%2c0.3%2c0.4%2c0.8%2c0.1%2c1.1l-11.5%2c13.1c-0.2%2c0.2-0.4%2c0.3-0.6%2c0.3s-0.5-0.1-0.6-0.3l-11.5-13.1C382.3%2c362.1%2c382.2%2c361.9%2c382.2%2c361.7z '/%3e%3c/g%3e%3c/g%3e%3c/svg%3e");
                mask-image: url("data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e %3c!-- Generator: Adobe Illustrator 26.1.0%2c SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3e %3csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 24.6 62.4' style='enable-background:new 0 0 24.6 62.4%3b' xml:space='preserve'%3e%3cg transform='translate(-382.21 -336.98)'%3e%3cg%3e%3cpath d='M382.2%2c361.7c0-0.2%2c0.1-0.4%2c0.3-0.6c0.3-0.3%2c0.8-0.3%2c1.1%2c0.1l10.9%2c12.5l10.9-12.5c0.3-0.3%2c0.8-0.4%2c1.1-0.1 c0.3%2c0.3%2c0.4%2c0.8%2c0.1%2c1.1l-11.5%2c13.1c-0.2%2c0.2-0.4%2c0.3-0.6%2c0.3s-0.5-0.1-0.6-0.3l-11.5-13.1C382.3%2c362.1%2c382.2%2c361.9%2c382.2%2c361.7z '/%3e%3c/g%3e%3c/g%3e%3c/svg%3e");
                margin-left: -8px;
            }
    
            .tabulator-responsive-collapse-toggle-open:hover::after,
            .tabulator-responsive-collapse-toggle-close:hover::after {
                background-color: var(--dbp-hover-color, var(--dbp-content));
            }
    
            .tabulator-selected .tabulator-responsive-collapse-toggle-open::after,
            .tabulator-selected .tabulator-responsive-collapse-toggle-close::after {
                background-color: var(--dbp-hover-color, var(--dbp-on-content-surface));
            }
    
            .tabulator-row.tabulator-selectable.tabulator-selected.no-select-styles .tabulator-responsive-collapse-toggle-close::after,
            .tabulator-row.tabulator-selectable.tabulator-selected.no-select-styles:hover .tabulator-responsive-collapse-toggle-close::after,
            .tabulator-row.tabulator-selectable.tabulator-selected.no-select-styles .tabulator-responsive-collapse-toggle-open::after,
            .tabulator-row.tabulator-selectable.tabulator-selected.no-select-styles:hover .tabulator-responsive-collapse-toggle-open::after {
                background-color: var(--dbp-content);
            }
            
            
            /**************************************************************************************************************/
        
        /*.tabulator-row .tabulator-cell .tabulator-responsive-collapse-toggle {*/
        /*    height: 32px;*/
        /*    width: 32px;*/
        /*    background-color: unset;*/
        /*    color: var(--dbp-content);*/
        /*    font-size: 1.3em;*/
        /*    margin-top: -8px;*/
        /*}*/
        
        /*.tabulator-responsive-collapse-toggle-open,*/
        /*.tabulator-responsive-collapse-toggle-close {*/
        /*    width: 100%;*/
        /*    height: 100%;*/
        /*    line-height: 37px;*/
        /*}*/
        
        /*.tabulator-responsive-collapse-toggle-open,*/
        /*.tabulator-responsive-collapse-toggle-close {*/
        /*    content: none;*/
        /*    visibility: hidden;*/
        /*}*/
        
        /*.tabulator-responsive-collapse-toggle-open::after {*/
        /*    content: '\\\\00a0\\\\00a0\\\\00a0';*/
        /*    background-color: var(--dbp-content);*/
        /*    -webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzJfMV8iIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik0yOS42LDk3LjZsNDQuMi00NC40YzAuOS0wLjksMS4zLTIuMSwxLjMtMy4zYzAtMS4yLTAuNS0yLjQtMS4zLTMuM0wyOS42LDIuNGMtMS4xLTEuMS0yLjgtMS4xLTMuOSwwCgljLTAuNSwwLjUtMC44LDEuMi0wLjgsMS45YzAsMC43LDAuMywxLjQsMC44LDEuOWw0My42LDQzLjZMMjUuNyw5My43Yy0xLjEsMS4xLTEuMSwyLjgsMCwzLjlDMjYuOCw5OC43LDI4LjUsOTguNywyOS42LDk3LjZ6Ii8+Cjwvc3ZnPgo=');*/
        /*    mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzJfMV8iIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik0yOS42LDk3LjZsNDQuMi00NC40YzAuOS0wLjksMS4zLTIuMSwxLjMtMy4zYzAtMS4yLTAuNS0yLjQtMS4zLTMuM0wyOS42LDIuNGMtMS4xLTEuMS0yLjgtMS4xLTMuOSwwCgljLTAuNSwwLjUtMC44LDEuMi0wLjgsMS45YzAsMC43LDAuMywxLjQsMC44LDEuOWw0My42LDQzLjZMMjUuNyw5My43Yy0xLjEsMS4xLTEuMSwyLjgsMCwzLjlDMjYuOCw5OC43LDI4LjUsOTguNywyOS42LDk3LjZ6Ii8+Cjwvc3ZnPgo=');*/
        /*    -webkit-mask-repeat: no-repeat;*/
        /*    mask-repeat: no-repeat;*/
        /*    -webkit-mask-position: center -2px;*/
        /*    mask-position: center center;*/
        /*    padding: 0 0 0.25% 0;*/
        /*    margin: 0px;*/
        /*    -webkit-mask-size: 30%;*/
        /*    mask-size: 30%;*/
        /*    visibility: visible;*/
        
        /*    width: 100%;*/
        /*    height: 100%;*/
        /*    position: absolute;*/
        /*    left: 0px;*/
        /*}*/
        
        /*.tabulator-row.tabulator-selected .tabulator-responsive-collapse-toggle-open::after {*/
        /*    background-color: var(--dbp-on-content-surface);*/
        /*}*/
        
        /*.tabulator-responsive-collapse-toggle-close::after {*/
        /*   */
        /*    content: '\\\\00a0\\\\00a0\\\\00a0';*/
        /*    background-color: var(--dbp-content);*/
        /*    -webkit-mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzJfMV8iIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik0yLjQsMjkuNmw0NC40LDQ0LjJjMC45LDAuOSwyLjEsMS4zLDMuMywxLjNjMS4yLDAsMi40LTAuNSwzLjMtMS4zbDQ0LjItNDQuMmMxLjEtMS4xLDEuMS0yLjgsMC0zLjkKCWMtMC41LTAuNS0xLjItMC44LTEuOS0wLjhjLTAuNywwLTEuNCwwLjMtMS45LDAuOEw1MC4xLDY5LjNMNi4zLDI1LjdjLTEuMS0xLjEtMi44LTEuMS0zLjksMEMxLjMsMjYuOCwxLjMsMjguNSwyLjQsMjkuNnoiLz4KPC9zdmc+Cg==');*/
        /*    mask-image: url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIyLjAuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzJfMV8iIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCAxMDAgMTAwOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik0yLjQsMjkuNmw0NC40LDQ0LjJjMC45LDAuOSwyLjEsMS4zLDMuMywxLjNjMS4yLDAsMi40LTAuNSwzLjMtMS4zbDQ0LjItNDQuMmMxLjEtMS4xLDEuMS0yLjgsMC0zLjkKCWMtMC41LTAuNS0xLjItMC44LTEuOS0wLjhjLTAuNywwLTEuNCwwLjMtMS45LDAuOEw1MC4xLDY5LjNMNi4zLDI1LjdjLTEuMS0xLjEtMi44LTEuMS0zLjksMEMxLjMsMjYuOCwxLjMsMjguNSwyLjQsMjkuNnoiLz4KPC9zdmc+Cg==');*/
        /*    -webkit-mask-repeat: no-repeat;*/
        /*    mask-repeat: no-repeat;*/
        /*    -webkit-mask-position: center -2px;*/
        /*    mask-position: center center;*/
        /*    margin: 0px;*/
        /*    padding: 0 0 0.25% 0;*/
        /*    -webkit-mask-size: 30%;*/
        /*    mask-size: 30%;*/
        /*    visibility: visible;*/
        /*    position: absolute;*/
        
        /*    width: 100%;*/
        /*    height: 100%;*/
        /*    position: absolute;*/
        /*    left: 0px;*/
        /*}*/

        /*.tabulator-row.tabulator-selected .tabulator-responsive-collapse-toggle-close::after {*/
        /*    background-color: var(--dbp-on-content-surface);*/
        /*}*/
        
        /*.tabulator-row-handle {*/
        /*    padding: 0px !important;*/
        /*}*/
        
        /*.tabulator-selected .tabulator-responsive-collapse-toggle-open,*/
        /*.tabulator-selected .tabulator-responsive-collapse-toggle-close {*/
        /*    color: var(--dbp-on-content-surface);*/
        /*}*/

        .tabulator .tabulator-header .tabulator-col[tabulator-field="details"] {
            min-height: 37px !important;
            /*display: inline-block !important;*/
            font-weight: 400;
        }
        
        .tabulator-responsive-collapse table {
            border-spacing: 1em;
            width: 100%;
            border-top: var(--dbp-border);
        }

        /*.tabulator-row .tabulator-responsive-collapse {*/
        /*    border-top: var(--dbp-border);*/
        /*}*/
        
        .tabulator-responsive-collapse table tr td {
            vertical-align: top;
        }

        .tabulator .tabulator-footer {
            background-color: var(--dbp-background);
            color: var(--dbp-content);
        }

        .tabulator .tabulator-footer .tabulator-paginator .tabulator-page {
            opacity: unset;
            border: var(--dbp-border);
            border-radius: var(--dbp-border-radius);
            color: var(--dbp-content);
            cursor: pointer;
            justify-content: center;
            padding-bottom: calc(0.375em - 1px);
            padding-left: 0.75em;
            padding-right: 0.75em;
            padding-top: calc(0.375em - 1px);
            text-align: center;
            white-space: nowrap;
            font-size: inherit;
            font-weight: bolder;
            font-family: inherit;
            transition: all 0.15s ease 0s, color 0.15s ease 0s;
            background: var(--dbp-secondary-surface);
            color: var(--dbp-on-secondary-surface);
            border-color: var(--dbp-secondary-surface-border-color);
            box-sizing: border-box;
            min-height: 40px;
        }

        .tabulator .tabulator-footer .tabulator-paginator .tabulator-page-size {
            box-sizing: border-box;
            border: var(--dbp-border);
            border-radius: var(--dbp-border-radius);
            padding-left: 0.75em;
            padding-right: 1.7em;
            padding-top: calc(0.5em - 1px);
            padding-bottom: calc(0.5em - 1px);
            cursor: pointer;
            background-position-x: calc(100% - 0.4rem);
            background-size: auto 45%;
            min-height: 40px;
        }

        .tabulator .tabulator-footer .tabulator-paginator .tabulator-page[disabled] {
            opacity: 0.4;
        }

        .tabulator .tabulator-footer .tabulator-page:not(.disabled):hover {
            background: var(--dbp-secondary-surface);
            color: var(--dbp-content);
        }

        .tabulator .tabulator-footer .tabulator-page.active {
            background: var(--dbp-on-secondary-surface);
            color: var(--dbp-secondary-surface);
            border-color: var(--dbp-secondary-surface-border-color);
        }

        .tabulator .tabulator-footer .tabulator-page.active:hover {
            background: var(--dbp-on-secondary-surface);
            color: var(--dbp-secondary-surface);
            border-color: var(--dbp-secondary-surface-border-color);
        }

        .tabulator-row .tabulator-frozen, .tabulator .tabulator-header .tabulator-col.tabulator-frozen{
            background-color: var(--dbp-background);
        }

        .tabulator-row.tabulator-selectable.tabulator-selected:hover, .tabulator-row.tabulator-selected .tabulator-frozen{
            color: var(--dbp-hover-color, var(--dbp-on-content-surface));
            background-color: var(--dbp-hover-background-color, var(--dbp-content-surface));
        }

        .tabulator .tabulator-header .tabulator-frozen.tabulator-frozen-right, 
        .tabulator-row .tabulator-frozen.tabulator-frozen-right {
            border-left: unset;
        }

        .tabulator .tabulator-footer .tabulator-paginator label {
            color: var(--dbp-content);
            font-weight: 400;
        }

        .tabulator .tabulator-footer .tabulator-paginator {
            flex-direction: row;
            display: flex;
            align-items: center;
        }
        
        .tabulator .tabulator-footer .tabulator-footer-contents {
            flex-direction: column;
        }

        @media only screen and (orientation: portrait) and (max-width: 768px) {
            .tabulator .tabulator-tableHolder {
                white-space: inherit;
            }

            .modal-container {
                width: 100%;
                height: 100%;
                max-width: 100%;
            }
        }
        
        /**************************\\
         Tablet Portrait Styles
       \\**************************/

        @media only screen and (orientation: portrait) and (max-width: 768px) {
            

        }

        /**************************\\
         Mobile Portrait Styles
        \\**************************/

        @media only screen and (orientation: portrait) and (max-width: 768px) {
        }
    `;
}

export function getDispatchRequestStyles() {
    // language=css
    return css`
            a {
                color: var(--dbp-override-content);
                cursor: pointer;
                text-decoration: none;
            }

            h3 {
                font-weight: 300;
                margin-top: 1.3em;
                margin-bottom: 1.3em;
            }

            select:not(.select) {
                background-size: 13px;
                background-position-x: calc(100% - 0.4rem);
                padding-right: 1.3rem;
                height: 33px;
            }

            .country-select {
                width: 100%;
            }

            .request-buttons {
                display: flex;
                justify-content: flex-end;
                gap: 3px;
                margin-top: -1.5em;
                padding-bottom: 1.5em;
            }

            .edit-recipient-btn {
                margin-left: -1.5em;
                padding-bottom: 1em;
            }

            .request-item.details .recipients-data,
            .request-item.details .files-data {
                display: grid;
                gap: 1.5em;
                grid-template-columns: 1fr 1fr 1fr;
            }

            .request-item.details .recipients-data {
                padding-bottom: 2em;
            }

            .request-item.details .request-buttons {
                padding-top: 1.5em;
                border-top: 1px solid var(--dbp-override-muted);
            }

            .request-item.details .sender-data-btn {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }

            .recipient-entry .border,
            .file-entry .border {
                margin-left: -1.5em;
                margin-bottom: 1em;
            }

            .edit-recipient-btn {
                margin-left: -1.5em;
                padding-bottom: 1em;
            }

            .recipient-entry .border,
            .file-entry .border {
                margin-left: -1.5em;
                margin-bottom: 1em;
            }

            .file-entry {
                display: flex;
                justify-content: space-between;
            }

            #add-file-2-btn {
                margin-top: 1em;
            }

            .delete-file-btn {
                margin-top: 0.5em;
            }

            .rec-2-btns {
                display: flex;
                flex-direction: row-reverse;
            }

            .selected-buttons {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }

            .file-entry {
                display: flex;
                justify-content: space-between;
            }

            #add-file-2-btn {
                margin-top: 1em;
            }

            .delete-file-btn {
                margin-top: 0.5em;
            }

            .rec-2-btns {
                display: flex;
                flex-direction: row-reverse;
            }

            .selected-buttons {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }

            h2:first-child {
                margin-top: 0;
            }

            h2 {
                margin-bottom: 10px;
            }

            #edit-sender-modal-box,
            #add-sender-modal-box,
            #add-recipient-modal-box,
            #edit-recipient-modal-box,
            #add-subject-modal-box,
            #show-recipient-modal-box {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 15px 20px 20px;
                min-width: 320px;
            }
            
            #edit-recipient-modal-box {
                max-height: 630px;
                min-height: 630px;
                max-width: 400px;
            }

            #add-recipient-modal-box,
            #edit-sender-modal-box,
            #add-sender-modal-box {
                max-height: 715px;
                min-height: 715px;
                max-width: 400px;
            }

            #add-subject-modal-box {
                height: auto;
                min-height: 190px;
                max-width: 500px;
            }

            #show-recipient-modal-box {
                height: auto;
                min-height: fit-content;
                max-width: 400px;
            }

            #edit-sender-modal-box header.modal-header,
            #add-sender-modal-box header.modal-header,
            #add-recipient-modal-box header.modal-header,
            #edit-recipient-modal-box header.modal-header,
            #show-recipient-modal-box header.modal-header,
            #add-subject-modal-box header.modal-header {
                padding: 0px;
                display: flex;
                justify-content: space-between;
            }

            #show-recipient-modal-box header.modal-header {
                padding: 0 10px 20px 0;
            }

            #edit-sender-modal-box footer.modal-footer .modal-footer-btn,
            #add-sender-modal-box footer.modal-footer .modal-footer-btn,
            #add-recipient-modal-box footer.modal-footer .modal-footer-btn,
            #edit-recipient-modal-box footer.modal-footer .modal-footer-btn,
            #show-recipient-modal-box footer.modal-footer .modal-footer-btn,
            #add-subject-modal-box footer.modal-footer .modal-footer-btn {
                padding: 0px;
                display: flex;
                justify-content: space-between;
            }

            #show-recipient-modal-box footer.modal-footer .modal-footer-btn {
                padding: 0 10px 10px 0;
            }

            #edit-sender-modal-content,
            #add-sender-modal-content,
            #add-recipient-modal-content,
            #edit-recipient-modal-content,
            #add-subject-modal-content {
                display: flex;
                padding-left: 0px;
                padding-right: 0px;
                overflow: unset;
                gap: 1em;
                flex-direction: column;
            }

            #edit-sender-modal-content div .input,
            #add-sender-modal-content div .input,
            #add-recipient-modal-content div .input,
            #edit-recipient-modal-content div .input,
            #add-subject-modal-content div .input {
                width: 100%;
            }

            #edit-sender-modal-content .nf-label,
            #add-sender-modal-content .nf-label,
            #add-recipient-modal-content .nf-label,
            #edit-recipient-modal-content .nf-label,
            #add-subject-modal-content .nf-label {
                padding-bottom: 2px;
            }

            #edit-sender-modal-title,
            #add-sender-modal-title,
            #add-recipient-modal-title,
            #edit-recipient-modal-title,
            #show-recipient-modal-title,
            #add-subject-modal-title {
                margin: 0;
                padding: 0.25em 0 0 0;
            }

            .line {
                border-right: 1px solid var(--dbp-override-muted);
            }

            .details.header {
                display: grid;
                grid-template-columns: 1fr 1px 1fr 1px 1fr;
                padding-bottom: 1.5em;
                border-bottom: 1px solid var(--dbp-override-muted);
                text-align: center;
            }

            .details.sender, .details.files {
                padding-top: 1.5em;
                padding-bottom: 1.5em;
                border-bottom: 1px solid var(--dbp-override-muted);
            }

            .details.recipients {
                padding-top: 1.5em;
            }

            .section-titles {
                font-size: 1.3em;
                color: var(--dbp-override-muted);
                text-transform: uppercase;
                padding-bottom: 0.5em;
            }

            .header-btn {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }

            .card {
                display: grid;
                grid-template-columns: 4fr min-content;
                border: 1px solid var(--dbp-override-muted);
                min-width: 320px;
            }

            .left-side {
                margin: 18px;
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .left-side div {
                word-break: break-all;
            }

            .file.card .left-side {
                padding-bottom: 1.4em;
            }

            .file.card .left-side div:first-child {
                padding-bottom: 0.2em;
                font-weight: 400;
            }

            .right-side {
                padding: 10px;
                color: #FFFFFF;
                background-color: #245b78;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 10px;
            }

            .right-side dbp-icon {
                color: #FFFFFF;
            }

            .recipients-data, .files-data {
                margin-top: 0.5em;
            }

            .status-green {
                color: var(--dbp-override-success);
            }

            .status-orange {
                color: var(--dbp-override-warning-surface);
            }

            .back-container {
                padding-top: 1em;
                /*padding-bottom: 0.5em;*/
            }

            .section-title-counts {
                font-style: italic;
            }

            .element-left {
                background-color: var(--dbp-primary-surface);
                color: var(--dbp-on-primary-surface);
                padding: 0px 20px 12px 40px;
                text-align: right;
            }

            .element-left.first, .element-right.first {
                padding-top: 12px;
            }

            .element-right {
                text-align: left;
                margin-left: 12px;
                padding: 0px 0px 12px;
            }

            .detailed-recipient-modal-content-wrapper {
                display: grid;
                grid-template-columns: min-content auto;
                grid-template-rows: auto;
                max-height: calc(100vh - 149px);
                overflow-y: auto;
                width: 100%;
            }

            @media only screen and (orientation: portrait) and (max-width: 768px) {

                .edit-selection-buttons {
                    display: flex;
                    flex-direction: column-reverse;
                    gap: 1em;
                }

                .filter-buttons {
                    width: calc(100% - 45px);
                }

                #show-recipient-modal-box {
                    height: 100%;
                }

                #show-recipient-modal-box header.modal-header {
                    padding: 0;
                }

                #show-recipient-modal-box .detailed-recipient-modal-content-wrapper {
                    grid-template-columns: unset;
                    max-height: calc(100vh - 70px);
                }

                .mobile-hidden {
                    display: none;
                }

                .element-right {
                    margin-left: 12px;
                    padding: 0 0 12px 0;
                }

                .element-right.first {
                    padding-top: 0;
                }

                .element-left {
                    text-align: left;
                    padding: 10px 5px 10px 5px;
                    background-color: inherit;
                    color: inherit;
                    font-weight: 400;
                    border-top: 1px solid #3333;
                }

                .element-left.first {
                    margin-top: 10px;
                    border-top: 0;
                }

                .btn-row-left {
                    display: flex;
                    justify-content: space-between;
                    flex-direction: row;
                    gap: 4px;
                    height: 40px;
                }
            }

            @media only screen and (max-width: 859.9px) {
                .request-item.details .recipients-data,
                .request-item.details .files-data {
                    gap: 1.5em;
                    grid-template-columns: 1fr;
                }

                .details.header {
                    grid-template-columns: unset;
                    gap: 0.5em;
                    text-align: left;
                }

                .header-btn {
                    flex-direction: column;
                    padding-bottom: 1em;
                }

                .request-buttons {
                    flex-direction: column-reverse;
                    gap: 1em;
                }

                .request-buttons .submit-button,
                .request-buttons .edit-buttons {
                    display: flex;
                    flex-direction: column;
                }

                .details.sender .header-btn {
                    flex-direction: row;
                    padding-bottom: 0;
                }

                .sender-data {
                    margin-bottom: 0;
                }
            }

            @media only screen and (max-width: 369.9px) {
                .card {
                    min-width: 30px;
                    max-width: 320px;
                }
            }

            @media only screen and (min-width: 370px) and (max-width: 859.9px) {
                .card {
                    min-width: 320px;
                    max-width: unset;
                }
            }

            @media only screen and (min-width: 860px) and (max-width: 949.9px) {
                .request-item.details .recipients-data,
                .request-item.details .files-data {
                    gap: 0.5em;
                    grid-template-columns: 1fr 1fr;
                }
            }

            @media only screen and (min-width: 950px) and (max-width: 1250px) {
                .request-item.details .recipients-data,
                .request-item.details .files-data {
                    gap: 1.5em;
                    grid-template-columns: 1fr 1fr;
                }
            }
        `;
}
