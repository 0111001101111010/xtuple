--------------------------------------------------------------------
REMOVED REPORTS:
AROpenItemsByCustomer
ExpediteExceptionsByPlannerCode
PurchaseOrder
SummarizedTaxableSales
--------------------------------------------------------------------
NEW REPORTS:
AROpenItem
ListOpenReturnAuthorizations
PackageMasterList
ReceivingLabel
SalesCategoriesMasterList
ShipmentsByShipment
ShipmentsPending
SiteTypesMasterList
TaxHistoryDetail
TaxHistorySummary
--------------------------------------------------------------------
CHANGED REPORTS:
APAssignmentsMasterList
APOpenItemsByVendor
AROpenItems
BalanceSheet
BankrecHistory
BriefEarnedCommissions
CashReceipts
CashReceiptsEditList
ContactsMasterList
CountSlipEditList
CountSlipsByWarehouse
CountTagsByClassCode
CountTagsByItem
CountTagsByWarehouse
DepositsRegister
EarnedCommissions
ExpenseCategoriesMasterList
FinancialReport
FreightAccountAssignmentsMasterList
FrozenItemSites
Image
IncidentWorkbenchList
IncidentsByCRMAccount
IncomeStatement
InventoryAvailabilityByParameterList
Invoice
InvoiceRegister
ItemCostHistory
ItemSitesByItem
ItemSitesByParameterList
ListOpenSalesOrders
OpportunityList
PackingList-Shipment
PickingListSONoClosedLines
PricesByCustomer
PurchaseOrder
Quote
SalesAccountAssignmentsMasterList
SalesHistoryByParameterList
SelectPaymentsList
SummarizedBankrecHistory
SummarizedGLTransactions
SummarizedSalesHistoryByShippingZone
TodoByUserAndIncident
TodoItem
TodoList
TrialBalances
UninvoicedReceipts
WOMaterialAvailabilityByWorkOrder


 --------------------------------------------------------------------
 REPORT: APAssignmentsMasterList
 QUERY: detail
 SELECT CASE WHEN (apaccnt_vendtype_id=-1) THEN apaccnt_vendtype
             ELSE (SELECT vendtype_code FROM vendtype WHERE (vendtype_id=apaccnt_vendtype_id))
        END AS vendtypecode,
-       formatGLAccount(apaccnt_ap_accnt_id) AS f_account
+       formatGLAccount(apaccnt_ap_accnt_id) AS apaccnt,
+       formatGLAccount(apaccnt_prepaid_accnt_id) AS prepaidaccnt,
+       formatGLAccount(apaccnt_discount_accnt_id) AS discountaccnt
 FROM apaccnt
 ORDER BY vendtypecode;

 --------------------------------------------------------------------
 REPORT: APOpenItemsByVendor
 QUERY: detail
 SELECT apopen_id, apopen_ponumber, apopen_docnumber,
                     CASE WHEN (apopen_doctype='C') THEN <? value("creditMemo") ?>
                          WHEN (apopen_doctype='D') THEN <? value("debitMemo") ?>
                          WHEN (apopen_doctype='V') THEN <? value("voucher") ?>
                          ELSE <? value("other") ?>
                     END AS f_doctype,
                     apopen_invcnumber AS invoicenumber,
                     formatDate(apopen_docdate) AS f_docdate,
                     formatDate(apopen_duedate) AS f_duedate,
                     formatMoney(apopen_amount) AS f_amount,
                     formatMoney(apopen_paid - COALESCE(SUM(apapply_target_paid),0)) AS f_paid,
                     formatMoney((apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0)) *
                     CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
                     END) AS f_balance,
                     currConcat(apopen_curr_id) AS currAbbr,
                     (apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0))
-                    / round(apopen_curr_rate,5) * (CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
+                    / apopen_curr_rate * (CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
                          END) AS base_balance,
                     formatMoney((apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0))
-                    / round(apopen_curr_rate,5) * (CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
+                    / apopen_curr_rate * (CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
                          END)) AS f_base_balance
              FROM apopen
                LEFT OUTER JOIN apapply ON (((apopen_id=apapply_target_apopen_id)
                                        OR (apopen_id=apapply_source_apopen_id))
                                        AND (apapply_postdate > <? value("asofDate") ?>))
               WHERE ( (COALESCE(apopen_closedate,date <? value("asofDate") ?> + integer '1')><? value("asofDate") ?>)
                 AND   (apopen_docdate<=<? value("asofDate") ?>)
                 AND   (apopen_vend_id=<? value("vend_id") ?>)
                 AND   (apopen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
               GROUP BY apopen_id, apopen_ponumber, apopen_docnumber,apopen_doctype, apopen_invcnumber, apopen_docdate,
                 apopen_duedate, apopen_docdate, apopen_amount, apopen_paid, apopen_curr_id, apopen_curr_rate
               ORDER BY apopen_docdate;

 --------------------------------------------------------------------
 REPORT: AROpenItems
 QUERY: head
-SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
+SELECT
+formatDate(<? value("asofDate") ?>) AS asOfDate,
+<? if exists("creditsOnly") ?>
+  'Credits Only' AS type,
+<? elseif exists("debitsOnly") ?>
+  'Debits Only' AS type,
+<? else ?>
+  'Debits and Credits' AS type,
+<? endif ?>
+<? if exists("cust_id") ?>
+  (SELECT cust_name FROM custinfo WHERE cust_id=<? value("cust_id") ?>) AS selection,
+<? elseif exists("custtype_id") ?>
+  (SELECT custtype_code FROM custtype WHERE custtype_id=<? value("custtype_id") ?>) AS selection,
+<? elseif exists("custtype_pattern") ?>
+  ('Customer Type pattern = ' || <? value("custtype_pattern") ?>) AS selection,
+<? else ?>
+  'All Customers' AS selection,
+<? endif ?>
+<? if exists("startDate") ?>
+      'Start Doc Date:' AS start_label,
+      'End Doc Date:' AS end_label,
+<? else ?>
+      'Start Due Date:' AS start_label,
+      'End Due Date:' AS end_label,
+<? endif ?>
+       formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
-       currConcat(baseCurrId()) AS baseAbbr;
+       currConcat(baseCurrId()) AS baseAbbr,
+<? if exists("incidentsOnly") ?>
+  'Yes' AS incidentsOnly
+<? else ?>
+  'No' AS incidentsOnly
+<? endif ?>;
 --------------------------------------------------------------------

 QUERY: detail
-SELECT aropen_id,
-       aropen_doctype,
-       aropen_docnumber,
-       aropen_ordernumber,
-       formatDate(aropen_docdate) AS f_docdate,
-       formatDate(aropen_duedate) AS f_duedate,
-       formatMoney(aropen_amount) AS f_amount,
-       formatMoney(aropen_paid) AS f_paid,
-       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney((aropen_amount - aropen_paid) * -1)
-            WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(aropen_amount - aropen_paid)
-            ELSE formatMoney(aropen_amount - aropen_paid)
-       END AS f_balance,
-       currToBase(aropen_curr_id,
-           CASE WHEN (aropen_doctype IN ('C', 'R')) THEN ((aropen_amount - aropen_paid) * -1)
-                WHEN (aropen_doctype IN ('I', 'D')) THEN (aropen_amount - aropen_paid)
-                ELSE (aropen_amount - aropen_paid)
-           END, CURRENT_DATE) AS base_balance,
-       currConcat(aropen_curr_id) AS currAbbr,
-       cust_number, cust_name
-  FROM aropen LEFT OUTER JOIN custinfo ON (aropen_cust_id=cust_id)
- WHERE ((aropen_open)
-   AND (aropen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-       )
-ORDER BY aropen_docnumber;

 --------------------------------------------------------------------
 REPORT: BalanceSheet
 QUERY: OtherAssets
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cp_ending_trialbal * -1) AS CYP,
        formatMoney(workglitem_pp_ending_trialbal * -1) AS PYP,
        formatMoney((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) * -1) AS period_diff,
        CASE WHEN workglitem_cp_ending_trialbal = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) / workglitem_cp_ending_trialbal))
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'A')
   and ((workglitem_subaccnttype_code NOT IN ('CA', 'AR', 'IN', 'CAS', 'FA', 'AD'))
       or (workglitem_subaccnttype_code IS NULL)) )
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: header
 select formatDate(workglhead_cyp_startdate) as start_date,
        formatDate(workglhead_cyp_enddate) as end_date
  from workglhead
-where ( workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+where ( workglhead_username = CURRENT_USER)
 --------------------------------------------------------------------

 QUERY: CurrentLiabilities
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cp_ending_trialbal) AS CYP,
        formatMoney(workglitem_pp_ending_trialbal) AS PYP,
        formatMoney((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal)) AS period_diff,
        CASE WHEN workglitem_cp_ending_trialbal = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) / workglitem_cp_ending_trialbal))
        END AS period_diff_percent
 from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'L')
   and (workglitem_subaccnttype_code IN ('CL', 'AP')))
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: CurrentAssets
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cp_ending_trialbal * -1.00) AS CYP,
        formatMoney(workglitem_pp_ending_trialbal * -1.00) AS PYP,
        formatMoney((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) * -1.00) AS period_diff,
        CASE WHEN workglitem_cp_ending_trialbal = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) / workglitem_cp_ending_trialbal)
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'A')
   and (workglitem_subaccnttype_code IN ('CA', 'AR', 'IN', 'CAS')))
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: TotalAssets
 select formatMoney((SUM(workglitem_cp_ending_trialbal)) * -1.00) AS CYP,
        formatMoney((SUM(workglitem_pp_ending_trialbal)) * -1.00) AS PYP,
        formatMoney(((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal))) * -1.00) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal))
        END AS period_diff_percent from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'A'))
 --------------------------------------------------------------------

 QUERY: totalExpenses
 select formatMoney(SUM(workglitem_cp_ending_trialbal) * -1) AS CYP,
        formatMoney(SUM(workglitem_pp_ending_trialbal) * -1) AS PYP,
        formatMoney((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) * -1) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal)))
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'E')
   and ((workglitem_subaccnttype_code != 'COGS')
       or (workglitem_subaccnttype_code IS NULL)) )
 --------------------------------------------------------------------

 QUERY: ProfitLoss
 select        formatMoney(SUM(workglitem_cy_balance)) AS CY,
        formatMoney(SUM(workglitem_py_balance)) AS PY,
        formatMoney(SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) AS prior_year_diff,
        CASE WHEN SUM(workglitem_cy_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) / SUM(workglitem_cy_balance))
        END AS prior_year_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'R')
    or (workglitem_accnt_type = 'E'))
 --------------------------------------------------------------------

 QUERY: TotalLTL
 select formatMoney(SUM(workglitem_cp_ending_trialbal)) AS CYP,
        formatMoney(SUM(workglitem_pp_ending_trialbal)) AS PYP,
        formatMoney(SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal))
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'L')
   and (workglitem_subaccnttype_code = 'LTL'))


 --------------------------------------------------------------------

 QUERY: LTL
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cp_ending_trialbal) AS CYP,
        formatMoney(workglitem_pp_ending_trialbal) AS PYP,
        formatMoney(workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) AS period_diff,
        CASE WHEN workglitem_cp_ending_trialbal = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) / workglitem_cp_ending_trialbal)
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'L')
   and (workglitem_subaccnttype_code = 'LTL'))
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: TotalLiabilities
 select formatMoney(SUM(workglitem_cp_ending_trialbal)) AS CYP,
        formatMoney(SUM(workglitem_pp_ending_trialbal)) AS PYP,
        formatMoney(SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal))
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and ((workglitem_accnt_type = 'L')))
 --------------------------------------------------------------------

 QUERY: TotalCurrentLiabilities
 select formatMoney(SUM(workglitem_cp_ending_trialbal)) AS CYP,
        formatMoney(SUM(workglitem_pp_ending_trialbal)) AS PYP,
        formatMoney((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal))) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal)))
        END AS period_diff_percent
 from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'L')
   and (workglitem_subaccnttype_code IN ('CL', 'AP')))
 --------------------------------------------------------------------

 QUERY: FixedAssets
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cp_ending_trialbal * -1.00) AS CYP,
        formatMoney(workglitem_pp_ending_trialbal * -1.00) AS PYP,
        formatMoney((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) * -1.00) AS period_diff,
        CASE WHEN workglitem_cp_ending_trialbal = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) / workglitem_cp_ending_trialbal)
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'A')
   and (workglitem_subaccnttype_code IN ('FA', 'AD')))
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: TotalFixedAssets
 select formatMoney(SUM(workglitem_cp_ending_trialbal) * -1.00) AS CYP,
        formatMoney(SUM(workglitem_pp_ending_trialbal) * -1.00) AS PYP,
        formatMoney((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) * -1.00) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal))
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'A')
   and (workglitem_subaccnttype_code IN ('FA', 'AD')))

 --------------------------------------------------------------------

 QUERY: TotalCurrentAssets
 select formatMoney(SUM(workglitem_cp_ending_trialbal) * -1.00) AS CYP,
        formatMoney(SUM(workglitem_pp_ending_trialbal) * -1.00) AS PYP,
        formatMoney((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) * -1.00) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal))
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'A')
   and (workglitem_subaccnttype_code IN ('CA', 'AR', 'IN', 'CAS')))
 --------------------------------------------------------------------

 QUERY: TotalOtherAssets
 select formatMoney(SUM(workglitem_cp_ending_trialbal) * -1.00) AS CYP,
        formatMoney(SUM(workglitem_pp_ending_trialbal) * -1.00) AS PYP,
        formatMoney((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) * -1.00) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal))
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'A')
   and ((workglitem_subaccnttype_code NOT IN ('CA', 'AR', 'IN', 'CAS', 'FA', 'AD'))
       or (workglitem_subaccnttype_code IS NULL)) )

 --------------------------------------------------------------------

 QUERY: OtherLiabilities
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cp_ending_trialbal) AS CYP,
        formatMoney(workglitem_pp_ending_trialbal) AS PYP,
        formatMoney(workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) AS period_diff,
        CASE WHEN workglitem_cp_ending_trialbal = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) / workglitem_cp_ending_trialbal)
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'L')
   and ((workglitem_subaccnttype_code NOT IN ('CL', 'AP', 'LTL'))
       or (workglitem_subaccnttype_code IS NULL)) )
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: TotalOtherLiabilities
 select formatMoney(SUM(workglitem_cp_ending_trialbal)) AS CYP,
        formatMoney(SUM(workglitem_pp_ending_trialbal)) AS PYP,
        formatMoney(SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal))
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'L')
   and ((workglitem_subaccnttype_code NOT IN ('CL', 'AP', 'LTL'))
       or (workglitem_subaccnttype_code IS NULL)) )
 --------------------------------------------------------------------

 QUERY: ShareHolderEquity
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cp_ending_trialbal) AS CYP,
        formatMoney(workglitem_pp_ending_trialbal) AS PYP,
        formatMoney(workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) AS period_diff,
        CASE WHEN workglitem_cp_ending_trialbal = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) / workglitem_cp_ending_trialbal)
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'Q')
   and (workglitem_subaccnttype_code = 'EDC'))
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: TSE
 select formatMoney(SUM(workglitem_cp_ending_trialbal)) AS CYP,
        formatMoney(SUM(workglitem_pp_ending_trialbal)) AS PYP,
        formatMoney(SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal))
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'Q')
   and (workglitem_subaccnttype_code = 'EDC'))
 --------------------------------------------------------------------

 QUERY: OtherEquity
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cp_ending_trialbal) AS CYP,
        formatMoney(workglitem_pp_ending_trialbal) AS PYP,
        formatMoney(workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) AS period_diff,
        CASE WHEN workglitem_cp_ending_trialbal = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workglitem_cp_ending_trialbal - workglitem_pp_ending_trialbal) / workglitem_cp_ending_trialbal)
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'Q')
   and ((workglitem_subaccnttype_code != 'EDC')
        OR (workglitem_subaccnttype_code IS NULL)))
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: TOE
 select formatMoney(SUM(workglitem_cp_ending_trialbal)) AS CYP,
        formatMoney(SUM(workglitem_pp_ending_trialbal)) AS PYP,
        formatMoney(SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) AS period_diff,
        CASE WHEN SUM(workglitem_cp_ending_trialbal) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cp_ending_trialbal) - SUM(workglitem_pp_ending_trialbal)) / SUM(workglitem_cp_ending_trialbal))
        END AS period_diff_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'Q')
   and ((workglitem_subaccnttype_code != 'EDC')
       or (workglitem_subaccnttype_code IS NULL)))
 --------------------------------------------------------------------

 QUERY: TE
 select formatMoney(workgltotaleq_cp_ending_total) AS CYP,
        formatMoney(workgltotaleq_pp_ending_total) AS PYP,
        formatMoney(workgltotaleq_cp_ending_total - workgltotaleq_pp_ending_total) AS period_diff,
        CASE WHEN workgltotaleq_cp_ending_total = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workgltotaleq_cp_ending_total - workgltotaleq_pp_ending_total) / workgltotaleq_cp_ending_total)
        END AS period_diff_percent
  from workgltotaleq, workglhead
 where ( (workgltotaleq_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER)) )
+  and (workglhead_username = CURRENT_USER) )
 --------------------------------------------------------------------

 QUERY: TLE
 select formatMoney(workgltotal_cp_ending_total) AS CYP,
        formatMoney(workgltotal_pp_ending_total) AS PYP,
        formatMoney(workgltotal_cp_ending_total - workgltotal_pp_ending_total) AS period_diff,
        CASE WHEN workgltotal_cp_ending_total = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workgltotal_cp_ending_total - workgltotal_pp_ending_total) / workgltotal_cp_ending_total)
        END AS period_diff_percent
  from workgltotal, workglhead
 where ( (workgltotal_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER)) )
+  and (workglhead_username = CURRENT_USER) )

 --------------------------------------------------------------------
 REPORT: BankrecHistory
-QUERY: detail
-SELECT gltrans_id, formatDate(gltrans_date) AS f_date,
-       gltrans_docnumber,
-       formatMoney(currtolocal(bankaccnt_curr_id,gltrans_amount,gltrans_date) * -1) AS f_amount
-  FROM gltrans, bankrecitem
-    JOIN bankrec ON (bankrecitem_bankrec_id=bankrec_id)
-    JOIN bankaccnt ON (bankaccnt_id=bankrec_bankaccnt_id)
- WHERE ((bankrecitem_bankrec_id=<? value("bankrec_id") ?>)
-   AND (bankrecitem_source='GL')
-   AND (bankrecitem_source_id=gltrans_id) )
- ORDER BY gltrans_date, gltrans_id;
---------------------------------------------------------------------
+QUERY: reconciled

 QUERY: head
 SELECT (bankaccnt_name || '-' || bankaccnt_descrip) AS f_bankaccnt,
        (formatDate(bankrec_opendate) || '-' || formatDate(bankrec_enddate)) AS f_bankrec,
        bankrec_username AS f_username, formatDate(bankrec_created) AS f_created,
        formatDate(bankrec_opendate) AS f_opendate,
        formatDate(bankrec_enddate) AS f_enddate,
        formatMoney(bankrec_openbal) AS f_openbal,
        formatMoney(bankrec_endbal) AS f_endbal,
        text('Opening Balance') AS f_opendescrip,
        text('Ending Balance') AS f_enddescrip
   FROM bankrec, bankaccnt
  WHERE ((bankrec_bankaccnt_id=bankaccnt_id)
    AND  (bankrec_id=<? value("bankrec_id") ?>));
 --------------------------------------------------------------------

