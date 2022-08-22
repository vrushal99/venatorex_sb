/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/search'], function (
  runtime,
  serverWidget,
  search
) {
  function beforeLoad (context) {
    try {
      var currentScript = runtime.getCurrentScript()

      var recordObj = context.newRecord
      var newRecordid = context.newRecord.id
      var o_form = context.form

      var customer = recordObj.getValue({
        fieldId: 'parent'
      })

      var searchResult = searchForCOAProjects(newRecordid)

      o_form.addTab({
        id: 'custpage_tabmain',
        label: 'Spend Track'
      })

      var mainTab = o_form.addSubtab({
        id: 'custpage_main_tabcomparison',
        label: 'COA & Bill Comparison',
        tab: 'custpage_tabmain'
      })

      o_form = addSublistfields(o_form)

      o_form = addSublistDetails(
        o_form,
        searchResult,

        context
      )
    } catch (exp) {
      log.debug({ title: 'Éxception in main', details: exp.toString() })
    }
  }

  function addSublistDetails (o_form, searchResult, context) {
    try {
      var newRecordObj = context.newRecord.id
      var finalTotalBill = 0
      var finalTotalProject = 0
      var masterObjArr = []
      var subdifference = 0
      var countProject = 0
      var countBill = 0
      var o_sublistObjCOA = o_form.getSublist({
        id: 'custpage_addlistcoa'
      })
      var finalSublist = o_form.getSublist({
        id: 'custpage_addlistbill'
      })

      if (_logValidation(searchResult)) {
        for (let i = 0; i < searchResult.length; i++) {
          var getVendor = searchResult[i].getText({
            name: 'custrecord_coa_vendor',
            join: 'CUSTRECORD_COA_PROJECT_NAME',
            label: 'Vendor'
          })

          var getVendor1 = searchResult[i].getValue({
            name: 'custrecord_coa_vendor',
            join: 'CUSTRECORD_COA_PROJECT_NAME',
            label: 'Vendor'
          })

          var getCategory = searchResult[i].getText({
            name: 'custrecord_coa_category',
            join: 'CUSTRECORD_COA_PROJECT_NAME',
            label: 'Category'
          })

          var getProjectType = searchResult[i].getText({
            name: 'custrecord_coa_type',
            join: 'CUSTRECORD_COA_PROJECT_NAME',
            label: 'Type'
          })

          var getAmount = searchResult[i].getValue({
            name: 'custrecord_coa_amount',
            join: 'CUSTRECORD_COA_PROJECT_NAME',
            label: 'Amount'
          })
          getAmount = Math.abs(parseFloat(getAmount))

          var getDate = searchResult[i].getValue({
            name: 'created',
            join: 'CUSTRECORD_COA_PROJECT_NAME',
            label: 'Date Created'
          })

          var getStartDate = searchResult[i].getValue({
            name: 'custrecord_coa_start_date',
            join: 'CUSTRECORD_COA_PROJECT_NAME',
            label: 'Start Date'
          })

          var getEndDate = searchResult[i].getValue({
            name: 'custrecord_coa_end_date',
            join: 'CUSTRECORD_COA_PROJECT_NAME',
            label: 'End Date'
          })

          var getNotes = searchResult[i].getValue({
            name: 'custrecord_coa_notes',
            join: 'CUSTRECORD_COA_PROJECT_NAME',
            label: 'Notes'
          })

          let objInMasterObj = masterObjArr.find(
            o => o.getVendor1 === getVendor1
          )

          if (_logValidation(objInMasterObj)) {
            let masterObjIndex = masterObjArr.length
            if (_logValidation(masterObjIndex)) {
              let subtotalLineVal =
                countBill > countProject ? countBill : countProject
              let prevObj = masterObjArr[masterObjIndex - 1]
              prevObj.subtotalLineSet = subtotalLineVal
              prevObj.coaVendorLineSet = subtotalLineVal
              prevObj.billLineSet = subtotalLineVal
              prevObj.totalDiff = getTotalCoaAmount - getTotalBillAmount
              countProject = subtotalLineVal
              countBill = subtotalLineVal

              setSubtotalLine(
                o_sublistObjCOA,
                countProject,
                countBill,
                subdifference
              )
            }

            masterObjArr.push({
              index: masterObjIndex,
              getVendor1: getVendor1,
              getTotalCoaAmount: getAmount,
              getTotalBillAmount: 0,
              coaVendorLineSet: countProject,
              billLineSet: countBill,
              subtotalLineSet:
                countBill > countProject ? countBill : countProject
            })

            setCOALine(
              o_sublistObjCOA,
              countProject,
              getVendor,
              getProjectType,
              getCategory,
              getAmount,
              amountTotal,
              finalTotalProject,
              getDate,
              getStartDate,
              getEndDate,
              getNotes
            )

            var searchResultCountBill = searchForBill(newRecordObj, getVendor1)

            var billLength = searchResultCountBill.length

            if (_logValidation(searchResultCountBill)) {
              let masterObj = masterObjArr[masterObjIndex]
              for (var j = 0; j < billLength; j++) {
                var getBillType = searchResultCountBill[j].getText({
                  name: 'type',
                  label: 'Type'
                })

                var getDateBill = searchResultCountBill[j].getValue({
                  name: 'trandate',
                  label: 'Date'
                })

                var getAmountBill = searchResultCountBill[j].getValue({
                  name: 'amount',
                  label: 'Amount'
                })

                var parseBill = parseFloat(getAmountBill)

                var posBill = Math.abs(parseBill)

                finalTotalBill = finalTotalBill + posBill

                masterObj.getTotalBillAmount += posBill

                if (getBillType) {
                  o_sublistObjCOA.setSublistValue({
                    id: 'custpage_billtype',
                    line: countBill,
                    type: serverWidget.FieldType.TEXT,
                    value: getBillType
                  })
                }

                if (getDateBill) {
                  o_sublistObjCOA.setSublistValue({
                    id: 'custpage_datecreated_bill',
                    line: countBill,
                    type: serverWidget.FieldType.TEXT,
                    value: getDateBill
                  })
                }

                if (getAmountBill) {
                  o_sublistObjCOA.setSublistValue({
                    id: 'custpage_amount_bill',
                    line: countBill,
                    type: serverWidget.FieldType.TEXT,
                    value: posBill
                  })
                }

                countBill++
              }
              masterObj.billLineSet = countBill
              masterObjArr[masterObjIndex] = masterObj
            }
          } else {
            objInMasterObj.coaVendorLineSet = ++countProject
            objInMasterObj.getTotalCoaAmount += getAmount
            masterObjArr[objInMasterObj.index] = objInMasterObj

            setCOALine(
              o_sublistObjCOA,
              countProject,
              getVendor,
              getProjectType,
              getCategory,
              getAmount,
              amountTotal,
              finalTotalProject,
              getDate,
              getStartDate,
              getEndDate,
              getNotes
            )

            finalTotalProject = finalTotalProject + getAmount
          }
        }
      }

      finalSublist.setSublistValue({
        id: 'custpage_total_project',
        line: 0,
        type: serverWidget.FieldType.TEXT,
        value: finalTotalProject
      })

      finalSublist.setSublistValue({
        id: 'custpage_total_bill',
        line: 0,
        type: serverWidget.FieldType.TEXT,
        value: finalTotalBill
      })

      finalSublist.setSublistValue({
        id: 'custpage_subtotal_difference',
        line: 0,
        type: serverWidget.FieldType.TEXT,
        value: finalTotalProject - finalTotalBill
      })
    } catch (exp) {
      log.debug({
        title: 'Éxception in addfielddetails function',
        details: exp.toString()
      })
    }
  }

  function setSubtotalLine (
    o_sublistObjCOA,
    countProject,
    countBill,
    subdifference
  ) {
    o_sublistObjCOA.setSublistValue({
      id: 'custpage_billtype',
      line: countProject,
      type: serverWidget.FieldType.TEXT,
      value: 'Bill Subtotal'
    })

    o_sublistObjCOA.setSublistValue({
      id: 'custpage_amount_bill',
      line: countProject,
      type: serverWidget.FieldType.TEXT,
      value: totalBill
    })

    o_sublistObjCOA.setSublistValue({
      id: 'custpage_notes',
      line: countProject - 1,
      type: serverWidget.FieldType.TEXT,
      value: 'Project Subtotal'
    })

    o_sublistObjCOA.setSublistValue({
      id: 'custpage_amount',
      line: countProject - 1,
      type: serverWidget.FieldType.TEXT,
      value: totalProject
    })

    o_sublistObjCOA.setSublistValue({
      id: 'custpage_difference',
      line: countBill,
      type: serverWidget.FieldType.TEXT,
      value: subdifference
    })
  }

  function setCOALine (
    o_sublistObjCOA,
    countProject,
    getVendor,
    getProjectType,
    getCategory,
    getAmount,
    amountTotal,
    finalTotalProject,
    getDate,
    getStartDate,
    getEndDate,
    getNotes
  ) {
    o_sublistObjCOA.setSublistValue({
      id: 'custpage_vendor',
      line: countProject,
      type: serverWidget.FieldType.TEXT,
      value: getVendor
    })

    if (getProjectType) {
      o_sublistObjCOA.setSublistValue({
        id: 'custpage_type',
        line: countProject,
        type: serverWidget.FieldType.TEXT,
        value: getProjectType
      })
    }

    if (getCategory) {
      o_sublistObjCOA.setSublistValue({
        id: 'custpage_category',
        line: countProject,
        type: serverWidget.FieldType.TEXT,
        value: getCategory
      })
    }
    if (getAmount) {
      o_sublistObjCOA.setSublistValue({
        id: 'custpage_amount',
        line: countProject,
        type: serverWidget.FieldType.TEXT,
        value: getAmount
      })
    }
    if (getDate) {
      o_sublistObjCOA.setSublistValue({
        id: 'custpage_datecreated',
        line: countProject,
        type: serverWidget.FieldType.TEXT,
        value: getDate
      })
    }

    if (getStartDate) {
      o_sublistObjCOA.setSublistValue({
        id: 'custpage_datestart',
        line: countProject,
        type: serverWidget.FieldType.TEXT,
        value: getStartDate
      })
    }

    if (getEndDate) {
      o_sublistObjCOA.setSublistValue({
        id: 'custpage_dateend',
        line: countProject,
        type: serverWidget.FieldType.TEXT,
        value: getEndDate
      })
    }

    if (getNotes) {
      o_sublistObjCOA.setSublistValue({
        id: 'custpage_notes',
        line: countProject,
        type: serverWidget.FieldType.TEXT,
        value: getNotes
      })
    }
  }

  function searchForCOAProjects (newRecordid) {
    var jobSearchObj = search.create({
      type: 'job',
      filters: [
        ['custrecord_coa_project_name.custrecord_coa_type', 'anyof', '2'],
        'AND',
        ['internalid', 'anyof', newRecordid]
      ],
      columns: [
        search.createColumn({
          name: 'custrecord_coa_vendor',
          join: 'CUSTRECORD_COA_PROJECT_NAME',
          label: 'Vendor'
        }),
        search.createColumn({
          name: 'custrecord_coa_type',
          join: 'CUSTRECORD_COA_PROJECT_NAME',
          label: 'Type'
        }),
        search.createColumn({
          name: 'custrecord_coa_category',
          join: 'CUSTRECORD_COA_PROJECT_NAME',
          label: 'Category'
        }),

        search.createColumn({
          name: 'custrecord_coa_amount',
          join: 'CUSTRECORD_COA_PROJECT_NAME',
          label: 'Amount'
        }),
        search.createColumn({
          name: 'created',
          join: 'CUSTRECORD_COA_PROJECT_NAME',
          label: 'Date Created'
        }),
        search.createColumn({
          name: 'custrecord_coa_start_date',
          join: 'CUSTRECORD_COA_PROJECT_NAME',
          label: 'Start Date'
        }),
        search.createColumn({
          name: 'custrecord_coa_end_date',
          join: 'CUSTRECORD_COA_PROJECT_NAME',
          label: 'End Date'
        }),
        search.createColumn({
          name: 'custrecord_coa_notes',
          join: 'CUSTRECORD_COA_PROJECT_NAME',
          label: 'Notes'
        })
      ]
    })

    var searchResult = jobSearchObj.run().getRange({
      start: 0,
      end: 1000
    })
    return searchResult
  }

  function searchForBill (newRecordObj, getVendor1) {
    var vendorbillSearchObj = search.create({
      type: 'vendorbill',
      filters: [
        ['type', 'anyof', 'VendBill'],
        'AND',
        ['customer.internalid', 'anyof', newRecordObj],
        'AND',
        ['vendor.internalid', 'anyof', getVendor1]
      ],
      columns: [
        search.createColumn({ name: 'type', label: 'Type' }),
        search.createColumn({ name: 'trandate', label: 'Date' }),

        search.createColumn({ name: 'entity', label: 'Name' }),

        search.createColumn({ name: 'amount', label: 'Amount' })
      ]
    })
    var searchResultCountBill = vendorbillSearchObj.run().getRange({
      start: 0,
      end: 1000
    })

    return searchResultCountBill
  }

  function addSublistfields (o_form, context) {
    try {
      var o_sublistObjCOA = o_form.addSublist({
        id: 'custpage_addlistcoa',
        type: serverWidget.SublistType.INLINEEDITOR,
        label: 'COA & BILL',
        tab: 'custpage_main_tabcomparison'
      })

      var amountTotal = o_form.addSublist({
        id: 'custpage_addlistbill',
        type: serverWidget.SublistType.INLINEEDITOR,
        label: 'Total Amount',
        tab: 'custpage_main_tabcomparison'
      })

      o_sublistObjCOA.addField({
        id: 'custpage_vendor',
        type: serverWidget.FieldType.TEXT,
        label: 'Vendor',
        align: 'LEFT'
      })
      o_sublistObjCOA.addField({
        id: 'custpage_type',
        type: serverWidget.FieldType.TEXT,
        label: 'Project Type',
        align: 'LEFT'
      })

      o_sublistObjCOA.addField({
        id: 'custpage_category',
        type: serverWidget.FieldType.TEXT,
        label: 'Category',
        align: 'LEFT'
      })

      o_sublistObjCOA.addField({
        id: 'custpage_datecreated',
        type: serverWidget.FieldType.TEXT,
        label: 'Date Created',
        align: 'LEFT'
      })

      o_sublistObjCOA.addField({
        id: 'custpage_datestart',
        type: serverWidget.FieldType.TEXT,
        label: 'Start Date',
        align: 'LEFT'
      })
      o_sublistObjCOA.addField({
        id: 'custpage_dateend',
        type: serverWidget.FieldType.TEXT,
        label: 'End Date',
        align: 'LEFT'
      })
      o_sublistObjCOA.addField({
        id: 'custpage_notes',
        type: serverWidget.FieldType.TEXT,
        label: 'Notes',
        align: 'LEFT'
      })
      o_sublistObjCOA.addField({
        id: 'custpage_amount',
        type: serverWidget.FieldType.TEXT,
        label: 'Amount',
        align: 'LEFT'
      })
      o_sublistObjCOA.addField({
        id: 'custpage_blankval1',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })
      o_sublistObjCOA.addField({
        id: 'custpage_blankval2',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })

      o_sublistObjCOA.addField({
        id: 'custpage_billtype',
        type: serverWidget.FieldType.TEXT,
        label: 'Type',
        align: 'LEFT'
      })

      o_sublistObjCOA.addField({
        id: 'custpage_amount_bill',
        type: serverWidget.FieldType.TEXT,
        label: 'Bill Amount',
        align: 'LEFT'
      })

      o_sublistObjCOA.addField({
        id: 'custpage_datecreated_bill',
        type: serverWidget.FieldType.TEXT,
        label: 'Bill Date',
        align: 'LEFT'
      })
      o_sublistObjCOA.addField({
        id: 'custpage_blankval11',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })
      o_sublistObjCOA.addField({
        id: 'custpage_blankval21',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })

      o_sublistObjCOA.addField({
        id: 'custpage_difference',
        type: serverWidget.FieldType.TEXT,
        label: 'Subtotal Difference',
        align: 'LEFT'
      })

      amountTotal.addField({
        id: 'custpage_cb1',
        type: serverWidget.FieldType.TEXT,
        label: '      ',
        align: 'LEFT'
      })
      amountTotal.addField({
        id: 'custpage_cb2',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })
      amountTotal.addField({
        id: 'custpage_cb4',
        type: serverWidget.FieldType.TEXT,
        label: '      ',
        align: 'LEFT'
      })

      amountTotal.addField({
        id: 'custpage_cb9',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })
      amountTotal.addField({
        id: 'custpage_cb10',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })

      amountTotal.addField({
        id: 'custpage_total_project',
        type: serverWidget.FieldType.TEXT,
        label: 'Project Total',
        align: 'LEFT'
      })

      amountTotal.addField({
        id: 'custpage_b3',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })

      amountTotal.addField({
        id: 'custpage_b5',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })

      amountTotal.addField({
        id: 'custpage_total_bill',
        type: serverWidget.FieldType.TEXT,
        label: 'Bill Total',
        align: 'LEFT'
      })

      amountTotal.addField({
        id: 'custpage_cb61',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })

      amountTotal.addField({
        id: 'custpage_cb62',
        type: serverWidget.FieldType.TEXT,
        label: ' ',
        align: 'LEFT'
      })
      amountTotal.addField({
        id: 'custpage_subtotal_difference',
        type: serverWidget.FieldType.TEXT,
        label: 'Final Difference',
        align: 'LEFT'
      })

      return o_form
    } catch (exp) {
      log.debug({
        title: 'Éxception in addfield function',
        details: exp.toString()
      })
    }
  }

  function _logValidation (value) {
    if (
      value != null &&
      value != '' &&
      value != 'null' &&
      value != undefined &&
      value != 'undefined' &&
      value != '@NONE@' &&
      value != 'NaN'
    ) {
      return true
    } else {
      return false
    }
  }

  return {
    beforeLoad: beforeLoad
  }
})
