/// <reference path="../interfaces/generic-dashboard.d.ts" />

namespace Commons {
    export namespace GenericFunctionalities {

        //common functions
        function getitemCurrentStateData(itemId: string,
            itemCurrentStateValues: ItemCurrentStateData[],
            itemCurrentStateTableHeaders: any): ItemCurrentStateData {

            let itemCurrentStateData: ItemCurrentStateData = itemCurrentStateValues.find((itemCurrentStateData) => itemCurrentStateData.id == itemId);

            if (itemCurrentStateData == null) {
                let itemCurrentStateTableInitials: any[] = [];

                itemCurrentStateTableInitials = Array(itemCurrentStateTableHeaders.length).fill("");

                itemCurrentStateData = {
                    id: itemId,
                    attributes: [],
                    tableValues: itemCurrentStateTableInitials,
                    InitiatedDate: null,
                    ClosedDate: null,
                    currentState: ''
                };
            }

            return itemCurrentStateData;

        }

        //getting state number of days required for avg,tracker and closure functionality
        function getItemStateDays(itemLabelData): number {
            //get the number of days label state was in
            itemLabelData.set.sort((a, b) => a.version - b.version);
            itemLabelData.reset.sort((a, b) => a.version - b.version);

            let labelstateDaysCount = itemLabelData.set.reduce((accumulator, currentValue, currentIndex, set) => {
                let stateDays: number;
                if (itemLabelData.reset[currentIndex]) {
                    const setDate = new Date(currentValue.dateIso);
                    const resetDate = new Date(itemLabelData.reset[currentIndex].dateIso);

                    let time_difference = resetDate.getTime() - setDate.getTime();

                    //calculate days difference by dividing total milliseconds in a day  
                    let days_difference = time_difference / (1000 * 60 * 60 * 24);

                    stateDays = Math.floor(days_difference);
                } else {
                    const setDate = new Date(currentValue.dateIso);
                    const resetDate = new Date();

                    let time_difference = resetDate.getTime() - setDate.getTime();

                    //calculate days difference by dividing total milliseconds in a day  
                    let days_difference = time_difference / (1000 * 60 * 60 * 24);

                    stateDays = Math.floor(days_difference);
                }

                return accumulator + stateDays;

            }, 0);

            return labelstateDaysCount;
        }