+QUERY: Subtotal
+SELECT
+   formatMoney(COALESCE(MAX(selrec.bankrec_endbal) +
+   SUM(currtolocal(bankaccnt_curr_id,gltrans_amount,gltrans_date) * -1),0)) AS amount
+ FROM gltrans
+   JOIN bankaccnt ON (bankaccnt_accnt_id = gltrans_accnt_id)
+   JOIN bankrec selrec ON ((selrec.bankrec_bankaccnt_id = bankaccnt_id)
+                       AND (selrec.bankrec_id=<? value("bankrec_id") ?>))
+   LEFT OUTER JOIN bankrecitem ON ((bankrecitem_source='GL')
+                              AND (bankrecitem_source_id=gltrans_id))
+   LEFT OUTER JOIN bankrec actrec ON (actrec.bankrec_id = bankrecitem_bankrec_id)
+ WHERE ((COALESCE(actrec.bankrec_postdate,endoftime()) > COALESCE(selrec.bankrec_postdate,now()))
+ AND (gltrans_doctype='CK'))
+--------------------------------------------------------------------
+
+QUERY: ActualAmount
+SELECT
+   formatMoney(COALESCE(MAX(selrec.bankrec_endbal) +
+   SUM(currtolocal(bankaccnt_curr_id,gltrans_amount,gltrans_date) * -1),0)) AS amount
+ FROM gltrans
+   JOIN bankaccnt ON (bankaccnt_accnt_id = gltrans_accnt_id)
+   JOIN bankrec selrec ON ((selrec.bankrec_bankaccnt_id = bankaccnt_id)
+                       AND (selrec.bankrec_id=<? value("bankrec_id") ?>))
+   LEFT OUTER JOIN bankrecitem ON ((bankrecitem_source='GL')
+
+                              AND (bankrecitem_source_id=gltrans_id))
+   LEFT OUTER JOIN bankrec actrec ON (actrec.bankrec_id = bankrecitem_bankrec_id)
+ WHERE (COALESCE(actrec.bankrec_postdate,endoftime()) > COALESCE(selrec.bankrec_postdate,now()))
+--------------------------------------------------------------------
+
+QUERY: unreconciled

 --------------------------------------------------------------------
 REPORT: BriefEarnedCommissions
 QUERY: detail
-SELECT salesrep_id, salesrep_number, salesrep_name, cust_number, cust_name,
-       cohist_ordernumber, cohist_invcnumber, formatDate(cohist_invcdate) as f_invcdate,
-       formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) as f_extprice,
-       SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) as extprice,
-       formatMoney(SUM(round(cohist_commission,2))) as f_commission,
-       SUM(round(cohist_commission,2)) AS commission
-  FROM cohist, salesrep, cust
- WHERE ((cohist_cust_id=cust_id)
-   AND (cohist_salesrep_id=salesrep_id)
+SELECT cohist_salesrep_id, salesrep_number, salesrep_name, cust_number, cust_name,
+       cohist_ordernumber, cohist_invcnumber, formatDate(cohist_invcdate) AS f_invcdate, currAbbr,
+       formatMoney(SUM(baseextprice)) AS f_extprice,
+       formatMoney(SUM(basecommission)) AS f_commission,
+       SUM(baseextprice) AS extprice,
+       SUM(basecommission) AS commission
+<? if exists("includeMisc") ?>
+FROM saleshistorymisc
+<? else ?>
+FROM saleshistory
+<? endif ?>
+WHERE ( (cohist_commission <> 0)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-   AND (cohist_commission <> 0)
+
+<? if exists("includeMisc") ?>
+  AND (COALESCE(cohist_misc_type, '') <> 'T')
+  AND (COALESCE(cohist_misc_type, '') <> 'F')
+<? endif ?>
+
 <? if exists("salesrep_id") ?>
    AND (salesrep_id=<? value("salesrep_id") ?>)
 <? endif ?>
 )
-GROUP BY salesrep_id, salesrep_number, salesrep_name, cust_number, cust_name,
-         cohist_ordernumber, cohist_invcnumber, cohist_invcdate
+GROUP BY cohist_salesrep_id, salesrep_number, salesrep_name, cust_number, cust_name,
+         cohist_ordernumber, cohist_invcnumber, cohist_invcdate, currAbbr
 ORDER BY salesrep_number, cust_number, cohist_invcdate
+

 --------------------------------------------------------------------
 REPORT: CashReceipts
 QUERY: detail
-SELECT arapply_id,
-       1 AS type,
-       cust_number,
-       cust_name,
-       formatDate(arapply_postdate) AS f_postdate,
-       ( CASE WHEN (arapply_source_doctype='C') THEN text('C/M')
-              WHEN (arapply_fundstype='C') THEN text('Check')
-              WHEN (arapply_fundstype='T') THEN text('Certified Check')
-              WHEN (arapply_fundstype='M') THEN text('M/C')
-              WHEN (arapply_fundstype='V') THEN text('Visa')
-              WHEN (arapply_fundstype='A') THEN text('AmEx')
-              WHEN (arapply_fundstype='D') THEN text('Discover')
-              WHEN (arapply_fundstype='R') THEN text('Other C/C')
-              WHEN (arapply_fundstype='K') THEN text('C/R')
-              WHEN (arapply_fundstype='W') THEN text('Wire Trans.')
-              WHEN (arapply_fundstype='O') THEN text('Other')
-         END || ' ' ||
-         CASE WHEN (arapply_source_doctype='C') THEN TEXT(arapply_source_docnumber)
-              ELSE arapply_refnumber
-         END ) AS source,
-       ( CASE WHEN (arapply_target_doctype='D') THEN text('D/M')
-              WHEN (arapply_target_doctype='I') THEN text('Invoice')
-              ELSE text('Other')
-         END || ' ' || TEXT(arapply_target_docnumber) ) AS target,
-       formatMoney(arapply_applied) AS f_applied,
-       arapply_applied,
-       formatMoney(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)) AS f_base_applied,
-       currtobase(arapply_curr_id,arapply_applied,arapply_postdate) AS base_applied,
-       currConcat(arapply_curr_id) AS currAbbr,
-       arapply_postdate AS sortdate
-  FROM arapply, cust
- WHERE ( (arapply_cust_id=cust_id)
-   AND (arapply_postdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-   AND (arapply_source_doctype='K')
-
-<? if exists("cust_id") ?>
-   AND (cust_id=<? value("cust_id") ?>)
-<? elseif exists("custtype_id") ?>
-   AND (cust_custtype_id=<? value("custtype_id") ?>)
-<? elseif exists("custtype_pattern") ?>
-   AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
-<? endif ?>
- )
-
- UNION SELECT cashrcpt_id,
-       2 AS type,
-       cust_number,
-       cust_name,
-       formatDate(cashrcpt_distdate) AS f_postdate,
-       ( CASE WHEN (cashrcpt_fundstype='C') THEN text('Check')
-              WHEN (cashrcpt_fundstype='T') THEN text('Certified Check')
-              WHEN (cashrcpt_fundstype='M') THEN text('M/C')
-              WHEN (cashrcpt_fundstype='V') THEN text('Visa')
-              WHEN (cashrcpt_fundstype='A') THEN text('AmEx')
-              WHEN (cashrcpt_fundstype='D') THEN text('Discover')
-              WHEN (cashrcpt_fundstype='R') THEN text('Other C/C')
-              WHEN (cashrcpt_fundstype='K') THEN text('C/R')
-              WHEN (cashrcpt_fundstype='W') THEN text('Wire Trans.')
-              WHEN (cashrcpt_fundstype='O') THEN text('Other')
-         END || ' ' || cashrcpt_docnumber ) AS source,
-       text('') AS target,
-       formatMoney(cashrcpt_amount) AS f_applied,
-       cashrcpt_amount,
-       formatMoney(currtobase(cashrcpt_curr_id,cashrcpt_amount,cashrcpt_distdate)) AS f_base_applied,
-       currtobase(cashrcpt_curr_id,cashrcpt_amount,cashrcpt_distdate) AS base_applied,
-       currConcat(cashrcpt_curr_id) AS currAbbr,
-       cashrcpt_distdate AS sortdate
-  FROM cashrcpt, cust
- WHERE ( (cashrcpt_cust_id=cust_id)
-   AND (cashrcpt_distdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-
-<? if exists("cust_id") ?>
-   AND (cust_id=<? value("cust_id") ?>)
-<? elseif exists("custtype_id") ?>
-   AND (cust_custtype_id=<? value("custtype_id") ?>)
-<? elseif exists("custtype_pattern") ?>
-   AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
-<? endif ?>
- )
-
- UNION SELECT aropen_id,
-       3 AS type,
-       cust_number,
-       cust_name,
-       formatDate(aropen_docdate) AS f_postdate,
-       ( CASE WHEN (substr(aropen_notes, 16, 1)='C') THEN text('Check')
-              WHEN (substr(aropen_notes, 16, 1)='T') THEN text('Certified Check')
-              WHEN (substr(aropen_notes, 16, 1)='M') THEN text('M/C')
-              WHEN (substr(aropen_notes, 16, 1)='V') THEN text('Visa')
-              WHEN (substr(aropen_notes, 16, 1)='A') THEN text('AmEx')
-              WHEN (substr(aropen_notes, 16, 1)='D') THEN text('Discover')
-              WHEN (substr(aropen_notes, 16, 1)='R') THEN text('Other C/C')
-              WHEN (substr(aropen_notes, 16, 1)='K') THEN text('C/R')
-              WHEN (substr(aropen_notes, 16, 1)='W') THEN text('Wire Trans.')
-              WHEN (substr(aropen_notes, 16, 1)='O') THEN text('Other')
-         END || ' ' ||
-         substr(aropen_notes, 18)) AS source,
-       TEXT('Unapplied') AS target,
-       formatMoney(aropen_amount) AS f_applied,
-       aropen_amount,
-       formatMoney(currtobase(aropen_curr_id,aropen_amount,aropen_docdate)) AS f_base_applied,
-       currtobase(aropen_curr_id,aropen_amount,aropen_docdate) AS base_applied,
-       currConcat(aropen_curr_id) AS currAbbr,
-       aropen_docdate AS sortdate
-  FROM aropen, cust
- WHERE ( (aropen_cust_id=cust_id)
-   AND (aropen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-   AND (aropen_doctype='R')
-
-<? if exists("cust_id") ?>
-   AND (cust_id=<? value("cust_id") ?>)
-<? elseif exists("custtype_id") ?>
-   AND (cust_custtype_id=<? value("custtype_id") ?>)
-<? elseif exists("custtype_pattern") ?>
-   AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
-<? endif ?>
- )
-
-ORDER BY sortdate, source;

 --------------------------------------------------------------------
 REPORT: CashReceiptsEditList
 QUERY: detail
 SELECT cashrcpt_id, 1 AS orderBy,
        cust_number, cust_name,
        formatDate(cashrcpt_distdate) AS f_distdate,
        CASE WHEN (cashrcpt_fundstype = 'C') THEN 'Check'
             WHEN (cashrcpt_fundstype = 'T') THEN 'Certified Check'
             WHEN (cashrcpt_fundstype = 'M') THEN 'Master Card'
             WHEN (cashrcpt_fundstype = 'V') THEN 'Visa'
             WHEN (cashrcpt_fundstype = 'A') THEN 'American Express'
             WHEN (cashrcpt_fundstype = 'D') THEN 'Discover Card'
             WHEN (cashrcpt_fundstype = 'R') THEN 'Other Credit Card'
             WHEN (cashrcpt_fundstype = 'K') THEN 'Cash'
             WHEN (cashrcpt_fundstype = 'W') THEN 'Wire Transfer'
             ELSE 'Other'
        END AS f_fundstype,
        'C/R' AS doctype,
        cashrcpt_docnumber AS docnumber,
        cashrcpt_amount AS amount,
        formatMoney(cashrcpt_amount) AS f_amount,
        0 AS detailedamount,
        formatMoney(0) AS f_detailedamount,
        bankaccnt_name
 FROM cashrcpt, bankaccnt, cust
 WHERE ( (cashrcpt_bankaccnt_id=bankaccnt_id)
- AND (cashrcpt_cust_id=cust_id) )
+  AND   (cashrcpt_cust_id=cust_id)
+  AND   (NOT cashrcpt_posted) )

 UNION
 SELECT cashrcpt_id, 2 AS orderBy,
        '' AS cust_number, '' AS cust_name,
        '' AS f_distdate,
        '' AS f_fundstype,
        aropen_doctype AS doctype,
        aropen_docnumber AS docnumber,
        0 AS amount,
        formatMoney(0) AS f_amount,
        cashrcptitem_amount AS detailedamount,
        formatMoney(cashrcptitem_amount) AS f_detailedamount,
        '' AS bankaccnt_name
 FROM cashrcptitem, cashrcpt, aropen
 WHERE ( (cashrcptitem_cashrcpt_id=cashrcpt_id)
- AND (cashrcptitem_aropen_id=aropen_id) )
+  AND   (cashrcptitem_aropen_id=aropen_id)
+  AND   (NOT cashrcpt_posted) )

 UNION
 SELECT cashrcpt_id, 3 AS orderBy,
        '' AS cust_number, '' AS cust_name,
        '' AS f_distdate,
        '' AS f_fundstype,
        'Misc.' AS doctype,
        (formatGLAccount(accnt_id) || '-' || accnt_descrip) AS docnumber,
        0 AS amount,
        formatMoney(0) AS f_amount,
        cashrcptmisc_amount AS detailedamount,
        formatMoney(cashrcptmisc_amount) AS f_detailedamount,
        '' AS bankaccnt_name
 FROM cashrcptmisc, cashrcpt, accnt
 WHERE ( (cashrcptmisc_cashrcpt_id=cashrcpt_id)
- AND (cashrcptmisc_accnt_id=accnt_id) )
+  AND   (cashrcptmisc_accnt_id=accnt_id)
+  AND   (NOT cashrcpt_posted) )

 ORDER BY cashrcpt_id, orderBy;

 --------------------------------------------------------------------
 REPORT: ContactsMasterList
 QUERY: detail
-SELECT cntct_first_name,
-       cntct_last_name,
-       crmacct_number,
-       crmacct_name,
-       cntct_phone,
-       cntct_phone2,
-       cntct_fax,
-       cntct_email,
-       cntct_webaddr
-  FROM cntct LEFT OUTER JOIN crmacct ON (cntct_crmacct_id=crmacct_id)
-<? if exists("activeOnly") ?>
- WHERE cntct_active
-<? endif ?>
-ORDER BY cntct_last_name, cntct_first_name, crmacct_number;

 --------------------------------------------------------------------
 REPORT: CountSlipEditList
 QUERY: detail
-SELECT getUsername(cntslip_user_id) AS f_username,
+SELECT cntslip_username AS f_username,
        cntslip_number,
        formatBoolYN(cntslip_posted) AS f_posted,
        formatDateTime(cntslip_entered) AS f_entered,
        formatQty(cntslip_qty) AS f_qty
   FROM cntslip
  WHERE (cntslip_cnttag_id=<? value("cnttag_id") ?>)
 ORDER BY cntslip_number;

 --------------------------------------------------------------------
 REPORT: CountSlipsByWarehouse
 QUERY: detail
 SELECT invcnt_tagnumber AS tagnum,
        <? if exists("asNumeric") ?>
          int4(cntslip_number)
        <? else ?>
          cntslip_number
        <? endif ?>
        AS slipnum,
        warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        formatDate(cntslip_entered) AS date_entered,
