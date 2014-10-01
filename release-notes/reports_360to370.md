--------------------------------------------------------------------
REMOVED REPORTS:
BacklogByCustomer
BacklogByItemNumber
BacklogByParameterList
BacklogBySalesOrder
BookingsByCustomer
BookingsByCustomerGroup
BookingsByItem
BookingsByProductCategory
BookingsBySalesRep
BookingsByShipTo
BriefSalesHistoryByCustomer
BriefSalesHistoryByCustomerType
CustomersByCharacteristic
CustomersByCustomerType
InventoryAvailabilityByItem
InventoryAvailabilityByParameterList
ItemSitesByItem
ItemSitesByParameterList
ItemSourceMasterList
ItemSourcesByItem
ItemSourcesByVendor
ItemsByCharacteristic
ItemsByClassCode
ItemsByProductCategory
QOHByItem
QOHByParameterList
SalesHistoryByBilltoName
SalesHistoryByCustomer
SalesHistoryByItem
SalesHistoryByParameterList
SalesHistoryBySalesRep
SalesHistoryByShipTo
SummarizedSalesByCustomerType
SummarizedSalesHistoryByCustomer
SummarizedSalesHistoryByCustomerByItem
SummarizedSalesHistoryByCustomerTypeByItem
SummarizedSalesHistoryByItem
SummarizedSalesHistoryBySalesRep
SummarizedSalesHistoryByShippingZone
TimePhasedBookingsByCustomer
TimePhasedBookingsByItem
TimePhasedBookingsByProductCategory
TimePhasedSalesHistoryByCustomer
TimePhasedSalesHistoryByCustomerByItem
TimePhasedSalesHistoryByCustomerGroup
TimePhasedSalesHistoryByItem
TimePhasedSalesHistoryByProductCategory
UsageStatisticsByClassCode
UsageStatisticsByItem
UsageStatisticsByItemGroup
UsageStatisticsByWarehouse
WOScheduleByParameterList
--------------------------------------------------------------------
NEW REPORTS:
Backlog
Bookings
BriefSalesHistory
Customers
InventoryAvailability
ItemSites
ItemSources
QOH
ReceivingLabelOrder
SalesHistory
SummarizedSalesHistory
TimePhasedBookings
TimePhasedSalesHistory
UsageStatistics
WOSchedule
Items
--------------------------------------------------------------------
CHANGED REPORTS:
AROpenItems
AddressesMasterList
CashReceiptsEditList
CountSlipsByWarehouse
CustOrderAcknowledgement
FinancialReport
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
FinancialTrend
GLTransactions
IncidentWorkbenchList
InventoryAvailabilityBySourceVendor
InventoryHistory
OrderActivityByProject
POLineItemsByVendor
PackingList-Shipment
PackingList
PendingBOMChanges
PickingListSOClosedLines
PickingListSOLocsNoClosedLines
PickingListSONoClosedLines
Quote
SalesOrderAcknowledgement
SingleLevelWhereUsed
TodoList
WOHistoryByClassCode
WOHistoryByNumber


 --------------------------------------------------------------------
 REPORT: AROpenItems
 QUERY: head
 SELECT
-formatDate(<? value("asofDate") ?>) AS asOfDate,
+CASE WHEN (<? value("asofDate") ?> = endOfTime()) THEN 'Latest'
+     ELSE formatDate(<? value("asofDate") ?>) END AS asOfDate,
 <? if exists("creditsOnly") ?>
   'Credits Only' AS type,
 <? elseif exists("debitsOnly") ?>
   'Debits Only' AS type,
 <? else ?>
   'Debits and Credits' AS type,
 <? endif ?>
 <? if exists("cust_id") ?>
   (SELECT cust_name FROM custinfo WHERE cust_id=<? value("cust_id") ?>) AS selection,
 <? elseif exists("custtype_id") ?>
   (SELECT custtype_code FROM custtype WHERE custtype_id=<? value("custtype_id") ?>) AS selection,
 <? elseif exists("custtype_pattern") ?>
   ('Customer Type pattern = ' || <? value("custtype_pattern") ?>) AS selection,
 <? elseif exists("custgrp_id") ?>
   (SELECT custgrp_name FROM custgrp WHERE
  custgrp_id=<? value("custgrp_id") ?>) AS selection,
 <? else ?>
   'All Customers' AS selection,
 <? endif ?>
 <? if exists("startDate") ?>
       'Start Doc Date:' AS start_label,
       'End Doc Date:' AS end_label,
 <? else ?>
       'Start Due Date:' AS start_label,
       'End Due Date:' AS end_label,
 <? endif ?>
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        currConcat(baseCurrId()) AS baseAbbr,
 <? if exists("incidentsOnly") ?>
   'Yes' AS incidentsOnly
 <? else ?>
   'No' AS incidentsOnly
 <? endif ?>;


 --------------------------------------------------------------------
 REPORT: AddressesMasterList
 QUERY: detail
+SELECT *
+FROM (
 SELECT 'Contact' AS type, cntct_first_name AS first,
        cntct_last_name AS last, crmacct_number, cntct_phone AS phone,
        cntct_email AS email, cntct_fax AS fax, addr.*
 FROM addr, cntct LEFT OUTER JOIN crmacct ON (cntct_crmacct_id=crmacct_id)
 WHERE (cntct_addr_id=addr_id)
-  <? if exists("activeOnly") ?> AND addr_active <? endif ?>
 UNION
 SELECT 'Ship-To' AS type, shipto_num AS first,
        shipto_name AS last, crmacct_number, '' AS phone,
        '' AS email, '' AS fax, addr.*
 FROM addr, shiptoinfo LEFT OUTER JOIN crmacct ON (shipto_cust_id=crmacct_cust_id
 )
 WHERE (shipto_addr_id=addr_id)
-  <? if exists("activeOnly") ?> AND addr_active <? endif ?>
 UNION
 SELECT 'Vendor' AS type, vend_number AS first,
        vend_name AS last, crmacct_number, '' AS phone,
        '' AS email, '' AS fax, addr.*
 FROM addr, vendinfo LEFT OUTER JOIN crmacct ON (vend_id=crmacct_vend_id)
 WHERE (vend_addr_id=addr_id)
-  <? if exists("activeOnly") ?> AND addr_active <? endif ?>
 UNION
 SELECT 'Vendor Address' AS type, vendaddr_code AS first,
        vendaddr_name AS last, crmacct_number, '' AS phone,
        '' AS email, '' AS fax, addr.*
 FROM addr, vendaddrinfo LEFT OUTER JOIN crmacct ON (vendaddr_vend_id=crmacct_vend_id)
 WHERE (vendaddr_addr_id=addr_id)
-  <? if exists("activeOnly") ?> AND addr_active <? endif ?>
 UNION
 SELECT 'Site' AS type, warehous_code AS first,
        warehous_descrip AS last, '' AS crmacct_number, '' AS phone,
        '' AS email, '' AS fax, addr.*
 FROM addr, whsinfo
 WHERE (warehous_addr_id=addr_id)
-  <? if exists("activeOnly") ?> AND addr_active <? endif ?>

 UNION
 SELECT '' AS type, '' AS first, '' AS last,
        '' AS crmacct_number, '' AS phone,
        '' AS email,
        '' AS fax, addr.*
 FROM addr
 WHERE addr_id NOT IN (
             SELECT cntct_addr_id FROM cntct WHERE (cntct_addr_id IS NOT NULL)
             UNION SELECT shipto_addr_id FROM shiptoinfo WHERE (shipto_addr_id IS NOT NULL)
             UNION SELECT vend_addr_id FROM vendinfo WHERE (vend_addr_id IS NOT NULL)
             UNION SELECT vendaddr_addr_id FROM vendaddrinfo WHERE (vendaddr_addr_id IS NOT NULL)
             UNION SELECT warehous_addr_id FROM whsinfo WHERE (warehous_addr_id IS NOT NULL))
-<? if exists("activeOnly") ?> AND addr_active <? endif ?>
+) data
+<? foreach("char_id_text_list") ?>
+  LEFT OUTER JOIN charass charass_alias<? literal("char_id_text_list") ?> ON ((charass_alias<? literal("char_id_text_list") ?>.charass_target_type='ADDR')
+                                                                    AND  (charass_alias<? literal("char_id_text_list") ?>.charass_target_id=addr_id)
+                                                                    AND  (charass_alias<? literal("char_id_text_list") ?>.charass_char_id=<? value("char_id_text_list") ?>))
+  LEFT OUTER JOIN char char_alias<? literal("char_id_text_list") ?> ON (charass_alias<? literal("char_id_text_list") ?>.charass_char_id=char_alias<? literal("char_id_text_list") ?>.char_id)
+<? endforeach ?>
+<? foreach("char_id_list_list") ?>
+  LEFT OUTER JOIN charass charass_alias<? literal("char_id_list_list") ?> ON ((charass_alias<? literal("char_id_list_list") ?>.charass_target_type='ADDR')
+                                                                    AND  (charass_alias<? literal("char_id_list_list") ?>.charass_target_id=addr_id)
+                                                                    AND  (charass_alias<? literal("char_id_list_list") ?>.charass_char_id=<? value("char_id_list_list") ?>))
+  LEFT OUTER JOIN char char_alias<? literal("char_id_list_list") ?> ON (charass_alias<? literal("char_id_list_list") ?>.charass_char_id=char_alias<? literal("char_id_list_list") ?>.char_id)
+<? endforeach ?>
+<? foreach("char_id_date_list") ?>
+  LEFT OUTER JOIN charass charass_alias<? literal("char_id_date_list") ?> ON ((charass_alias<? literal("char_id_date_list") ?>.charass_target_type='ADDR')
+                                                                    AND  (charass_alias<? literal("char_id_date_list") ?>.charass_target_id=addr_id)
+                                                                    AND  (charass_alias<? literal("char_id_date_list") ?>.charass_char_id=<? value("char_id_date_list") ?>))
+  LEFT OUTER JOIN char char_alias<? literal("char_id_date_list") ?> ON (charass_alias<? literal("char_id_date_list") ?>.charass_char_id=char_alias<? literal("char_id_date_list") ?>.char_id)
+<? endforeach ?>
+WHERE true
+<? if not exists("showInactive") ?> AND addr_active <? endif ?>
+<? literal("charClause") ?>
 ORDER BY addr_country, addr_state, addr_city,
          addr_postalcode, addr_line1, addr_line2,
          addr_line3, type, last, first;


 --------------------------------------------------------------------
 REPORT: CashReceiptsEditList
 QUERY: detail
 SELECT cashrcpt_id, 1 AS orderBy,
        cust_number, cust_name,
        formatDate(cashrcpt_distdate) AS f_distdate,
-       CASE WHEN (cashrcpt_fundstype = 'C') THEN 'Check'
-            WHEN (cashrcpt_fundstype = 'T') THEN 'Certified Check'
-            WHEN (cashrcpt_fundstype = 'M') THEN 'Master Card'
-            WHEN (cashrcpt_fundstype = 'V') THEN 'Visa'
-            WHEN (cashrcpt_fundstype = 'A') THEN 'American Express'
-            WHEN (cashrcpt_fundstype = 'D') THEN 'Discover Card'
-            WHEN (cashrcpt_fundstype = 'R') THEN 'Other Credit Card'
-            WHEN (cashrcpt_fundstype = 'K') THEN 'Cash'
-            WHEN (cashrcpt_fundstype = 'W') THEN 'Wire Transfer'
-            ELSE 'Other'
+       CASE WHEN (cashrcpt_fundstype = 'C') THEN <? value("check") ?>
+            WHEN (cashrcpt_fundstype = 'T') THEN <? value("certifiedCheck") ?>
+            WHEN (cashrcpt_fundstype = 'M') THEN <? value("masterCard") ?>
+            WHEN (cashrcpt_fundstype = 'V') THEN <? value("visa") ?>
+            WHEN (cashrcpt_fundstype = 'A') THEN <? value("americanExpress") ?>
+            WHEN (cashrcpt_fundstype = 'D') THEN <? value("discoverCard") ?>
+            WHEN (cashrcpt_fundstype = 'R') THEN <? value("otherCreditCard") ?>
+            WHEN (cashrcpt_fundstype = 'K') THEN <? value("cash") ?>
+            WHEN (cashrcpt_fundstype = 'W') THEN <? value("wireTransfer") ?>
+            ELSE <? value("other") ?>
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
   AND   (cashrcpt_cust_id=cust_id)