        export function initiateByCategoryLabelData(pluginConfig: any, ByCategoryLabelDetails: ByCategoryLabelData[]) {

            let categoriesFunctionalities = pluginConfig.categoriesFunctionalities;

            categoriesFunctionalities.forEach(category => {

                let itemCurrentStateTableHeaders: any[] = ['Item'];
                let itemCurrentStateValues: ItemCurrentStateData[] = [];
                let groupByData: groupByObject[] = [];
                let groupByOperandsData: groupByOperandsObject[] = [];
                let groupByStateData: groupByStateObject[] = [];
                let groupByStateOverdueData: groupByStateOverDueObject[] = [];
                let groupByStackData: groupByStackObject[] = [];
                let avgData: avgObject[] = [];
                let closureData: closureObject[] = [];
                let trackerData: trackerObject[] = [];
                let groupByNcrDeptData: groupByNcrDeptObject[] = [];
                let groupByNcrAuditorData: groupByNcrAuditorObject[] = [];
                let dateRangeCompareData: dateRangeCompareObject[] = [];
                let groupByStackCurrentLabelData: groupByStackCurrentData[] = [];
                let groupByObjectCurrentLabelData: groupByObjectCurrentData[] = [];
                let closureLabelCurrentData: closureObjectCurrentData[] = [];
                let dateRangeCompareCurrentLabelData: groupByObjectCurrentData[] = [];
                let trackerLabelCurrentData: Map<string, trackerObjectCurrentData> = new Map<string, trackerObjectCurrentData>();
                let groupByNcrDeptCurrentLabelData: groupByNcrDeptCurrentData[] = [];
                let currentAuditorInfoData: auditorInfoCurrentData[] = [];
                let currentAuditFindingsData: auditFindingsCurrentData[] = [];
                let operandsData: Map<string, operandObjectData> = new Map<string, operandObjectData>();

                category.functionalities.forEach(functionality => {

                    switch (functionality.type) {
                        case 'groupBy':
                            let groupWiseInitials = Array(functionality.labels.length).fill(0);
                            let groupByObject: groupByObject = {
                                id: functionality.id,
                                dataSourceType: functionality.dataSourceType,
                                renderChart: functionality.renderChart,
                                showInTable: functionality.showInTable,
                                tableHeader: functionality.tableHeader,
                                labels: functionality.labels,
                                labelsDesc: functionality.labelsDesc,
                                groupWiseData: [category.id + ' ' + functionality.title, ...groupWiseInitials],
                                currentLabelData: JSON.parse(JSON.stringify(groupByObjectCurrentLabelData))
                            };
                            groupByData.push(groupByObject);
                            if(functionality.showInTable){
                                itemCurrentStateTableHeaders.push(functionality.tableHeader);
                            }
                            break;
                        case 'groupBy-operands':
                            functionality.labels.forEach((label, index) => {
                                let labelsState: Map<string, Boolean> = new Map<string, Boolean>();
                                functionality.expressionLabels[index].forEach(operandLabel => {
                                    labelsState.set(operandLabel, false);
                                });
                                let operandObjectData: operandObjectData = {
                                    operand: label,
                                    labelsState: labelsState
                                };
                                operandsData.set(functionality.labelsDesc[index], operandObjectData);

                            });
                            let groupByoperandDataInitials = Array(functionality.labels.length).fill(0);
                            let groupByOperandsObject: groupByOperandsObject = {
                                id: functionality.id,
                                dataSourceType: functionality.dataSourceType,
                                renderChart: functionality.renderChart,
                                showInTable: functionality.showInTable,
                                tableHeader: functionality.tableHeader,
                                labels: functionality.labels,
                                labelsDesc: functionality.labelsDesc,
                                groupWiseData: [category.id + ' ' + functionality.title, ...groupByoperandDataInitials],
                                operandsData: operandsData
                            };
                            groupByOperandsData.push(groupByOperandsObject);
                            if(functionality.showInTable){
                                itemCurrentStateTableHeaders.push(functionality.tableHeader);
                            }
                            break;
                        case 'statusOverdue':
                        case 'groupByGapAnalysis':
                        case 'groupByState':
                            let statusWiseData: any[] = [];

                            functionality.labelsDesc.forEach(labelDesc => {
                                statusWiseData.push([labelDesc, 0]);
                            });

                            let groupByStateObject: groupByStateObject = {
                                id: functionality.id,
                                dataSourceType: functionality.dataSourceType,
                                type: functionality.type,
                                renderChart: functionality.renderChart,
                                showInTable: functionality.showInTable,
                                tableHeader: functionality.tableHeader,
                                stateCodes: functionality.labels,
                                stateDesc: functionality.labelsDesc,
                                stateColors: functionality.labelColors,
                                openState: "",
                                stateWiseInitialData: JSON.parse(JSON.stringify(statusWiseData)),
                                stateWiseData: JSON.parse(JSON.stringify(statusWiseData)),
                                currentState: "",
                                currentLabelData: JSON.parse(JSON.stringify(groupByObjectCurrentLabelData))
                            };

                            if (functionality.type == "statusOverdue") {
                                groupByStateObject.openState = functionality.openStateLabel;
                                let OpenItemsDueDateMap = new Map();
                                let groupByStateOverDueObject: groupByStateOverDueObject = {
                                    id: functionality.id,
                                    dataSourceType: functionality.dataSourceType,
                                    dataSources: functionality.dataSources,
                                    type: functionality.type,
                                    renderChart: functionality.renderChart,
                                    showInTable: functionality.showInTable,
                                    tableHeader: functionality.tableHeader,
                                    stateCodes: functionality.labels,
                                    stateDesc: functionality.labelsDesc,
                                    stateColors: functionality.labelColors,
                                    openState: "",
                                    stateWiseInitialData: JSON.parse(JSON.stringify(statusWiseData)),
                                    stateWiseData: JSON.parse(JSON.stringify(statusWiseData)),
                                    currentState: "",
                                    currentLabelData: JSON.parse(JSON.stringify(groupByObjectCurrentLabelData)),
                                    OpenItemsDueDateMap: OpenItemsDueDateMap
                                };
                                groupByStateOverdueData.push(groupByStateOverDueObject);
                            } else{
                                groupByStateData.push(groupByStateObject);
                            }

                            if(functionality.showInTable){
                                itemCurrentStateTableHeaders.push(functionality.tableHeader);
                            }
                            break;
                        case 'groupByStack':
                            let groupByStackChartData: any[] = [];

                            let emptyInitials = Array(functionality.categoryLabels.length).fill(0);

                            functionality.groupByLabelsDesc.forEach(labelDesc => {
                                groupByStackChartData.push([labelDesc, ...emptyInitials]);
                            });

                            let groupByStackObject: groupByStackObject = {
                                id: functionality.id,
                                dataSourceType: functionality.dataSourceType,
                                renderChart: functionality.renderChart,
                                showInTable: functionality.showInTable,
                                tableHeader: functionality.tableHeader,
                                categoryCodes: functionality.categoryLabels,
                                categoryDesc: functionality.categoryLabelsDesc,
                                groupByCodes: functionality.groupByLabels,
                                groupByCodesDesc: functionality.groupByLabelsDesc,
                                groupByCodeColors: functionality.groupByLabelColors,
                                groupByStackInitialData: JSON.parse(JSON.stringify(groupByStackChartData)),
                                groupByStackData: JSON.parse(JSON.stringify(groupByStackChartData)),
                                currentLabelData: groupByStackCurrentLabelData
                            };

                            groupByStackData.push(groupByStackObject);
                            if(functionality.showInTable){
                                itemCurrentStateTableHeaders.push(functionality.tableHeader);
                            }
                            break;
                        case 'avg':
                            let SateWiseAvgInitials: any[] = [];
                            let statusWiseTotalDaysData: any[] = [];

                            functionality.labels.forEach(label => {
                                SateWiseAvgInitials.push(0);
                                statusWiseTotalDaysData.push([0, 0]);
                            });

                            functionality.labelsDesc.push("Closure Time");
                            SateWiseAvgInitials.push(0);
                            statusWiseTotalDaysData.push([0, 0]);

                            let avgObject: avgObject = {
                                id: functionality.id,
                                dataSourceType: functionality.dataSourceType,
                                renderChart: functionality.renderChart,
                                stateCodes: functionality.labels,
                                stateDesc: functionality.labelsDesc,
                                allStateCodes: functionality.allLabels,
                                initialStateCodes: functionality.initialStateLabels,
                                allStateDesc: functionality.allLabelDesc,
                                statusWiseTotalDaysData: statusWiseTotalDaysData,
                                statusWiseAvgData: [category.id + ' ' + functionality.title, ...SateWiseAvgInitials],
                                intialState: functionality.initialSateLabel,
                                closedState: functionality.closedStateLabel,
                                rejectedState: functionality.rejectedStateLabel,
                                currentState: "",
                                initiatedDate: null,
                                closedDate: null
                            };

                            avgData.push(avgObject);

                            break;
                        case 'closure':
                            let closedItemsData: any[] = [];
                            let closureObject: closureObject = {
                                id: functionality.id,
                                dataSourceType: functionality.dataSourceType,
                                renderChart: functionality.renderChart,
                                showInTable: functionality.showInTable,
                                tableHeader: functionality.tableHeader,
                                allStateCodes: functionality.allLabels,
                                initialStateCodes: functionality.initialStateLabels,
                                allStateDesc: functionality.allLabelDesc,
                                closedItemsData: closedItemsData,
                                closureTimeData: [category.id + ' ' + functionality.title],
                                intialState: functionality.initialSateLabel,
                                closedState: functionality.closedStateLabel,
                                rejectedState: functionality.rejectedStateLabel,
                                currentState: "",
                                initiatedDate: null,
                                closedDate: null,
                                currentLabelData: closureLabelCurrentData
                            };

                            closureData.push(closureObject);
                            if(functionality.showInTable){
                                itemCurrentStateTableHeaders.push(functionality.tableHeader);
                            }
                            break;
                        case 'tracker':
                            let stateTrackerInitialData: any[] = [['x']];
                            let stateTrackerData: any[] = [['x']];

                            functionality.labelsDesc.forEach(labelDesc => {
                                stateTrackerInitialData.push([labelDesc]);
                                stateTrackerData.push([labelDesc]);
                            });

                            let trackerObject: trackerObject = {
                                id: functionality.id,
                                dataSourceType: functionality.dataSourceType,
                                renderChart: functionality.renderChart,
                                showInTable: functionality.showInTable,
                                stateCodes: functionality.labels,
                                stateDesc: functionality.labelsDesc,
                                stateColors: functionality.labelColors,
                                allStateCodes: functionality.allLabels,
                                allStateDesc: functionality.allLabelDesc,
                                stateTrackerInitialData: stateTrackerInitialData,
                                stateTrackerData: stateTrackerData,
                                closedState: functionality.closedStateLabel,
                                rejectedState: functionality.rejectedStateLabel,
                                currentState: "",
                                currentLabelData: trackerLabelCurrentData
                            };

                            trackerData.push(trackerObject);

                            if(functionality.showInTable){
                                functionality.tableLabelDesc.forEach(lableDesc => {
                                    itemCurrentStateTableHeaders.push(lableDesc);
                                });
                            }
                            break;
                        case 'dateRangeComapre':
                            let dateRangeComapreObject: dateRangeCompareObject = {
                                id: functionality.id,
                                dataSourceType: functionality.dataSourceType,
                                renderChart: functionality.renderChart,
                                showInTable: functionality.showInTable,
                                dateRanges: functionality.dateRanges,
                                defaultDateRange: functionality.defaultDateRange,
                                labels: functionality.labels,
                                labelsDesc: functionality.labelsDesc,
                                labelColors: functionality.labelColors,
                                leastStatusSetDate: null,
                                currentLabelData: dateRangeCompareCurrentLabelData
                            };
                            dateRangeCompareData.push(dateRangeComapreObject);
                            break;
                        case 'groupByNcrDept':
                            let ncOptions = [];
                            let groupByNcrDeptWiseData = [];
                            let groupByNcrDeptInitials = Array(functionality.labels.length).fill(0);
                            let fieldAuditFindings =  IC.getFieldByName(category.id,functionality.sourceTableName);
                            let ncCatColumn = fieldAuditFindings.parameterJson.columns.find(col=>col.name == functionality.sourceTableColumnName);
                            let ncDropDownOptions = IC.getDropDowns(ncCatColumn.options.setting).pop();
                            if( ncDropDownOptions && ncDropDownOptions.value && ncDropDownOptions.value.options){
                                ncOptions = ncDropDownOptions.value.options;
                                for( let option of ncDropDownOptions.value.options){
                                    groupByNcrDeptWiseData.push([option.label, ...groupByNcrDeptInitials]);
                                }
                            }
                            let groupByNcrDeptObject: groupByNcrDeptObject = {
                                id: functionality.id,
                                dataSourceType: functionality.dataSourceType,
                                renderChart: functionality.renderChart,
                                sourceTableName: functionality.sourceTableName,
                                sourceTableColumnName: functionality.sourceTableColumnName,
                                labels: functionality.labels,
                                labelsDesc: functionality.labelsDesc,
                                ncOptions: ncOptions,
                                ncCatColumnField: ncCatColumn.field,
                                groupByNcrDeptWiseData: groupByNcrDeptWiseData,
                                currentLabelData: groupByNcrDeptCurrentLabelData
                            };
                            groupByNcrDeptData.push(groupByNcrDeptObject);
                            break;    
                        case 'groupByNcrAuditor':
                            let groupByNcrAuditorWiseData =  [
                                ['x'],
                                ['No of audits performed'],
                                ['No of NC given'],
                                ['NC ratio']
                            ];
                            let fieldAuditorInfo =  IC.getFieldByName(category.id,functionality.auditorSourceTableName);
                            let auditorTypeColumn = fieldAuditorInfo.parameterJson.columns.find(col=>col.name == functionality.auditorTypeColumnName);
                            let auditorNameColumn = fieldAuditorInfo.parameterJson.columns.find(col=>col.name == functionality.auditorNameColumnName);
                            let auditorDropDownOptions = IC.getDropDowns(auditorTypeColumn.options.setting).pop();
                            let auditorOptionId = "";
                            if( auditorDropDownOptions && auditorDropDownOptions.value && auditorDropDownOptions.value.options){
                                for( let option of auditorDropDownOptions.value.options){
                                    if(option.label == functionality.auditorOptionLabel){
                                        auditorOptionId = option.id;
                                    }
                                }
                            }
                            let groupByNcrAuditorObject: groupByNcrAuditorObject = {
                                id: functionality.id,
                                dataSources: functionality.dataSources,
                                renderChart: functionality.renderChart,
                                auditorSourceTableName: functionality.auditorSourceTableName,
                                auditorTypeColumnName: functionality.auditorTypeColumnName,
                                auditorNameColumnName: functionality.auditorNameColumnName,
                                auditorOptionLabel: functionality.auditorOptionLabel,
                                auditorOptionId: auditorOptionId,
                                auditorTypeColumnField: auditorTypeColumn.field,
                                auditorNameColumnField: auditorNameColumn.field,
                                groupByNcrAuditorWiseData: groupByNcrAuditorWiseData,
                                currentAuditorInfoData: currentAuditorInfoData,
                                currentAuditFindingsData: currentAuditFindingsData
                            };
                            groupByNcrAuditorData.push(groupByNcrAuditorObject);
                            break;        
                    };

                });

                let ByCategoryLabelData: ByCategoryLabelData = {
                    category: category.id,
                    groupByData: groupByData,
                    groupByOperandsData: groupByOperandsData,
                    groupByStateData: groupByStateData,
                    groupByStateOverdueData: groupByStateOverdueData,
                    groupByStackData: groupByStackData,
                    groupByNcrDeptData: groupByNcrDeptData,
                    groupByNcrAuditorData: groupByNcrAuditorData,
                    avgData: avgData,
                    closureData: closureData,
                    trackerData: trackerData,
                    dateRangeCompareData: dateRangeCompareData,
                    itemCurrentStateTableHeaders: itemCurrentStateTableHeaders,
                    itemCurrentStateValues: itemCurrentStateValues
                }

                ByCategoryLabelDetails.push(ByCategoryLabelData);
            });

            // for(const ByCategoryLabelData of ByCategoryLabelDetails){
            //     console.log("ByCategoryLabelData:"+JSON.stringify(ByCategoryLabelData));
            // }
        }

