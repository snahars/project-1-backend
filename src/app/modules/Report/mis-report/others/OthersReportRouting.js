import React from "react";
import { Redirect, Switch } from "react-router-dom";
import { ContentRoute } from "../../../../../_metronic/layout";
import ProfitabilityAnalysisReport from "./ProfitabilityAnalysisReport";

export function OthersReportRouting() {
  return (
    <Switch>
      <Redirect
        exact={true}
        from="/report/mis-report/mis-report-others"
        to="/report/mis-report/mis-report-others/mis-report-others-profitability-analysis"
      />
 
      <ContentRoute
        path="/report/mis-report/mis-report-others/mis-report-others-profitability-analysis"
        component={ProfitabilityAnalysisReport}
      />

    </Switch>
  );
}