-       ('( ' || getUsername(cntslip_user_id) || ' )') AS enteredby,
+       ('( ' || cntslip_username || ' )') AS enteredby,
        formatQty(cntslip_qty) AS f_qtycounted,
        formatBoolYN(cntslip_posted) AS f_posted
   FROM cntslip, invcnt, itemsite, item, warehous
  WHERE ((cntslip_cnttag_id=invcnt_id)
    AND (invcnt_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (cntslip_entered BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if not exists("showUnposted") ?>
    AND (cntslip_posted)
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY slipnum;

 --------------------------------------------------------------------
 REPORT: CountTagsByClassCode
 QUERY: detail
 SELECT invcnt_id, invcnt_tagnumber, warehous_code,
        item_number, item_descrip1, item_descrip2,
        formatDate(invcnt_tagdate) AS createddate,
-       getUsername(invcnt_tag_usr_id) AS createdby,
+       invcnt_tag_username AS createdby,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
             ELSE formatDate(invcnt_cntdate)
        END AS entereddate,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
-            ELSE getUsername(invcnt_cnt_usr_id)
+            ELSE invcnt_cnt_username
        END AS enteredby,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatDate(invcnt_postdate)
        END AS posteddate,
        CASE WHEN (NOT invcnt_posted) THEN ''
-            ELSE getUsername(invcnt_post_usr_id)
+            ELSE invcnt_post_username
        END AS postedby,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatQty(invcnt_qoh_before)
        END AS qohbefore,
        CASE WHEN (invcnt_qoh_after IS NULL) THEN ''
             ELSE formatQty(invcnt_qoh_after)
        END AS qohafter,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatQty(invcnt_qoh_after - invcnt_qoh_before)
        END AS variance,
        CASE WHEN (NOT invcnt_posted) THEN ''
             WHEN (invcnt_qoh_before=0) THEN formatScrap(1)
             ELSE formatScrap((1 - (invcnt_qoh_after / invcnt_qoh_before)) * -1)
        END AS percentage
   FROM invcnt, itemsite, item, warehous
  WHERE ((invcnt_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (date(invcnt_tagdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if not exists("showUnposted") ?>
    AND (invcnt_posted)
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("classcode_id") ?>
    AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (item_classcode_id IN (SELECT classcode_id
                                 FROM classcode
                                WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? endif ?>
 )
 ORDER BY invcnt_tagdate;

 --------------------------------------------------------------------
 REPORT: CountTagsByItem
 QUERY: detail
 SELECT invcnt_tagnumber, warehous_code,
        formatDate(invcnt_tagdate) AS createddate,
-       getUsername(invcnt_tag_usr_id) AS createdby,
+       invcnt_tag_username AS createdby,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
             ELSE formatDate(invcnt_cntdate)
        END AS entereddate,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
-            ELSE getUsername(invcnt_cnt_usr_id)
+            ELSE invcnt_cnt_username
        END AS enteredby,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatDate(invcnt_postdate)
        END AS posteddate,
        CASE WHEN (NOT invcnt_posted) THEN ''
-            ELSE getUsername(invcnt_post_usr_id)
+            ELSE invcnt_post_username
        END AS postedby,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatQty(invcnt_qoh_before)
        END AS qohbefore,
        CASE WHEN (invcnt_qoh_after IS NULL) THEN ''
             ELSE formatQty(invcnt_qoh_after)
        END AS qohafter,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatQty(invcnt_qoh_after - invcnt_qoh_before)
        END AS variance,
        CASE WHEN (NOT invcnt_posted) THEN ''
             WHEN (invcnt_qoh_before=0) THEN formatScrap(1)
             ELSE formatScrap((1 - (invcnt_qoh_after / invcnt_qoh_before)) * -1)
        END AS percentage
   FROM invcnt, itemsite, warehous
  WHERE ((invcnt_itemsite_id=itemsite_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
    AND (invcnt_tagdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if not exists("showUnposted") ?>
    AND (invcnt_posted)
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY invcnt_tagdate;

 --------------------------------------------------------------------
 REPORT: CountTagsByWarehouse
 QUERY: detail
 SELECT invcnt_id,
        formatcounttagbarcode(invcnt_id) AS countag_barcode,
        invcnt_tagnumber,
        warehous_code,
        item_number, item_descrip1, item_descrip2,
        formatDate(invcnt_tagdate) AS createddate,
-       getUsername(invcnt_tag_usr_id) AS createdby,
+       invcnt_tag_username AS createdby,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
             ELSE formatDate(invcnt_cntdate)
        END AS entereddate,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
-            ELSE getUsername(invcnt_cnt_usr_id)
+            ELSE invcnt_cnt_username
        END AS enteredby,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatDate(invcnt_postdate)
        END AS posteddate,
        CASE WHEN (NOT invcnt_posted) THEN ''
-            ELSE getUsername(invcnt_post_usr_id)
+            ELSE invcnt_post_username
        END AS postedby,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatQty(invcnt_qoh_before)
        END AS qohbefore,
        CASE WHEN (invcnt_qoh_after IS NULL) THEN ''
             ELSE formatQty(invcnt_qoh_after)
        END AS qohafter,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatQty(invcnt_qoh_after - invcnt_qoh_before)
        END AS variance,
        CASE WHEN (NOT invcnt_posted) THEN ''
             WHEN ((invcnt_qoh_before = 0) AND (invcnt_qoh_after = 0)) THEN formatScrap(0)
             WHEN (invcnt_qoh_before=0) THEN formatScrap(1)
             ELSE formatScrap((1 - (invcnt_qoh_after / invcnt_qoh_before)) * -1)
        END AS percentage
   FROM invcnt, itemsite, item, warehous
  WHERE ((invcnt_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (DATE(invcnt_tagdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if not exists("showUnposted") ?>
    AND (invcnt_posted)
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY invcnt_tagdate;

 --------------------------------------------------------------------
 REPORT: DepositsRegister
 QUERY: detail
 SELECT gltrans_id,
        gltrans_journalnumber,
        formatDate(gltrans_date) AS transdate,
        gltrans_source,
        gltrans_doctype,
        gltrans_docnumber,
        firstLine(gltrans_notes) AS transnotes,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
        gltrans_username,
        formatBoolYN(gltrans_posted) AS f_posted,
 -- Debits:
        CASE WHEN (gltrans_amount < 0) THEN formatMoney(ABS(gltrans_amount))
             ELSE ''
        END AS f_debit,
        CASE WHEN (gltrans_amount < 0) THEN ABS(gltrans_amount)
             ELSE 0
        END AS debit_amt,
 --Credits:
        CASE WHEN (gltrans_amount > 0) THEN formatMoney(gltrans_amount)
             ELSE ''
        END AS f_credit,
        CASE WHEN (gltrans_amount > 0) THEN gltrans_amount
             ELSE 0
        END AS credit_amt,
 --Balance:
        gltrans_amount * -1 as balance_amt,
 --AROPEN Amount
-       formatMoney(currtobase(aropen_curr_id,(aropen_amount - aropen_paid),aropen_docdate)) AS f_aropen_bal
+       formatMoney(currtobase(aropen_curr_id,(aropen_amount - aropen_paid),aropen_docdate)) AS f_aropen_bal,
+       currtobase(aropen_curr_id,(aropen_amount - aropen_paid),aropen_docdate) AS aropen_bal

     FROM gltrans LEFT OUTER JOIN aropen ON ((text(gltrans_docnumber) = 'I-' || text(aropen_docnumber))
                                         AND (aropen_doctype='I')), accnt

  WHERE ((gltrans_accnt_id=accnt_id)
    AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (gltrans_doctype = 'CR'))
 ORDER BY gltrans_created DESC, gltrans_sequence, gltrans_amount;

 --------------------------------------------------------------------
 REPORT: EarnedCommissions
 QUERY: detail
-SELECT salesrep_name, cohist_ordernumber,
-       cust_number, cohist_shiptoname,
-       formatDate(cohist_invcdate) AS f_invcdate,
-       item_number, formatQty(cohist_qtyshipped) AS f_qty,
-       formatMoney(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS f_extprice,
-       round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2) as extprice,
-       formatMoney(cohist_commission) AS f_prcnt,
-       round(cohist_commission,2) as prcnt,
-       formatBoolYN(cohist_commissionpaid) AS f_earned
-  FROM cohist, salesrep, cust, itemsite, item
- WHERE ( (cohist_cust_id=cust_id)
-   AND (cohist_salesrep_id=salesrep_id)
-   AND (cohist_itemsite_id=itemsite_id)
-   AND (itemsite_item_id=item_id)
-   AND (cohist_commission <> 0)
-   AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("salesrep_id") ?>
-   AND (salesrep_id=<? value("salesrep_id") ?>)
-<? endif ?>
-)
-ORDER BY salesrep_name, cohist_invcdate;

 --------------------------------------------------------------------
 REPORT: ExpenseCategoriesMasterList
 QUERY: detail
-SELECT expcat_id,
+SELECT
        expcat_code,
-       expcat_descrip
-  FROM expcat
+  expcat_descrip,
+          (SELECT
+                 accnt.accnt_company || '-' ||
+                 accnt.accnt_profit|| '-' ||
+                 accnt.accnt_number|| '-' ||
+                 accnt.accnt_sub || '   ' ||
+                 accnt_descrip
+           FROM
+                 public.expcat,
+                 public.accnt
+           WHERE
+                 expcat.expcat_exp_accnt_id = accnt.accnt_id AND
+                 A.expcat_id = expcat_id
+           ) AS exp_accnt,
+
+  (SELECT
+                 accnt.accnt_company || '-' ||
+                 accnt.accnt_profit|| '-' ||
+                 accnt.accnt_number|| '-' ||
+                 accnt.accnt_sub || '   ' ||
+                 accnt_descrip
+           FROM
+                 public.expcat,
+                 public.accnt
+           WHERE
+                 expcat.expcat_purchprice_accnt_id = accnt.accnt_id AND
+                 A.expcat_id = expcat_id
+           ) AS ppv_accnt,
+
+  (SELECT
+                 accnt.accnt_company || '-' ||
+                 accnt.accnt_profit|| '-' ||
+                 accnt.accnt_number|| '-' ||
+                 accnt.accnt_sub || '   ' ||
+                 accnt_descrip
+           FROM
+                 public.expcat,
+                 public.accnt
+           WHERE
+                 expcat.expcat_liability_accnt_id = accnt.accnt_id AND
+                 A.expcat_id = expcat_id
+           ) AS poliab_accnt,
+
+  (SELECT
+                 accnt.accnt_company || '-' ||
+                 accnt.accnt_profit|| '-' ||
+                 accnt.accnt_number|| '-' ||
+                 accnt.accnt_sub || '   ' ||
+                 accnt_descrip
+           FROM
+                 public.expcat,
+                 public.accnt
+           WHERE
+                 expcat.expcat_freight_accnt_id = accnt.accnt_id AND
+                 A.expcat_id = expcat_id
+           ) AS polinefrgt_accnt
+
+FROM
+  expcat AS A
 ORDER BY expcat_code;
+

 --------------------------------------------------------------------
 REPORT: FinancialReport
 QUERY: detail
 SELECT financialReport(<? value("flhead_id") ?>, period_id,<? value("interval") ?>)
   FROM period
  WHERE (period_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                      ));
 SELECT period_id, period_start, formatperiodname(period_id,<? value("interval") ?>) AS f_period, flrpt_order,
        ( repeat('   ', flrpt_level) || flgrp_name ) AS name,
        CASE WHEN(flgrp_summarize AND flgrp_showstart) THEN formatMoney(flrpt_beginning)
             ELSE NULL
        END AS beginning,
        CASE WHEN(flgrp_summarize AND flgrp_showdelta) THEN formatMoney(flrpt_debits)
             ELSE NULL
        END AS debits,
        CASE WHEN(flgrp_summarize AND flgrp_showdelta) THEN formatMoney(flrpt_credits)
             ELSE NULL
        END AS credits,
        CASE WHEN(flgrp_summarize AND flgrp_showend) THEN formatMoney(flrpt_ending)
             ELSE NULL
        END AS ending,
        CASE WHEN(flgrp_summarize AND flgrp_showbudget) THEN formatMoney(flrpt_budget)
             ELSE NULL
        END AS budget,
        CASE WHEN(flgrp_summarize AND flgrp_showdiff) THEN formatMoney(flrpt_diff)
             ELSE NULL
        END AS diff,
        CASE WHEN(flgrp_summarize AND flgrp_showcustom) THEN formatMoney(flrpt_custom)
             ELSE NULL
        END AS custom,
        CASE WHEN(flgrp_summarize AND flgrp_showstartprcnt) THEN formatPrcnt(flrpt_beginningprcnt)
             ELSE NULL
        END AS beginningprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showdeltaprcnt) THEN formatPrcnt(flrpt_debitsprcnt)
             ELSE NULL
        END AS debitsprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showdeltaprcnt) THEN formatPrcnt(flrpt_creditsprcnt)
             ELSE NULL
        END AS creditsprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showendprcnt) THEN formatPrcnt(flrpt_endingprcnt)
             ELSE NULL
        END AS endingprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showbudgetprcnt) THEN formatPrcnt(flrpt_budgetprcnt)
             ELSE NULL
        END AS budgetprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showdiffprcnt) THEN formatPrcnt(flrpt_diffprcnt)
             ELSE NULL
        END AS diffprcnt,
        CASE WHEN(flgrp_summarize AND flgrp_showcustomprcnt) THEN formatPrcnt(flrpt_customprcnt)
             ELSE NULL
        END AS customprcnt
   FROM flrpt, flgrp, period
  WHERE ((flrpt_type='G')
    AND  (flrpt_type_id=flgrp_id)
    AND  (flrpt_flhead_id=<? value("flhead_id") ?>)
    AND  (flrpt_period_id=period_id)
    AND  (flrpt_username=CURRENT_USER)
    AND  (flrpt_interval=<? value("interval") ?>)
    AND  (period_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                      )))
 UNION
 SELECT period_id, period_start, formatperiodname(period_id,<? value("interval") ?>) AS f_period, flrpt_order,
        ( repeat('   ', flrpt_level) ||
          CASE WHEN(accnt_id IS NULL) THEN ('Unknown Account ID ' || flitem_accnt_id)
               ELSE (formatGLAccount(accnt_id) || '-' || accnt_descrip)
          END
        ) AS name,
        formatMoney(flrpt_beginning) AS beginning,
        formatMoney(flrpt_debits) AS debits,
        formatMoney(flrpt_credits) AS credits,
        formatMoney(flrpt_ending) AS ending,
        formatMoney(flrpt_budget) AS budget,
        formatMoney(flrpt_diff) AS diff,
        formatMoney(flrpt_custom) AS custom,
        formatPrcnt(flrpt_beginningprcnt) AS beginningprcnt,
        formatPrcnt(flrpt_debitsprcnt) AS debitsprcnt,
        formatPrcnt(flrpt_creditsprcnt) AS creditsprcnt,
        formatPrcnt(flrpt_endingprcnt) AS endingprcnt,
        formatPrcnt(flrpt_budgetprcnt) AS budgetprcnt,
        formatPrcnt(flrpt_diffprcnt) AS diffprcnt,
        formatPrcnt(flrpt_customprcnt) AS customprcnt
   FROM flrpt LEFT OUTER JOIN accnt ON (flrpt_accnt_id=accnt_id), flitem, period
  WHERE ((flrpt_type='I')
    AND  (flrpt_type_id=flitem_id)
    AND  (flrpt_flhead_id=<? value("flhead_id") ?>)
    AND  (flrpt_period_id=period_id)
    AND  (flrpt_username=CURRENT_USER)
    AND  (flrpt_interval=<? value("interval") ?>)
 <? if not exists("showzeros") ?>
-   AND ((flrpt_beginning <> formatMoney(0))
-    OR (flrpt_debits <> formatMoney(0))
-    OR (flrpt_credits <> formatMoney(0))
-    OR (flrpt_ending <> formatMoney(0))
-    OR (flrpt_budget <> formatMoney(0))
-    OR (flrpt_diff <> formatMoney(0))
-    OR (flrpt_custom <> formatMoney(0)))
+   AND ((flrpt_beginning <> 0)
+    OR (flrpt_debits <> 0)
+    OR (flrpt_credits <> 0)
+    OR (flrpt_ending <> 0)
+    OR (flrpt_budget <> 0)
+    OR (flrpt_diff <> 0)
+    OR (flrpt_custom <> 0))
 <? endif ?>
    AND  (period_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                      )))
 UNION
 SELECT period_id, period_start, formatperiodname(period_id,<? value("interval") ?>) AS f_period, flrpt_order,
        ( repeat('   ', flrpt_level) || flspec_name ) AS name,
        formatMoney(flrpt_beginning) AS beginning,
        formatMoney(flrpt_debits) AS debits,
        formatMoney(flrpt_credits) AS credits,
        formatMoney(flrpt_ending) AS ending,
        formatMoney(flrpt_budget) AS budget,
        formatMoney(flrpt_diff) AS diff,
        formatMoney(flrpt_custom) AS custom,
        formatPrcnt(flrpt_beginningprcnt) AS beginningprcnt,
        formatPrcnt(flrpt_debitsprcnt) AS debitsprcnt,
        formatPrcnt(flrpt_creditsprcnt) AS creditsprcnt,
        formatPrcnt(flrpt_endingprcnt) AS endingprcnt,
        formatPrcnt(flrpt_budgetprcnt) AS budgetprcnt,
        formatPrcnt(flrpt_diffprcnt) AS diffprcnt,
        formatPrcnt(flrpt_customprcnt) AS customprcnt
   FROM flrpt, flspec, period
  WHERE ((flrpt_type='S')
    AND  (flrpt_type_id=flspec_id)
    AND  (flrpt_flhead_id=<? value("flhead_id") ?>)
    AND  (flrpt_period_id=period_id)
    AND  (flrpt_username=CURRENT_USER)
    AND  (flrpt_interval=<? value("interval") ?>)
    AND  (period_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                      )))
 UNION
 SELECT period_id, period_start, formatperiodname(period_id,<? value("interval") ?>) AS f_period, flrpt_order,
        ( repeat('   ', flrpt_level) ||
          CASE WHEN(flrpt_type='T' AND flrpt_level=0) THEN COALESCE(flrpt_altname,'Total')
               WHEN(flrpt_type='T') THEN COALESCE(flrpt_altname,'Subtotal')
               ELSE ('Type ' || flrpt_type || ' ' || text(flrpt_type_id))
          END
        ) AS name,
        formatMoney(flrpt_beginning) AS beginning,
        formatMoney(flrpt_debits) AS debits,
        formatMoney(flrpt_credits) AS credits,
        formatMoney(flrpt_ending) AS ending,
        formatMoney(flrpt_budget) AS budget,
        formatMoney(flrpt_diff) AS diff,
        formatMoney(flrpt_custom) AS custom,
        formatPrcnt(flrpt_beginningprcnt) AS beginningprcnt,
        formatPrcnt(flrpt_debitsprcnt) AS debitsprcnt,
        formatPrcnt(flrpt_creditsprcnt) AS creditsprcnt,
        formatPrcnt(flrpt_endingprcnt) AS endingprcnt,
        formatPrcnt(flrpt_budgetprcnt) AS budgetprcnt,
        formatPrcnt(flrpt_diffprcnt) AS diffprcnt,
        formatPrcnt(flrpt_customprcnt) AS customprcnt
   FROM flrpt, period
  WHERE ((NOT (flrpt_type IN ('G','I','S')))
    AND  (flrpt_flhead_id=<? value("flhead_id") ?>)
    AND  (flrpt_period_id=period_id)
    AND  (flrpt_username=CURRENT_USER)
    AND  (flrpt_interval=<? value("interval") ?>)
    AND  (period_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                      )))
  ORDER BY period_start, flrpt_order;

 --------------------------------------------------------------------
 REPORT: FreightAccountAssignmentsMasterList
 QUERY: detail
 SELECT CASE WHEN araccnt_custtype_id=-1 THEN araccnt_custtype
             ELSE (SELECT custtype_code FROM custtype WHERE (custtype_id=araccnt_custtype_id))
        END AS custtypecode,
-       formatGLAccount(araccnt_ar_accnt_id) AS f_ar_accnt,
-       formatGLAccount(araccnt_freight_accnt_id) as f_freight_accnt
+       formatGLAccount(araccnt_ar_accnt_id) AS f_araccnt,
+       formatGLAccount(araccnt_freight_accnt_id) as f_freightaccnt,
+       formatGLAccount(araccnt_prepaid_accnt_id) AS f_prepaidaccnt,
+       formatGLAccount(araccnt_deferred_accnt_id) AS f_deferredaccnt
 FROM araccnt
 ORDER BY custtypecode;

 --------------------------------------------------------------------
 REPORT: FrozenItemSites
 QUERY: detail
 SELECT warehous_code,
        formatBoolYN(itemsite_active) AS active,
        item_number,
        item_descrip1,
        item_descrip2,
-       formatBoolYN(itemsite_supply) AS supplied,
+       formatBoolYN(itemsite_wosupply) AS supplied,
        formatBoolYN(itemsite_sold) AS sold,
        itemsite_soldranking,
        formatBoolYN(itemsite_stocked) AS stocked,
        formatBoolYN(itemsite_createpr) AS createpr,
        CASE WHEN (itemsite_controlmethod='N') THEN 'None'
             WHEN (itemsite_controlmethod='R') THEN 'Regular'
             WHEN (itemsite_controlmethod='L') THEN 'Lot #'
             WHEN (itemsite_controlmethod='S') THEN 'Serial #'
             ELSE '?'
        END AS controlmethod,
        formatBoolYN(itemsite_loccntrl) AS locationcontrol,
        CASE WHEN (itemsite_location_id=-1) THEN 'None'
             ELSE formatLocationName(itemsite_location_id)
        END AS defaultlocation,
        formatBoolYN(itemsite_useparams) AS enforceparams,
        formatBoolYN(itemsite_useparamsmanual) AS onmanualorders,
        formatQty(itemsite_reorderlevel) AS reorderlevel,
        formatQty(itemsite_ordertoqty) AS orderupto,
        formatQty(itemsite_multordqty) AS ordermult,
        formatQty(itemsite_safetystock) AS safetystock,
        itemsite_abcclass,
        itemsite_cyclecountfreq,
        itemsite_leadtime,
        itemsite_eventfence,
        formatQty(itemsite_qtyonhand) AS qoh,
        formatDate(itemsite_datelastused, 'Never') AS lastused,
        formatDate(itemsite_datelastcount, 'Never') AS lastcounted,
        COALESCE((SELECT invcnt_tagnumber
                    FROM invcnt
                   WHERE ((NOT invcnt_posted)
                     AND (invcnt_itemsite_id=itemsite_id))), '') AS counttagnum
 FROM itemsite, warehous, item
 WHERE ((itemsite_item_id=item_id)
  AND (itemsite_warehous_id=warehous_id)
  AND (itemsite_freeze)
 <? if exists("warehous_id") ?>
  AND (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY item_number;

 --------------------------------------------------------------------
-REPORT: ItemImage
+REPORT: Image
 QUERY: head
 SELECT image_name,
        image_descrip,
        image_data
   FROM image
  WHERE (image_id=<? value("image_id") ?>);

 --------------------------------------------------------------------
 REPORT: IncidentWorkbenchList
 QUERY: detail
-SELECT incdt_id,
-       incdt_number,
-       crmacct_name,
-       CASE WHEN(incdt_status='N') THEN <? value("new") ?>
-            WHEN(incdt_status='F') THEN <? value("feedback") ?>
-            WHEN(incdt_status='C') THEN <? value("confirmed") ?>
-            WHEN(incdt_status='A') THEN <? value("assigned") ?>
-            WHEN(incdt_status='R') THEN <? value("resolved") ?>
-            WHEN(incdt_status='L') THEN <? value("closed") ?>
-            ELSE incdt_status
-       END AS incdt_status,
-       incdt_assigned_username,
-       incdt_summary,
-       incdt_descrip,
-       DATE(incdt_timestamp) AS incdt_timestamp,
-       incdtseverity_name,
-       incdtpriority_name
-  FROM (crmacct JOIN incdt ON (crmacct_id=incdt_crmacct_id)
-        LEFT OUTER JOIN incdtseverity ON (incdt_incdtseverity_id = incdtseverity_id))
-        LEFT OUTER JOIN incdtpriority ON (incdt_incdtpriority_id = incdtpriority_id)
- WHERE (true
- <? if exists("usr_id") ?>
- AND (incdt_assigned_username IN (SELECT usr_username FROM usr
-                     WHERE usr_id = <? value("usr_id") ?>))
- <? elseif exists("usr_pattern") ?>
- AND (incdt_assigned_username ~* <? value("usr_pattern") ?>)
- <? endif ?>
- AND (incdt_status IN (''
-   <? if exists("isnew") ?>,           'N' <? endif ?>
-   <? if exists("isfeedback") ?>,      'F' <? endif ?>
-   <? if exists("isconfirmed") ?>,     'C' <? endif ?>
-   <? if exists("isassigned") ?>,      'A' <? endif ?>
-   <? if exists("isresolved") ?>,      'R' <? endif ?>
-   <? if exists("isclosed") ?>,        'L' <? endif ?>
- ))
- <? if exists("pattern") ?>
- AND ((incdt_summary ~* <? value("pattern") ?>)
-  OR  (incdt_descrip ~* <? value("pattern") ?>)
-  OR  (incdt_id IN (SELECT comment_source_id
-            FROM comment
-            WHERE ((comment_source='INCDT') AND (comment_text ~* <? value("pattern") ?>)))))
- <? endif ?>
- AND (incdt_timestamp BETWEEN <? value("startDate") ?>
-                          AND <? value("endDate") ?>)
-) ORDER BY incdt_number;
-
---------------------------------------------------------------------

 QUERY: username
 SELECT
-  <? if exists("usr_id") ?>
-    usr_username AS usr
-    FROM usr
-    WHERE (usr_id=<? value("usr_id") ?>)
+  <? if exists("username") ?>
+    <? value("username") ?> AS usr
   <? elseif exists("usr_pattern") ?>
-    <? value("usr_pattern") ?>
+    <? value("usr_pattern") ?> AS usr
   <? else ?>
     'ALL' AS usr
   <? endif ?>
 ;

 --------------------------------------------------------------------
 REPORT: IncidentsByCRMAccount
 QUERY: detail
 SELECT crmacct_id, COALESCE(TEXT(incdt_id), '') AS incdt_id, todoitem_id,
        crmacct_number, crmacct_name,
        incdt_number, DATE(incdt_timestamp) AS incdt_timestamp,
        CASE WHEN(incdt_status='N') THEN <? value("new") ?>
             WHEN(incdt_status='F') THEN <? value("feedback") ?>
             WHEN(incdt_status='C') THEN <? value("confirmed") ?>
             WHEN(incdt_status='A') THEN <? value("assigned") ?>
             WHEN(incdt_status='R') THEN <? value("resolved") ?>
             WHEN(incdt_status='L') THEN <? value("closed") ?>
             ELSE incdt_status
        END AS incdt_status,
        incdt_assigned_username, incdt_summary,
        todoitem_due_date, todoitem_name,
-       COALESCE(usr_username, '') AS todoitem_usrname,
+       todoitem_username AS todoitem_usrname,
        todoitem_assigned_date, todoitem_status,
        incdtseverity_name,
        incdtpriority_name
 FROM crmacct
 <? if exists("showAcctsWOIncdts") ?>
   LEFT OUTER
 <? endif ?>
       JOIN incdt ON (incdt_crmacct_id=crmacct_id
                      AND (incdt_timestamp BETWEEN <? value("startDate") ?>
                                               AND <? value("endDate") ?>)
                      <? if not exists("showClosed") ?>
                        AND (incdt_status != 'L')
                      <? endif ?>)
       LEFT OUTER JOIN todoitem ON (todoitem_incdt_id=incdt_id)
-      LEFT OUTER JOIN usr ON (usr_id = todoitem_usr_id)
       LEFT OUTER JOIN incdtseverity ON (incdt_incdtseverity_id = incdtseverity_id)
       LEFT OUTER JOIN incdtpriority ON (incdt_incdtpriority_id = incdtpriority_id)
 WHERE ((todoitem_status IS NULL OR todoitem_status != 'C')
 <? if exists("crmacct_id") ?>
   AND (crmacct_id=<? value("crmacct_id") ?>)
 <? endif ?>
 <? if exists("showAcctsWOIncdts") ?>
    AND (incdt_id IS NULL OR (true
 <? endif ?>

 <? if exists("showAcctsWOIncdts") ?>
    ))
 <? endif ?>
  )
 ORDER BY crmacct_name, incdt_timestamp, todoitem_due_date;

 --------------------------------------------------------------------
 REPORT: IncomeStatement
 QUERY: expenses
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cyp_balance * -1) AS CYP,
        formatMoney(workglitem_pyp_balance * -1) AS PYP,
        formatMoney((workglitem_cyp_balance - workglitem_pyp_balance) * -1) AS period_diff,
        CASE WHEN workglitem_cyp_balance = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((workglitem_cyp_balance - workglitem_pyp_balance) / workglitem_cyp_balance))
        END AS period_diff_percent,
        formatMoney(workglitem_cy_balance * -1) AS CY,
        formatMoney(workglitem_py_balance * -1) AS PY,
        formatMoney((workglitem_cy_balance - workglitem_py_balance) * -1) AS prior_year_diff,
        CASE WHEN workglitem_cy_balance = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((workglitem_cy_balance - workglitem_py_balance) / workglitem_cy_balance))
        END AS prior_year_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'E')
   and ((workglitem_subaccnttype_code != 'COGS')
       or (workglitem_subaccnttype_code IS NULL)) )
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: header
 select formatDate(workglhead_cyp_startdate) as start_date,
        formatDate(workglhead_cyp_enddate) as end_date
  from workglhead
-where ( workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER) )
+where ( workglhead_username = CURRENT_USER )
 --------------------------------------------------------------------

 QUERY: COGS
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cyp_balance * -1) AS CYP,
        formatMoney(workglitem_pyp_balance * -1) AS PYP,
        formatMoney((workglitem_cyp_balance - workglitem_pyp_balance) * -1) AS period_diff,
        CASE WHEN workglitem_cyp_balance = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((workglitem_cyp_balance - workglitem_pyp_balance) / workglitem_cyp_balance))
        END AS period_diff_percent,
        formatMoney(workglitem_cy_balance * -1) AS CY,
        formatMoney(workglitem_py_balance * -1) AS PY,
        formatMoney((workglitem_cy_balance - workglitem_py_balance) * -1) AS prior_year_diff,
        CASE WHEN workglitem_cy_balance = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((workglitem_cy_balance - workglitem_py_balance) / workglitem_cy_balance))
        END AS prior_year_percent from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'E')
   and (workglitem_subaccnttype_code = 'COGS'))
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: Revenue
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cyp_balance) AS CYP,
        formatMoney(workglitem_pyp_balance) AS PYP,
        formatMoney(workglitem_cyp_balance - workglitem_pyp_balance) AS period_diff,
        CASE WHEN workglitem_cyp_balance = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workglitem_cyp_balance - workglitem_pyp_balance) / workglitem_cyp_balance)
        END AS period_diff_percent,
        formatMoney(workglitem_cy_balance) AS CY,
        formatMoney(workglitem_py_balance) AS PY,
        formatMoney(workglitem_cy_balance - workglitem_py_balance) AS prior_year_diff,
        CASE WHEN workglitem_cy_balance = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workglitem_cy_balance - workglitem_py_balance) / workglitem_cy_balance)
        END AS prior_year_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'R')
   and (workglitem_subaccnttype_code = 'SI'))
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: TotalSales
 select formatMoney(SUM(workglitem_cyp_balance)) AS CYP,
        formatMoney(SUM(workglitem_pyp_balance)) AS PYP,
        formatMoney(SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) AS period_diff,
        CASE WHEN SUM(workglitem_cyp_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) / SUM(workglitem_cyp_balance))
        END AS period_diff_percent,
        formatMoney(SUM(workglitem_cy_balance)) AS CY,
        formatMoney(SUM(workglitem_py_balance)) AS PY,
        formatMoney(SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) AS prior_year_diff,
        CASE WHEN SUM(workglitem_cy_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) / SUM(workglitem_cy_balance))
        END AS prior_year_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'R')
   and (workglitem_subaccnttype_code = 'SI'))
 --------------------------------------------------------------------

 QUERY: totalExpenses
 select formatMoney(SUM(workglitem_cyp_balance) * -1) AS CYP,
        formatMoney(SUM(workglitem_pyp_balance) * -1) AS PYP,
        formatMoney((SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) * -1) AS period_diff,
        CASE WHEN SUM(workglitem_cyp_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) / SUM(workglitem_cyp_balance)))
        END AS period_diff_percent,
        formatMoney(SUM(workglitem_cy_balance) * -1) AS CY,
        formatMoney(SUM(workglitem_py_balance) * -1) AS PY,
        formatMoney((SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) * -1) AS prior_year_diff,
        CASE WHEN SUM(workglitem_cy_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) / SUM(workglitem_cy_balance)))
        END AS prior_year_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'E')
   and ((workglitem_subaccnttype_code != 'COGS')
       or (workglitem_subaccnttype_code IS NULL)) )
 --------------------------------------------------------------------

 QUERY: ProfitLoss
 select formatMoney(SUM(workglitem_cyp_balance)) AS CYP,
        formatMoney(SUM(workglitem_pyp_balance)) AS PYP,
        formatMoney(SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) AS period_diff,
        CASE WHEN SUM(workglitem_cyp_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) / SUM(workglitem_cyp_balance))
        END AS period_diff_percent,
        formatMoney(SUM(workglitem_cy_balance)) AS CY,
        formatMoney(SUM(workglitem_py_balance)) AS PY,
        formatMoney(SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) AS prior_year_diff,
        CASE WHEN SUM(workglitem_cy_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) / SUM(workglitem_cy_balance))
        END AS prior_year_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and ((workglitem_accnt_type = 'R')
    or (workglitem_accnt_type = 'E')) )
 --------------------------------------------------------------------

 QUERY: Margin
 select formatMoney(SUM(workglitem_cyp_balance)) AS CYP,
        formatMoney(SUM(workglitem_pyp_balance)) AS PYP,
        formatMoney(SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) AS period_diff,
        CASE WHEN SUM(workglitem_cyp_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) / SUM(workglitem_cyp_balance))
        END AS period_diff_percent,
        formatMoney(SUM(workglitem_cy_balance)) AS CY,
        formatMoney(SUM(workglitem_py_balance)) AS PY,
        formatMoney(SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) AS prior_year_diff,
        CASE WHEN SUM(workglitem_cy_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) / SUM(workglitem_cy_balance))
        END AS prior_year_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (((workglitem_accnt_type = 'R')
   and (workglitem_subaccnttype_code = 'SI'))
   or ((workglitem_accnt_type = 'E')
   and (workglitem_subaccnttype_code = 'COGS'))))

 --------------------------------------------------------------------

 QUERY: Other Income
 select workglitem_account,
        workglitem_account_desc,
        formatMoney(workglitem_cyp_balance) AS CYP,
        formatMoney(workglitem_pyp_balance) AS PYP,
        formatMoney(workglitem_cyp_balance - workglitem_pyp_balance) AS period_diff,
        CASE WHEN workglitem_cyp_balance = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workglitem_cyp_balance - workglitem_pyp_balance) / workglitem_cyp_balance)
        END AS period_diff_percent,
        formatMoney(workglitem_cy_balance) AS CY,
        formatMoney(workglitem_py_balance) AS PY,
        formatMoney(workglitem_cy_balance - workglitem_py_balance) AS prior_year_diff,
        CASE WHEN workglitem_cy_balance = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((workglitem_cy_balance - workglitem_py_balance) / workglitem_cy_balance)
        END AS prior_year_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'R')
   and (workglitem_subaccnttype_code != 'SI'))
 order by workglitem_account
 --------------------------------------------------------------------

 QUERY: TotalIncome
 select formatMoney(SUM(workglitem_cyp_balance)) AS CYP,
        formatMoney(SUM(workglitem_pyp_balance)) AS PYP,
        formatMoney(SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) AS period_diff,
        CASE WHEN SUM(workglitem_cyp_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) / SUM(workglitem_cyp_balance))
        END AS period_diff_percent,
        formatMoney(SUM(workglitem_cy_balance)) AS CY,
        formatMoney(SUM(workglitem_py_balance)) AS PY,
        formatMoney(SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) AS prior_year_diff,
        CASE WHEN SUM(workglitem_cy_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) / SUM(workglitem_cy_balance))
        END AS prior_year_percent
  from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and ((workglitem_accnt_type = 'R')
   or (workglitem_accnt_type = 'E')
   and (workglitem_subaccnttype_code = 'COGS')))

 --------------------------------------------------------------------

 QUERY: TotalCOGS
 select formatMoney(SUM(workglitem_cyp_balance) * -1) AS CYP,
        formatMoney(SUM(workglitem_pyp_balance) * -1) AS PYP,
        formatMoney((SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) * -1) AS period_diff,
        CASE WHEN SUM(workglitem_cyp_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) / SUM(workglitem_cyp_balance)))
        END AS period_diff_percent,
        formatMoney(SUM(workglitem_cy_balance) * -1) AS CY,
        formatMoney(SUM(workglitem_py_balance) * -1) AS PY,
        formatMoney((SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) * -1) AS prior_year_diff,
        CASE WHEN SUM(workglitem_cy_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt(((SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) / SUM(workglitem_cy_balance)))
        END AS prior_year_percent from workglitem, workglhead
 where ( (workglitem_workglhead_id = workglhead_id)
-  and (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+  and (workglhead_username = CURRENT_USER)
   and (workglitem_accnt_type = 'E')
   and (workglitem_subaccnttype_code = 'COGS'))
 --------------------------------------------------------------------

 QUERY: TotalOtherIncome
 SELECT formatMoney(SUM(workglitem_cyp_balance)) AS CYP,
        formatMoney(SUM(workglitem_pyp_balance)) AS PYP,
        formatMoney(SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) AS period_diff,
        CASE WHEN SUM(workglitem_cyp_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cyp_balance) - SUM(workglitem_pyp_balance)) / SUM(workglitem_cyp_balance))
        END AS period_diff_percent,
        formatMoney(SUM(workglitem_cy_balance)) AS CY,
        formatMoney(SUM(workglitem_py_balance)) AS PY,
        formatMoney(SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) AS prior_year_diff,
        CASE WHEN SUM(workglitem_cy_balance) = 0.00 THEN formatPrcnt(0.00)
             ELSE formatPrcnt((SUM(workglitem_cy_balance) - SUM(workglitem_py_balance)) / SUM(workglitem_cy_balance))
        END AS prior_year_percent
   FROM workglitem, workglhead
  WHERE ( (workglitem_workglhead_id = workglhead_id)
-   AND   (workglhead_usr_id = (select usr_id from usr where usr_username=CURRENT_USER))
+   AND   (workglhead_username = CURRENT_USER)
    AND   (workglitem_accnt_type = 'R')
    AND   (workglitem_subaccnttype_code != 'SI'))
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: InventoryAvailabilityByParameterList
 QUERY: detail
 SELECT item_number, item_descrip1, item_descrip2,
        warehous_code, itemsite_leadtime,
        formatQty(qtyonhand) AS f_qtyonhand,
        formatQty(noNeg(qtyonhand - allocated)) AS f_unallocated,
        formatQty(noNeg(allocated)) AS f_allocated,
        formatQty(ordered) AS f_ordered,