        export function processGroupByObjectData(groupByObject: groupByObject,
            groupByObjectDataSource: XRLabelEntry[],
            functionalityCategory: string,
            dateFilterEnablerMap: any,
            itemCurrentStateTableHeaders: any,
            itemCurrentStateValues: ItemCurrentStateData[]) {

            for (const item of groupByObjectDataSource) {

                let itemCategory: string = item.itemRef.substring(0, item.itemRef.indexOf('-'));

                if (itemCategory !== functionalityCategory) {
                    continue;
                }

                let itemCurrentStateData: ItemCurrentStateData = getitemCurrentStateData(item.itemRef,
                    itemCurrentStateValues,
                    itemCurrentStateTableHeaders);

                for (const label of item.labels) {
                    let labelIndex = groupByObject.labels.findIndex(labelCode => labelCode === label.label);
                    if (labelIndex > -1 && (label.reset.length !== label.set.length)) {
                        if (groupByObject.renderChart == 'Y') {
                            groupByObject.groupWiseData[labelIndex + 1] += 1;
                        }

                        if (groupByObject.showInTable == 'Y') {
                            let headerIndex = itemCurrentStateTableHeaders.findIndex(header => header === groupByObject.tableHeader);
                            itemCurrentStateData.tableValues[headerIndex] = groupByObject.labelsDesc[labelIndex];
                            itemCurrentStateData.attributes.push(groupByObject.labelsDesc[labelIndex]);
                        }

                        if (dateFilterEnablerMap.get(groupByObject.id)) {
                            label.set.sort((a, b) => b.version - a.version);
                            let currentLableSetDate = new Date(label.set[0].dateIso);
                            itemCurrentStateData.InitiatedDate = currentLableSetDate;

                            let groupByObjectcurrentLabelData: groupByObjectCurrentData = {
                                id: item.itemRef,
                                currentLabel: label.label,
                                currentLabelSetDate: currentLableSetDate
                            };

                            groupByObject.currentLabelData.push(groupByObjectcurrentLabelData);
                        }


                    }
                }

                let itemCurrentStateDataIndex = itemCurrentStateValues.findIndex(itemCurrentStateData => itemCurrentStateData.id == item.itemRef);

                if(itemCurrentStateDataIndex > -1){
                    itemCurrentStateValues[itemCurrentStateDataIndex] = itemCurrentStateData;
                }else{
                    itemCurrentStateValues.push(itemCurrentStateData);
                }

            }

        }


