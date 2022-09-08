/**
* @NApiVersion 2.1
* @NScriptType ClientScript
*/
/***********************************************************************
 * Description: This Script will Call suitlet 
 *Deployed On :-Store in file Cabinate 
 * Version: 1.0.0 - Initial version
 * Author:  BFL/Palavi Rajgude
 * Date:   25-08-2022
 ***********************************************************************/
 define(['N/url','N/currentRecord'],function(url,currentRecord){
    function pageinit(context){
    }
    function CallforSuitelettoPrint(){
        var record=currentRecord.get();
        var recordId=record.id;
        var recordType=record.type;
        var suiteletURL = url.resolveScript({
            scriptId:'customscript_vnx_ue_addcoa',
            deploymentId:'customdeploy1',
            params: {'recordId':recordId,'recordType':recordType
            }
         });
         document.location=suiteletURL;
        }
    return{
        CallforSuitelettoPrint:CallforSuitelettoPrint,
        pageInit:pageinit
    }
})