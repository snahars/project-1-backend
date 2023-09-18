import React, { useEffect, useMemo, useState } from 'react';
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import { Card, CardBody } from "../../../../../_metronic/_partials/controls";
import { showError } from '../../../../pages/Alert';
import axios from "axios";
import { useIntl } from "react-intl";
import { shallowEqual, useSelector } from "react-redux";
import Button from '@material-ui/core/Button';
import moment from "moment";
import MisReportBreadCrum from '../MisReportBreadCrum';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IOSSwitch from '../../../../pages/IOSSwitch';

// IMPORT COMMON COMPONENT FILE
import ReportLocationTreeView from '../../../Common/ReportLocationTreeView';
import ReportProductCategoryTreeView from '../../../Common/ReportProductCategoryTreeView';
import DepotList from "../../../Common/DepotList";
import CommonDateComponent from '../../../Common/CommonDateComponent';
import CommonReportType from "../../../Common/CommonReportType";
import CommonReportFormat from "../../../Common/CommonReportFormat";

export default function MaterialPlannerReport() {

    const fields = {
        locationId: "",
        productCategoryId: "",
        startDate: "",
        endDate: "",
        report: "",
        reportType: ""

    };

    const [inputs, setInputs] = useState(fields);
    const userLoginId = useSelector((state) => state.auth.user.userId, shallowEqual);
    const intl = useIntl();
    const companyId = useSelector((state) => state.auth.company, shallowEqual);
    const [categoryIds] = useState([]);
    const [withSum, setWithSum] = useState(false);

    // NATIONAL BUTTON STATE
    const [nationalLocationChecked, setNationalLocationChecked] = useState(false);

    // LOCATION TREE COMPONENT USE STATE
    const [nodes, setNodes] = useState([]);
    const [categoryLevel, setCategoryLevel] = useState("");
    const [locationTree, setLocationTree] = useState([]);
    const [locationIds, setLocationIds] = useState([]);


    // DEPOT COMPONENT USE STATE
    const [depots, setDepots] = useState([]);
    const [depotList, setDepotList] = useState([]);
    const [depotShow, setDepotShow] = useState("COMPANY_AND_SALES_OFFICER_ID");

    // DATE COMPONENT USE STATE
    const [inputsDate, setInputsDate] = useState({});
    const [dateType, setDateType] = useState("Date");

    // REPORT TYPE COMPONENT USE STATE
    const [reportType, setReportType] = useState("");

    // REPORT FORMATE COMPONENT USE STATE
    const [reportFormat, setReportFormat] = useState("");

    // SALES OFFICER COMPONENT USE STATE
    const [salesOfficer, setSalesOfficer] = useState([]);
    const [salesOfficerList, setSalesOfficerList] = useState([]);
    const [salesOfficerIds, setSalesOfficerIds] = useState([]);

    // for product category tree
    const [productCategoryTree, setProductCategoryTree] = useState([]);
    const [productSelect, setProductSelect] = useState([]);
    const [productCategoryIds, setProductCategoryIds] = useState([]);
    const [productCategoryNodes, setProductCategoryNodes] = useState([]);


    useEffect(() => {
        document.getElementById('reportShowIframe').style.display = "none";
        getLocationTreeList(companyId)
        getProductCategoryTreeList(companyId);
    }, [companyId]);

    useEffect(() => {
        nodes.map(node => { getLocationIds(node) })
    }, [nodes]);

    useEffect(() => {
        getSalesOfficerListByLocation(companyId, locationIds, nationalLocationChecked)
    }, [companyId, locationIds, nationalLocationChecked]);

    useEffect(() => {
        getSalesOfficerIds(salesOfficer)
    }, [salesOfficer]);

    const getSalesOfficerIds = (salesOfficer) => {
        salesOfficerIds.length = 0;
        salesOfficer.map((data) => {
            let temp = [...salesOfficerIds]
            let index = temp.findIndex(id => id === data.id)
            if (index === -1) {
                setSalesOfficerIds(current => [...current, data.id]);
            }
        })
    }

    const getSalesOfficerListByLocation = (companyId, locationIds, nationalAll) => {
        if (nationalAll) {
            setSalesOfficer([])
            let queryString = '?';
            queryString += 'companyId=' + companyId;
            queryString += '&locationIds=' + locationIds;
            const URL = `${process.env.REACT_APP_API_URL}/auth/get-sales-officer-by-location-wise` + queryString;
            axios.get(URL).then(response => {
                setSalesOfficer(response.data.data)
            }).catch(err => {
            });

        } else {
            setSalesOfficer([])
            if (locationIds.length > 0) {
                let queryString = '?';
                queryString += 'companyId=' + companyId;
                queryString += '&locationIds=' + locationIds;
                const URL = `${process.env.REACT_APP_API_URL}/auth/get-sales-officer-by-location-wise` + queryString;
                axios.get(URL).then(response => {
                    setSalesOfficer(response.data.data)
                }).catch(err => {
                });
            }
        }

    }

    const getLocationTreeList = (companyId) => {
        const URL = `${process.env.REACT_APP_API_URL}/api/location-tree/report-location-tree-info/${companyId}`;
        axios.get(URL).then(response => {
            const locationTree = response.data.data.locationAsTree;
            setLocationTree(locationTree);
        }).catch(err => {
            showError("Cannot get Location Tree data.");
        });
    }

    const getLocationIds = (node) => {
        let temp = [...locationIds]
        let index = temp.findIndex(id => id === node.id)
        if (index === -1) {
            setLocationIds(current => [...current, node.id]);
        }
        node.children.map(nodeChild => {
            getLocationIds(nodeChild)
        })
    }

    const selectLocationTreeNode = (node) => {
        locationIds.length = 0;
        let temp = [...nodes]
        let index = temp.findIndex(data => data.treeLevel == node.treeLevel)
        if (index > -1) {
            temp.splice(index, 1);
            setNodes(temp)
        } else {
            temp.push(node)
            setNodes(temp)
        }
        if (categoryLevel != "") {
            setCategoryLevel(node.treeLevel)
            if (categoryLevel.split('-').length == node.treeLevel.split('-').length) {
                let id = "report-location-tree-view-id-" + node.id;
                const getId = document.getElementById(id);
                if (getId.className == "d-flex justify-content-between tree-nav__item_demo tree-nav__item-title report-location-tree-selected") {
                    getId.classList.remove('report-location-tree-selected');
                    depots.length = 0;
                } else {
                    getId.classList.add('report-location-tree-selected');
                    setNationalLocationChecked(false)
                }
            } else {
                let id = "report-location-tree-view-id-" + node.id;
                const getId = document.getElementById(id);
                const getElements = document.getElementsByClassName('tree-nav__item_demo tree-nav__item-title');
                for (var i = 0; i < getElements.length; i++) {
                    getElements[i].classList.remove('report-location-tree-selected');
                    depots.length = 0;
                }
                if (getId) {
                    getId.classList.add('report-location-tree-selected');
                    setNationalLocationChecked(false)
                }
            }

        } else {
            setCategoryLevel(node.treeLevel)
            let id = "report-location-tree-view-id-" + node.id;
            const getId = document.getElementById(id);
            if (getId.className == "d-flex justify-content-between tree-nav__item_demo tree-nav__item-title report-location-tree-selected") {
                getId.classList.remove('report-location-tree-selected');
                depots.length = 0;
            } else {
                getId.classList.add('report-location-tree-selected');
                setNationalLocationChecked(false)
            }
        }
    }

    useEffect(() => {
        productCategoryNodes.map(node => {
            getProductCategoryIds(node)
        })
    }, [productCategoryNodes]);

    const handleActive = () => {
        depots.length = 0;
        let checked = document.getElementById('nationalId').checked;
        setNationalLocationChecked(checked)
        if (checked) {
            nodes.length = 0;
            locationIds.length = 0;
            const getElements = document.getElementsByClassName('tree-nav__item_demo tree-nav__item-title');
            for (let i = 0; i < getElements.length; i++) {
                getElements[i].classList.remove('report-location-tree-selected');
            }
        }
    }

    const getProductCategoryTreeList = (params) => {
        const URL = `${process.env.REACT_APP_API_URL}/api/product-category/list-info/` + params;
        if (params) {
            axios.get(URL).then(response => {
                setProductCategoryTree(response.data.data.childProductCategoryDtoList);
            }).catch(err => {
                showError("Can not get product category tree data.");
            });
        }
    }

    const selectTreeNode = (node) => {
        productCategoryIds.length = 0;
        let temp = [...productCategoryNodes]
        let index = temp.findIndex(data => data.treeLevel == node.treeLevel)
        if (index > -1) {
            temp.splice(index, 1);
            setProductCategoryNodes(temp)
        } else {
            temp.push(node)
            setProductCategoryNodes(temp)
        }
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
                    let temp = [...productCategoryTree];
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

                let productListId = "product-list-id-" + node.id;
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

    const getProductCategoryIds = (node) => {
        let temp = [...productCategoryIds]
        let index = temp.findIndex(id => id === node.id)
        if (index === -1) {
            setProductCategoryIds(current => [...current, node.id]);
        }
        node.children.map(nodeChild => {
            getProductCategoryIds(nodeChild)
        })
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

    const findTreeNode = (node, targetNode, productList) => {
        if (node.treeLevel === targetNode.treeLevel) {
            node.productList = productList;
            return;
        }
        node.children.map(obj => {
            findTreeNode(obj, targetNode, productList)
        });
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

    // const validate = () => {
    //     let dates = getParamsDate();
    //     let startDate = dates.startDate;
    //     let endDate = dates.endDate;

    //     if (nationalLocationChecked === false) {
    //         if (locationIds.length === 0) {
    //             showError('Please Select Location.');
    //             return false;
    //         }else if (endDate < startDate) {
    //             showError(`End ${dateType} should be greater than Start ${dateType}.`);
    //             return false;
    //         }else if (reportType === '') {
    //             showError('Please Select Report Type.');
    //             return false;
    //         }else if (reportFormat === '') {
    //             showError('Please Select Report Formate.');
    //             return false;
    //         }
    //     }else if (endDate < startDate) {
    //         showError(`End ${dateType} should be greater than Start ${dateType}.`);
    //         return false;
    //     }else if (reportType === '') {
    //         showError('Please Select Report Type.');
    //         return false;
    //     }else if (reportFormat === '') {
    //         showError('Please Select Report Formate.');
    //         return false;
    //     }
    //     return true;
    // }
    const validate = () => {
        if (nationalLocationChecked === false) {
            if (locationIds.length === 0) {
                showError('Please Select Location.');
                return false;
            }
        }

        if (reportType === '') {
            showError('Please Select Report Type.');
            return false;
        }

        if (reportFormat === '') {
            showError('Please Select Report Formate.');
            return false;
        }
        return true;
    }
    const download = () => {
        if (!validate()) {
            return false;
        }

        let dptList = [];
        depotList.map(d => dptList.push(d.id));
        dptList.sort(function (a, b) {
            return a - b
        });

        let dates = getParamsDate();
        let startDate = dates.startDate;
        let endDate = dates.endDate;

        let queryParams = '?nationalLocationChecked=' + nationalLocationChecked;
        queryParams += '&companyId=' + companyId;
        queryParams += locationIds.length !== 0 ? '&locationIds=' + locationIds : '';
        queryParams += productCategoryIds.length !== 0 ? '&categoryIds=' + productCategoryIds.join(',') : '';
        queryParams += depotList.length !== 0 ? '&depotIds=' + dptList.join(',') : '';
        queryParams += '&startDate=' + startDate;
        queryParams += '&endDate=' + endDate;
        queryParams += '&reportType=' + reportType;
        queryParams += '&isWithSum=' + withSum;
        queryParams += '&reportFormat=' + reportFormat;
        console.log("productCategoryIds===========", queryParams)
        const URL = `${process.env.REACT_APP_API_URL}/api/reports/material-planner` + queryParams;
        axios.get(URL, { responseType: 'blob' }).then(response => {
            if (reportFormat === "PDF") {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', "MaterialPlannerReport.pdf");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', "MaterialPlannerReport.xlsx");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            // const url = window.URL.createObjectURL(new Blob([response.data]));
            // const link = document.createElement('a');
            // link.href = url;
            // if(inputs.report == "PDF") {
            //     link.setAttribute('download', "materialPlannerReport.pdf");
            // }
            // else {
            //     link.setAttribute('download', "materialPlannerReport.xlsx");
            // }
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);

        }).catch(err => {
            showError();
        });

    }

    const previewValidate = () => {
        if (nationalLocationChecked === false) {
            if (locationIds.length === 0) {
                showError('Please Select Location.');
                return false;
            }
        }

        if (reportType === '') {
            showError('Please Select Report Type.');
            return false;
        }
        return true;
    }

    const preview = () => {

        if (!previewValidate()) {
            return false;
        }

        let dptList = [];
        depotList.map(d => dptList.push(d.id));
        dptList.sort(function (a, b) {
            return a - b
        });

        let dates = getParamsDate();
        let startDate = dates.startDate;
        let endDate = dates.endDate;

        let queryParams = '?nationalLocationChecked=' + nationalLocationChecked;
        queryParams += '&companyId=' + companyId;
        queryParams += locationIds.length !== 0 ? '&locationIds=' + locationIds : '';
        queryParams += productCategoryIds.length !== 0 ? '&categoryIds=' + productCategoryIds.join(',') : '';
        queryParams += depotList.length !== 0 ? '&depotIds=' + dptList.join(',') : '';
        queryParams += '&startDate=' + startDate;
        queryParams += '&endDate=' + endDate;
        queryParams += '&reportType=' + reportType;
        queryParams += '&isWithSum=' + withSum;
        queryParams += '&reportFormat=' + "PDF";
        const dataURL = `${process.env.REACT_APP_API_URL}/api/reports/material-planner` + queryParams;
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
                <MisReportBreadCrum menuTitle="Material Planner Report" />
            </div>
            <div>
                <Card>
                    <CardBody>
                        <div className='row'>
                            {/* LOCATION TREE */}
                            <div className='col-xl-3' style={{ borderRight: "1px solid #F2F2F2" }}>
                                <div style={{ borderBottom: "1px solid #F2F2F2" }}>
                                    <label>
                                        <img src={toAbsoluteUrl("/images/loc3.png")}
                                            style={{ width: "20px", height: "20px", textAlign: "center" }}
                                            alt='Company Picture' />
                                        <strong style={{ marginLeft: "10px", color: "#828282" }}>{intl.formatMessage({ id: "COMMON.LOCATION_ALL" })}</strong>
                                    </label>
                                </div>
                                {/* NATIONAL BUTTON */}
                                <div>
                                    <FormControlLabel
                                        control={<IOSSwitch id="nationalId"
                                            checked={nationalLocationChecked}
                                            onClick={handleActive}
                                        />}
                                        label="National"
                                    />
                                </div>
                                {/* LOCATION TREE */}
                                <ReportLocationTreeView tree={locationTree} selectLocationTreeNode={selectLocationTreeNode} />
                            </div>
                            {/* PRODUCT CATEGORY TREE */}
                            <div className='col-xl-4' style={{ borderRight: "1px solid #F2F2F2" }}>
                                <div style={{ borderBottom: "1px solid #F2F2F2" }}>
                                    <label>
                                        <img src={toAbsoluteUrl("/images/loc3.png")}
                                            style={{ width: "20px", height: "20px", textAlign: "center" }}
                                            alt='Company Picture' />
                                        <strong style={{ marginLeft: "10px", color: "#828282" }}>{intl.formatMessage({ id: "COMMON.PRODUCT_CATEGORY_ALL" })}</strong>
                                    </label>
                                </div>
                                {/* TREE */}
                                <ReportProductCategoryTreeView
                                    tree={productCategoryTree}
                                    selectProductCategoryTreeNode={selectTreeNode}
                                    selectProduct={selectProductNode}
                                />
                            </div>
                            {/* SUBMITION SIDE */}
                            <div className='col-xl-5'>
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
                                    setWithSum={setWithSum}
                                />

                                {/* REPORT FORMATE COMPONENT */}
                                <CommonReportFormat
                                    setReportFormat={setReportFormat}
                                />

                                <Button className="float-right mt-5" id="gotItBtn" variant="contained"
                                    color="primary"
                                    onClick={download}
                                >
                                    Download
                                </Button>
                                <div className="float-right">
                                    <Button className="mt-5 mr-5" id="gotItBtn" variant="contained" color="primary"
                                        onClick={preview}>Preview
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