        export function processGroupByOperandsData(groupByOperandsObject: groupByOperandsObject,
            groupByOperandsDataSource: XRLabelEntry[],
            functionalityCategory: string) {

            for (const item of groupByOperandsDataSource) {
                let itemCategory: string = item.itemRef.substring(0, item.itemRef.indexOf('-'));

                if (itemCategory !== functionalityCategory) {
                    continue;
                }

                for (const label of item.labels) {
                    groupByOperandsObject.operandsData.forEach((operandObjectData, operandDesc) => {
                        operandObjectData.labelsState.forEach((isLabelSet, operandLabel) => {
                            if ((operandLabel == label.label) && (label.reset.length !== label.set.length)) {
                                isLabelSet = true;
                                operandObjectData.labelsState.set(operandLabel, isLabelSet);
                                groupByOperandsObject.operandsData.set(operandDesc, operandObjectData);
                            }
                        });
                    });
                }

                groupByOperandsObject.operandsData.forEach((operandObjectData, operandDesc) => {

                    let isOperandConditionMatched: Boolean = false;
                    let operandExpression = JSON.parse(JSON.stringify(operandObjectData.operand));

                    operandObjectData.labelsState.forEach((isLabelSet, operandLabel) => {
                        isOperandConditionMatched = isLabelSet;
                        operandExpression = operandExpression.replace(operandLabel, isLabelSet ? "true" : "false");
                    });

                    try {
                        if (eval(operandExpression) == 1) {
                            isOperandConditionMatched = true;
                        }
                    } catch (e) {
                        isOperandConditionMatched = false;
                    }

                    operandObjectData.labelsState.forEach((isLabelSet, operandLabel) => {
                        operandObjectData.labelsState.set(operandLabel, false);
                    });

                    groupByOperandsObject.operandsData.set(operandDesc, operandObjectData);

                    if (isOperandConditionMatched) {
                        let labelDescIndex = groupByOperandsObject.labelsDesc.findIndex(labeldesc => labeldesc === operandDesc);
                        groupByOperandsObject.groupWiseData[labelDescIndex + 1] += 1;
                    }
                });
            }

        }


        export function processGroupByStackData(groupByStackObject: groupByStackObject,
            groupByStackDataSource: XRLabelEntry[],
            functionalityCategory: string,
            itemCurrentStateTableHeaders: any,
            itemCurrentStateValues: ItemCurrentStateData[]) {

            for (const item of groupByStackDataSource) {
                let itemCategory: string = item.itemRef.substring(0, item.itemRef.indexOf('-'));

                if (itemCategory !== functionalityCategory) {
                    continue;
                }

                let itemCurrentStateData: ItemCurrentStateData = getitemCurrentStateData(item.itemRef,
                    itemCurrentStateValues,
                    itemCurrentStateTableHeaders);

                let groupByStackCurrentCategory = new Map();
                let groupByStackCurrentgroup = new Map();

                for (const label of item.labels) {
                    let categoryLabelIndex = groupByStackObject.categoryCodes.findIndex(categoryCode => categoryCode === label.label);
                    let groupLabelIndex = groupByStackObject.groupByCodes.findIndex(groupCode => groupCode === label.label);

                    if (categoryLabelIndex > -1 && (label.reset.length !== label.set.length)) {
                        groupByStackCurrentCategory.set(groupByStackObject.id, { label: label, labelIndex: categoryLabelIndex });
                    } else if (groupLabelIndex > -1 && (label.reset.length !== label.set.length)) {
                        groupByStackCurrentgroup.set(groupByStackObject.id, { label: label, labelIndex: groupLabelIndex });
                    }
                }

                let categoryLabelData = groupByStackCurrentCategory.get(groupByStackObject.id);
                let groupLabelData = groupByStackCurrentgroup.get(groupByStackObject.id);

                let categoryLabelIndex = -1;
                let groupLabelIndex = -1;

                if (categoryLabelData && groupLabelData) {
                    categoryLabelIndex = categoryLabelData.labelIndex;
                    groupLabelIndex = groupLabelData.labelIndex;
                }


                if (categoryLabelIndex >= 0 && groupLabelIndex >= 0) {
                    let groupDesc = groupByStackObject.groupByCodesDesc[groupLabelIndex];
                    let categoryDesc = groupByStackObject.categoryDesc[categoryLabelIndex];

                    groupByStackObject.groupByStackData.forEach(stackGroupData => {
                        if (stackGroupData[0] == groupDesc) {
                            stackGroupData[categoryLabelIndex + 1] += 1;
                        }
                    });

                    categoryLabelData.label.set.sort((a, b) => b.version - a.version);
                    let currentLableSetDate = new Date(categoryLabelData.label.set[0].dateIso);
                    itemCurrentStateData.InitiatedDate = currentLableSetDate;

                    let groupByLabelCurrentData: groupByStackCurrentData = {
                        id: item.itemRef,
                        currentCategoryLabel: categoryDesc,
                        currentgroupLabel: groupDesc,
                        currentgroupLabelSetDate: currentLableSetDate
                    };

                    groupByStackObject.currentLabelData.push(groupByLabelCurrentData);
                }

                let itemCurrentStateDataIndex = itemCurrentStateValues.findIndex(itemCurrentStateData => itemCurrentStateData.id == item.itemRef);

                if(itemCurrentStateDataIndex > -1){
                    itemCurrentStateValues[itemCurrentStateDataIndex] = itemCurrentStateData;
                }else{
                    itemCurrentStateValues.push(itemCurrentStateData);
                }
            }
        }

