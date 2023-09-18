import React, { useEffect, useState } from 'react';
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import { Card, CardBody } from "../../../../../_metronic/_partials/controls";
import { showError } from '../../../../pages/Alert';
import axios from "axios";
import { shallowEqual, useSelector } from "react-redux";
import Button from '@material-ui/core/Button';
import moment from "moment";
import MisReportBreadCrum from '../MisReportBreadCrum';

// IMPORT COMMON COMPONENT FILE
import ReportProductCategoryTreeView from '../../../Common/ReportProductCategoryTreeView';
import DepotList from "../../../Common/DepotList"
import CommonDateComponent from '../../../Common/CommonDateComponent';
import CommonReportType from "../../../Common/CommonReportType";
import CommonReportFormat from "../../../Common/CommonReportFormat";

export default function DepotToDepotMovementReport() {

    const fields = {
        categoryIds: "",
        productCategoryId: "",
        startDate: "",
        endDate: "",
        reportFormat: "",
    };

    const [inputs, setInputs] = useState(fields);
    const companyId = useSelector((state) => state.auth.company, shallowEqual);
    const [categoryIds, setCategoryIds] = useState([]);

    const [salesOfficerIds, setSalesOfficerIds] = useState([]);
    // DEPOT COMPONENT USE STATE
    const [depots, setDepots] = useState([]);
    const [depotList, setDepotList] = useState([]);
    const [depotShow, setDepotShow] = useState("ONLY_COMPANY");

    // DATE COMPONENT USE STATE
    const [inputsDate, setInputsDate] = useState({});
    const [dateType, setDateType] = useState("Date");

    // REPORT TYPE COMPONENT USE STATE
    const [reportType, setReportType] = useState("");

    // REPORT FORMATE COMPONENT USE STATE
    const [reportFormat, setReportFormat] = useState("");

    // PRODUCT SELECT USE STATE
    const [categoryLevel, setCategoryLevel] = useState("");
    const [productSelect, setProductSelect] = useState([]);
    const [producCategoryTree, setProductCategoryTree] = useState([]);

    useEffect(() => {
        document.getElementById('reportShowIframe').style.display = "none";
        getProductCategoryTreeList(companyId);
    }, [companyId]);


    const getProductCategoryTreeList = (params) => {
        const URL = `${process.env.REACT_APP_API_URL}/api/product-category/list-info/` + params;
        if (params.companyId) {
            axios.get(URL).then(response => {
                setProductCategoryTree(response.data.data.childProductCategoryDtoList);
            }).catch(err => {
                showError("Can not get product category tree data.");
            });
        }
    }

    const findTreeNode = (node, targetNode, productList) => {
        if (node.treeLevel === targetNode.treeLevel) {
            node.productList = productList;
            return;
        }
        node.children.map(obj => {
            findTreeNode(obj, targetNode, productList)
        });
    }

    const selectTreeNode = (node) => {
        if (node.children.length == 0) {
            let id = "product-list-id-" + node.id;
            const getId = document.getElementById(id);
            if (getId.className == "product-list d-none") {
                getId.classList.remove('d-none');
                let queryString = '?';
                queryString += '&companyId=' + companyId;
                queryString += '&productCategoryId=' + node.id;
                const URL = `${process.env.REACT_APP_API_URL}/api/product/get-product-category-wise-product/` + queryString;
                axios.get(URL).then(response => {
                    let productList = response.data.data
                    let temp = [...producCategoryTree];
                    temp.map(obj => {
                        findTreeNode(obj, node, productList)
                    });
                    setProductCategoryTree(temp);
                }).catch(err => {
                    showError("Can not get product list.");
                });
            } else {
                getId.classList.add('d-none');
            }
        }
        if (categoryLevel != "") {
            setCategoryLevel(node.treeLevel)
            if (categoryLevel.split('-').length == node.treeLevel.split('-').length) {
                let id = "report-product-category-tree-id-" + node.id;
                const getId = document.getElementById(id);

                if (getId.className == "tree-nav__item_demo tree-nav__item-title report-product-category-tree-selected") {
                    getId.classList.remove('report-product-category-tree-selected');
                } else {
                    getId.classList.add('report-product-category-tree-selected');
                    if (node.children.length == 0) {
                        let id = "product-list-id-" + node.id;
                        const getId = document.getElementById(id);
                        getId.classList.remove('d-none')
                    }

                }

            } else {
                let id = "report-product-category-tree-id-" + node.id;
                const getId = document.getElementById(id);
                const getElements = document.getElementsByClassName('tree-nav__item_demo tree-nav__item-title');
                for (var i = 0; i < getElements.length; i++) {
                    getElements[i].classList.remove('report-product-category-tree-selected');
                }


                const getProductListIdElements = document.getElementsByClassName('product-list');
                for (var i = 0; i < getProductListIdElements.length; i++) {
                    getProductListIdElements[i].classList.add('d-none');
                }

                if (getId) {
                    getId.classList.add('report-product-category-tree-selected');
                    if (node.children.length == 0) {
                        let id = "product-list-id-" + node.id;
                        const getId = document.getElementById(id);
                        getId.classList.remove('d-none')
                    }
                }
            }

        } else {
            setCategoryLevel(node.treeLevel)
            let id = "report-product-category-tree-id-" + node.id;
            const getId = document.getElementById(id);
            if (getId.className == "tree-nav__item_demo tree-nav__item-title report-product-category-tree-selected") {
                getId.classList.remove('report-product-category-tree-selected');
            } else {
                getId.classList.add('report-product-category-tree-selected');
                if (node.children.length == 0) {
                    let id = "product-list-id-" + node.id;
                    const getId = document.getElementById(id);
                    getId.classList.remove('d-none')
                }
            }
        }
    }

    const selectProductNode = (node) => {
        let temp = [...productSelect]
        let index = temp.findIndex(obj => obj.id == node.id)
        if (index > -1) {
            temp.splice(index, 1);
            setProductSelect(temp)
        } else {
            temp.push(node)
            setProductSelect(temp)
        }

    }

    const getParamsDate = () => {
        let startDate = '';
        let endDate = '';
        if (dateType === 'Date') {
            startDate = inputsDate.startDate === undefined || inputsDate.startDate === null || inputsDate.startDate === '' ? '' : inputsDate.startDate;   // 2023-03-01  yyyy-mm-dd
            endDate = inputsDate.endDate === undefined || inputsDate.endDate === null || inputsDate.endDate === '' ? '' : inputsDate.endDate;   // 2023-03-01  yyyy-mm-dd
        } else if (dateType === 'Month') {
            let startY = inputsDate.startMonth.getFullYear();
            let startM = inputsDate.startMonth.getMonth() + 1;
            startM = startM < 9 ? startM = '0' + startM : startM;
            let endY = inputsDate.endMonth.getFullYear();
            let endM = inputsDate.endMonth.getMonth() + 1;
            endM = endM < 9 ? endM = '0' + endM : endM;
            startDate = inputsDate.startMonth === undefined || inputsDate.startMonth === null || inputsDate.startMonth === '' ? '' : (startY + '-' + startM + '-01');
            endDate = inputsDate.endMonth === undefined || inputsDate.endMonth === null || inputsDate.endMonth === '' ? '' : (endY + '-' + endM + '-31')
        } else if (dateType === 'Year') {
            startDate = inputsDate.fromYear === undefined || inputsDate.fromYear === null || inputsDate.fromYear === '' ? '' : (inputsDate.fromYear + '-01-01');
            endDate = inputsDate.toYear === undefined || inputsDate.toYear === null || inputsDate.toYear === '' ? '' : (inputsDate.toYear + '-12-31');
        }
        return { startDate: startDate, endDate: endDate };
    }

    const validate = () => {
        let dates = getParamsDate();
        let startDate = dates.startDate;
        let endDate = dates.endDate;

        if (endDate < startDate) {
            showError(`End ${dateType} should be greater than Start ${dateType}.`);
            return false;
        } else if (reportType === '') {
            showError('Please Select Report Type.');
            return false;
        } else if (reportFormat === '') {
            showError('Please Select Report Formate.');
            return false;
        }
        return true;

    }
    const download = () => {
        // if (categoryIds.length == 0) {
        //     // all category pass when no category selected
        //     producCategoryTree.map(aaa => {            
        //         getProductCategoryIds(aaa);
        //     }) 
        // }         

        if (!validate()) {
            return false;
        }
        let queryString = '?';
        queryString += 'companyId=' + parseInt(companyId);
        queryString += categoryIds.length !== 0 ? '&categoryIds=' + categoryIds : '';
        queryString += inputs.productCategoryId ? '&productCategoryId=' + inputs.productCategoryId : '';
        queryString += '&startDate=' + inputs.startDate;
        queryString += '&endDate=' + inputs.endDate;
        queryString += '&reportFormat=' + inputs.reportFormat;

        const URL = `${process.env.REACT_APP_API_URL}/api/reports/depot-to-depot-movement-history` + queryString;
        axios.get(URL, { responseType: 'blob' }).then(response => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            if (inputs.reportFormat == "pdf") {
                link.setAttribute('download', "depotToDepotMovement.pdf");
            }
            else {
                link.setAttribute('download', "depotToDepotMovement.xlsx");
            }
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        }).catch(err => {
            showError();
        });
    }

    const previewValidate = () => {
        let dates = getParamsDate();
        let startDate = dates.startDate;
        let endDate = dates.endDate;
        if (endDate < startDate) {
            showError(`End ${dateType} should be greater than Start ${dateType}.`);
            return false;
        } else if (reportType === '') {
            showError('Please Select Report Type.');
            return false;
        }
        return true;
    }

    const preview = () => {
        // if (categoryIds.length == 0) {
        //     // all category pass when no category selected
        //     producCategoryTree.map(aaa => {            
        //         getProductCategoryIds(aaa);
        //     }) 
        // }         

        if (!previewValidate()) {
            return false;
        }
        let queryString = '?';
        queryString += 'companyId=' + parseInt(companyId);
        queryString += categoryIds.length !== 0 ? '&categoryIds=' + categoryIds : '';
        queryString += inputs.productCategoryId ? '&productCategoryId=' + inputs.productCategoryId : '';
        queryString += '&startDate=' + inputs.startDate;
        queryString += '&endDate=' + inputs.endDate;
        queryString += '&reportFormat=' + "pdf";

        const dataURL = `${process.env.REACT_APP_API_URL}/api/reports/depot-to-depot-movement-history` + queryString;
        axios.get(dataURL, { responseType: 'blob' }).then(response => {
            const file = new Blob([response.data], { type: "application/pdf" });
            const fileURL = URL.createObjectURL(file);
            const iframe = document.querySelector("iframe");
            if (iframe?.src) iframe.src = fileURL;
            document.getElementById('reportShowIframe').style.display = "inline-block";
        }).catch(err => {
            showError();
        });
    }
    return (
        <>
            <div>
                <MisReportBreadCrum menuTitle="Depot To Depot Movement Report" />
            </div>
            <div>
                <Card>
                    <CardBody>
                        <div className='row'>
                            {/* LEFT SIDE TREE ROW */}
                            <div className='col-xl-5' style={{ borderRight: "1px solid #F2F2F2" }}>
                                <div style={{ borderBottom: "1px solid #F2F2F2" }}>
                                    <label>
                                        <img src={toAbsoluteUrl("/images/loc3.png")}
                                            style={{ width: "20px", height: "20px", textAlign: "center" }}
                                            alt='Company Picture' />

                                        <strong style={{
                                            marginLeft: "10px",
                                            color: "#828282"
                                        }}>Product Category (All)</strong>
                                    </label>
                                </div>
                                {/* TREE */}
                                <ReportProductCategoryTreeView
                                    tree={producCategoryTree}
                                    selectProductCategoryTreeNode={selectTreeNode}
                                    selectProduct={selectProductNode}
                                />
                            </div>
                            {/* RIGHT SIDE LIST ROW */}
                            <div className='col-xl-7'>
                                {/* DEPOT COMPONENT */}
                                <DepotList
                                    companyIdPass={companyId}
                                    setDepotListPass={setDepotList}
                                    depotListPass={depotList}
                                    salesOfficerIdsDepotPass={salesOfficerIds}
                                    depots={depots} setDepots={setDepots}
                                    depotShow={depotShow}
                                />

                                {/* DATE COMPONENT */}
                                <CommonDateComponent
                                    inputs={inputsDate}
                                    setInputs={setInputsDate}
                                    type={dateType}
                                    setType={setDateType}
                                />

                                {/* REPORT TYPE COMPONENT */}
                                <CommonReportType
                                    setReportType={setReportType}
                                />

                                {/* REPORT FORMATE COMPONENT */}
                                <CommonReportFormat
                                    setReportFormat={setReportFormat}
                                />
                                <Button className="float-right mt-5" id="gotItBtn" variant="contained"
                                    color="primary"
                                    onClick={download}
                                >
                                    download
                                </Button>
                                <div className="float-right">
                                    <Button className="mt-5 mr-5" id="gotItBtn" variant="contained" color="primary" onClick={preview}>
                                        Preview
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className='mt-5'>
                            <iframe src="" className='w-100' id="reportShowIframe" height="500px" />
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}