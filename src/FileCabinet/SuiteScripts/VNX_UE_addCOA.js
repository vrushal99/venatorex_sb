/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
 define([
  "N/url",
  "N/https",
  "N/runtime",
  "N/ui/serverWidget",
  "N/search",
], function (url, https, runtime, serverWidget, search) {
  function beforeLoad(context) {
    try {
      var currentScript = runtime.getCurrentScript();

      var recordObj = context.newRecord;
      var newRecordid = context.newRecord.id;
      var o_form = context.form;

      var customer = recordObj.getValue({
        fieldId: "parent",
      });

      //  log.debug("customer", customer);

      var searchResult = searchForCOAProjects(newRecordid);

      //log.debug("searchResult", searchResult);

     

      o_form.addTab({
        id: "custpage_tabmain",
        label: "Spend Track",
      });

      var mainTab = o_form.addSubtab({
        id: "custpage_main_tabcomparison",
        label: "COA & Bill Comparison",
        tab: "custpage_tabmain",
      });

      o_form = addSublistfields(o_form);

      o_form = addSublistDetails(
        o_form,
        searchResult,
        // searchResultCountBill,
        context
      );
      // }
    } catch (exp) {
      log.debug({ title: "Éxception in main", details: exp.toString() });
    }
  }

    function searchForCOAProjects(newRecordid) {
        var jobSearchObj = search.create({
            type: "job",
            filters: [
                ["custrecord_coa_project_name.custrecord_coa_type", "anyof", "2"],
                "AND",
                ["internalid", "anyof", newRecordid],
            ],
            columns: [
                search.createColumn({
                    name: "custrecord_coa_vendor",
                    join: "CUSTRECORD_COA_PROJECT_NAME",
                    label: "Vendor",
                }),
                search.createColumn({
                    name: "custrecord_coa_type",
                    join: "CUSTRECORD_COA_PROJECT_NAME",
                    label: "Type",
                }),
                search.createColumn({
                    name: "custrecord_coa_category",
                    join: "CUSTRECORD_COA_PROJECT_NAME",
                    label: "Category",
                }),

                search.createColumn({
                    name: "custrecord_coa_amount",
                    join: "CUSTRECORD_COA_PROJECT_NAME",
                    label: "Amount",
                }),
                search.createColumn({
                    name: "created",
                    join: "CUSTRECORD_COA_PROJECT_NAME",
                    label: "Date Created",
                }),
                search.createColumn({
                    name: "custrecord_coa_start_date",
                    join: "CUSTRECORD_COA_PROJECT_NAME",
                    label: "Start Date",
                }),
                search.createColumn({
                    name: "custrecord_coa_end_date",
                    join: "CUSTRECORD_COA_PROJECT_NAME",
                    label: "End Date",
                }),
                search.createColumn({
                    name: "custrecord_coa_notes",
                    join: "CUSTRECORD_COA_PROJECT_NAME",
                    label: "Notes",
                }),
            ],
        });

        var searchResult = jobSearchObj.run().getRange({
            start: 0,
            end: 1000,
        });
        return searchResult;
    }

  function searchForBill(newRecordObj, getVendor1) {
    var vendorbillSearchObj = search.create({
      type: "vendorbill",
      filters: [
        ["type", "anyof", "VendBill"],
        "AND",
        ["customer.internalid", "anyof", newRecordObj],
        "AND",
        ["vendor.internalid", "anyof", getVendor1],
      ],
      columns: [
        search.createColumn({ name: "type", label: "Type" }),
        search.createColumn({ name: "trandate", label: "Date" }),

        search.createColumn({ name: "entity", label: "Name" }),

        search.createColumn({ name: "amount", label: "Amount" }),
      ],
    });
    var searchResultCountBill = vendorbillSearchObj.run().getRange({
      start: 0,
      end: 1000,
    });

    //log.debug("search for bill", searchResultCountBill);
    return searchResultCountBill;
  }

  function addSublistfields(o_form, context) {
    try {
      var o_sublistObjCOA = o_form.addSublist({
        id: "custpage_addlistcoa",
        type: serverWidget.SublistType.INLINEEDITOR,
        label: "COA & BILL",
        tab: "custpage_main_tabcomparison",
      });

      var amountTotal = o_form.addSublist({
        id: "custpage_addlistbill",
        type: serverWidget.SublistType.INLINEEDITOR,
        label: "Total Amount",
        tab: "custpage_main_tabcomparison",
      });

      //================================= Tab 1 ======================================================

      o_sublistObjCOA.addField({
        id: "custpage_vendor",
        type: serverWidget.FieldType.TEXT,
        label: "Vendor",
        align: "LEFT",
      });
      o_sublistObjCOA.addField({
        id: "custpage_type",
        type: serverWidget.FieldType.TEXT,
        label: "Project Type",
        align: "LEFT",
      });

      o_sublistObjCOA.addField({
        id: "custpage_category",
        type: serverWidget.FieldType.TEXT,
        label: "Category",
        align: "LEFT",
      });

      o_sublistObjCOA.addField({
        id: "custpage_datecreated",
        type: serverWidget.FieldType.TEXT,
        label: "Date Created",
        align: "LEFT",
      });

      o_sublistObjCOA.addField({
        id: "custpage_datestart",
        type: serverWidget.FieldType.TEXT,
        label: "Start Date",
        align: "LEFT",
      });
      o_sublistObjCOA.addField({
        id: "custpage_dateend",
        type: serverWidget.FieldType.TEXT,
        label: "End Date",
        align: "LEFT",
      });
      o_sublistObjCOA.addField({
        id: "custpage_notes",
        type: serverWidget.FieldType.TEXT,
        label: "Notes",
        align: "LEFT",
      });
      o_sublistObjCOA.addField({
        id: "custpage_amount",
        type: serverWidget.FieldType.TEXT,
        label: "Amount",
        align: "LEFT",
      });
      o_sublistObjCOA.addField({
        id: "custpage_blankval1",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });
      o_sublistObjCOA.addField({
        id: "custpage_blankval2",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });

      o_sublistObjCOA.addField({
        id: "custpage_billtype",
        type: serverWidget.FieldType.TEXT,
        label: "Type",
        align: "LEFT",
      });

      o_sublistObjCOA.addField({
        id: "custpage_amount_bill",
        type: serverWidget.FieldType.TEXT,
        label: "Bill Amount",
        align: "LEFT",
      });

      o_sublistObjCOA.addField({
        id: "custpage_datecreated_bill",
        type: serverWidget.FieldType.TEXT,
        label: "Bill Date",
        align: "LEFT",
      });
      o_sublistObjCOA.addField({
        id: "custpage_blankval11",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });
      o_sublistObjCOA.addField({
        id: "custpage_blankval21",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });

      o_sublistObjCOA.addField({
        id: "custpage_difference",
        type: serverWidget.FieldType.TEXT,
        label: "Subtotal Difference",
        align: "LEFT",
      });
      //===================================END==========================================================

      //===================================END==========================================================

      //================================= Tab 2 ======================================================

      amountTotal.addField({
        id: "custpage_cb1",
        type: serverWidget.FieldType.TEXT,
        label: "      ",
        align: "LEFT",
      });
      amountTotal.addField({
        id: "custpage_cb2",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });
      amountTotal.addField({
        id: "custpage_cb4",
        type: serverWidget.FieldType.TEXT,
        label: "      ",
        align: "LEFT",
      });

      amountTotal.addField({
        id: "custpage_cb9",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });
      amountTotal.addField({
        id: "custpage_cb10",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });

      amountTotal.addField({
        id: "custpage_total_project",
        type: serverWidget.FieldType.TEXT,
        label: "Project Total",
        align: "LEFT",
      });

      amountTotal.addField({
        id: "custpage_b3",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });

      amountTotal.addField({
        id: "custpage_b5",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });

      amountTotal.addField({
        id: "custpage_total_bill",
        type: serverWidget.FieldType.TEXT,
        label: "Bill Total",
        align: "LEFT",
      });

      amountTotal.addField({
        id: "custpage_cb61",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });

      amountTotal.addField({
        id: "custpage_cb62",
        type: serverWidget.FieldType.TEXT,
        label: " ",
        align: "LEFT",
      });
      amountTotal.addField({
        id: "custpage_subtotal_difference",
        type: serverWidget.FieldType.TEXT,
        label: "Final Difference",
        align: "LEFT",
      });

      return o_form;
    } catch (exp) {
      log.debug({
        title: "Éxception in addfield function",
        details: exp.toString(),
      });
    }
  }

  function addSublistDetails(
    o_form,
    searchResult,
    //searchResultCountBill,
    context
  ) {
    try {
      var newRecordObj = context.newRecord.id;

      var i;
      var j = 0;

      var newLine = 0;
      var finalTotalBill = 0;
      var finalTotalProject = 0;
      var masterObj = {};
      var countSL = 0;
      var newArray = [];
      var subdifference = 0;
      var countProject = 0;
      var countBill = 0;
      var subTotalBill = 0;
      var o_sublistObjCOA = o_form.getSublist({
        id: "custpage_addlistcoa",
      });

      var amountTotal = o_form.getSublist({
        id: "custpage_addlistbill",
      });

      if (_logValidation(searchResult)) {
        for (i = 0; i < searchResult.length; i++) {
          var getVendor = searchResult[i].getText({
            name: "custrecord_coa_vendor",
            join: "CUSTRECORD_COA_PROJECT_NAME",
            sort: search.Sort.ASC,
            label: "Vendor",
          });

          //log.debug("getVendor", getVendor);

          var getVendor1 = searchResult[i].getValue({
            name: "custrecord_coa_vendor",
            join: "CUSTRECORD_COA_PROJECT_NAME",
            label: "Vendor",
          });

          //log.debug("getVendor", getVendor1);

          var getCategory = searchResult[i].getText({
            name: "custrecord_coa_category",
            join: "CUSTRECORD_COA_PROJECT_NAME",
            label: "Category",
          });
          //  log.debug("getCategory", getCategory);

          var getProjectType = searchResult[i].getText({
            name: "custrecord_coa_type",
            join: "CUSTRECORD_COA_PROJECT_NAME",
            label: "Type",
          });
          // log.debug("getProjectType", getProjectType);

          var getAmount = searchResult[i].getValue({
            name: "custrecord_coa_amount",
            join: "CUSTRECORD_COA_PROJECT_NAME",
            label: "Amount",
          });
          //log.debug("getAmount", getAmount);

          var getDate = searchResult[i].getValue({
            name: "created",
            join: "CUSTRECORD_COA_PROJECT_NAME",
            label: "Date Created",
          });
          // log.debug("getDate", getDate);

          var getStartDate = searchResult[i].getValue({
            name: "custrecord_coa_start_date",
            join: "CUSTRECORD_COA_PROJECT_NAME",
            label: "Start Date",
          });
          // log.debug("getStartDate", getStartDate);

          var getEndDate = searchResult[i].getValue({
            name: "custrecord_coa_end_date",
            join: "CUSTRECORD_COA_PROJECT_NAME",
            label: "End Date",
          });
          // log.debug("getEndDate", getEndDate);

          var getNotes = searchResult[i].getValue({
            name: "custrecord_coa_notes",
            join: "CUSTRECORD_COA_PROJECT_NAME",
            label: "Notes",
          });
          // log.debug("getNotes", getNotes);

          var parseProject = parseFloat(getAmount);

          var positiveProject = Math.abs(parseProject);
          //  log.debug("positiveProject", positiveProject);

          var a = newArray.indexOf(getVendor1);
          //  log.debug("a", a);
          masterObj["coaCount"] = countProject;
          masterObj["billCount"] = countBill;
          masterObj["vendor"] = getVendor1;

          if (a == -1) {
            var totalProject = 0;
            totalProject = totalProject + positiveProject;
            finalTotalProject = finalTotalProject + positiveProject;

            newArray.push(getVendor1);

            // log.debug("newArray", newArray);

            o_sublistObjCOA.setSublistValue({
              id: "custpage_vendor",
              line: countProject,
              type: serverWidget.FieldType.TEXT,
              value: getVendor,
            });

            if (getProjectType) {
              o_sublistObjCOA.setSublistValue({
                id: "custpage_type",
                line: countProject,
                type: serverWidget.FieldType.TEXT,
                value: getProjectType,
              });
            }

            if (getCategory) {
              o_sublistObjCOA.setSublistValue({
                id: "custpage_category",
                line: countProject,
                type: serverWidget.FieldType.TEXT,
                value: getCategory,
              });
            }
            if (getAmount) {
              o_sublistObjCOA.setSublistValue({
                id: "custpage_amount",
                line: countProject,
                type: serverWidget.FieldType.TEXT,
                value: positiveProject,
              });
              masterObj["amountProject"] = positiveProject;

              amountTotal.setSublistValue({
                id: "custpage_total_project",
                line: 0,
                type: serverWidget.FieldType.TEXT,
                value: finalTotalProject, //totalProject
              });
            }
            if (getDate) {
              o_sublistObjCOA.setSublistValue({
                id: "custpage_datecreated",
                line: countProject,
                type: serverWidget.FieldType.TEXT,
                value: getDate,
              });
            }

            if (getStartDate) {
              o_sublistObjCOA.setSublistValue({
                id: "custpage_datestart",
                line: countProject,
                type: serverWidget.FieldType.TEXT,
                value: getStartDate,
              });
            }

            if (getEndDate) {
              o_sublistObjCOA.setSublistValue({
                id: "custpage_dateend",
                line: countProject,
                type: serverWidget.FieldType.TEXT,
                value: getEndDate,
              });
            }

            if (getNotes) {
              o_sublistObjCOA.setSublistValue({
                id: "custpage_notes",
                line: countProject,
                type: serverWidget.FieldType.TEXT,
                value: getNotes,
              });
            }

            countProject++;

            var searchResultCountBill = searchForBill(newRecordObj, getVendor1);
            //  log.debug(" bill length", searchResultCountBill.length);
            var billLength = searchResultCountBill.length;

           // countProject = billLength + 1;
            // log.debug("countProject", countProject);

            if (_logValidation(searchResultCountBill)) {
              //var billLen = searchResultCountBill.length;
              var totalBill = 0;
              //var totalProject=0;
              for (var j = 0; j < billLength; j++) {
                //j++;

                var getBillType = searchResultCountBill[j].getText({
                  name: "type",
                  label: "Type",
                });
                // log.debug("getBillType", getBillType);

                var getDateBill = searchResultCountBill[j].getValue({
                  name: "trandate",
                  label: "Date",
                });
                // log.debug("getDateBill", getDateBill);

                var getAmountBill = searchResultCountBill[j].getValue({
                  name: "amount",
                  label: "Amount",
                });
                //  log.debug("getAmountBill", getAmountBill);
                var parseBill = parseFloat(getAmountBill);

                var posBill = Math.abs(parseBill);
                // log.debug("posBill", posBill);
                totalBill = totalBill + posBill;

                finalTotalBill = finalTotalBill + posBill;
                // finalTotalBill = finalTotalBill + totalBill;

                if (getBillType) {
                  o_sublistObjCOA.setSublistValue({
                    id: "custpage_billtype",
                    line: countBill, //parseInt(j),
                    type: serverWidget.FieldType.TEXT,
                    value: getBillType,
                  });
                }

                if (getDateBill) {
                  o_sublistObjCOA.setSublistValue({
                    id: "custpage_datecreated_bill",
                    line: countBill, //parseInt(j),
                    type: serverWidget.FieldType.TEXT,
                    value: getDateBill,
                  });
                }

                if (getAmountBill) {
                  // log.debug("totalBill",totalBill);

                  // log.debug("pos bill", posParseBill);
                  o_sublistObjCOA.setSublistValue({
                    id: "custpage_amount_bill",
                    line: countBill, //parseInt(j),
                    type: serverWidget.FieldType.TEXT,
                    value: posBill,
                  });
                  masterObj["amountBill"] = posBill;
                  amountTotal.setSublistValue({
                    id: "custpage_total_bill",
                    line: 0,
                    type: serverWidget.FieldType.TEXT,
                    value: finalTotalBill,
                  });

                  //   log.debug("finalTotalBill", finalTotalBill);
                }
                //log.debug("countBill first", countBill);

               // countProject = countBill + 1;

                // o_sublistObjCOA.setSublistValue({
                //   id: "custpage_billtype",
                //   line: countProject, //parseInt(j),
                //   type: serverWidget.FieldType.TEXT,
                //   value: "Bill Subtotal",
                // });

                // o_sublistObjCOA.setSublistValue({
                //   id: "custpage_amount_bill",
                //   line: countProject, //parseInt(j),
                //   type: serverWidget.FieldType.TEXT,
                //   value: totalBill,
                // });

                //   countBill = countBill + 1;

                //log.debug("countBill first", countBill);
                countBill++;
  
                masterObj["billCount"] = countBill;
              }

              log.debug("masterObj", masterObj);
              log.debug("masterObj.billCount", masterObj.billCount);
              // countBill++;
              // countProject++;
              // countProject = countBill + 1;
              if (masterObj.billCount > masterObj.coaCount) {
                countSL = masterObj.billCount;
  
                //set subtotal line
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_notes",
                  line: countSL,
                  type: serverWidget.FieldType.TEXT,
                  value: "Project Subtotal",
                });
  
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_amount",
                  line: countSL,
                  type: serverWidget.FieldType.TEXT,
                  value: totalProject,
                });
  
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_billtype",
                  line: countSL,
                  type: serverWidget.FieldType.TEXT,
                  value: "Bill Subtotal",
                });
  
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_amount_bill",
                  line: countSL,
                  type: serverWidget.FieldType.TEXT,
                  value: totalBill,
                });
  
                countSL++;
                countBill++;
              } else {
                countSL = masterObj.coaCount;
  
                //set subtotal line
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_notes",
                  line: countSL,
                  type: serverWidget.FieldType.TEXT,
                  value: "Project Subtotal",
                });
  
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_amount",
                  line: countSL,
                  type: serverWidget.FieldType.TEXT,
                  value: totalProject,
                });
  
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_billtype",
                  line: countSL,
                  type: serverWidget.FieldType.TEXT,
                  value: "Bill Subtotal",
                });
  
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_amount_bill",
                  line: countSL,
                  type: serverWidget.FieldType.TEXT,
                  value: totalBill,
                });
  
                countSL++;
                countProject++;
              }
  
              masterObj["subTotalCount"] = countSL;
              
              // o_sublistObjCOA.setSublistValue({
              //   id: "custpage_notes",
              //   line: countProject - 1,
              //   type: serverWidget.FieldType.TEXT,
              //   value: "Project Subtotal",
              // });

              // o_sublistObjCOA.setSublistValue({
              //   id: "custpage_amount",
              //   line: countProject - 1,
              //   type: serverWidget.FieldType.TEXT,
              //   value: totalProject,
              // });

              // var lineSubtotal = countProject - 1;
              // //log.debug("lineSubtotal", lineSubtotal);

              // subdifference = totalProject - totalBill;
              // // log.debug("subdifference", subdifference);
              // o_sublistObjCOA.setSublistValue({
              //   id: "custpage_difference",
              //   line: countBill, //parseInt(j),
              //   type: serverWidget.FieldType.TEXT,
              //   value: subdifference,
              // });

              // //log.debug("countBill", countBill);

              // countBill = countBill + 1;
            }
          } else {
             if (a > 0) {
            //   var newLine = a + 1;
            //   log.debug("newLine", newLine);
            // } else {
              //  log.debug("newLine", newLine);
            
             // masterObj.countProject=((newArray.length) -1);
             // countBill=countSL++;
               countProject++; 

             }
              o_sublistObjCOA.setSublistValue({
                id: "custpage_vendor",
                line: countProject,
                type: serverWidget.FieldType.TEXT,
                value: getVendor,
              });

              if (getProjectType) {
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_type",
                  line: countProject,
                  type: serverWidget.FieldType.TEXT,
                  value: getProjectType,
                });
              }

              if (getCategory) {
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_category",
                  line: countProject,
                  type: serverWidget.FieldType.TEXT,
                  value: getCategory,
                });
              }
              if (getAmount) {
                totalProject = totalProject + positiveProject;

                // log.debug("Positive Amount", positiveAmount);
                finalTotalProject = finalTotalProject + positiveProject;
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_amount",
                  line: countProject,
                  type: serverWidget.FieldType.TEXT,
                  value: positiveProject,
                });

                // o_sublistObjCOA.setSublistValue({
                //   id: "custpage_amount",
                //   line: lineSubtotal,
                //   type: serverWidget.FieldType.TEXT,
                //   value: totalProject,
                // });

                // subdifference = totalProject - totalBill;
                // // log.debug("subdifference", subdifference);
                // o_sublistObjCOA.setSublistValue({
                //   id: "custpage_difference",
                //   line: lineSubtotal, //parseInt(j),
                //   type: serverWidget.FieldType.TEXT,
                //   value: subdifference,
                // });
              }
              if (getDate) {
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_datecreated",
                  line: countProject,
                  type: serverWidget.FieldType.TEXT,
                  value: getDate,
                });
              }

              if (getStartDate) {
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_datestart",
                  line: countProject,
                  type: serverWidget.FieldType.TEXT,
                  value: getStartDate,
                });
              }

              if (getEndDate) {
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_dateend",
                  line: countProject,
                  type: serverWidget.FieldType.TEXT,
                  value: getEndDate,
                });
              }

              if (getNotes) {
                o_sublistObjCOA.setSublistValue({
                  id: "custpage_notes",
                  line: countProject,
                  type: serverWidget.FieldType.TEXT,
                  value: getNotes,
                });
              }
              // newLine= newLine + 1;
           // }

           // newLine = newLine + 1;
            //newLine++;
            
          }
        }
      

        let finalDifference = 0;
        finalDifference =
          parseFloat(finalTotalProject) - parseFloat(finalTotalBill);

        amountTotal.setSublistValue({
          id: "custpage_subtotal_difference",
          line: 0,
          type: serverWidget.FieldType.TEXT,
          value: parseFloat(finalDifference),
        });
        // log.debug("finalDifference", finalDifference);
        //newLine++;
      }

      //}
    } catch (exp) {
      log.debug({
        title: "Éxception in addfielddetails function",
        details: exp.toString(),
      });
    }
  }

  function _logValidation(value) {
    if (
      value != null &&
      value != "" &&
      value != "null" &&
      value != undefined &&
      value != "undefined" &&
      value != "@NONE@" &&
      value != "NaN"
    ) {
      return true;
    } else {
      return false;
    }
  } //Null Validation

  return {
    beforeLoad: beforeLoad,
  };
});