-  AND   (NOT cashrcpt_posted) )
+  AND   (NOT cashrcpt_posted)
+  AND   (NOT cashrcpt_void) )

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
   AND   (cashrcptitem_aropen_id=aropen_id)
-  AND   (NOT cashrcpt_posted) )
+  AND   (NOT cashrcpt_posted)
+  AND   (NOT cashrcpt_void) )

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
   AND   (cashrcptmisc_accnt_id=accnt_id)
-  AND   (NOT cashrcpt_posted) )
+  AND   (NOT cashrcpt_posted)
+  AND   (NOT cashrcpt_void) )

 ORDER BY cashrcpt_id, orderBy;


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
        ('( ' || cntslip_username || ' )') AS enteredby,
        formatQty(cntslip_qty) AS f_qtycounted,
        formatBoolYN(cntslip_posted) AS f_posted
   FROM cntslip, invcnt, itemsite, item, warehous
  WHERE ((cntslip_cnttag_id=invcnt_id)
    AND (invcnt_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
-   AND (cntslip_entered BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+   AND (cntslip_entered BETWEEN <? value("startDate") ?> AND (<? value("endDate") ?>::DATE + 1))
 <? if not exists("showUnposted") ?>
    AND (cntslip_posted)
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY slipnum;


 --------------------------------------------------------------------
 REPORT: CustOrderAcknowledgement
 QUERY: detail
-SELECT 1 AS groupby,
-       coitem_linenumber,
-       coitem_memo,
-       CASE WHEN (coitem_custpn != '') THEN coitem_custpn
-            ELSE item_number
-       END AS item_number,
-       formatitemsitebarcode(itemsite_id) AS item_barcode,
---     In 2.3 replaced the next line:
---     uom_name,
---     with:
-       (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
-       itemSellingUOM(item_id) AS item_shipuom,
-       CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip1
-            ELSE item_descrip1
-       END AS item_descrip1,
-       CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip2
-            ELSE item_descrip2
-       END AS item_descrip2,
-       formatQty(coitem_qtyord) AS ordered,
-       formatMoney(coitem_price) as unitprice,
-       formatMoney(coitem_qtyord * coitem_price) AS f_extprice,
-       formatQty(coitem_qtyshipped - coitem_qtyreturned) AS shipped,
-       formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS balance,
-       formatQty( ( SELECT COALESCE(SUM(coship_qty), 0)
-                    FROM coship, cosmisc
-                    WHERE ( (coship_coitem_id=coitem_id)
-                     AND (coship_cosmisc_id=cosmisc_id)
-                     AND (NOT cosmisc_shipped) ) ) ) AS atshipping,
-       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) / itemInvPriceRat(item_id))) AS shipordered,
-       formatQty(roundUp(((coitem_qtyshipped - coitem_qtyreturned) * coitem_qty_invuomratio) / itemInvPriceRat(item_id))) AS shipshipped,
-       formatQty(roundUp((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) / itemInvPriceRat(item_id))) AS shipbalance,
-       formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
-                            FROM coship, cosmisc
-                            WHERE ( (coship_coitem_id=coitem_id)
-                              AND (coship_cosmisc_id=cosmisc_id)
-                              AND (NOT cosmisc_shipped) ) )/ itemInvPriceRat(item_id) ) ) AS shipatshipping,
-       CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
-            WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
-                                            FROM cohead, invchead, invcitem
-                                           WHERE ((invchead_ordernumber=cohead_number)
-                                             AND  (invcitem_invchead_id=invchead_id)
-                                             AND  (invcitem_item_id=item_id)
-                                             AND  (invcitem_warehous_id=itemsite_warehous_id)
-                                             AND  (invcitem_linenumber=coitem_linenumber)
-                                             AND  (cohead_id=coitem_cohead_id))) >= coitem_qtyord)) THEN 'I'
-            WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
-                                            FROM cohead, invchead, invcitem
-                                           WHERE ((invchead_ordernumber=cohead_number)
-                                             AND  (invcitem_invchead_id=invchead_id)
-                                             AND  (invcitem_item_id=item_id)
-                                             AND  (invcitem_warehous_id=itemsite_warehous_id)
-                                             AND  (invcitem_linenumber=coitem_linenumber)
-                                             AND  (cohead_id=coitem_cohead_id))) > 0)) THEN 'P'
-            WHEN (coitem_status='O' AND (itemsite_qtyonhand - qtyAllocated(itemsite_id, CURRENT_DATE)
-                                         + qtyOrdered(itemsite_id, CURRENT_DATE))
-                                          >= (coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) THEN 'R'
-            ELSE coitem_status
-       END AS f_status
-  FROM coitem
-       JOIN itemsite ON (itemsite_id=coitem_itemsite_id)
-       JOIN item ON (item_id=itemsite_item_id)
-       JOIN uom ON (uom_id=item_inv_uom_id)
-       LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=coitem_custpn)
- WHERE ( (coitem_status <> 'X')
-   AND (coitem_status <> 'C')
--- 1 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
-   <? if exists("hide closed") ?>
-   AND (coitem_status <> 'C')
--- 2 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
--- <? endif ?>
-   AND (coitem_cohead_id=<? value("sohead_id") ?>)
-)
---2.3 add coitem_qty_uom_id, to the GROUP BY clause
-GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_id,
-         coitem_custpn, itemalias_usedescrip, itemalias_descrip1, itemalias_descrip2,
-         item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
-         coitem_qtyreturned, coitem_status, coitem_cohead_id,
-         itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id, unitprice,f_extprice
-ORDER BY coitem_linenumber;
+== MetaSQL statement salesOrderItems-list
 --------------------------------------------------------------------

 QUERY: lastupdated
 SELECT formatDate(MAX(lastupdated)) AS f_lastupdated
   FROM (SELECT cohead_lastupdated AS lastupdated
           FROM cohead
-         WHERE (cohead_id=:sohead_id)
+         WHERE (cohead_id=<? value("sohead_id") ?>)
          UNION
         SELECT coitem_lastupdated AS lastupdated
           FROM coitem
          WHERE (coitem_cohead_id=<? value("sohead_id") ?>) ) AS data;


 --------------------------------------------------------------------
 REPORT: FinancialReport