+       formatQty(requests) AS f_requests,
        formatQty(reorderlevel) AS f_reorderlevel,
        (qtyonhand - allocated + ordered) AS available,
        formatQty(qtyonhand - allocated + ordered) AS f_available
   FROM (SELECT item_number, item_descrip1, item_descrip2,
                warehous_code, itemsite_leadtime,
                CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel,
                itemsite_qtyonhand AS qtyonhand,
 <? if exists("byDays") ?>
                qtyAllocated(itemsite_id, <? value("byDays") ?>) AS allocated,
-               qtyOrdered(itemsite_id, <? value("byDays") ?>) AS ordered
+               qtyOrdered(itemsite_id, <? value("byDays") ?>) AS ordered,
+               qtypr(itemsite_id, <? value("byDays") ?>) AS requests
 <? elseif exists("byDate") ?>
                qtyAllocated(itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) AS allocated,
-               qtyOrdered(itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) AS ordered
+               qtyOrdered(itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) AS ordered,
+               qtypr(itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) AS requests
 <? elseif exists("byDates") ?>
                qtyAllocated(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>) AS allocated,
-               qtyOrdered(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>) AS ordered
+               qtyOrdered(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>) AS ordered,
+               qtypr(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>) AS requests
 <? else ?>
                qtyAllocated(itemsite_id, itemsite_leadtime) AS allocated,
-               qtyOrdered(itemsite_id, itemsite_leadtime) AS ordered
+               qtyOrdered(itemsite_id,   itemsite_leadtime) AS ordered,
+               qtypr(itemsite_id,   itemsite_leadtime) AS requests
 <? endif ?>
           FROM itemsite, item, warehous
          WHERE ((itemsite_active)
            AND (itemsite_item_id=item_id)
            AND (itemsite_warehous_id=warehous_id)
 <? if exists("classcode_id") ?>
            AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
            AND (item_classcode_id IN (SELECT classcode_id FROM classcode WHERE classcode_code ~ <? value("classcode_pattern") ?>))
 <? elseif exists("itemgrp") ?>
            AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
 <? elseif exists("itemgrp_id") ?>
            AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
            AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem, itemgrp WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id) AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
 <? elseif exists("plancode_id") ?>
            AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
            AND (itemsite_plancode_id IN (SELECT plancode_id FROM plancode WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?>
            AND (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
          )
        ) AS data
 <? if exists("showReorder") ?>
  WHERE ( ((qtyonhand - allocated + ordered) <= reorderlevel)
   <? if exists("ignoreReorderAtZero") ?>
    AND (NOT ( ((qtyonhand - allocated + ordered) = 0) AND (reorderlevel = 0)) )
   <? endif ?>
   )
 <? elseif exists("showShortages") ?>
  WHERE ((qtyonhand - allocated + ordered) < 0)
 <? endif ?>
 ORDER BY item_number, warehous_code DESC;

 --------------------------------------------------------------------
 REPORT: Invoice
 QUERY: GroupHead
 SELECT
+
+--Due Date
+CASE WHEN terms_type = 'D' THEN
+
+	FORMATDATE(DATE(invchead_invcdate + terms_duedays))
+	
+	WHEN terms_type = 'P' AND EXTRACT(DAY FROM(invchead_invcdate))<= terms_cutoffday THEN
+
+	FORMATDATE(DATE(
+	EXTRACT(YEAR FROM(invchead_invcdate)) || '-' ||
+	EXTRACT(MONTH FROM(invchead_invcdate)) || '-' ||
+	terms_duedays
+	))
+
+	WHEN terms_type = 'P' AND EXTRACT(DAY FROM(invchead_invcdate)) > terms_cutoffday THEN
+
+	FORMATDATE(DATE(
+	EXTRACT(YEAR FROM(invchead_invcdate)) || '-' ||
+	(EXTRACT(MONTH FROM(invchead_invcdate)) +1) || '-' ||
+	terms_duedays
+	))
+	
+	END AS due_date,
+--Discount Date-------------------------------------
+
+CASE WHEN terms_type = 'D' THEN
+	FORMATDATE(DATE(invchead_invcdate + terms_discdays))
+
+        WHEN terms_type = 'P' AND EXTRACT(DAY FROM(invchead_invcdate))<= terms_cutoffday THEN
+	
+	FORMATDATE(DATE(
+	EXTRACT(YEAR FROM(invchead_invcdate)) || '-' ||
+	EXTRACT(MONTH FROM(invchead_invcdate)) || '-' ||
+	terms_discdays
+	))
+
+	WHEN terms_type = 'P' AND EXTRACT(DAY FROM(invchead_invcdate)) > terms_cutoffday THEN
+
+	FORMATDATE(DATE(
+	EXTRACT(YEAR FROM(invchead_invcdate)) || '-' ||
+	(EXTRACT(MONTH FROM(invchead_invcdate)) +1) || '-' ||
+	terms_discdays
+	))
+	END AS dis_date,
+
+--Discount Date END --
+
+
        --remitto.*,
 remitto_name,
 formatAddr(remitto_address1, remitto_address2, remitto_address3, remitto_citystatezip, remitto_country) AS remitto_adr,
        invchead_invcnumber AS invoicenumber,
        formatDate(invchead_invcdate) AS f_invoicedate,
        cust_number,
        invchead_billto_name,
        formatAddr(invchead_billto_address1, invchead_billto_address2, invchead_billto_address3, ( invchead_billto_city || '  ' || invchead_billto_state || '  ' || invchead_billto_zipcode ), invchead_billto_country) AS f_billtoaddress,
        invchead_billto_phone,
        invchead_shipto_name,
        formatAddr(invchead_shipto_address1, invchead_shipto_address2, invchead_shipto_address3, ( invchead_shipto_city || '  ' || invchead_shipto_state || ' ' || invchead_shipto_zipcode ), invchead_shipto_country) AS f_shiptoaddress,
        invchead_ordernumber AS ordernumber,
        invchead_ponumber,
        formatDate(invchead_orderdate) AS f_orderdate,
        formatDate(invchead_shipdate) AS f_shipdate,
        invchead_fob, terms_descrip, invchead_shipvia
 FROM remitto, cust, invchead
      LEFT OUTER JOIN terms ON (invchead_terms_id=terms_id)
 WHERE ( (invchead_cust_id=cust_id)
  AND (invchead_id=<? value("invchead_id") ?>) )
 ORDER BY ordernumber;
 --------------------------------------------------------------------

 QUERY: GroupExtended
-SELECT formatMoney( noNeg(invchead_freight + invchead_misc_amount +
-                          invchead_tax +
-                          COALESCE(SUM(ROUND(((invcitem_billed * invcitem_qty_invuomratio) *
-                                              (invcitem_price / COALESCE(invcitem_price_invuomratio,1))),2)), 0) -
-                          total_allocated) ) AS f_totaldue,
+SELECT *,
       formatMoney(invchead_misc_amount) AS f_misc,
-      formatMoney(invchead_tax) AS f_tax,
+        formatMoney(head_tax + item_tax)  AS f_tax,
       formatMoney(invchead_freight) AS f_freight,
-      formatMoney(invchead_payment +
-                  (SELECT COALESCE(SUM(arapply_applied), 0) AS applied
-                   FROM arapply LEFT OUTER JOIN
-                        invchead ON (arapply_target_docnumber = invchead_invcnumber)
-                   WHERE ((invchead_id = <? value("invchead_id") ?>)
-                      AND (arapply_source_doctype = 'K')))) AS f_payment,
-      formatMoney(total_allocated) AS f_allocated,
-      invchead_notes,
-      invchead_misc_descrip
-FROM invchead
-     LEFT OUTER JOIN invcitem ON (invcitem_invchead_id=invchead_id)
-     LEFT OUTER JOIN item ON (invcitem_item_id=item_id),
-    (SELECT MAX(total_allocated) AS total_allocated FROM (SELECT COALESCE(SUM(CASE WHEN((aropen_amount - aropen_paid) >=
+        formatMoney(invchead_payment)     AS f_payment,
+        formatMoney(noNeg(invchead_freight + invchead_misc_amount + head_tax + item_tax +
+                          itemtotal - total_allocated)) AS f_totaldue,
+        formatMoney(noNeg(invchead_freight + invchead_misc_amount + head_tax + item_tax +
+                          itemtotal - total_allocated) - (invchead_payment+applied)) AS f_netdue,
+        formatMoney(total_allocated) AS f_allocated
+  FROM (SELECT invchead_misc_amount, invchead_freight,
+               invchead_payment, invchead_notes, invchead_misc_descrip,
+               (SELECT COALESCE(SUM(taxhist_tax), 0) -- COALESCE(SUM()) because taxhist_tax is NOT NULL
+                FROM invcheadtax                     -- and we want 0 if there is no taxhist
+                WHERE (taxhist_parent_id=invchead_id)) AS head_tax,
+               (SELECT COALESCE(SUM(taxhist_tax), 0)
+                FROM invcitem JOIN invcitemtax ON (taxhist_parent_id=invcitem_id)
+                WHERE (invcitem_invchead_id=invchead_id)) AS item_tax,
+               SUM(COALESCE(ROUND(invcitem_billed *
+                                  invcitem_qty_invuomratio *
+                                  invcitem_price /
+                                  COALESCE(invcitem_price_invuomratio,1), 2), 0))
+               AS itemtotal,
+               SUM(COALESCE(arapply_applied, 0)) AS applied,
+               COALESCE(
+               CASE WHEN invchead_posted THEN
+                  (SELECT SUM(COALESCE(currToCurr(arapply_curr_id, t.aropen_curr_id,
+                                                  arapply_applied, t.aropen_docdate), 0))
+                   FROM arapply, aropen s, aropen t
+                   WHERE ( (s.aropen_id=arapply_source_aropen_id)
+                     AND   (arapply_target_aropen_id=t.aropen_id)
+                     AND   (arapply_target_doctype='I')
+                     AND   (arapply_target_docnumber=invchead_invcnumber)
+                     AND   (arapply_source_aropen_id=s.aropen_id)))
+               ELSE
+                  (SELECT SUM(COALESCE(CASE WHEN((aropen_amount - aropen_paid) >=
                        currToCurr(aropenco_curr_id, aropen_curr_id,
                           aropenco_amount, aropen_docdate))
            THEN currToCurr(aropenco_curr_id, invchead_curr_id,
                    aropenco_amount, aropen_docdate)
            ELSE currToCurr(aropen_curr_id, invchead_curr_id,
-                   aropen_amount - aropen_paid, aropen_docdate)
-           END),0) AS total_allocated
-     FROM aropenco, aropen, cohead, invchead
+                                                            aropen_amount - aropen_paid,
+                                                            aropen_docdate)
+                                       END, 0))
+                    FROM aropenco, aropen, cohead
     WHERE ( (aropenco_aropen_id=aropen_id)
       AND   (aropenco_cohead_id=cohead_id)
       AND   ((aropen_amount - aropen_paid) > 0)
-      AND   (cohead_number=invchead_ordernumber)
-      AND   (NOT invchead_posted)
-      AND   (invchead_id=<? value("invchead_id") ?>) )
-    UNION
-    SELECT COALESCE(SUM(currToCurr(arapply_curr_id, t.aropen_curr_id,
-                                   arapply_applied, t.aropen_docdate)),0) AS total_allocated
-     FROM arapply, aropen s, aropen t, invchead
-    WHERE ( (s.aropen_id=arapply_source_aropen_id)
-      AND   (arapply_target_aropen_id=t.aropen_id)
-      AND   (arapply_target_doctype='I')
-      AND   (arapply_target_docnumber=invchead_invcnumber)
-      AND   (arapply_source_aropen_id=s.aropen_id)
-      AND   (invchead_posted)
-      AND   (invchead_id=<? value("invchead_id") ?>) )
-    ) AS data) AS totalalloc
-WHERE (invchead_id=<? value("invchead_id") ?>)
-GROUP BY invchead_freight, invchead_misc_amount, invchead_tax, invchead_payment,
-         invchead_notes, invchead_misc_descrip, total_allocated
-;
+                     AND   (cohead_number=invchead_ordernumber)))
+               END, 0) AS total_allocated
+        FROM invchead
+             LEFT OUTER JOIN invcitem ON (invcitem_invchead_id=invchead_id)
+             LEFT OUTER JOIN arapply ON (arapply_target_docnumber=invchead_invcnumber AND arapply_source_doctype='K')
+        WHERE (invchead_id=<? value("invchead_id") ?>)
+        GROUP BY invchead_freight, invchead_misc_amount, head_tax, item_tax,
+                 invchead_payment, invchead_notes, invchead_misc_descrip,
+                 total_allocated
+  ) AS dummy_outer
+  ;

 --------------------------------------------------------------------
 REPORT: InvoiceRegister
 QUERY: detail
 SELECT gltrans_id,
        formatDate(gltrans_date) AS transdate,
        gltrans_source,
        CASE WHEN(gltrans_doctype='IN') THEN text('Invoice')
             WHEN(gltrans_doctype='CM') THEN text('Credit Memo')
             WHEN(gltrans_doctype='DM') THEN text('Debit Memo')
+            WHEN(gltrans_doctype='CD') THEN text('Customer Deposit')
             ELSE gltrans_doctype
        END AS doctype,
        gltrans_docnumber,
        CASE WHEN(gltrans_doctype='IN') THEN
                 (SELECT invchead_shipto_name
                    FROM aropen LEFT OUTER JOIN
                         invchead
                           ON (invchead_id=aropen_cobmisc_id
                           AND invchead_cust_id=aropen_cust_id)
                   WHERE ((aropen_docnumber=gltrans_docnumber)
                     AND  (aropen_doctype='I')))
             ELSE firstLine(gltrans_notes)
        END AS transnotes,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
        CASE WHEN (gltrans_amount < 0) THEN formatMoney(ABS(gltrans_amount))
             ELSE ''
        END AS f_debit,
        CASE WHEN (gltrans_amount < 0) THEN ABS(gltrans_amount)
             ELSE 0
        END AS debit,
        CASE WHEN (gltrans_amount > 0) THEN formatMoney(gltrans_amount)
             ELSE ''
        END AS f_credit,
        CASE WHEN (gltrans_amount > 0) THEN gltrans_amount
             ELSE 0
        END AS credit
   FROM gltrans, accnt
  WHERE ((gltrans_accnt_id=accnt_id)
-   AND (gltrans_doctype IN ('IN', 'CM', 'DM'))
+   AND (gltrans_doctype IN ('IN', 'CM', 'DM', 'CD'))
    AND (gltrans_source = 'A/R')
    AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("accnt_id") ?>
    AND (gltrans_accnt_id=<? value("accnt_id") ?>)
 <? endif ?>
        )
 ORDER BY gltrans_date, gltrans_docnumber;

 --------------------------------------------------------------------
 REPORT: ItemCostHistory
 QUERY: detail
 SELECT costhist_id,
        costelem_type as f_element,
        formatBoolYN(costhist_lowlevel) as f_lower,
        CASE WHEN costhist_type='A' THEN 'Actual'
             WHEN costhist_type='S' THEN 'Standard'
             WHEN costhist_type='D' THEN 'Delete'
             WHEN costhist_type='N' THEN 'New'
        END as f_type,
        formatDateTime(costhist_date) as f_time,
-       getUserName(costhist_user_id) as f_user,
+       costhist_username as f_user,
        formatCost(costhist_oldcost) as f_oldcost,
        formatCost(costhist_newcost) as f_newcost
   FROM costhist, costelem
  WHERE ((costhist_costelem_id=costelem_id)
    AND (costhist_item_id=<? value("item_id") ?>)
 )
 ORDER BY costhist_date, costelem_type;

 --------------------------------------------------------------------
 REPORT: ItemSitesByItem
 QUERY: detail
 SELECT warehous_code, formatBoolYN(itemsite_active) AS active,
        item_number, item_descrip1, item_descrip2,
-       formatBoolYN(itemsite_supply) AS supplied,
+       formatBoolYN(itemsite_wosupply) AS supplied,
        formatBoolYN(itemsite_sold) AS sold, itemsite_soldranking,
        formatBoolYN(itemsite_stocked) AS stocked,
        formatBoolYN(itemsite_createpr) AS createpr,
        CASE WHEN (itemsite_controlmethod='N') THEN 'None'
             WHEN (itemsite_controlmethod='R') THEN 'Regular'
             WHEN (itemsite_controlmethod='L') THEN 'Lot #'
             WHEN (itemsite_controlmethod='S') THEN 'Serial #'
             ELSE '?'
        END AS controlmethod,
        formatBoolYN(itemsite_loccntrl) AS locationcontrol,
        CASE WHEN (itemsite_location_id=-1) THEN 'None'
             ELSE ( SELECT location_name
                    FROM location
                    WHERE (location_id=itemsite_location_id) )
        END AS defaultlocation,
        formatBoolYN(itemsite_useparams) AS enforceparams,
        formatBoolYN(itemsite_useparamsmanual) AS onmanualorders,
        formatQty(itemsite_reorderlevel) AS reorderlevel,
        formatQty(itemsite_ordertoqty) AS orderupto,
        formatQty(itemsite_multordqty) AS ordermult,
        formatQty(itemsite_safetystock) AS safetystock,
        itemsite_abcclass, itemsite_cyclecountfreq, itemsite_leadtime, itemsite_eventfence,
        formatQty(itemsite_qtyonhand) AS qoh,
        formatDate(itemsite_datelastused, 'Never') AS lastused,
        formatDate(itemsite_datelastcount, 'Never') AS lastcounted,
        CASE WHEN (itemsite_plancode_id=-1) THEN 'Error'
             ELSE (SELECT (plancode_code || '-' || plancode_name) FROM plancode WHERE plancode_id=itemsite_plancode_id)
        END AS plannercode
   FROM itemsite, warehous, item
  WHERE ((itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (item_id=<? value("item_id") ?>) )
 ORDER BY warehous_code;

 --------------------------------------------------------------------
 REPORT: ItemSitesByParameterList
 QUERY: detail
 SELECT warehous_code,
        formatBoolYN(itemsite_active) AS active,
        item_number,
        item_descrip1,
        item_descrip2,
-       formatBoolYN(itemsite_supply) AS supplied,
+       formatBoolYN(itemsite_wosupply) AS supplied,
        formatBoolYN(itemsite_sold) AS sold,
        itemsite_soldranking,
        formatBoolYN(itemsite_stocked) AS stocked,
        formatBoolYN(itemsite_createpr) AS createpr,
        CASE WHEN (itemsite_controlmethod='N') THEN 'None'
             WHEN (itemsite_controlmethod='R') THEN 'Regular'
             WHEN (itemsite_controlmethod='L') THEN 'Lot #'
             WHEN (itemsite_controlmethod='S') THEN 'Serial #'
             ELSE '?'
        END AS controlmethod,
        formatBoolYN(itemsite_loccntrl) AS locationcontrol,
        CASE WHEN (itemsite_location_id=-1) THEN 'None'
             ELSE ( SELECT location_name
                      FROM location
                     WHERE (location_id=itemsite_location_id) )
        END AS defaultlocation,
        formatBoolYN(itemsite_useparams) AS enforceparams,
        formatBoolYN(itemsite_useparamsmanual) AS onmanualorders,
        formatQty(itemsite_reorderlevel) AS reorderlevel,
        formatQty(itemsite_ordertoqty) AS orderupto,
        formatQty(itemsite_multordqty) AS ordermult,
        formatQty(itemsite_safetystock) AS safetystock,
        itemsite_abcclass,
        itemsite_cyclecountfreq,
        itemsite_leadtime,
        itemsite_eventfence,
        formatQty(itemsite_qtyonhand) AS qoh,
        formatDate(itemsite_datelastused, 'Never') AS lastused,
        formatDate(itemsite_datelastcount, 'Never') AS lastcounted,
        CASE WHEN(itemsite_plancode_id=-1) THEN 'Error'
             ELSE (SELECT (plancode_code || '-' || plancode_name)
                     FROM plancode
                    WHERE (plancode_id=itemsite_plancode_id) )
        END AS plannercode
   FROM itemsite, warehous, item
  WHERE ((itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
 <? if exists("classcode_id") ?>
    AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (item_classcode_id IN (SELECT classcode_id
                                 FROM classcode
                                WHERE (classcode_code ~ <? value("classcode_pattern") ?>) ) )
 <? elseif exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN (SELECT plancode_id
                                    FROM plancode
                                   WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? elseif exists("costcat_id") ?>
    AND (itemsite_costcat_id=<? value("costcat_id") ?>)
 <? elseif exists("costcat_pattern") ?>
    AND (itemsite_costcat_id IN (SELECT costcat_id
                                   FROM costcat
                                  WHERE (costcat_code ~ <? value("costcat_pattern") ?>)))
 <? elseif exists("itemgrp_id") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem
                      WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>) ) )
 <? elseif exists("itemgrp_pattern") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem, itemgrp
                      WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                        AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if NOT exists("showInactive") ?>
    AND (itemsite_active)
 <? endif ?>
 )
 ORDER BY item_number;

 --------------------------------------------------------------------
 REPORT: ListOpenSalesOrders
 QUERY: detail
-SELECT DISTINCT cohead_id,
-       cohead_number,
-       cohead_billtoname,
-       cohead_custponumber,
+SELECT DISTINCT cohead.*,
+                COALESCE(cust_number, :error) AS cust_number,
+                getSoSchedDate(cohead_id) AS scheddate,
        formatDate(cohead_orderdate) AS f_orderdate
-  FROM cohead, coitem, itemsite, cust
- WHERE ((coitem_cohead_id=cohead_id)
-   AND (coitem_itemsite_id=itemsite_id)
-   AND (cohead_cust_id=cust_id)
-   AND (coitem_status='O')
-<? if exists("warehous_id") ?>
-   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-)
+FROM cohead
+     JOIN custinfo ON (cohead_cust_id=cust_id)
+     <? if exists("selectedSites") ?>
+       JOIN coitem ON (coitem_cohead_id=cohead_id)
+       JOIN itemsite ON (coitem_itemsite_id=itemsite_id)
+       JOIN site() ON (itemsite_warehous_id=warehous_id)
+     <? else ?>
+       LEFT OUTER JOIN coitem ON (coitem_cohead_id=cohead_id)
+       LEFT OUTER JOIN itemsite ON (coitem_itemsite_id=itemsite_id)
+       LEFT OUTER JOIN site() ON (itemsite_warehous_id=warehous_id)
+     <? endif ?>
+WHERE((true)
+     <? if exists("cust_id") ?>
+       AND (cust_id=<? value("cust_id") ?> )
+     <? endif ?>
+     <? if not exists("showClosed") ?>
+       AND ((coitem_status = 'O') OR (coitem_status IS NULL))
+     <? endif ?>
+     <? if  exists("warehous_id") ?>
+       AND (warehous_id=<? value("warehous_id") ?>)
+     <? endif ?>
+        )
 ORDER BY cohead_number

 --------------------------------------------------------------------
 REPORT: OpportunityList
 QUERY: detail
-SELECT ophead_id,
-       ophead_name,
-       crmacct_number,
-       ophead_owner_username,
-       opstage_name,
-       opsource_name,
-       optype_name,
-       ophead_probability_prcnt,
-       formatMoney(ophead_amount) AS f_amount,
-       currConcat(ophead_curr_id) As f_currency,
-       formatDate(ophead_target_date) AS f_targetdate,
-       formatDate(ophead_actual_date) AS f_actualdate
-  FROM ophead
-       LEFT OUTER JOIN crmacct ON (ophead_crmacct_id=crmacct_id)
-       LEFT OUTER JOIN opstage ON (ophead_opstage_id=opstage_id)
-       LEFT OUTER JOIN opsource ON (ophead_opsource_id=opsource_id)
-       LEFT OUTER JOIN optype ON (ophead_optype_id=optype_id)
- WHERE(((ophead_target_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-       OR (((<? value("startDate") ?> <= startOfTime()) OR (<? value("endDate") ?> >= endOfTime()))
-        AND (ophead_target_date IS NULL))
-    )
-<? if exists("usr_id") ?>
-   AND (ophead_owner_username=(SELECT usr_username FROM usr WHERE usr_id=<? value("usr_id") ?>))
-<? elseif exists("usr_pattern") ?>
-   AND (ophead_owner_username ~ <? value("username_pattern") ?>)
-<? endif ?>
- )
- ORDER BY ophead_target_date;
-
---------------------------------------------------------------------

 QUERY: queryParams
 SELECT
   formatDate(<? value("startDate") ?>,'Earliest') AS f_startDate,
   formatDate(<? value("endDate") ?>,'Latest') AS f_endDate,
-  <? if exists("usr_id") ?>
-    usr_username FROM usr WHERE usr_id = <? value("usr_id") ?>
+  <? if exists("username") ?>
+    <? value("username") ?> AS usr_username
   <? elseif exists("usr_pattern") ?>
     <? value("usr_pattern") ?> AS usr_username
   <? else ?>
     text('All') AS usr_username
   <? endif ?>
 ;

 --------------------------------------------------------------------
 REPORT: PackingList-Shipment
 QUERY: detail
 SELECT 1 AS groupby,
 --     coitem_linenumber AS linenumber,
 --     In 3.1 replace line above with line below to support
 --     kitting functionality
        formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo AS memo,
        CASE WHEN (coitem_custpn != '') THEN coitem_custpn
             ELSE item_number
        END AS item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formatsoitembarcode(coitem_id) AS orderitem_barcode,
 --     In 2.3 replaced the next line:
 --     uom_name,
 --     with:
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        itemsellinguom(item_id) AS shipuom,
        CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip1
             ELSE item_descrip1
        END AS item_descrip1,
        CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip2
             ELSE item_descrip2
        END AS item_descrip2,

        formatQty(coitem_qtyord) AS ordered,
        (SELECT formatQty(SUM(coship_qty)) FROM coship WHERE ((coship_cosmisc_id=<? value("cosmisc_id") ?>) AND (coship_coitem_id=coitem_id))) AS shipped,

        CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus
                                            FROM cust,cohead
                                           WHERE coitem_cohead_id=cohead_id
                                             AND cust_id=cohead_cust_id)='H') THEN 'H'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
                                              AND  (invcitem_linenumber=coitem_linenumber)
                                              AND  (cohead_id=coitem_cohead_id))) >= coitem_qtyord)) THEN 'I'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
                                              AND  (invcitem_linenumber=coitem_linenumber)
                                              AND  (cohead_id=coitem_cohead_id))) > 0)) THEN 'P'
             WHEN (coitem_status='O' AND (itemsite_qtyonhand - qtyAllocated(itemsite_id, CURRENT_DATE)
                                          + qtyOrdered(itemsite_id, CURRENT_DATE))
                                           >= (coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) THEN 'R'
             ELSE coitem_status
        END AS f_status,
        CASE
          WHEN (getPacklistItemLotSerial(coship_cosmisc_id, coitem_id) = '') THEN
            ''
          ELSE
            'Serial #/Lot Information:'
        END AS lotserial_title,
        getPacklistItemLotSerial(coship_cosmisc_id, coitem_id) AS lotserial,
        CASE
          WHEN (getPacklistCharName(coship_cosmisc_id, coitem_id) = '') THEN
            ''
          ELSE
            'Characteristics:'
        END AS char_title,
        getPacklistCharName(coship_cosmisc_id, coitem_id) AS char_name,
        getPacklistCharValue(coship_cosmisc_id, coitem_id) AS char_value
   FROM coship
        JOIN coitem ON (coitem_id=coship_coitem_id)
        JOIN itemsite ON (itemsite_id=coitem_itemsite_id)
        JOIN item ON (item_id=itemsite_item_id)
        JOIN uom ON (uom_id=item_inv_uom_id)
        LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=coitem_custpn)
  WHERE ( (coitem_status <> 'X')
    AND (coship_cosmisc_id=<? value("cosmisc_id") ?>)
 )
 <? if exists("MultiWhs") ?>
 UNION
 SELECT 2 AS groupby,
 --     For 3.1 added CAST to match column type of corresponding column in other SELECT
 --     in this UNION
        CAST(toitem_linenumber AS text) AS linenumber,
        '' AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formattoitembarcode(toitem_id) AS orderitem_barcode,
        uom_name,
        itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(toitem_qty_ordered) AS ordered,