        export function processGroupByStateData(groupByStateObject: groupByStateObject,
            groupByStateDataSource: XRLabelEntry[],
            functionalityCategory: string,
            dateFilterEnablerMap: any,
            itemCurrentStateTableHeaders: any,
            itemCurrentStateValues: ItemCurrentStateData[]){

            for (const item of groupByStateDataSource) {

                let itemCategory: string = item.itemRef.substring(0, item.itemRef.indexOf('-'));

                if (itemCategory !== functionalityCategory) {
                    continue;
                }

                let itemCurrentStateData: ItemCurrentStateData = getitemCurrentStateData(item.itemRef,
                    itemCurrentStateValues,
                    itemCurrentStateTableHeaders);

                for (const label of item.labels) {

                    let stateIndex = groupByStateObject.stateCodes.findIndex(stateCode => stateCode === label.label);
                    if (stateIndex > -1) {
                        if (label.reset.length !== label.set.length) {
                            if (groupByStateObject.renderChart == 'Y') {
                                groupByStateObject.stateWiseData[stateIndex][1] += 1;
                            }
                            groupByStateObject.currentState = label.label;
                            itemCurrentStateData.currentState = label.label;
                            if (groupByStateObject.showInTable == 'Y') {
                                let headerIndex = itemCurrentStateTableHeaders.findIndex(header => header === groupByStateObject.tableHeader);
                                itemCurrentStateData.tableValues[headerIndex] = groupByStateObject.stateDesc[stateIndex];
                                itemCurrentStateData.attributes.push(groupByStateObject.stateDesc[stateIndex]);
                            }

                            if (dateFilterEnablerMap.get(groupByStateObject.id)) {
                                label.set.sort((a, b) => b.version - a.version);
                                let currentLableSetDate = new Date(label.set[0].dateIso);
                                itemCurrentStateData.InitiatedDate = currentLableSetDate;

                                let groupByObjectcurrentLabelData: groupByObjectCurrentData = {
                                    id: item.itemRef,
                                    currentLabel: label.label,
                                    currentLabelSetDate: currentLableSetDate
                                };

                                groupByStateObject.currentLabelData.push(groupByObjectcurrentLabelData);
                            }
                        }
                    }
                }

                let itemCurrentStateDataIndex = itemCurrentStateValues.findIndex(itemCurrentStateData => itemCurrentStateData.id == item.itemRef);

                if(itemCurrentStateDataIndex > -1){
                    itemCurrentStateValues[itemCurrentStateDataIndex] = itemCurrentStateData;
                }else{
                    itemCurrentStateValues.push(itemCurrentStateData);
                }
            }

        }

        export function processGroupByStateNeedleData(groupByStateObject: groupByStateObject,
            groupByStateDataSource: XRTrimNeedleItem[]){

            for (const item of groupByStateDataSource) {
                if(item.fieldVal.length > 0){

                    let fieldValue = item.fieldVal[0].value;

                    let stateIndex = groupByStateObject.stateCodes.findIndex(stateCode => stateCode === fieldValue);
                            
                    if(stateIndex > -1){
                        if(groupByStateObject.renderChart == 'Y'){
                            groupByStateObject.stateWiseData[stateIndex][1] += 1;
                        }
                    }
                }
            }

        }


        export function processGroupByStateOverDueData(groupByStateOverDueObject: groupByStateOverDueObject,
            labelsDataSource: XRLabelEntry[],
            needlesDataSource: XRTrimNeedleItem[],
            functionalityCategory: string,
            dateFilterEnablerMap: any,
            itemCurrentStateTableHeaders: any,
            itemCurrentStateValues: ItemCurrentStateData[]) {


            let OpenItemsDueDateMap = new Map();

            needlesDataSource.forEach((needleItem) => {
                if (needleItem.fieldVal.length > 0) {
                    let itemId = needleItem.itemOrFolderRef.substring(0, needleItem.itemOrFolderRef.lastIndexOf('-'));
                    let itemDueDate = needleItem.fieldVal[0].value;
                    OpenItemsDueDateMap.set(itemId, itemDueDate);
                }
            });

            for (const item of labelsDataSource) {

                let itemCategory: string = item.itemRef.substring(0, item.itemRef.indexOf('-'));

                if (itemCategory !== functionalityCategory) {
                    continue;
                }

                let itemCurrentStateData: ItemCurrentStateData = getitemCurrentStateData(item.itemRef,
                    itemCurrentStateValues,
                    itemCurrentStateTableHeaders);  

                for (const label of item.labels) {

                    let stateIndex = groupByStateOverDueObject.stateCodes.findIndex(stateCode => stateCode === label.label);
                    let isCurrentStateOverDue = false;

                    if (stateIndex > -1) {

                        if (label.reset.length !== label.set.length) {
                            groupByStateOverDueObject.currentState = label.label;
                            itemCurrentStateData.currentState = label.label;
                            groupByStateOverDueObject.OpenItemsDueDateMap = OpenItemsDueDateMap;
                            if (groupByStateOverDueObject.renderChart == 'Y') {
                                if (itemCurrentStateData.currentState == groupByStateOverDueObject.openState) {
                                    let itemDueDate = this.OpenItemsDueDateMap.get(item.itemRef);
                                    //check for overdue
                                    if (new Date(itemDueDate) < new Date()) {
                                        groupByStateOverDueObject.stateWiseData[groupByStateOverDueObject.stateDesc.length - 1][1] += 1;
                                        itemCurrentStateData.currentState = groupByStateOverDueObject.stateDesc[groupByStateOverDueObject.stateDesc.length - 1];
                                        isCurrentStateOverDue = true;
                                    } else {
                                        groupByStateOverDueObject.stateWiseData[stateIndex][1] += 1;
                                    }
                                } else {
                                    groupByStateOverDueObject.stateWiseData[stateIndex][1] += 1;
                                }
                            }

                            if (groupByStateOverDueObject.showInTable == 'Y') {
                                let headerIndex = itemCurrentStateTableHeaders.findIndex(header => header === groupByStateOverDueObject.tableHeader);
                                let tableValue;
                                if (isCurrentStateOverDue) {
                                    tableValue = itemCurrentStateData.currentState;
                                } else {
                                    tableValue = groupByStateOverDueObject.stateDesc[stateIndex];
                                }
                                itemCurrentStateData.tableValues[headerIndex] = tableValue;
                                itemCurrentStateData.attributes.push(tableValue);
                            }
                            if (dateFilterEnablerMap.get(groupByStateOverDueObject.id)) {
                                label.set.sort((a, b) => b.version - a.version);
                                let currentLableSetDate = new Date(label.set[0].dateIso);
                                itemCurrentStateData.InitiatedDate = currentLableSetDate;

                                let groupByObjectcurrentLabelData: groupByObjectCurrentData = {
                                    id: item.itemRef,
                                    currentLabel: label.label,
                                    currentLabelSetDate: currentLableSetDate
                                };

                                groupByStateOverDueObject.currentLabelData.push(groupByObjectcurrentLabelData);
                            }
                        }

                    }
                }

                let itemCurrentStateDataIndex = itemCurrentStateValues.findIndex(itemCurrentStateData => itemCurrentStateData.id == item.itemRef);

                if(itemCurrentStateDataIndex > -1){
                    itemCurrentStateValues[itemCurrentStateDataIndex] = itemCurrentStateData;
                }else{
                    itemCurrentStateValues.push(itemCurrentStateData);
                }
            }

        }

