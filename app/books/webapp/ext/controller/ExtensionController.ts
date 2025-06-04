import ExtensionAPI from 'sap/fe/core/ExtensionAPI';
import Context from 'sap/ui/model/odata/v4/Context';
import Dialog, { Dialog$AfterCloseEvent, Dialog$BeforeOpenEvent } from 'sap/m/Dialog';

/**
 * Generated event handler.
 *
 * @param this reference to the 'this' that the event handler is bound to.
 * @param pageContext the context of the page on which the event was fired
 */
export function upload(this: ExtensionAPI, pageContext: Context) {
    this.loadFragment({
        id: "exelUploadDialog",
        name: "ns.books.ext.fragment.ExcelUploadDialog",
        controller: dialogController(this)
    }).then((dialog) => {
        (dialog as Dialog).open();
    })
}

function dialogController(extensionAPI: ExtensionAPI) {
    let dialog: Dialog | undefined

    return {
        onBeforeOpen: function (evnet: Dialog$BeforeOpenEvent) {
            dialog = evnet.getSource() as Dialog;
            extensionAPI.addDependent(dialog);            
        },

        onAfterClose: function (event: Dialog$AfterCloseEvent) {
            if (dialog) {
                extensionAPI.removeDependent(dialog);
                dialog.destroy();
                dialog = undefined;
            }
        },

        closeDialog: function () {
            dialog?.close();
        }
    }
}