-       formatQty(shipitem_qty) AS shipped,
+
+       (SELECT formatQty(SUM(shipitem_qty))
+        FROM shipitem
+        WHERE ((shipitem_shiphead_id=<? value("shiphead_id") ?>)
+          AND  (shipitem_orderitem_id=toitem_id))
+       ) AS shipped,

        toitem_status AS f_status,
        CASE
          WHEN (getPacklistItemLotSerial(shiphead_id, toitem_id) = '') THEN
            ''
          ELSE
            'Serial #/Lot Information:'
        END AS lotserial_title,
        getPacklistItemLotSerial(shiphead_id, toitem_id) AS lotserial,
        '' AS char_title,
        '' AS char_name,
        '' AS char_value
   FROM itemsite, item, toitem, tohead, shipitem, shiphead, uom
  WHERE ((toitem_item_id=item_id)
    AND  (item_inv_uom_id=uom_id)
    AND  (item_id=itemsite_item_id)
    AND  (toitem_tohead_id=tohead_id)
    AND  (toitem_status <> 'X')
    AND  (tohead_src_warehous_id=itemsite_warehous_id)
    AND  (toitem_id=shipitem_orderitem_id)
    AND  (shipitem_shiphead_id=shiphead_id)
    AND  (shiphead_order_type='TO')
    AND  (shiphead_id=<? value("shiphead_id") ?>)
 )
 <? endif ?>
 ORDER BY linenumber;

 --------------------------------------------------------------------
 REPORT: PickingListSONoClosedLines
 QUERY: detail
 SELECT 1 AS groupby,
