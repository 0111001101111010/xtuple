--------------------------------------------------------------------
REMOVED REPORTS:
PendingWOMaterialAvailability
--------------------------------------------------------------------
NEW REPORTS:
CCReceipt
ItemCostDetail
SalesOrderAcknowledgement
--------------------------------------------------------------------
CHANGED REPORTS:
APAging
ARAging
ARApplications
AROpenItemsByCustomer
AddressesMasterList
BacklogByCustomer
BacklogByItemNumber
BacklogByParameterList
BillingEditList
BookingsByCustomer
BookingsByCustomerGroup
BookingsByItem
BookingsByProductCategory
BookingsBySalesRep
BookingsByShipTo
BriefEarnedCommissions
BriefSalesHistoryByCustomer
BriefSalesHistoryByCustomerType
CapacityUOMsByClassCode
CapacityUOMsByProductCategory
CashReceipts
CheckJournal
CheckRegister
CostedIndentedBOM
CostedSingleLevelBOM
CostedSummarizedBOM
CountSlipsByWarehouse
CountTagEditList
CountTagsByClassCode
CountTagsByItem
CountTagsByWarehouse
CreditMemo
CreditMemoJournal
CustomerARHistory
DeliveryDateVariancesByItem
DeliveryDateVariancesByVendor
DepositsRegister
EarnedCommissions
EmployeeList
ExpediteExceptionsByPlannerCode
ExpiredInventoryByClassCode
FrozenItemSites
IndentedBOM
IndentedWhereUsed
InventoryAvailabilityByItem
InventoryAvailabilityByParameterList
InventoryAvailabilityBySourceVendor
InventoryHistoryByItem
InventoryHistoryByOrderNumber
InventoryHistoryByParameterList
Invoice
InvoiceInformation
ItemCostsByClassCode
ItemMaster
ItemSitesByParameterList
ItemsByCharacteristic
ItemsByClassCode
ItemsByProductCategory
ListOpenSalesOrders
ListTransferOrders
MaterialUsageVarianceByBOMItem
MaterialUsageVarianceByComponentItem
MaterialUsageVarianceByItem
MaterialUsageVarianceByWarehouse
OpenWorkOrdersWithClosedParentSalesOrders
OpenWorkOrdersWithParentSalesOrders
POLineItemsByDate
POLineItemsByItem
POLineItemsByVendor
POsByDate
POsByVendor
PackingList-Shipment
PackingList
PartiallyShippedOrders
PendingWOMaterialAvailability
PickingListSOClosedLines
PickingListSOLocsNoClosedLines
PickingListSONoClosedLines
PricingScheduleAssignments
PurchasePriceVariancesByItem
PurchasePriceVariancesByVendor
PurchaseReqsByPlannerCode
PurchaseRequestsByItem
PurchaseReqsByPlannerCode
QOHByItem
QOHByParameterList
ReceiptsReturnsByDate
ReceiptsReturnsByItem
ReceiptsReturnsByVendor
RejectedMaterialByVendor
ReorderExceptionsByPlannerCode
SalesHistoryByBilltoName
SalesHistoryByCustomer
SalesHistoryByItem
SalesHistoryByParameterList
SalesHistoryBySalesRep
SalesHistoryByShipTo
SalesJournal
SalesJournalByDate
SequencedBOM
SingleLevelBOM
SlowMovingInventoryByClassCode
Statement
SubstituteAvailabilityByRootItem
SummarizedBOM
SummarizedBacklogByWarehouse
SummarizedSalesByCustomerType
SummarizedSalesHistoryByCustomer
SummarizedSalesHistoryByCustomerByItem
SummarizedSalesHistoryByCustomerTypeByItem
SummarizedSalesHistoryByItem
SummarizedSalesHistoryBySalesRep
SummarizedSalesHistoryByShippingZone
SummarizedTaxableSales
TimePhasedAvailability
TimePhasedBookingsByItem
TimePhasedBookingsByProductCategory
TimePhasedDemandByPlannerCode
TimePhasedPlannedRevenueExpensesByPlannerCode
TimePhasedProductionByItem
TimePhasedProductionByPlannerCode
TimePhasedSalesHistoryByItem
TimePhasedSalesHistoryByProductCategory
TimePhasedStatisticsByItem
TimePhasedStatisticsByItem
UniformBOL
UninvoicedReceipts
UninvoicedShipments
UnpostedPoReceipts
UsageStatisticsByClassCode
UsageStatisticsByItem
UsageStatisticsByItemGroup
ValidLocationsByItem
ViewAPCheckRunEditList
WOHistoryByClassCode
WOHistoryByItem
WOHistoryByNumber
WOMaterialRequirementsByComponentItem
WOScheduleByParameterList
WarehouseMasterList


 --------------------------------------------------------------------
 REPORT: APAging
 QUERY: detail
 SELECT
 	apaging_docdate,
 	apaging_duedate,
 	apaging_ponumber,
 	apaging_docnumber,
           apaging_invcnumber,
 	apaging_doctype,
 	apaging_vend_id,
 	apaging_vend_number,
 	apaging_vend_name,
 	apaging_vend_vendtype_id,
 	apaging_vendtype_code,
 	apaging_terms_descrip,
-	apaging_apopen_amount,
-	apaging_cur_amt,
-	apaging_cur_val,
-	apaging_thirty_amt,
-	apaging_thirty_val,
-	apaging_sixty_amt,
-	apaging_sixty_val,
-	apaging_ninety_amt,
-	apaging_ninety_val,
-	apaging_plus_amt,
-	apaging_plus_val,
-	apaging_total_amt,
-	apaging_total_val,
-	apaging_disc_amt,
-	apaging_disc_val,
+	formatMoney(apaging_apopen_amount) AS apaging_apopen_amount,
+	apaging_cur_val,   formatMoney(apaging_cur_val)    AS apaging_cur_amt,
+	apaging_thirty_val,formatMoney(apaging_thirty_val) AS apaging_thirty_amt,
+	apaging_sixty_val, formatMoney(apaging_sixty_val)  AS apaging_sixty_amt,
+	apaging_ninety_val,formatMoney(apaging_ninety_val) AS apaging_ninety_amt,
+	apaging_plus_val,  formatMoney(apaging_plus_val)   AS apaging_plus_amt,
+	apaging_total_val, formatMoney(apaging_total_val)  AS apaging_total_amt,
+	apaging_disc_val,  formatMoney(apaging_disc_val)   AS apaging_disc_amt,
 	apaging_discdate,
 	apaging_discdays,
 	apaging_discprcnt
-FROM apaging(<? value("relDate") ?>, <? if exists("useDocDate") ?>true<? else ?>false<? endif ?>)
+FROM apaging(<? value("relDate") ?>, <? value("useDocDate") ?>)
 <? if exists("vend_id") ?>
    WHERE (apaging_vend_id=<? value("vend_id") ?>)
 <? elseif exists("vendtype_id") ?>
    WHERE (apaging_vend_vendtype_id=<? value("vendtype_id") ?>)
 <? elseif exists("vendtype_pattern") ?>
    WHERE (apaging_vendtype_code ~ <? value("vendtype_pattern") ?>)
 <? endif ?>;

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
-	araging_aropen_amount,
-	araging_cur_amt,
-	araging_cur_val,
-	araging_thirty_amt,
-	araging_thirty_val,
-	araging_sixty_amt,
-	araging_sixty_val,
-	araging_ninety_amt,
-	araging_ninety_val,
-	araging_plus_amt,
-	araging_plus_val,
-	araging_total_amt,
-	araging_total_val
+	formatMoney(araging_aropen_amount) AS araging_aropen_amount,
+	araging_cur_val,   formatMoney(araging_cur_val)    AS araging_cur_amt,
+	araging_thirty_val,formatMoney(araging_thirty_val) AS araging_thirty_amt,
+	araging_sixty_val, formatMoney(araging_sixty_val)  AS araging_sixty_amt,
+	araging_ninety_val,formatMoney(araging_ninety_val) AS araging_ninety_amt,
+	araging_plus_val,  formatMoney(araging_plus_val)   AS araging_plus_amt,
+	araging_total_val, formatMoney(araging_total_val)  AS araging_total_amt
 FROM araging(<? value("relDate") ?>)
 <? if exists("cust_id") ?>
    WHERE (araging_cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
    WHERE (araging_cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    WHERE (araging_custtype_code ~ <? value("custtype_pattern") ?>)
 <? endif ?>;

 --------------------------------------------------------------------
 REPORT: ARApplications
 QUERY: head
 SELECT <? if exists("cust_id") ?>
          (SELECT (cust_number || '-' || cust_name)
             FROM cust
            WHERE (cust_id=<? value("cust_id") ?>) )
        <? elseif exists("custtype_id") ?>
          (select (custtype_code||'-'||custtype_descrip)
             FROM custtype
            WHERE (custtype_id=<? value("custtype_id") ?>) )
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>)
        <? else ?>
          text('All Customers')
        <? endif ?>
        AS f_value,
        <? if exists("custtype_id") ?>
          text('Cust. Type:')
        <? elseif exists("custtype_pattern") ?>
          text('Cust. Type Pattern:')
        <? else ?>
          text('Customer:')
        <? endif ?>
        AS f_label,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
-       <? if exists("showCashReceipts") ?>
-         <? if exists("showCreditMemos") ?>
+       <? if exists("includeCashReceipts") ?>
+         <? if exists("includeCreditMemos") ?>
            text('Show Cash Receipts and Credit Memos')
          <? else ?>
            text('Show Cash Receipts')
          <? endif ?>
-       <? elseif exists("showCreditMemos") ?>
+       <? elseif exists("includeCreditMemos") ?>
          text('Show Credit Memos')
        <? else ?>
          text('Error: No transaction type selected.')
        <? endif ?>
        AS f_show;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT arapply_id,
-       cust_number,
-       cust_name,
        formatDate(arapply_postdate) AS f_postdate,
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
+       formatMoney(arapply_applied) AS f_applied,
+       cust_number, cust_name,
+      (CASE WHEN (arapply_source_doctype='C') THEN <? value("creditMemo") ?>
+            WHEN (arapply_source_doctype='R') THEN <? value("cashdeposit") ?>
+            WHEN (arapply_fundstype='C') THEN <? value("check") ?>
+            WHEN (arapply_fundstype='T') THEN <? value("certifiedCheck") ?>
+            WHEN (arapply_fundstype='M') THEN <? value("masterCard") ?>
+            WHEN (arapply_fundstype='V') THEN <? value("visa") ?>
+            WHEN (arapply_fundstype='A') THEN <? value("americanExpress") ?>
+            WHEN (arapply_fundstype='D') THEN <? value("discoverCard") ?>
+            WHEN (arapply_fundstype='R') THEN <? value("otherCreditCard") ?>
+            WHEN (arapply_fundstype='K') THEN <? value("cash") ?>
+            WHEN (arapply_fundstype='W') THEN <? value("wireTransfer") ?>
+            WHEN (arapply_fundstype='O') THEN <? value("other") ?>
          END || ' ' ||
-         CASE WHEN (arapply_source_doctype='C') THEN TEXT(arapply_source_docnumber)
+       CASE WHEN (arapply_source_doctype IN ('C','R')) THEN TEXT(arapply_source_docnumber)
               ELSE arapply_refnumber
-         END ) AS source,
-       ( CASE WHEN (arapply_target_doctype='D') THEN text('D/M')
-              WHEN (arapply_target_doctype='I') THEN text('Invoice')
-              ELSE text('Other')
-         END || ' ' || TEXT(arapply_target_docnumber) ) AS target,
-       formatMoney(arapply_applied) AS f_applied,
-       arapply_applied
-  FROM arapply, cust
- WHERE ( (arapply_cust_id=cust_id)
+       END) AS source,
+      (CASE WHEN (arapply_target_doctype='D') THEN <? value("debitMemo") ?>
+            WHEN (arapply_target_doctype='I') THEN <? value("invoice") ?>
+            WHEN (arapply_target_doctype='K') THEN <? value("apcheck") ?>
+            ELSE <? value("other") ?>
+       END || ' ' ||
+       TEXT(arapply_target_docnumber)) AS target,
+       currConcat(arapply_curr_id) AS currAbbr,
+       currtobase(arapply_curr_id,arapply_applied,arapply_postdate) AS base_applied
+FROM arapply, custinfo
+WHERE ( (arapply_cust_id=cust_id)
    AND (arapply_postdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (arapply_source_doctype IN (
-
-<? if exists("showCashReceipts") ?>
-    'K'
-  <? if exists("showCreditMemos") ?>
-      ,'C'
+<? if exists("includeCreditMemos") ?>
+  <? if exists("includeCashReceipts") ?>
+            'K', 'C', 'R'
+  <? else ?>
+            'C', 'R'
   <? endif ?>
-<? elseif exists("showCreditMemos") ?>
-    'C'
-<? endif ?>
-  ))
-
+<? else ?>
+            'K'
+<? endif ?> ))
 <? if exists("cust_id") ?>
    AND (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
    AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
-   AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
+  AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype
+                              WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
  )
 ORDER BY arapply_postdate, source;
+

 --------------------------------------------------------------------
 REPORT: AROpenItemsByCustomer
 QUERY: head
 SELECT cust_number,
        cust_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
-       formatDate(<? value("asofDate") ?>) AS asofDate
+       formatDate(<? value("asofDate") ?>) AS asofDate,
+       currConcat(baseCurrId()) AS baseAbbr
   FROM cust
  WHERE (cust_id=<? value("cust_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT aropen_id,
        aropen_doctype,
        aropen_docnumber,
        aropen_ordernumber,
        formatDate(aropen_docdate) AS f_docdate,
        formatDate(aropen_duedate) AS f_duedate,
        formatMoney(aropen_amount) AS f_amount,
-       formatMoney(aropen_paid + SUM(currtobase(arapply_curr_id,arapply_applied,arapply_postdate))) AS f_paid,
-       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney((aropen_amount - aropen_paid + SUM(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)) * -1))
-            WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(aropen_amount - aropen_paid + SUM(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)))
-            ELSE formatMoney(aropen_amount - aropen_paid + SUM(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)))
+       formatMoney(aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate))) AS f_paid,
+       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney((aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate)) * -1))
+            WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate)))
+            ELSE formatMoney(aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate)))
        END AS f_balance,
-       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN ((aropen_amount - aropen_paid + SUM(currtobase(arapply_curr_id,arapply_applied,arapply_postdate))) * -1)
-            WHEN (aropen_doctype IN ('I', 'D')) THEN (aropen_amount - aropen_paid + SUM(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)))
-            ELSE (aropen_amount - aropen_paid + SUM(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)))
-       END AS balance
+       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN ((aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate))) * -1)
+            WHEN (aropen_doctype IN ('I', 'D')) THEN (aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate)))
+            ELSE (aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate)))
+       END AS balance,
+       currtobase(aropen_curr_id,
+       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN ((aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate))) * -1)
+            WHEN (aropen_doctype IN ('I', 'D')) THEN (aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate)))
+            ELSE (aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate)))
+       END, aropen_docdate) AS base_balance,
+       formatMoney(currtobase(aropen_curr_id,
+       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN ((aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate))) * -1)
+            WHEN (aropen_doctype IN ('I', 'D')) THEN (aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate)))
+            ELSE (aropen_amount - aropen_paid + SUM(currtocurr(arapply_curr_id,aropen_curr_id,arapply_applied,arapply_postdate)))
+       END, aropen_docdate)) AS f_base_balance,
+       currConcat(aropen_curr_id) AS currAbbr
   FROM aropen
     LEFT OUTER JOIN arapply ON (((aropen_id=arapply_source_aropen_id)
                               OR (aropen_id=arapply_target_aropen_id))
                              AND (arapply_distdate > <? value("asofDate") ?>))
   WHERE ( (COALESCE(aropen_closedate,date <? value("asofDate") ?> + integer '1')><? value("asofDate") ?>)
         AND   (aropen_docdate<=<? value("asofDate") ?>)
         AND   (aropen_cust_id=<? value("cust_id") ?>)
         AND   (aropen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
 GROUP BY aropen_id,aropen_docnumber,aropen_ordernumber,aropen_doctype,aropen_docdate,aropen_duedate,aropen_amount,aropen_curr_id,aropen_paid
 ORDER BY aropen_docdate;

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
-SELECT 'Warehouse' AS type, warehous_code AS first,
+SELECT 'Site' AS type, warehous_code AS first,
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
             SELECT cntct_addr_id FROM cntct
             UNION SELECT shipto_addr_id FROM shiptoinfo
             UNION SELECT vend_addr_id FROM vendinfo
             UNION SELECT vendaddr_addr_id FROM vendaddrinfo
             UNION SELECT warehous_addr_id FROM whsinfo)
 <? if exists("activeOnly") ?> AND addr_active <? endif ?>
 ORDER BY addr_country, addr_state, addr_city,
          addr_postalcode, addr_line1, addr_line2,
          addr_line3, type, last, first;

 --------------------------------------------------------------------
 REPORT: BacklogByCustomer
 QUERY: detail
 SELECT cohead_number, coitem_linenumber,
        formatDate(cohead_orderdate) AS f_orderdate,
        formatDate(coitem_scheddate) AS f_scheddate,
        item_number, uom_name,
        item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS f_qtyord,
        formatQty(coitem_qtyshipped) AS f_qtyship,
        formatPrice(coitem_price) AS f_unitprice,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS f_balance,
        <? if exists("showPrices") ?>
 formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (
-currtobase(cohead_curr_id,coitem_price,current_date)
+currtobase(cohead_curr_id,coitem_price,cohead_orderdate)
 / coitem_price_invuomratio),2))
        <? else ?>
          text('')
        <? endif ?>
        AS f_ammount,
  <? if exists("showPrices") ?>
 formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2))
        <? else ?>
          text('')
        <? endif ?>
        AS foreign_ammount,
 round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (
-currtobase(cohead_curr_id,coitem_price,current_date)
+currtobase(cohead_curr_id,coitem_price,cohead_orderdate)
 / coitem_price_invuomratio),2) AS total_backlog
 FROM cohead, coitem, itemsite, item, uom
 WHERE ((coitem_cohead_id=cohead_id)
  AND (coitem_itemsite_id=itemsite_id)
  AND (itemsite_item_id=item_id)
  AND (item_inv_uom_id=uom_id)
  AND (coitem_status NOT IN ('C','X'))
  AND (cohead_cust_id=<? value("cust_id") ?>)
  AND (coitem_scheddate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY coitem_scheddate, cohead_number, coitem_linenumber;

 --------------------------------------------------------------------
 REPORT: BacklogByItemNumber
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (SELECT warehous_code
             FROM warehous
            WHERE (warehous_id=<? value("warehous_id") ?>))
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("showPrices") ?>
          text('$ Amount')
        <? else ?>
          text('')
        <? endif ?>
        AS lbl_amount
 FROM item JOIN uom ON (item_inv_uom_id=uom_id)
 WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohead_number,
        coitem_linenumber, cust_name,
        formatDate(cohead_orderdate) AS f_orderdate,
        formatDate(coitem_scheddate) AS f_scheddate,
        formatQty(coitem_qtyord) AS f_qtyord,
        formatQty(coitem_qtyshipped) AS f_qtyship,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS f_balance,
        <? if exists("showPrices") ?>
-         formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2))
+formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (
+currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2))
        <? else ?>
          ''
        <? endif ?>
        AS f_ammount,
-       round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2) AS backlog
+round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (
+currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2) AS backlog
   FROM cohead, coitem, cust, itemsite, item
  WHERE ((coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_status NOT IN ('C','X'))
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
    AND (coitem_scheddate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 ) ORDER BY coitem_scheddate;

 --------------------------------------------------------------------
 REPORT: BacklogByParameterList
 QUERY: head
 SELECT <? if exists("custtype_id") ?>
          ( SELECT (custtype_code || '-' || custtype_descrip)
              FROM custtype
             WHERE (custtype_id = <? value("custtype_id") ?>) )
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>)
        <? elseif exists("custgrp_id") ?>
          ( SELECT (custgrp_name || '-' || custgrp_descrip)
              FROM custgrp
             WHERE (custgrp_id=<? value("custgrp_id") ?>) )
        <? elseif exists("custgrp_pattern") ?>
          text(<? value("custgrp_pattern") ?>)
        <? elseif exists("prodcat_id") ?>
          ( SELECT (prodcat_code || '-' || prodcat_descrip)
              FROM prodcat
             WHERE (prodcat_id=<? value("prodcat_id") ?>) )
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('')
        <? endif ?>
        AS f_value,
        <? if exists("custtype_id") ?>
          text('Customer Type:')
        <? elseif exists("custtype_pattern") ?>
          text('Cust. Type Pattern:')
        <? elseif exists("custgrp_id") ?>
          text('Customer Group')
        <? elseif exists("custgrp_pattern") ?>
          text('Cust. Group Pattern')
        <? elseif exists("prodcat_id") ?>
          text('Prod. Category:')
        <? elseif exists("prodcat_pattern") ?>
          text('Prod. Cat. Pattern:')
        <? else ?>
          text('')
        <? endif ?>
        AS f_label,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (SELECT warehous_code
             FROM warehous
            WHERE (warehous_id=<? value("warehous_id") ?>))
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("showPrices") ?>
          text('Amount(base)')
        <? else ?>
          text('')
        <? endif ?>
        AS lbl_baseamount,
  <? if exists("showPrices") ?>
          text('Amount(foreign)')
        <? else ?>
          text('')
        <? endif ?>
        AS lbl_foreignamount;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohead_number, coitem_linenumber, cust_name,
        formatDate(cohead_orderdate) AS f_orderdate,
        formatDate(coitem_scheddate) AS f_scheddate,
        item_number, uom_name,
        item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS f_qtyord,
        formatQty(coitem_qtyshipped) AS f_qtyship,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS f_balance,
 <? if exists("showPrices") ?>
-formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (
-currtobase(cohead_curr_id,coitem_price,current_date)
-/ coitem_price_invuomratio),2))
+formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
+                * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2))
        <? else ?>
          text('')
        <? endif ?>
        AS f_ammount,
  <? if exists("showPrices") ?>
-formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2))
+formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
+                * (coitem_price / coitem_price_invuomratio),2))
        <? else ?>
          text('')
        <? endif ?>
        AS foreign_ammount,
-round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (
-currtobase(cohead_curr_id,coitem_price,current_date)
-/ coitem_price_invuomratio),2) AS backlog
+round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
+    * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2) AS backlog
   FROM cohead, coitem, itemsite, item, cust, uom
  WHERE ((coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coitem_status NOT IN ('C','X'))
    AND (coitem_scheddate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?>
    AND (cust_custtype_id = <? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? elseif exists("custgrp") ?>
    AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id FROM custgrpitem))
 <? elseif exists("custgrp_id") ?>
    AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id FROM custgrp, custgrpitem WHERE ( (custgrpitem_custgrp_id=custgrp_id) AND (custgrp_id=<? value("custgrp_id") ?>) )))
 <? elseif exists("custgrp_pattern") ?>
    AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id FROM custgrp, custgrpitem WHERE ( (custgrpitem_custgrp_id=custgrp_id) AND (custgrp_name ~ <? value("custgrp_pattern") ?>) )))
 <? elseif exists("prodcat_id") ?>
    AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (item_prodcat_id IN (SELECT DISTINCT prodcat_id FROM prodcat WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 )
 ORDER BY coitem_scheddate, cohead_number, coitem_linenumber;

 --------------------------------------------------------------------
 REPORT: BillingEditList
 QUERY: detail
 SELECT cohead_id			AS orderid,
        -2				AS itemid,
        CASE WHEN (formatInvcNumber(cobmisc_id) <> '') THEN ('Invc-' || formatInvcNumber(cobmisc_id))
             ELSE '?'
        END 				AS documentnumber,
        cust_number			AS name,
        cohead_billtoname 		AS descrip,
        text(cohead_number) 		AS f_ordernumber,
        cohead_number 			AS ordernumber,
        -1 				AS linenumber,
        '' 				AS iteminvuom,
        '' 				AS qtytobill,
        '' 				AS price,
        '' 				AS extprice,
        0			        AS subextprice,
        0			        AS runningextprice,
        COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                    FROM accnt
                    WHERE (accnt_id=findARAccount(cust_id)) ), 'Not Assigned') AS debit,
        '' AS credit,
        currConcat(cobmisc_curr_id)      AS currabbr
 FROM cobmisc, cohead, cust
 WHERE ( (cobmisc_cohead_id=cohead_id)
  AND (cohead_cust_id=cust_id)
  AND (NOT cobmisc_posted)
 <? if exists("showPrinted") ?>
  AND (cobmisc_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cobmisc_printed)
 <? endif ?>
 )

 UNION
 SELECT cohead_id 			AS orderid,
        -1 				AS itemid,
        '' 				AS documentnumber,
        'Freight'			AS name,
        'Freight Charge' 		AS descrip,
        ''		 		AS f_ordernumber,
        cohead_number			AS ordernumber,
        -1 				AS linenumber,
        '' 				AS iteminvuom,
        '' 				AS qtytobill,
        formatExtPrice(cobmisc_freight) 	AS price,
        formatExtPrice(cobmisc_freight) 	AS extprice,
        cobmisc_freight			AS subextprice,
        currtobase(cobmisc_curr_id, cobmisc_freight, cobmisc_invcdate) AS runningextprice,
        '' AS debit,
        (formatGLAccount(freight.accnt_id) || ' - ' || freight.accnt_descrip) 	AS credit,
        currConcat(cobmisc_curr_id)      AS currabbr
 FROM cobmisc, cohead, accnt AS freight
 WHERE ( (cobmisc_cohead_id=cohead_id)
  AND (freight.accnt_id=findFreightAccount(cohead_cust_id))
  AND (NOT cobmisc_posted)
  AND (cobmisc_freight <> 0)
 <? if exists("showPrinted") ?>
  AND (cobmisc_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cobmisc_printed)
 <? endif ?>
 )

 UNION
 SELECT cohead_id 								AS orderid,
 	-1 									AS itemid,
         '' 									AS documentnumber,
         'Misc. Charge'								AS name,
 	cohead_misc_descrip 							AS descrip,
         ''		 							AS f_ordernumber,
 	cohead_number								AS ordernumber,
 	-1 									AS linenumber,
 	'' 									AS iteminvuom,
         '' 									AS qtytobill,
         formatExtPrice(cobmisc_misc) 						AS price,
         formatExtPrice(cobmisc_misc) 						AS extprice,
 	cobmisc_misc								AS subextprice,
 	currToBase(cobmisc_curr_id, cobmisc_misc, cobmisc_invcdate)				AS runningextprice,
        '' AS debit,
         (formatGLAccount(misc.accnt_id) || ' - ' || misc.accnt_descrip) 	AS credit,
         currConcat(cobmisc_curr_id)     AS currabbr
 FROM cobmisc, cohead, accnt AS misc
 WHERE ( (cobmisc_cohead_id=cohead_id)
  AND (cobmisc_misc_accnt_id=misc.accnt_id)
  AND (NOT cobmisc_posted)
  AND (cobmisc_misc <> 0)
 <? if exists("showPrinted") ?>
  AND (cobmisc_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cobmisc_printed)
 <? endif ?>
 )

 UNION
 SELECT  cohead_id 								AS orderid,
 	-1 									AS itemid,
         '' 									AS documentnumber,
         'Sales Tax'								AS name,
 	tax_descrip	 							AS descrip,
         ''		 							AS f_ordernumber,
 	cohead_number								as ordernumber,
 	-1				 					AS linenumber,
 	''						 			AS iteminvuom,
         '' 									AS qtytobill,
         formatExtPrice(cobmisc_tax) 						AS price,
         formatExtPrice(cobmisc_tax) 						AS extprice,
 	cobmisc_tax								AS subextprice,
 	currtobase(cobmisc_tax_curr_id, cobmisc_tax, cobmisc_invcdate)				AS runningextprice,
        '' AS debit,
         (formatGLAccount(taxaccnt.accnt_id) || ' - ' || taxaccnt.accnt_descrip) AS credit,
         currConcat(cobmisc_tax_curr_id)     AS currabbr
