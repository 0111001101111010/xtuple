--------------------------------------------------------------------
REMOVED REPORTS:
ItemImage
--------------------------------------------------------------------
NEW REPORTS:
APApplications
CustOrderAcknowledgement
FreightClassesMasterList
FreightPricesByCustomer
FreightPricesByCustomerType
ItemImage
TodoItem
VendorInformation
--------------------------------------------------------------------
CHANGED REPORTS:
APOpenItemsByVendor
ARAging
AddressesMasterList
CheckRegister
CreditMemo
CurrencyConversionList
FinancialReportMonth
FinancialReportMonthBudget
FinancialReportMonthDbCr
FinancialReportMonthPriorMonth
FinancialReportMonthPriorQuarter
FinancialReportMonthPriorYear
FinancialReportMonthQuarter
FinancialReportMonthYear
FinancialReportQuarter
FinancialReportQuarterBudget
FinancialReportQuarterPriorQuarter
FinancialReportYear
FinancialReportYearBudget
FinancialReportYearPriorYear
GLTransactions
IncidentsByCRMAccount
InventoryAvailabilityByCustomerType
InventoryAvailabilityByItem
Invoice
ItemMaster
MaterialUsageVarianceByBOMItem
MaterialUsageVarianceByComponentItem
MaterialUsageVarianceByItem
MaterialUsageVarianceByWarehouse
MaterialUsageVarianceByWorkOrder
PackingList-Shipment
PackingListBatchEditList
PurchaseReqsByPlannerCode
PurchaseRequestsByItem
Quote
RunningAvailability
SalesHistoryByBilltoName
SalesHistoryByParameterList
SelectPaymentsList
SelectedPaymentsList
ShipmentsByDate
StandardBOL
SummarizedBacklogByWarehouse
TimePhasedStatisticsByItem
TodoByUserAndIncident
TodoList
UnappliedAPCreditMemos
UninvoicedReceipts
ViewAPCheckRunEditList


 --------------------------------------------------------------------
 REPORT: APOpenItemsByVendor
 QUERY: head
 SELECT vend_name,
        vend_number,
+       currConcat(baseCurrId()) AS baseCurr,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        formatDate(<? value("asofDate") ?>) AS asofDate
   FROM vend
  WHERE (vend_id=<? value("vend_id") ?>);
 --------------------------------------------------------------------

 QUERY: detail
 SELECT apopen_id, apopen_ponumber, apopen_docnumber,
-       CASE WHEN (apopen_doctype='C') THEN text('C/M')
-            WHEN (apopen_doctype='D') THEN text('D/M')
-            WHEN (apopen_doctype='V') THEN text('Voucher')
-            ELSE text('Other')
+                    CASE WHEN (apopen_doctype='C') THEN <? value("creditMemo") ?>
+                         WHEN (apopen_doctype='D') THEN <? value("debitMemo") ?>
+                         WHEN (apopen_doctype='V') THEN <? value("voucher") ?>
+                         ELSE <? value("other") ?>
        END AS f_doctype,
+                    apopen_invcnumber AS invoicenumber,
        formatDate(apopen_docdate) AS f_docdate,
        formatDate(apopen_duedate) AS f_duedate,
        formatMoney(apopen_amount) AS f_amount,
-       formatMoney(apapplied(apopen_id,<? value("asofDate") ?>)) AS f_paid,
-       CASE WHEN (apopen_doctype='C') THEN formatMoney((apopen_amount - apapplied(apopen_id,<? value("asofDate") ?>)) * -1)
-            WHEN (apopen_doctype IN ('V', 'D')) THEN formatMoney(apopen_amount -apapplied(apopen_id,<? value("asofDate") ?>))
-            ELSE formatMoney(apopen_amount - apapplied(apopen_id,<? value("asofDate") ?>))
-       END AS f_balance,
-       CASE WHEN (apopen_doctype='C') THEN ((apopen_amount - apapplied(apopen_id,<? value("asofDate") ?>)) * -1)
-            WHEN (apopen_doctype IN ('V', 'D')) THEN (apopen_amount - apapplied(apopen_id,<? value("asofDate") ?>))
-            ELSE (apopen_amount - apapplied(apopen_id,<? value("asofDate") ?>))
-       END AS balance
+                    formatMoney(apopen_paid - COALESCE(SUM(apapply_target_paid),0)) AS f_paid,
+                    formatMoney((apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0)) *
+                    CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
+                    END) AS f_balance,
+                    currConcat(apopen_curr_id) AS currAbbr,
+                    (apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0))
+                    / round(apopen_curr_rate,5) * (CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
+                         END) AS base_balance,
+                    formatMoney((apopen_amount - apopen_paid + COALESCE(SUM(apapply_target_paid),0))
+                    / round(apopen_curr_rate,5) * (CASE WHEN apopen_doctype IN ('D', 'V') THEN 1 ELSE -1
+                         END)) AS f_base_balance
   FROM apopen