-       formatsolinenumber(coitem_linenumber) AS linenumber,
+       formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS item_invuom,
        item_descrip1,
        item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
        formatQty(coitem_qtyshipped - coitem_qtyreturned) AS shipped,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS balance,
        formatQty( ( SELECT COALESCE(SUM(coship_qty), 0)
                     FROM coship, cosmisc
                     WHERE ( (coship_coitem_id=coitem_id)
                      AND (coship_cosmisc_id=cosmisc_id)
                      AND (NOT cosmisc_shipped) ) ) ) AS atshipping,
        formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
                             FROM coship, cosmisc
                             WHERE ( (coship_coitem_id=coitem_id)
                               AND (coship_cosmisc_id=cosmisc_id)
                               AND (NOT cosmisc_shipped) ) )/ CASE WHEN(itemuomratiobytype(item_id, 'Selling') = 0) THEN 1 ELSE itemuomratiobytype(item_id, 'Selling') END ) ) AS shipatshipping,
        CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
                                              AND  (invcitem_linenumber=CASE WHEN(coitem_subnumber > 0) THEN (coitem_linenumber * 1000) + coitem_subnumber ELSE coitem_linenumber END)
                                              AND  (cohead_id=coitem_cohead_id))) >= coitem_qtyord)) THEN 'I'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
                                              AND  (invcitem_linenumber=CASE WHEN(coitem_subnumber > 0) THEN (coitem_linenumber * 1000) + coitem_subnumber ELSE coitem_linenumber END)
                                              AND  (cohead_id=coitem_cohead_id))) > 0)) THEN 'P'
             WHEN (coitem_status='O' AND (itemsite_qtyonhand - qtyAllocated(itemsite_id, CURRENT_DATE)
                                          + qtyOrdered(itemsite_id, CURRENT_DATE))
                                           >= (coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) THEN 'R'
             ELSE coitem_status
        END AS f_status
   FROM itemsite, item, uom, coitem
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
    AND (coitem_status <> 'C')
    AND (item_type != 'K')
 -- 1 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
    <? if exists("hide closed") ?>
    AND (coitem_status <> 'C')
 -- 2 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
 -- <? endif ?>
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
 GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_subnumber, coitem_id, coitem_memo, item_number, item_invuom,
          item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
 ORDER BY linenumber;

 --------------------------------------------------------------------
 REPORT: PricesByCustomer
 QUERY: detail
 SELECT itemid, sourcetype, schedulename, type, itemnumber,
        item_descrip1, item_descrip2,
        CASE WHEN (qtybreak = -1) THEN 'N/A'
             ELSE formatQty(qtybreak)
        END AS f_qtybreak,
        price, formatPrice(price) AS f_price,
        <? if exists("showCosts") ?>
          cost AS cost,
          formatCost(cost) AS f_cost,
          CASE WHEN ((price = 0) OR (cost = 0)) THEN 'N/A'
               ELSE formatScrap((price - cost) / price)
          END AS f_margin
        <? else ?>
          0 AS cost,
          text('') AS f_cost,
          text('') AS f_margin
        <? endif ?>
 FROM (
   SELECT ipsprice_id AS itemid, 1 AS sourcetype,
          ipshead_name AS schedulename, 'Customer' AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
          ipsprice_qtybreak AS qtybreak, ipsprice_price AS price,
          <? if exists("actualCosts") ?>
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM ipsass, ipshead, ipsprice, item
    WHERE ((ipsass_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsprice_item_id=item_id)
      AND (ipsass_cust_id=<? value("cust_id") ?>)
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT ipsprice_id AS itemid, 2 AS sourcetype,
          ipshead_name AS schedulename, 'Cust. Type' AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
          ipsprice_qtybreak AS qtybreak, ipsprice_price AS price,
          <? if exists("actualCosts") ?>
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM ipsass, ipshead, ipsprice, item, cust
    WHERE ((ipsass_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsprice_item_id=item_id)
      AND (ipsass_custtype_id=cust_custtype_id)
      AND (cust_id=<? value("cust_id") ?>)
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT ipsprice_id AS itemid, 3 AS sourcetype,
          ipshead_name AS schedulename, ('Sale' || '-' || sale_name) AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
          ipsprice_qtybreak AS qtybreak, ipsprice_price AS price,
          <? if exists("actualCosts") ?>
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM sale, ipshead, ipsprice, item
    WHERE ((sale_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsprice_item_id=item_id)
 <? if not exists("showExpired") ?>
      AND (sale_enddate > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (sale_startdate <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT item_id AS itemid, 0 AS sourcetype,
          '' AS schedulename, 'List Price' AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
-         -1 AS qtybreak, item_listprice AS price,
+         -1 AS qtybreak, (item_listprice - (item_listprice * cust_discntprcnt)) AS price,
          <? if exists("actualCosts") ?>
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
-    FROM item
+    FROM item, cust
    WHERE ( (item_sold)
+     AND (cust_id=<? value("cust_id") ?>)
      AND (NOT item_exclusive) )
 ) AS data
 ORDER BY itemnumber, price;

 --------------------------------------------------------------------
 REPORT: PurchaseOrder
+QUERY: ShipToAddress
+SELECT pohead_number,
+
+CASE WHEN pohead_vendaddr_id IS NULL THEN
+     warehous_descrip
+ELSE
+     vendaddr_name
+END
+AS warehous_name,
+
+CASE WHEN pohead_vendaddr_id IS NULL THEN
+formataddr(addr_line1, addr_line2, addr_line3, (addr_city || ' ' || addr_state || ' ' || addr_postalcode), addr_country)
+ELSE
+formataddr(vendaddr_address1, vendaddr_address2, vendaddr_address3, (vendaddr_city || ' ' || vendaddr_state || ' ' || vendaddr_zipcode), vendaddr_country)
+END
+AS warehous_address
+
+FROM
+pohead
+LEFT OUTER JOIN vendaddr ON (pohead_vendaddr_id = vendaddr_id),
+vend,
+whsinfo
+LEFT OUTER JOIN addr ON (warehous_addr_id = addr_id)
+WHERE ((pohead_vend_id=vend_id) AND
+       (pohead_warehous_id = warehous_id) AND
+        (pohead_id=<? value("pohead_id") ?>)
+);

 --------------------------------------------------------------------
 REPORT: Quote
 QUERY: head
 SELECT quhead_number,
        quhead_shipvia,
        formatDate(quhead_quotedate) as f_orderdate,
        formatDate(quhead_packdate) as f_packdate,
        CASE WHEN(quhead_origin='C') THEN 'Customer'
             WHEN(quhead_origin='I') THEN 'Internet'
             WHEN(quhead_origin='S') THEN 'Sales Rep.'
             ELSE quhead_origin
        END AS f_origin,
         salesrep_name,
        formatScrap(quhead_commission) as f_commission,
-        (tax_code||' - '||tax_descrip) as f_tax,
         (terms_code||' - '||terms_descrip) as f_terms,
        cust_number,
        quhead_billtoname,
-       formatAddr(quhead_billtoaddress1, quhead_billtoaddress2, quhead_billtoaddress3, (quhead_billtocity||', '||quhead_billtostate||' '||quhead_billtozip), quhead_billtocountry) AS f_billtoaddress,
-
+       formatAddr(quhead_billtoaddress1,
+                  quhead_billtoaddress2,
+                  quhead_billtoaddress3,
+                 (quhead_billtocity || ', ' || quhead_billtostate || ' ' || quhead_billtozip),
+                  quhead_billtocountry) AS f_billtoaddress,
        CASE WHEN(quhead_shipto_id=-1) THEN text('')
             ELSE (select text(shipto_num) from shipto where shipto_id=quhead_shipto_id)
        END AS f_shiptonum,
-
        quhead_shiptoname,
-       formatAddr(quhead_shiptoaddress1, quhead_shiptoaddress2, quhead_shiptoaddress3, (quhead_shiptocity||', '||quhead_shiptostate||' '||quhead_shiptozipcode), quhead_shiptocountry) AS f_shiptoaddress,
+       formatAddr(quhead_shiptoaddress1,
+                  quhead_shiptoaddress2,
+                  quhead_shiptoaddress3,
+                 (quhead_shiptocity || ', ' || quhead_shiptostate || ' ' || quhead_shiptozipcode),
+                  quhead_shiptocountry) AS f_shiptoaddress,
        quhead_custponumber,
        quhead_fob
---For 2.1  the structure related to TAX and CRM and Quotes for PROSPECTS
---has changed and the FROM and WHERE clauses should be
---changed as follows:
---Start:
-    FROM quhead
+FROM quhead
          LEFT OUTER JOIN cust ON (quhead_cust_id = cust_id)
 	LEFT OUTER JOIN terms ON (quhead_terms_id = terms_id)
          LEFT OUTER JOIN salesrep ON (quhead_salesrep_id = salesrep_id)
-         LEFT OUTER JOIN tax ON (quhead_tax_id = tax_id)
-    WHERE (quhead_id = <? value("quhead_id") ?>)
---End
-
---  Previous FROM and WHERE clauses:
---  FROM quhead, terms, salesrep, cust
---     AND  (quhead_cust_id=cust_id))
---     AND  (quhead_salesrep_id=salesrep_id))
---     AND  (quhead_tax_id=tax_id)
---     AND  (quhead_terms_id=terms_id) );
+WHERE (quhead_id = <? value("quhead_id") ?>)
+
 --------------------------------------------------------------------

 QUERY: items
-SELECT
-
-       quitem_id,
+SELECT quitem_id,
        quitem_linenumber,
        quitem_custpn,
        item_number,
        item_descrip1,
        --The following 2 lines are new in 2.3
        (select uom_name from uom where uom_id = quitem_qty_uom_id) AS uom_ordered,
        (select uom_name from uom where uom_id = quitem_price_uom_id) AS uom_pricing,
        warehous_code,
        formatQty(quitem_qtyord) as f_ordered,
        formatPrice(quitem_price) as f_price,
        --The following line was changed in 2.3 from:
        --formatExtprice(quitem_qtyord * (quitem_price / iteminvpricerat(item_id))) as f_extprice
        --To:
        formatExtprice((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio)) as f_extprice,
        quitem_memo,
        char_name,
        charass_value
-FROM
-     item,
-     quitem
+FROM quitem
+     JOIN item ON (item_id=quitem_item_id)
      LEFT OUTER JOIN (itemsite JOIN warehous ON (itemsite_warehous_id=warehous_id)) ON (quitem_itemsite_id=itemsite_id)
-     LEFT OUTER JOIN charass on (charass_target_id = quitem_id) left outer join char ON (charass_char_id = char_id)
-WHERE
-(
-     (quitem_item_id=item_id)
-     AND (quitem_quhead_id=<? value("quhead_id") ?>)
-)
+     LEFT OUTER JOIN charass ON ((charass_target_id = quitem_id)
+                            AND (charass_target_type = 'QI'))
+     LEFT OUTER JOIN char ON (charass_char_id = char_id)
+WHERE (quitem_quhead_id=<? value("quhead_id") ?>)
 ORDER BY quitem_linenumber;
 --------------------------------------------------------------------

 QUERY: totals
 SELECT 1 as one,
        formatExtPrice(subtotal) AS f_subtotal,
        formatExtPrice(tax) AS f_tax,
        formatExtPrice(quhead_freight) as f_freight,
+       formatExtPrice(quhead_misc) AS f_misc,
        formatExtPrice(subtotal + tax + quhead_freight) AS f_total
   FROM quhead,
-       (SELECT SUM(quitem_qtyord * (quitem_price / iteminvpricerat(item_id))) AS subtotal
-          FROM quitem, item
-         WHERE ((quitem_quhead_id=<? value("quhead_id") ?>)
-           AND  (quitem_item_id=item_id)) ) AS subtot,
-       (SELECT calculateTax(quhead_tax_id,
-                            SUM(quitem_qtyord
-                              * (quitem_price
-                              / iteminvpricerat(item_id))),
-                            quhead_freight) AS tax
-          FROM quitem, item,
-               (SELECT quhead_tax_id,
-                       quhead_freight
-                  FROM quhead
-                 WHERE (quhead_id=<? value("quhead_id") ?>) ) as data
-         WHERE ((quitem_quhead_id=<? value("quhead_id") ?>)
-           AND  (quitem_item_id=item_id))
-      GROUP BY quhead_tax_id, quhead_freight ) as taxinfo
- WHERE (quhead_id=<? value("quhead_id") ?>);
+       (SELECT SUM((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio)) AS subtotal
+          FROM quitem
+         WHERE (quitem_quhead_id=<? value("quhead_id") ?>) ) AS subtot,
+       (SELECT COALESCE(SUM(tax),0) AS tax
+        FROM (
+          SELECT ROUND(SUM(taxdetail_tax),2) AS tax
+          FROM tax
+          JOIN calculateTaxDetailSummary('Q', <? value("quhead_id") ?>, 'T') ON (taxdetail_tax_id=tax_id)
+	GROUP BY tax_id) AS data) AS taxtot


---------------------------------------------------------------------

-QUERY: GroupFoot
---Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
---with quitem_price_invuomratio:
-SELECT formatMoney(SUM(round((quitem_price * quitem_qty_invuomratio) * quitem_qtyord / quitem_price_invuomratio ,2))) AS f_extprice,
-       formatMoney(quhead_freight) AS f_freight,
-       formatMoney(quhead_misc) AS f_misc,
-
--- Old way of calculating Tax:
---formatMoney(calculateTax(quhead_tax_id, SUM(round(quitem_price * CASE WHEN (item_taxable) THEN quitem_qtyord ELSE 0 END / iteminvpricerat(item_id) ,2)), quhead_freight, 'T')) AS f_tax,
---
--- New way after 2.1.1:
-formatMoney((select
-((
-
---Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
---with quitem_price_invuomratio:
-select sum(calculatetax(quitem_tax_id, (quitem_qtyord * (quitem_price * quitem_qty_invuomratio) / quitem_price_invuomratio), '0')) from quitem, quhead, item, itemsite where quhead_id  = <? value("quhead_id") ?> and quitem_quhead_id = quhead_id and quitem_itemsite_id = itemsite_id and itemsite_item_id  = item_id
-)
-+
-(
-select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'A') from quhead where quhead_id = <? value("quhead_id") ?>
-)
-+
-(
-select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'B') from quhead where quhead_id = <? value("quhead_id") ?>
-)
-+
-(
-select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'C') from quhead where quhead_id = <? value("quhead_id") ?>
-)
-))) AS f_tax,
---End of new 2.1.1 Tax Calc
-
---Note: in 2.1.1 replace Tax Calc with new method in the section
---of the query that returns f_totaldue:
---Old f_total due START:
---formatMoney((calculateTax(quhead_tax_id, SUM(round(quitem_price * CASE WHEN (item_taxable) THEN quitem_qtyord ELSE 0 END / --iteminvpricerat(item_id) ,2)), quhead_freight, 'T')) + SUM(round(quitem_price * quitem_qtyord / iteminvpricerat(item_id) ,2)) + quhead_freight + --quhead_misc) as f_totaldue
---Old f_totaldue END
-
-------------------------------------
---New f_totaldue begin:
-
-formatMoney(
-(
---Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
---with quitem_price_invuomratio:
-select sum(calculatetax(quitem_tax_id, (quitem_qtyord * (quitem_price * quitem_qty_invuomratio) / quitem_price_invuomratio), '0')) from quitem, quhead, item, itemsite where quhead_id  = <? value("quhead_id") ?> and quitem_quhead_id = quhead_id and quitem_itemsite_id = itemsite_id and itemsite_item_id  = item_id
-)
-+
-(
-select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'A') from quhead where quhead_id = <? value("quhead_id") ?>
-)
-+
-(
-select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'B') from quhead where quhead_id = <? value("quhead_id") ?>
-)
-+
-(
-select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'C') from quhead where quhead_id = <? value("quhead_id") ?>
-)
---Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
---with quitem_price_invuomratio:
- + SUM(round((quitem_price * quitem_qty_invuomratio) * quitem_qtyord / quitem_price_invuomratio ,2))
- + quhead_freight
- + quhead_misc)
-AS f_totaldue
-
---New f_totaldue end:
-------------------------------------
-
-FROM quhead, quitem, item
-
-WHERE ( (quitem_quhead_id=quhead_id)
- AND (quitem_item_id=item_id)
- AND (quhead_id=<? value("quhead_id") ?>) )
-GROUP BY quhead_id, quhead_freight, quhead_tax_id, quhead_misc;
+ WHERE (quhead_id=<? value("quhead_id") ?>);
+
+
 --------------------------------------------------------------------

 QUERY: currency_info
 --this was added in version 2.3