-FROM cobmisc, cohead, accnt AS taxaccnt, tax
+FROM cobmisc, cohead, coitem, tax, accnt AS taxaccnt
 WHERE ( (cobmisc_cohead_id=cohead_id)
+ AND (coitem_cohead_id=cohead_id)
+ AND (tax_id=coitem_tax_id)
  AND (tax_sales_accnt_id=taxaccnt.accnt_id)
- AND (cohead_tax_id=tax_id)
  AND (NOT cobmisc_posted)
  AND (cobmisc_tax <> 0)
 <? if exists("showPrinted") ?>
  AND (cobmisc_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cobmisc_printed)
 <? endif ?>
 )

 UNION
 SELECT  cohead_id 								AS orderid,
 	coitem_id 								AS itemid,
         '' 									AS documentnumber,
         item_number								AS name,
 	(item_descrip1 || ' ' || item_descrip2)					AS descrip,
         ''		 							AS f_ordernumber,
         cohead_number	 							AS ordernumber,
 	coitem_linenumber 							AS linenumber,
 	uom_name AS iteminvuom,
         formatQty(cobill_qty) 							AS qtytobill,
         formatPrice(coitem_price) 						AS price,
         formatExtPrice((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) 		AS extprice,
 	((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio))			AS subextprice,
 	currtobase(cobmisc_curr_id, ((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)), cobmisc_invcdate) AS runningextprice,
         '' AS debit,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt, salesaccnt
                     WHERE ((salesaccnt_sales_accnt_id=accnt_id)
                      AND (salesaccnt_id=findSalesAccnt(itemsite_id, cohead_cust_id)))), 'Not Assigned') AS credit,
         currConcat(cobmisc_curr_id)     AS currabbr
 FROM item, itemsite, cobmisc, cohead, cobill, coitem, uom
 WHERE ( (coitem_itemsite_id=itemsite_id)
  AND (cobill_coitem_id=coitem_id)
  AND (cobill_cobmisc_id=cobmisc_id)
  AND (cobmisc_cohead_id=cohead_id)
  AND (itemsite_item_id=item_id)
  AND (item_inv_uom_id=uom_id)
  AND (cobill_cobmisc_id=cobmisc_id)
  AND (NOT cobmisc_posted)
 <? if exists("showPrinted") ?>
  AND (cobmisc_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cobmisc_printed)
 <? endif ?>
 )

 UNION
 SELECT 	cmhead_id 					AS orderid,
 	-2 						AS itemid,
         ('C/M-' || formatCreditMemoNumber(cmhead_id)) 	AS documentnumber,
         cust_number					AS name,
 	cmhead_billtoname 				AS descrip,
         text(cmhead_number) 				AS f_ordernumber,
 	cmhead_number					AS ordernumber,
 	-1 						AS linenumber,
 	'' 						AS iteminvuom,
         '' 						AS qtytobill,
         '' 						AS price,
         '' 						AS extprice,
 	0						AS subextprice,
 	0						AS runningextprice,
         '' AS debit,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt
                     WHERE (accnt_id=findARAccount(cmhead_cust_id)) ), 'Not Assigned') AS credit,
         currConcat(cmhead_curr_id)     AS currabbr
 FROM cmhead, cust
 WHERE ( (cmhead_cust_id=cust_id)
  AND (NOT cmhead_posted)
  AND (NOT cmhead_hold)
 <? if exists("showPrinted") ?>
  AND (cmhead_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cmhead_printed)
 <? endif ?>
 )

 UNION
 SELECT  cmhead_id 								AS orderid,
 	-1 									AS itemid,
         '' 									AS documentnumber,
         'Freight'								AS name,
 	'Freight Charge'							AS descrip,
         ''		 							AS f_ordernumber,
         cmhead_number	 							AS ordernumber,
 	-1 									AS linenumber,
 	'' 									AS iteminvuom,
         '' 									AS qtytobill,
         formatExtPrice(cmhead_freight) 						AS price,
         formatExtPrice(cmhead_freight) 						AS extprice,
 	(cmhead_freight * -1)							AS subextprice,
 	currtobase(cmhead_curr_id, cmhead_freight * -1, cmhead_gldistdate)				AS runningextprice,
         (formatGLAccount(freight.accnt_id) || ' - ' || freight.accnt_descrip) 	AS credit,
         '' AS debit,
         currConcat(cmhead_curr_id)     AS currabbr
 FROM cmhead, accnt AS freight
 WHERE ( (freight.accnt_id=findFreightAccount(cmhead_cust_id))
  AND (NOT cmhead_posted)
  AND (NOT cmhead_hold)
  AND (cmhead_freight <> 0)
 <? if exists("showPrinted") ?>
  AND (cmhead_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cmhead_printed)
 <? endif ?>
 )

 UNION
 SELECT  cmhead_id 								AS orderid,
 	cmitem_id 								AS itemid,
         '' 									AS documentnumber,
         item_number								AS name,
 	(item_descrip1 || ' ' || item_descrip2)					AS descrip,
         ''		 							AS f_ordernumber,
         cmhead_number	 							AS ordernumber,
 	cmitem_linenumber 							AS linenumber,