        export function processAvgData(avgObject: avgObject,
            avgDataSource: XRLabelEntry[],
            functionalityCategory: string) {

            for (const item of avgDataSource) {

                let itemCategory: string = item.itemRef.substring(0, item.itemRef.indexOf('-'));

                if (itemCategory !== functionalityCategory) {
                    continue;
                }

                let initiateStatesDataMap: Map<string, Date> = new Map<string, Date>(); 

                for (const label of item.labels) {
                    let stateIndex = avgObject.allStateCodes.findIndex(stateCode => stateCode === label.label);
                    if (stateIndex > -1 && (label.reset.length !== label.set.length)) {
                        avgObject.currentState = label.label;
                    }

                    if(stateIndex > -1){
                        let initialStateIndex = avgObject.initialStateCodes.findIndex(stateCode => stateCode === label.label);
                        if(initialStateIndex > -1){

                            label.set.sort((a, b) => a.version - b.version);
                            let intiatedDate = new Date(label.set[0].dateIso);
                          
                            if (initiateStatesDataMap.get(label.label)) {
                                if(intiatedDate > initiateStatesDataMap.get(label.label)){
                                    initiateStatesDataMap.set(label.label,intiatedDate);
                                }
                            }else{
                                initiateStatesDataMap.set(label.label,intiatedDate);
                            }
                        }
                    }

                    
                    let closedStateIndex = avgObject.allStateCodes.findIndex(stateCode => stateCode === avgObject.closedState);
                    if (stateIndex == closedStateIndex) {
                        label.set.sort((a, b) => b.version - a.version);
                        const colosedDate = new Date(label.set[0].dateIso);
                        avgObject.closedDate = colosedDate;
                    }

                    if (label.reset.length == label.set.length) {
                        if (avgObject.renderChart == 'Y') {
                            let avgStateIndex = avgObject.stateCodes.findIndex(stateCode => stateCode === label.label);
                            if (avgStateIndex > -1) {
                                let labelstateDaysCount = getItemStateDays(label);
                                avgObject.statusWiseTotalDaysData[avgStateIndex][0] += labelstateDaysCount;
                                avgObject.statusWiseTotalDaysData[avgStateIndex][1] += 1;
                            }
                        }
                    }
                }

                for(const intialStateCode of avgObject.initialStateCodes){
                    if(initiateStatesDataMap.get(intialStateCode)){
                        let intiatedDate = initiateStatesDataMap.get(intialStateCode);
                        avgObject.initiatedDate = intiatedDate;
                        break;
                    }
                }

                let currentStateIndex = avgObject.allStateCodes.findIndex(stateCode => stateCode === avgObject.currentState);
                let closedStateIndex = avgObject.allStateCodes.findIndex(stateCode => stateCode === avgObject.closedState);

                if (currentStateIndex == closedStateIndex) {
                    if (avgObject.initiatedDate && avgObject.closedDate) {
                        let time_difference = avgObject.closedDate.getTime() - avgObject.initiatedDate.getTime();
                        //calculate days difference by dividing total milliseconds in a day  
                        let days_difference = time_difference / (1000 * 60 * 60 * 24);
                        let daysToCloseItem = Math.floor(days_difference);
                        if (avgObject.renderChart == 'Y') {
                            let closureTimeLabelIndex = avgObject.statusWiseTotalDaysData.length;
                            avgObject.statusWiseTotalDaysData[closureTimeLabelIndex - 1][0] += daysToCloseItem;
                            avgObject.statusWiseTotalDaysData[closureTimeLabelIndex - 1][1] += 1;
                        }
                    }
                }

            }

            avgObject.statusWiseTotalDaysData.forEach((element, index) => {
                let avgData = 0;
                if (element[1] !== 0) {
                    avgData = element[0] / element[1]
                }
                avgObject.statusWiseAvgData[index + 1] = avgData.toFixed(2);
            });

        }

        export function processClosureData(closureObject: closureObject,
            closureDataSource: XRLabelEntry[],
            functionalityCategory: string,
            dateFilterEnablerMap: any,
            itemCurrentStateTableHeaders: any,
            itemCurrentStateValues: ItemCurrentStateData[]) {

            for (const item of closureDataSource) {

                let itemCategory: string = item.itemRef.substring(0, item.itemRef.indexOf('-'));

                if (itemCategory !== functionalityCategory) {
                    continue;
                }

                let itemCurrentStateData: ItemCurrentStateData = getitemCurrentStateData(item.itemRef,
                    itemCurrentStateValues,
                    itemCurrentStateTableHeaders);

                let initiateStatesDataMap: Map<string, Date> = new Map<string, Date>();    

                for (const label of item.labels) {
                    let stateIndex = closureObject.allStateCodes.findIndex(stateCode => stateCode === label.label);
                    if (stateIndex > -1 && (label.reset.length !== label.set.length)) {
                        closureObject.currentState = label.label;
                    }

                    if(stateIndex > -1){
                        let initialStateIndex = closureObject.initialStateCodes.findIndex(stateCode => stateCode === label.label);
                        if(initialStateIndex > -1){

                            label.set.sort((a, b) => a.version - b.version);
                            let intiatedDate = new Date(label.set[0].dateIso);
                          
                            if (initiateStatesDataMap.get(label.label)) {
                                if(intiatedDate > initiateStatesDataMap.get(label.label)){
                                    initiateStatesDataMap.set(label.label,intiatedDate);
                                }
                            }else{
                                initiateStatesDataMap.set(label.label,intiatedDate);
                            }
                        }
                    }

                    let closedStateIndex = closureObject.allStateCodes.findIndex(stateCode => stateCode === closureObject.closedState);
                    if (stateIndex == closedStateIndex) {
                        label.set.sort((a, b) => b.version - a.version);
                        const colosedDate = new Date(label.set[0].dateIso);
                        closureObject.closedDate = colosedDate;
                        itemCurrentStateData.ClosedDate = colosedDate;
                    }
                }

                for(const intialStateCode of closureObject.initialStateCodes){
                    if(initiateStatesDataMap.get(intialStateCode)){
                        let intiatedDate = initiateStatesDataMap.get(intialStateCode);
                        closureObject.initiatedDate = intiatedDate;
                        itemCurrentStateData.InitiatedDate = intiatedDate;
                        break;
                    }
                }

                let currentStateIndex = closureObject.allStateCodes.findIndex(stateCode => stateCode === closureObject.currentState);
                let closedStateIndex = closureObject.allStateCodes.findIndex(stateCode => stateCode === closureObject.closedState);
                if (currentStateIndex == closedStateIndex) {
                    if (closureObject.initiatedDate && closureObject.closedDate) {
                        let time_difference = closureObject.closedDate.getTime() - closureObject.initiatedDate.getTime();
                        //calculate days difference by dividing total milliseconds in a day  
                        let days_difference = time_difference / (1000 * 60 * 60 * 24);
                        let daysToCloseItem = Math.floor(days_difference);
                        if (closureObject.renderChart == 'Y') {
                            closureObject.closedItemsData.push(item.itemRef);
                            closureObject.closureTimeData.push(daysToCloseItem);
                        }
                        if (closureObject.showInTable == 'Y') {
                            let headerIndex = itemCurrentStateTableHeaders.findIndex(header => header === closureObject.tableHeader);
                            itemCurrentStateData.tableValues[headerIndex] = daysToCloseItem;
                        }
                        if (dateFilterEnablerMap.get(closureObject.id) && closureObject.closedDate) {

                            let closureItemsCurrentData: closureObjectCurrentData = {
                                id: item.itemRef,
                                daysToClose: daysToCloseItem,
                                closedDate: closureObject.closedDate
                            };

                            closureObject.currentLabelData.push(closureItemsCurrentData);
                        }
                    }
                }

                let itemCurrentStateDataIndex = itemCurrentStateValues.findIndex(itemCurrentStateData => itemCurrentStateData.id == item.itemRef);

                if(itemCurrentStateDataIndex > -1){
                    itemCurrentStateValues[itemCurrentStateDataIndex] = itemCurrentStateData;
                }else{
                    itemCurrentStateValues.push(itemCurrentStateData);
                }
            }
        }