-select
-curr_name,
-curr_symbol,
-curr_abbr
- from quhead, curr_symbol where quhead_curr_id = curr_id
- and quhead_id = <? value("quhead_id") ?>;
+SELECT curr_name,
+       curr_symbol,
+       curr_abbr
+FROM quhead, curr_symbol
+WHERE ( (quhead_curr_id = curr_id)
+  AND   (quhead_id = <? value("quhead_id") ?>) );
 --------------------------------------------------------------------

 QUERY: address
-SELECT
-     warehous_descrip,
-     formatAddr(addr_line1, addr_line2, addr_line3, ( addr_city || '  ' || addr_state || '  ' || addr_postalcode), addr_country) AS warehouse_address
-FROM
-     whsinfo,
+SELECT warehous_descrip,
+       formatAddr(addr_line1,
+                  addr_line2,
+                  addr_line3,
+                 (addr_city || '  ' || addr_state || '  ' || addr_postalcode),
+                  addr_country) AS warehouse_address
+FROM whsinfo,
      addr,
      quhead
-WHERE
-     addr_id = warehous_addr_id
-     and quhead_warehous_id = warehous_id
-     AND quhead_id=<? value("quhead_id") ?> ;
+WHERE ( (addr_id = warehous_addr_id)
+  AND   (quhead_warehous_id = warehous_id)
+  AND   (quhead_id=<? value("quhead_id") ?>) );
 --------------------------------------------------------------------

 QUERY: contact_fax_phone
-select
-
-cntct_fax,
-cntct_phone
-
-from
-
-cntct, quhead, custinfo where cust_id = quhead_cust_id  and cust_cntct_id = cntct_id and quhead_id = <? value("quhead_id") ?>;
+SELECT cntct_fax,
+       cntct_phone
+FROM cntct, quhead, custinfo
+WHERE ( (cust_id = quhead_cust_id)
+  AND   (cust_cntct_id = cntct_id)
+  AND   (quhead_id = <? value("quhead_id") ?>) );

 --------------------------------------------------------------------
 REPORT: SalesAccountAssignmentsMasterList
 QUERY: detail
 SELECT salesaccnt_id,
        CASE WHEN salesaccnt_warehous_id=-1 THEN 'Any'::TEXT
             ELSE (SELECT warehous_code FROM warehous WHERE (warehous_id=salesaccnt_warehous_id))
        END AS warehouscode,
        CASE WHEN salesaccnt_custtype_id=-1 THEN salesaccnt_custtype
             ELSE (SELECT custtype_code FROM custtype WHERE (custtype_id=salesaccnt_custtype_id))
        END AS custtypecode,
        CASE WHEN salesaccnt_prodcat_id=-1 THEN salesaccnt_prodcat
             ELSE (SELECT prodcat_code FROM prodcat WHERE (prodcat_id=salesaccnt_prodcat_id))
        END AS prodcatcode,
        formatGLAccount(salesaccnt_sales_accnt_id) AS salesaccnt,
        formatGLAccount(salesaccnt_credit_accnt_id) AS creditaccnt,
