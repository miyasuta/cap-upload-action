using my.bookshop as my from '../db/schema';

service CatalogService {
    @odata.draft.enabled
    entity Books as projection on my.Books;

    @cds.persistence.skip
    @odata.singleton
    entity ExcelUpload {
        @Core.MediaType : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        excel: LargeBinary;
    }
}

annotate CatalogService.Books with @(
    Capabilities.InsertRestrictions : {
        Insertable : false,
    }
);
