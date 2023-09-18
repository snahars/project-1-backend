import React, {useState, useEffect} from 'react';
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../../../_metronic/_helpers";
import {
    Card,
    CardBody,
} from "../../../../../../_metronic/_partials/controls";
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import {showError} from '../../../../../pages/Alert';
import { useIntl } from "react-intl";
import { shallowEqual, useSelector } from "react-redux";

import { CollectionDataTable } from '../collection-data-table/CollectionDataTable';
import CollectionBreadCrum from '../../common/CollectionBreadCrum'
import CollectionTodaySales from "../../common/CollectionTodaySales"
import LocationTreeView from '../../../CommonComponents/LocationTreeView';
import { amountFormatterWithoutCurrency } from '../../../../Util';

export  function CollectionData(props) {
    const selectedCompany = useSelector((state) => state.auth.company, shallowEqual);
    let history = useHistory();
    let [singleAll, setSingleAll] = React.useState([]);
    const [locationTree, setLocationTree] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState({});
    const [paymentCollectionList, setPaymentCollectionList] = useState({});
    const [collectionAmount, setCollectionAmount] = useState(0);
    const [accountingYearId, setAccountingYearId] = useState('');
    const [sessionData, setSessionData] = useState({userLoginId: 1, companyId: selectedCompany, accountingYearId: 1});
    const [searchParams, setSearchParams] = useState({...sessionData, locationId: '', semesterId: ''});
    const [allAccountingYear, setAllAccountingYear] = useState([]);
    const intl = useIntl();

    useEffect(() => {
        document.getElementById('pills-payment-collection-data-tab').classList.add('active');
        getLocationTreeList(sessionData);
        getPaymentCollectionList(searchParams);
    }, []);

    useEffect(() => {
        setSearchParams({...searchParams, companyId: selectedCompany});
        getAccountingYear(selectedCompany)
    }, [selectedCompany]);

    useEffect(() => {
        getLocationTreeList(searchParams);
        getPaymentCollectionList(searchParams); 
    }, [searchParams]);
   
    const handleExport = () => {
        const exportData = [...singleAll]
        // console.log(exportData);
    }

    const getPaymentCollectionList = (obj) => { 
        let queryString = '?';
        queryString += 'userLoginId=' + obj.userLoginId;
        queryString += '&companyId=' + obj.companyId;
        queryString += '&accountingYearId=' + obj.accountingYearId;
        queryString += obj.locationId ? '&locationId=' + obj.locationId : '';
        const URL = `${process.env.REACT_APP_API_URL}/api/payment-collection/payment-list` + queryString;

        axios.get(URL, JSON.stringify(obj), { headers: { "Content-Type": "application/json" } }).then(response => {
            let paymentList = response.data.data.paymentList;
            let collectionAmount = response.data.data.collectionAmount;
            setPaymentCollectionList(paymentList);
            setCollectionAmount(collectionAmount);
        }).catch(err => {
            //showError(intl.formatMessage({id: "COMMON.ERROR_PAYMENT_COLLECTION_DATA"}));
        });
    }

    const getLocationTreeList = () => {
        const URL = `${process.env.REACT_APP_API_URL}/api/location-tree/locationTree/${sessionData.userLoginId}/${sessionData.companyId}`;
        if (sessionData.companyId) {
        axios.get(URL).then(response => {
            const locationTree = response.data.data;
            setLocationTree(locationTree);
        }).catch(err => {
            showError(intl.formatMessage({id: "COMMON.ERROR_LOCATION_TREE"}));
        });}
    }

    const selectLocationTreeNode = (node) => {
        let id = "summary-id-"+node.id;
        const getId = document.getElementById(id);
        const getElements = document.getElementsByClassName('tree-nav__item_demo tree-nav__item-title');
        
        for (var i = 0; i < getElements.length; i++) {
            getElements[i].classList.remove('tree-nav-item');
        }
        if (getId) {
            getId.classList.add('tree-nav-item');
            let searchObj={...searchParams,locationId:node.id.toString()};
            setSearchParams(searchObj);
            setSelectedLocation(node);
            getPaymentCollectionList(searchObj);
        }
    }
    const handleKeyPressChange = (e) => {
        if (e.keyCode === 32) {
            getPaymentCollectionList(searchParams); 
        } else if (e.keyCode === 8) {
            getPaymentCollectionList(searchParams); 
        }
    }
    const handleSearchChange = (event) => {
        let value = event.target.value;
        getSearchList(value);
    }
    const getSearchList = (searchText) => {
        let searchTextValue = searchText.toLowerCase();
        console.log(paymentCollectionList)
        let tp = [];
        for (let i = 0; i < paymentCollectionList.length; i++) {
            let distributorName = paymentCollectionList[i].distributorName.toLowerCase();
            if (distributorName.includes(searchTextValue)) {
                tp.push(paymentCollectionList[i]);
            }
        }
        setPaymentCollectionList(tp);
    }
    const getAccountingYear = (companyId) => {        
        const URL = `${process.env.REACT_APP_API_URL}/api/accounting-year/companyWise/${companyId}`;
        if (companyId) {
        axios.get(URL).then(response => {
            setAllAccountingYear(response.data.data);
        }).catch(err => {
            //showError(intl.formatMessage({ id: "COMMON.ERROR_STATUS" }));
        });}
    }
    const setAccountingYearData = (event) => {
        setAccountingYearId(event.target.value)
    }
    return (
        <>
           {/* BREAD CRUM ROW */}
           <CollectionBreadCrum />
            {/* TODAY SALE ROW */}
           <CollectionTodaySales />
            <div>
                <Card>
                    <CardBody>
                        <div>
                            <div className='row'>
                                {/* LEFT SIDE TREE ROW */}
                                <div className='col-xl-3' style={{ borderRight: "1px solid #F2F2F2" }}>
                                    <div style={{ borderBottom: "1px solid #F2F2F2" }}>
                                        <label>
                                            <img src={toAbsoluteUrl("/images/loc3.png")}
                                                style={{ width: "20px", height: "20px", textAlign: "center" }}
                                                alt='Company Picture' />
                                            <strong style={{ marginLeft: "10px", color: "#828282" }}>{intl.formatMessage({id: "COMMON.LOCATION_ALL"})}</strong>
                                        </label>
                                    </div>
                                    {/* TREE */}
                                    <LocationTreeView tree={locationTree}
                                                      selectLocationTreeNode={selectLocationTreeNode}/>
                                </div>
                                {/* RIGHT SIDE LIST ROW */}
                                <div className='col-xl-9'>
                                    {/* SEARCHING AND FILTERING ROW */}
                                    <div className="row">
                                        <div className="col-xl-3">
                                            <div style={{ position: "absolute", padding: "7px", marginTop: "3px" }}>
                                                <img src={toAbsoluteUrl("/images/search.png")} width="20px" height="20px" />
                                            </div>
                                            <form className="form form-label-right">
                                                <input type="text" className="form-control" name="searchText"
                                                    placeholder="Search Here"
                                                    style={{ paddingLeft: "28px" }}
                                                    onKeyUp={(e) => handleKeyPressChange(e)}
                                                    onChange={handleSearchChange}
                                                />
                                            </form>
                                        </div>
                                        <div className="col-xl-9 d-flex flex-wrap justify-content-end">
                                            <div className='mr-3'>
                                            <div className="row">
                                                    <div className="col-3 mt-3">
                                                        <label className="dark-gray-color">Timeline</label>
                                                    </div>
                                                    <div className="col-9">
                                                        <select className="border-0 form-control" onChange={setAccountingYearData}>
                                                        <option value="" selected>Select Fiscal Year</option>
                                                                {allAccountingYear.map((accYear) => (
                                                                <option key={accYear.fiscalYearName} value={accYear.id}>
                                                                        {accYear.fiscalYearName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <button className="btn filter-btn">
                                                    <i class="bi bi-funnel"></i>&nbsp;{intl.formatMessage({id: "COMMON.FILTER"})}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* ALL SUMMARY ROW */}
                                    <div className='sales-data-chip d-flex flex-wrap justify-content-between'>
                                        <div style={{ borderRadius: "5px 0px 0px 5px" }}>
                                            <div className="d-flex">
                                                <div className="dark-gray-color">
                                                    <i className="bi bi-geo-alt"></i>
                                                </div>
                                                <div className="ml-2">
                                                    <span>
                                                        <span className="dark-gray-color"
                                                            style={{ fontWeight: "500" }}>{intl.formatMessage({id: "LOCATION.AREA"})}</span>
                                                        <p><strong>{selectedLocation.locationName?selectedLocation.locationName:'All'}</strong></p>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="d-flex">
                                                <div className="dark-gray-color">
                                                    <SVG src={toAbsoluteUrl("/media/svg/icons/project-svg/box.svg")} width="15px" height="15px" />
                                                </div>
                                                <div className="ml-2">
                                                    <span>
                                                        <span className="dark-gray-color"
                                                            style={{ fontWeight: "500" }}>{intl.formatMessage({id: "PAYMENT.TOTAL_COLLECTION"})}</span>
                                                        <p><strong>{amountFormatterWithoutCurrency(collectionAmount)}</strong></p>
                                                        {/* {collectionAmount?collectionAmount.toString():0.00} */}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className='col-xl-3 sales-data-chip' style={{ borderRadius: "0px 5px 5px 0px" }}>
                                            <div className="d-flex">
                                                <div className="dark-gray-color">
                                                    <img src={toAbsoluteUrl("/images/LineChart.png")} width="24px" height="24px" />
                                                </div>
                                                <div className="ml-2">
                                                    <span>
                                                        <span className="dark-gray-color"
                                                            style={{ fontWeight: "500" }}>{intl.formatMessage({id: "PAYMENT.COLLECTION_BUDGET"})}</span>
                                                        <p><strong>28,030,000</strong></p>
                                                    </span>
                                                </div>
                                            </div>
                                        </div> */}
                                        <div style={{ background: "#F9F9F9" }}>
                                            <button className="btn float-right export-btn" onClick={handleExport}>
                                                <SVG src={toAbsoluteUrl("/media/svg/icons/project-svg/download.svg")} width="15px" height="15px" />
                                            </button>
                                        </div>
                                    </div>
                                    {/* TABLE ROW */}
                                    <div className='mt-5'>
                                        <CollectionDataTable setSingleAll = {setSingleAll} singleAll={singleAll} paymentCollectionList={paymentCollectionList}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </>
    );
}