-       formatGLAccount(salesaccnt_cos_accnt_id) AS costaccnt
+       formatGLAccount(salesaccnt_cos_accnt_id) AS costaccnt,
+       formatGLAccount(salesaccnt_returns_accnt_id) AS returnsaccnt,
+       formatGLAccount(salesaccnt_cor_accnt_id) AS coraccnt,
+       formatGLAccount(salesaccnt_cow_accnt_id) AS cowaccnt
   FROM salesaccnt
 ORDER BY warehouscode, custtypecode, prodcatcode;

 --------------------------------------------------------------------
 REPORT: SalesHistoryByParameterList
 QUERY: detail
 SELECT cohist_ordernumber AS sonumber,
        cust_number,
        cohist_invcnumber AS invnumber,
        formatDate(cohist_orderdate) AS orddate,
        formatDate(cohist_invcdate) AS invcdate,
        item_number, item_descrip1, item_descrip2,
        formatQty(cohist_qtyshipped) AS shipped,
        <? if exists("showPrices") ?>
        formatPrice(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS unitprice,
        formatMoney(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS f_total,
        <? else ?>
        '' AS unitprice,
        '' AS f_total,
        <? endif ?>
        round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)  AS total
   FROM cohist, itemsite, item, cust
  WHERE ((cohist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (cohist_cust_id=cust_id)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("prodcat_id") ?>
    AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (item_prodcat_id IN (SELECT prodcat_id FROM prodcat WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? elseif exists("custtype_id") ?>
    AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? elseif exists("custgrp_id") ?>
-   AND (cust_id IN (SELECT custgrpitem_cust_id FROM custgrpitem WHERE (custgrpitem_id=<? value("custgrp_id") ?>)))
+   AND (cust_id IN (SELECT custgrpitem_cust_id FROM custgrpitem WHERE (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)))
 <? elseif exists("custgrp_pattern") ?>
    AND (cust_id IN (SELECT custgrpitem_cust_id FROM custgrp, custgrpitem WHERE ((custgrpitem_custgrp_id=custgrp_id) AND (custgrp_name ~ <? value("custgrp_pattern") ?>))))
 <? elseif exists("custgrp") ?>
   AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id FROM custgrpitem))
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
  )
 ORDER BY cohist_invcdate, item_number;

 --------------------------------------------------------------------
 REPORT: SelectPaymentsList
 QUERY: detail
 SELECT apopen_id, apselectid, vendor, apopen_docnumber, apopen_ponumber,
               formatDate(apopen_duedate) AS f_duedate,
               formatDate(apopen_docdate) AS f_docdate,
               formatMoney(amount) AS f_amount,
               f_selected, f_late
  FROM (SELECT apopen_id, COALESCE(apselect_id, -1) AS apselectid,
        (vend_number || '-' || vend_name) AS vendor,
        apopen_docnumber, apopen_ponumber,
        apopen_duedate, apopen_docdate,
        (apopen_amount - apopen_paid -
-                   COALESCE((SELECT SUM(checkitem_amount / round(checkitem_curr_rate,5))
+                   COALESCE((SELECT SUM(checkitem_amount / checkitem_curr_rate)
                              FROM checkitem, checkhead
                              WHERE ((checkitem_checkhead_id=checkhead_id)
                               AND (checkitem_apopen_id=apopen_id)
                               AND (NOT checkhead_void)
                               AND (NOT checkhead_posted))
                            ), 0)) AS amount,
        formatMoney(COALESCE(SUM(apselect_amount), 0)) AS f_selected,
        formatBoolYN(apopen_duedate <= CURRENT_DATE) AS f_late
   FROM vend, apopen LEFT OUTER JOIN apselect ON (apselect_apopen_id=apopen_id)
  WHERE ( (apopen_open)
    AND (apopen_doctype IN ('V', 'D'))
    AND (apopen_vend_id=vend_id)
 <? if exists("vend_id") ?>
    AND (vend_id=<? value("vend_id") ?>)
 <? elseif exists("vendtype_id") ?>
    AND (vend_vendtype_id=<? value("vendtype_id") ?>)
 <? elseif exists("vendtype_pattern") ?>
    AND (vend_vendtype_id IN (SELECT vendtype_id
                                FROM vendtype
                               WHERE (vendtype_code ~ <? value("vendtype_pattern") ?>)))
 <? endif ?>
        )
 GROUP BY apopen_id, apselect_id, vend_number, vend_name,
          apopen_docnumber, apopen_ponumber,
          apopen_duedate, apopen_docdate, apopen_amount, apopen_paid, apopen_curr_id) AS data
  WHERE (amount <> 0.0)
 ORDER BY apopen_duedate, amount DESC;

 --------------------------------------------------------------------
 REPORT: SummarizedBankrecHistory
 QUERY: detail
 SELECT bankrec_id,
        formatBoolYN(bankrec_posted) AS f_posted,
        formatDate(bankrec_created) AS f_created,
+       formatDate(bankrec_postdate) AS f_postdate,
        bankrec_username AS f_username,
        formatDate(bankrec_opendate) AS f_opendate,
        formatDate(bankrec_enddate) AS f_enddate,
        formatMoney(bankrec_openbal) AS f_openbal,
        formatMoney(bankrec_endbal) AS f_endbal
   FROM bankrec
  WHERE (bankrec_bankaccnt_id=<? value("bankaccnt_id") ?>)
  ORDER BY bankrec_created;

 --------------------------------------------------------------------
 REPORT: SummarizedGLTransactions

 QUERY: detail
 SELECT data.accnt_id AS accnt_id,
 -- account information
        formatGLAccount(data.accnt_id) AS account,
        accnt_descrip,
        f_debit,
        f_credit,
 -- transactionn details
        formatDate(gltrans_date) AS transdate,
        gltrans_source,
        gltrans_doctype,
        gltrans_docnumber,
        gltrans_notes,
        f_debitdetail,
        f_creditdetail,
        <? if exists("showUsernames") ?>
          gltrans_username
        <? else ?>
          text('')
        <? endif ?>
        AS f_username
   FROM ( SELECT accnt_id,
                 accnt_number,
                 accnt_profit,
                 accnt_sub,
                 accnt_descrip,
                 formatMoney( SUM( CASE WHEN (gltrans_amount < 0) THEN (gltrans_amount * -1)
                                        ELSE 0
                                   END ) ) AS f_debit,
                 formatMoney( SUM( CASE WHEN (gltrans_amount > 0) THEN gltrans_amount
                                        ELSE 0
                                   END ) ) AS f_credit
            FROM gltrans, accnt
           WHERE ( (gltrans_accnt_id=accnt_id)
             AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
          <? if exists("source") ?>
             AND (gltrans_source=<? value("source") ?>)
          <? endif ?>
+         <? if exists("unpostedTransactions") ?>
+            AND (NOT gltrans_posted)
+         <? elseif exists("postedTransactions") ?>
+            AND (gltrans_posted)
+         <? endif ?>
          )
          GROUP BY accnt_id, accnt_number, accnt_profit, accnt_sub, accnt_descrip
        ) AS data LEFT OUTER JOIN
        ( SELECT accnt_id,
                 gltrans_date,
                 gltrans_created,
                 gltrans_source,
                 gltrans_doctype,
                 gltrans_docnumber,
                 gltrans_notes,
                 gltrans_username,
                 CASE WHEN (gltrans_amount < 0) THEN formatMoney(gltrans_amount * -1)
                      ELSE ''
                 END AS f_debitdetail,
                 CASE WHEN (gltrans_amount > 0) THEN formatMoney(gltrans_amount)
                      ELSE ''
                 END AS f_creditdetail
            FROM gltrans, accnt
           WHERE ((gltrans_accnt_id=accnt_id)
             AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
          <? if exists("source") ?>
             AND (gltrans_source=<? value("source") ?>)
          <? endif ?>
          <? if exists("unpostedTransactions") ?>
             AND (NOT gltrans_posted)
          <? elseif exists("postedTransactions") ?>
             AND (gltrans_posted)
          <? endif ?>
                 )
        ) AS data2 ON (data.accnt_id=data2.accnt_id)
 ORDER BY accnt_number, accnt_profit, accnt_sub, gltrans_date DESC, gltrans_created;

 --------------------------------------------------------------------
 REPORT: SummarizedSalesHistoryByShippingZone
 QUERY: detail
 SELECT shipzone_name, cust_number, cust_name,
-       item_number, item_descrip1, item_descrip2,
+       item_number, itemdescription,
        formatQty(SUM(cohist_qtyshipped)) AS shipped,
-       formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) AS extprice
-FROM cohist, cust, shipto, itemsite, item, shipzone
-WHERE ((cohist_cust_id=cust_id)
- AND (cohist_shipto_id=shipto_id)
- AND (cohist_itemsite_id=itemsite_id)
- AND (itemsite_item_id=item_id)
- AND (shipto_shipzone_id=shipzone_id)
- AND (cohist_invcdate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>)
+       formatMoney(SUM(baseextprice)) AS extprice
+FROM saleshistory
+WHERE ((cohist_invcdate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
  AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
  AND (item_prodcat_id IN (SELECT prodcat_id FROM prodcat WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("shipzone_id") ?>
  AND (shipzone_id=<? value("shipzone_id") ?>)
 <? endif ?>
  )
-GROUP BY shipzone_id, cust_id, shipzone_name, cust_number, cust_name, item_number, item_descrip1, item_descrip2;
+GROUP BY shipzone_id, cust_id, shipzone_name, cust_number, cust_name, item_number, itemdescription;

 --------------------------------------------------------------------
 REPORT: TodoByUserAndIncident
 QUERY: detail
 SELECT todoitem_id, incdt_id, incdtpriority_name, incdt_number,
-       usr_username, todoitem_name, todoitem_due_date,
+       todoitem_username, todoitem_name, todoitem_due_date,
        todoitem_start_date, todoitem_status,
        todoitem_description
-FROM usr, todoitem LEFT OUTER JOIN
+FROM todoitem LEFT OUTER JOIN
      incdt ON (todoitem_incdt_id = incdt_id)
      LEFT OUTER JOIN incdtpriority ON (incdtpriority_id=todoitem_priority_id)
-WHERE ((usr_id=todoitem_usr_id)
+WHERE ((true)
 <? if not exists("showInactive") ?>
   AND todoitem_active
 <? endif ?>
 <? if not exists("showCompleted") ?>
   AND todoitem_status != 'C'
 <? endif ?>
-<? if exists("usr_id") ?>
-  AND (usr_id=<? value("usr_id") ?>)
+<? if exists("username") ?>
+  AND (todoitem_username=<? value("username") ?>)
 <? elseif exists("usr_pattern") ?>
-  AND (usr_username ~* <? value("usr_pattern") ?>)
+  AND (todoitem_username ~* <? value("usr_pattern") ?>)
 <? endif ?>
 <? if exists("incdt_id") ?>
   AND (todoitem_incdt_id=<? value("incdt_id") ?>)
 <? endif ?><? if exists("start_date_start") ?>
   AND (todoitem_start_date>=<? value("start_date_start") ?>)
 <? endif ?><? if exists("start_date_end") ?>
   AND (todoitem_start_date<=<? value("start_date_end") ?>)<? endif ?>
 <? if exists("due_date_start") ?>
   AND (todoitem_due_date>=<? value("due_date_start") ?>)
 <? endif ?><? if exists("due_date_end") ?>
   AND (todoitem_due_date<=<? value("due_date_end") ?>)
 <? endif ?>
-) ORDER BY usr_username, incdtpriority_order;
+) ORDER BY todoitem_username, incdtpriority_order;
 --------------------------------------------------------------------

 QUERY: username
 SELECT
-  <? if exists("usr_id") ?>
-    usr_username AS usr
-    FROM usr
-    WHERE (usr_id=<? value("usr_id") ?>)
+  <? if exists("username") ?>
+    <? value("username") ?> AS usr
   <? elseif exists("usr_pattern") ?>
     <? value("usr_pattern") ?>
   <? else ?>
     'ALL' AS usr
   <? endif ?>
 ;

 --------------------------------------------------------------------
 REPORT: TodoItem
 QUERY: detail
-SELECT todoitem_id AS id, todoitem_usr_id AS altId,
+SELECT todoitem_id AS id,
        'T' AS type, todoitem_seq AS seq,
        todoitem_name AS name,
        firstLine(todoitem_description) AS descrip,
        todoitem_status AS status, todoitem_due_date AS due,
-       usr_username AS usr, incdt_number AS incdt
-FROM todoitem JOIN usr ON (usr_id=todoitem_usr_id)
-              LEFT OUTER JOIN incdt ON (incdt_id=todoitem_incdt_id)
+       todoitem_username AS usr, incdt_number AS incdt
+FROM todoitem LEFT OUTER JOIN incdt ON (incdt_id=todoitem_incdt_id)
 WHERE (todoitem_id=<? value("todoitem_id") ?>)
 ORDER BY seq, usr;

 --------------------------------------------------------------------
 REPORT: TodoList
 QUERY: detail
-SELECT todoitem_id AS id, 1 AS altId, todoitem_owner_username AS owner,
-		       <? value("todo") ?> AS type, incdtpriority_order AS seq, incdtpriority_name AS priority,
-		       todoitem_name AS name,
-		       firstLine(todoitem_description) AS descrip,
-           todoitem_status AS status, todoitem_start_date as start,
-		       todoitem_due_date AS due, formatDate(todoitem_due_date) AS f_due,
-		       usr_username AS usr, CAST(incdt_number AS text) AS number, cust_number AS cust,
-           CASE WHEN (todoitem_status != 'C'AND
-                      todoitem_due_date < CURRENT_DATE) THEN 'expired'
-                WHEN (todoitem_status != 'C'AND
-                      todoitem_due_date > CURRENT_DATE) THEN 'future'
-           END AS due_qtforegroundrole
-		FROM usr, todoitem LEFT OUTER JOIN incdt ON (incdt_id=todoitem_incdt_id)
-		                   LEFT OUTER JOIN crmacct ON (crmacct_id=todoitem_crmacct_id)
-		                   LEFT OUTER JOIN cust ON (cust_id=crmacct_cust_id)
-                       LEFT OUTER JOIN incdtpriority ON (incdtpriority_id=todoitem_priority_id)
-		WHERE ( (todoitem_usr_id=usr_id)
-      <? if exists("startStartDate") ?>
-      AND (todoitem_start_date BETWEEN <? value("startStartDate") ?>
-		                             AND <? value("startEndDate") ?>)
-      <? endif ?>
-      <? if exists("dueStartDate") ?>
-		  AND   (todoitem_due_date BETWEEN <? value("dueStartDate") ?>
-		                               AND <? value("dueEndDate") ?>)
-  	  <? endif ?>
-		  <? if not exists("completed") ?>
-		  AND   (todoitem_status != 'C')
-		  <? endif ?>
-		  <? if exists("usr_id") ?>
-		  AND (usr_id=<? value("usr_id") ?>)
-		  <? elseif exists("usr_pattern" ?>
-		  AND (usr_username ~ <? value("usr_pattern") ?>)
-		  <? endif ?>
-		  <? if not exists("completed") ?>AND (todoitem_active) <? endif ?>
-		       )
-		<? if exists("incidents")?>
-    <? if not exists("dueStartDate") ?>
-		UNION
-		SELECT incdt_id AS id, 2 AS altId, incdt_owner_username AS owner,
-		       <? value("incident") ?> AS type, incdtpriority_order AS seq, incdtpriority_name AS priority,
-		       incdt_summary AS name,
-		       firstLine(incdt_descrip) AS descrip,
-           incdt_status AS status, CAST(incdt_timestamp AS date) AS start,
-		       null AS due, null AS f_due,
-		       incdt_assigned_username AS usr, CAST(incdt_number AS text) AS number, cust_number AS cust,
-                       NULL AS due_qtforegroundrole
-		FROM incdt LEFT OUTER JOIN usr ON (usr_username=incdt_assigned_username)
-		           LEFT OUTER JOIN crmacct ON (crmacct_id=incdt_crmacct_id)
-		           LEFT OUTER JOIN cust ON (cust_id=crmacct_cust_id)
-               LEFT OUTER JOIN incdtpriority ON (incdtpriority_id=incdt_incdtpriority_id)
-		WHERE ((true)
-      <? if exists("startStartDate") ?>
-      AND (incdt_timestamp BETWEEN <? value("startStartDate") ?>
-		                            AND <? value("startEndDate") ?>)
-      <? endif ?>
-		  <? if not exists("completed") ?>
-		  AND (incdt_status != 'L')
-		  <? endif ?>
-		  <? if exists("usr_id") ?>
-		  AND (usr_id=<? value("usr_id") ?>)
-		  <? elseif exists("usr_pattern" ?>
-		  AND (usr_username ~ <? value("usr_pattern") ?>)
-		  <? endif ?>
-		       )
-		<? endif ?>
-    <? endif ?>
-		<? if exists("projects")?>
-		UNION
-		SELECT prjtask_id AS id, 3 AS altId, prjtask_owner_username AS owner,
-		       <? value("task") ?> AS type, NULL AS seq, NULL AS priority,
-		       prjtask_number || '-' || prjtask_name AS name,
-		       firstLine(prjtask_descrip) AS descrip,
-		       prjtask_status AS status,  prjtask_start_date AS start,
-           prjtask_due_date AS due, formatDate(prjtask_due_date) AS f_due,
-		       usr_username AS usr, prj_number, '' AS cust,
-           CASE WHEN (prjtask_status != 'C'AND
-                      prjtask_due_date < CURRENT_DATE) THEN 'expired'
-                WHEN (prjtask_status != 'C'AND
-                      prjtask_due_date > CURRENT_DATE) THEN 'future'
-           END AS due_qtforegroundrole
-		FROM prj, prjtask LEFT OUTER JOIN usr ON (usr_id=prjtask_usr_id)
-		WHERE ((prj_id=prjtask_prj_id)
-      <? if exists("startStartDate") ?>
-      AND (prjtask_start_date BETWEEN <? value("startStartDate") ?>
-		                             AND <? value("startEndDate") ?>)
-      <? endif ?>
-      <? if exists("dueStartDate") ?>
-      AND (prjtask_due_date BETWEEN <? value("dueStartDate") ?>
-		                             AND <? value("dueEndDate") ?>)
-      <? endif ?>
-		  <? if not exists("completed") ?>
-		  AND (prjtask_status != 'L')
-		  <? endif ?>
-		  <? if exists("usr_id") ?>
-		  AND (usr_id=<? value("usr_id") ?>)
-		  <? elseif exists("usr_pattern" ?>
-		  AND (usr_username ~ <? value("usr_pattern") ?>)
-		  <? endif ?>
-		       )
-  	UNION
-		SELECT prj_id AS id, 4 AS altId, prj_owner_username AS owner,
-		       <? value("project") ?> AS type, NULL AS seq, NULL AS priority,
-		       prj_number || '-' || prj_name AS name,
-		       firstLine(prj_descrip) AS descrip,
-		       prj_status AS status,  prj_start_date AS start,
-           prj_due_date AS due, formatDate(prj_due_date) AS f_due,
-		       usr_username AS usr, NULL AS number, '' AS cust,
-           CASE WHEN (prj_status != 'C'AND
-                      prj_due_date < CURRENT_DATE) THEN 'expired'
-                WHEN (prj_status != 'C'AND
-                      prj_due_date > CURRENT_DATE) THEN 'future'
-           END AS due_qtforegroundrole
-		FROM prj LEFT OUTER JOIN usr ON (usr_id=prj_usr_id)
-		WHERE ((true)
-      <? if exists("startStartDate") ?>
-      AND (prj_start_date BETWEEN <? value("startStartDate") ?>
-		                             AND <? value("startEndDate") ?>)
-      <? endif ?>
-      <? if exists("dueStartDate") ?>
-      AND (prj_due_date BETWEEN <? value("dueStartDate") ?>
-		                             AND <? value("dueEndDate") ?>)
-      <? endif ?>
-		  <? if not exists("completed") ?>
-		  AND (prj_status != 'L')
-		  <? endif ?>
-		  <? if exists("usr_id") ?>
-		  AND (usr_id=<? value("usr_id") ?>)
-		  <? elseif exists("usr_pattern" ?>
-		  AND (usr_username ~ <? value("usr_pattern") ?>)
-		  <? endif ?>
-		       )
-		<? endif ?>
-		ORDER BY due, seq, usr;
---------------------------------------------------------------------

 QUERY: queryParams
 SELECT
   <? if exists("startStartDate") ?>
   formatDate(<? value("startStartDate") ?>) AS f_startStartDate,
   formatDate(<? value("startEndDate") ?>) AS f_startEndDate,
   <? else ?>
   'All' AS f_startStartDate,
   'All' AS f_startEndDate,
   <? endif ?>
   <? if exists("dueStartDate") ?>
   formatDate(<? value("dueStartDate") ?>) AS f_dueStartDate,
   formatDate(<? value("dueEndDate") ?>) AS f_dueEndDate,
   <? else ?>
   'All' AS f_dueStartDate,
   'All' AS f_dueEndDate,
   <? endif ?>
   <? if exists("completed") ?> 'Yes' <? else ?> 'No' <? endif ?> AS showClosed,
   <? if exists("projects") ?>    'Yes' <? else ?> 'No' <? endif ?> AS showTasks,
   <? if exists("incidents") ?> 'Yes' <? else ?> 'No' <? endif ?> AS showIncdts,
-  <? if exists("usr_id") ?>
-    usr_username FROM usr WHERE usr_id = <? value("usr_id") ?>
+  <? if exists("username") ?>
+    <? value("username") ?> AS usr_username
   <? elseif exists("usr_pattern") ?>
     <? value("usr_pattern") ?> AS usr_username
   <? else ?>
     'All' AS usr_username
   <? endif ?>
 ;

 --------------------------------------------------------------------
 REPORT: TrialBalances
 QUERY: detail
 SELECT accnt_id,
        period_id,
        formatDate(period_start) AS f_start,
        formatDate(period_end) AS f_end,
        formatGLAccount(accnt_id) AS f_account,
        accnt_descrip,
        formatMoney(abs(trialbal_beginning)) AS f_beginning,
        CASE WHEN(trialbal_beginning>0) THEN text('CR')
             ELSE text('')
        END AS f_beginningcr,
        formatMoney(trialbal_debits) AS f_debits,
        formatMoney(trialbal_credits) AS f_credits,
        formatMoney(abs(trialbal_debits - trialbal_credits)) AS f_diff,
        CASE WHEN((trialbal_debits - trialbal_credits) < 0) THEN text('CR')
             ELSE text('')
        END AS f_diffcr,
        formatMoney(abs(trialbal_ending)) AS f_ending,
        CASE WHEN(trialbal_ending>0) THEN text('CR')
             ELSE text('')
        END AS f_endingcr
   FROM trialbal, accnt, period
  WHERE ((trialbal_accnt_id=accnt_id)
    AND (trialbal_period_id=period_id)
 <? if exists("accnt_id") ?>
    AND (trialbal_accnt_id=<? value("accnt_id") ?>)
 <? endif ?>
 <? if exists("period_id") ?>
    AND (period_id=<? value("period_id") ?>)
 <? endif ?>
+<? if not exists("showZero") ?>
+   AND (abs(trialbal_beginning)+abs(trialbal_ending)+abs(trialbal_debits)+abs(trialbal_credits) > 0)
+<? endif ?>
        )
 ORDER BY period_start, formatGLAccount(accnt_id);

 --------------------------------------------------------------------
 REPORT: UninvoicedReceipts
 QUERY: detail
-SELECT porecv_id,
-       formatDate(porecv_date) as f_date,
-       getUsername(porecv_trans_usr_id) as f_user,
-       porecv_ponumber AS f_ponumber, poitem_linenumber,
+SELECT recv_id,
+       formatDate(recv_date) as f_date,
+       recv_trans_usr_name as f_user,
+       recv_order_number AS f_ponumber, poitem_linenumber,
        vend_name,
-       COALESCE(item_number, ('Misc. - ' || porecv_vend_item_number)) AS item_number,
-       formatQty(porecv_qty) as f_qty,
+       COALESCE(item_number, ('Misc. - ' || recv_vend_item_number)) AS item_number,
+       formatQty(recv_qty) as f_qty,
        'Receipt' AS f_type,
-       porecv_value AS value,
-       formatMoney(porecv_value) AS f_value
-  FROM porecv
-    LEFT OUTER JOIN itemsite ON (porecv_itemsite_id=itemsite_id)
+       recv_value AS value,
+       formatMoney(recv_value) AS f_value
+  FROM recv
+    LEFT OUTER JOIN itemsite ON (recv_itemsite_id=itemsite_id)
     LEFT OUTER JOIN item ON (itemsite_item_id=item_id),
     poitem, vend
- WHERE ((porecv_poitem_id=poitem_id)
-   AND  (porecv_vend_id=vend_id)
-   AND  (porecv_posted)
-   AND  (porecv_vohead_id IS NULL)
-   AND  (NOT porecv_invoiced)
+ WHERE ((recv_orderitem_id=poitem_id)
+   AND  (recv_order_type='PO')
+   AND  (recv_vend_id=vend_id)
+   AND  (recv_posted)
+   AND  (recv_vohead_id IS NULL)
+   AND  (NOT recv_invoiced)
 <? if exists("warehous_id") ?>
    AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("agentUsername") ?>
-   AND  (porecv_agent_username=<? value("agentUsername") ?>)
+   AND  (recv_agent_username=<? value("agentUsername") ?>)
 <? endif ?>
 )
 UNION
 SELECT poreject_id,
        formatDate(poreject_date) as f_date,
-       getUsername(poreject_trans_usr_id) as f_user,
+       poreject_trans_username as f_user,
        poreject_ponumber AS f_ponumber, poitem_linenumber,
        vend_name,
        COALESCE(item_number, ('Misc. - ' || poreject_vend_item_number)) AS item_number,
        formatQty(poreject_qty) as f_qty,
        'Return' AS f_type,
        poreject_value *-1 AS value,
        formatMoney(poreject_value*-1) AS f_value
   FROM poreject
     LEFT OUTER JOIN itemsite ON (poreject_itemsite_id=itemsite_id)
     LEFT OUTER JOIN item ON (itemsite_item_id=item_id),
     poitem, vend
  WHERE ((poreject_poitem_id=poitem_id)
 --   AND  (poreject_itemsite_id=itemsite_id)
 --   AND  (itemsite_item_id=item_id)
    AND  (poreject_vend_id=vend_id)
    AND  (poreject_posted)
    AND  (NOT poreject_invoiced)
 <? if exists("warehous_id") ?>
    AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("agentUsername") ?>
    AND  (poreject_agent_username=<? value("agentUsername") ?>)
 <? endif ?>
 )
 ORDER BY f_ponumber, poitem_linenumber;

 --------------------------------------------------------------------
 REPORT: WOMaterialAvailabilityByWorkOrder
 QUERY: head
 SELECT formatWONumber(wo_id) AS wonumber,
        warehous_code as warehouse,
        item_number, item_descrip1, item_descrip2, uom_name,
-       wo_status AS status
+       wo_status AS status,
+       <? if exists("onlyShowShortages") ?>
+         text('Only Show Shortages')
+       <? elseif exists("onlyShowInsufficientInventory") ?>
+         text('Only Show Insufficient Inventory')
+       <? else ?>
+         text('None')
+       <? endif ?>
+       AS filtertext
   FROM wo, itemsite, item, uom, warehous
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_id=<? value("wo_id") ?>) );
 --------------------------------------------------------------------

 QUERY: detail
 SELECT item_number, item_descrip1, item_descrip2, uom_name,
                formatQty(qoh) AS adjqoh,
                formatQty(wobalance) AS woalloc,
                formatQty(allocated) AS totalalloc,
                formatQty(ordered) AS ordered,
                formatQty(qoh + ordered - wobalance) AS woavail,
                formatQty(qoh + ordered - allocated) AS totalavail
    FROM (SELECT item_number, item_descrip1, item_descrip2,
                 uom_name,
                 noNeg(itemsite_qtyonhand) AS qoh,
                 noNeg(womatl_qtyreq - womatl_qtyiss) AS wobalance,
                 qtyAllocated(itemsite_id, womatl_duedate) AS allocated,
                 qtyOrdered(itemsite_id, womatl_duedate) AS ordered
            FROM wo, womatl, itemsite, item, uom
           WHERE ((womatl_wo_id=wo_id)
              AND (womatl_itemsite_id=itemsite_id)
              AND (itemsite_item_id=item_id)
              AND (womatl_uom_id=uom_id)
              AND (womatl_wo_id=<? value("wo_id") ?>))
         ) AS data
 <? if exists("onlyShowShortages") ?>
  WHERE ( ((qoh + ordered - allocated) < 0) OR ((qoh + ordered - wobalance) < 0) )
 <? endif ?>
+<? if exists("onlyShowInsufficientInventory") ?>
+   WHERE ( ((qoh - allocated) < 0)OR ((qoh - wobalance) < 0) )
+<? endif ?>
 ORDER BY item_number;