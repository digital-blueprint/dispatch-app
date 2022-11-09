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