        export function processDateRangeCompareData(dateRangeCompareObject: dateRangeCompareObject,
            dateRangeCompareDataSource: XRLabelEntry[],
            functionalityCategory: string) {

            for (const item of dateRangeCompareDataSource) {

                let itemCategory: string = item.itemRef.substring(0, item.itemRef.indexOf('-'));

                if (itemCategory !== functionalityCategory) {
                    continue;
                }

                for (const label of item.labels) {
                    let labelIndex = dateRangeCompareObject.labels.findIndex(labelCode => labelCode === label.label);

                    if (labelIndex > -1 && (label.reset.length !== label.set.length)) {
                        if (dateRangeCompareObject.renderChart == 'Y') {

                            label.set.sort((a, b) => b.version - a.version);
                            let currentLableSetDate = new Date(label.set[0].dateIso);

                            if ((!dateRangeCompareObject.leastStatusSetDate) || (currentLableSetDate < dateRangeCompareObject.leastStatusSetDate)) {
                                dateRangeCompareObject.leastStatusSetDate = currentLableSetDate;
                            }

                            let dateRangeComapreCurrentLabelData: groupByObjectCurrentData = {
                                id: item.itemRef,
                                currentLabel: dateRangeCompareObject.labelsDesc[labelIndex],
                                currentLabelSetDate: currentLableSetDate
                            };

                            dateRangeCompareObject.currentLabelData.push(dateRangeComapreCurrentLabelData);
                        }
                    }
                }
            }
        }

        export function processTrackerData(trackerObject: trackerObject,
            trackerDataSource: XRLabelEntry[],
            functionalityCategory: string,
            dateFilterEnablerMap: any,
            itemCurrentStateTableHeaders: any,
            itemCurrentStateValues: ItemCurrentStateData[]) {

            for (const item of trackerDataSource) {

                let itemCategory: string = item.itemRef.substring(0, item.itemRef.indexOf('-'));

                if (itemCategory !== functionalityCategory) {
                    continue;
                }

                let itemCurrentStateData: ItemCurrentStateData = getitemCurrentStateData(item.itemRef,
                    itemCurrentStateValues,
                    itemCurrentStateTableHeaders);

                let itemIndex = -1;
                let stateTrackerInitialData = JSON.parse(JSON.stringify(trackerObject.stateTrackerData));

                for (const label of item.labels) {

                    let stateIndex = trackerObject.allStateCodes.findIndex(stateCode => stateCode === label.label);
                    if (stateIndex > -1 && (label.reset.length !== label.set.length)) {
                        trackerObject.currentState = label.label;
                        itemCurrentStateData.currentState = label.label;
                    }

                    let labelstateDaysCount = getItemStateDays(label);

                    if (trackerObject.renderChart == 'Y') {
                        let trackerStateIndex = trackerObject.stateCodes.findIndex(stateCode => stateCode === label.label);
                        if (trackerStateIndex > -1) {
                            if (itemIndex > -1) {
                                trackerObject.stateTrackerData[trackerStateIndex + 1][itemIndex + 1] = labelstateDaysCount;
                            } else {
                                trackerObject.stateTrackerData[0].push(item.itemRef);
                                itemIndex = trackerObject.stateTrackerData[0].length - 2;
                                for (let i = 0; i <= trackerObject.stateCodes.length - 1; i++) {
                                    trackerObject.stateTrackerData[i + 1].push(0);
                                }
                                trackerObject.stateTrackerData[trackerStateIndex + 1][itemIndex + 1] = labelstateDaysCount;
                            }

                            if (dateFilterEnablerMap.get(trackerObject.id)) {
                                let currentLableSetDate = null;
                                let currentState = null;
                                if (label.reset.length !== label.set.length) {
                                    label.set.sort((a, b) => b.version - a.version);
                                    currentLableSetDate = new Date(label.set[0].dateIso);
                                    currentState = label.label;
                                    itemCurrentStateData.InitiatedDate = currentLableSetDate;
                                }

                                let trackerItemCurrentData = trackerObject.currentLabelData.get(item.itemRef);

                                if (trackerItemCurrentData) {
                                    trackerItemCurrentData.currentState = currentState;
                                    trackerItemCurrentData.currentStateSetDate = currentLableSetDate;
                                    trackerItemCurrentData.itemStateDays.set(label.label, labelstateDaysCount);
                                    trackerObject.currentLabelData.set(item.itemRef, trackerItemCurrentData);

                                } else {
                                    let trackerObjectCurrentData: trackerObjectCurrentData = {
                                        id: item.itemRef,
                                        currentState: currentState,
                                        currentStateSetDate: currentLableSetDate,
                                        itemStateDays: new Map<string, Number>()
                                    };
                                    trackerObjectCurrentData.itemStateDays.set(label.label, labelstateDaysCount);
                                    trackerObject.currentLabelData.set(item.itemRef, trackerObjectCurrentData);
                                }
                            }
                        }
                    }

                    if (stateIndex > -1 && trackerObject.showInTable == 'Y') {

                        let stateDesc = trackerObject.allStateDesc[stateIndex];
                        let headerIndex = itemCurrentStateTableHeaders.findIndex(header => header === stateDesc);
                        if(headerIndex > -1){
                            itemCurrentStateData.tableValues[headerIndex] = labelstateDaysCount;
                        }

                    }

                }

                let currentStateIndex = trackerObject.allStateCodes.findIndex(stateCode => stateCode === trackerObject.currentState);
                let closedStateIndex = trackerObject.allStateCodes.findIndex(stateCode => stateCode === trackerObject.closedState);
                let rejectedStateIndex = trackerObject.allStateCodes.findIndex(stateCode => stateCode === trackerObject.rejectedState);
                if ((currentStateIndex == closedStateIndex)
                    || (currentStateIndex == rejectedStateIndex)
                ) {
                    // let stateTrackerInitialData: any[] = [['x']];

                    // trackerObject.stateDesc.forEach(labelDesc => {
                    //     stateTrackerInitialData.push([labelDesc]);
                    // });  
                    trackerObject.stateTrackerData = stateTrackerInitialData;
                }

                

                let itemCurrentStateDataIndex = itemCurrentStateValues.findIndex(itemCurrentStateData => itemCurrentStateData.id == item.itemRef);

                if(itemCurrentStateDataIndex > -1){
                    itemCurrentStateValues[itemCurrentStateDataIndex] = itemCurrentStateData;
                }else{
                    itemCurrentStateValues.push(itemCurrentStateData);
                }
            }

        }

