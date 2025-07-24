using my.bookshop as my from '../db/schema';

service CatalogService {
    @readonly entity Books as projection on my.Books;

    @cds.persistence.skip
    @odata.singleton
    @odata.draft.enabled
    entity ExcelUpload {
        @Core.MediaType : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        excel: LargeBinary; 
        dummy: String; 
    }
}
