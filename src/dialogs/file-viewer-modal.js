import {Modal, ScopedElementsMixin} from '@dbp-toolkit/common';
import DBPLitElement from '@dbp-toolkit/common/dbp-lit-element';
import {PdfViewer} from '@dbp-toolkit/pdf-viewer';
import {createInstance} from '../i18n.js';
import {html} from 'lit';

export class DispatchFileViewerModal extends ScopedElementsMixin(DBPLitElement) {
    constructor() {
        super();
        this._i18n = createInstance();
        this.lang = this._i18n.language;
    }

    static get scopedElements() {
        return {
            'dbp-modal': Modal,
            'dbp-pdf-viewer': PdfViewer,
        };
    }

    static get properties() {
        return {
            lang: {type: String},
        };
    }

    update(changedProperties) {
        if (changedProperties.has('lang')) {
            this._i18n.changeLanguage(this.lang);
        }

        super.update(changedProperties);
    }

    async showPDF(file) {
        await this.updateComplete;
        /** @type {PdfViewer} */ (this._('#file-viewer')).showPDF(file);
        this.open();
    }

    open() {
        this._('#modal').open();
    }

    close() {
        this._('#modal').close();
    }

    render() {
        const i18n = this._i18n;

        return html`
            <dbp-modal
                id="modal"
                modal-id="file-viewer-modal"
                title="${i18n.t('show-requests.file-viewer-dialog-title')}"
                style="
                    --dbp-modal-width: 90%;
                    --dbp-modal-max-width: 90%;
                    --dbp-modal-min-height: 90vh;
                    --dbp-modal-max-height: 90vh;
                    --dbp-modal-content-overflow-y: auto;
                "
                lang="${this.lang}">
                <div slot="content">
                    <dbp-pdf-viewer
                        lang="${this.lang}"
                        auto-resize="cover"
                        id="file-viewer"></dbp-pdf-viewer>
                </div>
            </dbp-modal>
        `;
    }
}