-	item_invuom                                                             AS iteminvuom,
+	uom_name                                                                AS iteminvuom,
         formatQty(cmitem_qtycredit) 						AS qtytobill,
         formatPrice(cmitem_unitprice) 						AS price,
         formatExtPrice((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio)) 	AS extprice,
 	((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio) * -1)			AS subextprice,
 	currtobase(cmhead_curr_id, ((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio) * -1), cmhead_gldistdate) AS runningextprice,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt, salesaccnt
                     WHERE ((salesaccnt_sales_accnt_id=accnt_id)
                      AND (salesaccnt_id=findSalesAccnt(itemsite_id, cmhead_cust_id)))), 'Not Assigned') AS credit,
         '' AS debit,
         currConcat(cmhead_curr_id)     AS currabbr
 FROM item, itemsite, cmhead, cmitem, uom
 WHERE ( (cmitem_itemsite_id=itemsite_id)
  AND (cmitem_cmhead_id=cmhead_id)
  AND (itemsite_item_id=item_id)
  AND (item_inv_uom_id=uom_id)
  AND (NOT cmhead_posted)
  AND (NOT cmhead_hold)
 <? if exists("showPrinted") ?>
  AND (cmhead_printed)
 <? elseif exists("showUnprinted") ?>
  AND (NOT cmhead_printed)
 <? endif ?>
 )

 ORDER BY ordernumber, linenumber;

 --------------------------------------------------------------------
 REPORT: BookingsByCustomer
 QUERY: head
 SELECT cust_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
           text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Categories')
        <? endif ?>
        AS prodcat
   FROM cust
  WHERE (cust_id=<? value("cust_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        item_number, item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
-       formatPrice(coitem_price) AS unitprice,
-       formatExtPrice((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS f_extprice
+formatPrice(currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio) AS unitprice,
+formatExtPrice(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
+                   * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2)) AS f_extprice
   FROM coitem, cohead, cust, itemsite, item, prodcat
  WHERE ((coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (coitem_status <> 'X')
    AND (itemsite_item_id=item_id)
    AND (item_prodcat_id=prodcat_id)
    AND (cohead_cust_id=<? value("cust_id") ?>)
    AND (cohead_orderdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("prodcat_id") ?>
    AND (prodcat_id = <? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY cohead_orderdate;

 --------------------------------------------------------------------
 REPORT: BookingsByCustomerGroup
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
            (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-           text('All Warehouses')
+           text('All Sites')
        <? endif ?>
          AS warehouse,
        <? if exists("custgrp_id") ?>
            (select (custgrp_name||'-'||custgrp_descrip) from custgrp where custgrp_id=<? value("custgrp_id") ?>)
        <? elseif exists("custgrp_pattern") ?>
            text(<? value("custgrp_pattern") ?>)
        <? else ?>
            text('All Customer Groups')
        <? endif ?>
          AS custgrp,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startDate,
        formatDate(<? value("endDate") ?>, 'Latest') AS endDate,
        <? if exists("showPrices") ?>
            text('Unit Price') AS lbl_unitprice,
            text('Total') AS lbl_total
        <? else ?>
            text('') AS lbl_unitprice,
            text('') AS lbl_total
        <? endif ?>
 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohist_ordernumber AS sonumber,
        cohist_invcnumber AS invnumber,
        formatDate(cohist_orderdate) AS orddate,
        formatDate(cohist_invcdate) AS invcdate,
        item_number, item_descrip1, item_descrip2,
        formatQty(cohist_qtyshipped) AS f_shipped,
        cohist_qtyshipped AS shipped,
        <? if exists("showPrices") ?>
-       formatPrice(cohist_unitprice) AS unitprice,
-       formatMoney(round(cohist_qtyshipped * cohist_unitprice,2))  AS f_total,
-       round(cohist_qtyshipped * cohist_unitprice,2)  AS total
+formatPrice(currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio)) AS unitprice,
+formatExtPrice(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
+                   * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2)) AS f_total,
+round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
+                   * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2) AS total
        <? else ?>
        '' AS unitprice,
        '' AS f_total,
        0 AS total
        <? endif ?>
   FROM cohist, itemsite, item, cust, custgrpitem, custgrp
  WHERE ((cohist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (cohist_cust_id=cust_id)
    AND (custgrpitem_custgrp_id=custgrp_id)
    AND (custgrpitem_cust_id=cust_id)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("custgrp_id") ?>
    AND (custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custgrp_pattern") ?>
    AND (custgrp_name ~ <? value("custgrp_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY cohist_invcdate, item_number;

 --------------------------------------------------------------------
 REPORT: BookingsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        cust_number, cust_name,
        formatQty(coitem_qtyord) AS ordered,
-       formatPrice(coitem_price) AS unitprice,
-       formatExtPrice((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS f_extprice
+formatPrice(currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio) AS unitprice,
+formatExtPrice(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
+                   * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2)) AS f_extprice
   FROM coitem, cohead, cust, itemsite, item
  WHERE ((coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (coitem_status <> 'X')
    AND (itemsite_item_id=item_id)
    AND (item_id=<? value("item_id") ?>)
    AND (cohead_orderdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY cohead_orderdate;

 --------------------------------------------------------------------
 REPORT: BookingsByProductCategory
 QUERY: head
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Categories')
        <? endif ?>
        AS prodcat ;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        cust_number, cust_name,
        item_number, item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
-       formatPrice(coitem_price) AS unitprice,
-       formatExtPrice((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS f_extprice
+formatPrice(currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio) AS unitprice,
+formatExtPrice(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
+                   * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2)) AS f_extprice
   FROM coitem, cohead, cust, itemsite, item, prodcat
  WHERE ((coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (coitem_status <> 'X')
    AND (itemsite_item_id=item_id)
    AND (item_prodcat_id=prodcat_id)
    AND (cohead_orderdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY cohead_orderdate;

 --------------------------------------------------------------------
 REPORT: BookingsBySalesRep
 QUERY: head
 SELECT salesrep_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Categories')
        <? endif ?>
        AS prodcat
    FROM salesrep
 WHERE (salesrep_id=<? value("salesrep_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        cust_number, cust_name,
        item_number, item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
-       formatPrice(coitem_price) AS unitprice,
-       formatExtPrice((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS f_extprice
+formatPrice(currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio) AS unitprice,
+formatExtPrice(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
+                   * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2)) AS f_extprice
   FROM coitem, cohead, cust, itemsite, item, prodcat
  WHERE ((coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (coitem_status <> 'X')
    AND (itemsite_item_id=item_id)
    AND (item_prodcat_id=prodcat_id)
    AND (cohead_salesrep_id=<? value("salesrep_id") ?>)
    AND (cohead_orderdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
 )
 ORDER BY cohead_orderdate;

 --------------------------------------------------------------------
 REPORT: BookingsByShipTo
 QUERY: head
 SELECT cust_name,
        shipto_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Categories')
        <? endif ?>
        AS prodcat
   FROM shipto, cust
  WHERE ((shipto_cust_id=cust_id)
    AND (shipto_id=<? value("shipto_id") ?>) );

 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        item_number, item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
-       formatPrice(coitem_price) AS unitprice,
-       formatExtPrice((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS f_extprice
+formatPrice(currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio) AS unitprice,
+formatExtPrice(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
+                   * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2)) AS f_extprice
   FROM coitem, cohead, cust, itemsite, item, prodcat
  WHERE ((coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (coitem_status <> 'X')
    AND (itemsite_item_id=item_id)
    AND (item_prodcat_id=prodcat_id)
    AND (cohead_shipto_id=<? value("shipto_id") ?>)
    AND (cohead_orderdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("prodcat_id") ?>
    AND (prodcat_id = <? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY cohead_orderdate;

 --------------------------------------------------------------------
 REPORT: BriefEarnedCommissions
 QUERY: head
 SELECT <? if exists("salesrep_id") ?>
          ( SELECT salesrep_name
              FROM salesrep
             WHERE (salesrep_id=<? value("salesrep_id") ?>) )
        <? else ?>
          text('All Sales Reps')
        <? endif ?>
        AS salesrep,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT salesrep_id, salesrep_number, salesrep_name, cust_number, cust_name,
        cohist_ordernumber, cohist_invcnumber, formatDate(cohist_invcdate) as f_invcdate,
-       formatMoney(SUM(round(cohist_qtyshipped * cohist_unitprice,2))) as f_extprice,
-       SUM(round(cohist_qtyshipped * cohist_unitprice,2)) AS extprice,
+       formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) as f_extprice,
+       SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) as extprice,
        formatMoney(SUM(round(cohist_commission,2))) as f_commission,
        SUM(round(cohist_commission,2)) AS commission
   FROM cohist, salesrep, cust
  WHERE ((cohist_cust_id=cust_id)
    AND (cohist_salesrep_id=salesrep_id)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (cohist_commission <> 0)
 <? if exists("salesrep_id") ?>
    AND (salesrep_id=<? value("salesrep_id") ?>)
 <? endif ?>
 )
 GROUP BY salesrep_id, salesrep_number, salesrep_name, cust_number, cust_name,
          cohist_ordernumber, cohist_invcnumber, cohist_invcdate
 ORDER BY salesrep_number, cust_number, cohist_invcdate

 --------------------------------------------------------------------
 REPORT: BriefSalesHistoryByCustomer
 QUERY: head
 SELECT cust_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          ( SELECT (prodcat_code||'-'||prodcat_descrip)
              FROM prodcat
             WHERE (prodcat_id=<? value("prodcat_id") ?>) )
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Product Categories')
        <? endif ?>
        AS prodcat,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate
   FROM cust
  WHERE (cust_id=<? value("cust_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohist_ordernumber AS sonumber,
        cohist_invcnumber AS invnumber,
        formatDate(cohist_orderdate) AS orddate,
        formatDate(cohist_invcdate, 'Return') AS shipdate,
-       SUM(round(cohist_qtyshipped * cohist_unitprice,2)) AS extended,
-       formatMoney(SUM(round(cohist_qtyshipped * cohist_unitprice,2))) AS f_total,
-       SUM(round(cohist_qtyshipped * cohist_unitprice,2)) AS total
+       SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) as extended,
+       formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) as f_total,
+       SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) as total
   FROM cohist, itemsite, item
  WHERE ((cohist_itemsite_id=itemsite_id)
   AND (itemsite_item_id=item_id)
   AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
   AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
   AND (item_prodcat_id in (SELECT prodcat_id
                              FROM prodcat
                             WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>) ) )
 <? endif ?>
   AND (cohist_cust_id=<? value("cust_id") ?>) )
 GROUP BY cohist_ordernumber, cohist_invcnumber, cohist_orderdate, cohist_invcdate
 ORDER BY cohist_invcdate, cohist_orderdate;

 --------------------------------------------------------------------
 REPORT: BriefSalesHistoryByCustomerType
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("custtype_id") ?>
          ( SELECT (custtype_code||'-'||custtype_descrip)
              FROM custtype
             WHERE (custtype_id=<? value("custtype_id") ?>) )
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>)
        <? else ?>
          text('All Customer Types')
        <? endif ?>
        AS custtype,
        formatDate(<? value("startDate") ?>) as startdate,
        formatDate(<? value("endDate") ?>) as enddate;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT custtype_id, custtype_code, cust_name,
        cohist_ordernumber AS sonumber,
        cohist_invcnumber AS invnumber,
        formatDate(cohist_orderdate) AS orddate,
        formatDate(cohist_invcdate) AS shipdate,
-       SUM(round(cohist_qtyshipped * cohist_unitprice,2)) as extended,
-       formatMoney(SUM(round(cohist_qtyshipped * cohist_unitprice,2)))  AS f_total,
-       SUM(round(cohist_qtyshipped * cohist_unitprice,2))  AS total
+       SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) as extended,
+       formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) as f_total,
+       SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) as total
   FROM cohist, cust, custtype, itemsite, item
  WHERE ((cohist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (cohist_cust_id=cust_id)
    AND (cust_custtype_id=custtype_id)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("custtype_id") ?>
    AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    AND (cust_custtype_id IN (SELECT custtype_id
                                FROM custtype
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>) ) )
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 GROUP BY custtype_id, custtype_code, cust_name,
          cohist_ordernumber, cohist_invcnumber,
          cohist_orderdate, cohist_invcdate
 ORDER BY cohist_invcdate, cohist_orderdate;

 --------------------------------------------------------------------
 REPORT: CapacityUOMsByClassCode
 QUERY: detail
 SELECT classcode_code,
        item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        itemcapuom(item_id) AS capuom,
        formatRatio(itemcapinvrat(item_id)) AS capratio,
        itemaltcapuom(item_id) AS altcapuom,
        formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
-       item_shipuom,
+       itemsellinguom(item_id) AS shipuom,
        formatRatio(iteminvpricerat(item_id)) AS shipratio
   FROM item, classcode, uom
  WHERE ((item_classcode_id=classcode_id)
    AND (item_inv_uom_id=uom_id)
 <? if exists("classcode_id") ?>
    AND (classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (classcode_code ~ <? value("classcode_pattern") ?>)
 <? endif ?>
 )
 ORDER BY classcode_code, item_number;

 --------------------------------------------------------------------
 REPORT: CapacityUOMsByProductCategory
 QUERY: detail
 SELECT prodcat_code,
        item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        itemcapuom(item_id) AS capuom,
        formatRatio(itemcapinvrat(item_id)) AS capratio,
        itemaltcapuom(item_id) AS altcapuom,
        formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
-       item_shipuom,
-       formatRatio(item_shipinvrat) AS shipratio
+       itemsellinguom(item_id) AS shipuom,
+       formatRatio(iteminvpricerat(item_id)) AS shipratio
   FROM item, prodcat, uom
  WHERE ((item_sold)
    AND (item_inv_uom_id=uom_id)
    AND (item_prodcat_id=prodcat_id)
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
 )
 ORDER BY prodcat_code, item_number;

 --------------------------------------------------------------------
 REPORT: CashReceipts
 QUERY: detail
 SELECT arapply_id,
        1 AS type,
        cust_number,
        cust_name,
        formatDate(arapply_postdate) AS f_postdate,
        ( CASE WHEN (arapply_source_doctype='C') THEN text('C/M')
               WHEN (arapply_fundstype='C') THEN text('Check')
               WHEN (arapply_fundstype='T') THEN text('Certified Check')
               WHEN (arapply_fundstype='M') THEN text('M/C')
               WHEN (arapply_fundstype='V') THEN text('Visa')
               WHEN (arapply_fundstype='A') THEN text('AmEx')
               WHEN (arapply_fundstype='D') THEN text('Discover')
               WHEN (arapply_fundstype='R') THEN text('Other C/C')
               WHEN (arapply_fundstype='K') THEN text('C/R')
               WHEN (arapply_fundstype='W') THEN text('Wire Trans.')
               WHEN (arapply_fundstype='O') THEN text('Other')
          END || ' ' ||
          CASE WHEN (arapply_source_doctype='C') THEN TEXT(arapply_source_docnumber)
               ELSE arapply_refnumber
          END ) AS source,
        ( CASE WHEN (arapply_target_doctype='D') THEN text('D/M')
               WHEN (arapply_target_doctype='I') THEN text('Invoice')
               ELSE text('Other')
          END || ' ' || TEXT(arapply_target_docnumber) ) AS target,
        formatMoney(arapply_applied) AS f_applied,
-       arapply_applied, arapply_postdate AS sortdate
+       arapply_applied,
+       formatMoney(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)) AS f_base_applied,
+       currtobase(arapply_curr_id,arapply_applied,arapply_postdate) AS base_applied,
+       currConcat(arapply_curr_id) AS currAbbr,
+       arapply_postdate AS sortdate
   FROM arapply, cust
  WHERE ( (arapply_cust_id=cust_id)
    AND (arapply_postdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (arapply_source_doctype='K')

 <? if exists("cust_id") ?>
    AND (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
    AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
  )

  UNION SELECT cashrcpt_id,
        2 AS type,
        cust_number,
        cust_name,
        formatDate(cashrcpt_distdate) AS f_postdate,
        ( CASE WHEN (cashrcpt_fundstype='C') THEN text('Check')
               WHEN (cashrcpt_fundstype='T') THEN text('Certified Check')
               WHEN (cashrcpt_fundstype='M') THEN text('M/C')
               WHEN (cashrcpt_fundstype='V') THEN text('Visa')
               WHEN (cashrcpt_fundstype='A') THEN text('AmEx')
               WHEN (cashrcpt_fundstype='D') THEN text('Discover')
               WHEN (cashrcpt_fundstype='R') THEN text('Other C/C')
               WHEN (cashrcpt_fundstype='K') THEN text('C/R')
               WHEN (cashrcpt_fundstype='W') THEN text('Wire Trans.')
               WHEN (cashrcpt_fundstype='O') THEN text('Other')
          END || ' ' || cashrcpt_docnumber ) AS source,
        text('') AS target,
        formatMoney(cashrcpt_amount) AS f_applied,
-       cashrcpt_amount, cashrcpt_distdate AS sortdate
+       cashrcpt_amount,
+       formatMoney(currtobase(cashrcpt_curr_id,cashrcpt_amount,cashrcpt_distdate)) AS f_base_applied,
+       currtobase(cashrcpt_curr_id,cashrcpt_amount,cashrcpt_distdate) AS base_applied,
+       currConcat(cashrcpt_curr_id) AS currAbbr,
+       cashrcpt_distdate AS sortdate
   FROM cashrcpt, cust
  WHERE ( (cashrcpt_cust_id=cust_id)
    AND (cashrcpt_distdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)

 <? if exists("cust_id") ?>
    AND (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
    AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
  )

  UNION SELECT aropen_id,
        3 AS type,
        cust_number,
        cust_name,
        formatDate(aropen_docdate) AS f_postdate,
        ( CASE WHEN (substr(aropen_notes, 16, 1)='C') THEN text('Check')
               WHEN (substr(aropen_notes, 16, 1)='T') THEN text('Certified Check')
               WHEN (substr(aropen_notes, 16, 1)='M') THEN text('M/C')
               WHEN (substr(aropen_notes, 16, 1)='V') THEN text('Visa')
               WHEN (substr(aropen_notes, 16, 1)='A') THEN text('AmEx')
               WHEN (substr(aropen_notes, 16, 1)='D') THEN text('Discover')
               WHEN (substr(aropen_notes, 16, 1)='R') THEN text('Other C/C')
               WHEN (substr(aropen_notes, 16, 1)='K') THEN text('C/R')
               WHEN (substr(aropen_notes, 16, 1)='W') THEN text('Wire Trans.')
               WHEN (substr(aropen_notes, 16, 1)='O') THEN text('Other')
          END || ' ' ||
          substr(aropen_notes, 18)) AS source,
        TEXT('Unapplied') AS target,
        formatMoney(aropen_amount) AS f_applied,
-       aropen_amount, aropen_docdate AS sortdate
+       aropen_amount,
+       formatMoney(currtobase(aropen_curr_id,aropen_amount,aropen_docdate)) AS f_base_applied,
+       currtobase(aropen_curr_id,aropen_amount,aropen_docdate) AS base_applied,
+       currConcat(aropen_curr_id) AS currAbbr,
+       aropen_docdate AS sortdate
   FROM aropen, cust
  WHERE ( (aropen_cust_id=cust_id)
    AND (aropen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (aropen_doctype='R')

 <? if exists("cust_id") ?>
    AND (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
    AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
  )

 ORDER BY sortdate, source;

 --------------------------------------------------------------------
 REPORT: CheckJournal
 QUERY: detail
-SELECT checkrecip_name,
+SELECT bankaccnt_name,
+       checkrecip_name,
        checkhead_number,
        formatDate(checkhead_checkdate) AS f_checkdate,
        formatMoney(checkhead_amount) AS f_amount,
-       checkhead_amount
-  FROM checkhead, checkrecip
- WHERE ((checkhead_recip_id=checkrecip_id)
+       checkhead_amount,
+       formatMoney(currtobase(checkhead_curr_id,checkhead_amount,checkhead_checkdate)) AS f_baseamount,
+       currtobase(checkhead_curr_id,checkhead_amount,checkhead_checkdate) AS baseamount,
+       currconcat(checkhead_curr_id) AS currAbbr
+  FROM checkhead, bankaccnt, checkrecip
+ WHERE ((checkhead_bankaccnt_id=bankaccnt_id)
+   AND  (checkhead_recip_id=checkrecip_id)
    AND  (checkhead_recip_type=checkrecip_type)
    AND  (checkhead_journalnumber=<? value("journalNumber") ?>) )
-ORDER BY checkhead_number;
+ORDER BY bankaccnt_name, checkhead_number;

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
        1 AS orderby
   FROM checkhead LEFT OUTER JOIN
        checkrecip ON ((checkhead_recip_id=checkrecip_id)
 		 AND  (checkhead_recip_type=checkrecip_type))
  WHERE ((checkhead_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>) )
+   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
+   <? if exists("check_number") ?>
+      AND   (CAST(checkhead_number AS text) ~ <? value("check_number") ?>)
+   <? endif ?>
+   <? if exists("recip") ?>
+      <? if exists("recip_type_v") ?>
+	 AND   (checkhead_recip_type = 'V' )
+      <? endif ?>
+      <? if exists("recip_type_c") ?>
+	 AND   (checkhead_recip_type = 'C' )
+      <? endif ?>
+      <? if exists("recip_type_t") ?>
+	 AND   (checkhead_recip_type = 'T' )
+      <? endif ?>
+      <? if exists("recip_id") ?>
+	 AND   (checkhead_recip_id = <? value("recip_id") ?> )
+      <? endif ?>
+   <? endif ?>
+   )
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
        2 AS orderby
   FROM checkitem, checkhead
  WHERE ( (checkitem_checkhead_id=checkhead_id)
    AND   (checkhead_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>) )
+   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
+      <? if exists("check_number") ?>
+      AND   (CAST(checkhead_number AS text) ~ <? value("check_number") ?>)
+   <? endif ?>
+   <? if exists("recip") ?>
+      <? if exists("recip_type_v") ?>
+         AND   (checkhead_recip_type = 'V' )
+      <? endif ?>
+      <? if exists("recip_type_c") ?>
+         AND   (checkhead_recip_type = 'C' )
+      <? endif ?>
+      <? if exists("recip_type_t") ?>
+         AND   (checkhead_recip_type = 'T' )
+      <? endif ?>
+      <? if exists("recip_id") ?>
+         AND   (checkhead_recip_id = <? value("recip_id") ?> )
+      <? endif ?>
+   <? endif ?> )
 <? endif ?>
  ORDER BY checkhead_number, checkid, orderby;
 --------------------------------------------------------------------

 QUERY: total
 SELECT formatMoney(SUM(currToCurr(checkhead_curr_id, bankaccnt_curr_id, checkhead_amount, checkhead_checkdate))) AS f_amount,
        currConcat(bankaccnt_curr_id) AS currAbbr
   FROM checkhead, checkrecip, bankaccnt
  WHERE ( (checkhead_recip_id=checkrecip_id)
    AND   (checkhead_recip_type=checkrecip_type)
    AND   (NOT checkhead_void)
    AND   (checkhead_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND   (checkhead_bankaccnt_id=bankaccnt_id)
-   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>) )
+   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
+   <? if exists("check_number") ?>
+      AND   (CAST(checkhead_number AS text) ~ <? value("check_number") ?>)
+   <? endif ?>
+   <? if exists("recip") ?>
+      <? if exists("recip_type_v") ?>
+         AND   (checkhead_recip_type = 'V' )
+      <? endif ?>
+      <? if exists("recip_type_c") ?>
+         AND   (checkhead_recip_type = 'C' )
+      <? endif ?>
+      <? if exists("recip_type_t") ?>
+         AND   (checkhead_recip_type = 'T' )
+      <? endif ?>
+      <? if exists("recip_id") ?>
+         AND   (checkhead_recip_id = <? value("recip_id") ?> )
+      <? endif ?>
+   <? endif ?> )
 GROUP BY bankaccnt_curr_id;

 --------------------------------------------------------------------
 REPORT: CostedIndentedBOM
 QUERY: head
 SELECT item_number,
-       item_invuom,
+       uom_name AS item_invuom,
        item_descrip1,
        item_descrip2,
        <? if exists("useActualCosts") ?>
          text('Using Actual Costs')
        <? else ?>
          text('Using Standard Costs')
        <? endif ?>
        AS lbl_usecosts,
        formatCost(actcost(item_id)) AS f_actual,
        formatCost(stdcost(item_id)) AS f_standard
-  FROM item
+  FROM item JOIN uom ON (uom_id=item_inv_uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 select (REPEAT(' ',(bomdata_bomwork_level-1)*3) || bomdata_bomwork_seqnumber) AS f_seqnumber,
        1 AS seq_ord,
        bomdata_item_number AS item_number,
        bomdata_uom_name AS item_invuom,
        bomdata_item_descrip1 AS item_descrip1,
        bomdata_item_descrip2 AS item_descrip2,
        bomdata_createchild as createchild,
        bomdata_issuemethod AS issuemethod,
-       bomdata_qtyper AS qtyper,
-       bomdata_scrap AS scrap,
-       bomdata_effective AS effective,
-       bomdata_expires AS expires,
+       formatQtyPer(bomdata_qtyper) AS qtyper,
+       formatScrap(bomdata_scrap) AS scrap,
+       CASE WHEN COALESCE(bomdata_effective, startOfTime()) <= startOfTime() THEN
+                 <? value("always") ?>
+            ELSE formatDate(bomdata_effective)
+       END AS effective,
+       CASE WHEN COALESCE(bomdata_expires, endOfTime()) <= endOfTime() THEN
+                 <? value("never") ?>
+            ELSE formatDate(bomdata_expires)
+       END AS expires,
 <? if exists("useActualCosts") ?>
        formatCost(bomdata_actunitcost) AS f_unitcost,
        formatCost(bomdata_actextendedcost) AS f_extendedcost,
        CASE WHEN(bomdata_bomwork_parent_id=-1) THEN bomdata_actextendedcost
             ELSE 0
        END AS extendedcost,
 <? else ?>
        formatCost(bomdata_stdunitcost) AS f_unitcost,
        formatCost(bomdata_stdextendedcost) AS f_extendedcost,
        CASE WHEN(bomdata_bomwork_parent_id=-1) THEN bomdata_stdextendedcost
             ELSE 0
        END AS extendedcost,
 <? endif ?>
        bomdata_bomwork_level
-FROM indentedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,0,0)
-ORDER BY seq_ord;
+FROM indentedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,0,0);
+

 --------------------------------------------------------------------
 REPORT: CostedSingleLevelBOM
 QUERY: head
 SELECT item_number,
-       item_invuom,
+       uom_name AS item_invuom,
        item_descrip1,
        item_descrip2,
        formatCost(stdcost(item_id)) AS standardcost,
        formatCost(actcost(item_id)) AS actualcost,
        <? if exists("useActualCosts") ?>
          text('Actual Cost')
        <? else ?>
          text('Standard Cost')
        <? endif ?>
        AS costtype
-  FROM item
+  FROM item JOIN uom ON (uom_id=item_inv_uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT bomdata_bomwork_seqnumber AS orderby,
   CASE WHEN bomdata_bomwork_seqnumber > 0 THEN
     text(bomdata_bomwork_seqnumber)
   ELSE NULL
   END AS seqnumber,
   bomdata_item_number AS item_number,
   bomdata_uom_name AS item_invuom,
   bomdata_item_descrip1 AS item_descrip1,
   bomdata_item_descrip2 AS item_descrip2,
   bomdata_issuemethod AS issuemethod,
-  bomdata_qtyper AS qtyper,
-  bomdata_scrap AS scrap,
+  formatQtyPer(bomdata_qtyper) AS qtyper,
+  formatScrap(bomdata_scrap) AS scrap,
   CASE
     WHEN item_inv_uom_id IS NOT NULL THEN
       formatqtyper(bomitem_qtyper * (1 + bomitem_scrap) * itemuomtouomratio(bomitem_item_id,bomitem_uom_id,item_inv_uom_id))
     ELSE
       ''
   END AS qtyreq,
-  bomdata_effective AS effective,
-  bomdata_expires AS expires,
+  CASE WHEN COALESCE(bomdata_effective, startOfTime()) <= startOfTime() THEN
+             <? value("always") ?>
+       ELSE formatDate(bomdata_effective)
+  END AS effective,
+  CASE WHEN COALESCE(bomdata_expires, endOfTime()) >= endOfTime() THEN
+             <? value("never") ?>
+       ELSE formatDate(bomdata_expires)
+  END AS expires,
 <? if exists("useActualCosts") ?>
   formatCost(bomdata_actunitcost)
 <? else ?>
   formatCost(bomdata_stdunitcost)
 <? endif ?>
   AS unitcost,
 <? if exists("useActualCosts") ?>
   formatCost(bomdata_actextendedcost)
 <? else ?>
   formatCost(bomdata_stdextendedcost)
 <? endif ?>
   AS extcost
 FROM singlelevelbom(<? value("item_id") ?>,<? value("revision_id") ?>,0,0)
   LEFT OUTER JOIN bomitem ON (bomdata_bomitem_id=bomitem_id)
   LEFT OUTER JOIN item ON (bomitem_item_id=item_id)
 ORDER BY orderby;

 --------------------------------------------------------------------
 REPORT: CostedSummarizedBOM
 QUERY: head
 SELECT item_number,
-       item_invuom,
+       uom_name AS item_invuom,
        item_descrip1,
        item_descrip2,
 <? if exists("useActualCosts") ?>
        text('Actual Costs') AS f_costtype
 <? else ?>
        text('Standard Costs') AS f_costtype
 <? endif ?>
-  FROM item
+  FROM item JOIN uom ON (uom_id=item_inv_uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 select bomdata_item_number AS item_number,
        bomdata_uom_name AS item_invuom,
        bomdata_item_descrip1 AS item_descrip1,
        bomdata_item_descrip2 AS item_descrip2,
-       bomdata_qtyper AS qtyper,
+       formatQtyPer(bomdata_qtyper) AS qtyper,
 <? if exists("useActualCosts") ?>
        formatCost(bomdata_actunitcost) AS f_cost,
        formatCost(bomdata_actextendedcost) AS f_extcost
 <? else ?>
        formatCost(bomdata_stdunitcost) AS f_cost,
        formatCost(bomdata_stdextendedcost) AS f_extcost
 <? endif ?>
   FROM summarizedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,<? value("expiredDays") ?>,<? value("futureDays") ?>);

 --------------------------------------------------------------------
 REPORT: CountSlipsByWarehouse
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate

 --------------------------------------------------------------------
 REPORT: CountTagEditList
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
                    FROM warehous
                    WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("classcode_id") ?>
          ( SELECT (classcode_code ||'-'||classcode_descrip)
              FROM classcode
             WHERE (classcode_id=<? value("classcode_id") ?>) ) AS code,
 	  text('Class Code:') AS codelbl
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>) AS code,
          text('Class Code:') AS codelbl
        <? elseif exists("plancode_id") ?>
          ( SELECT (plancode_code ||'-'|| plancode_name)
              FROM plancode
             WHERE (plancode_id=<? value("plancode_id") ?>) ) AS code,
 	  text('Planner Code:') AS codelbl
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>) AS code,
          text('Planner Code:') AS codelbl
        <? else ?>
          text('') AS code,
          text('') AS codelbl
        <? endif ?>

 --------------------------------------------------------------------
 REPORT: CountTagsByClassCode
 QUERY: head
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("classcode_id") ?>
          ( SELECT (classcode_code || '-' || classcode_descrip)
              FROM classcode
             WHERE (classcode_id=<? value("classcode_id") ?>) )
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? else ?>
          text('All Class Codes')
        <? endif ?>
        AS classcode,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: CountTagsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: CountTagsByWarehouse
 QUERY: head
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: CreditMemo
 QUERY: GroupHead
 SELECT remitto.*,
        cmhead_number,
        formatDate(cmhead_docdate) AS docdate,
        cust_number,
        cust_name,
        cust_address1,
        cust_address2,
        cust_address3,
        (COALESCE(cust_city,'') || '  ' || COALESCE(cust_state,'') || '  ' || COALESCE(cust_zipcode,'')) AS cust_citystatezip,
        cust_phone,
        cmhead_shipto_name,
        cmhead_shipto_address1,
        cmhead_shipto_address2,
        cmhead_shipto_address3,
        (COALESCE(cmhead_shipto_city,'') ||'  '|| COALESCE(cmhead_shipto_state,'') || '  '|| COALESCE(cmhead_shipto_zipcode,'')) AS shipto_citystatezip,
        CASE
-         WHEN (cmhead_invcnumber=-1) THEN ''
-         ELSE text(cmhead_invcnumber)
+         WHEN (cmhead_invcnumber='-1') THEN ''
+         ELSE cmhead_invcnumber
        END AS invcnumber,
        cmhead_custponumber,
        cmhead_comments,
-       cmhead_misc_descrip
+       cmhead_misc_descrip,
+       currconcat(cmhead_curr_id) AS currabbr
   FROM remitto, cmhead, cust
  WHERE ((cmhead_cust_id=cust_id)
    AND (cmhead_id=%1))
 ORDER BY cmhead_number;

 --------------------------------------------------------------------
 REPORT: CreditMemoJournal
 QUERY: detail
 SELECT cust_number, cust_name, aropen_docnumber, aropen_doctype, formatDate(aropen_docdate) AS docdate,
-       aropen_applyto, formatExtPrice(aropen_amount) AS openamount, aropen_ponumber,
+       aropen_applyto, formatExtPrice(currtobase(aropen_curr_id,aropen_amount,aropen_docdate)) AS openamount, aropen_ponumber,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS accntnumber,
        CASE WHEN (gltrans_amount < 0) THEN formatExtPrice(ABS(gltrans_amount))
             ELSE ''
        END AS debit,
        CASE WHEN (gltrans_amount > 0) THEN formatExtPrice(gltrans_amount)
             ELSE ''
        END AS credit
 FROM aropen, gltrans, cust, accnt
 WHERE ( (aropen_cust_id=cust_id)
  AND (aropen_docnumber=gltrans_docnumber)
  AND (aropen_doctype IN ('C', 'R'))
  AND (gltrans_doctype='CM')
  AND (gltrans_accnt_id=accnt_id)
  AND (gltrans_journalnumber=<? value("journalNumber") ?>)
  AND (aropen_journalnumber=<? value("journalNumber") ?>) )
 ORDER BY aropen_docnumber, gltrans_amount, accnt_number;

 --------------------------------------------------------------------

 QUERY: totaldocsales
-SELECT formatExtPrice(SUM(COALESCE(aropen_amount, 0))) AS amount
+SELECT formatExtPrice(SUM(COALESCE(currtobase(aropen_curr_id,aropen_amount,aropen_docdate), 0))) AS amount
 FROM aropen
 WHERE ( (aropen_doctype IN ('C', 'R'))
  AND (aropen_journalnumber=<? value("journalNumber") ?>) );

 --------------------------------------------------------------------
 REPORT: CustomerARHistory
 QUERY: detail
 SELECT aropen_id, -1 AS arapply_id,
        aropen_docnumber AS sortnumber,
        aropen_docnumber AS docnumber,
        formatBoolYN(aropen_open) AS f_open,
        CASE WHEN (aropen_doctype='I') THEN 'Invoice'
             WHEN (aropen_doctype='C') THEN 'C/M'
             WHEN (aropen_doctype='D') THEN 'D/M'
             WHEN (aropen_doctype='R') THEN 'C/D'
             ELSE 'Other'
        END AS documenttype,
        formatDate(aropen_docdate) AS f_docdate,
        formatDate(aropen_duedate) AS f_duedate,
-       formatMoney(aropen_amount) AS f_amount,
-       formatMoney((aropen_amount - aropen_paid)) AS f_balance
+       formatMoney(currtobase(aropen_curr_id,aropen_amount,aropen_docdate)) AS f_amount,
+       formatMoney(currtobase(aropen_curr_id,(aropen_amount - aropen_paid),aropen_docdate)) AS f_balance
 FROM aropen
 WHERE ( (aropen_cust_id=<? value("cust_id") ?>)
  AND (aropen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )

 UNION
 SELECT aropen_id, arapply_id,
        aropen_docnumber AS sortnumber,
        CASE WHEN (arapply_source_doctype='C') THEN arapply_source_docnumber
             WHEN (arapply_source_doctype='K') THEN arapply_refnumber
             ELSE 'Error'
        END AS docnumber,
        '' AS f_open,
        CASE WHEN (arapply_source_doctype='C') THEN 'C/M'
             WHEN (arapply_fundstype='C') THEN 'Check'
             WHEN (arapply_fundstype='T') THEN 'Certified Check'
             WHEN (arapply_fundstype='M') THEN 'Master Card'
             WHEN (arapply_fundstype='V') THEN 'Visa'
             WHEN (arapply_fundstype='A') THEN ';American Express'
             WHEN (arapply_fundstype='D') THEN 'Discover Card'
             WHEN (arapply_fundstype='R') THEN 'Other Credit Card'
             WHEN (arapply_fundstype='K') THEN 'Cash'
             WHEN (arapply_fundstype='W') THEN 'Wire Transfer'
             WHEN (arapply_fundstype='O') THEN 'Other'
        END AS documenttype,
        formatDate(arapply_postdate) AS f_docdate,
        '' AS f_duedate,
-       formatMoney(arapply_applied) AS f_amount,
+       formatMoney(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)) AS f_amount,
        '' AS f_balance
 FROM arapply, aropen
 WHERE ( (arapply_target_doctype IN ('I', 'D'))
  AND (arapply_target_doctype=aropen_doctype)
  AND (arapply_target_docnumber=aropen_docnumber)
  AND (arapply_cust_id=<? value("cust_id") ?>)
  AND (aropen_cust_id=<? value("cust_id") ?>)
  AND (aropen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )

 UNION
 SELECT aropen_id, arapply_id,
        aropen_docnumber AS sortnumber,
        arapply_target_docnumber AS docnumber,
        '' AS f_open,
        CASE WHEN (arapply_target_doctype='I') THEN 'Invoice'
             WHEN (arapply_target_doctype='D') THEN 'D/M'
             ELSE 'Other'
        END AS documenttype,
        formatDate(arapply_postdate) AS f_docdate,
        '' AS f_duedate,
-       formatMoney(arapply_applied) AS f_amount,
+       formatMoney(currtobase(arapply_curr_id,arapply_applied,arapply_postdate)) AS f_amount,
        '' AS f_balance
 FROM arapply, aropen
 WHERE ( (arapply_source_doctype IN ('K', 'C'))
  AND (arapply_source_doctype=aropen_doctype)
  AND (arapply_source_docnumber=aropen_docnumber)
  AND (arapply_cust_id=<? value("cust_id") ?>)
  AND (aropen_cust_id=<? value("cust_id") ?>)
  AND (aropen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )

 ORDER BY sortnumber DESC, arapply_id;

 --------------------------------------------------------------------
 REPORT:
 QUERY: detail
-SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, uom_name, roundUp(SUM(coship_qty) / item_shipinvrat)::integer AS shipqty,
-                item_shipuom, item_number, item_descrip1, item_descrip2,
+SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, uom_name, roundUp(SUM(coship_qty) / itemuomratiobytype(item_id, 'Selling'))::integer AS shipqty,
+                itemsellinguom(item_id) AS shipuom, item_number, item_descrip1, item_descrip2,
                 formatQty(SUM(coship_qty) * item_prodweight) AS netweight,
                 formatQty(SUM(coship_qty) * (item_prodweight + item_packweight)) AS grossweight
          FROM coship, coitem, itemsite, item, uom
          WHERE ((coship_coitem_id=coitem_id)
           AND (coitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
           AND (coship_cosmisc_id=%1))
-         GROUP BY coitem_linenumber, item_number, uom_name, item_shipinvrat, item_shipuom,
+         GROUP BY coitem_linenumber, item_number, uom_name, shipuom
                   item_descrip1, item_descrip2, item_prodweight, item_packweight
          ORDER BY coitem_linenumber;

 --------------------------------------------------------------------
 REPORT: DeliveryDateVariancesByItem
 QUERY: head
 SELECT item_number, item_descrip1,
        item_descrip2, uom_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername") ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: DeliveryDateVariancesByVendor
 QUERY: head
 SELECT vend_name,
        vend_number,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS purchagent
   FROM vend
  WHERE (vend_id=<? value("vend_id") ?>);

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
-       formatMoney(aropen_amount - aropen_paid) AS f_aropen_bal
+       formatMoney(currtobase(aropen_curr_id,(aropen_amount - aropen_paid),aropen_docdate)) AS f_aropen_bal

     FROM gltrans LEFT OUTER JOIN aropen ON ((text(gltrans_docnumber) = 'I-' || text(aropen_docnumber))
                                         AND (aropen_doctype='I')), accnt

  WHERE ((gltrans_accnt_id=accnt_id)
    AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (gltrans_doctype = 'CR'))
 ORDER BY gltrans_created DESC, gltrans_sequence, gltrans_amount;

 --------------------------------------------------------------------
 REPORT: EarnedCommissions
 QUERY: detail
 SELECT salesrep_name, cohist_ordernumber,
        cust_number, cohist_shiptoname,
        formatDate(cohist_invcdate) AS f_invcdate,
        item_number, formatQty(cohist_qtyshipped) AS f_qty,
-       formatMoney(round(cohist_qtyshipped * cohist_unitprice,2)) AS f_extprice,
-       round(cohist_qtyshipped * cohist_unitprice,2) as extprice,
+       formatMoney(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS f_extprice,
+       round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2) as extprice,
        formatMoney(cohist_commission) AS f_prcnt,
        round(cohist_commission,2) as prcnt,
        formatBoolYN(cohist_commissionpaid) AS f_earned
   FROM cohist, salesrep, cust, itemsite, item
  WHERE ( (cohist_cust_id=cust_id)
    AND (cohist_salesrep_id=salesrep_id)
    AND (cohist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (cohist_commission <> 0)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("salesrep_id") ?>
    AND (salesrep_id=<? value("salesrep_id") ?>)
 <? endif ?>
 )
 ORDER BY salesrep_name, cohist_invcdate;

 --------------------------------------------------------------------
 REPORT: EmployeeList
 QUERY: detail
-SELECT e.emp_id, m.emp_id, e.emp_active, e.emp_code, e.emp_number,
+SELECT e.emp_id, m.emp_id, warehous_code, e.emp_code, e.emp_number,
+       cntct_first_name, cntct_last_name,
        m.emp_code AS mgr_code, dept_number, shift_number
-FROM emp e LEFT OUTER JOIN
-     emp m ON (e.emp_mgr_emp_id=m.emp_id) LEFT OUTER JOIN
-     shift ON (e.emp_shift_id=shift_id) LEFT OUTER JOIN
-     dept  ON (e.emp_dept_id=dept_id)
+FROM emp e
+  LEFT OUTER JOIN cntct ON (emp_cntct_id=cntct_id)
+  LEFT OUTER JOIN whsinfo ON (emp_warehous_id=warehous_id)
+  LEFT OUTER JOIN emp m ON (e.emp_mgr_emp_id=m.emp_id)
+  LEFT OUTER JOIN shift ON (e.emp_shift_id=shift_id)
+  LEFT OUTER JOIN dept  ON (e.emp_dept_id=dept_id)
 WHERE ((LENGTH(TRIM(COALESCE(<? value("searchString") ?>,''))) = 0)
 <? if exists("searchCode") ?>
    OR (e.emp_code ~* <? value("searchString") ?>)
 <? endif ?>
 <? if exists("searchDept") ?>
    OR (dept_number ~* <? value("searchString") ?>)
    OR (dept_name   ~* <? value("searchString") ?>)
 <? endif ?>
 <? if exists("searchMgr") ?>
    OR (m.emp_code   ~* <? value("searchString") ?>)
    OR (m.emp_number ~* <? value("searchString") ?>)
 <? endif ?>
 <? if exists("searchNumber") ?>
    OR (e.emp_number ~* <? value("searchString") ?>)
 <? endif ?>
+<? if exists("searchName") ?>
+   OR (cntct_first_name ~* <? value("searchString") ?>)
+   OR (cntct_last_name   ~* <? value("searchString") ?>)
+<? endif ?>
 <? if exists("searchShift") ?>
    OR (shift_number ~* <? value("searchString") ?>)
    OR (shift_name   ~* <? value("searchString") ?>)
 <? endif ?>
       )
 <? if exists("activeOnly") ?>
    AND e.emp_active
 <? endif ?>
+<? if exists("warehouse_id") ?>
+   AND (warehous_id=<? value("warehouse_id") ?>)
+<? endif ?>
 ORDER BY emp_code;

 --------------------------------------------------------------------
 REPORT: ExpediteExceptionsByPlannerCode
 QUERY: head
 SELECT <? if exists("plancode_id") ?>
          ( SELECT (plancode_code || '-' || plancode_name)
              FROM plancode
             WHERE (plancode_id=<? value("plancode_id") ?>) )
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('All Planner Codes')
        <? endif ?>
        AS plannercode,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: ExpiredInventoryByClassCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (SELECT warehous_code
             FROM warehous
            WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse,
        <? if exists("classcode_id") ?>
          (SELECT (classcode_code || '-' || classcode_descrip)
             FROM classcode
            WHERE (classcode_id=<? value("classcode_id") ?>) )
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? else ?>
          text('All Class Codes')
        <? endif ?>
        AS classcode,
        <? if exists("perishability") ?>
        'Perishability'
        <? else ?>
        'Warranty'
        <? endif ?> AS expiretype,
        <? if exists("showValue") ?>
            <? if exists("useActualCosts") ?>
              text('Show Inventory Value with Actual Costs')
-           <? else ?>
+           <? elseif exists("useStandardCosts") ?>
              text('Show Inventory Value with Standard Costs')
+           <? else ?>
+             text('Show Inventory Value with Posted Costs')
            <? endif ?>
            AS showvalues,
            text('Unit Cost') AS f_unitcost,
            text('Value') AS f_value,
        <? else ?>
            text('') AS showvalues,
            text('') AS f_unitcost,
            text('') AS f_value,
        <? endif ?>
        int4(<? value("thresholdDays") ?>) AS f_thresholddays;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        ls_number AS itemloc_lotserial,
        formatQty(itemloc_qty) AS f_qoh,
        formatDate(itemloc_expiration) AS f_expiration,
        <? if exists("showValue") ?>
          formatCost(cost)
        <? else ?>
          text('')
        <? endif ?>
        AS f_unitcost,
        noNeg(cost * itemloc_qty) AS value,
        <? if exists("showValue") ?>
          formatExtPrice(noNeg(cost * itemloc_qty))
        <? else ?>
          text('')
        <? endif ?>
        AS f_value
   FROM ( SELECT itemsite_id,
                 warehous_code,
                 item_number,
                 item_descrip1,
                 item_descrip2,
                 uom_name,
                 ls_number,
                 itemloc_qty,
 <? if exists("perishability") ?>
                 itemloc_expiration,
 <? elseif exists("warranty") ?>
                 itemloc_warrpurc AS itemloc_expiration,
 <? endif ?>
                 <? if exists("useActualCosts") ?>
                   actcost(itemsite_item_id)
-                <? else ?>
+                <? elseif exists("useStandardCosts") ?>
                   stdcost(itemsite_item_id)
+                <? else ?>
+                  (itemsite_value / CASE WHEN(itemsite_qtyonhand=0) THEN 1 ELSE itemsite_qtyonhand END)
                 <? endif ?>
                 AS cost
            FROM itemloc, itemsite, item, warehous, uom, ls
           WHERE ((itemloc_itemsite_id=itemsite_id)
             AND (itemloc_ls_id=ls_id)
             AND (itemsite_item_id=item_id)
             AND (item_inv_uom_id=uom_id)
             AND (itemsite_warehous_id=warehous_id)
 <? if exists("perishability") ?>
             AND (itemsite_perishable)
             AND (itemloc_expiration < (CURRENT_DATE + <? value("thresholdDays") ?>))
 <? elseif exists("warranty") ?>
             AND (itemsite_warrpurc)
             AND (itemloc_warrpurc < (CURRENT_DATE + <? value("thresholdDays") ?>))
 <? endif ?>
 <? if exists("warehous_id") ?>
             AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("classcode_id") ?>
             AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
             AND (item_classcode_id IN (SELECT classcode_id
                                          FROM classcode
                                         WHERE classcode_code ~ <? value("classcode_pattern") ?>) )
 <? endif ?>
                 )
        ) AS data
 ORDER BY warehous_code,
 <? if exists("orderByInventoryValue") ?>
   value DESC
 <? elseif exists("orderByExpirationDate") ?>
   itemloc_expiration
 <? else ?>
   item_number
 <? endif ?>

 --------------------------------------------------------------------
 REPORT: FrozenItemSites
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
         ( SELECT warehous_code
             FROM warehous
            WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: IndentedBOM
 QUERY: head
 SELECT item_number,
-       item_invuom,
+       uom_name AS item_invuom,
        item_descrip1,
        item_descrip2
-  FROM item
- WHERE (item_id=<? value("item_id") ?>);
+  FROM item, uom
+ WHERE ((item_id=<? value("item_id") ?>)
+ AND (item_inv_uom_id=uom_id));

 --------------------------------------------------------------------

 QUERY: detail
 SELECT (REPEAT(' ',(bomdata_bomwork_level-1)*3) || bomdata_bomwork_seqnumber) AS f_seqnumber,
        bomdata_item_number AS item_number,
        bomdata_uom_name AS item_invuom,
        bomdata_item_descrip1 AS item_descrip1,
        bomdata_item_descrip2 AS item_descrip2,
        bomdata_issuemethod AS issuemethod,
        bomdata_createchild AS createchild,
-       bomdata_qtyper AS qtyper,
-       bomdata_scrap AS scrap,
-       bomdata_effective AS effective,
-       bomdata_expires AS expires
+       formatQtyPer(bomdata_qtyper) AS qtyper,
+       formatScrap(bomdata_scrap) AS scrap,
+       CASE WHEN COALESCE(bomdata_effective, startOfTime()) <= startOfTime()
+            THEN <? value("always") ?>
+            ELSE formatDate(bomdata_effective)
+       END AS effective,
+       CASE WHEN COALESCE(bomdata_expires, endOfTime()) >= endOfTime()
+            THEN <? value("never") ?>
+            ELSE formatDate(bomdata_expires)
+       END AS expires
 FROM indentedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,<? value("expiredDays") ?>,<? value("futureDays") ?>)
 WHERE (bomdata_item_id>0);

 --------------------------------------------------------------------
 REPORT: IndentedWhereUsed
 QUERY: head
 SELECT item_number,
-       item_invuom,
+       uom_name AS item_invuom,
        item_descrip1,
        item_descrip2
-  FROM item
- WHERE (item_id=<? value("item_id") ?>);
+  FROM item, uom
+ WHERE ((item_id=<? value("item_id") ?>)
+ AND (item_inv_uom_id=uom_id));

 --------------------------------------------------------------------

 QUERY: detail
 SELECT (REPEAT(' ',(bomwork_level-1)*3) || bomwork_seqnumber) AS f_seqnumber,
        bomworkitemsequence(bomwork_id) AS seqord,
-       item_number, item_invuom,
+       item_number, uom_name AS item_invuom,
        item_descrip1, item_descrip2,
        formatQtyPer(bomwork_qtyper) AS qtyper,
        formatScrap(bomwork_scrap) AS scrap,
        formatDate(bomwork_effective, 'Always') AS effective,
        formatDate(bomwork_expires, 'Never') AS expires
-  FROM bomwork, item
+  FROM bomwork, item, uom
  WHERE ((bomwork_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (bomwork_set_id=<? value("bomworkset_id") ?>)
 <? if not exists("showExpired") ?>
    AND (bomwork_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
    AND (bomwork_effective <= CURRENT_DATE)
 <? endif ?>
 )
 ORDER BY seqord;

 --------------------------------------------------------------------
 REPORT: InventoryAvailabilityByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("byDays") ?>
          (text('Look ahead ') || text(<? value("byDays") ?>) || text(' days'))
        <? elseif exists("byDate") ?>
          (text('Cutoff date ') || formatDate(<? value("byDate") ?>))
        <? elseif exists("byDates") ?>
          (text('Dates from ') || formatDate(<? value("startDate") ?>) || text(' to ') || formatDate(<? value("endDate") ?>))
        <? else ?>
          text('Item Site Lead Time')
        <? endif ?>
        AS ltcriteria
   FROM item
 WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: InventoryAvailabilityByParameterList
 QUERY: head
 SELECT <? if exists("classcode_id") ?>
          ( SELECT (classcode_code || '-' || classcode_descrip)
              FROM classcode
             WHERE (classcode_id=<? value("classcode_id") ?>))
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? elseif exists("itemgrp_id") ?>
          ( SELECT (itemgrp_name || '-' || itemgrp_descrip)
              FROM itemgrp
             WHERE (itemgrp_id=<? value("itemgrp_id") ?>) )
        <? elseif exists("itemgrp_pattern") ?>
          text(<? value("itemgrp_pattern") ?>)
        <? elseif exists("itemgrp") ?>
          text('All Item Groups')
        <? elseif exists("plancode_id") ?>
          ( SELECT (plancode_code || '-' || plancode_name)
              FROM plancode
             WHERE (plancode_id=<? value("plancode_id") ?>) )
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('')
        <? endif ?>
        AS f_value,
        <? if reExists("classcode_.*") ?>
          text('Class Codes:')
        <? elseif reExists("plancode_.*") ?>
          text('Planner Codes:')
        <? elseif reExists("itemgrp_.*") ?>
          text('Item Group:')
        <? elseif exists("itemgrp") ?>
          text('Item Group:')
        <? else ?>
          text('')
        <? endif ?>
        AS f_label,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("byDays") ?>
          (text('Look ahead ') || text(<? value("byDays") ?>) || text(' days'))
        <? elseif exists("byDate") ?>
          (text('Cutoff date ') || formatDate(<? value("byDate") ?>))
        <? elseif exists("byDates") ?>
          (text('Dates from ') || formatDate(<? value("startDate") ?>) || text(' to ') || formatDate(<? value("endDate") ?>))
        <? else ?>
          text('Item Site Lead Time')
        <? endif ?>
        AS ltcriteria;

 --------------------------------------------------------------------
 REPORT: InventoryAvailabilityBySourceVendor
 QUERY: head
 SELECT <? if exists("warehouse_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("byDays") ?>
          (text('Look ahead ') || text(<? value("byDays") ?>) || text(' days'))
        <? elseif exists("byDate") ?>
          (text('Cutoff date ') || formatDate(<? value("byDate") ?>))
        <? elseif exists("byDates") ?>
          (text('Dates from ') || formatDate(<? value("startDate") ?>) || text(' to ') || formatDate(<? value("endDate") ?>))
        <? else ?>
          text('Item Site Lead Time')
        <? endif ?>
        AS ltcriteria,
 <? if exists("vend_id") ?>
        text('Vendor:') AS vend_label,
        vend_name AS vend_value
   FROM vend
  WHERE (vend_id=<? value("vend_id") ?>)
 <? elseif exists("vendtype_id") ?>
        text('Vendor Type:') AS vend_label,
        vendtype_code AS vend_value
   FROM vendtype
  WHERE (vendtype_id=<? value("vendtype_id") ?>)
 <? elseif exists("vendtype_pattern") ?>
        text('Vendor Type:') AS vend_label,
        text(<? value("vendtype_pattern") ?>) AS vend_value
 <? else ?>
        text('Vendor:') AS vend_label,
        text('All Vendors') AS vend_value
 <? endif ?>

 --------------------------------------------------------------------
 REPORT: InventoryHistoryByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        formatDate(<? value("startDate") ?>) as startdate,
        formatDate(<? value("endDate") ?>) as enddate,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT formatDateTime(invhist_transdate) AS transdate,
        invhist_transdate,
        invhist_transtype,
        whs1.warehous_code AS warehous_code,
        invhist_invuom,
        formatQty(invhist_invqty) AS transqty,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
+       CASE WHEN(invhist_costmethod='A') THEN text('Average')
+            WHEN(invhist_costmethod='S') THEN text('Standard')
+            WHEN(invhist_costmethod='J') THEN text('Job')
+            WHEN(invhist_costmethod='N') THEN text('None')
+            ELSE 'UNKNOWN'
+       END AS costmethod,
+       formatMoney(invhist_value_before) AS valbefore,
+       formatMoney(invhist_value_after) AS valafter,
        invhist_user as username,
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
   FROM itemsite, warehous AS whs1, invhist LEFT OUTER JOIN warehous AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
  WHERE ((NOT invhist_hasdetail)
    AND (invhist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
    AND (itemsite_warehous_id=whs1.warehous_id)
    AND (date(invhist_transdate) between <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 UNION
 SELECT formatDateTime(invhist_transdate) AS transdate,
        invhist_transdate,
        invhist_transtype,
        whs1.warehous_code AS warehous_code,
        invhist_invuom,
        formatQty(invhist_invqty) AS transqty,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
+       CASE WHEN(invhist_costmethod='A') THEN text('Average')
+            WHEN(invhist_costmethod='S') THEN text('Standard')
+            WHEN(invhist_costmethod='J') THEN text('Job')
+            WHEN(invhist_costmethod='N') THEN text('None')
+            ELSE 'UNKNOWN'
+       END AS costmethod,
+       formatMoney(invhist_value_before) AS valbefore,
+       formatMoney(invhist_value_after) AS valafter,
        invhist_user AS username,
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
   FROM itemsite, warehous AS whs1, invdetail, invhist LEFT OUTER JOIN warehous AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
  WHERE ((invhist_hasdetail)
    AND (invhist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
    AND (itemsite_warehous_id=whs1.warehous_id)
    AND (invdetail_invhist_id=invhist_id)
    AND (date(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY invhist_transdate DESC, invhist_transtype;

 --------------------------------------------------------------------
 REPORT: InventoryHistoryByOrderNumber
 QUERY: head
 SELECT text(<? value("orderNumber") ?>) AS ordernumber,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT formatDateTime(invhist_transdate) AS transdate,
        invhist_transdate,
        invhist_transtype,
        warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        invhist_invuom,
        formatQty(invhist_invqty) AS transqty,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
+       CASE WHEN(invhist_costmethod='A') THEN text('Average')
+            WHEN(invhist_costmethod='S') THEN text('Standard')
+            WHEN(invhist_costmethod='J') THEN text('Job')
+            WHEN(invhist_costmethod='N') THEN text('None')
+            ELSE 'UNKNOWN'
+       END AS costmethod,
+       formatMoney(invhist_value_before) AS valbefore,
+       formatMoney(invhist_value_after) AS valafter,
        invhist_user as username
   FROM invhist, itemsite, item, warehous
  WHERE ((invhist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (date(invhist_transdate) between <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
    AND (invhist_ordnumber ~ <? value("orderNumber") ?>)
 )
 ORDER BY invhist_transdate DESC, invhist_transtype, item_number;

 --------------------------------------------------------------------
 REPORT: InventoryHistoryByParameterList
 QUERY: head
 SELECT formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("itemgrp_id") ?>
          ( SELECT (itemgrp_name||'-'||itemgrp_descrip)
              FROM itemgrp
             WHERE (itemgrp_id=<? value("itemgrp_id") ?>) )
        <? elseif exists("itemgrp_pattern") ?>
          text(<? value("itemgrp_pattern") ?>)
        <? elseif exists("classcode_id") ?>
          ( SELECT (classcode_code||'-'||classcode_descrip)
              FROM classcode
             WHERE (classcode_id=<? value("classcode_id") ?>) )
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? elseif exists("plancode_id") ?>
          ( SELECT (plancode_code||'-'||plancode_name)
              FROM plancode
             WHERE (plancode_id=<? value("plancode_id") ?>) )
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('All')
        <? endif ?>
        AS lbl_value,
        <? if reExists("itemgrp.*") ?>
          text('Item Group:')
        <? elseif reExists("classcode.*") ?>
          text('Class Code:')
        <? elseif reExists("plancode.*") ?>
          text('Planner Code:')
        <? else ?>
          text('Unknown Class:')
        <? endif ?>
        AS lbl_bytype,
        <? if reExists("itemgrp.*") ?>
          text('Inventory History by Item Group')
        <? elseif reExists("classcode.*") ?>
          text('Inventory History by Class Code')
        <? elseif reExists("plancode.*") ?>
          text('Inventory History by Planner Code')
        <? else ?>
          text('Inventory History')
        <? endif ?>
        AS lbl_title;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT invhist_id,
        invhist_transdate,
        formatDateTime(invhist_transdate) AS transdate,
        invhist_transtype,
        whs1.warehous_code AS warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        formatQty(invhist_invqty) AS transqty,
        invhist_invuom,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
+       CASE WHEN(invhist_costmethod='A') THEN text('Average')
+            WHEN(invhist_costmethod='S') THEN text('Standard')
+            WHEN(invhist_costmethod='J') THEN text('Job')
+            WHEN(invhist_costmethod='N') THEN text('None')
+            ELSE 'UNKNOWN'
+       END AS costmethod,
+       formatMoney(invhist_value_before) AS valbefore,
+       formatMoney(invhist_value_after) AS valafter,
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
    AND (DATE(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("itemgrp_id") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem
                      WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem, itemgrp
                      WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                        AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
 <? elseif exists("classcode_id") ?>
    AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (item_classcode_id IN (SELECT classcode_id
                                 FROM classcode
                                WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? elseif exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN (SELECT plancode_id FROM plancode WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? elseif exists("itemgrp") ?>
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
        invhist_invuom,
        CASE WHEN (invhist_ordtype NOT LIKE '') THEN (invhist_ordtype || '-' || invhist_ordnumber)
             ELSE invhist_ordnumber
        END AS ordernumber,
        formatQty(invhist_qoh_before) AS qohbefore,
        formatQty(invhist_qoh_after) AS qohafter,
+       CASE WHEN(invhist_costmethod='A') THEN text('Average')
+            WHEN(invhist_costmethod='S') THEN text('Standard')
+            WHEN(invhist_costmethod='J') THEN text('Job')
+            WHEN(invhist_costmethod='N') THEN text('None')
+            ELSE 'UNKNOWN'
+       END AS costmethod,
+       formatMoney(invhist_value_before) AS valbefore,
+       formatMoney(invhist_value_after) AS valafter,
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
    AND (DATE(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("itemgrp_id") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem
                      WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
    AND (item_id IN (SELECT itemgrpitem_item_id
                       FROM itemgrpitem, itemgrp
                      WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                        AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
 <? elseif exists("classcode_id") ?>
    AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (item_classcode_id IN (SELECT classcode_id
                                 FROM classcode
                                WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? elseif exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN (SELECT plancode_id
                                    FROM plancode
                                   WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? elseif exists("itemgrp") ?>
    AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
 <? endif ?>
 );
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: Invoice
 QUERY: GroupHead
 SELECT
        --remitto.*,
 remitto_name,
 formatAddr(remitto_address1, remitto_address2, remitto_address3, remitto_citystatezip, remitto_country) AS remitto_adr,
-       TEXT(invchead_invcnumber) AS invoicenumber,
+       invchead_invcnumber AS invoicenumber,
        formatDate(invchead_invcdate) AS f_invoicedate,
        cust_number,
        invchead_billto_name,
        formatAddr(invchead_billto_address1, invchead_billto_address2, invchead_billto_address3, ( invchead_billto_city || '  ' || invchead_billto_state || '  ' || invchead_billto_zipcode ), invchead_billto_country) AS f_billtoaddress,
        invchead_billto_phone,
        invchead_shipto_name,
        formatAddr(invchead_shipto_address1, invchead_shipto_address2, invchead_shipto_address3, ( invchead_shipto_city || '  ' || invchead_shipto_state || ' ' || invchead_shipto_zipcode ), invchead_shipto_country) AS f_shiptoaddress,
-       TEXT(invchead_ordernumber) AS ordernumber,
+       invchead_ordernumber AS ordernumber,
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
             ELSE itemalias_descrip2
        END AS descrip2,
        formatPrice(invcitem_price / COALESCE(invcitem_price_invuomratio,1)) AS f_unitprice,
        formatMoney(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2)) AS f_extprice,
        invcitem_notes,
        getInvcitemLotSerial(invcitem_id) AS lotserial,
-       characteristicsToString('SI', (SELECT coitem_id FROM coitem, cohead, invchead WHERE (cohead_number=invchead_ordernumber and invchead_id=<? value("invchead_id") ?> and coitem_cohead_id=cohead_id and coitem_linenumber=invcitem_linenumber)), '=', ', ') AS coitem_characteristics
+--Sub-select updated for 3.1 to support kitting
+       characteristicsToString('SI',(SELECT coitem_id FROM coitem, cohead, invchead, itemsite
+       WHERE (cohead_number=invchead_ordernumber and invchead_id=<? value("invchead_id") ?>
+       and coitem_cohead_id=cohead_id
+       and invcitem_item_id = item_id
+       and coitem_itemsite_id = itemsite_id
+       and itemsite_item_id = item_id
+       and coitem_linenumber=invcitem_linenumber)
+       ), '=', ', ')
+       AS coitem_characteristics
 FROM invcitem LEFT OUTER JOIN (item JOIN uom ON (item_inv_uom_id=uom_id)) ON (invcitem_item_id=item_id) LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=invcitem_custpn)
 WHERE (invcitem_invchead_id=<? value("invchead_id") ?>)
 ORDER BY invcitem_linenumber;
 --------------------------------------------------------------------

 QUERY: GroupExtended
 SELECT formatMoney( noNeg(invchead_freight + invchead_misc_amount + invchead_tax +
                        ( SELECT COALESCE(SUM(round(((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1))),2)), 0)
                          FROM invcitem LEFT OUTER JOIN item ON (invcitem_item_id=item_id)
                          WHERE (invcitem_invchead_id=<? value("invchead_id") ?>) )
                     - total_allocated) ) AS f_totaldue,
        formatMoney(invchead_misc_amount) AS f_misc,
        formatMoney(invchead_tax) AS f_tax,
        formatMoney(invchead_freight) AS f_freight,
-       formatMoney(invchead_payment) AS f_payment,
+       formatMoney(invchead_payment + (SELECT SUM(arapply_applied) AS applied
+                                       FROM arapply
+                                       LEFT OUTER JOIN invchead ON (arapply_target_docnumber = invchead_invcnumber)
+                                       WHERE (invchead_id = <? value("invchead_id") ?>)
+                                       AND (arapply_source_doctype = 'K'))) AS f_payment,
        formatMoney(total_allocated) AS f_allocated,
        invchead_notes,
        invchead_misc_descrip
-FROM invchead,
+FROM invchead, arapply,
 (SELECT COALESCE(SUM(CASE WHEN((aropen_amount - aropen_paid) >=
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
 SELECT COALESCE(SUM(currToCurr(arapply_curr_id, t.aropen_curr_id,
                                arapply_applied, t.aropen_docdate)),0) AS total_allocated
   FROM arapply, aropen s, aropen t, invchead
  WHERE ( (s.aropen_id=arapply_source_aropen_id)
    AND   (arapply_target_aropen_id=t.aropen_id)
    AND   (arapply_target_doctype='I')
    AND   (arapply_target_docnumber=invchead_invcnumber)
    AND   (arapply_source_aropen_id=s.aropen_id)
    AND   (invchead_posted)
    AND   (invchead_id=<? value("invchead_id") ?>) )
  -- there will be two rows, one each for posted and not. get the greater of the two
  -- as at least one is guaranteed to be 0
 ORDER BY total_allocated DESC ) AS totalalloc
 WHERE (invchead_id=<? value("invchead_id") ?>)
 ;
 --------------------------------------------------------------------

 QUERY: tracknum
-select cosmisc_tracknum from cohead, cosmisc, invchead
+select formatdate(cosmisc_shipdate) AS f_shipdate, cosmisc_tracknum, cosmisc_shipvia from cohead, cosmisc, invchead
 where
 cohead_id = cosmisc_cohead_id
 and cohead_number = invchead_ordernumber
-and invchead_id = <? value("invchead_id") ?>;
+and invchead_id = <? value("invchead_id") ?>
+order by cosmisc_shipdate;

 --------------------------------------------------------------------
 REPORT: InvoiceInformation
 QUERY: Details
 SELECT 1 as grpnum,
        arapply_id,
        CASE WHEN (arapply_source_doctype = 'C') THEN text('C/M')
             WHEN (arapply_fundstype='C') THEN text('Check')
             WHEN (arapply_fundstype='T') THEN text('Certified Check')
             WHEN (arapply_fundstype='M') THEN text('Master Card')
             WHEN (arapply_fundstype='V') THEN text('Visa')
             WHEN (arapply_fundstype='A') THEN text('American Express')
             WHEN (arapply_fundstype='D') THEN text('Discover Card')
             WHEN (arapply_fundstype='R') THEN text('Other Credit Card')
             WHEN (arapply_fundstype='K') THEN text('Cash')
             WHEN (arapply_fundstype='W') THEN text('Wire Transfer')
             WHEN (arapply_fundstype='O') THEN text('Other')
        END AS documenttype,
        CASE WHEN (arapply_source_doctype = 'C') THEN arapply_source_docnumber
+            WHEN (arapply_source_doctype = 'R') THEN arapply_source_docnumber
             WHEN (arapply_source_doctype = 'K') THEN arapply_refnumber
             ELSE text('Error')
        END AS docnumber,
        formatDate(arapply_postdate) AS f_postdate,
        formatMoney(arapply_applied) AS f_amount
   FROM arapply, invchead
  WHERE ( (arapply_target_doctype='I')
    AND (arapply_target_docnumber=invchead_invcnumber)
    AND (invchead_id=<? value("invchead_id") ?>) )
 ORDER BY arapply_postdate;

 --------------------------------------------------------------------
 REPORT: ItemCostsByClassCode
 QUERY: detail
 SELECT item_id,
        item_number,
        item_descrip1,
        item_descrip2,
        uom_name as f_uom,
        formatCost(scost) as f_stdcost,
        formatCost(acost) as f_actcost,
        classcode_code
   FROM ( SELECT item_id,
                 item_number,
                 item_descrip1,
                 item_descrip2,
                 uom_name,
                 stdcost(item_id) AS scost,
                 actcost(item_id) AS acost,
                 classcode_code
            FROM item, classcode, uom
           WHERE ((item_classcode_id=classcode_id)
             AND (item_inv_uom_id=uom_id)
           <? if exists("classcode_id") ?>
             AND (classcode_id=<? value("classcode_id") ?>)
           <? elseif exists("classcode_pattern") ?>
             AND (classcode_code ~ <? value("classcode_pattern") ?>)
           <? endif ?>
           )
        ) AS data
+ WHERE ( (true)
 <? if exists("onlyShowZeroCosts") ?>
- WHERE ((scost=0)
-    OR (acost=0)
- )
+   AND ((scost=0) OR (acost=0))
+<? endif ?>
+<? if exists("onlyShowDiffCosts") ?>
+   AND (scost != acost)
 <? endif ?>
+ )
 ORDER BY item_number

 --------------------------------------------------------------------
 REPORT: ItemMaster
 QUERY: sold
 SELECT uom_name,
        formatUOMRatio(iteminvpricerat(item_id)) AS f_iteminvpricerat,
        (prodcat_code||' - '||prodcat_descrip) AS f_prodcat,
-       formatBoolYN(item_taxable) AS f_item_taxable,
        formatBoolYN(item_exclusive) AS f_item_exclusive,
        formatPrice(item_listprice) AS f_item_listprice,
        formatExtPrice(item_listprice / iteminvpricerat(item_id)) AS f_extprice
   FROM item, prodcat, uom
  WHERE ((item_id=<? value("item_id") ?>)
    AND  (item_price_uom_id=uom_id)
    AND  (item_sold)
    AND  (item_prodcat_id=prodcat_id) );

 --------------------------------------------------------------------
 REPORT: ItemSitesByParameterList
 QUERY: head
 SELECT <? if exists("classcode_id") ?>
          ( SELECT (classcode_code||'-'||classcode_descrip)
              FROM classcode
             WHERE (classcode_id=<? value("classcode_id") ?>) )
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? elseif exists("plancode_id") ?>
          ( SELECT (plancode_code||'-'||plancode_name)
              FROM plancode
             WHERE (plancode_id=<? value("plancode_id") ?>) )
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? elseif exists("costcat_id") ?>
          ( SELECT (costcat_code||'-'||costcat_descrip)
              FROM costcat
             WHERE (costcat_id=<? value("costcat_id") ?>) )
        <? elseif exists("costcat_pattern") ?>
          text(<? value("costcat_pattern") ?>)
        <? elseif exists("itemgrp_id") ?>
          ( SELECT (itemgrp_name||'-'||itemgrp_descrip)
              FROM itemgrp
             WHERE (itemgrp_id=<? value("itemgrp_id") ?>) )
        <? elseif exists("itemgrp_pattern") ?>
          text(<? value("itemgrp_pattern") ?>)
        <? else ?>
          text('')
        <? endif ?>
        AS f_value,
        <? if reExists("classcode.*") ?>
          text('Class Codes:')
        <? elseif reExists("plancode.*") ?>
          text('Planner Codes:')
        <? elseif reExists("costcat.*") ?>
          text('Cost Categories:')
        <? elseif reExists("itemgrp.*") ?>
          text('Item Groups:')
        <? else ?>
          text('')
        <? endif ?>
        AS f_label,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("showInactive") ?>
          text('Yes')
        <? else ?>
          text('No')
        <? endif ?>
        AS f_showInactive

 --------------------------------------------------------------------
 REPORT: ItemsByCharacteristic
 QUERY: detail
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        formatBoolYN(item_active) AS active,
        CASE WHEN (item_type='M') THEN 'Manufactured'
             WHEN (item_type='P') THEN 'Purchased'
             WHEN (item_type='F') THEN 'Phantom'
             WHEN (item_type='B') THEN 'Breeder'
             WHEN (item_type='C') THEN 'Co-Product'
             WHEN (item_type='Y') THEN 'By-Product'
             WHEN (item_type='R') THEN 'Reference'
             WHEN (item_type='T') THEN 'Tooling'
             WHEN (item_type='O') THEN 'Outside Process'
+            WHEN (item_type='J') THEN 'Job'
+            WHEN (item_type='K') THEN 'Kit'
             ELSE item_type
        END AS itemtype,
        iuom.uom_name AS invuom,
        itemcapuom(item_id) AS capuom,
        itemaltcapuom(item_id) AS altcapuom,
        puom.uom_name AS priceuom,
        puom.uom_name AS shipuom,
        formatRatio(itemcapinvrat(item_id)) AS capratio,
        formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
        formatRatio(iteminvpricerat(item_id)) AS shipratio,
        formatRatio(iteminvpricerat(item_id)) AS priceratio,
        formatBoolYN(item_sold) AS sold,
        formatBoolYN(item_exclusive) AS exclusive,
-       formatBoolYN(item_taxable) AS taxable,
        formatBoolYN(item_picklist) AS picklist,
        formatBoolYN(item_config) AS configured,
        formatWeight(item_prodweight) AS prodweight,
        formatWeight(item_packweight) AS packweight,
        char_name, charass_value
   FROM item, charass, char, uom AS iuom, uom AS puom
  WHERE ((charass_target_type='I')
    AND (charass_target_id=item_id)
    AND (item_inv_uom_id=iuom.uom_id)
    AND (item_price_uom_id=puom.uom_id)
    AND (charass_char_id=char_id)
    AND (char_id=<? value("char_id") ?>)
    AND (charass_value ~* <? value("value") ?>)
 <? if not exists("showInactive") ?>
    AND (item_active)
 <? endif ?>
 )
 ORDER BY item_number;

 --------------------------------------------------------------------
 REPORT: ItemsByClassCode
 QUERY: detail
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        formatBoolYN(item_active) AS active,
        CASE WHEN (item_type='M') THEN 'Manufactured'
             WHEN (item_type='P') THEN 'Purchased'
             WHEN (item_type='F') THEN 'Phantom'
             WHEN (item_type='B') THEN 'Breeder'
             WHEN (item_type='C') THEN 'Co-Product'
             WHEN (item_type='Y') THEN 'By-Product'
             WHEN (item_type='R') THEN 'Reference'
             WHEN (item_type='T') THEN 'Tooling'
             WHEN (item_type='O') THEN 'Outside Process'
+            WHEN (item_type='J') THEN 'Job'
+            WHEN (item_type='K') THEN 'Kit'
             ELSE item_type
        END AS itemtype,
        iuom.uom_name AS invuom,
        itemcapuom(item_id) AS capuom,
        itemaltcapuom(item_id) AS altcapuom,
        puom.uom_name AS priceuom,
        puom.uom_name AS shipuom,
        formatRatio(itemcapinvrat(item_id)) AS capratio,
        formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
        formatRatio(iteminvpricerat(item_id)) AS shipratio,
        formatRatio(iteminvpricerat(item_id)) AS priceratio,
        formatBoolYN(item_sold) AS sold,
        formatBoolYN(item_exclusive) AS exclusive,
-       formatBoolYN(item_taxable) AS taxable,
        formatBoolYN(item_picklist) AS picklist,
        formatBoolYN(item_config) AS configured,
        formatWeight(item_prodweight) AS prodweight,
        formatWeight(item_packweight) AS packweight,
        classcode_code
   FROM item, classcode, uom AS iuom, uom AS puom
  WHERE ((item_classcode_id=classcode_id)
    AND (item_inv_uom_id=iuom.uom_id)
    AND (item_price_uom_id=puom.uom_id)
 <? if exists("classcode_id") ?>
    AND (classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (classcode_code ~ <? value("classcode_pattern") ?>)
 <? endif ?>
 <? if not exists("showInactive") ?>
    AND (item_active)
 <? endif ?>
 )
 ORDER BY item_number;

 --------------------------------------------------------------------
 REPORT: ItemsByProductCategory
 QUERY: detail
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        formatBoolYN(item_active) AS active,
        CASE WHEN (item_type='M') THEN 'Manufactured'
             WHEN (item_type='P') THEN 'Purchased'
             WHEN (item_type='F') THEN 'Phantom'
             WHEN (item_type='B') THEN 'Breeder'
             WHEN (item_type='C') THEN 'Co-Product'
             WHEN (item_type='Y') THEN 'By-Product'
             WHEN (item_type='R') THEN 'Reference'
             WHEN (item_type='T') THEN 'Tooling'
             WHEN (item_type='O') THEN 'Outside Process'
+            WHEN (item_type='J') THEN 'Job'
+            WHEN (item_type='K') THEN 'Kit'
             ELSE item_type
        END AS itemtype,
        iuom.uom_name AS invuom,
        itemcapuom(item_id) AS capuom,
        itemaltcapuom(item_id) AS altcapuom,
        puom.uom_name AS priceuom,
        puom.uom_name AS shipuom,
        formatRatio(itemcapinvrat(item_id)) AS capratio,
        formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
        formatRatio(iteminvpricerat(item_id)) AS shipratio,
        formatRatio(iteminvpricerat(item_id)) AS priceratio,
        formatBoolYN(item_sold) AS sold,
        formatBoolYN(item_exclusive) AS exclusive,
-       formatBoolYN(item_taxable) AS taxable,
        formatBoolYN(item_picklist) AS picklist,
        formatBoolYN(item_config) AS configured,
        formatWeight(item_prodweight) AS prodweight,
        formatWeight(item_packweight) AS packweight,
        prodcat_code
   FROM item, prodcat, uom AS iuom, uom AS puom
  WHERE ((item_prodcat_id=prodcat_id)
    AND (item_inv_uom_id=iuom.uom_id)
    AND (item_price_uom_id=puom.uom_id)
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
 <? if not exists("showInactive") ?>
    AND (item_active)
 <? endif ?>
 )
 ORDER BY item_number;

 --------------------------------------------------------------------
 REPORT: ListOpenSalesOrders
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: ListTransferOrders
 QUERY: head
 SELECT <? if exists("src_warehous_id") ?>
          ( SELECT warehous_code
              FROM whsinfo
             WHERE (warehous_id=<? value("src_warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?> AS src_warehous_code,
        <? if exists("dest_warehous_id") ?>
          ( SELECT warehous_code
              FROM whsinfo
             WHERE (warehous_id=<? value("dest_warehous_id") ?>) )
        <? else ?>
-          text('All Warehouses')
+          text('All Sites')
        <? endif ?> AS dest_warehous_code,
        CASE WHEN (<? value ("tohead_status") ?>='C') THEN 'Closed'
             WHEN (<? value ("tohead_status") ?>='O') THEN 'Open'
             ELSE text('All Statuses')
             END AS status;

 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByBOMItem
 QUERY: head
 SELECT parent.item_number AS parent_number,
        parent.item_descrip1 AS parent_descrip1,
        parent.item_descrip2 AS parent_descrip2,
        puom.uom_name AS parent_invuom,
        child.item_number AS comp_number,
        child.item_descrip1 AS comp_descrip1,
        child.item_descrip2 AS comp_descrip2,
        cuom.uom_name AS comp_invuom,
        bomitem_seqnumber as comp_seqnumber,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item as parent, item as child, uom AS puom, uom AS cuom, bomitem
  WHERE ((parent.item_id=<? value("item_id") ?>)
    AND (parent.item_inv_uom_id=puom.uom_id)
    AND (bomitem_item_id=child.item_id)
    AND (child.item_inv_uom_id=cuom.uom_id)
    AND (bomitem_id=<? value("component_item_id") ?>) );

 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByComponentItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByWarehouse
 QUERY: head
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: OpenWorkOrdersWithClosedParentSalesOrders
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: OpenWorkOrdersWithParentSalesOrders
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: POLineItemsByDate
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
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
        as f_whichitems,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate

 --------------------------------------------------------------------
 REPORT: POLineItemsByItem
 QUERY: head
 SELECT item_number, item_descrip1, item_descrip2, uom_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code FROM warehous WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
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
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: POLineItemsByVendor
 QUERY: head
 SELECT vend_number,
        vend_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code FROM warehous WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
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
   FROM vend
  WHERE (vend_id=<? value("vend_id") ?>);

 --------------------------------------------------------------------
 REPORT: POsByDate
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate

 --------------------------------------------------------------------
 REPORT: POsByVendor
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("vend_id") ?>
          (select vend_number from vend where vend_id=<? value("vend_id" ?>)
        <? else ?>
        TEXT('All Vendors')
        <? endif ?>
        AS f_vend,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("byReceiptDate") ?>
          TEXT('By Receipt Date')
        <? elseif exists("byDueDate") ?>
          TEXT('By Due Date')
        <? else ?>
          TEXT('By Order Date')
        <? endif ?>
        AS f_byDate,
        <? if exists("descrip_pattern") ?>
          TEXT('Where Item Description contains ' || <? value("descrip_pattern") ?>)
        <? else ?>
          TEXT('')
        <? endif ?>
        AS f_descrip

 --------------------------------------------------------------------
 REPORT: PackingList-Shipment
 QUERY: detail
 SELECT 1 AS groupby,
-       coitem_linenumber AS linenumber,
+--     coitem_linenumber AS linenumber,
+--     In 3.1 replace line above with line below to support
+--     kitting functionality
+       formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formatsoitembarcode(coitem_id) AS orderitem_barcode,
 --     In 2.3 replaced the next line:
 --     uom_name,
 --     with:
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
-       item_shipuom,
+       itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(coitem_qtyord) AS ordered,
        formatQty(coship_qty) AS shipped,

-       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) /
-                         CASE WHEN(item_shipinvrat = 0) THEN 1
-                                                        ELSE item_shipinvrat
-                         END)) AS shipordered,
-       formatQty(roundUp(coship_qty /
-                         CASE WHEN(item_shipinvrat = 0) THEN 1
-                                                        ELSE item_shipinvrat
-                         END ) ) AS shipatshipping,
-
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
-       toitem_linenumber AS linenumber,
+--     For 3.1 added CAST to match column type of corresponding column in other SELECT
+--     in this UNION
+       CAST(toitem_linenumber AS text) AS linenumber,
        '' AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formattoitembarcode(toitem_id) AS orderitem_barcode,
        uom_name,
-       item_shipuom,
+       itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(toitem_qty_ordered) AS ordered,
        formatQty(shipitem_qty) AS shipped,

-       formatQty(roundUp(toitem_qty_ordered /
-                         CASE WHEN (item_shipinvrat = 0) THEN 1
-                                                         ELSE item_shipinvrat
-                         END)) AS shipordered,
-       formatQty(roundUp(shipitem_qty /
-                         CASE WHEN (item_shipinvrat = 0) THEN 1
-                                                         ELSE item_shipinvrat
-                         END)) AS shipatshipping,
-
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
 REPORT: PackingList
 QUERY: detail
 SELECT 1 AS groupby,
        coitem_linenumber AS linenumber,
        coitem_memo AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formatsoitembarcode(coitem_id) AS orderitem_barcode,
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
-       item_shipuom,
+       itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,
-
        formatQty(coitem_qtyord) AS ordered,
-       formatQty(<? if exists("shiphead_id") ?>
-                 qtyInShipment('SO', coitem_id, <? value("shiphead_id") ?>)
-                 <? else ?> qtyAtShipping('SO', coitem_id) <? endif ?>
-                ) AS atshipping,
-
-       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) /
-                         CASE WHEN(item_shipinvrat = 0) THEN 1
-                                                        ELSE item_shipinvrat
-                         END)) AS shipordered,
-       formatQty(roundUp(<? if exists("shiphead_id") ?>
-                 qtyInShipment('SO', coitem_id, <? value("shiphead_id") ?>)
-                 <? else ?> qtyAtShipping('SO', coitem_id) <? endif ?> /
-                         CASE WHEN(item_shipinvrat = 0) THEN 1
-                                                        ELSE item_shipinvrat
-                         END)) AS shipatshipping,

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
        END AS f_status
   FROM itemsite, item, coitem, uom
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
 <? if exists("shiphead_id") ?>
    AND  (coitem_cohead_id IN (SELECT shiphead_order_id FROM shiphead
 			      WHERE ((shiphead_id=<? value("shiphead_id") ?>)
 			        AND  (shiphead_order_type='SO'))))
 <? endif ?>
 <? if exists("head_id") ?>
    AND  (<? value("head_type") ?>='SO')
    AND  (coitem_cohead_id=<? value("head_id") ?>)
 <? endif ?>
 )
-GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_shipuom,
+GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, shipuom,
          item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
-         coitem_qtyreturned, item_shipinvrat, coitem_status, coitem_cohead_id,
+         coitem_qtyreturned, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
 <? if exists("MultiWhs") ?>
 UNION
 SELECT 2 AS groupby,
        toitem_linenumber AS linenumber,
        '' AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formattoitembarcode(toitem_id) AS orderitem_barcode,
        uom_name,
-       item_shipuom,
+       itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(toitem_qty_ordered) AS ordered,
-       formatQty(<? if exists("shiphead_id") ?>
-                 qtyInShipment('TO', toitem_id, <? value("shiphead_id") ?>)
-                 <? else ?> qtyAtShipping('TO', toitem_id) <? endif ?>
-                ) AS atshipping,
-       formatQty(roundUp(toitem_qty_ordered /
-                         CASE WHEN (item_shipinvrat = 0) THEN 1
-                                                         ELSE item_shipinvrat
-                         END)) AS shipordered,
-       formatQty(roundUp(<? if exists("shiphead_id") ?>
-                         qtyInShipment('TO', toitem_id, <? value("shiphead_id")?>)
-                         <? else ?> qtyAtShipping('TO', toitem_id) <? endif ?>
-                         /
-                         CASE WHEN (item_shipinvrat = 0) THEN 1
-                                                         ELSE item_shipinvrat
-                         END)) AS shipatshipping,

        toitem_status AS f_status
   FROM itemsite, item, toitem, tohead, uom
  WHERE ((toitem_item_id=item_id)
    AND  (item_inv_uom_id=uom_id)
    AND  (item_id=itemsite_item_id)
    AND  (toitem_tohead_id=tohead_id)
    AND  (toitem_status <> 'X')
    AND  (tohead_src_warehous_id=itemsite_warehous_id)
 <? if exists("shiphead_id") ?>
    AND  (toitem_tohead_id IN (SELECT shiphead_order_id FROM shiphead
 			      WHERE ((shiphead_id=<? value("shiphead_id") ?>)
 			        AND  (shiphead_order_type='TO'))))
 <? endif ?>
 <? if exists("head_id") ?>
    AND  (<? value("head_type") ?>='TO')
    AND  (toitem_tohead_id=<? value("head_id") ?>)
 <? endif ?>
 )
 <? endif ?>
 ORDER BY linenumber;

 --------------------------------------------------------------------
 REPORT: PartiallyShippedOrders
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT (warehous_code||'-'||warehous_descrip)
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("showPrices") ?>
          text('$ Amount')
        <? else ?>
          text('')
        <? endif ?>
        AS f_amount,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate;

 --------------------------------------------------------------------
 REPORT: PendingWOMaterialAvailability
 QUERY: head
 SELECT item_number, item_descrip1, item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
 WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: PickingListSOClosedLines
 QUERY: detail
 SELECT 1 AS groupby,
-       coitem_linenumber,
+       formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
 --     In 2.3 replaced the next line:
 --     uom_name,
 --     with:
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
-       item_shipuom,
+       itemsellinguom(item_id) AS shipuom,
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
-       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipordered,
-       formatQty(roundUp(((coitem_qtyshipped - coitem_qtyreturned) * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipshipped,
-       formatQty(roundUp((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipbalance,
-       formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
-                            FROM coship, cosmisc
-                            WHERE ( (coship_coitem_id=coitem_id)
-                              AND (coship_cosmisc_id=cosmisc_id)
-                              AND (NOT cosmisc_shipped) ) )/ CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END ) ) AS shipatshipping,
        CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
-                                             AND  (invcitem_linenumber=coitem_linenumber)
+                                             AND  (invcitem_linenumber=CASE WHEN(coitem_subnumber > 0) THEN (coitem_linenumber * 1000) + coitem_subnumber ELSE coitem_linenumber END)
                                              AND  (cohead_id=coitem_cohead_id))) >= coitem_qtyord)) THEN 'I'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
-                                             AND  (invcitem_linenumber=coitem_linenumber)
+                                             AND  (invcitem_linenumber=CASE WHEN(coitem_subnumber > 0) THEN (coitem_linenumber * 1000) + coitem_subnumber ELSE coitem_linenumber END)
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
+   AND (item_type != 'K')
    AND (coitem_status <> 'X')
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
 --2.3 add coitem_qty_uom_id, to the GROUP BY clause
 GROUP BY coitem_qty_uom_id,
-         coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_shipuom,
+         linenumber, coitem_linenumber, coitem_subnumber, coitem_id, coitem_memo, item_number, uom_name, shipuom,
          item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
-         coitem_qtyreturned, item_shipinvrat, coitem_status, coitem_cohead_id,
+         coitem_qtyreturned, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
-ORDER BY coitem_linenumber;
+ORDER BY linenumber;

 --------------------------------------------------------------------
 REPORT: PickingListSOLocsNoClosedLines
 QUERY: detail
 SELECT
-
-       coitem_linenumber,
+       formatsolinenumber(coitem_id) AS linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
---
-       --location_aisle || '-' || location_rack || '-' || location_bin || '-' || location_name  AS location_name,
---
-
-       CASE WHEN (location_aisle || '-' || location_rack || '-' || location_bin || '-' || location_name) IS NULL THEN itemsite_location_comments
-            ELSE location_aisle || '-' || location_rack || '-' || location_bin || '-' || location_name
+       CASE WHEN (formatLocationName(location_id) = 'N/A') THEN itemsite_location_comments || ' ' || '(comment)'
+            ELSE formatLocationName(location_id)
        END AS location_name,
-
---
        itemsite_location_comments AS location_comment,
        formatlotserialnumber(itemloc_ls_id),
-       CASE WHEN itemloc_expiration = '1970-01-01' THEN text ('N/A')
-          WHEN itemloc_expiration = '2100-01-01' THEN text ('N/A')
-          ELSE CAST(formatdate(itemloc_expiration) AS text)
-       END AS expiration,
+       formatDate(itemloc_expiration, 'N/A') AS expiration,
        itemloc_qty AS location_qty_qty,
+	   CASE WHEN (fetchMetricBool('EnableSOReservationsByLocation')) THEN formatQty(qtyReservedLocation(itemloc_id, 'SO', coitem_id))
+	        ELSE formatQty(0)
+       END AS location_reserved_qty,
        itemuomtouomratio(item_id,item_inv_uom_id, coitem_qty_uom_id) * itemloc_qty AS loc_issue_uom_qty,
        formatqty(itemuomtouomratio(item_id,item_inv_uom_id, coitem_qty_uom_id) * itemloc_qty) AS loc_issue_uom_fmt,
---
-       (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
-       item_shipuom,
+       coitemuom.uom_name AS uom_name,
        item_descrip1,
        item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
        formatQty(coitem_qtyshipped - coitem_qtyreturned) AS shipped,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS balance,
-       formatQty( ( SELECT COALESCE(SUM(coship_qty), 0)
-                    FROM coship, cosmisc
-                    WHERE ( (coship_coitem_id=coitem_id)
-                     AND (coship_cosmisc_id=cosmisc_id)
-                     AND (NOT cosmisc_shipped) ) ) ) AS atshipping,
-       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipordered,
-       formatQty(roundUp(((coitem_qtyshipped - coitem_qtyreturned) * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipshipped,
-       formatQty(roundUp((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipbalance,
-       formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
-                            FROM coship, cosmisc
-                            WHERE ( (coship_coitem_id=coitem_id)
-                              AND (coship_cosmisc_id=cosmisc_id)
-                              AND (NOT cosmisc_shipped) ) )/ CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END ) ) AS shipatshipping,
-       CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
+       formatQty( ( SELECT COALESCE(SUM(shipitem_qty), 0)
+                    FROM shipitem
+                    WHERE ( (shipitem_orderitem_id=coitem_id)
+                      AND   (NOT shipitem_shipped) ) ) ) AS atshipping,
+       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio))) AS shipordered,
+       formatQty(roundUp(((coitem_qtyshipped - coitem_qtyreturned) * coitem_qty_invuomratio))) AS shipshipped,
+       formatQty(roundUp((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio))) AS shipbalance,
+       CASE WHEN (coitem_status='O' AND cust_creditstatus='H') THEN 'H'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
-                                             AND  (invcitem_linenumber=coitem_linenumber)
+                                             AND  (invcitem_linenumber=CASE WHEN(coitem_subnumber > 0) THEN (coitem_linenumber * 1000) + coitem_subnumber ELSE coitem_linenumber END)
                                              AND  (cohead_id=coitem_cohead_id))) >= coitem_qtyord)) THEN 'I'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
-                                             AND  (invcitem_linenumber=coitem_linenumber)
+                                             AND  (invcitem_linenumber=CASE WHEN(coitem_subnumber > 0) THEN (coitem_linenumber * 1000) + coitem_subnumber ELSE coitem_linenumber END)
                                              AND  (cohead_id=coitem_cohead_id))) > 0)) THEN 'P'
             WHEN (coitem_status='O' AND (itemsite_qtyonhand - qtyAllocated(itemsite_id, CURRENT_DATE)
                                          + qtyOrdered(itemsite_id, CURRENT_DATE))
                                           >= (coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) THEN 'R'
             ELSE coitem_status
        END AS f_status

-FROM item, uom, warehous, coitem, itemsite
+FROM coitem
+     JOIN cohead ON (cohead_id = coitem_cohead_id)
+	 JOIN cust ON (cust_id = cohead_cust_id)
+     JOIN itemsite ON (itemsite_id = coitem_itemsite_id)
+	 JOIN item ON (item_id = itemsite_item_id)
+	 JOIN whsinfo ON (warehous_id = itemsite_warehous_id)
+	 JOIN uom invuom ON (invuom.uom_id = item_inv_uom_id)
+	 JOIN uom coitemuom ON (coitemuom.uom_id = coitem_qty_uom_id)
      LEFT OUTER JOIN itemloc  ON (itemloc_itemsite_id = itemsite_id)
      LEFT OUTER JOIN location ON (itemloc_location_id = location_id)
- WHERE ( (coitem_itemsite_id=itemsite_id)
-   AND (itemsite_item_id=item_id)
-   AND (itemsite_warehous_id = warehous_id)
-   AND (item_inv_uom_id=uom_id)
-   AND (coitem_status <> 'X')
+ WHERE ( (coitem_status <> 'X')
    AND (coitem_status <> 'C')
+   AND   (item_type != 'K')
 --REMOVE LINE ABOVE AND CLOSED LINES WILL BE DISPLAYED
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
---   AND (coitem_cohead_id='3349')
 )

-ORDER BY coitem_linenumber, expiration, location_name;
+ORDER BY linenumber, expiration, location_name;

 --------------------------------------------------------------------
-REPORT: PickingListNoClosedLines
+REPORT: PickingListSONoClosedLines

 QUERY: detail
 SELECT 1 AS groupby,
-       coitem_linenumber,
+       formatsolinenumber(coitem_linenumber) AS linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
---     In 2.3 replaced the next line:
---     uom_name,
---     with:
-       (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
-       item_shipuom,
+       (select uom_name from uom where uom_id = coitem_qty_uom_id) AS item_invuom,
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
-       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipordered,
-       formatQty(roundUp(((coitem_qtyshipped - coitem_qtyreturned) * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipshipped,
-       formatQty(roundUp((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipbalance,
        formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
                             FROM coship, cosmisc
                             WHERE ( (coship_coitem_id=coitem_id)
                               AND (coship_cosmisc_id=cosmisc_id)
-                              AND (NOT cosmisc_shipped) ) )/ CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END ) ) AS shipatshipping,
+                              AND (NOT cosmisc_shipped) ) )/ CASE WHEN(itemuomratiobytype(item_id, 'Selling') = 0) THEN 1 ELSE itemuomratiobytype(item_id, 'Selling') END ) ) AS shipatshipping,
        CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
-                                             AND  (invcitem_linenumber=coitem_linenumber)
+                                             AND  (invcitem_linenumber=CASE WHEN(coitem_subnumber > 0) THEN (coitem_linenumber * 1000) + coitem_subnumber ELSE coitem_linenumber END)
                                              AND  (cohead_id=coitem_cohead_id))) >= coitem_qtyord)) THEN 'I'
             WHEN (coitem_status='O' AND ((SELECT SUM(invcitem_billed)
                                             FROM cohead, invchead, invcitem
                                            WHERE ((invchead_ordernumber=cohead_number)
                                              AND  (invcitem_invchead_id=invchead_id)
                                              AND  (invcitem_item_id=item_id)
                                              AND  (invcitem_warehous_id=itemsite_warehous_id)
-                                             AND  (invcitem_linenumber=coitem_linenumber)
+                                             AND  (invcitem_linenumber=CASE WHEN(coitem_subnumber > 0) THEN (coitem_linenumber * 1000) + coitem_subnumber ELSE coitem_linenumber END)
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
+   AND (item_type != 'K')
 -- 1 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
    <? if exists("hide closed") ?>
    AND (coitem_status <> 'C')
 -- 2 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
 -- <? endif ?>
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
---2.3 add coitem_qty_uom_id, to the GROUP BY clause
-GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_shipuom,
+GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_subnumber, coitem_id, coitem_memo, item_number, item_invuom,
          item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
-         coitem_qtyreturned, item_shipinvrat, coitem_status, coitem_cohead_id,
+         coitem_qtyreturned, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
-ORDER BY coitem_linenumber;
+ORDER BY linenumber;

 --------------------------------------------------------------------
 REPORT: PricingScheduleAssignments
 QUERY: detail
 SELECT ipsass_id,
        CASE WHEN (ipsass_shipto_id=-1) THEN TEXT('ANY')
             ELSE (SELECT shipto_num FROM shipto WHERE (shipto_id=ipsass_shipto_id))
        END AS shiptonum,
-       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_number FROM cust, shipto WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
+       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_number
+                                                FROM cust, shipto
+                                                WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
             WHEN (ipsass_cust_id=-1) THEN TEXT('Any')
             ELSE (SELECT cust_number FROM cust WHERE (cust_id=ipsass_cust_id))
+       END AS custnumber,
+       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_name
+                                                FROM cust, shipto
+                                                WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
+            WHEN (ipsass_cust_id=-1) THEN ''
+            ELSE (SELECT cust_name FROM cust WHERE (cust_id=ipsass_cust_id))
        END AS custname,
        CASE WHEN (ipsass_cust_id != -1) THEN TEXT('N/A')
             WHEN (ipsass_shipto_id != -1) THEN TEXT('N/A')
             WHEN (ipsass_custtype_id=-1) THEN ipsass_custtype_pattern
             ELSE (SELECT custtype_code FROM custtype WHERE (custtype_id=ipsass_custtype_id))
        END AS custtype,
        ipshead_name
   FROM ipsass, ipshead
  WHERE (ipshead_id=ipsass_ipshead_id)
 ORDER BY custname, custtype;

 --------------------------------------------------------------------
 REPORT: PurchasePriceVariancesByItem
 QUERY: head
 SELECT item_number, item_descrip1,
        item_descrip2, uom_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: PurchasePriceVariancesByVendor
 QUERY: head
 SELECT vend_name,
        vend_number,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername
   FROM vend
  WHERE (vend_id=<? value("vend_id") ?>);

 --------------------------------------------------------------------
 REPORT: PurchaseReqsByPlannerCode
 QUERY: head
 SELECT <? if exists("plancode_id") ?>
          ( SELECT (plancode_code||'-'||plancode_name)
              FROM plancode
             WHERE plancode_id=<? value("plancode_id") ?>)
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('All Planner Codes')
        <? endif ?>
        AS plancode,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate;

 --------------------------------------------------------------------
 REPORT: PurchaseRequestsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        <? if exists("warehous_id") ?>
          (select warehous_code
             from warehous
            where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: PurchaseReqsByPlannerCode
 QUERY: head
 SELECT <? if exists("plancode_id") ?>
          ( SELECT (plancode_code||'-'||plancode_name)
              FROM plancode
             WHERE plancode_id=<? value("plancode_id") ?>)
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('All Planner Codes')
        <? endif ?>
        AS plancode,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate;

 --------------------------------------------------------------------
 REPORT: QOHByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("showValue") ?>
          text('Unit Cost') AS lbl_unitcost,
          text('Value') AS lbl_value,
          text('Non-Netable Value') AS lbl_nnvalue,
+         text('Cost Method') AS lbl_costmethod,
          <? if exists("useActualCosts") ?>
            text('Showing Actual Costs')
-         <? else ?>
+         <? elseif exists("useStandardCosts") ?>
            text('Showing Standard Costs')
+         <? else ?>
+           text('Showing Posted Costs')
          <? endif ?>
          AS lbl_showvalue
        <? else ?>
          text('') AS lbl_unitcost,
          text('') AS lbl_value,
          text('') AS lbl_nnvalue,
+         text('') AS lbl_costmethod,
          text('') AS lbl_showvalue
        <? endif ?>
 FROM item
 WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT itemsite_id, detail,
        warehous_code,
        formatQty(reorderlevel) AS f_reorderlevel,
        formatQty(qoh) AS f_qoh,
        CASE WHEN (NOT useDefaultLocation(itemsite_id)) THEN 'None'
                  ELSE defaultLocationName(itemsite_id)
        END AS defaultlocation,
        CASE WHEN (itemsite_loccntrl) THEN formatQty(nnqoh)
             ELSE 'N/A'
        END AS f_nnqoh,
        <? if exists("showValue") ?>
          formatCost(cost)
        <? else ?>
          text('')
        <? endif ?>
        AS f_unitcost,
        <? if exists("showValue") ?>
          formatExtPrice(cost * qoh)
        <? else ?>
          text('')
        <? endif ?>
        AS f_value,
        <? if exists("showValue") ?>
          CASE WHEN (itemsite_loccntrl) THEN formatExtPrice(cost * nnqoh)
               ELSE 'N/A'
          END
        <? else ?>
          text('')
        <? endif ?>
        AS f_nonnetvalue,
        cost,
        qoh,
        nnqoh,
        noNeg(qoh) AS r_qoh,
        noNeg(nnqoh) AS r_nnqoh,
        <? if exists("showValue") ?>
          CASE WHEN (itemsite_loccntrl) THEN noNeg(cost * nnqoh)
               ELSE 0
          END
        <? else ?>
          0
        <? endif ?>
        AS r_nonnetvalue,
        <? if exists("showValue") ?>
          noNeg(cost * qoh)
        <? else ?>
          0
        <? endif ?>
-       AS r_value
-FROM ( SELECT itemsite_id,
+       AS r_value,
+       <? if exists("showValue") ?>
+         <? if exists("usePostedCosts") ?>
+           CASE WHEN(itemsite_costmethod='A') THEN text('Average')
+                WHEN(itemsite_costmethod='S') THEN text('Standard')
+                WHEN(itemsite_costmethod='J') THEN text('Job')
+                WHEN(itemsite_costmethod='N') THEN text('None')
+                ELSE text('UNKNOWN')
+           END
+         <? else ?>
+           text('')
+         <? endif ?>
+       <? else ?>
+         text('')
+       <? endif ?>
+       AS f_costmethod
+FROM ( SELECT itemsite_id, itemsite_costmethod,
               itemsite_loccntrl,
               CASE WHEN ((itemsite_loccntrl) OR (itemsite_controlmethod IN ('L', 'S'))) THEN 1
                    ELSE 0
               END AS detail,
               warehous_code,
               CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel,
               itemsite_qtyonhand AS qoh,
               itemsite_nnqoh AS nnqoh,
               <? if exists("useActualCosts") ?>
                 actcost(item_id)
-              <? else ?>
+              <? elseif exists("useStandardCosts") ?>
                 stdcost(item_id)
+              <? else ?>
+                (itemsite_value / CASE WHEN(itemsite_qtyonhand=0) THEN 1 ELSE itemsite_qtyonhand END)
               <? endif ?>
               AS cost
        FROM itemsite, item, warehous
        WHERE ((itemsite_item_id=item_id)
         AND (itemsite_warehous_id=warehous_id)
         AND (itemsite_active)
         AND (itemsite_item_id=<? value("item_id") ?>)
 <? if exists("warehous_id") ?>
         AND (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
        )
       ) AS data
 ORDER BY warehous_code;

 --------------------------------------------------------------------
 REPORT: QOHByParameterList
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("classcode_id") ?>
          ( SELECT (classcode_code||'-'||classcode_descrip)
              FROM classcode
             WHERE (classcode_id=<? value("classcode_id") ?>) )
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? elseif exists("itemgrp_id") ?>
          ( SELECT (itemgrp_name|| '-'||itemgrp_descrip)
              FROM itemgrp
             WHERE (itemgrp_id=<? value("itemgrp_id") ?>) )
        <? elseif exists("itemgrp_pattern") ?>
          text(<? value("itemgrp_pattern") ?>)
        <? elseif exists("itemgrp") ?>
          text('All Item Groups')
        <? else ?>
          text('')
        <? endif ?>
        AS value,
        <? if exists("classcode") ?>
          text('Class Code:')
        <? elseif exists("classcode_id") ?>
          text('Class Code:')
        <? elseif exists("classcode_pattern") ?>
          text('Class Codes:')
        <? elseif exists("itemgrp") ?>
          text('Item Group:')
        <? elseif exists("itemgrp_id") ?>
          text('Item Group:')
        <? elseif exists("itemgrp_pattern") ?>
          text('Item Groups:')
        <? else ?>
          text('')
        <? endif ?>
        AS label,
        <? if exists("onlyShowPositive") ?>
          text('Only Showing Positive Quantities')
        <? elseif exists("onlyShowNegative") ?>
          text('Only Showing Negative Quantities')
        <? else ?>
          text('Showing All Quantities')
        <? endif ?>
        AS showquantities,
        <? if exists("showValue") ?>
          text('Unit Cost') AS lbl_unitcost,
          text('Value') AS lbl_value,
          text('NN Value') AS lbl_nnvalue,
+         text('Cost Method') AS lbl_costmethod,
        <? else ?>
          text('') AS lbl_unitcost,
          text('') AS lbl_value,
          text('') AS lbl_nnvalue,
+         text('') AS lbl_costmethod,
        <? endif ?>
        <? if exists("showValue") ?>
          <? if exists("useActualCosts") ?>
            text('Showing Actual Costs')
-         <? else ?>
+         <? elseif exists("useStandardCosts") ?>
            text('Showing Standard Costs')
+         <? else ?>
+           text('Showing Posted Costs')
          <? endif ?>
        <? else ?>
          text('')
        <? endif ?>
        AS showvalues;

 --------------------------------------------------------------------

 QUERY: detail
 SELECT itemsite_id,
        detail,
        item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        warehous_code,
        formatQty(reorderlevel) AS f_reorderlevel,
        formatQty(qoh) AS f_qoh,
        CASE WHEN (NOT useDefaultLocation(itemsite_id)) THEN 'None'
                  ELSE defaultLocationName(itemsite_id)
        END AS defaultlocation,
        formatQty(nonnetable) AS f_nonnetable,
        <? if exists("showValue") ?>
          formatCost(standardcost)
        <? else ?>
          text('')
        <? endif ?>
        AS f_unitcost,
        <? if exists("showValue") ?>
          formatExtPrice(noNeg(standardcost * qoh))
        <? else ?>
          text('')
        <? endif ?>
        AS f_value,
        <? if exists("showValue") ?>
          CASE WHEN (itemsite_loccntrl) THEN formatExtPrice(noNeg(standardcost * nonnetable))
               ELSE 'N/A'
          END
        <? else ?>
          text('')
        <? endif ?>
        AS f_nonnetvalue,
        standardcost,
        qoh,
        nonnetable,
        noNeg(qoh) AS r_qoh,
        noNeg(nonnetable) AS r_nonnetable,
        <? if exists("showValue") ?>
          noNeg(standardcost * qoh)
        <? else ?>
          0
        <? endif ?>
        AS r_value,
        <? if exists("showValue") ?>
          CASE WHEN (itemsite_loccntrl) THEN noNeg(standardcost * nonnetable)
               ELSE 0
          END
        <? else ?>
          0
        <? endif ?>
-       AS r_nonnetvalue
-FROM ( SELECT itemsite_id,
+       AS r_nonnetvalue,
+       <? if exists("showValue") ?>
+         <? if exists("usePostedCosts") ?>
+           CASE WHEN(itemsite_costmethod='A') THEN text('Average')
+                WHEN(itemsite_costmethod='S') THEN text('Standard')
+                WHEN(itemsite_costmethod='J') THEN text('Job')
+                WHEN(itemsite_costmethod='N') THEN text('None')
+                ELSE text('UNKNOWN')
+           END
+         <? else ?>
+           text('')
+         <? endif ?>
+       <? else ?>
+         text('')
+       <? endif ?>
+       AS f_costmethod
+FROM ( SELECT itemsite_id, itemsite_costmethod,
               item_number,
               item_descrip1, item_descrip2, itemsite_loccntrl,
               warehous_code,
               uom_name,
               CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel,
               itemsite_qtyonhand AS qoh,
               CASE WHEN ((itemsite_loccntrl) OR (itemsite_controlmethod IN ('L', 'S'))) THEN 1
                    ELSE 0
               END AS detail,
               itemsite_nnqoh AS nonnetable,
               <? if exists("useActualCosts") ?>
                 actcost(itemsite_item_id)
-              <? else ?>
+              <? elseif exists("useStandardCosts") ?>
                 stdcost(itemsite_item_id)
+              <? else ?>
+                (itemsite_value / CASE WHEN(itemsite_qtyonhand=0) THEN 1 ELSE itemsite_qtyonhand END)
               <? endif ?>
               AS standardcost
          FROM itemsite, item, uom, warehous
         WHERE ((itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
           AND (itemsite_warehous_id=warehous_id)
           AND (itemsite_active)
 <? if exists("classcode_id") ?>
           AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
           AND (item_classcode_id IN (SELECT classcode_id
                                        FROM classcode
                                       WHERE (classcode_code ~ <? value("classcode_pattern") ?>) ) )
 <? elseif exists("itemgrp_id") ?>
           AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
           AND (item_id IN (SELECT itemgrpitem_item_id
                              FROM itemgrpitem, itemgrp
                             WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                               AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
 <? elseif exists("itemgrp") ?>
           AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
 <? endif ?>
 <? if exists("onlyShowPositive") ?>
           AND (itemsite_qtyonhand > 0)
 <? elseif exists("onlyShowNegative") ?>
           AND (itemsite_qtyonhand < 0)
 <? endif ?>
 <? if exists("warehous_id") ?>
           AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 ) ) AS data
 ORDER BY warehous_code, item_number;

 --------------------------------------------------------------------
 REPORT: ReceiptsReturnsByDate
 QUERY: head
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername,
        <? if exists("showVariances") ?>
          text('Purch. Cost') AS f_purchcost,
          text('Recv. Cost') AS f_recvcost
        <? else ?>
          text('') AS f_purchcost,
          text('') AS f_recvcost
        <? endif ?>

 --------------------------------------------------------------------
 REPORT: ReceiptsReturnsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername,
        <? if exists("showVariances") ?>
          text('Purch. Cost') AS f_purchcost,
          text('Recv. Cost') AS f_recvcost
        <? else ?>
          text('') AS f_purchcost,
          text('') AS f_recvcost
        <? endif ?>
   FROM item
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: ReceiptsReturnsByVendor
 QUERY: head
 SELECT vend_name,
        vend_number,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername,
        <? if exists("showVariances") ?>
          text('Purch. Cost') AS f_purchcost,
          text('Recv. Cost') AS f_recvcost
        <? else ?>
          text('') AS f_purchcost,
          text('') AS f_recvcost
        <? endif ?>
 FROM vend
 WHERE (vend_id=<? value("vend_id") ?>);

 --------------------------------------------------------------------
 REPORT: RejectedMaterialByVendor
 QUERY: head
 SELECT vend_number, vend_name,
        <? if exists("warehous_id") ?>
          (select warehous_code
             from warehous
            where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
   FROM vend
  WHERE (vend_id=<? value("vend_id") ?>);

 --------------------------------------------------------------------
 REPORT: ReorderExceptionsByPlannerCode
 QUERY: head
 SELECT <? if exists("plancode_id") ?>
          ( SELECT (plancode_code || '-' || plancode_name)
              FROM plancode
             WHERE plancode_id=<? value("plancode_id") ?>)
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('All Planner Codes')
        <? endif ?>
        AS plannercode,
        <? if exists("includePlannedOrders") ?>
          formatBoolYN(true)
        <? else ?>
          formatBoolYN(false)
        <? endif ?>
        AS includeplnord,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: SalesHistoryByBilltoName
 QUERY: head
 SELECT text(<? value("billToName") ?>) AS billtoname,
        <? if exists("warehous_id") ?>
            (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-           text('All Warehouses')
+           text('All Sites')
        <? endif ?>
          AS warehouse,
        <? if exists("prodcat_id") ?>
            (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
            text(<? value("prodcat_pattern") ?>)
        <? else ?>
            text('All Categories')
        <? endif ?>
          AS prodcat,
        formatDate(date(<? value("startDate") ?>)) AS startDate,
        formatDate(date(<? value("endDate") ?>)) AS endDate,
        <? if exists("showPrices") ?>
            text('Unit Price') AS lbl_unitprice,
            text('Total') AS lbl_total
        <? else ?>
            text('') AS lbl_unitprice,
            text('') AS lbl_total
        <? endif ?>
 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohist_billtoname as billto,
        cohist_ordernumber AS sonumber,
        cohist_invcnumber AS invnumber,
        formatDate(cohist_orderdate) AS orddate,
        formatDate(cohist_invcdate) AS invcdate,
        item_number, item_descrip1, item_descrip2,
        formatQty(cohist_qtyshipped) AS shipped,
        <? if exists("showPrices") ?>
-       formatPrice(cohist_unitprice) AS unitprice,
-       formatMoney(round(cohist_qtyshipped * cohist_unitprice,2)) AS f_total,
+       formatPrice(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS unitprice,
+       formatMoney(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS f_total,
        <? else ?>
        '' AS unitprice,
        '' AS f_total,
        <? endif ?>
-       round(cohist_qtyshipped * cohist_unitprice,2) AS total
+       round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2) AS total
   FROM cohist, itemsite, item
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
 REPORT: SalesHistoryByCustomer
 QUERY: head
 SELECT cust_name,
        <? if exists("warehous_id") ?>
            (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-           text('All Warehouses')
+           text('All Sites')
        <? endif ?>
          AS warehouse,
        <? if exists("prodcat_id") ?>
            (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
            text(<? value("prodcat_pattern") ?>)
        <? else ?>
            text('All Categories')
        <? endif ?>
          AS prodcat,
        formatDate(date(<? value("startDate") ?>)) AS startDate,
        formatDate(date(<? value("endDate") ?>)) AS endDate,
        <? if exists("showPrices") ?>
            text('Unit Price') AS lbl_unitprice,
            text('Total') AS lbl_total
        <? else ?>
            text('') AS lbl_unitprice,
            text('') AS lbl_total
        <? endif ?>
   FROM cust
  WHERE (cust_id=<? value("cust_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohist_ordernumber AS sonumber,
        cohist_invcnumber AS invnumber,
        formatDate(cohist_orderdate) AS orddate,
        formatDate(cohist_invcdate, 'Return') AS invcdate,
        item_number, item_descrip1, item_descrip2,
        formatQty(cohist_qtyshipped) AS shipped,
        <? if exists("showPrices") ?>
-       formatPrice(cohist_unitprice) AS unitprice,
-       formatMoney(round(cohist_qtyshipped * cohist_unitprice,2)) AS f_total,
+       formatPrice(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS unitprice,
+       formatMoney(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS f_total,
        <? else ?>
        '' AS unitprice,
        '' AS f_total,
        <? endif ?>
-       round(cohist_qtyshipped * cohist_unitprice,2) AS total
+       round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2) AS total
   FROM cohist, itemsite, item, prodcat
  WHERE ((cohist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_prodcat_id=prodcat_id)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
    AND (cohist_cust_id=<? value("cust_id") ?>) )
 ORDER BY cohist_shipdate, item_number;

 --------------------------------------------------------------------
 REPORT: SalesHistoryByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        <? if exists("warehous_id") ?>
            (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-           text('All Warehouses')
+           text('All Sites')
        <? endif ?>
          AS warehouse,
        formatDate(date(<? value("startDate") ?>)) AS startDate,
        formatDate(date(<? value("endDate") ?>)) AS endDate,
        <? if exists("showPrices") ?>
            text('Unit Price') AS lbl_unitprice,
            text('Total') AS lbl_total,
        <? else ?>
            text('') AS lbl_unitprice,
            text('') AS lbl_total,
        <? endif ?>
        <? if exists("custtype_id") ?>
          ( SELECT (custtype_code||'-'||custtype_descrip)
              FROM custtype
             WHERE (custtype_id=<? value("custtype_id") ?>) )
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>)
        <? else ?>
          text('All Customer Types')
        <? endif ?>
        AS custtype
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------

 QUERY: detail
 SELECT cust_name, salesrep_name,
        cohist_ordernumber AS sonumber,
        formatDate(cohist_orderdate) AS orddate,
        CASE WHEN (cohist_invcnumber='-1') THEN 'Credit'
             ELSE text(cohist_invcnumber)
        END AS invnumber,
        formatDate(cohist_invcdate, 'Return') AS invcdate,
        formatQty(cohist_qtyshipped) AS f_shipped,
        cohist_qtyshipped as shipped,
        <? if exists("showPrices") ?>
-       formatPrice(cohist_unitprice) AS unitprice,
-       formatMoney(round(cohist_qtyshipped * cohist_unitprice,2)) AS f_total,
-       round(cohist_qtyshipped * cohist_unitprice,2) AS total
+       formatPrice(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS unitprice,
+       formatMoney(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS f_total,
+       round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2) AS total
        <? else ?>
        '' AS unitprice,
        '' AS f_total,
        0 AS total
        <? endif ?>
   FROM cohist, cust, salesrep, itemsite, item
  WHERE ((cohist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (cohist_cust_id=cust_id)
    AND (cohist_salesrep_id=salesrep_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?>
    AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    AND (cust_custtype_id IN (SELECT custtype_id
                                FROM custtype
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
  )
 ORDER BY cohist_invcdate, cust_number;

 --------------------------------------------------------------------
 REPORT: SalesHistoryByParameterList
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          ( SELECT (prodcat_code||'-'||prodcat_descrip)
              FROM prodcat
             WHERE (prodcat_id=<? value("prodcat_id") ?>) )
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? elseif exists("custtype_id") ?>
          ( SELECT (custtype_code || '-' || custtype_descrip)
              FROM custtype
             WHERE (custtype_id=<? value("custtype_id") ?>) )
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>)
        <? elseif exists("custgrp_id") ?>
          ( SELECT (custgrp_name || '-' || custgrp_descrip)
              FROM custgrp
             WHERE (custgrp_id=<? value("custgrp_id") ?>) )
        <? elseif exists("custgrp_pattern") ?>
          text(<? value("custgrp_pattern") ?>)
        <? else ?>
          text('')
        <? endif ?>
        AS f_value,
        <? if reExists("prodcat.*") ?>
          text('Product Categories:')
        <? elseif reExists("custtype.*") ?>
          text('Customer Types:')
        <? elseif reExists("custgrp.*") ?>
          text('Customer Groups:')
        <? else ?>
          text('')
        <? endif ?>
        AS f_label,
        formatDate(date(<? value("startDate") ?>)) AS startDate,
        formatDate(date(<? value("endDate") ?>)) AS endDate,
        <? if exists("showPrices") ?>
            text('Unit Price') AS lbl_unitprice,
            text('Total') AS lbl_total
        <? else ?>
            text('') AS lbl_unitprice,
            text('') AS lbl_total
        <? endif ?>
 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohist_ordernumber AS sonumber,
        cohist_invcnumber AS invnumber,
        formatDate(cohist_orderdate) AS orddate,
        formatDate(cohist_invcdate) AS invcdate,
        item_number, item_descrip1, item_descrip2,
        formatQty(cohist_qtyshipped) AS shipped,
        <? if exists("showPrices") ?>
-       formatPrice(cohist_unitprice) AS unitprice,
-       formatMoney(round(cohist_qtyshipped * cohist_unitprice,2)) AS f_total,
+       formatPrice(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS unitprice,
+       formatMoney(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS f_total,
        <? else ?>
        '' AS unitprice,
        '' AS f_total,
        <? endif ?>
-       round(cohist_qtyshipped * cohist_unitprice,2)  AS total
+       round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)  AS total
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
 REPORT: SalesHistoryBySalesRep
 QUERY: head
 SELECT salesrep_name,
        <? if exists("warehous_id") ?>
            (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-           text('All Warehouses')
+           text('All Sites')
        <? endif ?>
          AS warehouse,
        <? if exists("prodcat_id") ?>
            (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
            text(<? value("prodcat_pattern") ?>)
        <? else ?>
            text('All Categories')
        <? endif ?>
          AS prodcat,
        formatDate(date(<? value("startDate") ?>)) AS startDate,
        formatDate(date(<? value("endDate") ?>)) AS endDate,
        <? if exists("showPrices") ?>
            text('UnitPrice') AS lbl_unitprice,
            text('Total') AS lbl_total
        <? else ?>
            text('') AS lbl_unitprice,
            text('') AS lbl_total
        <? endif ?>
   FROM salesrep
  WHERE (salesrep_id=<? value("salesrep_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT cust_name,
        cohist_ordernumber as sonumber,
        CASE WHEN (cohist_invcnumber='-1') THEN 'Credit'
             ELSE text(cohist_invcnumber)
        END as invnumber,
        formatDate(cohist_orderdate) AS orddate, formatDate(cohist_invcdate, 'Return') AS invcdate,
        item_number, uom_name, item_descrip1, item_descrip2,
        formatQty(cohist_qtyshipped) AS shipped,
        <? if exists("showPrices") ?>
-       formatPrice(cohist_unitprice) AS unitprice,
-       formatMoney(round(cohist_qtyshipped * cohist_unitprice,2)) AS f_total,
+       formatPrice(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS unitprice,
+       formatMoney(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS f_total,
        <? else ?>
        '' AS unitprice,
        '' AS f_total,
        <? endif ?>
-       round(cohist_qtyshipped * cohist_unitprice,2) AS total
+       round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2) AS total
   FROM cohist, cust, itemsite, item, uom, prodcat
  WHERE ((cohist_itemsite_id=itemsite_id)
    AND (cohist_cust_id=cust_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (item_prodcat_id=prodcat_id)
    AND (cohist_salesrep_id=<? value("salesrep_id") ?>)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
  )
 ORDER BY cohist_invcdate, item_number;

 --------------------------------------------------------------------
 REPORT: SalesHistoryByShipTo
 QUERY: head
 SELECT cust_name,
        shipto_name,
        <? if exists("warehous_id") ?>
            (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-           text('All Warehouses')
+           text('All Sites')
        <? endif ?>
          AS warehouse,
        <? if exists("prodcat_id") ?>
            (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
            text(<? value("prodcat_pattern") ?>)
        <? else ?>
            text('All Categories')
        <? endif ?>
          AS prodcat,
        formatDate(date(<? value("startDate") ?>)) AS startDate,
        formatDate(date(<? value("endDate") ?>)) AS endDate,
        <? if exists("showPrices") ?>
        text('Unit Price') AS lbl_unitprice,
        text('Total') AS lbl_total
        <? else ?>
        text('') AS lbl_unitprice,
        text('') AS lbl_total
        <? endif ?>
   FROM shipto, cust
  WHERE ((shipto_cust_id=cust_id)
    AND (shipto_id=<? value("shipto_id") ?>) );

 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohist_ordernumber AS sonumber,
        cohist_invcnumber AS invnumber,
        formatDate(cohist_orderdate) AS orddate,
        formatDate(cohist_invcdate, 'Return') AS invcdate,
        item_number, item_descrip1, item_descrip2,
        formatQty(cohist_qtyshipped) AS shipped,
        <? if exists("showPrices") ?>
-       formatPrice(cohist_unitprice) AS unitprice,
-       formatMoney(round(cohist_qtyshipped * cohist_unitprice,2)) AS f_total,
+       formatPrice(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS unitprice,
+       formatMoney(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS f_total,
        <? else ?>
        '' AS unitprice,
        '' AS f_total,
        <? endif ?>
-       round(cohist_qtyshipped * cohist_unitprice,2) AS total
+       round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2) AS total
   FROM cohist, itemsite, item, prodcat
  WHERE ((cohist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_prodcat_id=prodcat_id)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
    AND (cohist_shipto_id=<? value("shipto_id") ?>)
  )
 ORDER BY cohist_invcdate, item_number;

 --------------------------------------------------------------------
 REPORT: SalesJournal
 QUERY: detail
 SELECT cust_number, cust_name, aropen_docnumber, aropen_doctype, formatDate(aropen_docdate) AS docdate,
-       aropen_applyto, formatExtPrice(aropen_amount) AS openamount, aropen_ponumber,
+       aropen_applyto, formatExtPrice(currtobase(aropen_curr_id,aropen_amount,aropen_docdate)) AS openamount, aropen_ponumber,
        (formatGLAccount(accnt_id)|| ' - ' || accnt_descrip) AS accntnumber,
        CASE WHEN (gltrans_amount < 0) THEN formatExtPrice(ABS(gltrans_amount))
             ELSE ''
        END AS debit,
        CASE WHEN (gltrans_amount > 0) THEN formatExtPrice(gltrans_amount)
             ELSE ''
        END AS credit
 FROM aropen, gltrans, cust, accnt
 WHERE ( (aropen_cust_id=cust_id)
  AND (aropen_docnumber=gltrans_docnumber)
  AND (aropen_doctype='I')
  AND (gltrans_doctype='IN')
  AND (gltrans_accnt_id=accnt_id)
  AND (gltrans_journalnumber=<? value("journalNumber") ?>)
  AND (aropen_journalnumber=<? value("journalNumber") ?>) )
 ORDER BY aropen_docnumber, gltrans_amount, accnt_number;

 --------------------------------------------------------------------

 QUERY: totaldocsales
-SELECT formatExtPrice(SUM(COALESCE(aropen_amount, 0))) AS amount
+SELECT formatExtPrice(SUM(COALESCE(currtobase(aropen_curr_id,aropen_amount,aropen_docdate), 0))) AS amount
 FROM aropen
 WHERE ( (aropen_doctype='I')
  AND (aropen_journalnumber=<? value("journalNumber") ?>) );

 --------------------------------------------------------------------
 REPORT: SalesJournalByDate
 QUERY: detail
 SELECT cust_number, cust_name, aropen_docnumber, aropen_doctype, formatDate(aropen_docdate) AS docdate,
-               aropen_applyto, formatExtPrice(aropen_amount) AS openamount, aropen_ponumber,
+               aropen_applyto, formatExtPrice(currtobase(aropen_curr_id,aropen_amount,aropen_docdate)) AS openamount, aropen_ponumber,
                accnt_number, accnt_descrip,
                CASE WHEN (gltrans_amount < 0) THEN formatExtPrice(ABS(gltrans_amount))
                          ELSE ''
                END AS debit,
                CASE WHEN (gltrans_amount > 0) THEN formatExtPrice(gltrans_amount)
                          ELSE ''
                END AS credit,
                CASE WHEN (aropen_doctype IN ('C', 'R')) THEN 'CR'
                          WHEN (aropen_doctype='I') THEN '  '
                END AS docsence
 FROM aropen, gltrans, cust, accnt
 WHERE ((aropen_cust_id=cust_id)
  AND (aropen_docnumber=gltrans_docnumber)
  AND ( ( (aropen_doctype='I') AND (gltrans_doctype='IN') ) OR ( (aropen_doctype IN ('C', 'R')) AND (gltrans_doctype='CM') ) )
  AND (gltrans_accnt_id=accnt_id)
  AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
  AND (gltrans_source='S/O')
  AND (aropen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
 ORDER BY aropen_docnumber, gltrans_amount, accnt_number;

 --------------------------------------------------------------------

 QUERY: totaldocsales
-SELECT formatExtPrice(SUM(COALESCE(aropen_amount, 0))) AS amount
+SELECT formatExtPrice(SUM(COALESCE(currtobase(aropen_curr_id,aropen_amount,aropen_docdate), 0))) AS amount
 FROM aropen
 WHERE ((aropen_doctype='I')
  AND (aropen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>));

 --------------------------------------------------------------------

 QUERY: totaldoccredit
-SELECT formatExtPrice(SUM(COALESCE(aropen_amount, 0))) AS amount
+SELECT formatExtPrice(SUM(COALESCE(currtobase(aropen_curr_id,aropen_amount,aropen_docdate), 0))) AS amount
 FROM aropen
 WHERE ((aropen_doctype IN ('C', 'R'))
  AND (aropen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>));

 --------------------------------------------------------------------

 QUERY: foot
-SELECT formatExtPrice(SUM( CASE WHEN (aropen_doctype IN ('C', 'R')) THEN (aropen_amount * -1)
-                                                           WHEN (aropen_doctype='I') THEN (aropen_amount)
+SELECT formatExtPrice(SUM( CASE WHEN (aropen_doctype IN ('C', 'R')) THEN (currtobase(aropen_curr_id,aropen_amount,aropen_docdate) * -1)
+                                                           WHEN (aropen_doctype='I') THEN (currtobase(aropen_curr_id,aropen_amount,aropen_docdate))
                                                  END )) AS totalamount
 FROM aropen
 WHERE (aropen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>);

 --------------------------------------------------------------------
 REPORT: SequencedBOM
 QUERY: head
 SELECT item_number,
-       item_invuom,
+       uom_name AS item_invuom,
        item_descrip1,
        item_descrip2
-  FROM item
- WHERE (item_id=<? value("item_id") ?>);
+  FROM item, uom
+ WHERE ((item_id=<? value("item_id") ?>)
+ AND (item_inv_uom_id=uom_id));

 --------------------------------------------------------------------

 QUERY: detail
 SELECT text(booitem_seqnumber) AS booseqnumber, bomitem_seqnumber,
-       item_number, item_invuom, item_descrip1, item_descrip2,
+       item_number, uom_name AS item_invuom, item_descrip1, item_descrip2,
        formatQtyPer(bomitem_qtyper) AS qtyper,
        formatScrap(bomitem_scrap) AS scrap,
        formatQtyPer(bomitem_qtyper + (1 * bomitem_scrap)) AS qtyreq,
        formatDate(bomitem_effective, 'Always') AS effective,
        formatDate(bomitem_expires, 'Never') AS expires,
        formatBoolYN(bomitem_createwo) AS createchild,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS issuemethod
-  FROM booitem(<? value("item_id") ?>), bomitem(<? value("item_id") ?>,<? value("revision_id") ?>), item
+  FROM booitem(<? value("item_id") ?>), bomitem(<? value("item_id") ?>,<? value("revision_id") ?>), item, uom
  WHERE ((bomitem_item_id=item_id)
    AND (bomitem_booitem_seq_id=booitem_seq_id)
+   AND (item_inv_uom_id=uom_id)
 <? if not exists("showExpired") ?>
    AND (bomitem_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
    AND (bomitem_effective <= CURRENT_DATE)
 <? endif ?>
 )
 UNION
 SELECT text('') AS booseqnumber, bomitem_seqnumber,
-       item_number, item_invuom, item_descrip1, item_descrip2,
+       item_number, uom_name AS item_invuom, item_descrip1, item_descrip2,
        formatQtyPer(bomitem_qtyper) AS qtyper,
        formatScrap(bomitem_scrap) AS scrap,
        formatQtyPer(bomitem_qtyper + (1 * bomitem_scrap)) AS qtyreq,
        formatDate(bomitem_effective, 'Always') AS effective,
        formatDate(bomitem_expires, 'Never') AS expires,
        formatBoolYN(bomitem_createwo) AS createchild,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS issuemethod
-  FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>), item
+  FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>), item, uom
  WHERE ((bomitem_item_id=item_id)
    AND (bomitem_booitem_seq_id=-1)
+   AND (item_inv_uom_id=uom_id)
 <? if not exists("showExpired") ?>
    AND (bomitem_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
    AND (bomitem_effective <= CURRENT_DATE)
 <? endif ?>
 )
 ORDER BY booseqnumber, bomitem_seqnumber;

 --------------------------------------------------------------------
 REPORT: SingleLevelBOM
 QUERY: head
-SELECT item_number, item_invuom, item_descrip1, item_descrip2
-FROM item
-WHERE (item_id=<? value("item_id") ?>);
+SELECT item_number, uom_name AS item_invuom, item_descrip1, item_descrip2
+FROM item, uom
+WHERE ((item_id=<? value("item_id") ?>)
+AND (item_inv_uom_id=uom_id));

 --------------------------------------------------------------------

 QUERY: detail
 SELECT bomitem_seqnumber, item_number,
-       item_invuom, item_descrip1, item_descrip2,
+       uom_name AS item_invuom, item_descrip1, item_descrip2,
        formatBoolYN(bomitem_createwo) AS createchild,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS issuemethod,
-       formatQtyPer(bomitem_qtyper) AS qtyper,
+       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS qtyper,
        formatScrap(bomitem_scrap) AS scrap,
-       formatQtyPer(bomitem_qtyper + (1 * bomitem_scrap)) AS qtyreq,
-       formatDate(bomitem_effective, 'Always') AS effective,
-       formatDate(bomitem_expires, 'Never') AS expires,
+       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper) * (1 + bomitem_scrap)) AS qtyreq,
+       formatDate(bomitem_effective, <? value("always") ?>) AS effective,
+       formatDate(bomitem_expires, <? value("never") ?>) AS expires,
        bomitem_ecn
 <? if exists("revision_id") ?>
   FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>)
 <? else ?>
   FROM bomitem(<? value("item_id") ?>)
 <? endif ?>
-, item
+, item, uom
 WHERE ((bomitem_item_id=item_id)
-
+AND (item_inv_uom_id=uom_id)
 <? if exists("expiredDays") ?>
  AND (bomitem_expires > (CURRENT_DATE - <? value("expiredDays") ?>))
 <? else ?>
  AND (bomitem_expires > CURRENT_DATE)
 <? endif ?>

 <? if exists("effectiveDays") ?>
  AND (bomitem_effective <= (CURRENT_DATE + <? value("effectiveDays") ?>))
 <? else ?>
  AND (bomitem_effective <= CURRENT_DATE)
 <? endif ?>

 )
 ORDER BY bomitem_seqnumber, bomitem_effective;

 --------------------------------------------------------------------
 REPORT: SlowMovingInventoryByClassCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (SELECT warehous_code
             FROM warehous
            WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("classcode_id") ?>
          (SELECT (classcode_code || '-' || classcode_descrip)
             FROM classcode
            WHERE (classcode_id=<? value("classcode_id") ?>) )
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? else ?>
          text('All Class Codes')
        <? endif ?>
        AS classcode,
        <? if exists("showValue") ?>
            <? if exists("useActualCosts") ?>
              text('Show Inventory Value with Actual Costs')
            <? else ?>
              text('Show Inventory Value with Standard Costs')
            <? endif ?>
            AS showvalues,
            text('Unit Cost') AS f_unitcost,
            text('Value') AS f_value,
        <? else ?>
            text('') AS showvalues,
            text('') AS f_unitcost,
            text('') AS f_value,
        <? endif ?>
        formatDate(<? value("cutoffDate") ?>) AS f_cutoff;

 --------------------------------------------------------------------
 REPORT:
 QUERY: detail
-SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, uom_name, roundUp(SUM(coship_qty) / item_shipinvrat)::integer AS shipqty,
-                item_shipuom, item_number, item_descrip1, item_descrip2,
+SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, uom_name, roundUp(SUM(coship_qty) / itemuomratiobytype(item_id, 'Selling'))::integer AS shipqty,
+                itemsellinguom(item_id) AS shipuom, item_number, item_descrip1, item_descrip2,
                 formatQty(SUM(coship_qty) * item_prodweight) AS netweight,
                 formatQty(SUM(coship_qty) * (item_prodweight + item_packweight)) AS grossweight
          FROM coship, coitem, itemsite, item, uom
          WHERE ((coship_coitem_id=coitem_id)
           AND (coitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
           AND (coship_cosmisc_id=%1))
-         GROUP BY coitem_linenumber, item_number, uom_name, item_shipinvrat, item_shipuom,
+         GROUP BY coitem_linenumber, item_number, uom_name, shipuom,
                   item_descrip1, item_descrip2, item_prodweight, item_packweight
          ORDER BY coitem_linenumber;

 --------------------------------------------------------------------
 REPORT: Statement
 QUERY: detail
 SELECT CASE WHEN (aropen_doctype='I') THEN 'Invc.'
             WHEN (aropen_doctype='D') THEN 'D/M'
             WHEN (aropen_doctype='C') THEN 'C/M'
             WHEN (aropen_doctype='R') THEN 'C/D'
             ELSE 'Misc.'
        END AS doctype,
        aropen_docnumber, formatDate(aropen_docdate) AS f_docdate,
        CASE WHEN (aropen_doctype='I') THEN formatDate(aropen_duedate)
             ELSE ''
        END AS f_duedate,
-       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(aropen_amount)
-            WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney(aropen_amount * -1)
-            ELSE formatMoney(aropen_amount)
+       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,aropen_amount,aropen_docdate))
+            WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount * -1),aropen_docdate))
+            ELSE formatMoney(currtocurr(aropen_curr_id,cust_curr_id,aropen_amount,aropen_docdate))
        END AS f_amount,
-       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(aropen_paid)
-            WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney(aropen_paid * -1)
-            ELSE formatMoney(aropen_paid)
+       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,aropen_paid,aropen_docdate))
+            WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,(aropen_paid * -1),aropen_docdate))
+            ELSE formatMoney(currtocurr(aropen_curr_id,cust_curr_id,aropen_paid,aropen_docdate))
        END AS f_applied,
-       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(aropen_amount - aropen_paid)
-            WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney((aropen_amount - aropen_paid) * -1)
-            ELSE formatMoney(aropen_amount - aropen_paid)
+       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate))
+            WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid) * -1,aropen_docdate))
+            ELSE formatMoney(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate))
        END AS f_balance,
-       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN (aropen_amount - aropen_paid)
-            WHEN (aropen_doctype IN ('C', 'R')) THEN ((aropen_amount - aropen_paid) * -1)
-            ELSE (aropen_amount - aropen_paid)
+       CASE WHEN (aropen_doctype IN ('I', 'D')) THEN currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate)
+            WHEN (aropen_doctype IN ('C', 'R')) THEN currtocurr(aropen_curr_id,cust_curr_id,((aropen_amount - aropen_paid) * -1),aropen_docdate)
+            ELSE currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate)
        END AS balance
-FROM aropen
-WHERE ( (aropen_cust_id=<? value("cust_id") ?>)
+FROM aropen, cust
+WHERE ( (aropen_cust_id=cust_id)
+ AND (aropen_cust_id=<? value("cust_id") ?>)
  AND (aropen_open)
  AND ((aropen_amount - aropen_paid) > 0) )
 ORDER BY aropen_docdate;


 --------------------------------------------------------------------

 QUERY: Current
-SELECT formatMoney(COALESCE(SUM((aropen_amount - aropen_paid) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
-  FROM aropen
- WHERE ((aropen_cust_id=<? value("cust_id") ?>)
+SELECT formatMoney(COALESCE(SUM(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
+  FROM aropen, cust
+ WHERE ((aropen_cust_id=cust_id)
+   AND (aropen_cust_id=<? value("cust_id") ?>)
    AND (aropen_open)
    AND ((aropen_amount - aropen_paid) > 0)
    AND (aropen_duedate >= CURRENT_DATE) )
 --------------------------------------------------------------------

 QUERY: Past91Plus
-SELECT formatMoney(COALESCE(SUM((aropen_amount - aropen_paid) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
-  FROM aropen
- WHERE ((aropen_cust_id=<? value("cust_id") ?>)
+SELECT formatMoney(COALESCE(SUM(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
+  FROM aropen, cust
+ WHERE ((aropen_cust_id=cust_id)
+   AND (aropen_cust_id=<? value("cust_id") ?>)
    AND (aropen_open)
    AND ((aropen_amount - aropen_paid) > 0)
    AND (aropen_duedate <= (CURRENT_DATE - 91)) )
 --------------------------------------------------------------------

 QUERY: Past1to30
-SELECT formatMoney(COALESCE(SUM((aropen_amount - aropen_paid) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
-  FROM aropen
- WHERE ((aropen_cust_id=<? value("cust_id") ?>)
+SELECT formatMoney(COALESCE(SUM(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
+  FROM aropen, cust
+ WHERE ((aropen_cust_id=cust_id)
+   AND (aropen_cust_id=<? value("cust_id") ?>)
    AND (aropen_open)
    AND ((aropen_amount - aropen_paid) > 0)
    AND (aropen_duedate between (CURRENT_DATE - 30) AND (CURRENT_DATE - 1)) )
 --------------------------------------------------------------------

 QUERY: Past31to60
-SELECT formatMoney(COALESCE(SUM((aropen_amount - aropen_paid) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
-  FROM aropen
- WHERE ((aropen_cust_id=<? value("cust_id") ?>)
+SELECT formatMoney(COALESCE(SUM(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
+  FROM aropen, cust
+ WHERE ((aropen_cust_id=cust_id)
+   ANd (aropen_cust_id=<? value("cust_id") ?>)
    AND (aropen_open)
    AND ((aropen_amount - aropen_paid) > 0)
    AND (aropen_duedate between (CURRENT_DATE - 60) AND (CURRENT_DATE - 31)) )
 --------------------------------------------------------------------

 QUERY: Past61to90
-SELECT formatMoney(COALESCE(SUM((aropen_amount - aropen_paid) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
-  FROM aropen
- WHERE ((aropen_cust_id=<? value("cust_id") ?>)
+SELECT formatMoney(COALESCE(SUM(currtocurr(aropen_curr_id,cust_curr_id,(aropen_amount - aropen_paid),aropen_docdate) * CASE WHEN (aropen_doctype IN ('C', 'R')) THEN -1 ELSE 1 END), 0)) AS f_amount
+  FROM aropen, cust
+ WHERE ((aropen_cust_id=cust_id)
+   ANd (aropen_cust_id=<? value("cust_id") ?>)
    AND (aropen_open)
    AND ((aropen_amount - aropen_paid) > 0)
    AND (aropen_duedate between (CURRENT_DATE - 90) AND (CURRENT_DATE - 61)) )
 --------------------------------------------------------------------

+QUERY: Currency
+SELECT currconcat(cust_curr_id) AS currAbbr
+  FROM cust
+ WHERE (cust_id=<? value("cust_id") ?>)
+
+--------------------------------------------------------------------
+

 --------------------------------------------------------------------
 REPORT: SubstituteAvailabilityByRootItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: SummarizedBOM
 QUERY: head
 SELECT item_number,
-       item_invuom,
+       uom_name AS item_invuom,
        item_descrip1,
        item_descrip2
-  FROM item
- WHERE (item_id=<? value("item_id") ?>);
+  FROM item, uom
+ WHERE ((item_id=<? value("item_id") ?>)
+ AND (item_inv_uom_id=uom_id));

 --------------------------------------------------------------------

 QUERY: detail
 select bomdata_item_number AS item_number,
        bomdata_uom_name AS item_invuom,
        bomdata_item_descrip1 AS item_descrip1,
        bomdata_item_descrip2 AS item_descrip2,
-       bomdata_qtyper AS qtyper
+       formatQtyPer(bomdata_qtyper) AS qtyper
   FROM summarizedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,<? value("expiredDays") ?>,<? value("futureDays") ?>)

 --------------------------------------------------------------------
 REPORT: SummarizedBacklogByWarehouse
 QUERY: head
 SELECT <? if exists("custtype_id") ?>
          ( SELECT (custtype_code||'-'||custtype_descrip)
              FROM custtype
             WHERE (custtype_id=<? value("custtype_id") ?>) )
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>)
        <? else ?>
          text('All Customer Types')
        <? endif ?>
        AS custtype,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("showPrices") ?>
          text('Sales') AS lbl_sales,
          text('Cost') AS lbl_cost,
          text('Margin') AS lbl_margin,
          text('Totals:') AS lbl_totals,
        <? else ?>
          text('') AS lbl_sales,
          text('') AS lbl_cost,
          text('') AS lbl_margin,
          text('') AS lbl_totals,
        <? endif ?>
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate;

 --------------------------------------------------------------------
 REPORT: SummarizedSalesByCustomerType
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("custtype_id") ?>
         (SELECT (custtype_code || '-' || custtype_descrip)
            FROM custtype
           WHERE custtype_id=<? value("custtype_id") ?>)
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>
        <? else  ?>
          text('All Customer Types')
        <? endif ?>
        AS custtype,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: SummarizedSalesHistoryByCustomer
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          ( SELECT (prodcat_code||'-'||prodcat_descrip)
              FROM prodcat
             WHERE prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Categories')
        <? endif ?>
        AS prodcat,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT cust_number, cust_name,
        formatDate(MIN(cohist_invcdate)) AS firstsale,
        formatDate(MAX(cohist_invcdate)) AS lastsale,
        formatQty(SUM(cohist_qtyshipped)) AS qty,
-       formatMoney(SUM(round(cohist_qtyshipped * cohist_unitprice,2))) AS sales
+       formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) AS sales
 FROM cohist, itemsite, cust, item
 WHERE ((cohist_itemsite_id=itemsite_id)
  AND (cohist_cust_id=cust_id)
  AND (itemsite_item_id=item_id)
  AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
  AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
  AND (item_prodcat_id IN (SELECT prodcat_id
                             FROM prodcat
                            WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 )
 GROUP BY cust_number, cust_id, cust_name;

 --------------------------------------------------------------------
 REPORT: SummarizedSalesHistoryByCustomerByItem
 QUERY: head
 SELECT cust_number,
        cust_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate
   FROM cust
  WHERE (cust_id=<? value("cust_id") ?>);
 --------------------------------------------------------------------

 QUERY: detail
 SELECT item_number, item_descrip1, item_descrip2, warehous_code,
        formatPrice(minprice) AS f_minprice,
        formatPrice(maxprice) AS f_maxprice,
        formatPrice(avgprice) AS f_avgprice,
        formatQty(totalunits) AS f_totalunits,
        formatMoney(totalsales) AS f_totalsales,
        totalsales
 FROM ( SELECT itemsite_id, item_number, item_descrip1, item_descrip2,
               warehous_code,
-              MIN(cohist_unitprice) AS minprice,
-              MAX(cohist_unitprice) AS maxprice,
-              AVG(cohist_unitprice) AS avgprice,
+              MIN(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS minprice,
+              MAX(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS maxprice,
+              AVG(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS avgprice,
               SUM(cohist_qtyshipped) AS totalunits,
-              SUM(round(cohist_qtyshipped * cohist_unitprice,2)) AS totalsales
+              SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS totalsales
          FROM cohist, itemsite, item, warehous
         WHERE ((cohist_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (itemsite_warehous_id=warehous_id)
           AND (cohist_cust_id=<? value("cust_id") ?>)
           AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
           AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
               )
 GROUP BY itemsite_id, item_number, item_descrip1, item_descrip2, warehous_code ) AS data
 <? if exists("orderByItemNumber") ?>
 ORDER BY item_number, warehous_code
 <? elseif exists("orderByQtyVolume") ?>
 ORDER BY totalunits DESC
 <? elseif exists("orderBySalesVolume") ?>
 ORDER BY totalsales DESC
 <? endif ?>

 --------------------------------------------------------------------
 REPORT: SummarizedSalesHistoryByCustomerTypeByItem
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("custtype_id") ?>
          ( SELECT (custtype_code||'-'||custtype_descrip)
              FROM custtype
             WHERE custtype_id=<? value("custtype_id") ?>)
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>)
        <? else ?>
          text('All Customer Types')
        <? endif ?>
        AS custtype,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate;

 --------------------------------------------------------------------

 QUERY: detail
 SELECT item_number, item_descrip1, item_descrip2, warehous_code,
        formatSalesPrice(minprice) AS f_minprice,
        formatSalesPrice(maxprice) AS f_maxprice,
        formatSalesPrice(avgprice) AS f_avgprice,
        formatQty(totalunits) AS f_totalunits,
        formatMoney(totalsales) AS f_totalsales,
        totalsales
 FROM ( SELECT itemsite_id, item_number, item_descrip1, item_descrip2,
               warehous_code,
-              MIN(cohist_unitprice) AS minprice,
-              MAX(cohist_unitprice) AS maxprice,
-              AVG(cohist_unitprice) AS avgprice,
+              MIN(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS minprice,
+              MAX(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS maxprice,
+              AVG(currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate)) AS avgprice,
               SUM(cohist_qtyshipped) AS totalunits,
-              SUM(round(cohist_qtyshipped * cohist_unitprice,2)) AS totalsales
+              SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS totalsales
          FROM cohist, cust, custtype, itemsite, item, warehous
         WHERE ((cohist_cust_id=cust_id)
           AND (cust_custtype_id=custtype_id)
           AND (cohist_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (itemsite_warehous_id=warehous_id)
           AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
           AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?>
           AND (custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
           AND (custtype_code ~ <? value("custtype_pattern") ?>)
 <? endif ?>
               )
 GROUP BY itemsite_id, item_number, item_descrip1,
          item_descrip2, warehous_code ) AS data
 ORDER BY item_number, warehous_code;

 --------------------------------------------------------------------
 REPORT: SummarizedSalesHistoryByItem
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code FROM warehous WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          ( SELECT (prodcat_code || '-' || prodcat_descrip)
              FROM prodcat
             WHERE (prodcat_id=<? value("prodcat_id") ?>) )
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Categories')
        <? endif ?>
        AS prodcat,
        <? if exists("custtype_id") ?>
          ( SELECT (custtype_code || '-' || custtype_descrip)
              FROM custtype
             WHERE (custtype_id=<? value("custtype_id") ?>) )
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>)
        <? else ?>
          text('All Customer Types')
        <? endif ?>
        AS custtype,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate

 --------------------------------------------------------------------

 QUERY: detail
 SELECT item_id, item_number, item_descrip1, item_descrip2,
        formatDate(MIN(cohist_invcdate)) AS f_firstsale,
        formatDate(MAX(cohist_invcdate)) AS f_lastsale,
        formatQty(SUM(cohist_qtyshipped)) AS f_qty,
-       SUM(round(cohist_qtyshipped * cohist_unitprice,2)) AS sales,
-       formatMoney(SUM(round(cohist_qtyshipped * cohist_unitprice,2))) AS f_sales
+       SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2)) AS sales,
+       formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) AS f_sales
   FROM cohist, cust, itemsite, item
  WHERE ( (cohist_cust_id=cust_id)
    AND (cohist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
    AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (item_prodcat_id IN (SELECT prodcat_id FROM prodcat WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("custtype_id") ?>
    AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
    AND (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
  )
 GROUP BY item_id, item_number, item_descrip1, item_descrip2
 <? if exists("orderByItemNumber") ?>
 ORDER BY item_number
 <? elseif exists("orderByQtyVolume") ?>
 ORDER BY SUM(cohist_qtyshipped) DESC
 <? elseif exists("orderBySalesVolume") ?>
 ORDER BY SUM(cohist_qtyshipped * cohist_unitprice) DESC
 <? endif ?>

 --------------------------------------------------------------------
 REPORT: SummarizedSalesHistoryBySalesRep
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code FROM warehous WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          ( SELECT (prodcat_code||'-'||prodcat_descrip)
              FROM prodcat
             WHERE prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Categories')
        <? endif ?>
        AS prodcat,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT salesrep_number, salesrep_name,
        formatDate(MIN(cohist_invcdate)) AS firstsale,
        formatDate(MAX(cohist_invcdate)) AS lastsale,
        formatQty(SUM(cohist_qtyshipped)) AS qty,
-       formatMoney(SUM(round(cohist_qtyshipped * cohist_unitprice,2))) AS sales
+       formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) AS sales
 FROM cohist, itemsite, salesrep, item
 WHERE ((cohist_itemsite_id=itemsite_id)
  AND (cohist_salesrep_id=salesrep_id)
  AND (itemsite_item_id=item_id)
  AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
  AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
  AND (item_prodcat_id IN (SELECT prodcat_id FROM prodcat WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
  )
 GROUP BY salesrep_number, salesrep_id, salesrep_name;

 --------------------------------------------------------------------
 REPORT: SummarizedSalesHistoryByShippingZone
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          ( SELECT (prodcat_code||'-'||prodcat_descrip)
              FROM prodcat
             WHERE prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Categories')
        <? endif ?>
        AS prodcat,
        <? if exists("shipzone_id") ?>
          ( SELECT shipzone_name
              FROM shipzone
             WHERE shipzone_id=<? value("shipzone_id") ?>)
        <? else ?>
          text('All Shipping Zones')
        <? endif ?>
        AS shipzone,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT shipzone_name, cust_number, cust_name,
        item_number, item_descrip1, item_descrip2,
        formatQty(SUM(cohist_qtyshipped)) AS shipped,
-       formatMoney(SUM(round(cohist_qtyshipped * cohist_unitprice,2))) AS extprice
+       formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) AS extprice
 FROM cohist, cust, shipto, itemsite, item, shipzone
 WHERE ((cohist_cust_id=cust_id)
  AND (cohist_shipto_id=shipto_id)
  AND (cohist_itemsite_id=itemsite_id)
  AND (itemsite_item_id=item_id)
  AND (shipto_shipzone_id=shipzone_id)
  AND (cohist_invcdate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>)
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
 GROUP BY shipzone_id, cust_id, shipzone_name, cust_number, cust_name, item_number, item_descrip1, item_descrip2;

 --------------------------------------------------------------------
 REPORT: SummarizedTaxableSales
 QUERY: detail
 SELECT (tax_code||'-'||tax_descrip) AS taxcode,
        formatMoney((
 	  SELECT COALESCE(SUM(ROUND(cohist_qtyshipped *
 				    currToCurr(cohist_curr_id, baseCurrId(),
 					       cohist_unitprice,
 					       cohist_invcdate),2)), 0)
 	  FROM cohist
 	  WHERE ((cohist_tax_id=tax_id)
-	    AND  (cohist_itemsite_id<>-1)
+                 AND  (COALESCE(cohist_misc_type,'M') = 'M')
 	    AND  (cohist_invcdate BETWEEN <? value("startDate") ?>
 				      AND <? value("endDate") ?>))
        )) AS f_sales,
        formatMoney((
 	  SELECT COALESCE(SUM(ROUND(currToCurr(cohist_curr_id, baseCurrId(),
 					       cohist_unitprice,
 					       cohist_invcdate), 2)), 0)
 	  FROM cohist
 	  WHERE ((cohist_tax_id=tax_id)
 	    AND  (cohist_misc_type='F')
 	    AND  (cohist_invcdate BETWEEN <? value("startDate") ?>
 				      AND <? value("endDate") ?>))
        )) AS f_freight,
        formatBoolYN(EXISTS(SELECT *
 			   FROM taxsel
 			   WHERE ((taxsel_tax_id=tax_id)
 			     AND  (taxsel_taxtype_id=getFreightTaxTypeId()))
        )) AS f_taxfreight,
        formatMoney((
 	 SELECT COALESCE(SUM(ROUND(currToCurr(cohist_curr_id, baseCurrId(),
 					      COALESCE(cohist_tax_ratea,0) +
 					      COALESCE(cohist_tax_rateb,0) +
 					      COALESCE(cohist_tax_ratec, 0),
 					      cohist_invcdate), 2)), 0)
 	 FROM cohist
 	 WHERE ((cohist_tax_id=tax_id)
 --          AND (cohist_misc_type='T')
 	    AND (cohist_invcdate BETWEEN <? value("startDate") ?>
 				      AND <? value("endDate") ?>))
        )) AS f_taxbase,
        formatMoney((
 	 SELECT COALESCE(SUM(ROUND(currToCurr(cohist_curr_id,
 					      COALESCE(taxauth_curr_id,
 						       baseCurrId()),
 					      COALESCE(cohist_tax_ratea,0) +
 					      COALESCE(cohist_tax_rateb,0) +
 					      COALESCE(cohist_tax_ratec, 0),
 					      cohist_invcdate), 2)), 0)
 	 FROM cohist
 	 WHERE ((cohist_tax_id=tax_id)
 --          AND (cohist_misc_type='T')
 	    AND (cohist_invcdate BETWEEN <? value("startDate") ?>
 				      AND <? value("endDate") ?>))
        )) AS f_tax,
        currConcat(COALESCE(taxauth_curr_id, baseCurrId())) AS taxauthcurr
 FROM tax LEFT OUTER JOIN
      (taxsel JOIN taxauth ON (taxsel_taxauth_id=taxauth_id))
 	ON (taxsel_tax_id=tax_id)
 <? if exists("tax_id") ?>
 WHERE (tax_id=<? value("tax_id") ?>)
 <? endif ?>
 GROUP BY tax_id, tax_code, tax_descrip, tax_freight, taxauth_curr_id;

 --------------------------------------------------------------------
 REPORT: TimePhasedAvailability
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("plancode_id") ?>
          ( SELECT (plancode_code || '-' || plancode_name)
              FROM plancode
             WHERE (plancode_id=<? value("plancode_id") ?>) )
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('All Planner Codes')
        <? endif ?>
        AS plncode;

 --------------------------------------------------------------------
 REPORT: TimePhasedBookingsByItem
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Product Categories')
        <? endif ?>
        AS prodcat,
        <? if exists("inventoryUnits") ?>
          text('UOM') AS lbl_uom,
          text('Qty.') AS lbl_unittype
        <? else ?>
          text('') AS lbl_uom,
          <? if exists("salesDollars") ?>
            text('Sales')
          <? else ?>
            text('Error')
          <? endif ?>
          AS lbl_unittype
        <? endif ?>

 --------------------------------------------------------------------
 REPORT: TimePhasedBookingsByProductCategory
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Product Categories')
        <? endif ?>
        AS prodcat,
        <? if exists("salesDollars") ?>
          text('')
        <? else ?>
          text('UOM')
        <? endif ?>
        AS lbl_uom,
        <? if exists("inventoryUnits") ?>
          text('Qty.')
        <? elseif exists("capacityUnits") ?>
          text('Capacity')
        <? elseif exists("altCapacityUnits") ?>
          text('Alt. Capacity')
        <? elseif exists("salesDollars") ?>
          text('Sales')
        <? else ?>
          text('ERROR')
        <? endif ?>
        AS lbl_unittype ;

 --------------------------------------------------------------------
 REPORT: TimePhasedDemandByPlannerCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("plancode_id") ?>
          ( SELECT (plancode_code||'-'||plancode_name)
              FROM plancode
             WHERE plancode_id=<? value("plancode_id") ?>)
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('All Planner Codes')
        <? endif ?>
        AS plancode,
        <? if exists("inventoryUnits") ?>
          text('Qty.')
        <? elseif exists("capacityUnits") ?>
          text('Capacity')
        <? elseif exists("altCapacityUnits") ?>
          text('Alt. Capacity')
        <? else ?>
          text('ERROR')
        <? endif ?>
        AS lbl_unittype ;

 --------------------------------------------------------------------
 REPORT: TimePhasedPlannedRevenueExpensesByPlannerCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("plancode_id") ?>
          ( SELECT (plancode_code || '-' || plancode_name)
              FROM plancode
             WHERE (plancode_id=<? value("plancode_id") ?>) )
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('All Planner Codes')
        <? endif ?>
        AS plncode;

 --------------------------------------------------------------------
 REPORT: TimePhasedProductionByItem
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("plancode_id") ?>
          ( SELECT (plancode_code||'-'||plancode_name)
              FROM plancode
             WHERE plancode_id=<? value("plancode_id") ?>)
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('All Planner Codes')
        <? endif ?>
        AS plancode ;

 --------------------------------------------------------------------
 REPORT: TimePhasedProductionByPlannerCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("plancode_id") ?>
          ( SELECT (plancode_code||'-'||plancode_name)
              FROM plancode
             WHERE plancode_id=<? value("plancode_id") ?>)
        <? elseif exists("plancode_pattern") ?>
          text(<? value("plancode_pattern") ?>)
        <? else ?>
          text('All Planner Codes')
        <? endif ?>
        AS plancode,
        <? if exists("inventoryUnits") ?>
          text('Qty.')
        <? elseif exists("capacityUnits") ?>
          text('Capacity')
        <? elseif exists("altCapacityUnits") ?>
          text('Alt. Capacity')
        <? else ?>
          text('ERROR')
        <? endif ?>
        AS lbl_unittype,
        <? if exists("showInactive") ?>
          text('Showing Active and Inactive Item Sites')
        <? else ?>
          text('Showing Active Item Sites Only')
        <? endif ?>
        AS lbl_showing ;

 --------------------------------------------------------------------
 REPORT: TimePhasedSalesHistoryByItem
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Product Categories')
        <? endif ?>
        AS prodcat,
        <? if exists("inventoryUnits") ?>
          text('UOM')
        <? else ?>
          text('')
        <? endif ?>
        AS lbl_uom,
        <? if exists("inventoryUnits") ?>
          text('Qty.')
        <? elseif exists("salesDollars") ?>
          text('Sales')
        <? else ?>
          text('ERROR')
        <? endif ?>
        AS lbl_unittype

 --------------------------------------------------------------------
 REPORT: TimePhasedSalesHistoryByProductCategory
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("prodcat_id") ?>
          (select (prodcat_code||'-'||prodcat_descrip) from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? elseif exists("prodcat_pattern") ?>
          text(<? value("prodcat_pattern") ?>)
        <? else ?>
          text('All Product Categories')
        <? endif ?>
        AS prodcat,
        <? if exists("salesDollars") ?>
          text('')
        <? else ?>
          text('UOM')
        <? endif ?>
        AS lbl_uom,
        <? if exists("inventoryUnits") ?>
          text('Qty.')
        <? elseif exists("capacityUnits") ?>
          text('Capacity')
        <? elseif exists("altCapacityUnits") ?>
          text('Alt. Capacity')
        <? elseif exists("salesDollars") ?>
          text('Sales')
        <? else ?>
          text('ERROR')
        <? endif ?>
        AS lbl_unittype ;

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
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);

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
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: UniformBOL
 QUERY: detail
 SELECT 1 as one,
        coitem_linenumber,
        formatQty(SUM(coship_qty)) AS invqty,
        uom_name,
-       roundUp(SUM(coship_qty) / item_shipinvrat)::integer AS shipqty,
-       item_shipuom, item_number, item_descrip1, item_descrip2,
+       itemsellinguom(item_id) AS shipuom,
+       roundUp(SUM(coship_qty) / iteminvpricerat(item_id))::integer AS shipqty,
+       item_number, item_descrip1, item_descrip2,
        formatQty(SUM(coship_qty) * item_prodweight) AS netweight,
        formatQty(SUM(coship_qty) * (item_prodweight + item_packweight)) AS grossweight
   FROM coship, coitem, itemsite, item, uom
  WHERE ((coship_coitem_id=coitem_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coship_cosmisc_id=%1))
 GROUP BY coitem_linenumber, item_number,
-         uom_name, item_shipinvrat,
-         item_shipuom, item_descrip1,
+         uom_name, shipuom,
+         item_descrip1,
          item_descrip2, item_prodweight,
          item_packweight
 ORDER BY coitem_linenumber;

 --------------------------------------------------------------------
 REPORT: UninvoicedReceipts
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername;

 --------------------------------------------------------------------
 REPORT: UninvoicedShipments
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: UnpostedPoReceipts
 QUERY: detail
-SELECT porecv_id, porecv_poitem_id, porecv_ponumber,
-       (vend_number || '-' || vend_name) AS vend_number,
-       poitem_linenumber,
-       formatDate(porecv_duedate) AS porecv_duedate,
-       COALESCE(item_number, 'Non-Inventory') AS item_number,
-       COALESCE(uom_name, 'N/A') AS uom_name,
-       porecv_vend_item_number,
-       porecv_vend_uom,
-       formatQty(poitem_qty_ordered) AS poitem_qty_ordered,
-       formatQty(poitem_qty_received) AS poitem_qty_received,
-       formatQty(porecv_qty) AS porecv_qty,
-       formatDate(porecv_date) AS porecv_date,
-       formatDate(COALESCE(porecv_gldistdate, porecv_date)) AS porecv_gldistdate,
-      poitem_pohead_id
-FROM vend, pohead, poitem, porecv LEFT OUTER JOIN
-     (itemsite JOIN item ON (itemsite_item_id=item_id) JOIN uom ON (item_inv_uom_id=uom_id))
-      ON (porecv_itemsite_id=itemsite_id)
-WHERE ( (porecv_poitem_id=poitem_id)
-  AND   (NOT porecv_posted)
-  AND   (poitem_pohead_id=pohead_id)
-  AND   (pohead_vend_id=vend_id))
-ORDER BY porecv_ponumber, poitem_linenumber;
+SELECT recv_id, recv_orderitem_id, recv_order_number, recv_order_type,
+       orderhead_from,
+       orderitem_linenumber,
+       formatDate(recv_duedate) AS recv_duedate,
+       warehous_code,
+       COALESCE(item_number, <? value("nonInventory") ?>) AS item_number,
+       COALESCE(uom_name, <? value("na") ?>) AS uom_name,
+       recv_vend_item_number,
+       recv_vend_uom,
+       formatQty(orderitem_qty_ordered)  AS qty_ordered,
+       formatQty(orderitem_qty_received) AS qty_received,
+       formatQty(recv_qty)     AS recv_qty,
+       formatDate(recv_date)   AS recv_date,
+       formatDate(COALESCE(recv_gldistdate, recv_date)) AS recv_gldistdate
+FROM orderhead JOIN
+     orderitem ON ((orderitem_orderhead_id=orderhead_id)
+	       AND (orderitem_orderhead_type=orderhead_type)) JOIN
+     recv  ON ((recv_orderitem_id=orderitem_id)
+	   AND (recv_order_type=orderitem_orderhead_type)) LEFT OUTER JOIN
+     (itemsite JOIN item ON (itemsite_item_id=item_id)
+	       JOIN uom ON (item_inv_uom_id=uom_id)
+               JOIN site() ON (itemsite_warehous_id=warehous_id)
+       )
+      ON (recv_itemsite_id=itemsite_id) LEFT OUTER JOIN
+     vend ON (orderhead_type='PO' AND orderhead_from_id=vend_id)
+WHERE (NOT recv_posted)
+ORDER BY orderhead_from, recv_order_number, orderitem_linenumber;
+

 --------------------------------------------------------------------
 REPORT: UsageStatisticsByClassCode
 QUERY: head
 SELECT <? if exists("classcode_id") ?>
          ( SELECT (classcode_code || '-' || classcode_descrip)
              FROM classcode
             WHERE (classcode_id=<? value("classcode_id") ?>) )
        <? elseif exists("classcode_pattern") ?>
          text(<? value("classcode_pattern") ?>)
        <? else ?>
          text('All Class Codes')
        <? endif ?>
        AS classcode,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate

 --------------------------------------------------------------------
 REPORT: UsageStatisticsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: UsageStatisticsByItemGroup
 QUERY: head
 SELECT formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate,
        <? if exists("itemgrp_id") ?>
          ( SELECT (itemgrp_name || '-' || itemgrp_descrip)
              FROM itemgrp
             WHERE (itemgrp_id=<? value("itemgrp_id") ?>) )
        <? elseif exists("itemgrp_pattern") ?>
          text(<? value("itemgrp_pattern") ?>)
        <? else ?>
          text('All Item Groups')
        <? endif ?>
        AS itemgroup,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse;

 --------------------------------------------------------------------
 REPORT: ValidLocationsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
                    FROM warehous
                    WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: ViewAPCheckRunEditList
 QUERY: detail
 SELECT checkhead_amount AS amt_check,
+       currtobase(checkhead_curr_id,checkhead_amount,checkhead_checkdate) AS base_amt_check,
        checkhead_id AS primaryid,
        -1 AS secondaryid,
        formatBoolYN(checkhead_void) AS f_void,
        formatBoolYN(checkhead_printed) AS f_printed,
        TEXT(checkhead_number) AS number,
        (checkrecip_number || '-' || checkrecip_name) AS description,
        formatDate(checkhead_checkdate) AS f_checkdate,
        formatMoney(checkhead_amount) AS f_amount,
+       formatMoney(currtobase(checkhead_curr_id,checkhead_amount,checkhead_checkdate)) AS f_baseamount,
+       currconcat(checkhead_curr_id) AS currAbbr,
        checkhead_number,
        1 AS orderby
   FROM checkhead LEFT OUTER JOIN
        checkrecip ON ((checkrecip_id=checkhead_recip_id)
 		 AND  (checkrecip_type=checkhead_recip_type))
  WHERE ((checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
    AND  (NOT checkhead_posted)
    AND  (NOT checkhead_replaced)
    AND  (NOT checkhead_deleted) )

 UNION SELECT 0 AS amt_check,
+             0 AS base_amt_check,
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
+             formatMoney(currtobase(checkitem_curr_id,checkitem_amount,checkhead_checkdate)) AS f_baseamount,
+             currconcat(checkitem_curr_id) AS currAbbr,
 	     checkhead_number,
              2 AS orderby
         FROM checkitem, checkhead
        WHERE ( (checkitem_checkhead_id=checkhead_id)
          AND (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
          AND (NOT checkhead_posted)
          AND (NOT checkhead_replaced)
          AND (NOT checkhead_deleted) )

 ORDER BY checkhead_number, primaryid, orderby;

 --------------------------------------------------------------------
 REPORT: WOHistoryByClassCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
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
        AS lbl_toplevel;

 --------------------------------------------------------------------
 REPORT: WOHistoryByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          (SELECT warehous_code
             FROM warehous
            WHERE (warehous_id=<? value("warehous_id") ?>))
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("showOnlyTopLevel") ?>
          text('Only Show Top Level Work Orders')
        <? else ?>
          text('')
        <? endif ?>
        AS lbl_toplevel,
        <? if exists("showCosts") ?>
          text('Cost')
        <? else ?>
          text('')
        <? endif ?>
        AS lbl_cost,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
   FROM item
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: WOHistoryByNumber
 QUERY: Detail
-SELECT wo_subnumber AS subnumber,
+SELECT formatWoNumber(wo_id) AS number,
+       wo_subnumber AS subnumber,
        wo_status, warehous_code,
        item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(wo_qtyord) AS ordered,
        formatQty(wo_qtyrcv) AS received,
        formatDate(wo_startdate) AS startdate,
        formatDate(wo_duedate) AS duedate,
        <? if exists("showCosts") ?>
          formatCost(wo_postedvalue)
        <? else ?>
          text('')
        <? endif ?>
        AS value
   FROM wo, itemsite, warehous, item, uom
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
-   AND (wo_number=<? value("woNumber") ?>)
+   AND (CAST(wo_number AS TEXT) ~ <? value("woNumber") ?>)
 <? if exists("showOnlyTopLeve") ?>
    AND ((wo_ordtype<>'W') OR (wo_ordtype IS NULL))
 <? endif ?>
  )
 ORDER BY wo_subnumber;

 --------------------------------------------------------------------
 REPORT: WOMaterialRequirementsByComponentItem
 QUERY: head
 SELECT item_number, item_descrip1, item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Warehouses')
+         text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------
 REPORT: WOScheduleByParameterList
 QUERY: Head
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS f_startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS f_enddate,
 <? if exists("warehous_id") ?>
        warehous_code
 FROM warehous
 WHERE (warehous_id=<? value("warehous_id") ?>);
 <? else ?>
-       TEXT('All Warehouses') AS warehous_code;
+       TEXT('All Sites') AS warehous_code;
 <? endif ?>

 --------------------------------------------------------------------
 REPORT: WarehouseMasterList
 QUERY: detail
 SELECT warehous_code,
        formatBoolYN(warehous_active) AS f_active,
        warehous_descrip,
-       warehous_addr1,
-       warehous_addr2,
-       warehous_addr3,
-       warehous_addr4,
+       addr_line1 AS warehous_addr1,
+       addr_line2 AS warehous_addr2,
+       addr_line3 AS warehous_addr3,
+       (addr_city || ',' || addr_state || ' ' || addr_postalcode) AS warehous_addr4,
        warehous_fob,
        warehous_bol_prefix,
        warehous_bol_number,
        formatBoolYN(warehous_shipping) AS f_shipping,
        warehous_counttag_prefix,
        warehous_counttag_number,
        formatBoolYN(warehous_useslips) as f_useslips
-  FROM warehous
+  FROM site() JOIN addr ON (addr_id=warehous_addr_id)
+LEFT OUTER JOIN sitetype ON (sitetype_id=warehous_sitetype_id)
+WHERE ((TRUE)
 <? if NOT exists("showInactive") ?>
- WHERE (warehous_active)
+  AND (warehous_active)
 <? endif ?>
-ORDER BY warehous_code;
+) ORDER BY warehous_code;