        export function processGroupByNcrDeptObjectData(groupByNcrDeptObject: groupByNcrDeptObject,
            groupByNcrDeptObjectDataSource: XRTrimNeedleItem[]) {

            for (const item of groupByNcrDeptObjectDataSource) {       
                if(item.labels){
                    let itemDeptIndex = -1;
                    for(const label of groupByNcrDeptObject.labels){
                        if(item.labels.includes(label)){
                            let labelIndex = groupByNcrDeptObject.labels.findIndex(labelCode => labelCode === label);
                            itemDeptIndex = labelIndex;
                            break;
                        }
                    }

                    if(itemDeptIndex > 0){
                        if(item.fieldVal.length == 1){
                            let auditFindingTable = JSON.parse(item.fieldVal[0].value);
                            for( let auditFindingLine of auditFindingTable){
                                let ncId = auditFindingLine[groupByNcrDeptObject.ncCatColumnField];
                                let ncOption = groupByNcrDeptObject.ncOptions.find(ncOption => ncOption.id === ncId);
                                groupByNcrDeptObject.groupByNcrDeptWiseData.forEach(ncDeptWiseData => {
                                    if(ncDeptWiseData[0] == ncOption.label){
                                    ncDeptWiseData[itemDeptIndex+1] += 1;
                                    }
                                });

                                let groupByNcrDeptCurrentData: groupByNcrDeptCurrentData = {
                                    id: item.itemOrFolderRef,
                                    creationDate: new Date(item.creationDate),
                                    labels: item.labels,
                                    ncLabel: ncOption.label
                                };

                                groupByNcrDeptObject.currentLabelData.push(groupByNcrDeptCurrentData);

                            }
                        }
                    }
                }
            }
        }

        export function processGroupByNcrAuditorObjectData(groupByNcrAuditorObject: groupByNcrAuditorObject,
            auditFindingsDataSource: XRTrimNeedleItem[],
            auditorinfoDataSource: XRTrimNeedleItem[],
            ) {

                let auditorsData = [];
                let auditCountData = [];
                let auditItemsData = [];
                let auditNcCountData = [];
                let auditNcRatio = [];

                for (const auditInfoItem of auditorinfoDataSource) { 
                    if(auditInfoItem.fieldVal.length == 1){
                        let auditInfoTable = JSON.parse(auditInfoItem.fieldVal[0].value);
                        for( let auditInfoLine of auditInfoTable){
                            let auditorOptionId = auditInfoLine[groupByNcrAuditorObject.auditorTypeColumnField];
                            if(auditorOptionId == groupByNcrAuditorObject.auditorOptionId){
                                let auditorName = auditInfoLine[groupByNcrAuditorObject.auditorNameColumnField];

                                let auditorInfoCurrentData: auditorInfoCurrentData = {
                                    id: auditInfoItem.itemOrFolderRef,
                                    creationDate: new Date(auditInfoItem.creationDate),
                                    auditorName: auditorName,
                                    auditorOptionId: auditorOptionId
                                };

                                groupByNcrAuditorObject.currentAuditorInfoData.push(auditorInfoCurrentData);

                                let auditorIndex = auditorsData.findIndex(auditor => auditor === auditorName);
                                if(auditorIndex > -1){
                                    auditCountData[auditorIndex] += 1;
                                    auditItemsData[auditorIndex].push(auditInfoItem.itemOrFolderRef);
                                }else{
                                    auditorsData.push(auditorName);
                                    auditCountData.push(1);
                                    auditItemsData.push([auditInfoItem.itemOrFolderRef])
                                    auditNcCountData.push(0);
                                    auditNcRatio.push(0);
                                }
                            }
                        }
                    }
                }

                for (const auditFindingItem of auditFindingsDataSource) { 
                    if(auditFindingItem.fieldVal.length == 1){
                        let auditFindingTable = JSON.parse(auditFindingItem.fieldVal[0].value);
                        let itemIndex = -1;
                        for( let auditItems of auditItemsData){
                            itemIndex += 1;
                            let auditorItemIndex = auditItems.findIndex(itemRefId => itemRefId === auditFindingItem.itemOrFolderRef);
                            if(auditorItemIndex > 0){
                                let auditNcCount = auditFindingTable.length;
                                auditNcCountData[itemIndex] += auditNcCount;

                                let auditFindingsCurrentData: auditFindingsCurrentData = {
                                    id: auditFindingItem.itemOrFolderRef,
                                    creationDate: new Date(auditFindingItem.creationDate),
                                    auditNcCount: auditNcCount
                                };

                                groupByNcrAuditorObject.currentAuditFindingsData.push(auditFindingsCurrentData);
                                break;
                            }
                        }
                    }
                }

                auditorsData.forEach((auditor, index) => {
                    if(auditNcCountData[index] !== 0){
                        auditNcRatio[index] = Math.round(((auditNcCountData[index]/auditCountData[index]) + Number.EPSILON) * 100) / 100;
                    }
                });

                groupByNcrAuditorObject.groupByNcrAuditorWiseData = [
                    ['x', ...auditorsData],
                    ['No of audits performed',...auditCountData],
                    ['No of NC given', ...auditNcCountData],
                    ['NC ratio', ...auditNcRatio]
                ];
        }

    }
}