+               LEFT OUTER JOIN apapply ON (((apopen_id=apapply_target_apopen_id)
+                                       OR (apopen_id=apapply_source_apopen_id))
+                                       AND (apapply_postdate > <? value("asofDate") ?>))
   WHERE ( (COALESCE(apopen_closedate,date <? value("asofDate") ?> + integer '1')><? value("asofDate") ?>)
         AND   (apopen_docdate<=<? value("asofDate") ?>)
         AND   (apopen_vend_id=<? value("vend_id") ?>)
-        AND   (apopen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-        AND   ((currtobase(apopen_curr_id,apopen_amount,<? value("asofDate") ?>) - apapplied(apopen_id,<? value("asofDate") ?>)) > 0))
-ORDER BY apopen_docdate;
+                AND   (apopen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
+              GROUP BY apopen_id, apopen_ponumber, apopen_docnumber,apopen_doctype, apopen_invcnumber, apopen_docdate,
+                apopen_duedate, apopen_docdate, apopen_amount, apopen_paid, apopen_curr_id, apopen_curr_rate
+              ORDER BY apopen_docdate;


 --------------------------------------------------------------------
 REPORT: ARAging
 QUERY: detail
 SELECT
 	araging_docdate,
 	araging_duedate,
 	araging_ponumber,
 	araging_docnumber,
 	araging_doctype,
 	araging_cust_id,
 	araging_cust_number,
 	araging_cust_name,
 	araging_cust_custtype_id,
 	araging_custtype_code,
 	araging_terms_descrip,
 	formatMoney(araging_aropen_amount) AS araging_aropen_amount,
 	araging_cur_val,   formatMoney(araging_cur_val)    AS araging_cur_amt,
 	araging_thirty_val,formatMoney(araging_thirty_val) AS araging_thirty_amt,
 	araging_sixty_val, formatMoney(araging_sixty_val)  AS araging_sixty_amt,
 	araging_ninety_val,formatMoney(araging_ninety_val) AS araging_ninety_amt,
 	araging_plus_val,  formatMoney(araging_plus_val)   AS araging_plus_amt,
 	araging_total_val, formatMoney(araging_total_val)  AS araging_total_amt
-FROM araging(<? value("relDate") ?>)
+FROM araging(<? value("relDate") ?>, <? value("useDocDate") ?>)
 <? if exists("cust_id") ?>
    WHERE (araging_cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
    WHERE (araging_cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    WHERE (araging_custtype_code ~ <? value("custtype_pattern") ?>)
 <? endif ?>;


 --------------------------------------------------------------------
 REPORT: AddressesMasterList
 QUERY: detail
 SELECT 'Contact' AS type, cntct_first_name AS first,
        cntct_last_name AS last, crmacct_number, cntct_phone AS phone,
        cntct_email AS email, cntct_fax AS fax, addr.*
 FROM addr, cntct LEFT OUTER JOIN crmacct ON (cntct_crmacct_id=crmacct_id)
 WHERE (cntct_addr_id=addr_id)
   <? if exists("activeOnly") ?> AND addr_active <? endif ?>
 UNION
 SELECT 'Ship-To' AS type, shipto_num AS first,
        shipto_name AS last, crmacct_number, '' AS phone,
        '' AS email, '' AS fax, addr.*
 FROM addr, shiptoinfo LEFT OUTER JOIN crmacct ON (shipto_cust_id=crmacct_cust_id
 )
 WHERE (shipto_addr_id=addr_id)
   <? if exists("activeOnly") ?> AND addr_active <? endif ?>
 UNION
 SELECT 'Vendor' AS type, vend_number AS first,
        vend_name AS last, crmacct_number, '' AS phone,
        '' AS email, '' AS fax, addr.*
 FROM addr, vendinfo LEFT OUTER JOIN crmacct ON (vend_id=crmacct_vend_id)
 WHERE (vend_addr_id=addr_id)
   <? if exists("activeOnly") ?> AND addr_active <? endif ?>
 UNION
 SELECT 'Vendor Address' AS type, vendaddr_code AS first,
        vendaddr_name AS last, crmacct_number, '' AS phone,
        '' AS email, '' AS fax, addr.*
 FROM addr, vendaddrinfo LEFT OUTER JOIN crmacct ON (vendaddr_vend_id=crmacct_vend_id)
 WHERE (vendaddr_addr_id=addr_id)
   <? if exists("activeOnly") ?> AND addr_active <? endif ?>
 UNION
 SELECT 'Site' AS type, warehous_code AS first,
        warehous_descrip AS last, '' AS crmacct_number, '' AS phone,
        '' AS email, '' AS fax, addr.*
 FROM addr, whsinfo
 WHERE (warehous_addr_id=addr_id)
   <? if exists("activeOnly") ?> AND addr_active <? endif ?>

 UNION
 SELECT '' AS type, '' AS first, '' AS last,
        '' AS crmacct_number, '' AS phone,
        '' AS email,
        '' AS fax, addr.*
 FROM addr
 WHERE addr_id NOT IN (
-            SELECT cntct_addr_id FROM cntct
-            UNION SELECT shipto_addr_id FROM shiptoinfo
-            UNION SELECT vend_addr_id FROM vendinfo
-            UNION SELECT vendaddr_addr_id FROM vendaddrinfo
-            UNION SELECT warehous_addr_id FROM whsinfo)
+            SELECT cntct_addr_id FROM cntct WHERE (cntct_addr_id IS NOT NULL)
+            UNION SELECT shipto_addr_id FROM shiptoinfo WHERE (shipto_addr_id IS NOT NULL)
+            UNION SELECT vend_addr_id FROM vendinfo WHERE (vend_addr_id IS NOT NULL)
+            UNION SELECT vendaddr_addr_id FROM vendaddrinfo WHERE (vendaddr_addr_id IS NOT NULL)
+            UNION SELECT warehous_addr_id FROM whsinfo WHERE (warehous_addr_id IS NOT NULL))
 <? if exists("activeOnly") ?> AND addr_active <? endif ?>
 ORDER BY addr_country, addr_state, addr_city,
          addr_postalcode, addr_line1, addr_line2,
          addr_line3, type, last, first;


 --------------------------------------------------------------------
 REPORT: CheckRegister
 QUERY: detail
 SELECT checkhead_id AS checkid,
        CASE WHEN(checkhead_void) THEN -1
             WHEN(checkhead_posted) THEN 1
             ELSE 0
        END AS extra,
        -1 AS checkitem_id,
        formatBoolYN(checkhead_void) AS f_void,
        formatBoolYN(checkhead_misc) AS f_misc,
        formatBoolYN(checkhead_printed) AS f_printed,
        formatBoolYN(checkhead_posted) AS f_posted,
        CASE when checkhead_number = -1 THEN
          'Unspecified'
        ELSE TEXT(checkhead_number) END AS number,
        COALESCE(checkrecip_number || '-' || checkrecip_name,
 		checkhead_recip_type || '-' || checkhead_recip_id ) AS description,
        formatDate(checkhead_checkdate) AS f_checkdate,
        formatMoney(checkhead_amount) AS f_amount,
        currConcat(checkhead_curr_id) AS currAbbr,
        checkhead_number,
+       checkhead_ach_batch,
        1 AS orderby
   FROM checkhead LEFT OUTER JOIN
        checkrecip ON ((checkhead_recip_id=checkrecip_id)
 		 AND  (checkhead_recip_type=checkrecip_type))
  WHERE ((checkhead_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
    <? if exists("check_number") ?>
       AND   (CAST(checkhead_number AS text) ~ <? value("check_number") ?>)
    <? endif ?>
    <? if exists("recip") ?>
       <? if exists("recip_type_v") ?>
 	 AND   (checkhead_recip_type = 'V' )
       <? endif ?>
       <? if exists("recip_type_c") ?>
 	 AND   (checkhead_recip_type = 'C' )
       <? endif ?>
       <? if exists("recip_type_t") ?>
 	 AND   (checkhead_recip_type = 'T' )
       <? endif ?>
       <? if exists("recip_id") ?>
 	 AND   (checkhead_recip_id = <? value("recip_id") ?> )
       <? endif ?>
    <? endif ?>
    )
 <? if exists("showDetail") ?>
 UNION
 SELECT checkitem_checkhead_id AS checkid, 0 AS extra, checkitem_id,
        '' AS f_void, '' AS f_misc, '' AS f_printed, '' AS f_posted,
        checkitem_vouchernumber AS number,
        checkitem_invcnumber AS description,
        '' AS f_checkdate,
        formatMoney(checkitem_amount) AS f_amount,
        currConcat(checkitem_curr_id) AS currAbbr,
        checkhead_number,
+       NULL,
        2 AS orderby
   FROM checkitem, checkhead
  WHERE ( (checkitem_checkhead_id=checkhead_id)
    AND   (checkhead_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
       <? if exists("check_number") ?>
       AND   (CAST(checkhead_number AS text) ~ <? value("check_number") ?>)
    <? endif ?>
    <? if exists("recip") ?>
       <? if exists("recip_type_v") ?>
          AND   (checkhead_recip_type = 'V' )
       <? endif ?>
       <? if exists("recip_type_c") ?>
          AND   (checkhead_recip_type = 'C' )
       <? endif ?>
       <? if exists("recip_type_t") ?>
          AND   (checkhead_recip_type = 'T' )
       <? endif ?>
       <? if exists("recip_id") ?>
          AND   (checkhead_recip_id = <? value("recip_id") ?> )
       <? endif ?>
    <? endif ?> )
 <? endif ?>
  ORDER BY checkhead_number, checkid, orderby;


 --------------------------------------------------------------------
 REPORT: CreditMemo
 QUERY: GroupHead
 SELECT remitto.*,
        cmhead_number,
        formatDate(cmhead_docdate) AS docdate,
        cust_number,
        cust_name,
-       cust_address1,
-       cust_address2,
-       cust_address3,
-       (COALESCE(cust_city,'') || '  ' || COALESCE(cust_state,'') || '  ' || COALESCE(cust_zipcode,'')) AS cust_citystatezip,
+       formatAddr(cmhead_billtoaddress1, cmhead_billtoaddress2, cmhead_billtoaddress3,
+                  COALESCE(cmhead_billtocity,'') || '  ' || COALESCE(cmhead_billtostate,'') || '  ' || COALESCE(cmhead_billtozip,''),
+                   cmhead_billtocountry)
+       AS f_custaddr,
        cust_phone,
        cmhead_shipto_name,
-       cmhead_shipto_address1,
-       cmhead_shipto_address2,
-       cmhead_shipto_address3,
-       (COALESCE(cmhead_shipto_city,'') ||'  '|| COALESCE(cmhead_shipto_state,'') || '  '|| COALESCE(cmhead_shipto_zipcode,'')) AS shipto_citystatezip,
+       formatAddr(cmhead_shipto_address1, cmhead_shipto_address2, cmhead_shipto_address3,
+                  COALESCE(cmhead_shipto_city,'') ||'  '|| COALESCE(cmhead_shipto_state,'') || '  '|| COALESCE(cmhead_shipto_zipcode,''),
+                  cmhead_shipto_country)
+                  AS f_shiptoaddr,
        CASE
          WHEN (cmhead_invcnumber='-1') THEN ''
-         ELSE cmhead_invcnumber
+         --note: must now set explicit type for Postgres 8.3+
+         --add ' '
+         ELSE text(cmhead_invcnumber)
        END AS invcnumber,
        cmhead_custponumber,
        cmhead_comments,
        cmhead_misc_descrip,
-       currconcat(cmhead_curr_id) AS currabbr
-  FROM remitto, cmhead, cust
+       curr_symbol,
+       curr_name
+  FROM remitto, cmhead, cust, curr_symbol
  WHERE ((cmhead_cust_id=cust_id)
+       AND (cmhead_curr_id = curr_id)
    AND (cmhead_id=%1))
 ORDER BY cmhead_number;
 --------------------------------------------------------------------

+QUERY: logo
+SELECT image_data
+FROM image
+WHERE ((image_name='logo'));

 --------------------------------------------------------------------
 REPORT: CurrencyConversionList
 QUERY: exchangeRates
-SELECT
-	currConcat(curr_id) AS currConcat,
-	curr_rate,
-	curr_effective, curr_expires
-FROM	curr_symbol NATURAL JOIN curr_rate
-WHERE	curr_base = FALSE
-ORDER BY currConcat, curr_effective;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonth
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_month <> formatMoney(0)) OR  (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_month <> 0) OR  (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthBudget
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_month <> formatMoney(0)) OR (flstmtitem_monthbudget <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_month <> 0) OR (flstmtitem_monthbudget <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthDbCr
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_monthdb <> formatMoney(0)) OR (flstmtitem_monthcr <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_monthdb <> 0) OR (flstmtitem_monthcr <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthPriorMonth
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_month <> formatMoney(0)) OR (flstmtitem_prmonth <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_month <> 0) OR (flstmtitem_prmonth <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthPriorQuarter
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_month <> formatMoney(0)) OR (flstmtitem_prqtr <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_month <> 0) OR (flstmtitem_prqtr <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthPriorYear
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_month <> formatMoney(0)) OR (flstmtitem_pryear <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_month <> 0) OR (flstmtitem_pryear <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthQuarter
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_month <> formatMoney(0)) OR (flstmtitem_qtr <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_month <> 0) OR (flstmtitem_qtr <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportMonthYear
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_month <> formatMoney(0)) OR (flstmtitem_year <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_month <> 0) OR (flstmtitem_year <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportQuarter
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_qtr <> formatMoney(0)) OR  (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_qtr <> 0) OR  (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportQuarterBudget
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_qtr <> formatMoney(0)) OR (flstmtitem_qtrbudget <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_qtr <> 0) OR (flstmtitem_qtrbudget <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportQuarterPriorQuarter
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_qtr <> formatMoney(0)) OR (flstmtitem_prqtr <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_qtr <> 0) OR (flstmtitem_prqtr <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportYear
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_year <> formatMoney(0)) OR  (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_year <> 0) OR  (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportYearBudget
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_year <> formatMoney(0)) OR (flstmtitem_yearbudget <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_year <> 0) OR (flstmtitem_yearbudget <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: FinancialReportYearPriorYear
 QUERY: detail
 SELECT
     flstmtitem_flhead_id,
     flstmtitem_period_id,
     flstmtitem_username,
     flstmtitem_order,
     flstmtitem_level,
     flstmtitem_subgrp,
     flstmtitem_type,
     flstmtitem_type_id,
     flstmtitem_parent_id,
     flstmtitem_accnt_id,
     flstmtitem_name,
-    flstmtitem_month,
-    flstmtitem_monthdb,
-    flstmtitem_monthcr,
-    flstmtitem_monthprcnt,
-    flstmtitem_monthbudget,
-    flstmtitem_monthbudgetprcnt,
-    flstmtitem_monthbudgetdiff,
-    flstmtitem_monthbudgetdiffprcnt,
-    flstmtitem_qtr,
-    flstmtitem_qtrdb,
-    flstmtitem_qtrcr,
-    flstmtitem_qtrprcnt,
-    flstmtitem_qtrbudget,
-    flstmtitem_qtrbudgetprcnt,
-    flstmtitem_qtrbudgetdiff,
-    flstmtitem_qtrbudgetdiffprcnt,
-    flstmtitem_year,
-    flstmtitem_yeardb,
-    flstmtitem_yearcr,
-    flstmtitem_yearprcnt,
-    flstmtitem_yearbudget,
-    flstmtitem_yearbudgetprcnt,
-    flstmtitem_yearbudgetdiff,
-    flstmtitem_yearbudgetdiffprcnt,
-    flstmtitem_prmonth,
-    flstmtitem_prmonthprcnt,
-    flstmtitem_prmonthdiff,
-    flstmtitem_prmonthdiffprcnt,
-    flstmtitem_prqtr,
-    flstmtitem_prqtrprcnt,
-    flstmtitem_prqtrdiff,
-    flstmtitem_prqtrdiffprcnt,
-    flstmtitem_pryear,
-    flstmtitem_pryearprcnt,
-    flstmtitem_pryeardiff,
-    flstmtitem_pryeardiffprcnt
+    formatMoney(flstmtitem_month) AS flstmtitem_month,
+    formatMoney(flstmtitem_monthdb) AS flstmtitem_monthdb,
+    formatMoney(flstmtitem_monthcr) AS flstmtitem_monthcr,
+    formatPrcnt(flstmtitem_monthprcnt) AS flstmtitem_monthprcnt,
+    formatMoney(flstmtitem_monthbudget) AS flstmtitem_monthbudget,
+    formatPrcnt(flstmtitem_monthbudgetprcnt) AS flstmtitem_monthbudgetprcnt,
+    formatMoney(flstmtitem_monthbudgetdiff) AS flstmtitem_monthbudgetdiff,
+    formatPrcnt(flstmtitem_monthbudgetdiffprcnt) AS flstmtitem_monthbudgetdiffprcnt,
+    formatMoney(flstmtitem_qtr) AS flstmtitem_qtr,
+    formatMoney(flstmtitem_qtrdb) AS flstmtitem_qtrdb,
+    formatMoney(flstmtitem_qtrcr) AS flstmtitem_qtrcr,
+    formatPrcnt(flstmtitem_qtrprcnt) AS flstmtitem_qtrprcnt,
+    formatMoney(flstmtitem_qtrbudget) AS flstmtitem_qtrbudget,
+    formatPrcnt(flstmtitem_qtrbudgetprcnt) AS flstmtitem_qtrbudgetprcnt,
+    formatMoney(flstmtitem_qtrbudgetdiff) AS flstmtitem_qtrbudgetdiff,
+    formatPrcnt(flstmtitem_qtrbudgetdiffprcnt) AS flstmtitem_qtrbudgetdiffprcnt,
+    formatMoney(flstmtitem_year) AS flstmtitem_year,
+    formatMoney(flstmtitem_yeardb) AS flstmtitem_yeardb,
+    formatMoney(flstmtitem_yearcr) AS flstmtitem_yearcr,
+    formatPrcnt(flstmtitem_yearprcnt) AS flstmtitem_yearprcnt,
+    formatMoney(flstmtitem_yearbudget) AS flstmtitem_yearbudget,
+    formatPrcnt(flstmtitem_yearbudgetprcnt) AS flstmtitem_yearbudgetprcnt,
+    formatMoney(flstmtitem_yearbudgetdiff) AS flstmtitem_yearbudgetdiff,
+    formatPrcnt(flstmtitem_yearbudgetdiffprcnt) AS flstmtitem_yearbudgetdiffprcnt,
+    formatMoney(flstmtitem_prmonth) AS flstmtitem_prmonth,
+    formatPrcnt(flstmtitem_prmonthprcnt) AS flstmtitem_prmonthprcnt,
+    formatMoney(flstmtitem_prmonthdiff) AS flstmtitem_prmonthdiff,
+    formatPrcnt(flstmtitem_prmonthdiffprcnt) AS flstmtitem_prmonthdiffprcnt,
+    formatMoney(flstmtitem_prqtr) AS flstmtitem_prqtr,
+    formatPrcnt(flstmtitem_prqtrprcnt) AS flstmtitem_prqtrprcnt,
+    formatMoney(flstmtitem_prqtrdiff) AS flstmtitem_prqtrdiff,
+    formatPrcnt(flstmtitem_prqtrdiffprcnt) AS flstmtitem_prqtrdiffprcnt,
+    formatMoney(flstmtitem_pryear) AS flstmtitem_pryear,
+    formatPrcnt(flstmtitem_pryearprcnt) AS flstmtitem_pryearprcnt,
+    formatMoney(flstmtitem_pryeardiff) AS flstmtitem_pryeardiff,
+    formatPrcnt(flstmtitem_pryeardiffprcnt) AS flstmtitem_pryeardiffprcnt
 FROM financialreport(<? value("flcol_id") ?>,<? value("period_id") ?>,
 <? if exists("shownumbers") ?>
   true
 <? else ?>
   false
 <? endif ?>
 ,True)
 <? if not exists("showzeros") ?>
-  WHERE ((flstmtitem_year <> formatMoney(0)) OR (flstmtitem_pryear <> formatMoney(0)) OR (flstmtitem_type <> 'I'))
+  WHERE ((flstmtitem_year <> 0) OR (flstmtitem_pryear <> 0) OR (flstmtitem_type <> 'I'))
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: GLTransactions
 QUERY: detail
-SELECT gltrans_id,
-       formatDate(gltrans_date) AS transdate,
-       gltrans_source,
-       gltrans_doctype,
-       gltrans_docnumber,
-       invhist_docnumber,
+
+  SELECT gltrans_id,
+       gltrans_created, formatDate(gltrans_date) AS transdate,
+       gltrans_source, gltrans_doctype, gltrans_docnumber, invhist_docnumber,
        firstLine(gltrans_notes) AS transnotes,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
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
 --
+       gltrans_amount,
        formatBoolYN(gltrans_posted) AS f_posted,
-       <? if exists("showUsernames") ?>
-         gltrans_username
-       <? else ?>
-         text('')
-       <? endif ?>
-       AS f_username
+       gltrans_username AS f_username,
+       gltrans_sequence
   FROM gltrans JOIN accnt ON (gltrans_accnt_id=accnt_id)
        LEFT OUTER JOIN invhist ON (gltrans_misc_id=invhist_id AND gltrans_docnumber='Misc.')
  WHERE ((gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("accnt_id") ?>
    AND (gltrans_accnt_id=<? value("accnt_id") ?>)
 <? endif ?>
 <? if exists("source") ?>
    AND (gltrans_source=<? value("source") ?>)
 <? endif ?>
        )
-ORDER BY gltrans_created DESC, gltrans_sequence, gltrans_amount;
+  <? if exists("beginningBalance") ?>
+  UNION SELECT -1,
+        <? value("startDate") ?>, formatDate(<? value("startDate") ?>),
+        '', '', '', '',
+        'Beginning Balance',
+        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip),
+        CASE WHEN (<? value("beginningBalance") ?> < 0) THEN
+                      formatMoney(ABS(<? value("beginningBalance") ?>))
+             ELSE ''
+        END,
+        CASE WHEN (<? value("beginningBalance") ?> < 0) THEN
+                      ABS(<? value("beginningBalance") ?>)
+             ELSE 0
+        END,
+
+        CASE WHEN (<? value("beginningBalance") ?> > 0) THEN
+                      formatMoney(ABS(<? value("beginningBalance") ?>))
+             ELSE ''
+        END,
+        CASE WHEN (<? value("beginningBalance") ?> > 0) THEN
+                      ABS(<? value("beginningBalance") ?>)
+             ELSE 0
+        END,
+        <? value("beginningBalance") ?> * -1,
+        <? value("beginningBalance") ?>,
+        NULL,
+        NULL,
+        -1
+  FROM accnt
+  WHERE (accnt_id=<? value("accnt_id") ?>)
+ORDER BY gltrans_created <? if not exists("beginningBalance") ?> DESC <? endif ?>,
+        gltrans_sequence, gltrans_amount;


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
-       COALESCE(TEXT(todoitem_seq), '') AS todoitem_seq,
        todoitem_due_date, todoitem_name,
        COALESCE(usr_username, '') AS todoitem_usrname,
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
       LEFT OUTER JOIN usr ON (usr_id = todoitem_usr_id)
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
 REPORT: InventoryAvailabilityByCustomerType
 QUERY: detail
 SELECT itemsite_id, coitem_id,
        cohead_id, cohead_number, (cust_number||'-'||cust_name) AS custname,
        item_number, item_description, uom_name, item_picklist,
        qoh, formatQty(qoh) AS f_qoh,sobalance,
        formatQty(sobalance) AS f_sobalance,
        formatQty(allocated) AS f_allocated,
        ordered, formatQty(ordered) AS f_ordered,
        (qoh + ordered - sobalance) AS woavail,
 <? if exists("useReservationNetting") ?>
        formatQty(coitem_qtyreserved) AS f_soavail,
 <? else ?>
        formatQty(qoh + ordered - sobalance) AS f_soavail,
 <? endif ?>
        (qoh + ordered - allocated) AS totalavail,
        formatQty(qoh + ordered - allocated) AS f_totalavail,
        atshipping,formatQty(atshipping) AS f_atshipping,
        reorderlevel
 <? if exists(showWoSupply) ?>,
        wo_id,
        wo_status,
        wo_number,
        wo_ordered,
        CASE WHEN (wo_id = -1) THEN NULL ELSE formatQty(wo_ordered) END AS f_wo_ordered,
        formatdate(wo_startdate) AS f_wo_startdate,
        formatdate(wo_duedate) AS f_wo_duedate,
        COALESCE(wo_latestart,false) AS wo_latestart,
        COALESCE(wo_latedue,false) AS wo_latedue
 <? endif ?>
        FROM ( SELECT itemsite_id, coitem_id,
                      cohead_id, cohead_number, cust_number, cust_name,
                      item_number, (item_descrip1 || ' ' || item_descrip2) AS item_description,
                      uom_name, item_picklist,
                      noNeg(itemsite_qtyonhand) AS qoh,
                      noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) AS sobalance,
                      qtyAllocated(itemsite_id, coitem_scheddate) AS allocated,
                      qtyOrdered(itemsite_id, coitem_scheddate) AS ordered,
                      qtyatshipping(coitem_id) AS atshipping,
+                     coitem_qtyreserved,
                      CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel
 <? if exists(showWoSupply) ?>,
                      COALESCE(wo_id,-1) AS wo_id,
                      formatwonumber(wo_id) AS wo_number,
                      noNeg((wo_qtyord-wo_qtyrcv)) AS wo_ordered,
                      wo_status, wo_startdate, wo_duedate,
                      ((wo_startdate <= CURRENT_DATE) AND (wo_status IN ('O','E','S','R'))) AS wo_latestart,
                      (wo_duedate<=CURRENT_DATE) AS wo_latedue
 <? endif ?>
                 FROM cohead, itemsite, item, uom, cust, coitem
 <? if exists(showWoSupply) ?>
                 LEFT OUTER JOIN wo
                   ON ((coitem_itemsite_id=wo_itemsite_id)
                   AND (wo_status IN ('E','R','I'))
                   AND (wo_qtyord-wo_qtyrcv > 0)
                   AND (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned-qtyatshipping(coitem_id)) >
                         (SELECT itemsite_qtyonhand FROM itemsite WHERE (itemsite_id=coitem_itemsite_id))))
 <? endif ?>
                 WHERE((coitem_cohead_id=cohead_id)
                   AND (cohead_cust_id=cust_id)
                   AND (coitem_itemsite_id=itemsite_id)
                   AND (itemsite_item_id=item_id)
                   AND (item_inv_uom_id=uom_id)
                   AND (coitem_status NOT IN ('C', 'X'))
 <? if exists("custtype_id") ?>
                   AND (cust_custtype_id=<? value(\"custtype_id\") ?>)"
 <? elseif exists("custtype_pattern") ?>
                   AND (cust_custtype_id IN (SELECT custtype_id
                                               FROM custtype
                                              WHERE(custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
               )
             ) AS data
 <? if exists(onlyShowShortages) ?>
       WHERE ( ((qoh + ordered - allocated) < 0)
            OR ((qoh + ordered - sobalance) < 0) )
 <? endif ?>
       ORDER BY cohead_id, cohead_number, item_number
 <? if exists(showWoSupply) ?> ,
                wo_duedate
 <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: InventoryAvailabilityByItem
 QUERY: detail
 SELECT warehous_code,
        itemsite_leadtime,
        formatQty(qtyonhand) AS f_qtyonhand,
        formatQty(noNeg(qtyonhand - allocated)) AS f_unallocated,
        formatQty(noNeg(allocated)) AS f_allocated,
        formatQty(ordered) AS f_ordered,
        formatQty(reorderlevel) AS f_reorderlevel,
        (qtyonhand - allocated + ordered) AS available,
        formatQty(qtyonhand - allocated + ordered) AS f_available
   FROM (SELECT warehous_code, itemsite_leadtime,
                CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel,
                itemsite_qtyonhand AS qtyonhand,
 <? if exists("byDays") ?>
                qtyAllocated(itemsite_id, <? value("byDays") ?>) AS allocated,
                qtyOrdered(itemsite_id, <? value("byDays") ?>) AS ordered
 <? elseif exists("byDate") ?>
                qtyAllocated(itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) AS allocated,
                qtyOrdered(itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) AS ordered
 <? elseif exists("byDates") ?>
                qtyAllocated(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>) AS allocated,
                qtyOrdered(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>) AS ordered
 <? else ?>
                qtyAllocated(itemsite_id, itemsite_leadtime) AS allocated,
                qtyOrdered(itemsite_id, itemsite_leadtime) AS ordered
 <? endif ?>
           FROM itemsite, warehous, item
          WHERE ((itemsite_active)
            AND (itemsite_warehous_id=warehous_id)
            AND (itemsite_item_id=item_id)
            AND (item_id=<? value("item_id") ?>)
 <? if exists("warehous_id") ?>
            AND (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
            )
        ) AS data
 <? if exists("showReorder") ?>
- WHERE ( ((qoh - allocated + ordered) <= reorderlevel)
+ WHERE ( ((qtyonhand - allocated + ordered) <= reorderlevel)
   <? if exists("ignoreReorderAtZero") ?>
-   AND (NOT ( ((qoh - allocated + ordered) = 0) AND (reorderlevel = 0)) )
+   AND (NOT ( ((qtyonhand - allocated + ordered) = 0) AND (reorderlevel = 0)) )
   <? endif ?>
     )
 <? elseif exists("showShortages ?>
- WHERE ((qoh - allocated + ordered) < 0)
+ WHERE ((qtyonhand - allocated + ordered) < 0)
 <? endif ?>
 ORDER BY warehous_code DESC;


 --------------------------------------------------------------------
 REPORT: Invoice
 QUERY: Detail
 SELECT invcitem_linenumber,
        formatQty(invcitem_billed) AS f_billed,
        (select uom_name from uom where uom_id = invcitem_qty_uom_id) AS invuom,
        CASE WHEN (item_number IS NULL) THEN invcitem_number
             WHEN (invcitem_custpn != '') THEN invcitem_custpn
             else item_number
        END AS number,
        CASE WHEN (item_number IS NULL) THEN invcitem_descrip
             WHEN (invcitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip1
             ELSE item_descrip1
        END AS descrip1,
        CASE WHEN (invcitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip2
-            ELSE itemalias_descrip2
+            ELSE item_descrip2
        END AS descrip2,
-       formatPrice(invcitem_price / COALESCE(invcitem_price_invuomratio,1)) AS f_unitprice,
+       formatPrice(invcitem_qty_invuomratio * invcitem_price / COALESCE(invcitem_price_invuomratio,1)) AS f_unitprice,
        formatMoney(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2)) AS f_extprice,
        invcitem_notes,
        getInvcitemLotSerial(invcitem_id) AS lotserial,
 --Sub-select updated for 3.1 to support kitting
        characteristicsToString('SI',(SELECT coitem_id FROM coitem, cohead, invchead, itemsite
        WHERE (cohead_number=invchead_ordernumber and invchead_id=<? value("invchead_id") ?>
        and coitem_cohead_id=cohead_id
        and invcitem_item_id = item_id
        and coitem_itemsite_id = itemsite_id
        and itemsite_item_id = item_id
        and coitem_linenumber=invcitem_linenumber)
        ), '=', ', ')
        AS coitem_characteristics
 FROM invcitem LEFT OUTER JOIN (item JOIN uom ON (item_inv_uom_id=uom_id)) ON (invcitem_item_id=item_id) LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=invcitem_custpn)
 WHERE (invcitem_invchead_id=<? value("invchead_id") ?>)
 ORDER BY invcitem_linenumber;
 --------------------------------------------------------------------

 QUERY: GroupExtended
-SELECT formatMoney( noNeg(invchead_freight + invchead_misc_amount + invchead_tax +
-                       ( SELECT COALESCE(SUM(round(((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1))),2)), 0)
-                         FROM invcitem LEFT OUTER JOIN item ON (invcitem_item_id=item_id)
-                         WHERE (invcitem_invchead_id=<? value("invchead_id") ?>) )
-                    - total_allocated) ) AS f_totaldue,
+SELECT formatMoney( noNeg(invchead_freight + invchead_misc_amount +
+                          invchead_tax +
+                          COALESCE(SUM(ROUND(((invcitem_billed * invcitem_qty_invuomratio) *
+                                              (invcitem_price / COALESCE(invcitem_price_invuomratio,1))),2)), 0) -
+                          MAX(total_allocated)) ) AS f_totaldue,
        formatMoney(invchead_misc_amount) AS f_misc,
        formatMoney(invchead_tax) AS f_tax,
        formatMoney(invchead_freight) AS f_freight,
-       formatMoney(invchead_payment + (SELECT SUM(arapply_applied) AS applied
-                                       FROM arapply
-                                       LEFT OUTER JOIN invchead ON (arapply_target_docnumber = invchead_invcnumber)
-                                       WHERE (invchead_id = <? value("invchead_id") ?>)
-                                       AND (arapply_source_doctype = 'K'))) AS f_payment,
-       formatMoney(total_allocated) AS f_allocated,
+      formatMoney(invchead_payment +
+                  (SELECT COALESCE(SUM(arapply_applied), 0) AS applied
+                   FROM arapply LEFT OUTER JOIN
+                        invchead ON (arapply_target_docnumber = invchead_invcnumber)
+                   WHERE ((invchead_id = <? value("invchead_id") ?>)
+                      AND (arapply_source_doctype = 'K')))) AS f_payment,
+      formatMoney(MAX(total_allocated)) AS f_allocated,
        invchead_notes,
        invchead_misc_descrip
-FROM invchead, arapply,
-(SELECT COALESCE(SUM(CASE WHEN((aropen_amount - aropen_paid) >=
+FROM invchead
+     LEFT OUTER JOIN invcitem ON (invcitem_invchead_id=invchead_id)
+     LEFT OUTER JOIN item ON (invcitem_item_id=item_id),
+    (SELECT COALESCE(SUM(CASE WHEN((aropen_amount - aropen_paid) >=
 			        currToCurr(aropenco_curr_id, aropen_curr_id,
 					   aropenco_amount, aropen_docdate))
 		THEN currToCurr(aropenco_curr_id, invchead_curr_id,
 				aropenco_amount, aropen_docdate)
 		ELSE currToCurr(aropen_curr_id, invchead_curr_id,
 				aropen_amount - aropen_paid, aropen_docdate)
 	    END),0) AS total_allocated
   FROM aropenco, aropen, cohead, invchead
  WHERE ( (aropenco_aropen_id=aropen_id)
    AND   (aropenco_cohead_id=cohead_id)
    AND   ((aropen_amount - aropen_paid) > 0)
    AND   (cohead_number=invchead_ordernumber)
    AND   (NOT invchead_posted)
    AND   (invchead_id=<? value("invchead_id") ?>) )
  UNION
-SELECT COALESCE(SUM(currToCurr(arapply_curr_id, t.aropen_curr_id,
+    SELECT COALESCE(SUM(currToCurr(arapply_curr_id, t.aropen_curr_id,
                                arapply_applied, t.aropen_docdate)),0) AS total_allocated
   FROM arapply, aropen s, aropen t, invchead
  WHERE ( (s.aropen_id=arapply_source_aropen_id)
    AND   (arapply_target_aropen_id=t.aropen_id)
    AND   (arapply_target_doctype='I')
    AND   (arapply_target_docnumber=invchead_invcnumber)
    AND   (arapply_source_aropen_id=s.aropen_id)
    AND   (invchead_posted)
    AND   (invchead_id=<? value("invchead_id") ?>) )
- -- there will be two rows, one each for posted and not. get the greater of the two
- -- as at least one is guaranteed to be 0
-ORDER BY total_allocated DESC ) AS totalalloc
+    ) AS totalalloc
 WHERE (invchead_id=<? value("invchead_id") ?>)
+GROUP BY invchead_freight, invchead_misc_amount, invchead_tax, invchead_payment,
+         invchead_notes, invchead_misc_descrip
 ;


 --------------------------------------------------------------------
 REPORT: ItemMaster
 QUERY: head
 SELECT item_number,
        formatBoolYN(item_active) AS f_item_active,
        item_descrip1, item_descrip2,
        CASE WHEN(item_type='P') THEN 'Purchased'
             WHEN(item_type='M') THEN 'Manufactured'
             WHEN(item_type='J') THEN 'Job'
             WHEN(item_type='F') THEN 'Phantom'
             WHEN(item_type='B') THEN 'Breeder'
             WHEN(item_type='C') THEN 'Co-Product'
             WHEN(item_type='Y') THEN 'By-Product'
             WHEN(item_type='R') THEN 'Reference'
             WHEN(item_type='T') THEN 'Tooling'
             WHEN(item_type='O') THEN 'Outside Process'
             ELSE item_type
        END AS f_item_type,
        formatBoolYN(item_config) AS f_item_config,
        (classcode_code||' - '||classcode_descrip) AS f_classcode,
+       CASE WHEN (COALESCE(freightclass_id, -1) <> -1) THEN (freightclass_code||' - '||freightclass_descrip) END AS f_freightclass,
        iuom.uom_name AS invuom,
        formatBoolYN(item_picklist) AS f_item_picklist,
        formatBoolYN(item_fractional) AS f_item_fractional,
        itemcapuom(item_id) AS capuom, itemaltcapuom(item_id) AS altcapuom, puom.uom_name AS shipuom,
        formatUOMRatio(itemcapinvrat(item_id)) AS f_capinvrat,
        formatUOMRatio(itemaltcapinvrat(item_id)) AS f_altcapinvrat,
        formatUOMRatio(iteminvpricerat(item_id)) AS f_shipinvrat,
        formatWeight(item_prodweight) AS f_item_prodweight,
        formatWeight(item_packweight) AS f_item_packweight,
        formatBoolYN(item_sold) AS f_item_sold
-  FROM item, classcode, uom AS iuom, uom AS puom
- WHERE ((item_id=<? value("item_id") ?>)
-   AND  (item_inv_uom_id=iuom.uom_id)
-   AND  (item_price_uom_id=puom.uom_id)
-   AND  (item_classcode_id=classcode_id) );
+  FROM item JOIN classcode ON (classcode_id=item_classcode_id)
+            JOIN uom iuom ON (iuom.uom_id=item_inv_uom_id)
+            JOIN uom puom ON (puom.uom_id=item_price_uom_id)
+            LEFT OUTER JOIN freightclass ON (freightclass_id=item_freightclass_id)
+ WHERE (item_id=<? value("item_id") ?>)
+;
 --------------------------------------------------------------------

 QUERY: imglist
 SELECT 1 as one,
        image_name, firstLine(image_descrip) as f_descrip,
-       CASE WHEN (itemimage_purpose='I') THEN 'Inventory Description'
-            WHEN (itemimage_purpose='P') THEN 'Product Description'
-            WHEN (itemimage_purpose='E') THEN 'Engineering Reference'
-            WHEN (itemimage_purpose='M') THEN 'Miscellaneous'
+       CASE WHEN (imageass_purpose='I') THEN 'Inventory Description'
+            WHEN (imageass_purpose='P') THEN 'Product Description'
+            WHEN (imageass_purpose='E') THEN 'Engineering Reference'
+            WHEN (imageass_purpose='M') THEN 'Miscellaneous'
             ELSE 'Other'
        END as f_purpose
-FROM itemimage, image
-WHERE ( (itemimage_image_id=image_id)
- AND (itemimage_item_id=<? value("item_id") ?>) )
+FROM imageass, image
+WHERE ( (imageass_image_id=image_id)
+ AND (imageass_source='I')
+ AND (imageass_source_id=<? value("item_id") ?>) )
 ORDER BY image_name;


 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByBOMItem
 QUERY: detail
 SELECT formatDate(posted) AS f_posted,
        formatQty(ordered) AS f_ordered,
        formatQty(received) AS f_produced,
        formatQty(projreq) AS f_projreq,
        formatQtyPer(projqtyper) AS f_projqtyper,
        formatQty(actiss) AS f_actiss,
        formatQtyPer(actqtyper) AS f_actqtyper,
        formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
-       formatPrcnt((1 - (actqtyper / projqtyper)) * -1) AS f_percent
+       CASE WHEN (actqtyper=projqtyper) THEN formatPrcnt(0)
+            WHEN (projqtyper=0) THEN formatPrcnt(actqtyper)
+            ELSE formatPrcnt((1 - (actqtyper / projqtyper)) * -1)
+       END AS f_percent
   FROM ( SELECT womatlvar_posted AS posted,
                 womatlvar_qtyord AS ordered,
                 womatlvar_qtyrcv AS received,
                 (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
                 womatlvar_qtyper AS projqtyper,
                 (womatlvar_qtyiss) AS actiss, (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
            FROM womatlvar, itemsite AS component,
                 itemsite AS parent
           WHERE ((womatlvar_parent_itemsite_id=parent.itemsite_id)
             AND (womatlvar_component_itemsite_id=component.itemsite_id)
             AND (womatlvar_bomitem_id=<? value("component_item_id") ?>)
             AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
             AND (component.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
                 )
        ) AS data
 ORDER BY posted;


 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByComponentItem
 QUERY: detail
 SELECT formatDate(posted) AS f_posted,
        item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(ordered) AS f_ordered,
        formatQty(received) AS f_produced,
        formatQty(projreq) AS f_projreq,
        formatQtyPer(projqtyper) AS f_projqtyper,
        formatQty(actiss) AS f_actiss,
        formatQtyPer(actqtyper) AS f_actqtyper,
        formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
-       formatPrcnt((1 - (actqtyper / projqtyper)) * -1) AS f_percent
+       CASE WHEN (actqtyper=projqtyper) THEN formatPrcnt(0)
+            WHEN (projqtyper=0) THEN formatPrcnt(actqtyper)
+            ELSE formatPrcnt((1 - (actqtyper / projqtyper)) * -1)
+       END AS f_percent
   FROM ( SELECT womatlvar_posted AS posted,
                 item_number, uom_name,
                 item_descrip1, item_descrip2,
                 womatlvar_qtyord AS ordered,
                 womatlvar_qtyrcv AS received,
                 (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
                 womatlvar_qtyper AS projqtyper,
                 (womatlvar_qtyiss) AS actiss,
                 (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
            FROM womatlvar, itemsite AS component,
                 itemsite AS parent, item, uom
           WHERE ((womatlvar_parent_itemsite_id=parent.itemsite_id)
             AND (womatlvar_component_itemsite_id=component.itemsite_id)
             AND (parent.itemsite_item_id=item_id)
             AND (item_inv_uom_id=uom_id)
             AND (component.itemsite_item_id=<? value("item_id") ?>)
             AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
             AND (component.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
                 )
        ) AS data
 ORDER BY posted;


 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByItem
 QUERY: detail
 SELECT formatDate(posted) AS f_posted,
        item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(ordered) AS f_ordered,
        formatQty(received) AS f_produced,
        formatQty(projreq) AS f_projreq,
        formatQtyPer(projqtyper) AS f_projqtyper,
        formatQty(actiss) AS f_actiss,
        formatQtyPer(actqtyper) AS f_actqtyper,
        formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
-       formatPrcnt((1 - (actqtyper / projqtyper)) * -1) AS f_percent
+       CASE WHEN (actqtyper=projqtyper) THEN formatPrcnt(0)
+            WHEN (projqtyper=0) THEN formatPrcnt(actqtyper)
+            ELSE formatPrcnt((1 - (actqtyper / projqtyper)) * -1)
+       END AS f_percent
   FROM ( SELECT womatlvar_posted AS posted,
                 item_number, uom_name,
                 item_descrip1, item_descrip2,
                 womatlvar_qtyord AS ordered,
                 womatlvar_qtyrcv AS received,
                 (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
                 womatlvar_qtyper AS projqtyper,
                 (womatlvar_qtyiss) AS actiss,
                 (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
            FROM womatlvar, itemsite AS component,
                 itemsite AS parent, item, uom
           WHERE ((womatlvar_parent_itemsite_id=parent.itemsite_id)
             AND (womatlvar_component_itemsite_id=component.itemsite_id)
             AND (component.itemsite_item_id=item_id)
             AND (item_inv_uom_id=uom_id)
             AND (parent.itemsite_item_id=<? value("item_id") ?>)
             AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
             AND (parent.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
                 )
        ) AS data
 ORDER BY posted;


 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByWarehouse
 QUERY: detail
 SELECT formatDate(posted) AS f_posted,
        parent_number, parent_descrip1, parent_descrip2, parent_invuom,
        child_number, child_descrip1, child_descrip2, child_invuom,
        formatQty(ordered) AS f_ordered,
        formatQty(received) AS f_produced,
        formatQty(projreq) AS f_projreq,
        formatQtyPer(projqtyper) AS f_projqtyper,
        formatQty(actiss) AS f_actiss,
        formatQtyPer(actqtyper) AS f_actqtyper,
        formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
-       formatPrcnt((1 - (actqtyper / projqtyper)) * -1) AS f_percent
+       CASE WHEN (actqtyper=projqtyper) THEN formatPrcnt(0)
+            WHEN (projqtyper=0) THEN formatPrcnt(actqtyper)
+            ELSE formatPrcnt((1 - (actqtyper / projqtyper)) * -1)
+       END AS f_percent
   FROM ( SELECT womatlvar_posted AS posted,
                 parentitem.item_number AS parent_number,
                 puom.uom_name AS parent_invuom,
                 parentitem.item_descrip1 AS parent_descrip1,
                 parentitem.item_descrip2 AS parent_descrip2,
                 componentitem.item_number AS child_number,
                 cuom.uom_name AS child_invuom,
                 componentitem.item_descrip1 AS child_descrip1,
                 componentitem.item_descrip2 AS child_descrip2,
                 womatlvar_qtyord AS ordered,
                 womatlvar_qtyrcv AS received,
                 (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
                 womatlvar_qtyper AS projqtyper,
                 (womatlvar_qtyiss) AS actiss,
                 (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
            FROM womatlvar, itemsite AS componentsite, itemsite AS parentsite,
                 item AS componentitem, item AS parentitem, uom AS puom, uom AS cuom
           WHERE ((womatlvar_parent_itemsite_id=parentsite.itemsite_id)
             AND (womatlvar_component_itemsite_id=componentsite.itemsite_id)
             AND (parentsite.itemsite_item_id=parentitem.item_id)
             AND (parentitem.item_inv_uom_id=puom.uom_id)
             AND (componentsite.itemsite_item_id=componentitem.item_id)
             AND (componentitem.item_inv_uom_id=cuom.uom_id)
             AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
             AND (componentsite.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
                 )
        ) AS data
 ORDER BY posted;


 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByWorkOrder
 QUERY: detail
 SELECT formatDate(posted) AS f_posted,
        item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(ordered) AS f_ordered,
        formatQty(received) AS f_produced,
        formatQty(projreq) AS f_projreq,
        formatQtyPer(projqtyper) AS f_projqtyper,
        formatQty(actiss) AS f_actiss,
        formatQtyPer(actqtyper) AS f_actqtyper,
        formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
-       formatPrcnt((1 - (actqtyper / projqtyper)) * -1) AS f_percent
+       CASE WHEN (actqtyper=projqtyper) THEN formatPrcnt(0)
+            WHEN (projqtyper=0) THEN formatPrcnt(actqtyper)
+            ELSE formatPrcnt((1 - (actqtyper / projqtyper)) * -1)
+       END AS f_percent
   FROM ( SELECT womatlvar_posted AS posted,
                 item_number, uom_name,
                 item_descrip1, item_descrip2,
                 womatlvar_qtyord AS ordered,
                 womatlvar_qtyrcv AS received,
                 (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
                 womatlvar_qtyper AS projqtyper,
                 (womatlvar_qtyiss) AS actiss,
                 (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
            FROM womatlvar, itemsite, item, wo, uom
           WHERE ((womatlvar_component_itemsite_id=itemsite_id)
             AND (itemsite_item_id=item_id)
             AND (item_inv_uom_id=uom_id)
             AND (wo_number=womatlvar_number)
             AND (wo_subnumber=womatlvar_subnumber)
             AND (wo_id=<? value("wo_id") ?>) ) ) AS data
 ORDER BY item_number;


 --------------------------------------------------------------------
 REPORT: PackingList-Shipment
 QUERY: detail
 SELECT 1 AS groupby,
 --     coitem_linenumber AS linenumber,
 --     In 3.1 replace line above with line below to support
 --     kitting functionality
        formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formatsoitembarcode(coitem_id) AS orderitem_barcode,
 --     In 2.3 replaced the next line:
 --     uom_name,
 --     with:
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(coitem_qtyord) AS ordered,
-       formatQty(coship_qty) AS shipped,
+       (SELECT formatQty(SUM(coship_qty)) FROM coship WHERE ((coship_cosmisc_id=<? value("cosmisc_id") ?>) AND (coship_coitem_id=coitem_id))) AS shipped,

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
   FROM itemsite, item, coitem, coship, uom
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
    AND (coitem_id=coship_coitem_id)
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
        formatQty(shipitem_qty) AS shipped,

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
 REPORT: PackingListBatchEditList
 QUERY: detail
-SELECT cohead_number,
-       formatShipmentNumber(sopack_cosmisc_id) AS cosmisc_number,
-       cust_number,
-       cohead_billtoname,
-       CASE WHEN (cohead_holdtype='N') THEN 'None'
-            WHEN (cohead_holdtype='S') THEN 'Ship'
-            WHEN (cohead_holdtype='P') THEN 'Pack'
-            WHEN (cohead_holdtype='R') THEN 'Return'
-            ELSE 'Other'
+SELECT cohead_number AS order_number, pack_head_type,
+       cohead_shipvia AS shipvia,
+       formatShipmentNumber(pack_shiphead_id) AS shipment_number,
+       cust_number AS number, cohead_billtoname AS name,
+       CASE WHEN (cohead_holdtype='N') THEN <? value("none") ?>
+            WHEN (cohead_holdtype='C') THEN <? value("credit") ?>
+            WHEN (cohead_holdtype='S') THEN <? value("ship") ?>
+            WHEN (cohead_holdtype='P') THEN <? value("pack") ?>
+            WHEN (cohead_holdtype='R') THEN <? value("return") ?>
+            ELSE <? value("other") ?>
        END AS f_holdtype,
-       formatBoolYN(sopack_printed) as f_printed
-FROM sopack, cohead, cust
-WHERE ( (sopack_sohead_id=cohead_id)
- AND (cohead_cust_id=cust_id) )
-ORDER BY cohead_number;
+       formatBoolYN(pack_printed) AS f_printed
+FROM pack, cohead, cust
+WHERE ((pack_head_id=cohead_id)
+  AND  (cohead_cust_id=cust_id)
+  AND  (pack_head_type='SO'))
+<? if exists("MultiWhs") ?>
+  AND  checkSOSitePrivs(cohead_id)
+UNION
+SELECT tohead_number AS order_number, pack_head_type,
+       tohead_shipvia AS shipvia,
+       formatShipmentNumber(pack_shiphead_id) AS shipment_number,
+       tohead_destname AS number, tohead_destcntct_name AS name,
+       '' AS f_holdtype,
+       formatBoolYN(pack_printed) AS f_printed
+FROM pack, tohead
+WHERE ((pack_head_id=tohead_id)
+  AND  (pack_head_type='TO'))
+<? endif ?>
+ORDER BY order_number;


 --------------------------------------------------------------------
 REPORT: PurchaseReqsByPlannerCode
 QUERY: detail
-SELECT item_number,
+SELECT pr_number || '-' || pr_subnumber AS pr_number,
+       item_number,
        (item_descrip1 || ' ' || item_descrip2) as item_descrip,
        pr_status,
        CASE WHEN (pr_order_type='W') THEN ('W/O ' || ( SELECT formatWoNumber(womatl_wo_id)
                                                          FROM womatl
                                                         WHERE (womatl_id=pr_order_id) ) )
             WHEN (pr_order_type='S') THEN ('S/O ' || (SELECT formatSoNumber(pr_order_id)))
             WHEN (pr_order_type='F') THEN ('Planned Order')
             WHEN (pr_order_type='M') THEN 'Manual'
             ELSE 'Other'
        END AS f_type,
        formatDate(pr_duedate) AS f_duedate,
        formatQty(pr_qtyreq) AS f_qtyreq
   FROM pr, itemsite, item
  WHERE ((pr_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (pr_duedate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN (SELECT plancode_id
                                    FROM plancode
                                   WHERE (plancode_code ~ <? value("plancode_pattern") ?>) ) )
 <? endif ?>
 )
 ORDER BY pr_duedate;


 --------------------------------------------------------------------
 REPORT: PurchaseRequestsByItem
 QUERY: detail
 SELECT pr_status,
+       pr_number || '-' || pr_subnumber AS pr_number,
        CASE WHEN (pr_order_type='W') THEN ('W/O ' || ( SELECT formatWoNumber(womatl_wo_id)
                                                        FROM womatl
                                                        WHERE (womatl_id=pr_order_id) ) )
             WHEN (pr_order_type='S') THEN ('S/O ' || (SELECT formatSoNumber(pr_order_id)))
             WHEN (pr_order_type='F') THEN ('Planned Order')
             WHEN (pr_order_type='M') THEN 'Manual'
             ELSE 'Other'
        END as f_type,
        formatDate(pr_duedate) as f_duedate,
        formatQty(pr_qtyreq) as f_qtyreq
   FROM pr, itemsite
  WHERE ((pr_itemsite_id=itemsite_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
  )
 ORDER BY pr_duedate;


 --------------------------------------------------------------------
 REPORT: Quote
 QUERY: items
 SELECT

        quitem_id,
        quitem_linenumber,
+       quitem_custpn,
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
 FROM
      item,
      quitem
      LEFT OUTER JOIN (itemsite JOIN warehous ON (itemsite_warehous_id=warehous_id)) ON (quitem_itemsite_id=itemsite_id)
      LEFT OUTER JOIN charass on (charass_target_id = quitem_id) left outer join char ON (charass_char_id = char_id)
 WHERE
 (
      (quitem_item_id=item_id)
      AND (quitem_quhead_id=<? value("quhead_id") ?>)
 )
 ORDER BY quitem_linenumber;


 --------------------------------------------------------------------
 REPORT: RunningAvailability
 QUERY: detail
 <? if exists("MultiWhs") ?>
 SELECT tohead_id AS orderid, toitem_id AS altorderid, 'T/O' AS ordertype,
        TEXT(tohead_number) AS ordernumber,
        1 AS sequence,
        tohead_srcname || '/' || tohead_destname AS item_number,
        formatDate(toitem_duedate) AS duedate,
        toitem_duedate AS r_duedate,
        (toitem_duedate < CURRENT_DATE) AS late,
        formatQty(toitem_qty_ordered) AS f_qtyordered,
        formatQty(toitem_qty_received) AS f_qtyreceived,
        formatQty(noNeg(toitem_qty_ordered - toitem_qty_received)) AS f_balance,
        noNeg(toitem_qty_ordered - toitem_qty_received) AS balance
 FROM tohead, toitem
 WHERE ((toitem_tohead_id=tohead_id)
   AND  (toitem_status = 'O')
   AND  (toitem_item_id=<? value("item_id") ?>)
   AND  (tohead_dest_warehous_id=<? value("warehous_id") ?>)
   AND  (toitem_qty_ordered > toitem_qty_received) )

 UNION
 SELECT tohead_id AS orderid, toitem_id AS altorderid, 'T/O' AS ordertype,
        TEXT(tohead_number) AS ordernumber,
        1 AS sequence,
        tohead_srcname || '/' || tohead_destname AS item_number,
        formatDate(toitem_duedate) AS duedate,
        toitem_duedate AS r_duedate,
        (toitem_duedate < CURRENT_DATE) AS late,
        formatQty(toitem_qty_ordered) AS f_qtyordered,
        formatQty(toitem_qty_received) AS f_qtyreceived,
        formatQty(-1 * noNeg(toitem_qty_ordered - toitem_qty_shipped - qtyAtShipping('TO', toitem_id))) AS f_balance,
        -1 * noNeg(toitem_qty_ordered - toitem_qty_received) AS balance
 FROM tohead, toitem
 WHERE ((toitem_tohead_id=tohead_id)
   AND  (toitem_status = 'O')
   AND  (toitem_item_id=<? value("item_id") ?>)
   AND  (tohead_src_warehous_id=<? value("warehous_id") ?>)
   AND  (toitem_qty_ordered - toitem_qty_shipped - qtyAtShipping('TO', toitem_id)) > 0 )

 UNION
 <? endif ?>
 SELECT wo_id AS orderid, -1 AS altorderid,
        'W/O' AS ordertype,
        formatWoNumber(wo_id) AS ordernumber,
        1 AS sequence,
        item_number,
        formatDate(wo_duedate) AS duedate,
        wo_duedate AS r_duedate,
        (wo_duedate < CURRENT_DATE) AS late,
        formatQty(wo_qtyord) AS f_qtyordered,
        formatQty(wo_qtyrcv) AS f_qtyreceived,
        formatQty(noNeg(wo_qtyord - wo_qtyrcv)) AS f_balance,
        noNeg(wo_qtyord - wo_qtyrcv) AS balance
 FROM wo, itemsite, item
 WHERE ((wo_status<>'C')
   AND  (wo_itemsite_id=itemsite_id)
   AND  (itemsite_item_id=item_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>)
-  AND  (item_type='M'))
+  AND  (item_type NOT IN ('C', 'Y')))

 UNION
 SELECT wo_id AS orderid, -1 AS altorderid,
        'W/O' AS ordertype,
        formatWoNumber(wo_id) AS ordernumber,
        1 AS sequence,
        item_number,
        formatDate(wo_duedate) AS duedate,
        wo_duedate AS r_duedate,
        (wo_duedate < CURRENT_DATE) AS late,
        formatQty(wo_qtyord * brddist_stdqtyper) AS f_qtyordered,
        formatQty(wo_qtyrcv * brddist_stdqtyper) AS f_qtyreceived,
        formatQty(noNeg((wo_qtyord - wo_qtyrcv) * brddist_stdqtyper)) AS f_balance,
        noNeg((wo_qtyord - wo_qtyrcv) * brddist_stdqtyper) AS balance
 FROM brddist, wo, itemsite, item
 WHERE ((wo_status<>'C')
   AND  (brddist_wo_id=wo_id)
   AND  (wo_itemsite_id=itemsite_id)
   AND  (itemsite_item_id=item_id)
   AND  (brddist_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>)
   AND  (item_type IN ('C', 'Y')) )

 UNION
 SELECT wo_id AS orderid, womatl_id AS altorderid,
       'W/O' AS ordertype,
       formatWoNumber(wo_id) AS ordernumber,
       2 AS sequence,
       item_number,
       formatDate(womatl_duedate) AS duedate,
       womatl_duedate AS r_duedate,
       FALSE AS late,
       formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, womatl_qtyreq)) AS f_qtyordered,
       formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, womatl_qtyiss)) AS f_qtyreceived,
       formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, (noNeg(womatl_qtyreq - womatl_qtyiss) * -1))) AS f_balance,
       itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, (noNeg(womatl_qtyreq - womatl_qtyiss) * -1)) AS balance
 FROM womatl, wo, itemsite AS wois, item, itemsite AS womatlis
 WHERE ((wo_status<>'C')
   AND  (wo_itemsite_id=wois.itemsite_id)
   AND  (wois.itemsite_item_id=item_id)
   AND  (womatl_wo_id=wo_id)
   AND  (womatlis.itemsite_item_id=<? value("item_id") ?>)
   AND  (womatlis.itemsite_warehous_id=<? value("warehous_id") ?>)
-  AND  (womatl_itemsite_id=womatlis.itemsite_id)
-  AND  (item_type IN ('P', 'M', 'C', 'O')) )
+  AND  (womatl_itemsite_id=womatlis.itemsite_id) )

 UNION
 SELECT pohead_id AS orderid, poitem_id AS altorderid,
       'P/O' AS ordertype,
       TEXT(pohead_number) AS ordernumber,
       1 AS sequence,
       '' AS item_number,
       formatDate(poitem_duedate) AS duedate,
       poitem_duedate AS r_duedate,
       (poitem_duedate < CURRENT_DATE) AS late,
       formatQty(poitem_qty_ordered * poitem_invvenduomratio) AS f_qtyordered,
       formatQty(poitem_qty_received * poitem_invvenduomratio) AS f_qtyreceived,
       formatQty(noNeg(poitem_qty_ordered - poitem_qty_received) * poitem_invvenduomratio) AS f_balance,
       (noNeg(poitem_qty_ordered - poitem_qty_received) * poitem_invvenduomratio) AS balance
 FROM pohead, poitem, itemsite, item
 WHERE ((poitem_pohead_id=pohead_id)
   AND  (poitem_status <> 'C')
   AND  (poitem_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=item_id)
   AND  (item_id=<? value("item_id") ?>)
   AND  (item_type IN ('P', 'M', 'C', 'O')) )

 UNION
 SELECT cohead_id AS orderid, coitem_id AS altorderid,
        'S/O' AS ordertype,
        TEXT(cohead_number) AS ordernumber,
        2 AS sequence,
        cust_name AS item_number,
        formatDate(coitem_scheddate) AS duedate,
        coitem_scheddate AS r_duedate,
        (coitem_scheddate < CURRENT_DATE) AS late,
        formatQty(coitem_qty_invuomratio * coitem_qtyord) AS f_qtyordered,
        formatQty(coitem_qty_invuomratio * (coitem_qtyshipped - coitem_qtyreturned + qtyAtShipping(coitem_id))) AS f_qtyreceived,
        formatQty(coitem_qty_invuomratio * noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned - qtyAtShipping(coitem_id)) * -1) AS f_balance,
        (coitem_qty_invuomratio * noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned - qtyAtShipping(coitem_id)) * -1) AS balance
 FROM coitem, cohead, cust, itemsite, item
 WHERE ((coitem_status='O')
   AND  (cohead_cust_id=cust_id)
   AND  (coitem_cohead_id=cohead_id)
   AND  (coitem_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=item_id)
   AND  (item_id=<? value("item_id") ?>)
   AND  item_sold )

 <? if exists("showPlanned") ?>
 <? if exists("showMRPplan") ?>
 UNION
 SELECT planord_id AS orderid, -1 AS altorderid,
        'Planned P/O' AS ordertype,
 --       CASE WHEN (planord_firm) THEN <? value("firmPo") ?>
 -- 	   ELSE <? value("plannedPo") ?>
 --       END AS ordernumber,
 --2.3 replaced case above with actual order number for higher level demand
        CAST(planord_number AS text) AS ordernumber,
        1 AS sequence,
        '' AS item_number,
        formatDate(planord_duedate) AS duedate,
        planord_duedate AS r_duedate,
        FALSE AS late,
        formatQty(planord_qty) AS f_qtyordered,
        '' AS f_qtyreceived,
        formatQty(planord_qty) AS f_balance,
        planord_qty AS balance
 FROM planord, itemsite
 WHERE ((planord_type='P')
   AND  (planord_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>) )

 UNION
 SELECT planord_id AS orderid, -1 AS altorderid,
        'Planned W/O' AS ordertype,
 --       CASE WHEN (planord_firm) THEN <? value("firmWo") ?>
 --	    ELSE <? value("plannedWo") ?>
 --       END AS ordernumber,
 --2.3 replaced case above with actual order number
        CAST(planord_number AS text) AS ordernumber,
        1 AS sequence,
        '' AS item_number,
        formatDate(planord_duedate) AS duedate,
        planord_duedate AS r_duedate,
        FALSE AS late,
        formatQty(planord_qty) AS f_qtyordered,
        '' AS f_qtyreceived,
        formatQty(planord_qty) AS f_balance,
        planord_qty AS balance
 FROM planord, itemsite
 WHERE ((planord_type='W')
   AND  (planord_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>) )

 UNION
 SELECT planreq_id AS orderid, -1 AS altorderid,
        'Planned W/O' AS ordertype,
 --       CASE WHEN (planord_firm) THEN <? value("firmWoReq") ?>
 --	    ELSE <? value("plannedWoReq") ?>
 --       END AS ordernumber,
 --2.3 replaced case above with actual order number for higher level demand
        CAST(planord_number AS text) AS ordernumber,
        1 AS sequence,
 --2.3 Start
 --Starting here a sub-select gets the planned order number for the higher level demand
              (SELECT item_number
                 FROM item, itemsite
                WHERE((itemsite_item_id=item_id)
                  AND (itemsite_id=planord_itemsite_id))
              ) AS item_number,
 --End of subselect to get higher level item number
 --2.3 Start
        formatDate(planord_startdate) AS duedate,
        planord_startdate AS r_duedate,
        FALSE AS late,
        formatQty(planreq_qty) AS f_qtyordered,
        '' AS f_qtyreceived,
        formatQty(planreq_qty * -1) AS f_balance,
        (planreq_qty * -1) AS balance
 FROM planreq, planord, itemsite, item
 WHERE ((planreq_source='P')
   AND  (planreq_source_id=planord_id)
   AND  (planreq_itemsite_id=itemsite_id)
   AND  (itemsite_item_id=item_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>) )
 <? endif ?>

 UNION
 SELECT pr_id AS orderid, -1 AS altorderid,
        'P/R' AS ordertype,
 --       <? value("pr") ?> AS ordernumber,
 --2.3 replaced above with actual order number
        CAST(pr_number AS text) AS ordernumber,
        1 AS sequence,
        '' AS item_number,
        formatDate(pr_duedate) AS duedate,
        pr_duedate AS r_duedate,
        FALSE AS late,
        formatQty(pr_qtyreq) AS f_qtyordered,
        '' AS f_qtyreceived,
        formatQty(pr_qtyreq) AS f_balance,
        pr_qtyreq AS balance
 FROM pr, itemsite, item
 WHERE ((pr_itemsite_id=itemsite_id)
   AND  (itemsite_item_id=item_id)
   AND  (pr_itemsite_id=itemsite_id)
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (itemsite_item_id=<? value("item_id") ?>) )
 <? endif ?>

 UNION

 SELECT -1 AS orderid, -1 AS altorderid,
              '' AS ordertype,
              '' AS ordernumber,
              -1 AS sequence,
              'Initial QOH' AS item_number,
              '' AS duedate,
              date('1/1/1978') AS r_duedate,
              FALSE AS late,
              '' AS f_qtyordered,
              '' AS f_qtyreceived,
              '' AS f_balance,
              itemsite_qtyonhand AS balance
         FROM itemsite
        WHERE ((itemsite_item_id=<? value("item_id") ?>)
          AND (itemsite_warehous_id=<? value("warehous_id") ?>))

 ORDER BY r_duedate, sequence;


 --------------------------------------------------------------------
 REPORT: SalesHistoryByBilltoName
 QUERY: detail
 SELECT cohist_billtoname as billto,
+       cust_number,
        cohist_ordernumber AS sonumber,
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
        round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2) AS total
-  FROM cohist, itemsite, item
+  FROM cohist JOIN custinfo ON (cust_id=cohist_cust_id), itemsite, item
  WHERE ((cohist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (UPPER(cohist_billtoname) ~ UPPER(<? value("billToName") ?>))
 <? if exists("prodcat_id") ?>
    AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (item_prodcat_id IN (SELECT prodcat_id FROM prodcat WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY cohist_invcdate, cohist_billtoname, item_number;


 --------------------------------------------------------------------
 REPORT: SalesHistoryByParameterList
 QUERY: detail
 SELECT cohist_ordernumber AS sonumber,
+       cust_number,
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
    AND (cust_id IN (SELECT custgrpitem_cust_id FROM custgrpitem WHERE (custgrpitem_id=<? value("custgrp_id") ?>)))
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
-                   COALESCE((SELECT SUM(currToCurr(checkitem_curr_id, apopen_curr_id, checkitem_amount, CURRENT_DATE))
+                   COALESCE((SELECT SUM(checkitem_amount / round(checkitem_curr_rate,5))
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
 REPORT: SelectedPaymentsList
 QUERY: detail
 SELECT apopen_id, apselect_id,
        (bankaccnt_name || '-' || bankaccnt_descrip) AS bankaccnt,
        (vend_number || '-' || vend_name) AS vendor,
        apopen_docnumber,
        apopen_ponumber,
        formatMoney(apselect_amount) AS f_selected
   FROM apselect, apopen, vend, bankaccnt
  WHERE ((apopen_vend_id=vend_id)
    AND (apselect_apopen_id=apopen_id)
-   AND (apselect_bankaccnt_id=bankaccnt_id) )
+   AND (apselect_bankaccnt_id=bankaccnt_id)
+<? if exists("vend_id") ?>
+   AND (vend_id=<? value("vend_id") ?>)
+<? elseif exists("vendtype_id") ?>
+   AND (vend_vendtype_id=<? value("vendtype_id") ?>)
+<? elseif exists("vendtype_pattern") ?>
+   AND (vend_vendtype_id IN (SELECT vendtype_id
+                               FROM vendtype
+                              WHERE (vendtype_code ~ <? value("vendtype_pattern") ?>)))
+<? endif ?>
+      )
 ORDER BY bankaccnt_name, vend_number, apopen_docnumber;


 --------------------------------------------------------------------
 REPORT: ShipmentsByDate
 QUERY: head
-SELECT formatDate(<? value("startDate") ?>) AS startdate,
-       formatDate(<? value("endDate") ?>) AS enddate;
+SELECT formatDate(date(<? value("startDate") ?>)) AS startDate,
+       formatDate(date(<? value("endDate") ?>)) AS endDate;
+
 --------------------------------------------------------------------

 QUERY: detail
-SELECT cosmisc_id,
-       formatShipmentNumber(cosmisc_id) AS cosmisc_number,
-       coitem_id,
-       cohead_number,
-       (cust_number || '-' || cust_name) AS customer,
-       formatDate(cosmisc_shipdate) AS f_shipdate,
-       coitem_linenumber,
+SELECT shiphead_id, lineitem_id,
+       CASE WHEN (level=0) THEN order_number
+            ELSE item_number
+       END AS order_item,
+       CASE WHEN (level=0) THEN customer
+            ELSE itemdescription
+       END AS cust_desc,
+       shiphead_order_type,
+       shiphead_number,
+       order_number,
+       customer,
+       shiphead_shipdate AS f_shipdate,
+       shiphead_tracknum,
+       shiphead_freight,
+       freight_curr_abbr,
+       linenumber,
        item_number,
-       item_descrip1,
-       item_descrip2,
-       uom_name,
+       itemdescription,
        warehous_code,
-       formatQty(coitem_qtyord) AS f_qtyord,
-       formatQty(SUM(coship_qty)) AS f_qtyshipped
-  FROM coship, cosmisc, coitem, cohead, cust, itemsite, item, uom, warehous
- WHERE ( (coship_cosmisc_id=cosmisc_id)
-   AND (coship_coitem_id=coitem_id)
+       formatQty(qtyord) AS f_qtyord,
+       formatQty(qtyshipped) AS f_qtyshipped
+FROM (
+SELECT shiphead_id, coitem_id AS lineitem_id, cohead_number AS sortkey1, shiphead_number AS sortkey2, 1 AS level,
+       shiphead_order_type,
+       shiphead_number,
+       cohead_number AS order_number,
+       (cust_number || '-' || cust_name) AS customer,
+       shiphead_shipdate,
+       shiphead_tracknum,
+       shiphead_freight,
+       currConcat(shiphead_freight_curr_id) AS freight_curr_abbr,
+       coitem_linenumber AS linenumber, item_number,
+       (item_descrip1 || ' ' || item_descrip2) AS itemdescription,
+       warehous_code,
+       coitem_qtyord AS qtyord,
+       SUM(shipitem_qty) AS qtyshipped
+FROM shipitem, shiphead, coitem, cohead, cust, itemsite, item, warehous
+WHERE ( (shipitem_shiphead_id=shiphead_id)
+ AND (shipitem_orderitem_id=coitem_id)
    AND (coitem_itemsite_id=itemsite_id)
+ AND (coitem_status <> 'X')
    AND (itemsite_item_id=item_id)
-   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
-   AND (cosmisc_cohead_id=cohead_id)
+ AND (shiphead_order_id=cohead_id)
    AND (cohead_cust_id=cust_id)
-   AND (cosmisc_shipped)
-   AND (cosmisc_shipdate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>) )
-GROUP BY cosmisc_id, coitem_id,
-         cohead_number, cust_number, cust_name, cosmisc_shipdate,
+ AND (shiphead_shipped)
+ AND (shiphead_order_type='SO')
+<? if exists("startDate") ?>
+ AND (shiphead_shipdate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>)
+<? endif ?>
+<? if exists("sohead_id") ?>
+ AND (cohead_id = <? value("sohead_id") ?>)
+<? endif ?>
+<? if exists("shiphead_id") ?>
+ AND (shiphead_id = <? value("shiphead_id") ?>)
+<? endif ?>
+      )
+GROUP BY shiphead_id, coitem_id, shiphead_order_type, shiphead_number,
+         cohead_number, cust_number, cust_name, shiphead_shipdate,
          coitem_linenumber, item_number, item_descrip1, item_descrip2,
-         uom_name, warehous_code, coitem_qtyord
-ORDER BY cosmisc_id, coitem_linenumber;
+         warehous_code, shiphead_tracknum, coitem_qtyord,
+         shiphead_freight, shiphead_freight_curr_id
+<? if exists("MultiWhs") ?>
+UNION
+SELECT shiphead_id, toitem_id AS lineitem_id, tohead_number AS sortkey1, shiphead_number AS sortkey2, 1 AS level,
+       shiphead_order_type,
+       shiphead_number,
+       tohead_number AS order_number,
+       tohead_destname AS customer,
+       shiphead_shipdate,
+       shiphead_tracknum,
+       shiphead_freight,
+       currConcat(shiphead_freight_curr_id) AS freight_curr_abbr,
+       toitem_linenumber AS linenumber, item_number,
+       (item_descrip1 || ' ' || item_descrip2) AS itemdescription,
+       tohead_srcname AS warehous_code,
+       toitem_qty_ordered AS qtyord,
+       SUM(shipitem_qty) AS qtyshipped
+FROM shipitem, shiphead, toitem, tohead, item
+WHERE ( (shipitem_shiphead_id=shiphead_id)
+ AND (shipitem_orderitem_id=toitem_id)
+ AND (toitem_status <> 'X')
+ AND (toitem_item_id=item_id)
+ AND (shiphead_order_id=tohead_id)
+ AND (shiphead_shipped)
+ AND (shiphead_order_type='TO')
+<? if exists("startDate") ?>
+ AND (shiphead_shipdate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>)
+<? endif ?>
+<? if exists("tohead_id") ?>
+ AND (tohead_id = <? value("tohead_id") ?>)
+<? endif ?>
+<? if exists("shiphead_id") ?>
+ AND (shiphead_id = <? value("shiphead_id") ?>)
+<? endif ?>
+      )
+GROUP BY shiphead_id, toitem_id, shiphead_order_type, shiphead_number,
+         tohead_number, tohead_destname, shiphead_shipdate,
+         toitem_linenumber, item_number, item_descrip1, item_descrip2,
+         tohead_srcname, shiphead_tracknum, toitem_qty_ordered,
+         shiphead_freight, shiphead_freight_curr_id
+<? endif ?>
+   ) AS data
+ORDER BY sortkey1, sortkey2, level, linenumber DESC;
+


 --------------------------------------------------------------------
-REPORT:
+REPORT: StandardBOL
 QUERY: head
 SELECT cosmisc_shipvia, formatDate(cosmisc_shipdate) AS shipdate,
                 cust_name, cust_number, cohead_number, cohead_fob, cohead_custponumber,
                 warehous_descrip, warehous_addr1, warehous_addr2, warehous_addr3, warehous_addr4, warehous_fob,
                 cohead_shiptoname, cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3,
                 (cohead_shiptocity || ' ' || cohead_shiptostate || ' ' || cohead_shiptozipcode) AS shiptocitystatezip,
                 cohead_shiptophone
          FROM cosmisc, cohead, warehous, cust
          WHERE ((cosmisc_cohead_id=cohead_id)
           AND (cohead_cust_id=cust_id)
           AND (cohead_warehous_id=warehous_id)
           AND (cosmisc_id=%1));
 --------------------------------------------------------------------

 QUERY: detail
 SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, uom_name, roundUp(SUM(coship_qty) / itemuomratiobytype(item_id, 'Selling'))::integer AS shipqty,
                 itemsellinguom(item_id) AS shipuom, item_number, item_descrip1, item_descrip2,
                 formatQty(SUM(coship_qty) * item_prodweight) AS netweight,
                 formatQty(SUM(coship_qty) * (item_prodweight + item_packweight)) AS grossweight
          FROM coship, coitem, itemsite, item, uom
          WHERE ((coship_coitem_id=coitem_id)
           AND (coitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
           AND (coship_cosmisc_id=%1))
          GROUP BY coitem_linenumber, item_number, uom_name, shipuom,
                   item_descrip1, item_descrip2, item_prodweight, item_packweight
          ORDER BY coitem_linenumber;

 --------------------------------------------------------------------

 QUERY: foot
 SELECT formatQty(SUM(coship_qty * item_prodweight)) AS netweight,
                 formatQty(SUM(coship_qty * (item_prodweight + item_packweight))) AS grossweight,
                 CASE
                  WHEN ('%3' = 'C') THEN 'X'
                  ELSE ' '
                 END AS collectflag,
                 CASE
                  WHEN ('%3' = 'C') THEN 'Therm-O-Rock East, Inc.'
                  ELSE ' '
                 END AS section7,
                 CASE
                  WHEN ('%3' = 'C') THEN 'Therm-O-Rock, East, Inc.'
                  ELSE ' '
                 END AS collect_name,
                 CASE
                  WHEN ('%3' = 'C') THEN 'Pine Street'
                  ELSE ' '
                 END AS collect_address1,
                 CASE
                  WHEN ('%3' = 'C') THEN ''
                  ELSE ' '
                 END AS collect_address2,
                 CASE
                  WHEN ('%3' = 'C') THEN 'New Eagle  PA  15067'
                  ELSE ' '
                 END AS collect_address3
          FROM coship, coitem, itemsite, item
          WHERE ((coship_coitem_id=coitem_id)
           AND (coitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (coship_cosmisc_id=%1));
 --------------------------------------------------------------------

 QUERY: notes
 SELECT cosmisc_notes
          FROM cosmisc
          WHERE (cosmisc_id=%1);


 --------------------------------------------------------------------
 REPORT: SummarizedBacklogByWarehouse
 QUERY: detail
 SELECT CASE WHEN (cohead_holdtype='P') THEN -1
             ELSE cohead_id
        END AS _coheadid, cohead_id,
        cohead_holdtype, cohead_number, cust_name,
        CASE WHEN (cohead_holdtype='N') THEN <? value("none") ?>
             WHEN (cohead_holdtype='C') THEN <? value("credit") ?>
             WHEN (cohead_holdtype='S') THEN <? value("ship") ?>
             WHEN (cohead_holdtype='P') THEN <? value("pack") ?>
             WHEN (cohead_holdtype='R') THEN <? value("return") ?>
             ELSE <? value("Other") ?>
        END AS f_holdtype,
        formatDate(cohead_orderdate) AS f_orderdate,
        formatDate(MIN(coitem_scheddate)) AS f_scheddate,
        formatDate(cohead_packdate) AS f_packdate,
        <? if exists("showPrices") ?>
          formatMoney( SUM( round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
                          (coitem_price / coitem_price_invuomratio),2) ) )
        <? else ?>
          text('')
        <? endif ?>
        AS f_sales,
        <? if exists("showPrices") ?>
          formatCost(SUM((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * stdcost(item_id) ) )
        <? else ?>
          text('')
        <? endif ?>
        AS f_cost,
        <? if exists("showPrices") ?>
          formatMoney( SUM( (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
                          ((coitem_price / coitem_price_invuomratio) - stdcost(item_id)) ) )
        <? else ?>
          text('')
        <? endif ?>
        AS f_margin,
        SUM( round( (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
             (coitem_price / coitem_price_invuomratio),2) ) AS sales,
        SUM((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * stdcost(item_id) ) AS cost,
        SUM((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
             ((coitem_price / coitem_price_invuomratio) - stdcost(item_id)) ) AS margin,
        MIN(coitem_scheddate) AS scheddate,
        formatShipmentNumber(cosmisc_id) AS cosmisc_number,
        CASE WHEN (cosmisc_shipped IS NULL) THEN text('')
             WHEN (cosmisc_shipped) THEN text('Yes')
             WHEN (NOT cosmisc_shipped) THEN text('No')
        END AS shipstatus,
        COALESCE(cosmisc_shipvia, '') AS shipvia,
        CASE WHEN (cosmisc_shipdate IS NULL) THEN text('')
             ELSE formatDate(cosmisc_shipdate)
        END AS shipdate
   FROM coitem, itemsite, item, cust,
        cohead LEFT OUTER JOIN cosmisc ON (cosmisc_cohead_id=cohead_id)
  WHERE ( (coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (coitem_status NOT IN ('C','X'))
    AND (coitem_scheddate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("custtype_id") ?>
    AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    AND (cust_custtype_id IN (SELECT custtype_id
                                FROM custtype
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 GROUP BY cohead_id, cohead_number, cust_name, cohead_holdtype,
          cohead_orderdate, cohead_packdate, cosmisc_shipped,
          cosmisc_shipvia, cosmisc_shipdate, cosmisc_id
 ORDER BY
 <? if exists("orderByShipDate") ?>
   scheddate,
 <? elseif exists("orderByPackDate") ?>
-  cohead_packdate
+  cohead_packdate,
 <? endif ?>
 cohead_number, cosmisc_shipped;


 --------------------------------------------------------------------
 REPORT: TimePhasedStatisticsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Sites')
+         text('All Warehouses')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);


 --------------------------------------------------------------------
 REPORT: TodoByUserAndIncident
 QUERY: detail
-SELECT todoitem_id, incdt_id, todoitem_seq, incdt_number,
+SELECT todoitem_id, incdt_id, incdtpriority_name, incdt_number,
        usr_username, todoitem_name, todoitem_due_date,
        todoitem_start_date, todoitem_status,
        todoitem_description
 FROM usr, todoitem LEFT OUTER JOIN
      incdt ON (todoitem_incdt_id = incdt_id)
+     LEFT OUTER JOIN incdtpriority ON (incdtpriority_id=todoitem_priority_id)
 WHERE ((usr_id=todoitem_usr_id)
 <? if not exists("showInactive") ?>
   AND todoitem_active
 <? endif ?>
 <? if not exists("showCompleted") ?>
   AND todoitem_status != 'C'
 <? endif ?>
 <? if exists("usr_id") ?>
   AND (usr_id=<? value("usr_id") ?>)
 <? elseif exists("usr_pattern") ?>
   AND (usr_username ~* <? value("usr_pattern") ?>)
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
-) ORDER BY usr_username, todoitem_seq;
+) ORDER BY usr_username, incdtpriority_order;


 --------------------------------------------------------------------
 REPORT: TodoList
 QUERY: detail
-SELECT todoitem_id AS id, todoitem_usr_id AS altId,
-       'T' AS type, todoitem_seq AS seq,
+SELECT todoitem_id AS id, 1 AS altId, todoitem_owner_username AS owner,
+		       <? value("todo") ?> AS type, incdtpriority_order AS seq, incdtpriority_name AS priority,
        todoitem_name AS name,
        firstLine(todoitem_description) AS descrip,
-       todoitem_status AS status, todoitem_due_date AS due,
-       usr_username AS usr, incdt_number AS incdt
-FROM usr, todoitem LEFT OUTER JOIN
-     incdt ON (incdt_id=todoitem_incdt_id)
-WHERE ( (todoitem_usr_id=usr_id)
-  AND   (todoitem_due_date BETWEEN <? value("startDate") ?>
-                               AND <? value("endDate") ?>)
+           todoitem_status AS status, todoitem_start_date as start,
+		       todoitem_due_date AS due, formatDate(todoitem_due_date) AS f_due,
+		       usr_username AS usr, CAST(incdt_number AS text) AS number, cust_number AS cust,
+           CASE WHEN (todoitem_status != 'C'AND
+                      todoitem_due_date < CURRENT_DATE) THEN 'expired'
+                WHEN (todoitem_status != 'C'AND
+                      todoitem_due_date > CURRENT_DATE) THEN 'future'
+           END AS due_qtforegroundrole
+		FROM usr, todoitem LEFT OUTER JOIN incdt ON (incdt_id=todoitem_incdt_id)
+		                   LEFT OUTER JOIN crmacct ON (crmacct_id=todoitem_crmacct_id)
+		                   LEFT OUTER JOIN cust ON (cust_id=crmacct_cust_id)
+                       LEFT OUTER JOIN incdtpriority ON (incdtpriority_id=todoitem_priority_id)
+		WHERE ( (todoitem_usr_id=usr_id)
+      <? if exists("startStartDate") ?>
+      AND (todoitem_start_date BETWEEN <? value("startStartDate") ?>
+		                             AND <? value("startEndDate") ?>)
+      <? endif ?>
+      <? if exists("dueStartDate") ?>
+		  AND   (todoitem_due_date BETWEEN <? value("dueStartDate") ?>
+		                               AND <? value("dueEndDate") ?>)
+  	  <? endif ?>
   <? if not exists("completed") ?>
   AND   (todoitem_status != 'C')
   <? endif ?>
   <? if exists("usr_id") ?>
-  AND (todoitem_usr_id=<? value("usr_id") ?>)
-  <? elseif exists("usr_pattern") ?>
-  AND (todoitem_usr_id IN (SELECT usr_id
-        FROM usr
-        WHERE (usr_username ~ <? value("usr_pattern") ?>)))
+		  AND (usr_id=<? value("usr_id") ?>)
+		  <? elseif exists("usr_pattern" ?>
+		  AND (usr_username ~ <? value("usr_pattern") ?>)
   <? endif ?>
-  <? if exists("active") ?>AND (todoitem_active) <? endif ?>
+		  <? if not exists("completed") ?>AND (todoitem_active) <? endif ?>
        )
-<? if exists("incidents")?>
-UNION
-SELECT incdt_id AS id, usr_id AS altId,
-       'I' AS type, NULL AS seq,
+		<? if exists("incidents")?>
+    <? if not exists("dueStartDate") ?>
+		UNION
+		SELECT incdt_id AS id, 2 AS altId, incdt_owner_username AS owner,
+		       <? value("incident") ?> AS type, incdtpriority_order AS seq, incdtpriority_name AS priority,
        incdt_summary AS name,
        firstLine(incdt_descrip) AS descrip,
-       incdt_status AS status,  NULL AS due,
-       incdt_assigned_username AS usr, incdt_number AS incdt
-FROM incdt LEFT OUTER JOIN usr ON (usr_username=incdt_assigned_username)
-WHERE ((incdt_timestamp BETWEEN <? value("incdtStartDate") ?>
-                            AND <? value("incdtEndDate") ?>)
+           incdt_status AS status, CAST(incdt_timestamp AS date) AS start,
+		       null AS due, null AS f_due,
+		       incdt_assigned_username AS usr, CAST(incdt_number AS text) AS number, cust_number AS cust,
+                       NULL AS due_qtforegroundrole
+		FROM incdt LEFT OUTER JOIN usr ON (usr_username=incdt_assigned_username)
+		           LEFT OUTER JOIN crmacct ON (crmacct_id=incdt_crmacct_id)
+		           LEFT OUTER JOIN cust ON (cust_id=crmacct_cust_id)
+               LEFT OUTER JOIN incdtpriority ON (incdtpriority_id=incdt_incdtpriority_id)
+		WHERE ((true)
+      <? if exists("startStartDate") ?>
+      AND (incdt_timestamp BETWEEN <? value("startStartDate") ?>
+		                            AND <? value("startEndDate") ?>)
+      <? endif ?>
   <? if not exists("completed") ?>
    AND (incdt_status != 'L')
   <? endif ?>
   <? if exists("usr_id") ?>
   AND (usr_id=<? value("usr_id") ?>)
   <? elseif exists("usr_pattern" ?>
-  AND (usr_id IN (SELECT usr_id
-        FROM usr
-        WHERE (usr_username ~ <? value("usr_pattern") ?>)))
+		  AND (usr_username ~ <? value("usr_pattern") ?>)
   <? endif ?>
        )
-<? endif ?>
-ORDER BY seq, usr;
+		<? endif ?>
+    <? endif ?>
+		<? if exists("projects")?>
+		UNION
+		SELECT prjtask_id AS id, 3 AS altId, prjtask_owner_username AS owner,
+		       <? value("task") ?> AS type, NULL AS seq, NULL AS priority,
+		       prjtask_number || '-' || prjtask_name AS name,
+		       firstLine(prjtask_descrip) AS descrip,
+		       prjtask_status AS status,  prjtask_start_date AS start,
+           prjtask_due_date AS due, formatDate(prjtask_due_date) AS f_due,
+		       usr_username AS usr, prj_number, '' AS cust,
+           CASE WHEN (prjtask_status != 'C'AND
+                      prjtask_due_date < CURRENT_DATE) THEN 'expired'
+                WHEN (prjtask_status != 'C'AND
+                      prjtask_due_date > CURRENT_DATE) THEN 'future'
+           END AS due_qtforegroundrole
+		FROM prj, prjtask LEFT OUTER JOIN usr ON (usr_id=prjtask_usr_id)
+		WHERE ((prj_id=prjtask_prj_id)
+      <? if exists("startStartDate") ?>
+      AND (prjtask_start_date BETWEEN <? value("startStartDate") ?>
+		                             AND <? value("startEndDate") ?>)
+      <? endif ?>
+      <? if exists("dueStartDate") ?>
+      AND (prjtask_due_date BETWEEN <? value("dueStartDate") ?>
+		                             AND <? value("dueEndDate") ?>)
+      <? endif ?>
+		  <? if not exists("completed") ?>
+		  AND (prjtask_status != 'L')
+		  <? endif ?>
+		  <? if exists("usr_id") ?>
+		  AND (usr_id=<? value("usr_id") ?>)
+		  <? elseif exists("usr_pattern" ?>
+		  AND (usr_username ~ <? value("usr_pattern") ?>)
+		  <? endif ?>
+		       )
+  	UNION
+		SELECT prj_id AS id, 4 AS altId, prj_owner_username AS owner,
+		       <? value("project") ?> AS type, NULL AS seq, NULL AS priority,
+		       prj_number || '-' || prj_name AS name,
+		       firstLine(prj_descrip) AS descrip,
+		       prj_status AS status,  prj_start_date AS start,
+           prj_due_date AS due, formatDate(prj_due_date) AS f_due,
+		       usr_username AS usr, NULL AS number, '' AS cust,
+           CASE WHEN (prj_status != 'C'AND
+                      prj_due_date < CURRENT_DATE) THEN 'expired'
+                WHEN (prj_status != 'C'AND
+                      prj_due_date > CURRENT_DATE) THEN 'future'
+           END AS due_qtforegroundrole
+		FROM prj LEFT OUTER JOIN usr ON (usr_id=prj_usr_id)
+		WHERE ((true)
+      <? if exists("startStartDate") ?>
+      AND (prj_start_date BETWEEN <? value("startStartDate") ?>
+		                             AND <? value("startEndDate") ?>)
+      <? endif ?>
+      <? if exists("dueStartDate") ?>
+      AND (prj_due_date BETWEEN <? value("dueStartDate") ?>
+		                             AND <? value("dueEndDate") ?>)
+      <? endif ?>
+		  <? if not exists("completed") ?>
+		  AND (prj_status != 'L')
+		  <? endif ?>
+		  <? if exists("usr_id") ?>
+		  AND (usr_id=<? value("usr_id") ?>)
+		  <? elseif exists("usr_pattern" ?>
+		  AND (usr_username ~ <? value("usr_pattern") ?>)
+		  <? endif ?>
+		       )
+		<? endif ?>
+		ORDER BY due, seq, usr;
 --------------------------------------------------------------------

 QUERY: queryParams
 SELECT
+  <? if exists("startStartDate") ?>
+  formatDate(<? value("startStartDate") ?>) AS f_startStartDate,
+  formatDate(<? value("startEndDate") ?>) AS f_startEndDate,
+  <? else ?>
+  'All' AS f_startStartDate,
+  'All' AS f_startEndDate,
+  <? endif ?>
+  <? if exists("dueStartDate") ?>
+  formatDate(<? value("dueStartDate") ?>) AS f_dueStartDate,
+  formatDate(<? value("dueEndDate") ?>) AS f_dueEndDate,
+  <? else ?>
+  'All' AS f_dueStartDate,
+  'All' AS f_dueEndDate,
+  <? endif ?>
   <? if exists("completed") ?> 'Yes' <? else ?> 'No' <? endif ?> AS showClosed,
-  <? if exists("active") ?>    'Yes' <? else ?> 'No' <? endif ?> AS activeOnly,
+  <? if exists("projects") ?>    'Yes' <? else ?> 'No' <? endif ?> AS showTasks,
   <? if exists("incidents") ?> 'Yes' <? else ?> 'No' <? endif ?> AS showIncdts,
   <? if exists("usr_id") ?>
     usr_username FROM usr WHERE usr_id = <? value("usr_id") ?>
   <? elseif exists("usr_pattern") ?>
     <? value("usr_pattern") ?> AS usr_username
   <? else ?>
     'All' AS usr_username
   <? endif ?>
 ;


 --------------------------------------------------------------------
 REPORT: UnappliedAPCreditMemos
 QUERY: detail
 SELECT apopen_id, apopen_docnumber,
        (vend_number || '-' || vend_name) AS vendor,
        formatMoney(apopen_amount) AS f_amount,
        formatMoney(apopen_paid) AS f_paid,
        formatMoney(apopen_amount - apopen_paid) AS f_balance
 FROM apopen, vend
 WHERE ( (apopen_doctype='C')
  AND (apopen_open)
- AND (apopen_vend_id=vend_id) )
+ AND (apopen_vend_id=vend_id)
+<? if exists("vend_id") ?>
+   AND (vend_id=<? value("vend_id") ?>)
+<? elseif exists("vendtype_id") ?>
+   AND (vend_vendtype_id=<? value("vendtype_id") ?>)
+<? elseif exists("vendtype_pattern") ?>
+   AND (vend_vendtype_id IN (SELECT vendtype_id
+                               FROM vendtype
+                              WHERE (vendtype_code ~ <? value("vendtype_pattern") ?>)))
+<? endif ?>
+)
 ORDER BY apopen_docnumber;


 --------------------------------------------------------------------
 REPORT: UninvoicedReceipts
 QUERY: detail
 SELECT porecv_id,
        formatDate(porecv_date) as f_date,
        getUsername(porecv_trans_usr_id) as f_user,
        porecv_ponumber AS f_ponumber, poitem_linenumber,
        vend_name,
        COALESCE(item_number, ('Misc. - ' || porecv_vend_item_number)) AS item_number,
        formatQty(porecv_qty) as f_qty,
        'Receipt' AS f_type,
        porecv_value AS value,
        formatMoney(porecv_value) AS f_value
   FROM porecv
     LEFT OUTER JOIN itemsite ON (porecv_itemsite_id=itemsite_id)
     LEFT OUTER JOIN item ON (itemsite_item_id=item_id),
     poitem, vend
  WHERE ((porecv_poitem_id=poitem_id)
    AND  (porecv_vend_id=vend_id)
    AND  (porecv_posted)
+   AND  (porecv_vohead_id IS NULL)
    AND  (NOT porecv_invoiced)
 <? if exists("warehous_id") ?>
    AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("agentUsername") ?>
    AND  (porecv_agent_username=<? value("agentUsername") ?>)
 <? endif ?>
 )
 UNION
 SELECT poreject_id,
        formatDate(poreject_date) as f_date,
        getUsername(poreject_trans_usr_id) as f_user,
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
 REPORT: ViewAPCheckRunEditList
 QUERY: detail
-SELECT checkhead_amount AS amt_check,
-       currtobase(checkhead_curr_id,checkhead_amount,checkhead_checkdate) AS base_amt_check,
+SELECT CASE WHEN checkhead_void THEN 0
+                   ELSE checkhead_amount END AS amt_check,
+              CASE WHEN checkhead_void THEN 0
+                   ELSE currToBase(checkhead_curr_id,checkhead_amount,
+                                   checkhead_checkdate)
+              END AS base_amt_check,
        checkhead_id AS primaryid,
        -1 AS secondaryid,
        formatBoolYN(checkhead_void) AS f_void,
        formatBoolYN(checkhead_printed) AS f_printed,
        TEXT(checkhead_number) AS number,
        (checkrecip_number || '-' || checkrecip_name) AS description,
        formatDate(checkhead_checkdate) AS f_checkdate,
        formatMoney(checkhead_amount) AS f_amount,
        formatMoney(currtobase(checkhead_curr_id,checkhead_amount,checkhead_checkdate)) AS f_baseamount,
        currconcat(checkhead_curr_id) AS currAbbr,
        checkhead_number,
        1 AS orderby
   FROM checkhead LEFT OUTER JOIN
        checkrecip ON ((checkrecip_id=checkhead_recip_id)
 		 AND  (checkrecip_type=checkhead_recip_type))
  WHERE ((checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
    AND  (NOT checkhead_posted)
    AND  (NOT checkhead_replaced)
-   AND  (NOT checkhead_deleted) )
+   AND  (NOT checkhead_deleted)
+<? if exists("vend_id") ?>
+   AND (checkrecip_type='V')
+   AND (checkrecip_id=<? value("vend_id") ?>)
+<? elseif exists("vendtype_id") ?>
+   AND (checkrecip_type='V')
+   AND (checkrecip_id IN (SELECT vend_id
+                          FROM vendinfo
+                          WHERE (vend_vendtype_id=<? value("vendtype_id") ?>)))
+<? elseif exists("vendtype_pattern") ?>
+   AND (checkrecip_type='V')
+   AND (checkrecip_id IN (SELECT vend_id
+                          FROM vendinfo, vendtype
+                          WHERE ((vend_vendtype_id=vendtype_id)
+                             AND (vendtype_code ~ <? value("vendtype_pattern") ?>))))
+<? endif ?>
+   )

 UNION SELECT 0 AS amt_check,
              0 AS base_amt_check,
              checkitem_checkhead_id AS primaryid,
              checkitem_id AS secondaryid,
              '' AS f_void,
              '' AS f_printed,
              CASE WHEN (checkitem_ranumber IS NOT NULL) THEN checkitem_ranumber::TEXT
 	          ELSE checkitem_vouchernumber
 	     END AS number,
              CASE WHEN (checkitem_cmnumber IS NOT NULL) THEN checkitem_cmnumber::TEXT
 	          ELSE checkitem_invcnumber
 	     END AS description,
              '' AS f_checkdate,
              formatMoney(checkitem_amount) AS f_amount,
              formatMoney(currtobase(checkitem_curr_id,checkitem_amount,checkhead_checkdate)) AS f_baseamount,
              currconcat(checkitem_curr_id) AS currAbbr,
              checkhead_number,
              2 AS orderby
         FROM checkitem, checkhead
        WHERE ( (checkitem_checkhead_id=checkhead_id)
          AND (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
          AND (NOT checkhead_posted)
          AND (NOT checkhead_replaced)
-         AND (NOT checkhead_deleted) )
-
+         AND (NOT checkhead_deleted)
+<? if exists("vend_id") ?>
+         AND (checkhead_recip_type='V')
+         AND (checkhead_recip_id=<? value("vend_id") ?>)
+<? elseif exists("vendtype_id") ?>
+         AND (checkhead_recip_type='V')
+         AND (checkhead_recip_id IN (SELECT vend_id
+                                FROM vendinfo
+                                WHERE (vend_vendtype_id=<? value("vendtype_id") ?>)))
+<? elseif exists("vendtype_pattern") ?>
+         AND (checkhead_recip_type='V')
+         AND (checkhead_recip_id IN (SELECT vend_id
+                                FROM vendinfo, vendtype
+                                WHERE ((vend_vendtype_id=vendtype_id)
+                                   AND (vendtype_code ~ <? value("vendtype_pattern") ?>))))
+<? endif ?>
+              )
 ORDER BY checkhead_number, primaryid, orderby;