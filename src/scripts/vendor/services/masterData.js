import $ from "jquery";

const MasterDataService = (function() {
    /**
     *
     * @param {string} fieldName Nombre del campo a filtrar
     * @param {string} fieldValue Valor del campo a filtrar
     * @param {string} entidadMasterData Sigla de la entidad de MasterData (2 caracteres)
     */
    const getObjectRegistrationByEspecificField = function(fieldName, fieldValue, masterDataEntity) {
        let data = {
            f: fieldName,
            fq: fieldName + ":" + fieldValue
        };
        return $.ajax({
            url: "/api/ds/pub/documents/" + masterDataEntity,
            contentType: "application/json; charset=utf-8",
            data,
            type: "GET"
        });
    };

    /**
     *
     * @param {any} datosInputs Objeto de datos a almacenar
     * @param {string} masterDataEntity Sigla de la entidad de MasterData (2 caracteres)
     */
    const saveData = function(datosInputs, masterDataEntity) {
        return $.ajax({
            url: "/api/ds/pub/documents/" + masterDataEntity,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(datosInputs),
            type: "POST"
        });
    };

    return {
        getObjectRegistrationByEspecificField: getObjectRegistrationByEspecificField,
        saveData: saveData
    };
})();

module.exports = MasterDataService;