+QUERY: notes
+SELECT flhead_notes AS notes
+FROM flhead
+WHERE ((flhead_id=<? value("flhead_id") ?>)
+  AND (length(flhead_notes) > 0))
+--------------------------------------------------------------------
+

 --------------------------------------------------------------------
 REPORT: FinancialReportMonth
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+
+--------------------------------------------------------------------
+

 --------------------------------------------------------------------
 REPORT: FinancialReportMonthBudget
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+
+

 --------------------------------------------------------------------
 REPORT: FinancialReportMonthDbCr
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+
+--------------------------------------------------------------------
+

 --------------------------------------------------------------------
 REPORT: FinancialReportMonthPriorMonth
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+
+

 --------------------------------------------------------------------
 REPORT: FinancialReportMonthPriorQuarter
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+

 --------------------------------------------------------------------
 REPORT: FinancialReportMonthPriorYear
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+
+

 --------------------------------------------------------------------
 REPORT: FinancialReportMonthQuarter
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+

 --------------------------------------------------------------------
 REPORT: FinancialReportMonthYear
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+

 --------------------------------------------------------------------
 REPORT: FinancialReportQuarter
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+

 --------------------------------------------------------------------
 REPORT: FinancialReportQuarterBudget
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+

 --------------------------------------------------------------------
 REPORT: FinancialReportQuarterPriorQuarter
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+

 --------------------------------------------------------------------
 REPORT: FinancialReportYear
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+

 --------------------------------------------------------------------
 REPORT: FinancialReportYearBudget
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+

 --------------------------------------------------------------------
 REPORT: FinancialReportYearPriorYear
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, flhead_notes AS notes
+FROM flhead
+ JOIN flcol ON (flhead_id=flcol_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, flnotes_notes AS notes
+FROM flnotes
+  JOIN flcol ON (flcol_flhead_id=flnotes_flhead_id)
+WHERE ((flcol_id=<? value("flcol_id") ?>)
+  AND (flnotes_period_id=<? value("period_id") ?>)
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq;
+

 --------------------------------------------------------------------
 REPORT: FinancialTrend
+QUERY: notes
+SELECT * FROM (
+SELECT 1 AS seq, text('Notes') AS label, flhead_notes AS notes,
+  startOfTime() AS period_end
+FROM flhead
+WHERE ((flhead_id=<? value("flhead_id") ?>)
+  AND (length(flhead_notes) > 0))
+UNION ALL
+SELECT 2 AS seq, period_name AS label, flnotes_notes AS notes,
+  period_end
+FROM flnotes
+  JOIN period ON (flnotes_period_id=period_id)
+WHERE ((flnotes_flhead_id=<? value("flhead_id") ?>)
+  AND (
+   <? foreach("period_id_list") ?>
+     <? if not isfirst("period_id_list") ?>
+      OR
+     <? endif ?>
+    (flnotes_period_id=<? value("period_id_list") ?>)
+   <? endforeach ?>
+  )
+  AND (length(flnotes_notes) > 0))) data
+ORDER BY seq, period_end;
+

 --------------------------------------------------------------------
 REPORT: GLTransactions
 QUERY: detail
 <? if exists("beginningBalance") ?>
 SELECT -1 AS gltrans_id,
        <? value("startDate") ?> AS gltrans_created, formatDate(<? value("startDate") ?>) AS transdate,
        '' AS gltrans_source, '' AS gltrans_doctype, '' AS gltrans_docnumber, '' AS invhist_docnumber,
        'Beginning Balance' AS transnotes,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
        CASE WHEN (<? value("beginningBalance") ?> < 0) THEN
                      formatMoney(ABS(<? value("beginningBalance") ?>))
             ELSE ''
        END AS f_debit,
        CASE WHEN (<? value("beginningBalance") ?> < 0) THEN
                      ABS(<? value("beginningBalance") ?>)
             ELSE 0
        END AS debit_amt,

        CASE WHEN (<? value("beginningBalance") ?> > 0) THEN
                      formatMoney(ABS(<? value("beginningBalance") ?>))
             ELSE ''
        END AS f_credit,
        CASE WHEN (<? value("beginningBalance") ?> > 0) THEN
                      ABS(<? value("beginningBalance") ?>)
             ELSE 0
        END AS credit_amt,
        <? value("beginningBalance") ?> * -1 AS balance_amt,
        <? value("beginningBalance") ?> AS gltrans_amount,
        <? value("beginningBalance") ?> AS running,
        NULL AS f_posted,
+       NULL AS f_deleted,
        NULL AS f_username,
        -1 AS gltrans_sequence
  FROM accnt
  WHERE (accnt_id=<? value("accnt_id") ?>)
 UNION
 <? endif ?>

 SELECT gltrans_id,
        gltrans_created, formatDate(gltrans_date) AS transdate,
        gltrans_source, gltrans_doctype, gltrans_docnumber, invhist_docnumber,
        firstLine(gltrans_notes) AS transnotes,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
 -- Debits:
        CASE WHEN (gltrans_amount < 0) THEN formatMoney(ABS(gltrans_amount))
             ELSE ''
        END AS f_debit,
        CASE WHEN (gltrans_amount < 0 AND NOT gltrans_deleted) THEN ABS(gltrans_amount)
             ELSE 0
        END AS debit_amt,
 --Credits:
        CASE WHEN (gltrans_amount > 0) THEN formatMoney(gltrans_amount)
             ELSE ''
        END AS f_credit,
        CASE WHEN (gltrans_amount > 0 AND NOT gltrans_deleted) THEN gltrans_amount
             ELSE 0
        END AS credit_amt,
 --Balance:
        CASE WHEN (NOT gltrans_deleted) THEN
          gltrans_amount * -1
        ELSE 0 END AS balance_amt,
        gltrans_amount,
        CASE WHEN (accnt_type IN ('A','E') AND NOT gltrans_deleted) THEN
          gltrans_amount * -1
        WHEN (NOT gltrans_deleted) THEN
          gltrans_amount
        ELSE 0 END AS running,
        formatBoolYN(gltrans_posted) AS f_posted,
        formatBoolYN(gltrans_deleted) AS f_deleted,
        gltrans_username AS f_username,
        gltrans_sequence
 FROM gltrans JOIN accnt ON (gltrans_accnt_id=accnt_id)
      LEFT OUTER JOIN invhist ON (gltrans_misc_id=invhist_id
                             AND gltrans_docnumber='Misc.')
 <? if exists("company_id") ?>
      JOIN company ON (accnt_company=company_number)
 <? endif ?>
 <? if exists("prfcntr_id") ?>
      JOIN prftcntr ON (accnt_profit=prftcntr_number)
 <? endif ?>
 <? if exists("subaccnt_id") ?>
      JOIN subaccnt ON (accnt_sub=subaccnt_number)
 <? endif ?>
 <? if exists("subType") ?>
      JOIN subaccnttype ON (subaccnttype_code=accnt_subaccnttype_code)
 <? endif ?>
 WHERE (
 <? if exists("startDate") ?>
   <? if exists("endDate") ?>
        (gltrans_date BETWEEN <? value("startDate") ?>
                          AND <? value("endDate") ?>)
   <? else ?>
        (gltrans_date BETWEEN <? value("startDate") ?>
                          AND endoftime())
   <? endif ?>
 <? else ?>
   <? if exists("endDate") ?>
        (gltrans_date BETWEEN startoftime()
                          AND <? value("endDate") ?>)
   <? else ?>
        (gltrans_date BETWEEN startoftime()
                          AND endoftime())
   <? endif ?>
 <? endif ?>
 <? if not exists("showDeleted") ?>
    AND (NOT gltrans_deleted)
 <? endif ?>
 <? if exists("company_id") ?>
    AND (company_id=<? value("company_id") ?>)
 <? endif ?>
 <? if exists("prfcntr_id") ?>
    AND (prftcntr_id=<? value("prfcntr_id") ?>)
 <? endif ?>
 <? if exists("accnt_number") ?>
    AND (accnt_number=<? value("accnt_number") ?>)
 <? endif ?>
 <? if exists("subaccnt_id") ?>
    AND (subaccnt_id=<? value("subaccnt_id") ?>)
 <? endif ?>
 <? if exists("subType") ?>
    AND (subaccnttype_id=<? value("subType") ?>)
 <? endif ?>
 <? if exists("accntType") ?>
    AND (accnt_type= <? value("accntType") ?>)
 <? endif ?>
 <? if exists("accnt_id") ?>
    AND (gltrans_accnt_id=<? value("accnt_id") ?>)
 <? endif ?>
 <? if exists("docnum") ?>
    AND (gltrans_docnumber = case when <? value("docnum") ?> = '' then
  gltrans_docnumber else
 <? value("docnum") ?> end )
 <? endif ?>
 <? if exists("source") ?>
    AND (gltrans_source=<? value("source") ?>)
 <? endif ?>
        )
 ORDER BY gltrans_created <? if not exists("beginningBalance") ?> DESC <? endif ?>,
         gltrans_sequence, gltrans_amount

 ;
 --------------------------------------------------------------------

 --------------------------------------------------------------------
 REPORT: IncidentWorkbenchList
-QUERY: username
-SELECT
-  <? if exists("username") ?>
-    <? value("username") ?> AS usr
-  <? elseif exists("usr_pattern") ?>
-    <? value("usr_pattern") ?> AS usr
-  <? else ?>
-    'ALL' AS usr
-  <? endif ?>
-;

 --------------------------------------------------------------------
 REPORT: InventoryAvailabilityBySourceVendor
 QUERY: head
-SELECT <? if exists("warehous_id") ?>
-         ( SELECT warehous_code
-             FROM warehous
-            WHERE (warehous_id=<? value("warehous_id") ?>) )
-       <? else ?>
-         text('All Sites')
-       <? endif ?>
-       AS warehouse,
-       <? if exists("byDays") ?>
+SELECT <? if exists("byDays") ?>
          (text('Look ahead ') || text(<? value("byDays") ?>) || text(' days'))
        <? elseif exists("byDate") ?>
          (text('Cutoff date ') || formatDate(<? value("byDate") ?>))
        <? elseif exists("byDates") ?>
          (text('Dates from ') || formatDate(<? value("startDate") ?>) || text(' to ') || formatDate(<? value("endDate") ?>))
        <? else ?>
          text('Item Site Lead Time')
        <? endif ?>
-       AS ltcriteria,
-<? if exists("vend_id") ?>
-       text('Vendor:') AS vend_label,
-       vend_name AS vend_value
-  FROM vend
- WHERE (vend_id=<? value("vend_id") ?>)
-<? elseif exists("vendtype_id") ?>
-       text('Vendor Type:') AS vend_label,
-       vendtype_code AS vend_value
-  FROM vendtype
- WHERE (vendtype_id=<? value("vendtype_id") ?>)
-<? elseif exists("vendtype_pattern") ?>
-       text('Vendor Type:') AS vend_label,
-       text(<? value("vendtype_pattern") ?>) AS vend_value
-<? else ?>
-       text('Vendor:') AS vend_label,
-       text('All Vendors') AS vend_value
-<? endif ?>
+       AS ltcriteria
 --------------------------------------------------------------------

 QUERY: detail
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        warehous_code,
        vend_number,
        itemsite_leadtime,
        formatQty(qtyonhand) AS f_qtyonhand,
        formatQty(noNeg(qtyonhand - allocated)) AS f_unallocated,
        formatQty(noNeg(allocated)) AS f_allocated,
        formatQty(ordered) AS f_ordered,
        formatQty(reorderlevel) AS f_reorderlevel,
        formatQty(outlevel) AS f_outlevel,
        (qtyonhand - allocated + ordered) AS available,
        formatQty(qtyonhand - allocated + ordered) AS f_available
-  FROM (SELECT item_number,
-               item_descrip1,
-               item_descrip2,
-               warehous_code,
-               itemsite_leadtime,
-               CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel,
-               CASE WHEN(itemsite_useparams) THEN itemsite_ordertoqty ELSE 0.0 END AS outlevel,
+  FROM (SELECT
+           <? if reExists("[vV]end") ?>
+             DISTINCT
+           <? endif ?>
+             itemsite_id,
+             CASE WHEN (item_type IN ('P', 'O')) THEN 1
+                  WHEN (item_type IN ('M')) THEN 2
+                  ELSE 0
+             END AS altId,
+             item_number, item_descrip1, item_descrip2, item_inv_uom_id,
+             warehous_id, warehous_code, itemsite_leadtime,
                itemsite_qtyonhand AS qtyonhand,
+             CASE WHEN itemsite_useparams THEN itemsite_reorderlevel
+                  ELSE 0.0
+             END AS reorderlevel,
+             CASE WHEN itemsite_useparams THEN itemsite_ordertoqty
+                  ELSE 0.0
+             END AS outlevel,
+             <? if exists("byVend") ?>
                vend_number,
-<? if exists("byDays") ?>
-               qtyAllocated(itemsite_id, <? value("byDays") ?>) AS allocated,
-               qtyOrdered(itemsite_id, <? value("byDays") ?>) AS ordered
-<? elseif exists("byDate") ?>
+             <? else ?>
+               NULL AS vend_number,
+             <? endif ?>
+             <? if exists("byLeadTime") ?>
+               qtyAllocated(itemsite_id, itemsite_leadtime) AS allocated,
+               qtyOrdered(itemsite_id,   itemsite_leadtime) AS ordered,
+               qtypr(itemsite_id,   itemsite_leadtime) AS requests
+             <? elseif exists("byDays") ?>
+               qtyAllocated(itemsite_id, CAST(<? value("byDays") ?> AS INTEGER)) AS allocated,
+               qtyOrdered(itemsite_id,   CAST(<? value("byDays") ?> AS INTEGER)) AS ordered,
+               qtypr(itemsite_id,   CAST(<? value("byDays") ?> AS INTEGER)) AS requests
+             <? elseif exists("byDate") ?>
                qtyAllocated(itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) AS allocated,
-               qtyOrdered(itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) AS ordered
-<? elseif exists("byDates") ?>
+               qtyOrdered(itemsite_id,   (<? value("byDate") ?> - CURRENT_DATE)) AS ordered,
+               qtypr(itemsite_id,   (<? value("byDate") ?> - CURRENT_DATE)) AS requests
+             <? elseif exists("byDates") ?>
                qtyAllocated(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>) AS allocated,
-               qtyOrdered(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>) AS ordered
-<? else ?>
-               qtyAllocated(itemsite_id, itemsite_leadtime) AS allocated,
-               qtyOrdered(itemsite_id, itemsite_leadtime) AS ordered
-<? endif ?>
-          FROM item, itemsite, warehous, vend, itemsrc
-         WHERE ((itemsite_active)
+               qtyOrdered(itemsite_id,   <? value("startDate") ?>, <? value("endDate") ?>) AS ordered,
+               qtypr(itemsite_id,   <? value("startDate") ?>, <? value("endDate") ?>) AS requests
+             <? endif ?>
+      FROM item, itemsite, warehous
+           <? if reExists("[vV]end") ?>
+             , vend JOIN itemsrc ON (itemsrc_vend_id=vend_id)
+           <? endif ?>
+      WHERE ( (itemsite_active)
            AND (itemsite_item_id=item_id)
-           AND (itemsrc_item_id=item_id)
            AND (itemsite_warehous_id=warehous_id)
-           AND (itemsrc_vend_id=vend_id)
-<? if exists("vend_id") ?>
+          <? if exists("warehous_id") ?>
+            AND (warehous_id=<? value("warehous_id") ?>)
+          <? endif ?>
+          <? if exists("item_id") ?>
+            AND (item_id=<? value("item_id") ?>)
+          <? elseif exists("classcode_id") ?>
+            AND (item_classcode_id=<? value("classcode_id") ?>)
+          <? elseif exists("classcode_pattern") ?>
+            AND (item_classcode_id IN (SELECT classcode_id
+                                       FROM classcode
+                                       WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
+          <? elseif exists("plancode_id") ?>
+            AND (itemsite_plancode_id=<? value("plancode_id") ?>)
+          <? elseif exists("plancode_pattern") ?>
+            AND (itemsite_plancode_id IN (SELECT plancode_id
+                                          FROM plancode
+                                          WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
+          <? elseif exists("itemgrp_id") ?>
+            AND (item_id IN (SELECT itemgrpitem_item_id
+                             FROM itemgrpitem
+                             WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
+          <? elseif exists("itemgrp_pattern") ?>
+            AND (item_id IN (SELECT itemgrpitem_item_id
+                             FROM itemgrpitem, itemgrp
+                             WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
+                                    AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
+          <? elseif exists("itemgrp") ?>
+            AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
+          <? endif ?>
+          <? if reExists("[vV]end") ?>
+            AND (itemsrc_item_id=item_id)
+          <? endif ?>
+          <? if exists("vend_id") ?>
            AND (vend_id=<? value("vend_id") ?>)
-<? elseif exists("vendtype_id") ?>
+          <? elseif exists("vendtype_id") ?>
            AND (vend_vendtype_id=<? value("vendtype_id") ?>)
-<? elseif exists("vendtype_pattern") ?>
-           AND (vend_vendtype_id IN (SELECT vendtype_id FROM vendtype WHERE (vendtype_code ~ <? value("vendtype_pattern") ?>)))
-<? endif ?>
-<? if exists("warehous_id") ?>
-           AND (warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-           )
-       ) AS data
+          <? elseif exists("vendtype_pattern") ?>
+            AND (vend_vendtype_id IN (SELECT vendtype_id
+                                      FROM vendtype
+                                      WHERE (vendtype_code ~ <? value("vendtype_pattern") ?>)))
+          <? endif ?>
+      ) ) AS data
 <? if exists("showReorder") ?>
  WHERE ( ((qtyonhand - allocated + ordered) <= reorderlevel)
   <? if exists("ignoreReorderAtZero") ?>
    AND (NOT ( ((qtyonhand - allocated + ordered) = 0) AND (reorderlevel = 0)))
   <? endif ?>
   )
 <? elseif exists("showShortages") ?>
  WHERE ((qtyonhand - allocated + ordered) < 0)
 <? endif ?>
 ORDER BY vend_number, item_number, warehous_code DESC;


 --------------------------------------------------------------------
 REPORT: InventoryHistory
-QUERY: head
-SELECT formatDate(<? value("startDate") ?>) AS startdate,
-       formatDate(<? value("endDate") ?>) AS enddate,
-       <? if exists("warehous_id") ?>
-         ( SELECT warehous_code
-             FROM warehous
-            WHERE (warehous_id=<? value("warehous_id") ?>) )
-       <? else ?>
-         text('All Sites')
-       <? endif ?>
-       AS warehouse,
-       <? if exists("itemgrp_id") ?>
-         ( SELECT (itemgrp_name||'-'||itemgrp_descrip)
-             FROM itemgrp
-            WHERE (itemgrp_id=<? value("itemgrp_id") ?>) )
-       <? elseif exists("itemgrp_pattern") ?>
-         text(<? value("itemgrp_pattern") ?>)
-       <? elseif exists("classcode_id") ?>
-         ( SELECT (classcode_code||'-'||classcode_descrip)
-             FROM classcode
-            WHERE (classcode_id=<? value("classcode_id") ?>) )
-       <? elseif exists("classcode_pattern") ?>
-         text(<? value("classcode_pattern") ?>)
-       <? elseif exists("plancode_id") ?>
-         ( SELECT (plancode_code||'-'||plancode_name)
-             FROM plancode
-            WHERE (plancode_id=<? value("plancode_id") ?>) )
-       <? elseif exists("plancode_pattern") ?>
-         text(<? value("plancode_pattern") ?>)
-       <? elseif exists("item_id") ?>
-         ( SELECT (item_number)
-             FROM item
-            WHERE (item_id=<? value("item_id") ?>) )
-       <? elseif exists("orderNumber") ?>
-         text(<? value("orderNumber") ?>)
-       <? else ?>
-         text('All')
-       <? endif ?>
-       AS lbl_value,
-       <? if reExists("itemgrp.*") ?>
-         text('Item Group:')
-       <? elseif reExists("classcode.*") ?>
-         text('Class Code:')
-       <? elseif reExists("plancode.*") ?>
-         text('Planner Code:')
-       <? elseif exists("item_id") ?>
-         text('Item Number:')
-       <? elseif exists("orderNumber") ?>
-         text('Order Number:')
-       <? else ?>
-         text('Unknown Class:')
-       <? endif ?>
-       AS lbl_bytype,
-       <? if reExists("itemgrp.*") ?>
-         text('Inventory History by Item Group')
-       <? elseif reExists("classcode.*") ?>
-         text('Inventory History by Class Code')
-       <? elseif reExists("plancode.*") ?>
-         text('Inventory History by Planner Code')
-       <? elseif exists("item_id") ?>
-         text('Inventory History by Item')
-       <? elseif exists("orderNumber") ?>
-         text('Inventory History by Order')
-       <? else ?>
-         text('Inventory History')
-       <? endif ?>
-       AS lbl_title;
---------------------------------------------------------------------
-
 QUERY: detail
 SELECT invhist_id,
        invhist_transdate,
        formatDateTime(invhist_transdate) AS f_transdate,
        invhist_transtype,
        whs1.warehous_code AS warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        formatQty(invhist_invqty) AS transqty,
        (invhist_value_after-invhist_value_before) AS transvalue,
        formatMoney(invhist_value_after-invhist_value_before) AS f_transvalue,
        invhist_invuom,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
        CASE WHEN (invhist_costmethod='A') THEN <? value("average") ?>
             WHEN (invhist_costmethod='S') THEN <? value("standard") ?>
             WHEN (invhist_costmethod='J') THEN <? value("job") ?>
             WHEN (invhist_costmethod='N') THEN <? value("none") ?>
             ELSE <? value("unknown") ?>
        END AS costmethod,
        formatMoney(invhist_value_before) AS valbefore,
        formatMoney(invhist_value_after) AS valafter,
        invhist_user AS username,
        invhist_posted,
        0 AS invdetail_id,
        '' AS locationname,
        '' AS detailqty,
        '' AS locationqtybefore,
        '' AS locationqtyafter,
        CASE WHEN (invhist_transtype='TW') THEN whs1.warehous_code
             WHEN (invhist_transtype='IB') THEN whs1.warehous_code
             WHEN (invhist_transtype='IM') THEN whs1.warehous_code
             WHEN (invhist_transtype='IT') THEN whs1.warehous_code
             WHEN (invhist_transtype='RB') THEN 'WIP'
             WHEN (invhist_transtype='RM') THEN 'WIP'
             WHEN (invhist_transtype='RP') THEN 'PURCH'
             WHEN (invhist_transtype='RR') THEN 'CUST'
             WHEN (invhist_transtype='RS') THEN 'SHIP'
             WHEN (invhist_transtype='SH') THEN whs1.warehous_code
             WHEN (invhist_transtype='SI') THEN whs1.warehous_code
             WHEN (invhist_transtype='SV') THEN whs1.warehous_code
 	    WHEN (invhist_transtype='TR') THEN whs2.warehous_code
 	    WHEN (invhist_transtype='TS') THEN whs1.warehous_code
             ELSE ''
        END AS locfrom,
        CASE WHEN (invhist_transtype='TW') THEN whs2.warehous_code
             WHEN (invhist_transtype='AD') THEN whs1.warehous_code
             WHEN (invhist_transtype='CC') THEN whs1.warehous_code
             WHEN (invhist_transtype='IB') THEN 'WIP'
             WHEN (invhist_transtype='IM') THEN 'WIP'
             WHEN (invhist_transtype='NN') THEN whs1.warehous_code
             WHEN (invhist_transtype='RB') THEN whs1.warehous_code
             WHEN (invhist_transtype='RM') THEN whs1.warehous_code
             WHEN (invhist_transtype='RP') THEN whs1.warehous_code
             WHEN (invhist_transtype='RR') THEN whs1.warehous_code
             WHEN (invhist_transtype='RS') THEN whs1.warehous_code
             WHEN (invhist_transtype='RT') THEN whs1.warehous_code
             WHEN (invhist_transtype='RX') THEN whs1.warehous_code
             WHEN (invhist_transtype='SH') THEN 'SHIP'
             WHEN (invhist_transtype='SI') THEN 'SCRAP'
             WHEN (invhist_transtype='SV') THEN 'SHIP'
 	    WHEN (invhist_transtype='TR') THEN whs1.warehous_code
 	    WHEN (invhist_transtype='TS') THEN whs2.warehous_code
             ELSE ''
        END AS locto
   FROM itemsite, item, warehous AS whs1, invhist LEFT OUTER JOIN warehous AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
  WHERE ( (NOT invhist_hasdetail)
    AND (invhist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=whs1.warehous_id)
   AND  (DATE(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?> )
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("orderType") ?>
   AND  (invhist_ordtype=<? value("orderType") ?>)
 <? endif ?>
 <? if exists("orderNumber") ?>
   AND  (invhist_ordnumber ~ <? value("orderNumber") ?>)
-  AND  (invhist_ordtype = 'SO')
+<? endif ?>
+<? if exists("cohead_id") ?>
+  AND  (invhist_ordtype='SO')
+  AND  (invhist_ordnumber ~ (
+    SELECT cohead_number
+    FROM cohead
+    WHERE cohead_id=<? value("cohead_id") ?>))
+<? endif ?>
+<? if exists("pohead_id") ?>
+  AND  (invhist_ordtype='PO')
+  AND  (invhist_ordnumber ~ (
+    SELECT pohead_number
+    FROM pohead
+    WHERE pohead_id=<? value("pohead_id") ?>))
+<? endif ?>
+<? if exists("tohead_id") ?>
+  AND  (invhist_ordtype='TO')
+  AND  (invhist_ordnumber ~ (
+    SELECT tohead_number
+    FROM tohead
+    WHERE tohead_id=<? value("tohead_id") ?>))
+<? endif ?>
+<? if exists("wo_id") ?>
+  AND  (invhist_ordtype='WO')
+  AND  (invhist_ordnumber ~ formatWoNumber(<? value("wo_id") ?>))
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("item_id") ?>
   AND  (itemsite_item_id=<? value("item_id") ?>)
 <? endif ?>
+<? if exists("classcode_id") ?>
+  AND  (item_classcode_id=<? value("classcode_id") ?>)
+<? endif ?>
 <? if exists("itemgrp_id") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem
                      WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
-<? elseif exists("itemgrp_pattern") ?>
+<? endif ?>
+<? if exists("plancode_id") ?>
+  AND  (itemsite_plancode_id=<? value("plancode_id") ?>)
+<? endif ?>
+<? if exists("classcode_pattern") ?>
+  AND  (item_classcode_id IN (SELECT classcode_id
+			      FROM classcode
+			      WHERE (classcode_code ~ <? value ("classcode_pattern") ?>)))
+<? endif ?>
+<? if exists("itemgrp_pattern") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem, itemgrp
                      WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
-                       AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
-<? elseif exists("classcode_id") ?>
-   AND (item_classcode_id=<? value("classcode_id") ?>)
-<? elseif exists("classcode_pattern") ?>
-   AND (item_classcode_id IN (SELECT classcode_id
-                                FROM classcode
-                               WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
-<? elseif exists("plancode_id") ?>
-   AND (itemsite_plancode_id=<? value("plancode_id") ?>)
-<? elseif exists("plancode_pattern") ?>
-   AND (itemsite_plancode_id IN (SELECT plancode_id FROM plancode WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
-<? elseif exists("itemgrp") ?>
+		     AND  (itemgrp_name ~ <? value ("itemgrp_pattern") ?>))))
+<? endif ?>
+<? if exists("plancode_pattern") ?>
+  AND (itemsite_plancode_id IN (SELECT plancode_id
+				FROM plancode
+				WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
+<? endif ?>
+<? if exists("itemgrp") ?>
    AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
 <? endif ?>
 )
 UNION
 SELECT invhist_id,
        invhist_transdate,
        formatDateTime(invhist_transdate) AS transdate,
        invhist_transtype,
        whs1.warehous_code AS warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        formatQty(invhist_invqty) AS transqty,
        0 AS transvalue,
        formatMoney(invhist_value_after-invhist_value_before) AS f_transvalue,
        invhist_invuom,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
        CASE WHEN(invhist_costmethod='A') THEN text('Average')
             WHEN(invhist_costmethod='S') THEN text('Standard')
             WHEN(invhist_costmethod='J') THEN text('Job')
             WHEN(invhist_costmethod='N') THEN text('None')
             ELSE 'UNKNOWN'
        END AS costmethod,
        formatMoney(invhist_value_before) AS valbefore,
        formatMoney(invhist_value_after) AS valafter,
        invhist_user AS username,
        invhist_posted,
        invdetail_id,
        CASE WHEN (invdetail_location_id=-1) THEN formatlotserialnumber(invdetail_ls_id)
             WHEN (invdetail_ls_id IS NULL) THEN formatLocationName(invdetail_location_id)
             ELSE (formatLocationName(invdetail_location_id) || '-' || formatlotserialnumber(invdetail_ls_id))
        END AS locationname,
        formatQty(invdetail_qty) AS detailqty,
        formatQty(invdetail_qty_before) AS locationqtybefore,
        formatQty(invdetail_qty_after) AS locationqtyafter,
        CASE WHEN (invhist_transtype='TW') THEN whs1.warehous_code
             WHEN (invhist_transtype='IB') THEN whs1.warehous_code
             WHEN (invhist_transtype='IM') THEN whs1.warehous_code
             WHEN (invhist_transtype='IT') THEN whs1.warehous_code
             WHEN (invhist_transtype='RB') THEN 'WIP'
             WHEN (invhist_transtype='RM') THEN 'WIP'
             WHEN (invhist_transtype='RP') THEN 'PURCH'
             WHEN (invhist_transtype='RR') THEN 'CUST'
             WHEN (invhist_transtype='RS') THEN 'SHIP'
             WHEN (invhist_transtype='SH') THEN whs1.warehous_code
             WHEN (invhist_transtype='SI') THEN whs1.warehous_code
             WHEN (invhist_transtype='SV') THEN whs1.warehous_code
 	    WHEN (invhist_transtype='TR') THEN whs2.warehous_code
 	    WHEN (invhist_transtype='TS') THEN whs1.warehous_code
             ELSE ''
        END AS locfrom,
        CASE WHEN (invhist_transtype='TW') THEN whs2.warehous_code
             WHEN (invhist_transtype='AD') THEN whs1.warehous_code
             WHEN (invhist_transtype='CC') THEN whs1.warehous_code
             WHEN (invhist_transtype='IB') THEN 'WIP'
             WHEN (invhist_transtype='IM') THEN 'WIP'
             WHEN (invhist_transtype='NN') THEN whs1.warehous_code
             WHEN (invhist_transtype='RB') THEN whs1.warehous_code
             WHEN (invhist_transtype='RM') THEN whs1.warehous_code
             WHEN (invhist_transtype='RP') THEN whs1.warehous_code
             WHEN (invhist_transtype='RR') THEN whs1.warehous_code
             WHEN (invhist_transtype='RS') THEN whs1.warehous_code
             WHEN (invhist_transtype='RT') THEN whs1.warehous_code
             WHEN (invhist_transtype='RX') THEN whs1.warehous_code
             WHEN (invhist_transtype='SH') THEN 'SHIP'
             WHEN (invhist_transtype='SI') THEN 'SCRAP'
             WHEN (invhist_transtype='SV') THEN 'SHIP'
 	    WHEN (invhist_transtype='TR') THEN whs1.warehous_code
 	    WHEN (invhist_transtype='TS') THEN whs2.warehous_code
             ELSE ''
        END AS locto
   FROM itemsite, item, warehous AS whs1, invdetail, invhist LEFT OUTER JOIN warehous AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
  WHERE ((invhist_hasdetail)
    AND (invhist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=whs1.warehous_id)
    AND (invdetail_invhist_id=invhist_id)
    AND  (DATE(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?> )
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("orderType") ?>
   AND  (invhist_ordtype=<? value("orderType") ?>)
 <? endif ?>
 <? if exists("orderNumber") ?>
   AND  (invhist_ordnumber ~ <? value("orderNumber") ?>)
-  AND  (invhist_ordtype = 'SO')
+<? endif ?>
+<? if exists("cohead_id") ?>
+  AND  (invhist_ordtype='SO')
+  AND  (invhist_ordnumber ~ (
+    SELECT cohead_number
+    FROM cohead
+    WHERE cohead_id=<? value("cohead_id") ?>))
+<? endif ?>
+<? if exists("pohead_id") ?>
+  AND  (invhist_ordtype='PO')
+  AND  (invhist_ordnumber ~ (
+    SELECT pohead_number
+    FROM pohead
+    WHERE pohead_id=<? value("pohead_id") ?>))
+<? endif ?>
+<? if exists("tohead_id") ?>
+  AND  (invhist_ordtype='TO')
+  AND  (invhist_ordnumber ~ (
+    SELECT tohead_number
+    FROM tohead
+    WHERE tohead_id=<? value("tohead_id") ?>))
+<? endif ?>
+<? if exists("wo_id") ?>
+  AND  (invhist_ordtype='WO')
+  AND  (invhist_ordnumber ~ formatWoNumber(<? value("wo_id") ?>))
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("item_id") ?>
   AND  (itemsite_item_id=<? value("item_id") ?>)
 <? endif ?>
+<? if exists("classcode_id") ?>
+  AND  (item_classcode_id=<? value("classcode_id") ?>)
+<? endif ?>
 <? if exists("itemgrp_id") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem
                      WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
-<? elseif exists("itemgrp_pattern") ?>
+<? endif ?>
+<? if exists("plancode_id") ?>
+  AND  (itemsite_plancode_id=<? value("plancode_id") ?>)
+<? endif ?>
+<? if exists("classcode_pattern") ?>
+  AND  (item_classcode_id IN (SELECT classcode_id
+			      FROM classcode
+			      WHERE (classcode_code ~ <? value ("classcode_pattern") ?>)))
+<? endif ?>
+<? if exists("itemgrp_pattern") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem, itemgrp
                      WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
-                       AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
-<? elseif exists("classcode_id") ?>
-   AND (item_classcode_id=<? value("classcode_id") ?>)
-<? elseif exists("classcode_pattern") ?>
-   AND (item_classcode_id IN (SELECT classcode_id
-                                FROM classcode
-                               WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
-<? elseif exists("plancode_id") ?>
-   AND (itemsite_plancode_id=<? value("plancode_id") ?>)
-<? elseif exists("plancode_pattern") ?>
+		     AND  (itemgrp_name ~ <? value ("itemgrp_pattern") ?>))))
+<? endif ?>
+<? if exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN (SELECT plancode_id
                                    FROM plancode
                                   WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
-<? elseif exists("itemgrp") ?>
+<? endif ?>
+<? if exists("itemgrp") ?>
    AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
 <? endif ?>
 );


 --------------------------------------------------------------------
 REPORT: OrderActivityByProject
 QUERY: detail
 -- Group: orderActivityByProject
 -- Name:  detail
 -- Notes:

 SELECT *,
   formatQty(qty) AS f_qty,
   formatMoney(value) AS f_value,
   'curr' AS qty_xtnumericrole,
   'curr' AS value_xtnumericrole
 FROM (
 <? if exists("showSo") ?>
 ----- QUOTES -----
 SELECT quhead_id AS id,
        15 AS type,
        quhead_number::text AS subtype,
        1 AS section,
        <? value("quotes") ?> AS section_qtdisplayrole,
        quhead_number::text AS name,
        CASE WHEN (quhead_status = 'C') THEN
          <? value("converted") ?>
             WHEN (quhead_status = 'X') THEN
          <? value("canceled") ?>
             WHEN (COALESCE(quhead_expire, current_date + 1) > current_date) THEN
          <? value("open") ?>
             ELSE
          <? value("expired") ?>
        END AS status,
        NULL::text AS item,
        NULL::text AS descrip,
        NULL AS qty,
        NULL::text AS uom,
        NULL AS value,
+       0.0 AS ordertotal,
        1 AS xtindentrole
   FROM quhead
     JOIN quitem ON (quitem_quhead_id = quhead_id)
  WHERE (quhead_prj_id = <? value("prj_id") ?>)
 GROUP BY quhead_id, quhead_number, quhead_status, quhead_expire, quhead_freight, quhead_misc

 UNION ALL

 SELECT quitem_id AS id,
        17 AS type,
        quhead_number::text AS subtype,
        1 AS section,
        <? value("quotes") ?> AS section_qtdisplayrole,
        quitem_linenumber::text AS name,
        CASE WHEN (quhead_status = 'C') THEN
          <? value("converted") ?>
             WHEN (quhead_status = 'X') THEN
          <? value("canceled") ?>
             WHEN (COALESCE(quhead_expire, current_date + 1) > current_date) THEN
          <? value("open") ?>
             ELSE
          <? value("Expired") ?>
        END AS status,
        item_number AS item,
        item_descrip1 || ' ' || item_descrip2 AS descrip,
        quitem_qtyord,
        uom_name AS uom,
        (quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio) AS value,
+       0.0 AS ordertotal,
        2 AS xtindentrole
   FROM quhead
     JOIN quitem ON (quitem_quhead_id = quhead_id)
     JOIN uom ON (quitem_qty_uom_id = uom_id)
     JOIN itemsite ON (quitem_itemsite_id = itemsite_id)
     JOIN item ON (itemsite_item_id = item_id)
  WHERE (quhead_prj_id = <? value("prj_id") ?>)

 UNION ALL

 SELECT quhead_id AS id,
        18 AS type,
        quhead_number::text AS subtype,
        1 AS section,
        <? value("quotes") ?> AS section_qtdisplayrole,
        <? value("total") ?> AS name,
        NULL AS status,
        NULL::text AS item,
        NULL::text AS descrip,
        NULL AS qty,
        NULL::text AS uom,
        SUM((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio)) AS value,
+       SUM((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio)) AS ordertotal,
        1 AS xtindentrole
   FROM quhead
     JOIN quitem ON (quitem_quhead_id = quhead_id)
  WHERE (quhead_prj_id = <? value("prj_id") ?>)
 GROUP BY quhead_id, quhead_number

 UNION ALL

 ------ SALES ORDERS ------
 SELECT cohead_id AS id,
        25 AS type,
        cohead_number::text AS subtype,
        2 AS section,
        <? value("sos") ?> AS section_qtdisplayrole,
        cohead_number::text AS name,
       COALESCE((SELECT
                   CASE WHEN (coitem_status = 'O') THEN
                     <? value("open") ?>
                        WHEN (coitem_status = 'C') THEN
                     <? value("closed" ?>
                       ELSE
                     <? value("canceled") ?>
                   END
                 FROM
                (SELECT coitem_status,
                    CASE
                      WHEN (coitem_status = 'O') THEN 1
                      WHEN (coitem_status = 'C') then 2
                      ELSE  3
                   END AS type
                   FROM coitem
                  WHERE (coitem_cohead_id=cohead_id)
                  ORDER BY type
                  LIMIT 1) AS sts) ,'O')
         AS status,
        NULL::text AS item,
        NULL::text AS descrip,
        NULL AS qty,
        NULL::text AS uom,
        NULL AS value,
+       0.0 AS ordertotal,
        1 AS xtindentrole
   FROM cohead
     JOIN coitem ON (coitem_cohead_id = cohead_id)
  WHERE (cohead_prj_id = <? value("prj_id") ?>)
 GROUP BY cohead_id, cohead_number

 UNION ALL

 SELECT coitem_id AS id,
        27 AS type,
        cohead_number::text AS subtype,
        2 AS section,
        <? value("sos") ?> AS section_qtdisplayrole,
        coitem_linenumber::text AS name,
        CASE WHEN (coitem_status = 'O') THEN
          <? value("open") ?>
             WHEN (coitem_status = 'C') THEN
          <? value("closed") ?>
             WHEN (coitem_status = 'X') THEN
          <? value("canceled") ?>
        END AS status,
        item_number AS item,
        item_descrip1 || ' ' || item_descrip2 AS descrip,
        coitem_qtyord,
        uom_name AS uom,
        (coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio) AS value,
+       0.0 AS ordertotal,
        2 AS xtindentrole
   FROM cohead
     JOIN coitem ON (coitem_cohead_id = cohead_id)
     JOIN uom ON (coitem_qty_uom_id = uom_id)
     JOIN itemsite ON (coitem_itemsite_id = itemsite_id)
     JOIN item ON (itemsite_item_id = item_id)
  WHERE (cohead_prj_id = <? value("prj_id") ?>)

 UNION ALL

 SELECT cohead_id AS id,
        28 AS type,
        cohead_number::text AS subtype,
        2 AS section,
        <? value("sos") ?> AS section_qtdisplayrole,
        <? value("total") ?> AS name,
        NULL AS status,
        NULL::text AS item,
        NULL::text AS descrip,
        NULL AS qty,
        NULL::text AS uom,
        SUM((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS value,
+       SUM((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS ordertotal,
        1 AS xtindentrole
   FROM cohead
     JOIN coitem ON (coitem_cohead_id = cohead_id)
  WHERE (cohead_prj_id = <? value("prj_id") ?>)
 GROUP BY cohead_id, cohead_number

 UNION ALL

 ------ INVOICES -------
 SELECT invchead_id AS id,
        35 AS type,
        invchead_invcnumber::text AS subtype,
        3 AS section,
        <? value("invoices") ?> AS section_qtdisplayrole,
        invchead_invcnumber::text AS name,
        CASE WHEN (invchead_posted) THEN
          <? value("posted") ?>
        ELSE <? value("unposted") ?>
        END AS status,
        NULL::text AS item,
        NULL::text AS descrip,
        NULL AS qty,
        NULL::text AS uom,
        NULL AS value,
+       0.0 AS ordertotal,
        1 AS xtindentrole
   FROM invchead
     JOIN invcitem ON (invcitem_invchead_id = invchead_id)
  WHERE (invchead_prj_id = <? value("prj_id") ?>)
 GROUP BY invchead_id, invchead_invcnumber, invchead_freight, invchead_misc_amount, invchead_posted

 UNION ALL

 SELECT invcitem_id AS id,
        37 AS type,
        invchead_invcnumber::text AS subtype,
        3 AS section,
        <? value("invoices") ?> AS section_qtdisplayrole,
        invcitem_linenumber::text AS name,
        CASE WHEN (invchead_posted) THEN
          <? value("posted") ?>
        ELSE <? value("unposted") ?>
        END AS status,
        COALESCE(item_number,invcitem_number) AS item,
        COALESCE(item_descrip1 || ' ' || item_descrip2,invcitem_descrip) AS descrip,
        invcitem_billed AS qty,
        uom_name AS uom,
        (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS value,
+       0.0 AS ordertotal,
        2 AS xtindentrole
   FROM invchead
     JOIN invcitem ON (invcitem_invchead_id = invchead_id)
     LEFT OUTER JOIN item ON (invcitem_item_id = item_id)
     LEFT OUTER JOIN uom ON (invcitem_qty_uom_id = uom_id)
  WHERE (invchead_prj_id = <? value("prj_id") ?>)

 UNION ALL

 SELECT invchead_id AS id,
        38 AS type,
        invchead_invcnumber::text AS subtype,
        3 AS section,
        <? value("invoices") ?> AS section_qtdisplayrole,
        <? value("total") ?> AS name,
        NULL AS status,
        NULL::text AS item,
        NULL::text AS descrip,
        NULL AS qty,
        NULL::text AS uom,
        SUM((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS value,
+       SUM((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS ordertotal,
        1 AS xtindentrole
   FROM invchead
     JOIN invcitem ON (invcitem_invchead_id = invchead_id)
  WHERE (invchead_prj_id = <? value("prj_id") ?>)
 GROUP BY invchead_id, invchead_invcnumber

 <? endif ?>


 <? if exists("showWo") ?>

 <?   if exists("showSo") ?>

 UNION ALL

 <?   endif ?>

 ------ WORK ORDERS -------
 SELECT wo_id AS id,
        45 AS type,
        formatWoNumber(wo_id) AS subtype,
        4 AS section,
        <? value("wos") ?> AS section_qtdisplayrole,
        formatWoNumber(wo_id) AS name,
        CASE WHEN (wo_status = 'O') THEN
          <? value("open") ?>
             WHEN (wo_status = 'E') THEN
          <? value("exploded") ?>
             WHEN (wo_status = 'R') THEN
          <? value("released") ?>
             WHEN (wo_status = 'I') THEN
          <? value("inprocess") ?>
             WHEN (wo_status = 'C') THEN
          <? value("closed") ?>
        END AS status,
        item_number AS item,
        item_descrip1 || ' ' || item_descrip2 AS descrip,
        wo_qtyord AS qty,
        uom_name AS uom,
        wo_postedvalue AS value,
+       wo_postedvalue AS ordertotal,
        1 AS xtindentrole
   FROM wo
     JOIN itemsite ON (itemsite_id=wo_itemsite_id)
     JOIN item ON (itemsite_item_id=item_id)
     JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (wo_prj_id = <? value("prj_id") ?>)

 <? endif ?>


 <? if exists("showPo") ?>
 <?   if exists("showSo") ?>
  UNION ALL
 <? elseif exists("showWo") ?>
  UNION ALL

 <? endif ?>
 ------ PURCHASE REQUESTS ------
 SELECT pr_id AS id,
        55 AS type,
        pr_number::text || '-' || pr_subnumber::text AS subtype,
        5 AS section,
        <? value("prs") ?> AS section_qtdisplayrole,
        pr_number::text || '-' || pr_subnumber::text AS name,
        <? value("open") ?> AS status,
        item_number AS item,
        (item_descrip1 || ' ' || item_descrip2) AS descrip,
        pr_qtyreq AS qty,
        uom_name AS uom,
        stdcost(item_id) * pr_qtyreq AS value,
+       stdcost(item_id) * pr_qtyreq AS ordertotal,
        1 AS xtindentrole
   FROM pr
     JOIN itemsite ON (itemsite_id = pr_itemsite_id)
     JOIN item ON (itemsite_item_id = item_id)
     JOIN uom ON (item_inv_uom_id = uom_id)
  WHERE (pr_prj_id=<? value("prj_id") ?>)

 UNION ALL

 ------ PURCHASE ORDERS ------
 SELECT pohead_id AS id,
        65 AS type,
        pohead_number::text AS subtype,
        6 AS section,
        <? value("pos") ?> AS section_qtdisplayrole,
        pohead_number::text AS name,
        CASE WHEN (pohead_status = 'U') THEN
          <? value("unreleased") ?>
             WHEN (pohead_status = 'O') THEN
          <? value("open") ?>
             WHEN (pohead_status = 'C') THEN
          <? value("closed") ?>
        END AS status,
        NULL::text AS item,
        NULL::text AS descrip,
        NULL AS qty,
        NULL AS uom,
        NULL AS value,
+       0.0 AS ordertotal,
        1 AS xtindentrole
   FROM pohead
     JOIN poitem ON (poitem_pohead_id = pohead_id)
  WHERE (poitem_prj_id = <? value("prj_id") ?>)
 GROUP BY pohead_id, pohead_number, pohead_freight, pohead_status

 UNION ALL

 SELECT poitem_id AS id,
        67 AS type,
        pohead_number::text AS subtype,
        6 AS section,
        <? value("pos") ?> AS section_qtdisplayrole,
        poitem_linenumber::text AS name,
        CASE WHEN (poitem_status = 'U') THEN
          <? value("unreleased") ?>
             WHEN (poitem_status = 'O') THEN
          <? value("open") ?>
             WHEN (poitem_status = 'C') THEN
          <? value("closed") ?>
        END AS status,
        COALESCE(item_number,poitem_vend_item_number) AS item,
        COALESCE((item_descrip1 || ' ' || item_descrip2),poitem_vend_item_descrip) AS descrip,
        poitem_qty_ordered,
        poitem_vend_uom AS uom,
        (poitem_qty_ordered * poitem_unitprice) AS value,
+       0.0 AS ordertotal,
        2 AS xtindentrole
   FROM pohead
     JOIN poitem ON (poitem_pohead_id = pohead_id)
     LEFT OUTER JOIN itemsite ON (poitem_itemsite_id=itemsite_id)
     LEFT OUTER JOIN item ON (itemsite_item_id = item_id)
  WHERE (poitem_prj_id = <? value("prj_id") ?>)

 UNION ALL

 SELECT pohead_id AS id,
        68 AS type,
        pohead_number::text AS subtype,
        6 AS section,
        <? value("pos") ?> AS section_qtdisplayrole,
        <? value("total") ?> AS name,
        NULL AS status,
        NULL::text AS item,
        NULL::text AS descrip,
        NULL AS qty,
        NULL::text AS uom,
        SUM(poitem_qty_ordered * poitem_unitprice) AS value,
+       SUM(poitem_qty_ordered * poitem_unitprice) AS ordertotal,
        1 AS xtindentrole
   FROM pohead
     JOIN poitem ON (poitem_pohead_id = pohead_id)
  WHERE (poitem_prj_id = <? value("prj_id") ?>)
 GROUP BY pohead_id, pohead_number

 <? endif ?>

 ) data
 ORDER BY section, subtype, type, id;


 --------------------------------------------------------------------
 REPORT: POLineItemsByVendor
 QUERY: head
-SELECT vend_number,
-       vend_name,
+SELECT
+<? if exists("vend_id") ?>
+       (SELECT ('Vendor = ' || vend_name) FROM vendinfo WHERE vend_id=<? value("vend_id") ?>)
+<? elseif exists("vendtype_id") ?>
+       (SELECT ('Vendor Type = ' || vendtype_code) FROM vendtype WHERE vendtype_id=<? value("vendtype_id") ?>)
+<? elseif exists("vendtype_pattern") ?>
+       ('Vendor Type pattern = ' || <? value("vendtype_pattern") ?>)
+<? else ?>
+       'All Vendors'
+<? endif ?>
+       AS selection,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code FROM warehous WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername,
        <? if exists("openItems") ?>
          text('Open Items')
        <? elseif exists("closedItems") ?>
          text('Closed Items')
        <? else ?>
          text('All Items')
        <? endif ?>
        AS f_whichitems
-  FROM vend
- WHERE (vend_id=<? value("vend_id") ?>);
-
+;


 --------------------------------------------------------------------
 REPORT: PackingList-Shipment
 QUERY: head
 SELECT shiphead_number, 'S/O #:' AS ordertype,
        cohead_number AS ordernumber,
        formatsobarcode(cohead_id) AS order_barcode,
        COALESCE(shiphead_shipvia, cohead_shipvia) AS shipvia,
        cohead_shiptophone AS shiptophone,
        cohead_custponumber,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_shipcomments AS shipcomments,
        cohead_billtoname AS billtoname,
        formataddr(cohead_billtoaddress1, cohead_billtoaddress2,
                   cohead_billtoaddress3,
                   (cohead_billtocity || '  ' ||   cohead_billtostate ||
                   '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address,
        cohead_shiptoname AS shiptoname,
        formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2,
                   cohead_shiptoaddress3,
                   (cohead_shiptocity || '  ' ||   cohead_shiptostate ||
                   '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,

        cust_number,
        cust_contact,
        cust_phone,
        terms_descrip
   FROM shiphead, cohead, cust, terms
  WHERE ((cohead_cust_id=cust_id)
    AND (cohead_terms_id=terms_id)
    AND (cohead_id=shiphead_order_id)
    AND (shiphead_order_type='SO')
    AND (shiphead_id=<? value("shiphead_id") ?>)
 )
 <? if exists("MultiWhs") ?>
 UNION
 SELECT shiphead_number, 'T/O #:' AS ordertype,
        tohead_number AS ordernumber,
        formattobarcode(tohead_id) AS order_barcode,
        shiphead_shipvia AS shipvia,
        tohead_destphone AS shiptophone,
-       TEXT(tohead_number) AS cohead_custponumber,
+       TEXT(' ') AS cohead_custponumber,
        formatDate(tohead_orderdate) AS orderdate,
        tohead_shipcomments AS shipcomments,
        tohead_srcname AS billtoname,
        formataddr(tohead_srcaddress1, tohead_srcaddress2,
                    tohead_srcaddress3,
                   (tohead_srccity || ' ' || tohead_srcstate ||
                    ' ' || tohead_srcpostalcode), tohead_srccountry) AS billing_address,
        tohead_destname AS shiptoname,
        formataddr(tohead_destaddress1, tohead_destaddress2,
                    tohead_destaddress3,
                   (tohead_destcity || ' ' || tohead_deststate ||
                    ' ' || tohead_destpostalcode), tohead_destcountry) AS shipping_address,
        'Transfer Order' AS cust_number,
        tohead_destcntct_name AS cust_contact,
        tohead_destphone AS cust_phone,
        '' AS terms_descrip
   FROM shiphead, tohead
  WHERE ((tohead_id=shiphead_order_id)
    AND  (shiphead_order_type='TO')
    AND  (shiphead_id=<? value("shiphead_id") ?>)
 )
 <? endif ?>;


 --------------------------------------------------------------------
 REPORT: PackingList
 QUERY: head
 SELECT COALESCE(shiphead_number::TEXT, 'Not Issued To Shipping') AS shiphead_number,
 	      'S/O #:' AS ordertype,
        cohead_number AS ordernumber,
        formatsobarcode(cohead_id) AS order_barcode,
        COALESCE(shiphead_shipvia, cohead_shipvia) AS shipvia,
        cohead_shiptophone AS shiptophone,
        cohead_custponumber,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_shipcomments AS shipcomments,
        cohead_billtoname AS billtoname,
        formataddr(cohead_billtoaddress1, cohead_billtoaddress2,
                   cohead_billtoaddress3,
                   (cohead_billtocity || '  ' ||   cohead_billtostate ||
                   '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address,
        cohead_shiptoname AS shiptoname,
        formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2,
                   cohead_shiptoaddress3,
                   (cohead_shiptocity || '  ' ||   cohead_shiptostate ||
                   '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,

        cust_number,
        cust_contact,
        cust_phone,
        terms_descrip
   FROM cust, terms, cohead
 <? if exists("shiphead_id") ?>
 	JOIN
 <? else ?>
 	LEFT OUTER JOIN
 <? endif ?>
        shiphead ON ((shiphead_id=<? value("shiphead_id") ?>)
 		AND (shiphead_order_id=cohead_id)
 		AND (shiphead_order_type='SO'))
  WHERE ((cohead_cust_id=cust_id)
    AND  (cohead_terms_id=terms_id)
 <? if exists("head_id") ?>
    AND  (<? value("head_type") ?>='SO')
    AND  (cohead_id=<? value("head_id") ?>)
 <? endif ?>
 )

 <? if exists("MultiWhs") ?>
 UNION
 SELECT COALESCE(shiphead_number::TEXT, 'Not Issued To Shipping') AS shiphead_number,
       'T/O #:' AS ordertype,
        tohead_number AS ordernumber,
        formattobarcode(tohead_id) AS order_barcode,
        COALESCE(shiphead_shipvia, tohead_shipvia) AS shipvia,
        tohead_destphone AS shiptophone,
-       TEXT(tohead_number) AS cohead_custponumber,
+       TEXT(' ') AS cohead_custponumber,
        formatDate(tohead_orderdate) AS orderdate,
        tohead_shipcomments AS shipcomments,
        tohead_srcname AS billtoname,
        formataddr(tohead_srcaddress1, tohead_srcaddress2,
                    tohead_srcaddress3,
                   (tohead_srccity || ' ' || tohead_srcstate ||
                    ' ' || tohead_srcpostalcode), tohead_srccountry) AS billing_address,
        tohead_destname AS shiptoname,
        formataddr(tohead_destaddress1, tohead_destaddress2,
                    tohead_destaddress3,
                   (tohead_destcity || ' ' || tohead_deststate ||
                    ' ' || tohead_destpostalcode), tohead_destcountry) AS shipping_address,
        'Transfer Order' AS cust_number,
        tohead_destcntct_name AS cust_contact,
        tohead_destphone AS cust_phone,
        '' AS terms_descrip
   FROM tohead
 <? if exists("shiphead_id") ?>
 	JOIN
 <? else ?>
 	LEFT OUTER JOIN
 <? endif ?>
        shiphead ON ((shiphead_id=<? value("shiphead_id") ?>)
 		AND (shiphead_order_id=tohead_id)
 		AND (shiphead_order_type='TO'))
 <? if exists("head_id") ?>
  WHERE ((<? value("head_type") ?>='TO')
    AND  (tohead_id=<? value("head_id") ?>)
    )
 <? endif ?>
 <? endif ?>;


 --------------------------------------------------------------------
 REPORT: PendingBOMChanges
 QUERY: bomhead
-SELECT bomhead_docnum, bomhead_revision,
-formatDate(bomhead_revisiondate) AS f_revisiondate
+SELECT bomhead_docnum, bomhead_revision, formatDate(bomhead_revisiondate) AS f_revisiondate
 FROM bomhead
 WHERE ((bomhead_item_id=<? value("item_id") ?>)
-AND (bomhead_rev_id=<? value("revision_id") ?>));
+  AND  (bomhead_rev_id=<? value("revision_id") ?>));


 --------------------------------------------------------------------
 REPORT: PickingListSOClosedLines
 QUERY: detail
 SELECT 1 AS groupby,
        formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
 --     In 2.3 replaced the next line:
 --     uom_name,
 --     with:
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
-       formatQty(coitem_qtyshipped - coitem_qtyreturned) AS shipped,
-       formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS balance,
-       formatQty( ( SELECT COALESCE(SUM(coship_qty), 0)
-                    FROM coship, cosmisc
-                    WHERE ( (coship_coitem_id=coitem_id)
-                     AND (coship_cosmisc_id=cosmisc_id)
-                     AND (NOT cosmisc_shipped) ) ) ) AS atshipping,
+       CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(coitem_qtyshipped - coitem_qtyreturned)
+            ELSE NULL
+       END AS shipped,
+       CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned))
+            ELSE NULL
+       END AS balance,
+       CASE WHEN (qtyAtShipping('SO', coitem_id) > 0.0) THEN formatQty(qtyAtShipping('SO', coitem_id))
+            ELSE NULL
+       END AS atShipping,
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
    AND (item_type != 'K')
    AND (coitem_status <> 'X')
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
 --2.3 add coitem_qty_uom_id, to the GROUP BY clause
 GROUP BY coitem_qty_uom_id,
          linenumber, coitem_linenumber, coitem_subnumber, coitem_id, coitem_memo, item_number, uom_name, shipuom,
          item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
 ORDER BY linenumber;


 --------------------------------------------------------------------
 REPORT: PickingListSOLocsNoClosedLines
 QUERY: detail
 SELECT
        formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        CASE WHEN (formatLocationName(location_id) = 'N/A') THEN itemsite_location_comments || ' ' || '(comment)'
             ELSE formatLocationName(location_id)
        END AS location_name,
        itemsite_location_comments AS location_comment,
        formatlotserialnumber(itemloc_ls_id),
        formatDate(itemloc_expiration, 'N/A') AS expiration,
        itemloc_qty AS location_qty_qty,
 <? if exists("EnableSOReservationsByLocation")
        formatQty(qtyReservedLocation(itemloc_id, 'SO', coitem_id)) AS location_reserved_qty,
 <? else ?>
        formatQty(0) AS location_reserved_qty,
 <? endif ?>
        itemuomtouomratio(item_id,item_inv_uom_id, coitem_qty_uom_id) * itemloc_qty AS loc_issue_uom_qty,
        formatqty(itemuomtouomratio(item_id,item_inv_uom_id, coitem_qty_uom_id) * itemloc_qty) AS loc_issue_uom_fmt,
        coitemuom.uom_name AS uom_name,
        item_descrip1,
        item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
-       formatQty(coitem_qtyshipped - coitem_qtyreturned) AS shipped,
-       formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS balance,
-       formatQty( ( SELECT COALESCE(SUM(shipitem_qty), 0)
-                    FROM shipitem
-                    WHERE ( (shipitem_orderitem_id=coitem_id)
-                      AND   (NOT shipitem_shipped) ) ) ) AS atshipping,
+       CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(coitem_qtyshipped - coitem_qtyreturned)
+            ELSE NULL
+       END AS shipped,
+       CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned))
+            ELSE NULL
+       END AS balance,
+       CASE WHEN (qtyAtShipping('SO', coitem_id) > 0.0) THEN formatQty(qtyAtShipping('SO', coitem_id))
+            ELSE NULL
+       END AS atShipping,
        formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio))) AS shipordered,
        formatQty(roundUp(((coitem_qtyshipped - coitem_qtyreturned) * coitem_qty_invuomratio))) AS shipshipped,
        formatQty(roundUp((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio))) AS shipbalance,
        CASE WHEN (coitem_status='O' AND cust_creditstatus='H') THEN 'H'
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

 FROM coitem
      JOIN cohead ON (cohead_id = coitem_cohead_id)
 	 JOIN cust ON (cust_id = cohead_cust_id)
      JOIN itemsite ON (itemsite_id = coitem_itemsite_id)
 	 JOIN item ON (item_id = itemsite_item_id)
 	 JOIN whsinfo ON (warehous_id = itemsite_warehous_id)
 	 JOIN uom invuom ON (invuom.uom_id = item_inv_uom_id)
 	 JOIN uom coitemuom ON (coitemuom.uom_id = coitem_qty_uom_id)
      LEFT OUTER JOIN itemloc  ON (itemloc_itemsite_id = itemsite_id)
      LEFT OUTER JOIN location ON (itemloc_location_id = location_id)
  WHERE ( (coitem_status <> 'X')
    AND   (coitem_status <> 'C')
    AND   (item_type != 'K')
 --REMOVE LINE ABOVE AND CLOSED LINES WILL BE DISPLAYED
    AND   (coitem_cohead_id=<? value("sohead_id") ?>)
 )

 ORDER BY linenumber, expiration, location_name;


 --------------------------------------------------------------------
 REPORT: PickingListSONoClosedLines
 QUERY: detail
 SELECT 1 AS groupby,
        formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS item_invuom,
        item_descrip1,
        item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
-       formatQty(coitem_qtyshipped - coitem_qtyreturned) AS shipped,
-       formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS balance,
-       formatQty( ( SELECT COALESCE(SUM(coship_qty), 0)
-                    FROM coship, cosmisc
-                    WHERE ( (coship_coitem_id=coitem_id)
-                     AND (coship_cosmisc_id=cosmisc_id)
-                     AND (NOT cosmisc_shipped) ) ) ) AS atshipping,
+       CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(coitem_qtyshipped - coitem_qtyreturned)
+            ELSE NULL
+       END AS shipped,
+       CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned))
+            ELSE NULL
+       END AS balance,
+       CASE WHEN (qtyAtShipping('SO', coitem_id) > 0.0) THEN formatQty(qtyAtShipping('SO', coitem_id))
+            ELSE NULL
+       END AS atShipping,
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
 REPORT: Quote
 QUERY: totals
 SELECT 1 as one,
        formatExtPrice(subtotal) AS f_subtotal,
        formatExtPrice(tax) AS f_tax,
        formatExtPrice(quhead_freight) AS f_freight,
        formatExtPrice(quhead_misc) AS f_misc,
        formatExtPrice(subtotal + tax + quhead_freight + quhead_misc) AS f_total
   FROM quhead,
-       (SELECT SUM((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio)) AS subtotal
+       (SELECT SUM(ROUND((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio),2)) AS subtotal
           FROM quitem
          WHERE (quitem_quhead_id=<? value("quhead_id") ?>) ) AS subtot,
-       (SELECT COALESCE(SUM(tax),0) AS tax
+       (SELECT COALESCE(SUM(tax),0.0) AS tax
         FROM (
           SELECT ROUND(SUM(taxdetail_tax),2) AS tax
           FROM tax
           JOIN calculateTaxDetailSummary('Q', <? value("quhead_id") ?>, 'T') ON (taxdetail_tax_id=tax_id)
 	GROUP BY tax_id) AS data) AS taxtot



  WHERE (quhead_id=<? value("quhead_id") ?>);

-

 --------------------------------------------------------------------
 REPORT: SalesOrderAcknowledgement
 QUERY: detail
-SELECT 1 AS groupby,
-       coitem_linenumber,
-       coitem_memo,
-       CASE WHEN (coitem_custpn != '') THEN coitem_custpn
-            ELSE item_number
-       END AS item_number,
-       formatitemsitebarcode(itemsite_id) AS item_barcode,
---     In 2.3 replaced the next line:
---     uom_name,
---     with:
-       (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
-       itemSellingUOM(item_id) AS item_shipuom,
-       CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip1
-            ELSE item_descrip1
-       END AS item_descrip1,
-       CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip2
-            ELSE item_descrip2
-       END AS item_descrip2,
-       formatQty(coitem_qtyord) AS ordered,
-       formatQty(coitem_qtyshipped - coitem_qtyreturned) AS shipped,
-       formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS balance,
-       formatQty( ( SELECT COALESCE(SUM(coship_qty), 0)
-                    FROM coship, cosmisc
-                    WHERE ( (coship_coitem_id=coitem_id)
-                     AND (coship_cosmisc_id=cosmisc_id)
-                     AND (NOT cosmisc_shipped) ) ) ) AS atshipping,
-       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) / itemInvPriceRat(item_id))) AS shipordered,
-       formatQty(roundUp(((coitem_qtyshipped - coitem_qtyreturned) * coitem_qty_invuomratio) / itemInvPriceRat(item_id))) AS shipshipped,
-       formatQty(roundUp((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) / itemInvPriceRat(item_id))) AS shipbalance,
-       formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
-                            FROM coship, cosmisc
-                            WHERE ( (coship_coitem_id=coitem_id)
-                              AND (coship_cosmisc_id=cosmisc_id)
-                              AND (NOT cosmisc_shipped) ) )/ itemInvPriceRat(item_id) ) ) AS shipatshipping,
-       CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
-            WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
-                                            FROM cohead, invchead, invcitem
-                                           WHERE ((invchead_ordernumber=cohead_number)
-                                             AND  (invcitem_invchead_id=invchead_id)
-                                             AND  (invcitem_item_id=item_id)
-                                             AND  (invcitem_warehous_id=itemsite_warehous_id)
-                                             AND  (invcitem_linenumber=coitem_linenumber)
-                                             AND  (cohead_id=coitem_cohead_id))) >= coitem_qtyord)) THEN 'I'
-            WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
-                                            FROM cohead, invchead, invcitem
-                                           WHERE ((invchead_ordernumber=cohead_number)
-                                             AND  (invcitem_invchead_id=invchead_id)
-                                             AND  (invcitem_item_id=item_id)
-                                             AND  (invcitem_warehous_id=itemsite_warehous_id)
-                                             AND  (invcitem_linenumber=coitem_linenumber)
-                                             AND  (cohead_id=coitem_cohead_id))) > 0)) THEN 'P'
-            WHEN (coitem_status='O' AND (itemsite_qtyonhand - qtyAllocated(itemsite_id, CURRENT_DATE)
-                                         + qtyOrdered(itemsite_id, CURRENT_DATE))
-                                          >= (coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) THEN 'R'
-            ELSE coitem_status
-       END AS f_status
-  FROM coitem
-       JOIN itemsite ON (itemsite_id=coitem_itemsite_id)
-       JOIN item ON (item_id=itemsite_item_id)
-       JOIN uom ON (uom_id=item_inv_uom_id)
-       LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=coitem_custpn)
- WHERE ( (coitem_status <> 'X')
-   AND (coitem_status <> 'C')
--- 1 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
-   <? if exists("hide closed") ?>
-   AND (coitem_status <> 'C')
--- 2 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
--- <? endif ?>
-   AND (coitem_cohead_id=<? value("sohead_id") ?>)
-)
---2.3 add coitem_qty_uom_id, to the GROUP BY clause
-GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_id,
-         coitem_custpn, itemalias_usedescrip, itemalias_descrip1, itemalias_descrip2,
-         item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
-         coitem_qtyreturned, coitem_status, coitem_cohead_id,
-         itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
-ORDER BY coitem_linenumber;
+== MetaSQL statement salesOrderItems-list


 --------------------------------------------------------------------
 REPORT: SingleLevelWhereUsed
 QUERY: detail
-SELECT bomitem_seqnumber, item_number,
-       item_descrip1, item_descrip2, uom_name,
-       formatQty(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyfxd)) AS f_qtyfxd,
-       formatQtyper(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS f_qtyper,
-       formatScrap(bomitem_scrap) AS f_scrap,
-       formatDate(bomitem_effective, 'Always') AS f_effective,
-       formatDate(bomitem_expires, 'Never') AS f_expires,
-       formatBoolYN(bomitem_createwo) AS f_createwo,
-       CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
-            WHEN (bomitem_issuemethod='L') THEN 'Pull'
-            WHEN (bomitem_issuemethod='M') THEN 'Mixed'
-            ELSE 'Special'
-       END AS f_issuemethod,
-       formatQtyper(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, (bomitem_qtyfxd + bomitem_qtyper) * (1 + bomitem_scrap))) as f_qtyreq
-  FROM bomitem, item, uom
- WHERE ((bomitem_parent_item_id=item_id)
-   AND (item_inv_uom_id=uom_id)
-   AND (bomitem_item_id=<? value("item_id") ?>)
-<? if exists("effective") ?>
-   AND (<? value("effective") ?> BETWEEN bomitem_effective and (bomitem_expires-1))
-<? else ?>
-   AND (CURRENT_DATE BETWEEN bomitem_effective and (bomitem_expires-1))
-<? endif ?>
-)
-ORDER BY item_number;
+== MetaSQL statement whereUsed-detail


 --------------------------------------------------------------------
 REPORT: TodoList
 QUERY: queryParams
 SELECT
-  <? if exists("startStartDate") ?>
-  formatDate(<? value("startStartDate") ?>) AS f_startStartDate,
-  formatDate(<? value("startEndDate") ?>) AS f_startEndDate,
-  <? else ?>
-  'All' AS f_startStartDate,
-  'All' AS f_startEndDate,
-  <? endif ?>
-  <? if exists("dueStartDate") ?>
-  formatDate(<? value("dueStartDate") ?>) AS f_dueStartDate,
-  formatDate(<? value("dueEndDate") ?>) AS f_dueEndDate,
-  <? else ?>
-  'All' AS f_dueStartDate,
-  'All' AS f_dueEndDate,
-  <? endif ?>
   <? if exists("completed") ?> 'Yes' <? else ?> 'No' <? endif ?> AS showClosed,
   <? if exists("projects") ?>    'Yes' <? else ?> 'No' <? endif ?> AS showTasks,
-  <? if exists("incidents") ?> 'Yes' <? else ?> 'No' <? endif ?> AS showIncdts,
-  <? if exists("username") ?>
-    <? value("username") ?> AS usr_username
-  <? elseif exists("usr_pattern") ?>
-    <? value("usr_pattern") ?> AS usr_username
-  <? else ?>
-    'All' AS usr_username
-  <? endif ?>
-;
+  <? if exists("incidents") ?> 'Yes' <? else ?> 'No' <? endif ?> AS showIncdts;


 --------------------------------------------------------------------
 REPORT: WOHistoryByClassCode
 QUERY: Detail
-SELECT formatWoNumber(wo_id) AS wonumber,
-       wo_status, warehous_code,
-       item_number, item_descrip1, item_descrip2, uom_name,
-       formatQty(wo_qtyord) AS ordered,
-       formatQty(wo_qtyrcv) AS received,
-       formatDate(wo_startdate) AS startdate,
-       formatDate(wo_duedate) AS duedate,
-       <? if exists("showCosts") ?>
-         formatCost(wo_postedvalue)
-       <? else ?>
-         text('')
-       <? endif ?>
-       AS value
-  FROM wo, itemsite, warehous, item, uom
- WHERE ((wo_itemsite_id=itemsite_id)
-   AND (itemsite_item_id=item_id)
-   AND (item_inv_uom_id=uom_id)
-   AND (itemsite_warehous_id=warehous_id)
-<? if exists("classcode_id") ?>
-   AND (item_classcode_id=<? value("classcode_id") ?>)
-<? elseif exists("classcode_pattern") ?>
-   AND (item_classcode_id IN (SELECT classcode_id FROM classcode WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
-<? endif ?>
-<? if exists("warehous_id") ?>
-   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("showOnlyTopLevel") ?>
-   AND ((wo_ordtype<>'W') OR (wo_ordtype IS NULL))
-<? endif ?>
- )
-ORDER BY item_number;
-
+== MetaSQL statement workOrderHistory-detail
 --------------------------------------------------------------------

 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("classcode_id") ?>
          ( SELECT (classcode_code||'-'||classcode_descrip)
              FROM classcode
             WHERE (classcode_id=<? value("classcode_id") ?>) )
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? else ?>
          text('All Class Codes')
        <? endif ?>
        AS classcode,
        <? if exists("showOnlyTopLevel") ?>
          text('Only Show Top level Work Orders')
        <? else ?>
          text('')
        <? endif ?>
-       AS lbl_toplevel;
+       AS lbl_toplevel,
+       <? if exists("showCosts") ?>
+         text('Cost')
+       <? else ?>
+         text('')
+       <? endif ?>
+       AS lbl_cost
+;


 --------------------------------------------------------------------
 REPORT: WOHistoryByNumber
 QUERY: Detail
 SELECT formatWoNumber(wo_id) AS number,
        wo_subnumber AS subnumber,
        wo_status, warehous_code,
        item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(wo_qtyord) AS ordered,
        formatQty(wo_qtyrcv) AS received,
        formatDate(wo_startdate) AS startdate,
        formatDate(wo_duedate) AS duedate,
        <? if exists("showCosts") ?>
-         formatCost(wo_postedvalue)
+         text('W/O Cost') AS lbl_value,
+         formatCost(wo_postedvalue) AS value
        <? else ?>
-         text('')
+         text('') AS lbl_value,
+         text('') AS value
        <? endif ?>
-       AS value
   FROM wo, itemsite, warehous, item, uom
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (CAST(wo_number AS TEXT) ~ <? value("woNumber") ?>)
-<? if exists("showOnlyTopLeve") ?>
+<? if exists("showOnlyTopLevel") ?>
    AND ((wo_ordtype<>'W') OR (wo_ordtype IS NULL))
 <? endif ?>
  )
 ORDER BY wo_subnumber;