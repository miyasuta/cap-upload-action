import ExtensionAPI from 'sap/fe/core/ExtensionAPI';
import ListReportExtensionAPI from 'sap/fe/templates/ListReport/ExtensionAPI';
import Context from 'sap/ui/model/odata/v4/Context';
import Dialog, { Dialog$AfterCloseEvent, Dialog$BeforeOpenEvent } from 'sap/m/Dialog';
import MessageBox from 'sap/m/MessageBox';
import MessageToast from 'sap/m/MessageToast';
import FileUploaderParameter from 'sap/ui/unified/FileUploaderParameter';
import ODataModel from 'sap/ui/model/odata/v4/ODataModel';

/**
 * Generated event handler.
 *
 * @param this reference to the 'this' that the event handler is bound to.
 * @param pageContext the context of the page on which the event was fired
 */
export function uploadWithFileUploader(this: ExtensionAPI, pageContext: Context) {
    this.loadFragment({
        id: "fileUploaderDialog",
        name: "ns.books.ext.fragment.FileUploaderDialog",
        controller: dialogController(this)
    }).then((dialog) => {
        (dialog as Dialog).open();
    });
}

function dialogController(extensionAPI: ExtensionAPI) {
    let dialog: Dialog | undefined

    function setOkButtonEnabled(bOk: boolean) {
        dialog && dialog.getBeginButton().setEnabled(bOk);
    }

    function setDialogBusy(bBusy: boolean) {
        dialog && dialog.setBusy(bBusy);
    }

    function closeDialog() {
        dialog && dialog.close();
    }

    function showError(message: string, title: string = "Error") {
        MessageBox.error(message, { title });
    }

    function byId(sId: string) {
        // @ts-ignore
        return sap.ui.core.Fragment.byId("fileUploaderDialog", sId);
    }

    return {
        onBeforeOpen: function (event: Dialog$BeforeOpenEvent) {
            dialog = event.getSource() as Dialog;
            extensionAPI.addDependent(dialog);
        },

        onAfterClose: function (event: Dialog$AfterCloseEvent) {
            if (dialog) {
                extensionAPI.removeDependent(dialog);
                dialog.destroy();
                dialog = undefined;
            }
        },

        onOk: function (oEvent: any) {
            setDialogBusy(true);

            var oFileUploader = byId("uploader");
            var headPar = new FileUploaderParameter();
            headPar.setName('slug');
            // You may want to set this to a specific value, e.g. from pageContext or another source
            headPar.setValue("Entity"); // Replace "Entity" with actual value if needed
            oFileUploader.removeHeaderParameter('slug');
            oFileUploader.addHeaderParameter(headPar);

        oFileUploader.setUploadUrl("/odata/v4/catalog/ExcelUpload/excel");

            oFileUploader
                .checkFileReadable()
                .then(function () {
                    oFileUploader.upload();
                })
                .catch(function (error: any) {
                    showError("The file cannot be read.");
                    setDialogBusy(false);
                });
        },

        onCancel: function (oEvent: any) {
            closeDialog();
        },

        onTypeMismatch: function (oEvent: any) {
            var sSupportedFileTypes = oEvent
                .getSource()
                .getFileType()
                .map(function (sFileType: string) {
                    return "*." + sFileType;
                })
                .join(", ");

            showError(
                "The file type *." +
                oEvent.getParameter("fileType") +
                " is not supported. Choose one of the following types: " +
                sSupportedFileTypes
            );
        },

        onFileAllowed: function (oEvent: any) {
            setOkButtonEnabled(true)
        },

        onFileEmpty: function (oEvent: any) {
            setOkButtonEnabled(false)
        },

        onUploadComplete: function (oEvent: any) {
            var iStatus = oEvent.getParameter("status");
            var oFileUploader = oEvent.getSource();

            oFileUploader.clear();
            setOkButtonEnabled(false);
            setDialogBusy(false);

            if (iStatus >= 400) {
                var oRawResponse;
                try {
                    oRawResponse = JSON.parse(oEvent.getParameter("responseRaw"));
                } catch (e) {
                    oRawResponse = oEvent.getParameter("responseRaw");
                }
                if (oRawResponse && oRawResponse.error && oRawResponse.error.message) {
                    showError(
                        oRawResponse.error.message,
                        "Upload failed"
                    );
                }
            } else {
                MessageToast.show("File uploaded successfully");
                // TODO: Implement refresh logic if needed. ExtensionAPI does not have a 'refresh' method.
                (extensionAPI as ListReportExtensionAPI).refresh();
                closeDialog();
            }
        }

    }
}
