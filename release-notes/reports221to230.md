--------------------------------------------------------------------
NEW REPORTS:
InventoryAvailabilityByCustomerType
JobCosting
--------------------------------------------------------------------
CHANGED REPORTS:
APCheck
APOpenItemsByVendor
AROpenItems
AROpenItemsByCustomer
AccountNumberMasterList
BacklogByCustomer
BacklogByItemNumber
BacklogByParameterList
BacklogBySalesOrder
BillingEditList
BookingsByCustomer
BookingsByItem
BookingsByProductCategory
BookingsBySalesRep
BookingsByShipTo
CapacityUOMsByClassCode
CapacityUOMsByProductCategory
CheckJournal
CheckRegister
CostCategoriesMasterList
CostedIndentedBOM
CostedSingleLevelBOM
CostedSummarizedBOM
CreditMemo
CreditMemoEditList
CustomerInformation
DeliveryDateVariancesByItem
ExpiredInventoryByClassCode
IndentedBOM
IndentedWhereUsed
InventoryAvailabilityBySalesOrder
InventoryHistoryByItem
InventoryHistoryByParameterList
Invoice
InvoiceInformation
ItemCostsByClassCode
ItemMaster
ItemSourcesByItem
ItemSourcesByVendor
ItemsByCharacteristic
ItemsByClassCode
ItemsByProductCategory
MaterialUsageVarianceByBOMItem
MaterialUsageVarianceByComponentItem
MaterialUsageVarianceByItem
MaterialUsageVarianceByWarehouse
MaterialUsageVarianceByWorkOrder
OpenWorkOrdersWithClosedParentSalesOrders
OpenWorkOrdersWithParentSalesOrders
OrderActivityByProject
POHistory
POLineItemsByDate
POLineItemsByItem
POLineItemsByVendor
PackingList-Shipment
PackingList
PackingListBatchEditList
PartiallyShippedOrders
PendingBOMChanges
PendingWOMaterialAvailability
PickList
PickingListSOClosedLines
PickingListNoClosedLines
PricesByCustomer
PricesByCustomerType
PricesByItem
PurchaseOrder
PurchaseOrder
PurchasePriceVariancesByItem
PurchaseRequestsByItem
QOHByLocation
QOHByParameterList
Quote
RunningAvailability
SalesHistoryByItem
SalesHistoryBySalesRep
SalesOrderStatus
SelectPaymentsList
SequencedBOM
ShipmentsByDate
ShipmentsBySalesOrder
ShippingLabelsBySo
SingleLevelBOM
SingleLevelWhereUsed
SlowMovingInventoryByClassCode
SummarizedBOM
SummarizedBacklogByWarehouse
SummarizedTaxableSales
TimePhasedAvailability
TimePhasedBookingsByItem
TimePhasedBookingsByProductCategory
TimePhasedDemandByPlannerCode
TimePhasedProductionByItem
TimePhasedProductionByPlannerCode
TimePhasedSalesHistoryByItem
TimePhasedSalesHistoryByProductCategory
UniformBOL
UninvoicedShipments
UnpostedPoReceipts
UnpostedReturnsForPO
UnusedPurchasedItems
ViewAPCheckRunEditList
VoucheringEditList
WOHistoryByClassCode
WOHistoryByNumber
WOMaterialAvailabilityByWorkOrder
WOMaterialRequirementsByComponentItem
WOMaterialRequirementsByWorkOrder
WOScheduleByParameterList


 --------------------------------------------------------------------
 REPORT: APCheck
 QUERY: Head
 SELECT
-
-CASE
-WHEN vendaddr_code = 'REMIT' or vendaddr_code = 'Remit' or vendaddr_code = 'remit' THEN
-formatAddr(
-addr.addr_line1,
-addr.addr_line2,
-addr.addr_line3,
-(addr.addr_city || ', ' ||
-addr.addr_state || ', ' ||
-addr.addr_postalcode),
-addr.addr_country)
-ELSE
-formatAddr(vend_address1, vend_address2, vend_address3,
-( vend_city || ', ' || vend_state || ' ' || vend_zip ), vend_country)
-END
-AS check_address,
-
-CASE
-WHEN vendaddr_code = 'REMIT' or vendaddr_code = 'Remit' or vendaddr_code = 'remit' THEN
-vendaddrinfo.vendaddr_name
-ELSE
-vend.vend_name
-END
-AS vend_name,
-vend_address1,
-vend_address2, vend_address3,
-vend_city || ', ' || vend_state || ' ' || vend_zip AS address4,
-formatDate(apchk_checkdate) AS f_checkdate,
-formatMoney(apchk_amount) AS f_amount,
-initcap(spellAmount(apchk_amount, curr_id)) AS f_words,
-CASE WHEN(apchk_void) THEN text('V O I D')
-else text('')
+checkhead_id, checkhead_number, checkhead_for AS memo,
+formatDate(checkhead_checkdate) AS f_checkdate,
+formatMoney(checkhead_amount) AS f_amount,
+INITCAP(spellAmount(checkhead_amount, curr_id)) AS f_words,
+CASE WHEN(checkhead_void) THEN TEXT('V O I D')
+     ELSE TEXT('')
 END AS f_void,
-apchk_number,
-apchk_for AS memo,
-vend_number,
-apchk_for,
-curr_symbol,
-curr_abbr,
-curr_name
-FROM apchk,
-vend LEFT JOIN vendaddrinfo ON vend.vend_id = vendaddrinfo.vendaddr_vend_id
-and vendaddrinfo.vendaddr_code = 'REMIT' or vendaddrinfo.vendaddr_code = 'Remit' or vendaddrinfo.vendaddr_code = 'remit'
-LEFT JOIN addr ON addr_id = vendaddr_addr_id,
-bankaccnt, curr_symbol
-WHERE ( (apchk_vend_id=vend_id)
-
-AND (apchk_curr_id = curr_id)
-AND (apchk_id=<? value("apchk_id") ?>) )
-LIMIT 1;
+CASE WHEN checkhead_recip_type = 'C' THEN (SELECT cust_number
+                                           FROM custinfo
+                                           WHERE (cust_id=checkhead_recip_id))
+     WHEN checkhead_recip_type = 'T' THEN (SELECT taxauth_code
+                                           FROM taxauth
+                                           WHERE (taxauth_id=checkhead_recip_id))
+     WHEN checkhead_recip_type = 'V' THEN (SELECT vend_number
+                                           FROM vendinfo
+                                           WHERE (vend_id=checkhead_recip_id))
+     ELSE 'Unknown Recipient Type'
+END AS recip_number,
+formatAddr(CASE WHEN checkhead_recip_type = 'C' THEN
+                                         (SELECT cntct_addr_id
+                                          FROM cntct, custinfo
+                                          WHERE ((cust_cntct_id=cntct_id)
+                                            AND  (cust_id=checkhead_recip_id)))
+                WHEN checkhead_recip_type = 'T' THEN
+                                         (SELECT taxauth_addr_id
+                                          FROM taxauth
+                                          WHERE (taxauth_id=checkhead_recip_id))
+                WHEN checkhead_recip_type = 'V' THEN
+                        COALESCE((SELECT vendaddr_addr_id
+                                  FROM vendaddrinfo
+                                  WHERE ((UPPER(vendaddr_code)='REMIT')
+                                    AND  (vendaddr_vend_id=checkhead_recip_id))),
+                                 (SELECT vend_addr_id
+                                  FROM vendinfo
+                                  WHERE (vend_id=checkhead_recip_id)))
+           END) AS check_address,
+CASE WHEN checkhead_recip_type = 'C' THEN (SELECT cust_name
+                                           FROM custinfo
+                                           WHERE cust_id=checkhead_recip_id)
+     WHEN checkhead_recip_type = 'T' THEN (SELECT taxauth_name
+                                           FROM taxauth
+                                           WHERE taxauth_id=checkhead_recip_id)
+     WHEN checkhead_recip_type = 'V' THEN
+                         COALESCE((SELECT vendaddr_name
+                                   FROM vendaddr
+                                   WHERE ((UPPER(vendaddr_code)='REMIT')
+                                     AND  (vendaddr_vend_id=checkhead_recip_id))),
+                                  (SELECT vend_name
+                                   FROM vendinfo
+                                   WHERE (vend_id=checkhead_recip_id)))
+END AS recip_name,
+curr_symbol, curr_abbr, curr_name
+FROM checkhead, curr_symbol
+WHERE ((checkhead_curr_id = curr_id)
+   AND (checkhead_id=<? value("checkhead_id") ?>) );
+
 --------------------------------------------------------------------

 QUERY: TopDetail2
-SELECT
---VOUCHER-------------
- 1 as sequence_value,
+SELECT  --VOUCHER-------------
   1 as ord,
-  apchkitem_invcnumber,
-  apchkitem_ponumber,
-  formatMoney(apchkitem_amount) as f_amount,
-  'Invoice#: ' || vohead_invcnumber AS vohead_invcnumber,
-  formatDate(vohead_docdate),
-  vohead_reference,
-  formatMoney(apchkitem_amount),
-  'Voucher: ' || apchkitem_vouchernumber AS vouchernumber,
+  1 AS sequence_value,
+  checkitem_invcnumber,
+  checkitem_ponumber,
+  formatMoney(checkitem_amount) AS f_amount,
+  'Invoice#: ' || vohead_invcnumber AS doc_number,
+  formatDate(vohead_docdate) AS f_docdate,
+  vohead_reference AS doc_reference,
+  'Voucher: ' || checkitem_vouchernumber AS vouchernumber,
   formatMoney(apopen_amount) as amount,
-  formatMoney(apchkitem_discount) AS disc_cred
-FROM apchkitem, vohead, apopen
-WHERE (
-(apchkitem_apchk_id= <? value("apchk_id") ?>)
-AND apchkitem_vouchernumber = vohead_number
-AND apopen_docnumber = apchkitem_vouchernumber
-AND apopen_doctype = 'V')
+  formatMoney(checkitem_discount) AS disc_cred
+FROM checkitem, vohead, apopen
+WHERE ((checkitem_checkhead_id= <? value("checkhead_id") ?>)
+  AND  (checkitem_vouchernumber = vohead_number)
+  AND  (apopen_docnumber = checkitem_vouchernumber)
+  AND  (apopen_doctype = 'V'))

 UNION

-SELECT
---DEBIT MEMO -------------------------
- 1 as sequence_value,
+SELECT --DEBIT MEMO -------------------------
   2 as ord,
-  apchkitem_invcnumber,
-  apchkitem_ponumber,
-  formatMoney(apchkitem_amount) as f_amount,
- 'Debit Memo PO#: ' || apchkitem_ponumber AS vohead_invcnumber,
- '' as vohead_docdate,
- 'Debit Memo: ' || apchkitem_vouchernumber as vohead_reference,
-  formatMoney(apchkitem_amount),
-  apchkitem_vouchernumber AS vouchernumber,
+  1 AS sequence_value,
+  checkitem_invcnumber,
+  checkitem_ponumber,
+  formatMoney(checkitem_amount) AS f_amount,
+  'Debit Memo PO#: ' || checkitem_ponumber AS doc_number,
+  ''  AS f_docdate,
+  'Debit Memo: ' || checkitem_vouchernumber AS doc_reference,
+  checkitem_vouchernumber AS vouchernumber,
   formatMoney(apopen_amount) as amount,
-  formatMoney(apchkitem_discount) AS disc_cred
-FROM apchk, apchkitem, apopen
-WHERE (
-(apchkitem_apchk_id= <? value("apchk_id") ?>)
-and apchkitem_apchk_id = apchk_id
-and apchkitem_vouchernumber = apopen_docnumber
-AND apopen_doctype = 'D')
+  formatMoney(checkitem_discount) AS disc_cred
+FROM checkitem, apopen
+WHERE ((checkitem_checkhead_id= <? value("checkhead_id") ?>)
+  AND  (checkitem_vouchernumber = apopen_docnumber)
+  AND  (apopen_doctype = 'D'))

 UNION

-SELECT
---CREDITs--------------------------
- 1 as sequence_value,
+SELECT --CREDITs--------------------------
  3 as ord,
- apchkitem_invcnumber,
- apchkitem_ponumber,
- formatMoney(apchkitem_amount) as f_amount,
- 'Invoice#: ' || vohead_invcnumber AS vohead_invcnumber,
- formatDate(vohead_docdate),
- 'Credit Applied: ' || apapply_source_doctype || ' ' || apapply_source_docnumber  AS vohead_reference,
- '' as apchkitem_amount,
- 'Voucher ' || apchkitem_vouchernumber AS vouchernumber,
+  1 AS sequence_value,
+  checkitem_invcnumber,
+  checkitem_ponumber,
+  formatMoney(checkitem_amount) AS f_amount,
+  'Invoice#: ' || vohead_invcnumber AS doc_number,
+  formatDate(vohead_docdate) AS f_docdate,
+  'Credit Applied: ' || apapply_source_doctype || ' ' ||
+                        apapply_source_docnumber AS doc_reference,
+  'Voucher ' || checkitem_vouchernumber AS vouchernumber,
  '' AS amount,
  formatMoney((apapply_amount)) as disc_cred
-FROM apchkitem, vohead, apapply
-WHERE (
-(apchkitem_apchk_id=<? value("apchk_id") ?>)
-AND apchkitem_vouchernumber = vohead_number
-AND apapply_target_docnumber = apchkitem_vouchernumber )
+FROM checkitem, vohead, apapply
+WHERE ((checkitem_checkhead_id=<? value("checkhead_id") ?>)
+  AND  (checkitem_vouchernumber = vohead_number)
+  AND  (apapply_target_docnumber = checkitem_vouchernumber ))

+UNION
+
+SELECT --NON-VENDOR-----------------------
+  4 AS ord,
+  1 AS sequence_value,
+  checkitem_invcnumber,
+  checkitem_ponumber,
+  formatMoney(checkitem_amount) AS f_amount,
+  checkitem_invcnumber AS doc_number,
+  formatDate(checkitem_docdate) AS f_docdate,
+  '' AS doc_reference,
+  '' AS vouchernumber,
+  '' AS amount,
+  '' AS disc_cred
+FROM checkhead LEFT OUTER JOIN
+     checkitem ON (checkitem_checkhead_id=checkhead_id)
+WHERE ((checkhead_id=<? value("checkhead_id") ?>)
+  AND  (checkhead_recip_type != 'V'))

 UNION
---BLANK LINES FOR SPACING------------------
-select
+
+SELECT --BLANK LINES FOR SPACING------------------
+ 5 AS ord,
  sequence_value,
- 4 as ord,
- '' as apchkitem_invcnumber,
- '' as apchkitem_ponumber,
+ '' AS checkkitem_invcnumber,
+ '' AS checkitem_ponumber,
  '' as f_amount,
  '' as vohead_invcnumber,
- '' as vohead_docdate,
- '' as vohead_reference,
- '' as apchkitem_amount,
+ '' AS f_docdate,
+ '' AS doc_reference,
  '' as vouchernumber,
  '' as amount,
  '' as disc_cred
 FROM sequence

 ORDER BY ord
 LIMIT 16;
-
-
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: APOpenItemsByVendor
 QUERY: head
 SELECT vend_name,
        vend_number,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
-       formatDate(<? value("endDate") ?>, 'Latest') AS enddate
+       formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
+       formatDate(<? value("asofDate") ?>) AS asofDate
   FROM vend
  WHERE (vend_id=<? value("vend_id") ?>);
 --------------------------------------------------------------------

 QUERY: detail
 SELECT apopen_id, apopen_ponumber, apopen_docnumber,
        CASE WHEN (apopen_doctype='C') THEN text('C/M')
             WHEN (apopen_doctype='D') THEN text('D/M')
             WHEN (apopen_doctype='V') THEN text('Voucher')
             ELSE text('Other')
        END AS f_doctype,
        formatDate(apopen_docdate) AS f_docdate,
        formatDate(apopen_duedate) AS f_duedate,
        formatMoney(apopen_amount) AS f_amount,
-       formatMoney(apopen_paid) AS f_paid,
-       CASE WHEN (apopen_doctype='C') THEN formatMoney((apopen_amount - apopen_paid) * -1)
-            WHEN (apopen_doctype IN ('V', 'D')) THEN formatMoney(apopen_amount - apopen_paid)
-            ELSE formatMoney(apopen_amount - apopen_paid)
+       formatMoney(apapplied(apopen_id,<? value("asofDate") ?>)) AS f_paid,
+       CASE WHEN (apopen_doctype='C') THEN formatMoney((apopen_amount - apapplied(apopen_id,<? value("asofDate") ?>)) * -1)
+            WHEN (apopen_doctype IN ('V', 'D')) THEN formatMoney(apopen_amount -apapplied(apopen_id,<? value("asofDate") ?>))
+            ELSE formatMoney(apopen_amount - apapplied(apopen_id,<? value("asofDate") ?>))
        END AS f_balance,
-       CASE WHEN (apopen_doctype='C') THEN ((apopen_amount - apopen_paid) * -1)
-            WHEN (apopen_doctype IN ('V', 'D')) THEN (apopen_amount - apopen_paid)
-            ELSE (apopen_amount - apopen_paid)
+       CASE WHEN (apopen_doctype='C') THEN ((apopen_amount - apapplied(apopen_id,<? value("asofDate") ?>)) * -1)
+            WHEN (apopen_doctype IN ('V', 'D')) THEN (apopen_amount - apapplied(apopen_id,<? value("asofDate") ?>))
+            ELSE (apopen_amount - apapplied(apopen_id,<? value("asofDate") ?>))
        END AS balance
   FROM apopen
- WHERE ((apopen_open)
+  WHERE ( (COALESCE(apopen_closedate,date <? value("asofDate") ?> + integer '1')><? value("asofDate") ?>)
+        AND   (apopen_docdate<=<? value("asofDate") ?>)
    AND (apopen_vend_id=<? value("vend_id") ?>)
-   AND (apopen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
+        AND   (apopen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+        AND   ((currtobase(apopen_curr_id,apopen_amount,<? value("asofDate") ?>) - apapplied(apopen_id,<? value("asofDate") ?>)) > 0))
 ORDER BY apopen_docdate;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: AROpenItems
 QUERY: detail
 SELECT aropen_id,
        aropen_doctype,
        aropen_docnumber,
        aropen_ordernumber,
        formatDate(aropen_docdate) AS f_docdate,
        formatDate(aropen_duedate) AS f_duedate,
        formatMoney(aropen_amount) AS f_amount,
        formatMoney(aropen_paid) AS f_paid,
        CASE WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney((aropen_amount - aropen_paid) * -1)
             WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(aropen_amount - aropen_paid)
             ELSE formatMoney(aropen_amount - aropen_paid)
        END AS f_balance,
        currToBase(aropen_curr_id,
            CASE WHEN (aropen_doctype IN ('C', 'R')) THEN ((aropen_amount - aropen_paid) * -1)
                 WHEN (aropen_doctype IN ('I', 'D')) THEN (aropen_amount - aropen_paid)
                 ELSE (aropen_amount - aropen_paid)
            END, CURRENT_DATE) AS base_balance,
-       currConcat(aropen_curr_id) AS currAbbr
-  FROM aropen
+       currConcat(aropen_curr_id) AS currAbbr,
+       cust_number, cust_name
+  FROM aropen LEFT OUTER JOIN custinfo ON (aropen_cust_id=cust_id)
  WHERE ((aropen_open)
    AND (aropen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
        )
 ORDER BY aropen_docnumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: AROpenItemsByCustomer
 QUERY: head
 SELECT cust_number,
        cust_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
-       formatDate(<? value("endDate") ?>, 'Latest') AS enddate
+       formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
+       formatDate(<? value("asofDate") ?>) AS asofDate
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
-       formatMoney(aropen_paid) AS f_paid,
-       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney((aropen_amount - aropen_paid) * -1)
-            WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(aropen_amount - aropen_paid)
-            ELSE formatMoney(aropen_amount - aropen_paid)
+       formatMoney(arapplied(aropen_id,<? value("asofDate") ?>)) AS f_paid,
+       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN formatMoney((aropen_amount - arapplied(aropen_id,<? value("asofDate") ?>) * -1))
+            WHEN (aropen_doctype IN ('I', 'D')) THEN formatMoney(aropen_amount - arapplied(aropen_id,<? value("asofDate") ?>))
+            ELSE formatMoney(aropen_amount - arapplied(aropen_id,<? value("asofDate") ?>))
        END AS f_balance,
-       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN ((aropen_amount - aropen_paid) * -1)
-            WHEN (aropen_doctype IN ('I', 'D')) THEN (aropen_amount - aropen_paid)
-            ELSE (aropen_amount - aropen_paid)
+       CASE WHEN (aropen_doctype IN ('C', 'R')) THEN ((aropen_amount - arapplied(aropen_id,<? value("asofDate") ?>)) * -1)
+            WHEN (aropen_doctype IN ('I', 'D')) THEN (aropen_amount - arapplied(aropen_id,<? value("asofDate") ?>))
+            ELSE (aropen_amount - arapplied(aropen_id,<? value("asofDate") ?>))
        END AS balance
   FROM aropen
- WHERE ((aropen_open)
+  WHERE ( (COALESCE(aropen_closedate,date <? value("asofDate") ?> + integer '1')><? value("asofDate") ?>)
+        AND   (aropen_docdate<=<? value("asofDate") ?>)
    AND (aropen_cust_id=<? value("cust_id") ?>)
    AND (aropen_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-       )
+        AND   ((currtobase(aropen_curr_id,aropen_amount,<? value("asofDate") ?>) - arapplied(aropen_id,<? value("asofDate") ?>)) > 0))
 ORDER BY aropen_docdate;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: AccountNumberMasterList
 QUERY: detail
 select accnt_company,
        accnt_profit,
        accnt_number,
        accnt_sub,
        accnt_descrip,
        accnt_comments,
        CASE WHEN(accnt_type='A') THEN text('Asset')
             WHEN(accnt_type='L') THEN text('Liability')
             WHEN(accnt_type='E') THEN text('Expense')
             WHEN(accnt_type='R') THEN text('Revenue')
             WHEN(accnt_type='Q') THEN text('Equity')
             ELSE text(accnt_type)
        END AS f_type
   from accnt
-order by accnt_number;
+ORDER BY accnt_number, accnt_sub, accnt_profit;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: BacklogByCustomer
 QUERY: detail
 SELECT cohead_number, coitem_linenumber,
        formatDate(cohead_orderdate) AS f_orderdate,
        formatDate(coitem_scheddate) AS f_scheddate,
-       item_number, item_invuom,
+       item_number, uom_name,
        item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS f_qtyord,
        formatQty(coitem_qtyshipped) AS f_qtyship,
        formatPrice(coitem_price) AS f_unitprice,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS f_balance,
        <? if exists("showPrices") ?>
-         formatMoney(round(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * (coitem_price / item_invpricerat),2))
+         formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2))
        <? else ?>
          text('')
        <? endif ?>
        AS f_amount,
        <? if exists("showPrices") ?>
-         round(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * (coitem_price / item_invpricerat),2)
+         round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2)
        <? else ?>
          0
        <? endif ?>
        AS backlog,
        <? if exists("showPrices") ?>
-         round(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * (coitem_price / item_invpricerat),2)
+         round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2)
        <? else ?>
          0
        <? endif ?>
        AS total_backlog
-FROM cohead, coitem, itemsite, item
+FROM cohead, coitem, itemsite, item, uom_name
 WHERE ((coitem_cohead_id=cohead_id)
  AND (coitem_itemsite_id=itemsite_id)
  AND (itemsite_item_id=item_id)
+ AND (item_inv_uom_id=uom_id)
  AND (coitem_status NOT IN ('C','X'))
  AND (cohead_cust_id=<? value("cust_id") ?>)
  AND (coitem_scheddate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY coitem_scheddate, cohead_number, coitem_linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: BacklogByItemNumber
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (SELECT warehous_code
             FROM warehous
            WHERE (warehous_id=<? value("warehous_id") ?>))
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse,
        <? if exists("showPrices") ?>
          text('$ Amount')
        <? else ?>
          text('')
        <? endif ?>
        AS lbl_amount
-FROM item
+FROM item JOIN uom ON (item_inv_uom_id=uom_id)
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
-         formatMoney(round(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * (coitem_price / item_invpricerat),2))
+         formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2))
        <? else ?>
          ''
        <? endif ?>
        AS f_ammount,
-       round(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * (coitem_price / item_invpricerat),2) AS backlog
+       round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2) AS backlog
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


 --------------------------------------------------------------------
 REPORT: BacklogByParameterList
 QUERY: detail
 SELECT cohead_number, coitem_linenumber, cust_name,
        formatDate(cohead_orderdate) AS f_orderdate,
        formatDate(coitem_scheddate) AS f_scheddate,
-       item_number, item_invuom,
+       item_number, uom_name,
        item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS f_qtyord,
        formatQty(coitem_qtyshipped) AS f_qtyship,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS f_balance,
        <? if exists("showPrices") ?>
-         formatMoney(round(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * (coitem_price / item_invpricerat),2))
+         formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2))
        <? else ?>
          text('')
        <? endif ?>
        AS f_ammount,
-       round(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * (coitem_price / item_invpricerat),2) AS backlog
-  FROM cohead, coitem, itemsite, item, cust
+       round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio),2) AS backlog
+  FROM cohead, coitem, itemsite, item, cust, uom
  WHERE ((coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
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


 --------------------------------------------------------------------
 REPORT: BacklogBySalesOrder
 QUERY: detail
 SELECT coitem_id, itemsite_id,
        coitem_linenumber, item_number,
-       item_descrip1, item_descrip2, item_invuom, warehous_code,
+       item_descrip1, item_descrip2, uom_name, warehous_code,
        formatQty(coitem_qtyord) AS f_ordered,
        formatQty(coitem_qtyshipped) AS f_shipped,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS f_balance,
        formatQty(atshipping) AS f_atshipping,
        formatQty(available) AS f_available
 FROM ( SELECT coitem_id, itemsite_id, coitem_linenumber, item_number,
-              item_descrip1, item_descrip2, item_invuom, warehous_code,
+              item_descrip1, item_descrip2, uom_name, warehous_code,
               coitem_qtyord, coitem_qtyshipped, coitem_qtyreturned,
               SUM(coship_qty) AS atshipping,
               CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel,
               qtyAvailable(itemsite_id, coitem_scheddate) AS available
-       FROM itemsite, item, warehous,
+       FROM itemsite, item, uom, warehous,
             coitem LEFT OUTER JOIN
             ( coship JOIN
               cosmisc ON ( (coship_cosmisc_id=cosmisc_id) AND (NOT cosmisc_shipped) )
             ) ON (coship_coitem_id=coitem_id)
        WHERE ((coitem_itemsite_id=itemsite_id)
         AND (coitem_status <> 'X')
         AND (itemsite_item_id=item_id)
+        AND (item_inv_uom_id=uom_id)
         AND (itemsite_warehous_id=warehous_id)
         AND (coitem_cohead_id=<? value("sohead_id") ?>))
        GROUP BY coitem_id, itemsite_id, coitem_linenumber, item_number,
-                item_descrip1, item_descrip2, item_invuom, warehous_code,
+                item_descrip1, item_descrip2, uom_name, warehous_code,
                 coitem_qtyord, coitem_qtyshipped, coitem_qtyreturned,
                 reorderlevel, coitem_scheddate
        ORDER BY coitem_linenumber ) AS data;
 --------------------------------------------------------------------


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
-       '' 				AS item_invuom,
+       '' 				AS iteminvuom,
        '' 				AS qtytobill,
        '' 				AS price,
        '' 				AS extprice,
        0			        AS subextprice,
        0			        AS runningextprice,
        COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                    FROM accnt
                    WHERE (accnt_id=findARAccount(cust_id)) ), 'Not Assigned') AS debit,
        '' AS credit
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
-       '' 				AS item_invuom,
+       '' 				AS iteminvuom,
        '' 				AS qtytobill,
        formatExtPrice(cobmisc_freight) 	AS price,
        formatExtPrice(cobmisc_freight) 	AS extprice,
        cobmisc_freight			AS subextprice,
        cobmisc_freight			AS runningextprice,
        '' AS debit,
        (formatGLAccount(freight.accnt_id) || ' - ' || freight.accnt_descrip) 	AS credit
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
-	'' 									AS item_invuom,
+	'' 									AS iteminvuom,
         '' 									AS qtytobill,
         formatExtPrice(cobmisc_misc) 						AS price,
         formatExtPrice(cobmisc_misc) 						AS extprice,
 	cobmisc_misc								AS subextprice,
 	cobmisc_misc								AS runningextprice,
        '' AS debit,
         (formatGLAccount(misc.accnt_id) || ' - ' || misc.accnt_descrip) 	AS credit
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
-	''						 			AS item_invuom,
+	''						 			AS iteminvuom,
         '' 									AS qtytobill,
         formatExtPrice(cobmisc_tax) 						AS price,
         formatExtPrice(cobmisc_tax) 						AS extprice,
 	cobmisc_tax								AS subextprice,
 	cobmisc_tax								AS runningextprice,
        '' AS debit,
         (formatGLAccount(taxaccnt.accnt_id) || ' - ' || taxaccnt.accnt_descrip) AS credit
 FROM cobmisc, cohead, accnt AS taxaccnt, tax
 WHERE ( (cobmisc_cohead_id=cohead_id)
  AND (tax_sales_accnt_id=taxaccnt.accnt_id)
  AND (cohead_tax_id=tax_id)
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
-	item_invuom,
+	uom_name AS iteminvuom,
         formatQty(cobill_qty) 							AS qtytobill,
         formatPrice(coitem_price) 						AS price,
-        formatExtPrice(cobill_qty * (coitem_price / item_invpricerat)) 		AS extprice,
-	(cobill_qty * (coitem_price / item_invpricerat))			AS subextprice,
-	(cobill_qty * (coitem_price / item_invpricerat))			AS runningextprice,
+        formatExtPrice((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) 		AS extprice,
+	((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio))			AS subextprice,
+	((cobill_qty * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio))			AS runningextprice,
         '' AS debit,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt, salesaccnt
                     WHERE ((salesaccnt_sales_accnt_id=accnt_id)
                      AND (salesaccnt_id=findSalesAccnt(itemsite_id, cohead_cust_id)))), 'Not Assigned') AS credit
-FROM item, itemsite, cobmisc, cohead, cobill, coitem
+FROM item, itemsite, cobmisc, cohead, cobill, coitem, uom
 WHERE ( (coitem_itemsite_id=itemsite_id)
  AND (cobill_coitem_id=coitem_id)
  AND (cobill_cobmisc_id=cobmisc_id)
  AND (cobmisc_cohead_id=cohead_id)
  AND (itemsite_item_id=item_id)
+ AND (item_inv_uom_id=uom_id)
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
-	'' 						AS item_invuom,
+	'' 						AS iteminvuom,
         '' 						AS qtytobill,
         '' 						AS price,
         '' 						AS extprice,
 	0						AS subextprice,
 	0						AS runningextprice,
         '' AS debit,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt
                     WHERE (accnt_id=findARAccount(cmhead_cust_id)) ), 'Not Assigned') AS credit
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
-	'' 									AS item_invuom,
+	'' 									AS iteminvuom,
         '' 									AS qtytobill,
         formatExtPrice(cmhead_freight) 						AS price,
         formatExtPrice(cmhead_freight) 						AS extprice,
 	(cmhead_freight * -1)							AS subextprice,
 	(cmhead_freight * -1)							AS runningextprice,
         (formatGLAccount(freight.accnt_id) || ' - ' || freight.accnt_descrip) 	AS credit,
         '' AS debit
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
-	item_invuom,
+	iteminvuom,
         formatQty(cmitem_qtycredit) 						AS qtytobill,
         formatPrice(cmitem_unitprice) 						AS price,
-        formatExtPrice(cmitem_qtycredit * (cmitem_unitprice / item_invpricerat)) 	AS extprice,
-	(cmitem_qtycredit * (cmitem_unitprice / item_invpricerat) * -1)			AS subextprice,
-	(cmitem_qtycredit * (cmitem_unitprice / item_invpricerat) * -1)			AS runningextprice,
+        formatExtPrice((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio)) 	AS extprice,
+	((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio) * -1)			AS subextprice,
+	((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio) * -1)			AS runningextprice,
         COALESCE( ( SELECT (formatGLAccount(accnt_id) || ' - ' || accnt_descrip)
                     FROM accnt, salesaccnt
                     WHERE ((salesaccnt_sales_accnt_id=accnt_id)
                      AND (salesaccnt_id=findSalesAccnt(itemsite_id, cmhead_cust_id)))), 'Not Assigned') AS credit,
         '' AS debit
-FROM item, itemsite, cmhead, cmitem
+FROM item, itemsite, cmhead, cmitem, uom
 WHERE ( (cmitem_itemsite_id=itemsite_id)
  AND (cmitem_cmhead_id=cmhead_id)
  AND (itemsite_item_id=item_id)
+ AND (item_inv_uom_id=uom_id)
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


 --------------------------------------------------------------------
 REPORT: BookingsByCustomer
 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        item_number, item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
        formatPrice(coitem_price) AS unitprice,
-       formatExtPrice(coitem_qtyord * (coitem_price / item_invpricerat)) AS f_extprice
+       formatExtPrice((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS f_extprice
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


 --------------------------------------------------------------------
 REPORT: BookingsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse
-  FROM item
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------

 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        cust_number, cust_name,
        formatQty(coitem_qtyord) AS ordered,
        formatPrice(coitem_price) AS unitprice,
-       formatExtPrice(coitem_qtyord * (coitem_price / item_invpricerat)) AS f_extprice
+       formatExtPrice((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS f_extprice
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


 --------------------------------------------------------------------
 REPORT: BookingsByProductCategory
 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        cust_number, cust_name,
        item_number, item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
        formatPrice(coitem_price) AS unitprice,
-       formatExtPrice(coitem_qtyord * (coitem_price / item_invpricerat)) AS f_extprice
+       formatExtPrice((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS f_extprice
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


 --------------------------------------------------------------------
 REPORT: BookingsBySalesRep
 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        cust_number, cust_name,
        item_number, item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
        formatPrice(coitem_price) AS unitprice,
-       formatExtPrice(coitem_qtyord * (coitem_price / item_invpricerat)) AS f_extprice
+       formatExtPrice((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS f_extprice
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


 --------------------------------------------------------------------
 REPORT: BookingsByShipTo
 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        item_number, item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
        formatPrice(coitem_price) AS unitprice,
-       formatExtPrice(coitem_qtyord * (coitem_price / item_invpricerat)) AS f_extprice
+       formatExtPrice((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio)) AS f_extprice
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


 --------------------------------------------------------------------
 REPORT: CapacityUOMsByClassCode
 QUERY: detail
 SELECT classcode_code,
        item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
-       item_capuom,
-       formatRatio(item_capinvrat) AS capratio,
-       item_altcapuom,
-       formatRatio(item_altcapinvrat) AS altcapratio,
+       uom_name,
+       itemcapuom(item_id) AS capuom,
+       formatRatio(itemcapinvrat(item_id)) AS capratio,
+       itemaltcapuom(item_id) altcapuom,
+       formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
        item_shipuom,
-       formatRatio(item_shipinvrat) AS shipratio
-  FROM item, classcode
+       formatRatio(iteminvpricerat(item_id)) AS shipratio
+  FROM item, classcode, uom
  WHERE ((item_classcode_id=classcode_id)
+   AND (item_inv_uom_id=uom_id)
 <? if exists("classcode_id") ?>
    AND (classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (classcode_code ~ <? value("classcode_pattern") ?>)
 <? endif ?>
 )
 ORDER BY classcode_code, item_number;

 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: CapacityUOMsByProductCategory
 QUERY: detail
 SELECT prodcat_code,
        item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
-       item_capuom,
-       formatRatio(item_capinvrat) AS capratio,
-       item_altcapuom,
-       formatRatio(item_altcapinvrat) AS altcapratio,
+       uom_name,
+       itemcapuom(item_id) AS capuom,
+       formatRatio(itemcapinvrat(item_id)) AS capratio,
+       itemaltcapuom(item_id) AS altcapuom,
+       formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
        item_shipuom,
        formatRatio(item_shipinvrat) AS shipratio
-  FROM item, prodcat
+  FROM item, prodcat, uom
  WHERE ((item_sold)
+   AND (item_inv_uom_id=uom_id)
    AND (item_prodcat_id=prodcat_id)
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
 )
 ORDER BY prodcat_code, item_number;

 --------------------------------------------------------------------

 --------------------------------------------------------------------
 REPORT: CheckJournal
 QUERY: detail
-SELECT vend_name,
-       apchk_number,
-       formatDate(apchk_checkdate) AS f_checkdate,
-       formatMoney(apchk_amount) AS f_amount,
-       apchk_amount
-  FROM vend, apchk
- WHERE ((apchk_vend_id=vend_id)
-   AND (apchk_journalnumber=<? value("journalNumber") ?>) )
-ORDER BY apchk_number;
+SELECT checkrecip_name,
+       checkhead_number,
+       formatDate(checkhead_checkdate) AS f_checkdate,
+       formatMoney(checkhead_amount) AS f_amount,
+       checkhead_amount
+  FROM checkhead, checkrecip
+ WHERE ((checkhead_recip_id=checkrecip_id)
+   AND  (checkhead_recip_type=checkrecip_type)
+   AND  (checkhead_journalnumber=<? value("journalNumber") ?>) )
+ORDER BY checkhead_number;

 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: CheckRegister
 QUERY: detail
-SELECT apchk_id AS apchkid,
-       formatBoolYN(apchk_void) AS f_void,
-       formatBoolYN(apchk_misc) AS f_misc,
-       formatBoolYN(apchk_printed) AS f_printed,
-       formatBoolYN(apchk_posted) AS f_posted,
-       TEXT(apchk_number) AS number,
-       (vend_number || '-' || vend_name) AS description,
-       formatDate(apchk_checkdate) AS f_checkdate,
-       currToCurr(apchk_curr_id, bankaccnt_curr_id, apchk_amount, apchk_checkdate) AS apchk_amount_bankcurr,
-       formatMoney(apchk_amount) AS f_amount,
+SELECT checkhead_id AS checkheadid,
+       formatBoolYN(checkhead_void) AS f_void,
+       formatBoolYN(checkhead_misc) AS f_misc,
+       formatBoolYN(checkhead_printed) AS f_printed,
+       formatBoolYN(checkhead_posted) AS f_posted,
+       TEXT(checkhead_number) AS number,
+       (checkrrecip_number || '-' || checkrrecip_name) AS description,
+       formatDate(checkhead_checkdate) AS f_checkdate,
+       currToCurr(checkhead_curr_id, bankaccnt_curr_id, checkhead_amount, checkhead_checkdate) AS checkhead_amount_bankcurr,
+       formatMoney(checkhead_amount) AS f_amount,
        curr_symbol as currAbbr
-  FROM apchk, vend, curr_symbol, bankaccnt
- WHERE ( (apchk_vend_id=vend_id)
-   AND   (apchk_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-   AND   (apchk_bankaccnt_id=<? value("bankaccnt_id") ?>)
-   AND   (apchk_bankaccnt_id=bankaccnt_id)
-   AND   (apchk_curr_id = curr_id) )
-ORDER BY apchk_number
+  FROM checkhead, checkrecip, curr_symbol, bankaccnt
+ WHERE ( (checkhead_recip_id=checkrecip_id)
+   AND   (checkhead_recip_type=checkrecip_type)
+   AND   (checkhead_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
+   AND   (checkhead_bankaccnt_id=bankaccnt_id)
+   AND   (checkhead_curr_id = curr_id) )
+ORDER BY checkhead_number
 --------------------------------------------------------------------

 QUERY: total
-SELECT formatMoney(SUM(currToCurr(apchk_curr_id, bankaccnt_curr_id, apchk_amount, apchk_checkdate))) AS f_amount,
+SELECT formatMoney(SUM(currToCurr(checkhead_curr_id, bankaccnt_curr_id, checkhead_amount, checkhead_checkdate))) AS f_amount,
        currConcat(bankaccnt_curr_id) AS currAbbr
-  FROM apchk, vend, bankaccnt
- WHERE ( (apchk_vend_id=vend_id)
-   AND   (NOT apchk_void)
-   AND   (apchk_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-   AND   (apchk_bankaccnt_id=bankaccnt_id)
-   AND   (apchk_bankaccnt_id=<? value("bankaccnt_id") ?>) )
+  FROM checkhead, checkrecip, bankaccnt
+ WHERE ( (checkhead_recip_id=checkrecip_id)
+   AND   (checkhead_recip_type=checkrecip_type)
+   AND   (NOT checkhead_void)
+   AND   (checkhead_checkdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
+   AND   (checkhead_bankaccnt_id=bankaccnt_id)
+   AND   (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>) )
 GROUP BY bankaccnt_curr_id;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: CostCategoriesMasterList
 QUERY: detail
 SELECT costcat_code, costcat_descrip,
-       CASE WHEN (costcat_asset_accnt_id IS NOT NULL) THEN (select (accnt_number || ' - ' || accnt_descrip) from accnt where accnt_id=costcat_asset_accnt_id) ELSE '' END AS asset,
-       CASE WHEN (costcat_wip_accnt_id IS NOT NULL) THEN (select (accnt_number || ' - ' || accnt_descrip) from accnt where accnt_id=costcat_wip_accnt_id) ELSE '' END AS wip,
-       CASE WHEN (costcat_invcost_accnt_id IS NOT NULL) THEN (select (accnt_number || ' - ' || accnt_descrip) from accnt where accnt_id=costcat_invcost_accnt_id) ELSE '' END AS invcost,
-       CASE WHEN (costcat_matusage_accnt_id IS NOT NULL) THEN (select (accnt_number || ' - ' || accnt_descrip) from accnt where accnt_id=costcat_matusage_accnt_id) ELSE '' END AS matusage,
-       CASE WHEN (costcat_purchprice_accnt_id IS NOT NULL) THEN (select (accnt_number || ' - ' || accnt_descrip) from accnt where accnt_id=costcat_purchprice_accnt_id) ELSE '' END AS purchprice,
-       CASE WHEN (costcat_adjustment_accnt_id IS NOT NULL) THEN (select (accnt_number || ' - ' || accnt_descrip) from accnt where accnt_id=costcat_adjustment_accnt_id) ELSE '' END AS adjustment,
-       CASE WHEN (costcat_scrap_accnt_id IS NOT NULL) THEN (select (accnt_number || ' - ' || accnt_descrip) from accnt where accnt_id=costcat_scrap_accnt_id) ELSE '' END AS scrap,
-       CASE WHEN (costcat_laboroverhead_accnt_id IS NOT NULL) THEN (select (accnt_number || ' - ' || accnt_descrip) from accnt where accnt_id=costcat_laboroverhead_accnt_id) ELSE '' END AS laboroverhead,
-       CASE WHEN (costcat_liability_accnt_id IS NOT NULL) THEN (select (accnt_number || ' - ' || accnt_descrip) from accnt where accnt_id=costcat_liability_accnt_id) ELSE '' END AS liability
+       CASE WHEN (costcat_asset_accnt_id IS NOT NULL)      THEN formatGlAccountLong(costcat_asset_accnt_id)         ELSE '' END AS asset,
+       CASE WHEN (costcat_wip_accnt_id IS NOT NULL)        THEN formatGlAccountLong(costcat_wip_accnt_id)           ELSE '' END AS wip,
+       CASE WHEN (costcat_invcost_accnt_id IS NOT NULL)    THEN formatGlAccountLong(costcat_invcost_accnt_id)       ELSE '' END AS invcost,
+       CASE WHEN (costcat_purchprice_accnt_id IS NOT NULL) THEN formatGlAccountLong(costcat_purchprice_accnt_id)    ELSE '' END AS purchprice,
+       CASE WHEN (costcat_adjustment_accnt_id IS NOT NULL) THEN formatGlAccountLong(costcat_adjustment_accnt_id)    ELSE '' END AS adjustment,
+       CASE WHEN (costcat_scrap_accnt_id IS NOT NULL)      THEN formatGlAccountLong(costcat_scrap_accnt_id)         ELSE '' END AS scrap,
+       CASE WHEN fetchMetricBool('Routings')               THEN 'Labor and Overhead Costs:'                         ELSE '' END AS laboroverheadLit,
+       CASE WHEN (fetchMetricBool('Routings') AND
+              costcat_laboroverhead_accnt_id IS NOT NULL)  THEN formatGlAccountLong(costcat_laboroverhead_accnt_id) ELSE '' END AS laboroverhead,
+       CASE WHEN (costcat_liability_accnt_id IS NOT NULL)  THEN formatGlAccountLong(costcat_liability_accnt_id)     ELSE '' END AS liability,
+       CASE WHEN fetchMetricBool('MultiWhs')               THEN 'Transfer Order Liability Clearing:'                ELSE '' END AS toliabilityLit,
+       CASE WHEN (fetchMetricBool('MultiWhs') AND
+                costcat_toliability_accnt_id IS NOT NULL)  THEN formatGlAccountLong(costcat_toliability_accnt_id)   ELSE '' END AS toliability,
+       CASE WHEN fetchMetricBool('Transforms')             THEN 'Transform Clearing:'                               ELSE '' END AS transformLit,
+       CASE WHEN (fetchMetricBool('Transforms') AND
+                 costcat_transform_accnt_id IS NOT NULL)   THEN formatGlAccountLong(costcat_transform_accnt_id)     ELSE '' END AS transform
   FROM costcat
 ORDER BY costcat_code;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: CostedIndentedBOM
 QUERY: detail
-select (REPEAT(' ',(bomwork_level-1)*3) || bomwork_seqnumber) AS f_seqnumber,
-       bomworkSequence(bomwork_id) AS seq_ord,
-       item_number,
-       item_invuom,
-       item_descrip1,
-       item_descrip2,
-       formatBoolYN(bomwork_createwo) as createchild,
-       CASE WHEN (bomwork_issuemethod='S') THEN 'Push'
-            WHEN (bomwork_issuemethod='L') THEN 'Pull'
-            WHEN (bomwork_issuemethod='M') THEN 'Mixed'
-            ELSE 'Special'
-       END AS issuemethod,
-       formatQtyPer(bomwork_qtyper) AS qtyper,
-       formatScrap(bomwork_scrap) AS scrap,
-       formatDate(bomwork_effective, 'Always') AS effective,
-       formatDate(bomwork_expires, 'Never') AS expires,
+select (REPEAT(' ',(bomdata_bomwork_level-1)*3) || bomdata_bomwork_seqnumber) AS f_seqnumber,
+       1 AS seq_ord,
+       bomdata_item_number AS item_number,
+       bomdata_uom_name AS item_invuom,
+       bomdata_item_descrip1 AS item_descrip1,
+       bomdata_item_descrip2 AS item_descrip2,
+       bomdata_createchild as createchild,
+       bomdata_issuemethod AS issuemethod,
+       bomdata_qtyper AS qtyper,
+       bomdata_scrap AS scrap,
+       bomdata_effective AS effective,
+       bomdata_expires AS expires,
 <? if exists("useActualCosts") ?>
-       formatCost(bomwork_actunitcost) AS f_unitcost,
-       formatCost(bomwork_qtyper * (1 + bomwork_scrap) * bomwork_actunitcost) AS f_extendedcost,
-       CASE WHEN(bomwork_parent_id=-1) THEN (bomwork_qtyper * (1 + bomwork_scrap) * bomwork_actunitcost)
+       formatCost(bomdata_actunitcost) AS f_unitcost,
+       formatCost(bomdata_actextendedcost) AS f_extendedcost,
+       CASE WHEN(bomdata_bomwork_parent_id=-1) THEN bomdata_actextendedcost
             ELSE 0
        END AS extendedcost,
 <? else ?>
-       formatCost(bomwork_stdunitcost) AS f_unitcost,
-       formatCost(bomwork_qtyper * (1 + bomwork_scrap) * bomwork_stdunitcost) AS f_extendedcost,
-       CASE WHEN(bomwork_parent_id=-1) THEN (bomwork_qtyper * (1 + bomwork_scrap) * bomwork_stdunitcost)
+       formatCost(bomdata_stdunitcost) AS f_unitcost,
+       formatCost(bomdata_stdextendedcost) AS f_extendedcost,
+       CASE WHEN(bomdata_bomwork_parent_id=-1) THEN bomdata_stdextendedcost
             ELSE 0
        END AS extendedcost,
 <? endif ?>
-       bomwork_level
-  FROM bomwork, item
- WHERE ((bomwork_item_id=item_id)
-   AND (bomwork_set_id=<? value("bomworkset_id") ?>)
-   AND (CURRENT_DATE BETWEEN bomwork_effective AND (bomwork_expires - 1)) )
+       bomdata_bomwork_level
+FROM indentedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,0,0)
+ORDER BY seq_ord;
+--------------------------------------------------------------------

-UNION SELECT '',
-             '' AS seq_ord, costelem_type AS item_number, '' AS item_invuom,
-             '' AS item_descrip1, '' AS item_descrip2,
-             '' AS createchild, '' AS issuemethod,
-             '' AS qtyper, '' AS scrap, '' AS effective, '' AS expires,
-<? if exists("useActualCosts") ?>
-             formatCost(itemcost_actcost) AS f_unitcost,
-             formatCost(itemcost_actcost) AS f_extendedcost,
-             itemcost_actcost AS extendedcost,
-<? else ?>
-             formatCost(itemcost_stdcost) AS f_unitcost,
-             formatCost(itemcost_stdcost) AS f_extendedcost,
-             itemcost_stdcost AS extendedcost,
-<? endif ?>
-             -1 AS bomwork_level
-        FROM itemcost, costelem
-       WHERE ((itemcost_costelem_id=costelem_id)
-          AND (NOT itemcost_lowlevel)
-          AND (itemcost_item_id=<? value("item_id") ?>))
-ORDER BY seq_ord, item_number;

--------------------------------------------------------------------

QUERY: bomhead
SELECT bomhead_docnum, bomhead_revision,
formatDate(bomhead_revisiondate) AS f_revisiondate
FROM bomhead
WHERE ((bomhead_item_id=<? value("item_id") ?>)
AND (bomhead_rev_id=<? value("revision_id") ?>));
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: CostedSingleLevelBOM
 QUERY: detail
-SELECT bomitem_seqnumber AS orderby,
-       text(bomitem_seqnumber) AS seqnumber,
-       item_number,
-       item_invuom,
-       item_descrip1,
-       item_descrip2,
-       formatBoolYN(bomitem_createwo) AS createchild,
-       CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
-            WHEN (bomitem_issuemethod='L') THEN 'Pull'
-            WHEN (bomitem_issuemethod='M') THEN 'Mixed'
-            ELSE 'Special'
-       END AS issuemethod,
-       formatQtyPer(bomitem_qtyper) AS qtyper,
-       formatScrap(bomitem_scrap) AS scrap,
-       formatQtyPer(bomitem_qtyper * (1 + bomitem_scrap)) AS qtyreq,
-       formatDate(bomitem_effective, 'Always') AS effective,
-       formatDate(bomitem_expires, 'Never') AS expires,
-       <? if exists("useActualCosts") ?>
-         formatCost(actcost(bomitem_item_id))
-       <? else ?>
-         formatCost(stdcost(bomitem_item_id))
-       <? endif ?>
+SELECT bomdata_bomwork_seqnumber AS orderby,
+  CASE WHEN bomdata_bomwork_seqnumber > 0 THEN
+    text(bomdata_bomwork_seqnumber)
+  ELSE NULL
+  END AS seqnumber,
+  bomdata_item_number AS item_number,
+  bomdata_uom_name AS item_invuom,
+  bomdata_item_descrip1 AS item_descrip1,
+  bomdata_item_descrip2 AS item_descrip2,
+  bomdata_issuemethod AS issuemethod,
+  bomdata_qtyper AS qtyper,
+  bomdata_scrap AS scrap,
+  formatqtyper(bomitem_qtyper * (1 + bomitem_scrap) * itemuomtouomratio(bomitem_item_id,bomitem_uom_id,item_inv_uom_id)) AS qtyreq,
+  bomdata_effective AS effective,
+  bomdata_expires AS expires,
+<? if exists("useActualCosts") ?>
+  formatCost(bomdata_actunitcost)
+<? else ?>
+  formatCost(bomdata_stdunitcost)
+<? endif ?>
        AS unitcost,
-       <? if exists("useActualCosts") ?>
-         formatCost((actcost(bomitem_item_id) * (bomitem_qtyper * (1 + bomitem_scrap))))
-       <? else ?>
-         formatCost((stdcost(bomitem_item_id) * (bomitem_qtyper * (1 + bomitem_scrap))))
-       <? endif ?>
+<? if exists("useActualCosts") ?>
+  formatCost(bomdata_actextendedcost)
+<? else ?>
+  formatCost(bomdata_stdextendedcost)
+<? endif ?>
        AS extcost
-  FROM bomitem, item
- WHERE ( (bomitem_item_id=item_id)
-   AND (bomitem_parent_item_id=<? value("item_id") ?>)
-   AND (CURRENT_DATE BETWEEN bomitem_effective and (bomitem_expires - 1))
-)
-UNION
-SELECT 0 AS orderby,
-       '' AS seqnumber,
-       costelem_type AS item_number,
-       '' AS item_invuom,
-       '' AS item_descrip1,
-       '' AS item_descrip2,
-       '' AS createchild,
-       '' AS issuemethod,
-       '' AS qtyper,
-       '' AS scrap,
-       '' AS qtyreq,
-       '' AS effective,
-       '' AS expires,
-       <? if exists("useActualCosts") ?>
-         formatCost(itemcost_actcost)
-       <? else ?>
-         formatCost(itemcost_stdcost)
-       <? endif ?>
-       AS unitcost,
-       <? if exists("useActualCosts") ?>
-         formatCost(itemcost_actcost)
-       <? else ?>
-         formatCost(itemcost_stdcost)
-       <? endif ?>
-       AS extcost
-  FROM itemcost, costelem
- WHERE ( (itemcost_costelem_id=costelem_id)
-   AND (NOT itemcost_lowlevel)
-   AND (itemcost_item_id=<? value("item_id") ?>)
-)
+FROM singlelevelbom(<? value("item_id") ?>,<? value("revision_id") ?>,0,0)
+  LEFT OUTER JOIN bomitem ON (bomdata_bomitem_id=bomitem_id),
+  item
+WHERE (bomitem_item_id=item_id)
 ORDER BY orderby;

 --------------------------------------------------------------------

QUERY: bomhead
SELECT bomhead_docnum, bomhead_revision,
formatDate(bomhead_revisiondate) AS f_revisiondate
FROM bomhead
WHERE ((bomhead_item_id=<? value("item_id") ?>)
AND (bomhead_rev_id=<? value("revision_id") ?>));
--------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: CostedSummarizedBOM
 QUERY: detail
-select item_number,
-       item_invuom,
-       item_descrip1,
-       item_descrip2,
-       formatQtyPer(SUM(bomwork_qtyper * (1 + bomwork_scrap))) AS qtyper,
+select bomdata_item_number AS item_number,
+       bomdata_uom_name AS item_invuom,
+       bomdata_item_descrip1 AS item_descrip1,
+       bomdata_item_descrip2 AS item_descrip2,
+       bomdata_qtyper AS qtyper,
 <? if exists("useActualCosts") ?>
-       formatCost(actCost(item_id)) AS f_cost,
-       formatCost(actCost(item_id) * SUM(bomwork_qtyper * (1 + bomwork_scrap))) AS f_extcost
-<? else ?>
-       formatCost(stdCost(item_id)) AS f_cost,
-       formatCost(stdCost(item_id) * SUM(bomwork_qtyper * (1 + bomwork_scrap))) AS f_extcost
-<? endif ?>
-  FROM bomwork, item
- WHERE ((bomwork_item_id=item_id)
-   AND (bomwork_set_id=<? value("bomworkset_id") ?>)
-<? if exists("expiredDays") ?>
-   AND (bomwork_expires > (CURRENT_DATE - <? value("expiredDays") ?>))
-<? else ?>
-   AND (bomwork_expires > CURRENT_DATE)
-<? endif ?>
-<? if exists("futureDays") ?>
-   AND (bomwork_effective <= (CURRENT_DATE + <? value("futureDays") ?>))
+       formatCost(bomdata_actunitcost) AS f_cost,
+       formatCost(bomdata_actextendedcost) AS f_extcost
 <? else ?>
-   AND (bomwork_effective <= CURRENT_DATE)
+       formatCost(bomdata_stdunitcost) AS f_cost,
+       formatCost(bomdata_stdextendedcost) AS f_extcost
 <? endif ?>
- )
-GROUP BY item_number, item_invuom,
-         item_descrip1, item_descrip2, item_id
-ORDER BY item_number;
+  FROM summarizedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,<? value("expiredDays") ?>,<? value("futureDays") ?>);
--------------------------------------------------------------------

QUERY: bomhead
SELECT bomhead_docnum, bomhead_revision,
formatDate(bomhead_revisiondate) AS f_revisiondate
FROM bomhead
WHERE ((bomhead_item_id=<? value("item_id") ?>)
AND (bomhead_rev_id=<? value("revision_id") ?>));
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: CreditMemo
 QUERY: Detail
 SELECT cmitem_linenumber,
        formatQty(cmitem_qtycredit) AS qtycredit,
        formatQty(cmitem_qtyreturned) AS qtyreturned,
-       item_invuom,
+       uom_name,
        item_number,
        item_descrip1,
        item_descrip2,
        formatSalesPrice(cmitem_unitprice) AS unitprice,
-       formatMoney(cmitem_qtycredit * cmitem_unitprice / item_invpricerat) AS extprice,
+       formatMoney((cmitem_qtycredit * cmitem_qty_invuomratio) * (cmitem_unitprice / cmitem_price_invuomratio)) AS extprice,
        cmitem_comments
-  FROM cmitem, itemsite, item
+  FROM cmitem, itemsite, item, uom
  WHERE ((cmitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (cmitem_cmhead_id=%1))
 ORDER BY cmitem_linenumber;
 --------------------------------------------------------------------

 QUERY: GroupFoot
-SELECT formatExtPrice(SUM(cmitem_unitprice * cmitem_qtycredit / item_invpricerat)) AS extprice
+SELECT formatExtPrice(SUM((cmitem_qtycredit * cmitem_qty_invuomratio) * cmitem_unitprice / cmitem_price_invuomratio)) AS extprice
   FROM cmhead, cmitem, itemsite, item
  WHERE ((cmitem_cmhead_id=cmhead_id)
    AND (cmitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (cmhead_id=%1));
 --------------------------------------------------------------------

 QUERY: GroupExtended
 SELECT formatExtPrice(COALESCE(cmhead_freight,0.0) + COALESCE(cmhead_tax,0.0) + COALESCE(cmhead_misc,0.0) +
-         ( SELECT COALESCE(SUM(cmitem_unitprice * cmitem_qtycredit / item_invpricerat), 0.0)
+         ( SELECT COALESCE(SUM((cmitem_qtycredit * cmitem_qty_invuomratio) * cmitem_unitprice / cmitem_price_invuomratio), 0.0)
              FROM cmitem, itemsite, item
             WHERE ((cmitem_cmhead_id=%1)
               AND (cmitem_itemsite_id=itemsite_id)
               AND (itemsite_item_id=item_id)
              )
            )
          ) AS totaldue,
        formatExtPrice(COALESCE(cmhead_freight,0.0)) AS freight,
        formatExtPrice(COALESCE(cmhead_tax,0.0)) AS tax,
        formatExtPrice(COALESCE(cmhead_misc,0.0)) AS misc
   FROM cmhead
  WHERE (cmhead_id=%1);
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: CreditMemoEditList
 QUERY: detail
 SELECT orderid,
        itemid,
        documentnumber,
        CASE WHEN(documentnumber='') THEN item
             ELSE cust_number
        END AS name,
        CASE WHEN(documentnumber='') THEN itemdescrip
             ELSE billtoname
        END AS descrip,
        ordernumber,
        linenumber,
-       item_invuom,
+       iteminvuom,
        qtytobill,
        price,
        extprice,
        sence,
        account
   FROM creditMemoEditList
 ORDER BY ordernumber, linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT:
 QUERY: Detail
 SELECT cmitem_linenumber,
           formatQty(cmitem_qtycredit) AS qtycredit,
           formatQty(cmitem_qtyreturned) AS qtyreturned,
-          item_invuom, item_number, item_descrip1, item_descrip2,
+          uom_name, item_number, item_descrip1, item_descrip2,
           formatPrice(cmitem_unitprice) AS unitprice,
-          formatExtPrice(cmitem_unitprice * cmitem_qtycredit) AS extprice
-         FROM cmitem, itemsite, item
+          formatExtPrice((cmitem_unitprice / cmitem_price_invuomratio) * (cmitem_qtycredit * cmitem_qty_invuomratio)) AS extprice
+         FROM cmitem, itemsite, item, uom
          WHERE ((cmitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
+          AND (item_inv_uom_id=uom_id)
           AND (cmitem_cmhead_id=%1))
          ORDER BY cmitem_linenumber;
 --------------------------------------------------------------------

 QUERY: GroupFoot
-SELECT formatExtPrice(SUM(cmitem_unitprice * cmitem_qtycredit)) AS extprice,
+SELECT formatExtPrice(SUM((cmitem_unitprice / cmitem_price_invuomratio) * (cmitem_qtycredit * cmitem_qty_invuomratio))) AS extprice,
           formatExtPrice(cmhead_freight) AS freight
          FROM cmhead, cmitem
          WHERE ((cmitem_cmhead_id=cmhead_id)
           AND (cmhead_id=%1))
          GROUP BY cmhead_id, freight;
 --------------------------------------------------------------------

 QUERY: GroupExtended
 SELECT formatExtPrice(cmhead_freight +
-          (SELECT COALESCE(SUM(cmitem_unitprice * cmitem_qtycredit), 0::numeric)
+          (SELECT COALESCE(SUM((cmitem_unitprice / cmitem_price_invuomratio) * (cmitem_qtycredit * cmitem_qty_invuomratio)), 0::numeric)
            FROM cmitem
            WHERE (cmitem_cmhead_id=%1))) AS totaldue
          FROM cmhead
          WHERE (cmhead_id=%1);
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT:
 QUERY: detail
-SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, item_invuom, roundUp(SUM(coship_qty) / item_shipinvrat)::integer AS shipqty,
+SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, uom_name, roundUp(SUM(coship_qty) / item_shipinvrat)::integer AS shipqty,
                 item_shipuom, item_number, item_descrip1, item_descrip2,
                 formatQty(SUM(coship_qty) * item_prodweight) AS netweight,
                 formatQty(SUM(coship_qty) * (item_prodweight + item_packweight)) AS grossweight
-         FROM coship, coitem, itemsite, item
+         FROM coship, coitem, itemsite, item, uom
          WHERE ((coship_coitem_id=coitem_id)
           AND (coitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
+          AND (item_inv_uom_id=uom_id)
           AND (coship_cosmisc_id=%1))
-         GROUP BY coitem_linenumber, item_number, item_invuom, item_shipinvrat, item_shipuom,
+         GROUP BY coitem_linenumber, item_number, uom_name, item_shipinvrat, item_shipuom,
                   item_descrip1, item_descrip2, item_prodweight, item_packweight
          ORDER BY coitem_linenumber;

 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: CustomerInformation
 QUERY: backlog
-SELECT formatMoney( COALESCE( SUM( noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) *                                   (coitem_price / item_invpricerat) ), 0 ) ) AS backlog FROM cohead, coitem, itemsite, item WHERE ( (coitem_cohead_id=cohead_id) AND (coitem_itemsite_id=itemsite_id) AND (itemsite_item_id=item_id) AND (coitem_status='O') AND (cohead_cust_id=<? value("cust_id") ?>) );
+SELECT formatMoney( COALESCE( SUM( (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * (coitem_price / coitem_price_invuomratio) ), 0 ) ) AS backlog FROM cohead, coitem, itemsite, item WHERE ( (coitem_cohead_id=cohead_id) AND (coitem_itemsite_id=itemsite_id) AND (itemsite_item_id=item_id) AND (coitem_status='O') AND (cohead_cust_id=<? value("cust_id") ?>) );
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: DeliveryDateVariancesByItem
 QUERY: head
 SELECT item_number, item_descrip1,
-       item_descrip2, item_invuom,
+       item_descrip2, uom_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername") ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername
-  FROM item
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------

 --------------------------------------------------------------------
 REPORT: ExpiredInventoryByClassCode
 QUERY: detail
 SELECT warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        itemloc_lotserial,
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
-                item_invuom,
+                uom_name,
                 itemloc_lotserial,
                 itemloc_qty,
                 itemloc_expiration,
                 <? if exists("useActualCosts") ?>
                   actcost(itemsite_item_id)
                 <? else ?>
                   stdcost(itemsite_item_id)
                 <? endif ?>
                 AS cost
-           FROM itemloc, itemsite, item, warehous
+           FROM itemloc, itemsite, item, warehous, uom
           WHERE ((itemloc_itemsite_id=itemsite_id)
             AND (itemsite_item_id=item_id)
+            AND (item_inv_uom_id=uom_id)
             AND (itemsite_warehous_id=warehous_id)
             AND (itemsite_perishable)
             AND (itemloc_expiration < (CURRENT_DATE + <? value("thresholdDays") ?>))
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


 --------------------------------------------------------------------
 REPORT: IndentedBOM
 QUERY: detail
-select (REPEAT(' ',(bomwork_level-1)*3) || bomwork_seqnumber) AS f_seqnumber,
-       bomworkSequence(bomwork_id) AS seq_ord,
-       item_number,
-       item_invuom,
-       item_descrip1,
-       item_descrip2,
-       formatBoolYN(bomwork_createwo) as createchild,
-       CASE WHEN (bomwork_issuemethod='S') THEN 'Push'
-            WHEN (bomwork_issuemethod='L') THEN 'Pull'
-            WHEN (bomwork_issuemethod='M') THEN 'Mixed'
-            ELSE 'Special'
-       END AS issuemethod,
-       formatQtyPer(bomwork_qtyper) AS qtyper,
-       formatScrap(bomwork_scrap) AS scrap,
-       formatDate(bomwork_effective, 'Always') AS effective,
-       formatDate(bomwork_expires, 'Never') AS expires
-  FROM bomwork, item
- WHERE ((bomwork_item_id=item_id)
-   AND (bomwork_set_id=<? value("bomworkset_id") ?>)
-<? if exists("expiredDays") ?>
-   AND (bomwork_expires > (CURRENT_DATE - <? value("expiredDays") ?>))
-<? else ?>
-   AND (bomwork_expires > CURRENT_DATE)
-<? endif ?>
-<? if exists("futureDays") ?>
-   AND (bomwork_effective <= (CURRENT_DATE + <? value("futureDays") ?>))
-<? else ?>
-   AND (bomwork_effective <= CURRENT_DATE)
-<? endif ?>
- )
-ORDER BY seq_ord;
+SELECT (REPEAT(' ',(bomdata_bomwork_level-1)*3) || bomdata_bomwork_seqnumber) AS f_seqnumber,
+       bomdata_item_number AS item_number,
+       bomdata_uom_name AS item_invuom,
+       bomdata_item_descrip1 AS item_descrip1,
+       bomdata_item_descrip2 AS item_descrip2,
+       bomdata_issuemethod AS issuemethod,
+       bomdata_createchild AS createchild,
+       bomdata_qtyper AS qtyper,
+       bomdata_scrap AS scrap,
+       bomdata_effective AS effective,
+       bomdata_expires AS expires
+FROM indentedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,<? value("expiredDays") ?>,<? value("futureDays") ?>)
+WHERE (bomdata_item_id>0);
--------------------------------------------------------------------

QUERY: bomhead
SELECT bomhead_docnum, bomhead_revision,
formatDate(bomhead_revisiondate) AS f_revisiondate
FROM bomhead
WHERE ((bomhead_item_id=<? value("item_id") ?>)
AND (bomhead_rev_id=<? value("revision_id") ?>));
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: IndentedWhereUsed
 QUERY: detail
 SELECT (REPEAT(' ',(bomwork_level-1)*3) || bomwork_seqnumber) AS f_seqnumber,
+       bomworkitemsequence(bomwork_id) AS seqord,
        item_number, item_invuom,
        item_descrip1, item_descrip2,
        formatQtyPer(bomwork_qtyper) AS qtyper,
        formatScrap(bomwork_scrap) AS scrap,
        formatDate(bomwork_effective, 'Always') AS effective,
        formatDate(bomwork_expires, 'Never') AS expires
   FROM bomwork, item
  WHERE ((bomwork_item_id=item_id)
    AND (bomwork_set_id=<? value("bomworkset_id") ?>)
 <? if not exists("showExpired") ?>
    AND (bomwork_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
    AND (bomwork_effective <= CURRENT_DATE)
 <? endif ?>
 )
-ORDER BY bomwork_level, item_number;
+ORDER BY seqord;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: InventoryAvailabilityBySalesOrder
 QUERY: detail
 SELECT itemsite_id, coitem_id,
-                        item_number, item_description, item_invuom, item_picklist,
+                        item_number, item_description, uom_name, item_picklist,
                         qoh, formatQty(qoh) AS f_qoh,sobalance,
                         formatQty(sobalance) AS f_sobalance,
                         formatQty(allocated) AS f_allocated,
                         ordered, formatQty(ordered) AS f_ordered,
                         (qoh + ordered - sobalance) AS woavail,
                         formatQty(qoh + ordered - sobalance) AS f_soavail,
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
                                item_number, (item_descrip1 || ' ' || item_descrip2) AS item_description,
-                               item_invuom, item_picklist,
+                               uom_name, item_picklist,
                                noNeg(itemsite_qtyonhand) AS qoh,
                                noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) AS sobalance,
                                qtyAllocated(itemsite_id, coitem_scheddate) AS allocated,
                                qtyOrdered(itemsite_id, coitem_scheddate) AS ordered,
                                qtyatshipping(coitem_id) AS atshipping,
                                CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel
                  <? if exists(showWoSupply) ?>,
                                COALESCE(wo_id,-1) AS wo_id,
                                formatwonumber(wo_id) AS wo_number,
                                noNeg((wo_qtyord-wo_qtyrcv)) AS wo_ordered,
                                wo_status, wo_startdate, wo_duedate,
                                ((wo_startdate <= CURRENT_DATE) AND (wo_status IN ('O','E','S','R'))) AS wo_latestart,
                                (wo_duedate<=CURRENT_DATE) AS wo_latedue
                  <? endif ?>
-                        FROM cohead, itemsite,item, coitem
+                        FROM cohead, itemsite, item, uom, coitem
                  <? if exists(showWoSupply) ?>
                              LEFT OUTER JOIN wo
                               ON ((coitem_itemsite_id=wo_itemsite_id)
                               AND (wo_status IN ('E','R','I'))
                               AND (wo_qtyord-wo_qtyrcv > 0)
                               AND (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned-qtyatshipping(coitem_id)) >
                                (SELECT itemsite_qtyonhand FROM itemsite WHERE (itemsite_id=coitem_itemsite_id))))
                  <? endif ?>
                         WHERE ( (coitem_cohead_id=cohead_id)
                          AND (coitem_itemsite_id=itemsite_id)
                          AND (itemsite_item_id=item_id)
-                         AND (coitem_status <> 'X')
+                         AND (item_inv_uom_id=uom_id)
+                         AND (coitem_status NOT IN ('C', 'X'))
                          AND (cohead_id=<? value(sohead_id) ?>))
                  ) AS data
 	              <? if exists(onlyShowShortages) ?>
                  WHERE ( ((qoh + ordered - allocated) < 0)
                   OR ((qoh + ordered - sobalance) < 0) )
                  <? endif ?>
                  ORDER BY item_number
                  <? if exists(showWoSupply) ?> ,
                  wo_duedate
                  <? endif ?>
                  ;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: InventoryHistoryByItem
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
        invhist_user as username,
        CASE WHEN (invhist_transtype='TW') THEN whs1.warehous_code
             WHEN (invhist_transtype='IB') THEN whs1.warehous_code
             WHEN (invhist_transtype='IM') THEN whs1.warehous_code
             WHEN (invhist_transtype='IT') THEN whs1.warehous_code
             WHEN (invhist_transtype='RB') THEN 'WIP'
             WHEN (invhist_transtype='RM') THEN 'WIP'
             WHEN (invhist_transtype='RP') THEN 'PURCH'
+            WHEN (invhist_transtype='RR') THEN 'CUST'
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
+            WHEN (invhist_transtype='RR') THEN whs1.warehous_code
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
        invhist_user AS username,
        CASE WHEN (invhist_transtype='TW') THEN whs1.warehous_code
             WHEN (invhist_transtype='IB') THEN whs1.warehous_code
             WHEN (invhist_transtype='IM') THEN whs1.warehous_code
             WHEN (invhist_transtype='IT') THEN whs1.warehous_code
             WHEN (invhist_transtype='RB') THEN 'WIP'
             WHEN (invhist_transtype='RM') THEN 'WIP'
             WHEN (invhist_transtype='RP') THEN 'PURCH'
+            WHEN (invhist_transtype='RR') THEN 'CUST'
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
+            WHEN (invhist_transtype='RR') THEN whs1.warehous_code
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


 --------------------------------------------------------------------
 REPORT: InventoryHistoryByParameterList
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
+            WHEN (invhist_transtype='RR') THEN 'CUST'
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
+            WHEN (invhist_transtype='RR') THEN whs1.warehous_code
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
        invhist_user AS username,
        invhist_posted,
        invdetail_id,
        CASE WHEN (invdetail_location_id=-1) THEN invdetail_lotserial
             WHEN (invdetail_lotserial IS NULL) THEN formatLocationName(invdetail_location_id)
             ELSE (formatLocationName(invdetail_location_id) || '-' || invdetail_lotserial)
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
+            WHEN (invhist_transtype='RR') THEN 'CUST'
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
+            WHEN (invhist_transtype='RR') THEN whs1.warehous_code
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
 QUERY: Detail
 SELECT invcitem_linenumber,
        formatQty(invcitem_billed) AS f_billed,
-       item_invuom AS invuom,
+--     In 2.3 replaced the next line:
+--     uom_name AS invuom,
+--     with:
+       (select uom_name from uom where uom_id = invcitem_qty_uom_id) AS invuom,
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
-       formatPrice(invcitem_price / COALESCE(item_invpricerat,1)) AS f_unitprice,
-       formatMoney(round(invcitem_billed * invcitem_price / COALESCE(item_invpricerat,1),2)) AS f_extprice,
+       formatPrice(invcitem_price / COALESCE(invcitem_price_invuomratio,1)) AS f_unitprice,
+       formatMoney(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2)) AS f_extprice,
        invcitem_notes,
        getInvcitemLotSerial(invcitem_id) AS lotserial,
        characteristicsToString('SI', (SELECT coitem_id FROM coitem, cohead, invchead WHERE (cohead_number=invchead_ordernumber and invchead_id=<? value("invchead_id") ?> and coitem_cohead_id=cohead_id and coitem_linenumber=invcitem_linenumber)), '=', ', ') AS coitem_characteristics
-FROM invcitem LEFT OUTER JOIN item ON (invcitem_item_id=item_id) LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=invcitem_custpn)
+FROM invcitem LEFT OUTER JOIN (item JOIN uom ON (item_inv_uom_id=uom_id)) ON (invcitem_item_id=item_id) LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=invcitem_custpn)
 WHERE (invcitem_invchead_id=<? value("invchead_id") ?>)
 ORDER BY invcitem_linenumber;
 --------------------------------------------------------------------

 QUERY: foot
-SELECT formatMoney(SUM(round(invcitem_billed * invcitem_price / COALESCE(item_invpricerat,1),2))) AS f_extprice
+SELECT formatMoney(SUM(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2))) AS f_extprice
 FROM invcitem LEFT OUTER JOIN item on (invcitem_item_id=item_id)
 WHERE (invcitem_invchead_id=<? value("invchead_id") ?>);
 --------------------------------------------------------------------

 QUERY: GroupExtended
 SELECT formatMoney( noNeg(invchead_freight + invchead_misc_amount + invchead_tax +
-                       ( SELECT COALESCE(SUM(round((invcitem_billed * invcitem_price / COALESCE(item_invpricerat,1)),2)), 0)
+                       ( SELECT COALESCE(SUM(round(((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1))),2)), 0)
                          FROM invcitem LEFT OUTER JOIN item ON (invcitem_item_id=item_id)
                          WHERE (invcitem_invchead_id=<? value("invchead_id") ?>) )
                     - total_allocated) ) AS f_totaldue,
        formatMoney(invchead_misc_amount) AS f_misc,
        formatMoney(invchead_tax) AS f_tax,
        formatMoney(invchead_freight) AS f_freight,
        formatMoney(invchead_payment) AS f_payment,
        formatMoney(total_allocated) AS f_allocated,
        invchead_notes,
        invchead_misc_descrip
 FROM invchead,
 (SELECT COALESCE(SUM(CASE WHEN((aropen_amount - aropen_paid) >=
 			        currToCurr(aropenco_curr_id, aropen_curr_id,
 					   aropenco_amount, aropen_docdate))
-		THEN currToCurr(aropenco_curr_id, aropen_curr_id,
+		THEN currToCurr(aropenco_curr_id, invchead_curr_id,
 				aropenco_amount, aropen_docdate)
-                ELSE (aropen_amount - aropen_paid)
+		ELSE currToCurr(aropen_curr_id, invchead_curr_id,
+				aropen_amount - aropen_paid, aropen_docdate)
            END),0) AS total_allocated
   FROM aropenco, aropen, cohead, invchead
  WHERE ( (aropenco_aropen_id=aropen_id)
    AND   (aropenco_cohead_id=cohead_id)
    AND   ((aropen_amount - aropen_paid) > 0)
    AND   (cohead_number=invchead_ordernumber)
    AND   (invchead_id=<? value("invchead_id") ?>) )) AS totalalloc
 WHERE (invchead_id=<? value("invchead_id") ?>);
 --------------------------------------------------------------------

 QUERY: allocatedCMs
 SELECT cohead_id, aropen_id,
        aropen_docnumber,
        formatMoney(aropen_amount) AS f_total,
        formatMoney(aropen_paid) AS f_paid,
        formatMoney(aropen_amount - aropen_paid) AS f_balance,
        CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
 							     aropen_curr_id,
 							     aropenco_amount,
 							     aropen_docdate))
 	    THEN currToCurr(aropenco_curr_id, aropen_curr_id,
 			    aropenco_amount, aropen_docdate)
             ELSE (aropen_amount - aropen_paid)
        END AS allocated,
        CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
 							     aropen_curr_id,
 							     aropenco_amount,
 							     aropen_docdate))
 	    THEN formatMoney(currToCurr(aropenco_curr_id, aropen_curr_id,
 					aropenco_amount, aropen_docdate))
             ELSE formatMoney(aropen_amount - aropen_paid)
-       END AS f_allocated
-  FROM aropenco, aropen, cohead, invchead
+       END AS f_allocated,
+       CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
+							     aropen_curr_id,
+							     aropenco_amount,
+							     aropen_docdate))
+	    THEN currToCurr(aropenco_curr_id, invchead_curr_id,
+			    aropenco_amount, aropen_docdate)
+            ELSE currToCurr(aropen_curr_id, invchead_curr_id, aropen_amount - aropen_paid, aropen_docdate)
+       END AS allocated_invccurr,
+       CASE WHEN((aropen_amount - aropen_paid) >= currToCurr(aropenco_curr_id,
+							     aropen_curr_id,
+							     aropenco_amount,
+							     aropen_docdate))
+	    THEN formatMoney(currToCurr(aropenco_curr_id, invchead_curr_id,
+					aropenco_amount, aropen_docdate))
+            ELSE formatMoney(currToCurr(aropen_curr_id, invchead_curr_id, aropen_amount - aropen_paid, aropen_docdate))
+       END AS f_allocated_invccurr,
+       curr_symbol AS aropen_currsymbol
+  FROM aropenco, aropen, cohead, invchead, curr_symbol
  WHERE ( (aropenco_aropen_id=aropen_id)
    AND   (aropenco_cohead_id=cohead_id)
    AND   ((aropen_amount - aropen_paid) > 0)
+   AND   (aropen_curr_id=curr_id)
    AND   (cohead_number=invchead_ordernumber)
    AND   (invchead_id=<? value("invchead_id") ?>) );
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: InvoiceInformation
 QUERY: GroupHead
 SELECT invchead_id, invchead_ponumber,
        formatDate(invchead_shipdate) AS f_shipdate,
        formatDate(invchead_invcdate) AS f_invcdate,
-       formatMoney((invchead_tax + invchead_misc_amount + invchead_freight + SUM(round(invcitem_billed * invcitem_price / COALESCE(item_invpricerat,1),2)))) AS f_amount,
+       formatMoney((invchead_tax + invchead_misc_amount + invchead_freight + SUM(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2)))) AS f_amount,
        invchead_billto_name, invchead_billto_address1,
        invchead_billto_address2, invchead_billto_address3,
        ( invchead_billto_city || ' ' || invchead_billto_state || ', '
          || invchead_billto_zipcode ) AS billtocitystatezip,
        invchead_shipto_name, invchead_shipto_address1,
        invchead_shipto_address2, invchead_shipto_address3,
        ( invchead_shipto_city || ' ' || invchead_shipto_state || ', '
          || invchead_shipto_zipcode ) AS shiptocitystatezip,
        invchead_notes, invchead_invcnumber
 FROM invchead LEFT OUTER JOIN (invcitem LEFT OUTER JOIN item ON (invcitem_item_id=item_id) ) ON (invcitem_invchead_id=invchead_id)
 WHERE (invchead_id=<? value("invchead_id") ?>)
 GROUP BY invchead_id, invchead_ponumber,
          invchead_shipdate, invchead_invcdate,
          invchead_misc_amount, invchead_freight, invchead_tax,
          invchead_billto_name, invchead_billto_address1,
          invchead_billto_address2, invchead_billto_address3,
          invchead_billto_city, invchead_billto_state, invchead_billto_zipcode,
          invchead_shipto_name, invchead_shipto_address1,
          invchead_shipto_address2, invchead_shipto_address3,
          invchead_shipto_city, invchead_shipto_state, invchead_shipto_zipcode,
          invchead_notes, invchead_invcnumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: Invoice
 QUERY: Detail
 SELECT coitem_linenumber,
                formatQty(cobill_qty) AS qtytobill,
                formatQty(coitem_qtyord) AS qtyordered,
-               item_invuom, item_number, item_descrip1, item_descrip2,
+               uom_name, item_number, item_descrip1, item_descrip2,
                formatPrice(coitem_price) AS unitprice,
-               formatExtPrice(coitem_price * cobill_qty) AS extprice
-FROM cobmisc, cobill, coitem, itemsite, item
+               formatExtPrice((coitem_price / coitem_price_invuomratio) * (cobill_qty * coitem_qty_invuomratio)) AS extprice
+FROM cobmisc, cobill, coitem, itemsite, item, uom
 WHERE ((cobill_cobmisc_id=cobmisc_id)
  AND (cobill_coitem_id=coitem_id)
  AND (coitem_itemsite_id=itemsite_id)
  AND (itemsite_item_id=item_id)
+ AND (item_inv_uom_id=uom_id)
  AND (cobmisc_id=%1))
 ORDER BY coitem_linenumber;
 --------------------------------------------------------------------

 QUERY: foot
-SELECT formatExtPrice(SUM((coitem_price * cobill_qty)::numeric(20,2))) AS extprice
+SELECT formatExtPrice(SUM(((coitem_price / coitem_price_invuomratio) * (cobill_qty * coitem_qty_invuomratio))::numeric(20,2))) AS extprice
 FROM cobill, cobmisc, coitem
 WHERE ((cobill_cobmisc_id=cobmisc_id)
  AND (cobill_coitem_id=coitem_id)
   AND (cobmisc_id=%1));
 --------------------------------------------------------------------

 QUERY: GroupExtended
 SELECT formatExtPrice(totaldue) AS f_totaldue,
                formatExtPrice(payment) AS f_payment,
                formatExtPrice(totaldue - payment) AS f_balancedue
 FROM ( SELECT ( cobmisc_freight + cobmisc_misc + cobmisc_tax +
-                               ( SELECT COALESCE(SUM((coitem_price * cobill_qty)::numeric(20,2)), 0::numeric)
+                               ( SELECT COALESCE(SUM(((coitem_price / coitem_price_invuomratio) * (cobill_qty * coitem_qty_invuomratio))::numeric(20,2)), 0::numeric)
                                  FROM cobmisc, coitem, cobill
                                  WHERE ( (cobill_cobmisc_id=cobmisc_id)
                                   AND (cobill_coitem_id=coitem_id)
                                   AND (cobmisc_id=%1) ) ) ) AS totaldue,
                             cobmisc_payment AS payment
                FROM cobmisc
                WHERE (cobmisc_id=%1) ) AS data;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: ItemCostsByClassCode
 QUERY: detail
 SELECT item_id,
        item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom as f_uom,
+       uom_name as f_uom,
        formatCost(scost) as f_stdcost,
        formatCost(acost) as f_actcost,
        classcode_code
   FROM ( SELECT item_id,
                 item_number,
                 item_descrip1,
                 item_descrip2,
-                item_invuom,
+                uom_name,
                 stdcost(item_id) AS scost,
                 actcost(item_id) AS acost,
                 classcode_code
-           FROM item, classcode
+           FROM item, classcode, uom
           WHERE ((item_classcode_id=classcode_id)
+            AND (item_inv_uom_id=uom_id)
           <? if exists("classcode_id") ?>
             AND (classcode_id=<? value("classcode_id") ?>)
           <? elseif exists("classcode_pattern") ?>
             AND (classcode_code ~ <? value("classcode_pattern") ?>)
           <? endif ?>
           )
        ) AS data
 <? if exists("onlyShowZeroCosts") ?>
  WHERE ((scost=0)
     OR (acost=0)
  )
 <? endif ?>
 ORDER BY item_number
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: ItemMaster
 QUERY: head
 SELECT item_number,
        formatBoolYN(item_active) AS f_item_active,
        item_descrip1, item_descrip2,
        CASE WHEN(item_type='P') THEN 'Purchased'
             WHEN(item_type='M') THEN 'Manufactured'
+            WHEN(item_type='J') THEN 'Job'
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
-       item_invuom,
+       iuom.uom_name AS invuom,
        formatBoolYN(item_picklist) AS f_item_picklist,
        formatBoolYN(item_fractional) AS f_item_fractional,
-       item_capuom, item_altcapuom, item_shipuom,
-       formatUOMRatio(item_capinvrat) AS f_item_capinvrat,
-       formatUOMRatio(item_altcapinvrat) AS f_item_altcapinvrat,
-       formatUOMRatio(item_shipinvrat) AS f_item_shipinvrat,
+       itemcapuom(item_id) AS capuom, itemaltcapuom(item_id) AS altcapuom, puom.uom_name AS shipuom,
+       formatUOMRatio(itemcapinvrat(item_id)) AS f_capinvrat,
+       formatUOMRatio(itemaltcapinvrat(item_id)) AS f_altcapinvrat,
+       formatUOMRatio(iteminvpricerat(item_id)) AS f_shipinvrat,
        formatWeight(item_prodweight) AS f_item_prodweight,
        formatWeight(item_packweight) AS f_item_packweight,
        formatBoolYN(item_sold) AS f_item_sold
-  FROM item, classcode
+  FROM item, classcode, uom AS iuom, uom AS puom
  WHERE ((item_id=<? value("item_id") ?>)
+   AND  (item_inv_uom_id=iuom.uom_id)
+   AND  (item_price_uom_id=puom.uom_id)
    AND  (item_classcode_id=classcode_id) );
 --------------------------------------------------------------------

 QUERY: sold
-SELECT item_priceuom,
-       formatUOMRatio(item_invpricerat) AS f_item_invpricerat,
+SELECT uom_name,
+       formatUOMRatio(iteminvpricerat(item_id)) AS f_iteminvpricerat,
        (prodcat_code||' - '||prodcat_descrip) AS f_prodcat,
        formatBoolYN(item_taxable) AS f_item_taxable,
        formatBoolYN(item_exclusive) AS f_item_exclusive,
        formatPrice(item_listprice) AS f_item_listprice,
-       formatExtPrice(item_listprice / item_invpricerat) AS f_extprice
-  FROM item, prodcat
+       formatExtPrice(item_listprice / iteminvpricerat(item_id)) AS f_extprice
+  FROM item, prodcat, uom
  WHERE ((item_id=<? value("item_id") ?>)
+   AND  (item_price_uom_id=uom_id)
    AND  (item_sold)
    AND  (item_prodcat_id=prodcat_id) );
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: ItemSourcesByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom
-  FROM item
+       uom_name
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: ItemSourcesByVendor
 QUERY: detail
 SELECT item_number,
        item_descrip1, item_descrip2,
-       item_invuom,
+       uom_name,
        itemsrc_vend_item_number as f_venditem,
        itemsrc_vend_uom as f_venduom,
        formatQty(itemsrc_invvendoruomratio) as f_uomratio
-  FROM itemsrc, item
+  FROM itemsrc, item, uom
  WHERE ( (itemsrc_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsrc_vend_id=<? value("vend_id") ?>) );
 --------------------------------------------------------------------


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
             ELSE item_type
        END AS itemtype,
-       item_invuom,
-       item_capuom,
-       item_altcapuom,
-       item_priceuom,
-       item_shipuom,
-       formatRatio(item_capinvrat) AS capratio,
-       formatRatio(item_altcapinvrat) AS altcapratio,
-       formatRatio(item_shipinvrat) AS shipratio,
-       formatRatio(item_invpricerat) AS priceratio,
+       iuom.uom_name AS invuom,
+       itemcapuom(item_id) AS capuom,
+       itemaltcapuom(item_id) AS altcapuom,
+       puom.uom_name AS priceuom,
+       puom.uom_name AS shipuom,
+       formatRatio(itemcapinvrat(item_id)) AS capratio,
+       formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
+       formatRatio(iteminvpricerat(item_id)) AS shipratio,
+       formatRatio(iteminvpricerat(item_id)) AS priceratio,
        formatBoolYN(item_sold) AS sold,
        formatBoolYN(item_exclusive) AS exclusive,
        formatBoolYN(item_taxable) AS taxable,
        formatBoolYN(item_picklist) AS picklist,
        formatBoolYN(item_config) AS configured,
        formatWeight(item_prodweight) AS prodweight,
        formatWeight(item_packweight) AS packweight,
        char_name, charass_value
-  FROM item, charass, char
+  FROM item, charass, char, uom AS iuom, uom AS puom
  WHERE ((charass_target_type='I')
    AND (charass_target_id=item_id)
+   AND (item_inv_uom_id=iuom.uom_id)
+   AND (item_price_uom_id=puom.uom_id)
    AND (charass_char_id=char_id)
    AND (char_id=<? value("char_id") ?>)
    AND (charass_value ~* <? value("value") ?>)
 <? if not exists("showInactive") ?>
    AND (item_active)
 <? endif ?>
 )
 ORDER BY item_number;
 --------------------------------------------------------------------


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
             ELSE item_type
        END AS itemtype,
-       item_invuom,
-       item_capuom,
-       item_altcapuom,
-       item_priceuom,
-       item_shipuom,
-       formatRatio(item_capinvrat) AS capratio,
-       formatRatio(item_altcapinvrat) AS altcapratio,
-       formatRatio(item_shipinvrat) AS shipratio,
-       formatRatio(item_invpricerat) AS priceratio,
+       iuom.uom_name AS invuom,
+       itemcapuom(item_id) AS capuom,
+       itemaltcapuom(item_id) AS altcapuom,
+       puom.uom_name AS priceuom,
+       puom.uom_name AS shipuom,
+       formatRatio(itemcapinvrat(item_id)) AS capratio,
+       formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
+       formatRatio(iteminvpricerat(item_id)) AS shipratio,
+       formatRatio(iteminvpricerat(item_id)) AS priceratio,
        formatBoolYN(item_sold) AS sold,
        formatBoolYN(item_exclusive) AS exclusive,
        formatBoolYN(item_taxable) AS taxable,
        formatBoolYN(item_picklist) AS picklist,
        formatBoolYN(item_config) AS configured,
        formatWeight(item_prodweight) AS prodweight,
        formatWeight(item_packweight) AS packweight,
        classcode_code
-  FROM item, classcode
+  FROM item, classcode, uom AS iuom, uom AS puom
  WHERE ((item_classcode_id=classcode_id)
+   AND (item_inv_uom_id=iuom.uom_id)
+   AND (item_price_uom_id=puom.uom_id)
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
             ELSE item_type
        END AS itemtype,
-       item_invuom,
-       item_capuom,
-       item_altcapuom,
-       item_priceuom,
-       item_shipuom,
-       formatRatio(item_capinvrat) AS capratio,
-       formatRatio(item_altcapinvrat) AS altcapratio,
-       formatRatio(item_shipinvrat) AS shipratio,
-       formatRatio(item_invpricerat) AS priceratio,
+       iuom.uom_name AS invuom,
+       itemcapuom(item_id) AS capuom,
+       itemaltcapuom(item_id) AS altcapuom,
+       puom.uom_name AS priceuom,
+       puom.uom_name AS shipuom,
+       formatRatio(itemcapinvrat(item_id)) AS capratio,
+       formatRatio(itemaltcapinvrat(item_id)) AS altcapratio,
+       formatRatio(iteminvpricerat(item_id)) AS shipratio,
+       formatRatio(iteminvpricerat(item_id)) AS priceratio,
        formatBoolYN(item_sold) AS sold,
        formatBoolYN(item_exclusive) AS exclusive,
        formatBoolYN(item_taxable) AS taxable,
        formatBoolYN(item_picklist) AS picklist,
        formatBoolYN(item_config) AS configured,
        formatWeight(item_prodweight) AS prodweight,
        formatWeight(item_packweight) AS packweight,
        prodcat_code
-  FROM item, prodcat
+  FROM item, prodcat, uom AS iuom, uom AS puom
  WHERE ((item_prodcat_id=prodcat_id)
+   AND (item_inv_uom_id=iuom.uom_id)
+   AND (item_price_uom_id=puom.uom_id)
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


 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByBOMItem
 QUERY: head
 SELECT parent.item_number AS parent_number,
        parent.item_descrip1 AS parent_descrip1,
        parent.item_descrip2 AS parent_descrip2,
-       parent.item_invuom AS parent_invuom,
+       puom.uom_name AS parent_invuom,
        child.item_number AS comp_number,
        child.item_descrip1 AS comp_descrip1,
        child.item_descrip2 AS comp_descrip2,
-       child.item_invuom AS comp_invuom,
+       cuom.uom_name AS comp_invuom,
        bomitem_seqnumber as comp_seqnumber,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse
-  FROM item as parent, item as child, bomitem
+  FROM item as parent, item as child, uom AS puom, uom AS cuom, bomitem
  WHERE ((parent.item_id=<? value("item_id") ?>)
+   AND (parent.item_inv_uom_id=puom.uom_id)
    AND (bomitem_item_id=child.item_id)
+   AND (child.item_inv_uom_id=cuom.uom_id)
    AND (bomitem_id=<? value("component_item_id") ?>) );

 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByComponentItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
-  FROM item
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT formatDate(posted) AS f_posted,
-       item_number, item_descrip1, item_descrip2, item_invuom,
+       item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(ordered) AS f_ordered,
        formatQty(received) AS f_produced,
        formatQty(projreq) AS f_projreq,
        formatQtyPer(projqtyper) AS f_projqtyper,
        formatQty(actiss) AS f_actiss,
        formatQtyPer(actqtyper) AS f_actqtyper,
        formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
        formatPrcnt((1 - (actqtyper / projqtyper)) * -1) AS f_percent
   FROM ( SELECT womatlvar_posted AS posted,
-                item_number, item_invuom,
+                item_number, uom_name,
                 item_descrip1, item_descrip2,
                 womatlvar_qtyord AS ordered,
                 womatlvar_qtyrcv AS received,
                 (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
                 womatlvar_qtyper AS projqtyper,
                 (womatlvar_qtyiss) AS actiss,
                 (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
            FROM womatlvar, itemsite AS component,
-                itemsite AS parent, item
+                itemsite AS parent, item, uom
           WHERE ((womatlvar_parent_itemsite_id=parent.itemsite_id)
             AND (womatlvar_component_itemsite_id=component.itemsite_id)
             AND (parent.itemsite_item_id=item_id)
+            AND (item_inv_uom_id=uom_id)
             AND (component.itemsite_item_id=<? value("item_id") ?>)
             AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
             AND (component.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
                 )
        ) AS data
 ORDER BY posted;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
              FROM warehous
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
-  FROM item
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT formatDate(posted) AS f_posted,
-       item_number, item_descrip1, item_descrip2, item_invuom,
+       item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(ordered) AS f_ordered,
        formatQty(received) AS f_produced,
        formatQty(projreq) AS f_projreq,
        formatQtyPer(projqtyper) AS f_projqtyper,
        formatQty(actiss) AS f_actiss,
        formatQtyPer(actqtyper) AS f_actqtyper,
        formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
        formatPrcnt((1 - (actqtyper / projqtyper)) * -1) AS f_percent
   FROM ( SELECT womatlvar_posted AS posted,
-                item_number, item_invuom,
+                item_number, uom_name,
                 item_descrip1, item_descrip2,
                 womatlvar_qtyord AS ordered,
                 womatlvar_qtyrcv AS received,
                 (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
                 womatlvar_qtyper AS projqtyper,
                 (womatlvar_qtyiss) AS actiss,
                 (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
            FROM womatlvar, itemsite AS component,
-                itemsite AS parent, item
+                itemsite AS parent, item, uom
           WHERE ((womatlvar_parent_itemsite_id=parent.itemsite_id)
             AND (womatlvar_component_itemsite_id=component.itemsite_id)
             AND (component.itemsite_item_id=item_id)
+            AND (item_inv_uom_id=uom_id)
             AND (parent.itemsite_item_id=<? value("item_id") ?>)
             AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
             AND (parent.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
                 )
        ) AS data
 ORDER BY posted;
 --------------------------------------------------------------------


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
        formatPrcnt((1 - (actqtyper / projqtyper)) * -1) AS f_percent
   FROM ( SELECT womatlvar_posted AS posted,
                 parentitem.item_number AS parent_number,
-                parentitem.item_invuom AS parent_invuom,
+                puom.uom_name AS parent_invuom,
                 parentitem.item_descrip1 AS parent_descrip1,
                 parentitem.item_descrip2 AS parent_descrip2,
                 componentitem.item_number AS child_number,
-                componentitem.item_invuom AS child_invuom,
+                cuom.uom_name AS child_invuom,
                 componentitem.item_descrip1 AS child_descrip1,
                 componentitem.item_descrip2 AS child_descrip2,
                 womatlvar_qtyord AS ordered,
                 womatlvar_qtyrcv AS received,
                 (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
                 womatlvar_qtyper AS projqtyper,
                 (womatlvar_qtyiss) AS actiss,
                 (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
            FROM womatlvar, itemsite AS componentsite, itemsite AS parentsite,
-                item AS componentitem, item AS parentitem
+                item AS componentitem, item AS parentitem, uom AS puom, uom AS cuom
           WHERE ((womatlvar_parent_itemsite_id=parentsite.itemsite_id)
             AND (womatlvar_component_itemsite_id=componentsite.itemsite_id)
             AND (parentsite.itemsite_item_id=parentitem.item_id)
+            AND (parentitem.item_inv_uom_id=puom.uom_id)
             AND (componentsite.itemsite_item_id=componentitem.item_id)
+            AND (componentitem.item_inv_uom_id=cuom.uom_id)
             AND (womatlvar_posted BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
             AND (componentsite.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
                 )
        ) AS data
 ORDER BY posted;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByWorkOrder
 QUERY: head
 SELECT formatWONumber(wo_id) AS wonumber,
-       warehous_code, item_number, item_invuom,
+       warehous_code, item_number, uom_name,
        item_descrip1, item_descrip2,
        wo_status
-  FROM wo, itemsite, item, warehous
+  FROM wo, itemsite, item, warehous, uom
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_id=<? value("wo_id") ?>))
 --------------------------------------------------------------------

 QUERY: detail
 SELECT formatDate(posted) AS f_posted,
-       item_number, item_descrip1, item_descrip2, item_invuom,
+       item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(ordered) AS f_ordered,
        formatQty(received) AS f_produced,
        formatQty(projreq) AS f_projreq,
        formatQtyPer(projqtyper) AS f_projqtyper,
        formatQty(actiss) AS f_actiss,
        formatQtyPer(actqtyper) AS f_actqtyper,
        formatQtyPer(actqtyper - projqtyper) AS f_qtypervar,
        formatPrcnt((1 - (actqtyper / projqtyper)) * -1) AS f_percent
   FROM ( SELECT womatlvar_posted AS posted,
-                item_number, item_invuom,
+                item_number, uom_name,
                 item_descrip1, item_descrip2,
                 womatlvar_qtyord AS ordered,
                 womatlvar_qtyrcv AS received,
                 (womatlvar_qtyrcv * (womatlvar_qtyper * (1 + womatlvar_scrap))) AS projreq,
                 womatlvar_qtyper AS projqtyper,
                 (womatlvar_qtyiss) AS actiss,
                 (womatlvar_qtyiss / (womatlvar_qtyrcv * (1 + womatlvar_scrap))) AS actqtyper
-           FROM womatlvar, itemsite, item, wo
+           FROM womatlvar, itemsite, item, wo, uom
           WHERE ((womatlvar_component_itemsite_id=itemsite_id)
             AND (itemsite_item_id=item_id)
+            AND (item_inv_uom_id=uom_id)
             AND (wo_number=womatlvar_number)
             AND (wo_subnumber=womatlvar_subnumber)
             AND (wo_id=<? value("wo_id") ?>) ) ) AS data
 ORDER BY item_number;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: OpenWorkOrdersWithClosedParentSalesOrders
 QUERY: detail
 SELECT formatWONumber(wo_id) AS wonumber,
-       wo_status, item_number, item_invuom,
+       wo_status, item_number, uom_name,
        item_descrip1, item_descrip2,
        warehous_code,
        cohead_number,
        formatQty(wo_qtyord) AS qtyord,
        formatQty(wo_qtyrcv) AS qtyrcv,
        formatDate(wo_startdate) AS startdate,
        formatDate(wo_duedate) AS duedate
-  FROM coitem, cohead, wo, itemsite, warehous, item
+  FROM coitem, cohead, wo, itemsite, warehous, item, uom
  WHERE ((coitem_cohead_id=cohead_id)
    AND (coitem_order_id=wo_id)
    AND (coitem_status='C')
    AND (wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_status IN ('O', 'E', 'R', 'I'))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY wo_duedate;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: OpenWorkOrdersWithParentSalesOrders
 QUERY: detail
 SELECT formatWONumber(wo_id) AS wonumber,
-       wo_status, item_number, item_invuom,
+       wo_status, item_number, uom_name,
        item_descrip1, item_descrip2,
        warehous_code,
        cohead_number,
        formatQty(wo_qtyord) AS qtyord,
        formatQty(wo_qtyrcv) AS qtyrcv,
        formatDate(wo_startdate) AS startdate,
        formatDate(wo_duedate) AS duedate
-  FROM coitem, cohead, wo, itemsite, warehous, item
+  FROM coitem, cohead, wo, itemsite, warehous, item, uom
  WHERE ((coitem_cohead_id=cohead_id)
    AND (coitem_order_id=wo_id)
    AND (coitem_status<>'X')
    AND (wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_status IN ('O', 'E', 'R', 'I'))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY wo_duedate;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: OrderActivityByProject
 QUERY: detail
 <? if exists("showSo") ?>
 SELECT quhead_id AS id,
        10 AS typeid,
        text('Section 1 - Pro Forma Revenue (Quotes)') AS section,
        text('Quote') AS type,
        text(quhead_number) || '-' || text(quitem_linenumber) AS ordernumber,
        CASE WHEN quhead_origin = 'C'  THEN 'Customer'
             WHEN quhead_origin = 'S'  THEN 'Sales Rep'
             WHEN quhead_origin = 'I'  THEN 'Internet'
        END AS status,
        item_number AS item,
        formatQty(quitem_qtyord) AS f_qty,
        formatQty(quitem_qtyord * quitem_price) AS f_value,
        quitem_qtyord * quitem_price AS amt_value,
        quitem_qtyord * quitem_price AS amt_report
   FROM quhead, quitem, itemsite, item
  WHERE ((quhead_prj_id = <? value("prj_id") ?>)
         AND (quitem_quhead_id = quhead_id)
         AND (quitem_itemsite_id = itemsite_id)
         AND (itemsite_item_id = item_id))

 UNION

 SELECT
        cohead_id AS id,
        20 AS typeid,
        text('Section 2 - Booked Revenue') AS section,
        text('Sales Order - See Invoice Section for Closed Line Amounts') AS type,
        text(cohead_number) || '-' || text(coitem_linenumber) AS ordernumber,
        CASE WHEN cohead_holdtype = 'N'  THEN 'Not On Hold'
             WHEN cohead_holdtype = 'C'  THEN 'On Credit Hold'
             WHEN cohead_holdtype = 'S'  THEN 'On Shipping Hold'
             WHEN cohead_holdtype = 'P'  THEN 'On Packing Hold'
+            WHEN cohead_holdtype = 'R'  THEN 'On Return Hold'
        END AS status,
        item_number AS item,

        formatQty(coitem_qtyord) AS f_qty,
        CASE WHEN coitem_status = 'C' THEN 'SO Line Closed - See Invoice'
-            WHEN coitem_status <> 'C' THEN formatQty(coitem_qtyord * coitem_price)
+            WHEN coitem_status <> 'C' THEN formatQty((coitem_qtyord * coitem_qty_invuomratio) * (coitem_price * coitem_price_invuomratio))
        END AS f_value,

        CASE WHEN coitem_status = 'C' THEN 0
-            WHEN coitem_status <> 'C' THEN coitem_qtyord * coitem_price
+            WHEN coitem_status <> 'C' THEN (coitem_qtyord * coitem_qty_invuomratio) * (coitem_price * coitem_price_invuomratio)
        END AS amt_value,

        CASE WHEN coitem_status = 'C' THEN 0
-            WHEN coitem_status <> 'C' THEN coitem_qtyord * coitem_price
+            WHEN coitem_status <> 'C' THEN (coitem_qtyord * coitem_qty_invuomratio) * (coitem_price * coitem_price_invuomratio)
        END AS amt_report

   FROM cohead, coitem, itemsite, item
  WHERE ((cohead_prj_id = <? value("prj_id"?>)
         AND (coitem_cohead_id = cohead_id)
         AND (coitem_itemsite_id = itemsite_id)
         AND (itemsite_item_id = item_id))

 UNION

 SELECT invchead_id AS id,
        40 AS typeid,
        text('Section 3 - Invoiced Revenue') AS section,
        text('Invoice - Closed Sales Order Lines') AS type,
        text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
        CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
             WHEN invchead_printed = 'N'  THEN 'Not Printed'
        END AS status,

        CASE WHEN invcitem_id <> '-1'  THEN item_number
              WHEN invcitem_id = '-1'  THEN invcitem_number
        END AS item,
        formatQty(invcitem_ordered) AS f_qty,
-       formatQty(invcitem_ordered * invcitem_price) AS f_value,
-       invcitem_ordered * invcitem_price AS amt_value,
-       invcitem_ordered * invcitem_price AS amt_report
+       formatQty((invcitem_ordered * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
+       (invcitem_ordered * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
+       (invcitem_ordered * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report

   FROM invchead, invcitem, item
   WHERE ((invchead_prj_id= <? value("prj_id") ?> )
         AND (invcitem_invchead_id = invchead_id)
         AND (invcitem_item_id = item_id)
         AND (invchead_ordernumber in (select cohead_number from coitem, cohead where coitem_cohead_id = cohead_id AND coitem_status = 'C')))

 UNION

 SELECT invchead_id AS id,
        45 AS typeid,
        text('Section 3 - Invoiced Revenue') AS section,
        text('Invoice - Open Sales Order Lines') AS type,
        text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
        CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
             WHEN invchead_printed = 'N'  THEN 'Not Printed'
        END AS status,

        CASE WHEN invcitem_id <> '-1'  THEN item_number
              WHEN invcitem_id = '-1'  THEN invcitem_number
        END AS item,
        formatQty(invcitem_ordered) AS f_qty,
        text('SO Line Open - See Sales Order') AS f_value,
        0 AS amt_value,
        0 AS amt_report

   FROM invchead, invcitem, item
   WHERE ((invchead_prj_id= <? value("prj_id") ?> )
         AND (invcitem_invchead_id = invchead_id)
         AND (invcitem_item_id = item_id)
         AND (invchead_ordernumber in (select cohead_number from coitem, cohead where coitem_cohead_id = cohead_id AND coitem_status <> 'C')))

 UNION

 SELECT invchead_id AS id,
        50 AS typeid,
        text('Section 3 - Invoiced Revenue') AS section,
        text('Invoice - Misc., No SO Number - User Defined Item') AS type,
        text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
        CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
             WHEN invchead_printed = 'N'  THEN 'Not Printed'
        END AS status,

        invcitem_number AS item,
        formatQty(invcitem_billed) AS f_qty,
-       formatQty(invcitem_billed * invcitem_price) AS f_value,
-       invcitem_billed * invcitem_price AS amt_value,
-       invcitem_billed * invcitem_price AS amt_report
+       formatQty((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
+       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
+       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report

   FROM invchead, invcitem
   WHERE ((invchead_prj_id= <? value("prj_id") ?>)
         AND (invcitem_invchead_id = invchead_id)
         AND (invchead_ordernumber is null))


 UNION

 SELECT invchead_id AS id,
        52 AS typeid,
        text('Section 3 - Invoiced Revenue') AS section,
        text('Invoice - Misc., User SO Number - User Defined Item ') AS type,
        text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
        CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
             WHEN invchead_printed = 'N'  THEN 'Not Printed'
        END AS status,

        invcitem_number AS item,
        formatQty(invcitem_billed) AS f_qty,
-       formatQty(invcitem_billed * invcitem_price) AS f_value,
-       invcitem_billed * invcitem_price AS amt_value,
-       invcitem_billed * invcitem_price AS amt_report
+       formatQty((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
+       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
+       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report

   FROM invchead, invcitem
   WHERE ((invchead_prj_id= <? value("prj_id") ?>)
         AND (invcitem_invchead_id = invchead_id)
         AND (invchead_ordernumber is not null)
         AND (invcitem_item_id = -1))

 UNION

 SELECT invchead_id AS id,
        56 AS typeid,
        text('Section 3 - Invoiced Revenue') AS section,
        text('Invoice - Misc., User SO Number - Normal Item') AS type,
        text(invchead_invcnumber) || '-' || text(invcitem_linenumber) AS ordernumber,
        CASE WHEN invchead_printed = 'Y'  THEN 'Printed'
             WHEN invchead_printed = 'N'  THEN 'Not Printed'
        END AS status,

        CASE WHEN invcitem_id <> '-1'  THEN item_number
              WHEN invcitem_id = '-1'  THEN invcitem_number
        END AS item,
        formatQty(invcitem_billed) AS f_qty,
-       formatQty(invcitem_billed * invcitem_price) AS f_value,
-       invcitem_billed * invcitem_price AS amt_value,
-       invcitem_billed * invcitem_price AS amt_report
+       formatQty((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio)) AS f_value,
+       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_value,
+       (invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / invcitem_price_invuomratio) AS amt_report

   FROM invchead, invcitem, item
   WHERE ((invchead_prj_id= <? value("prj_id") ?> )
         AND (invcitem_invchead_id = invchead_id)
         AND (invcitem_item_id = item_id)
         AND (invchead_ordernumber not in (select cohead_number from coitem, cohead where coitem_cohead_id = cohead_id)
         AND (invchead_ordernumber is not null)))


 <? endif ?>


 <? if exists("showWo") ?>

 <?   if exists("showSo") ?>

 UNION

 <?   endif ?>

 SELECT wo_id AS id,
        90 AS typeid,
        text('Section 6 - Work Order Expense') AS section,
        text('Work Orders') AS type,
        formatWoNumber(wo_id) AS ordernumber,
        wo_status AS status,
        item_number AS item,
        formatQty(wo_qtyord) AS f_qty,

        CASE WHEN wo_status <> 'I'  THEN formatQty(wo_postedvalue)
             WHEN wo_status  = 'I' THEN formatQty(wo_wipvalue)
        END AS f_value,

        CASE WHEN wo_status <> 'I'  THEN wo_postedvalue
             WHEN wo_status  = 'I' THEN wo_wipvalue
        END AS amt_value,

        CASE WHEN wo_status <> 'I'  THEN wo_postedvalue * -1
             WHEN wo_status  = 'I' THEN wo_wipvalue * -1
        END AS amt_report

   FROM wo, itemsite, item
  WHERE ((wo_prj_id=<? value("prj_id") ?>)
        AND (wo_itemsite_id = itemsite_id)
        AND (itemsite_item_id = item_id))
 <? endif ?>


 <? if exists("showPo") ?>
 <?   if exists("showSo") ?>
  UNION
 <? elseif exists("showWo") ?>
  UNION

 <? endif ?>

 SELECT pr_id AS id,
        60 AS typeid,
        text('Section 4 - Pro Forma Expense (Purchase Requests)') AS section,
        text('Purchase Requests - Values At Standard') AS type,
        text(pr_number) AS ordernumber,
        pr_status AS status,
        item_number AS item,
        formatQty(pr_qtyreq) AS f_qty,
        formatQty(stdcost(item_id) * pr_qtyreq) AS f_value,
        stdcost(item_id) * pr_qtyreq AS amt_value,
        stdcost(item_id) * pr_qtyreq * -1 AS amt_report
   FROM pr, item, itemsite
  WHERE ((pr_prj_id=<? value("prj_id") ?>)
        AND (pr_itemsite_id = itemsite_id)
        AND (itemsite_item_id = item_id)
        AND (pr_itemsite_id = itemsite_id)
        AND (itemsite_item_id = item_id))

 UNION

 SELECT poitem_id AS id,
        70 AS typeid,
        text('Section 5 - Purchase Expense') AS section,
        text('Purchase Order - Stocked Items') AS type,
        (text(pohead_number) || '-' || text(poitem_linenumber)) AS ordernumber,
        poitem_status AS status,

        item_number AS item,

        formatQty(poitem_qty_ordered) AS f_qty,
        formatQty(poitem_qty_ordered * poitem_unitprice) AS f_value,
        poitem_qty_ordered * poitem_unitprice AS amt_value,
        poitem_qty_ordered * poitem_unitprice * -1 AS amt_report
   FROM pohead, poitem, itemsite, item
  WHERE ((poitem_pohead_id = pohead_id)
    AND  (poitem_prj_id = <? value("prj_id") ?>)
    AND  (poitem_itemsite_id = itemsite_id)
    AND  (itemsite_item_id = item_id))

 UNION

 SELECT poitem_id AS id,
        80 AS typeid,
        text('Section 5 - Purchase Expense') AS section,
        text('Purcahse Order - Inventory Items') AS type,
        (text(pohead_number) || '-' || text(poitem_linenumber)) AS ordernumber,
        poitem_status AS status,

        poitem_vend_item_number AS item,

        formatQty(poitem_qty_ordered) AS f_qty,
        formatQty(poitem_qty_ordered * poitem_unitprice) AS f_value,
        poitem_qty_ordered * poitem_unitprice AS amt_value,
        poitem_qty_ordered * poitem_unitprice * -1 AS amt_report

   FROM pohead, poitem
  WHERE ((poitem_pohead_id = pohead_id)
    AND  (poitem_prj_id = <? value("prj_id") ?>)
    AND  (poitem_itemsite_id = '-1'))

 <? endif ?>

 ORDER BY section, typeid, ordernumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: POHistory
 QUERY: detail
 SELECT poitem_linenumber as f_number,
-       item_number as f_item, item_invuom as f_uom1,
+       item_number as f_item, uom_name as f_uom1,
        formatDate(poitem_duedate) as f_duedate,
        poitem_vend_item_number as f_vend_item,
        poitem_vend_uom as f_uom2,
        formatQty(poitem_qty_ordered) as f_ordered,
        formatqty(poitem_qty_received) as f_received
-  FROM poitem, itemsite, item
+  FROM poitem, itemsite, item, uom
  WHERE ((poitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (poitem_pohead_id=<? value("pohead_id") ?>))
 ORDER BY poitem_linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: POLineItemsByDate
 QUERY: detail
 SELECT CASE WHEN (itemsite_id IS NULL) THEN ( SELECT warehous_code
                                               FROM warehous
                                               WHERE (pohead_warehous_id=warehous_id) )
             ELSE ( SELECT warehous_code
                    FROM warehous
                    WHERE (itemsite_warehous_id=warehous_id) )
        END AS warehousecode,
        pohead_number as f_ponumber,
        poitem_linenumber as f_linenumber,
        vend_name,
        formatDate(poitem_duedate) as f_duedate,
        COALESCE(item_number, (text('NonInv - ') || poitem_vend_item_number)) AS itemnumber,
-       COALESCE(item_invuom, poitem_vend_uom) AS itemuom,
+       COALESCE(uom_name, poitem_vend_uom) AS itemuom,
        formatQty(poitem_qty_ordered) as f_ordered,
        formatQty(poitem_qty_received) as f_received,
        formatQty(poitem_qty_returned) as f_returned
   FROM pohead, vend,
        poitem LEFT OUTER JOIN
          (itemsite JOIN item
-           ON (itemsite_item_id=item_id))
+           ON (itemsite_item_id=item_id) JOIN uom ON (item_inv_uom_id=uom_id))
          ON (poitem_itemsite_id=itemsite_id)
  WHERE ((poitem_pohead_id=pohead_id)
    AND (pohead_vend_id=vend_id)
    AND (poitem_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND ( ( (itemsite_id IS NULL) AND (pohead_warehous_id=<? value("warehous_id") ?>) ) OR
          ( (itemsite_id IS NOT NULL) AND (itemsite_warehous_id=<? value("warehous_id") ?>) ) )
 <? endif ?>
 <? if exists("agentUsername") ?>
    AND (pohead_agent_username=<? value("agentUsername") ?>)
 <? endif ?>
 <? if exists("openItems") ?>
    AND (poitem_status='O')
 <? elseif exists("closedItems") ?>
    AND (poitem_status='C')
 <? endif ?>
 )
 ORDER BY poitem_duedate;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: POLineItemsByItem
 QUERY: head
-SELECT item_number, item_descrip1, item_descrip2, item_invuom,
+SELECT item_number, item_descrip1, item_descrip2, uom_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code FROM warehous WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Warehouses')
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
-  FROM item
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT warehous_code, pohead_number as f_ponumber, vend_name,
        formatDate(poitem_duedate) as f_duedate,
-       poitem_vend_uom as item_invuom,
+       poitem_vend_uom as uom_name,
        formatQty(poitem_qty_ordered) as f_ordered,
        formatQty(poitem_qty_received) as f_received,
        formatQty(poitem_qty_returned) as f_returned
   FROM pohead, poitem, vend, itemsite, warehous
  WHERE ((poitem_pohead_id=pohead_id)
    AND (pohead_vend_id=vend_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("agentUsername") ?>
    AND (pohead_agent_username=<? value("agentUsername") ?>)
 <? endif ?>
 <? if exists("openItems") ?>
    AND (poitem_status='O')
 <? elseif exists("closedItems") ?>
    AND (poitem_status='C')
 <? endif ?>
    AND (poitem_itemsite_id=itemsite_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
 )
 ORDER BY poitem_duedate;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: POLineItemsByVendor
 QUERY: detail
 SELECT CASE WHEN (itemsite_id IS NULL) THEN ( SELECT warehous_code
                                               FROM warehous
                                               WHERE (pohead_warehous_id=warehous_id) )
             ELSE ( SELECT warehous_code
                    FROM warehous
                    WHERE (itemsite_warehous_id=warehous_id) )
        END AS warehousecode,
        pohead_number as f_ponumber,
        formatDate(poitem_duedate) as f_duedate,
        COALESCE(item_number, (text('NonInv - ') || poitem_vend_item_number)) AS itemnumber,
-       COALESCE(item_invuom, poitem_vend_uom) AS itemuom,
+       COALESCE(uom_name, poitem_vend_uom) AS itemuom,
        formatQty(poitem_qty_ordered) as f_ordered,
        formatQty(poitem_qty_received) as f_received,
        formatQty(poitem_qty_returned) as f_returned
   FROM pohead,
        poitem LEFT OUTER JOIN
        ( itemsite JOIN item
-         ON (itemsite_item_id=item_id) )
+         ON (itemsite_item_id=item_id) JOIN uom ON (item_inv_uom_id=uom_id))
        ON (poitem_itemsite_id=itemsite_id)
  WHERE ((poitem_pohead_id=pohead_id)
 <? if exists("warehous_id") ?>
    AND ( ( (itemsite_id IS NULL) AND (pohead_warehous_id=<? value("warehous_id") ?>) ) OR
          ( (itemsite_id IS NOT NULL) AND (itemsite_warehous_id=<? value("warehous_id") ?>) ) )
 <? endif ?>
 <? if exists("agentUsername") ?>
    AND (pohead_agent_username=<? value("agentUsername") ?>)
 <? endif ?>
 <? if exists("poNumber") ?>
    AND (pohead_number=<? value("poNumber") ?>)
 <? endif ?>
 <? if exists("openItems") ?>
    AND (poitem_status='O')
 <? elseif exists("closedItems") ?>
    AND (poitem_status='C')
 <? endif ?>
    AND (pohead_vend_id=<? value("vend_id") ?>))
 ORDER BY poitem_duedate, pohead_number, poitem_linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PackingList-Shipment
 QUERY: detail
 SELECT 1 AS groupby,
        coitem_linenumber AS linenumber,
        coitem_memo AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formatsoitembarcode(coitem_id) AS orderitem_barcode,
-       item_invuom,
+--     In 2.3 replaced the next line:
+--     uom_name,
+--     with:
+       (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        item_shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(coitem_qtyord) AS ordered,
        formatQty(coship_qty) AS atshipping,

-       formatQty(roundUp(coitem_qtyord /
+       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) /
                          CASE WHEN(item_shipinvrat = 0) THEN 1
                                                         ELSE item_shipinvrat
                          END)) AS shipordered,
        formatQty(roundUp(coship_qty /
                          CASE WHEN(item_shipinvrat = 0) THEN 1
                                                         ELSE item_shipinvrat
                          END ) ) AS shipatshipping,

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
-  FROM itemsite, item, coitem, coship
+  FROM itemsite, item, coitem, coship, uom
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
    AND (coitem_id=coship_coitem_id)
    AND (coship_cosmisc_id=<? value("cosmisc_id") ?>)
 )
-GROUP BY coitem_linenumber, coitem_id, coitem_memo, item_number, item_invuom, item_shipuom,
-         item_descrip1, item_descrip2, coitem_qtyord, coitem_qtyshipped,
+--2.3 add coitem_qty_uom_id, to the GROUP BY clause
+GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_shipuom,
+         item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, item_shipinvrat, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id, coship_qty
 <? if exists("MultiWhs") ?>
 UNION
 SELECT 2 AS groupby,
        toitem_linenumber AS linenumber,
        '' AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formattoitembarcode(toitem_id) AS orderitem_barcode,
-       item_invuom,
+       uom_name,
        item_shipuom,
        item_descrip1,
        item_descrip2,

        formatQty(toitem_qty_ordered) AS ordered,
        formatQty(shipitem_qty) AS atshipping,

        formatQty(roundUp(toitem_qty_ordered /
                          CASE WHEN (item_shipinvrat = 0) THEN 1
                                                          ELSE item_shipinvrat
                          END)) AS shipordered,
        formatQty(roundUp(shipitem_qty /
                          CASE WHEN (item_shipinvrat = 0) THEN 1
                                                          ELSE item_shipinvrat
                          END)) AS shipatshipping,

        toitem_status AS f_status
-  FROM itemsite, item, toitem, tohead, shipitem, shiphead
+  FROM itemsite, item, toitem, tohead, shipitem, shiphead, uom
  WHERE ((toitem_item_id=item_id)
+   AND  (item_inv_uom_id=uom_id)
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

 QUERY: so_ra_relation
 --added in 2.3 to show RA link to S/O if the SO
 --was created as the result of a replacement RA
 select
 'RA #' AS ratext,
 rahead_number
 from
 rahead, cohead, shiphead
 where
 rahead_new_cohead_id = cohead_id
 and cohead_id = shiphead_order_id
 and shiphead_id = <? value("shiphead_id") ?>;
 --------------------------------------------------------------------
 

 --------------------------------------------------------------------
 REPORT: PackingList
 QUERY: head
-<? if not exists("cosmisc_id") ?>
---Run query if no cosmisc_id passed - No Shipment Pack List
-SELECT cust_number,
+SELECT COALESCE(shiphead_number::TEXT, 'Not Issued To Shipping') AS shiphead_number,
+	      'S/O #:' AS ordertype,
+       cohead_number AS ordernumber,
        formatsobarcode(cohead_id) AS order_barcode,
-
-       formataddr(cohead_billtoaddress1, cohead_billtoaddress2, cohead_billtoaddress3, (cohead_billtocity || '  ' ||   cohead_billtostate || '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address,
-
-  formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3, (cohead_shiptocity || '  ' ||   cohead_shiptostate || '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,
-
-       cust_contact,
-       cohead_billtoname,
-       cohead_billtoaddress1,
-       cohead_billtoaddress2,
-       cohead_billtoaddress3,
-       (cohead_billtocity || '  ' || cohead_billtostate || '  ' || cohead_billtozipcode) AS billtocitystatezip,
-       cust_phone,
-       cohead_shiptoname,
-       cohead_shiptoaddress1,
-       cohead_shiptoaddress2,
-       cohead_shiptoaddress3,
-       (cohead_shiptocity || '  ' || cohead_shiptostate || ' ' || cohead_shiptozipcode) AS shiptocitystatezip,
-       cohead_number,
-       cohead_shipvia,
-       cohead_shiptophone,
+       -- in 2.3: use the shipment info if we have one
+       COALESCE(shiphead_shipvia, cohead_shipvia) AS shipvia,
+       cohead_shiptophone AS shiptophone,
        cohead_custponumber,
        formatDate(cohead_orderdate) AS orderdate,
-       cohead_shipcomments,
-       terms_descrip
-  FROM cohead, cust, terms
- WHERE ((cohead_cust_id=cust_id)
-   AND (cohead_terms_id=terms_id)
-   AND (cohead_id=<? value("sohead_id") ?>)
-);
-
--------------------
-<? else ?>
---Run New Query for Header with shipment number
------------------------------------------------
-
-SELECT cosmisc_number,
-
-       cohead_number,
-       formatsobarcode(cohead_id) AS order_barcode,
-       cohead_shipvia,
-       cohead_shiptophone,
-       cohead_custponumber,
-       formatDate(cohead_orderdate) AS orderdate,
-       cohead_shipcomments,
-       cohead_billtoname,
-       formataddr(cohead_billtoaddress1, cohead_billtoaddress2, cohead_billtoaddress3,
-                  (cohead_billtocity || '  ' ||   cohead_billtostate || '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address,
-       cohead_shiptoname,
-       formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3,
-                  (cohead_shiptocity || '  ' ||   cohead_shiptostate || '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,
+       cohead_shipcomments AS shipcomments,
+       cohead_billtoname AS billtoname,
+       formataddr(cohead_billtoaddress1, cohead_billtoaddress2,
+                  cohead_billtoaddress3,
+                  (cohead_billtocity || '  ' ||   cohead_billtostate ||
+                  '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address,
+       cohead_shiptoname AS shiptoname,
+       formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2,
+                  cohead_shiptoaddress3,
+                  (cohead_shiptocity || '  ' ||   cohead_shiptostate ||
+                  '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,

        cust_number,
        cust_contact,
        cust_phone,
-
        terms_descrip
-  FROM cosmisc, cohead, cust, terms
+  -- In 2.3: rearrange FROM and WHERE to use shiphead_id or order head_id, whichever we have
+  FROM cust, terms, cohead
+<? if exists("shiphead_id") ?>
+	JOIN
+<? else ?>
+	LEFT OUTER JOIN
+<? endif ?>
+       shiphead ON ((shiphead_id=<? value("shiphead_id") ?>)
+		AND (shiphead_order_id=cohead_id)
+		AND (shiphead_order_type='SO'))
  WHERE ((cohead_cust_id=cust_id)
    AND (cohead_terms_id=terms_id)
-   AND (cohead_id=cosmisc_cohead_id)
-   AND (cosmisc_id=<? value("cosmisc_id") ?>)
-);
+<? if exists("head_id") ?>
+   AND  (<? value("head_type") ?>='SO')
+   AND  (cohead_id=<? value("head_id") ?>)
+<? endif ?>
+)

+<? if exists("MultiWhs") ?>
+UNION
+SELECT COALESCE(shiphead_number::TEXT, 'Not Issued To Shipping') AS shiphead_number,
+      'T/O #:' AS ordertype,
+       tohead_number AS ordernumber,
+       formattobarcode(tohead_id) AS order_barcode,
+       -- in 2.3: use the shipment info if we have one
+       COALESCE(shiphead_shipvia, tohead_shipvia) AS shipvia,
+       tohead_destphone AS shiptophone,
+       TEXT(tohead_number) AS cohead_custponumber,
+       formatDate(tohead_orderdate) AS orderdate,
+       tohead_shipcomments AS shipcomments,
+       '' AS billtoname,
+       '' AS billing_address,
+       tohead_destname AS shiptoname,
+       formataddr(tohead_destaddress1, tohead_destaddress2,
+                   tohead_destaddress3,
+                  (tohead_destcity || ' ' || tohead_deststate ||
+                   ' ' || tohead_destpostalcode), tohead_destcountry) AS shipping_address,
+       'Transfer Order' AS cust_number,
+       tohead_destcntct_name AS cust_contact,
+       tohead_destphone AS cust_phone,
+       '' AS terms_descrip
+  -- In 2.3: rearrange FROM and WHERE to use shiphead_id or order head_id, whichever we have
+  FROM tohead
+<? if exists("shiphead_id") ?>
+	JOIN
+<? else ?>
+	LEFT OUTER JOIN
+<? endif ?>
+       shiphead ON ((shiphead_id=<? value("shiphead_id") ?>)
+		AND (shiphead_order_id=tohead_id)
+		AND (shiphead_order_type='TO'))
+<? if exists("head_id") ?>
+ WHERE ((<? value("head_type") ?>='TO')
+   AND  (tohead_id=<? value("head_id") ?>)
+   )
 <? endif ?>
+<? endif ?>;
 --------------------------------------------------------------------

 QUERY: scheddate
-<? if not exists("cosmisc_id") ?>
---Query without shipment number
-
-SELECT formatDate(MIN(coitem_scheddate)) AS scheddate
-  FROM coitem
- WHERE ((coitem_status <> 'X') AND (coitem_cohead_id=<? value("sohead_id") ?>));
-
---
-<? else ?>
---------------------------
-
-
-SELECT formatDate(MIN(coitem_scheddate)) AS scheddate
-  FROM coitem, coship
- WHERE ((coitem_status <> 'X')
-   AND  (coitem_id=coship_coitem_id)
-   AND  (coship_cosmisc_id=<? value("cosmisc_id") ?>));
-
+SELECT formatDate(MIN(orderitem_scheddate)) AS scheddate
+  -- In 2.3: use orderitem view to get sched date regardless of order type
+  FROM orderitem
+  -- In 2.3: use shiphead_id if we have it
+       <? if exists("shiphead_id") ?>
+       JOIN shiphead ON ((orderitem_orderhead_type=shiphead_order_type)
+		     AND (orderitem_orderhead_id=shiphead_order_id)
+		     AND (shiphead_id=<? value("shiphead_id")?>))
+       JOIN shipitem ON ((shiphead_id=shipitem_shiphead_id)
+		     AND (shipitem_orderitem_id=orderitem_id))
+       <? endif ?>
+ WHERE ((orderitem_status <> 'X')
+-- In 2.3: use order's head_id if we have it
+<? if exists("head_id") ?>
+   AND  (orderitem_orderhead_type=<? value("head_type") ?>)
+   AND  (orderitem_orderhead_id=<? value("head_id") ?>)
 <? endif ?>
+ );
 --------------------------------------------------------------------

 QUERY: detail
-<? if not exists("cosmisc_id") ?>
 SELECT 1 AS groupby,
-       coitem_linenumber,
-       coitem_memo,
+       coitem_linenumber AS linenumber,
+       coitem_memo AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
-       item_invuom,
+       formatsoitembarcode(coitem_id) AS orderitem_barcode,
+--     In 2.3 replaced the next line:
+--     uom_name,
+--     with:
+       (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        item_shipuom,
        item_descrip1,
        item_descrip2,
+
        formatQty(coitem_qtyord) AS ordered,
-       formatQty(coitem_qtyshipped - coitem_qtyreturned) AS shipped,
-       formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS balance,
-       formatQty( ( SELECT COALESCE(SUM(coship_qty), 0)
-                    FROM coship, cosmisc
-                    WHERE ( (coship_coitem_id=coitem_id)
-                     AND (coship_cosmisc_id=cosmisc_id)
-                     AND (NOT cosmisc_shipped) ) ) ) AS atshipping,
-       formatQty(roundUp(coitem_qtyord / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipordered,
-       formatQty(roundUp((coitem_qtyshipped - coitem_qtyreturned) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipshipped,
-       formatQty(roundUp(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipbalance,
-       formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
-                            FROM coship, cosmisc
-                            WHERE ( (coship_coitem_id=coitem_id)
-                              AND (coship_cosmisc_id=cosmisc_id)
-                              AND (NOT cosmisc_shipped) ) )/ CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END ) ) AS shipatshipping,
-       CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
+       -- In 2.3: use qtyAtShipping instead joining with the deprecated coship
+       formatQty(qtyAtShipping('SO', coitem_id)) AS atshipping,
+
+       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) /
+                         CASE WHEN(item_shipinvrat = 0) THEN 1
+                                                        ELSE item_shipinvrat
+                         END)) AS shipordered,
+       -- In 2.3: use qtyAtShipping instead joining with the deprecated coship
+       formatQty(roundUp(qtyAtShipping('SO', coitem_id) /
+                         CASE WHEN(item_shipinvrat = 0) THEN 1
+                                                        ELSE item_shipinvrat
+                         END)) AS shipatshipping,
+
+       CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus
+                                           FROM cust,cohead
+                                          WHERE coitem_cohead_id=cohead_id
+                                            AND cust_id=cohead_cust_id)='H') THEN 'H'
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
-  FROM itemsite, item, coitem
+  -- In 2.3: remove uses of the deprecated coship in FROM, WHERE, and GROUP BY
+  FROM itemsite, item, coitem, uom
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
-
-   <? if exists("hide closed") ?>
--- Removing line below shows Closed Lines
--- AND (coitem_status <> 'C')
-   <? endif ?>
-
-   AND (coitem_cohead_id=<? value("sohead_id") ?>)
+-- In 2.3: use the shiphead_id if we have it and the order head_id if we have it
+<? if exists("shiphead_id") ?>
+   AND  (coitem_cohead_id IN (SELECT shiphead_order_id FROM shiphead
+			      WHERE ((shiphead_id=<? value("shiphead_id") ?>)
+			        AND  (shiphead_order_type='SO'))))
+<? endif ?>
+<? if exists("head_id") ?>
+   AND  (<? value("head_type") ?>='SO')
+   AND  (coitem_cohead_id=<? value("head_id") ?>)
+<? endif ?>
 )
-GROUP BY coitem_linenumber, coitem_id, coitem_memo, item_number, item_invuom, item_shipuom,
-         item_descrip1, item_descrip2, coitem_qtyord, coitem_qtyshipped,
+--2.3 add coitem_qty_uom_id, to the GROUP BY clause
+GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_shipuom,
+         item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, item_shipinvrat, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
-ORDER BY coitem_linenumber;
-
-------------------
-<? else ?>
-------------------
-
-SELECT 1 AS groupby,
-       coitem_linenumber,
-       coitem_memo,
+<? if exists("MultiWhs") ?>
+UNION
+SELECT 2 AS groupby,
+       toitem_linenumber AS linenumber,
+       '' AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
-       item_invuom,
+       formattoitembarcode(toitem_id) AS orderitem_barcode,
+       uom_name,
        item_shipuom,
        item_descrip1,
        item_descrip2,

-       formatQty(coitem_qtyord) AS ordered,
-       formatQty(coship_qty) AS atshipping,
+       formatQty(toitem_qty_ordered) AS ordered,
+       -- In 2.3: use qtyAtShipping instead of joining with the shipitem table
+       formatQty(qtyAtShipping('TO', toitem_id)) AS atshipping,

-       formatQty(roundUp(coitem_qtyord /
-                         CASE WHEN(item_shipinvrat = 0) THEN 1
+       formatQty(roundUp(toitem_qty_ordered /
+                         CASE WHEN (item_shipinvrat = 0) THEN 1
                                                         ELSE item_shipinvrat
                          END)) AS shipordered,
-       formatQty(roundUp(coship_qty /
-                         CASE WHEN(item_shipinvrat = 0) THEN 1
+       -- In 2.3: use qtyAtShipping instead of joining with the shipitem table
+       formatQty(roundUp(qtyAtShipping('TO', toitem_id) /
+                         CASE WHEN (item_shipinvrat = 0) THEN 1
                                                         ELSE item_shipinvrat
-                         END ) ) AS shipatshipping,
+                         END)) AS shipatshipping,

-       CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus
-                                           FROM cust,cohead
-                                          WHERE coitem_cohead_id=cohead_id
-                                            AND cust_id=cohead_cust_id)='H') THEN 'H'
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
-  FROM itemsite, item, coitem, coship
- WHERE ( (coitem_itemsite_id=itemsite_id)
-   AND (itemsite_item_id=item_id)
-   AND (coitem_status <> 'X')
-   AND (coitem_id=coship_coitem_id)
-   AND (coship_cosmisc_id=<? value("cosmisc_id") ?>)
+       toitem_status AS f_status
+  FROM itemsite, item, toitem, tohead, uom
+  -- In 2.3: remove uses of the shipitem and shiphead tables in FROM and WHERE
+ WHERE ((toitem_item_id=item_id)
+   AND  (item_inv_uom_id=uom_id)
+   AND  (item_id=itemsite_item_id)
+   AND  (toitem_tohead_id=tohead_id)
+   AND  (toitem_status <> 'X')
+   AND  (tohead_src_warehous_id=itemsite_warehous_id)
+-- In 2.3: use the shiphead_id if we have it and the order head_id if we have it
+<? if exists("shiphead_id") ?>
+   AND  (toitem_tohead_id IN (SELECT shiphead_order_id FROM shiphead
+			      WHERE ((shiphead_id=<? value("shiphead_id") ?>)
+			        AND  (shiphead_order_type='TO'))))
+<? endif ?>
+<? if exists("head_id") ?>
+   AND  (<? value("head_type") ?>='TO')
+   AND  (toitem_tohead_id=<? value("head_id") ?>)
+<? endif ?>
 )
---GROUP BY coitem_linenumber, coitem_id, coitem_memo, item_number, item_invuom, item_shipuom,
---         item_descrip1, item_descrip2, coitem_qtyord, coitem_qtyshipped,
---         coitem_qtyreturned, item_shipinvrat, coitem_status, coitem_cohead_id,
---         itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id, coship_qty
-ORDER BY coitem_linenumber;
-
 <? endif ?>
+ORDER BY linenumber;
 --------------------------------------------------------------------

-QUERY: lotdetail
-select distinct
-cosmisc_number,
-(cohead_number || '-' || coitem_linenumber) AS ordernumber,
-item_number,
-invdetail_lotserial,
-invdetail_qty * -1 AS lotqty,
-invhist_invqty as totalshipmentqty,
-invhist_transtype,
-formatdate(invhist_transdate) AS invhistdate,
-formatdate(coship_transdate) AS shiptransdate
---comment_text,
---cmnttype_name
-
-
-from cosmisc, coship, cohead, coitem, itemsite, item, invhist, invdetail, lsdetail
-
---left outer join comment on (comment_source_id = lsdetail_id)
---left outer join cmnttype on (comment_cmnttype_id = cmnttype_id)
-
-where
-
-(
-
---(cmnttype_name = 'Calc_Date_Activity')
---AND
-
-(coship_cosmisc_id = <? value("cosmisc_id") ?>)
-AND
-(cohead_id = <? value("sohead_id") ?>)
-AND
-invdetail_lotserial = lsdetail_lotserial
-AND
-(cosmisc_id = coship_cosmisc_id)
-AND
-(formatdate(invhist_transdate) = formatdate(coship_transdate))
-AND
-(coship_coitem_id = coitem_id)
-AND
-(coitem_itemsite_id = itemsite_id)
-AND
-(item_id = itemsite_item_id)
-AND
-(invhist_ordnumber = (cohead_number || '-' || coitem_linenumber))
-AND
-(invhist_ordtype = 'SO')
-AND
-(invdetail_invhist_id = invhist_id)
-AND
-(invhist_transtype = 'SH')
-)
-
-ORDER BY ordernumber;
---------------------------------------------------------------------
-

 --------------------------------------------------------------------
 REPORT: PackingListBatchEditList
 QUERY: detail
 SELECT cohead_number,
        formatShipmentNumber(sopack_cosmisc_id) AS cosmisc_number,
        cust_number,
        cohead_billtoname,
        CASE WHEN (cohead_holdtype='N') THEN 'None'
             WHEN (cohead_holdtype='S') THEN 'Ship'
             WHEN (cohead_holdtype='P') THEN 'Pack'
+            WHEN (cohead_holdtype='R') THEN 'Return'
             ELSE 'Other'
        END AS f_holdtype,
        formatBoolYN(sopack_printed) as f_printed
 FROM sopack, cohead, cust
 WHERE ( (sopack_sohead_id=cohead_id)
  AND (cohead_cust_id=cust_id) )
 ORDER BY cohead_number;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PartiallyShippedOrders
 QUERY: detail
-SELECT CASE WHEN (cohead_holdtype IN ('P', 'C')) THEN -1
+SELECT CASE WHEN (cohead_holdtype IN ('P', 'C', 'R')) THEN -1
             ELSE cohead_id
        END AS _coheadid, cohead_id,
        cohead_holdtype, cohead_number, cust_name,
-       CASE WHEN (cohead_holdtype='N') THEN 'None'
-            WHEN (cohead_holdtype='C') THEN 'Credit'
-            WHEN (cohead_holdtype='S') THEN 'Ship'
-            WHEN (cohead_holdtype='P') THEN 'Pack'
-            ELSE 'Other'
+       CASE WHEN (cohead_holdtype='N') THEN <? value("none") ?>
+            WHEN (cohead_holdtype='C') THEN <? value("credit") ?>
+            WHEN (cohead_holdtype='S') THEN <? value("ship") ?>
+            WHEN (cohead_holdtype='P') THEN <? value("pack") ?>
+            WHEN (cohead_holdtype='R') THEN <? value("return") ?>
+            ELSE <? value("Other") ?>
        END AS f_holdtype,
        formatDate(cohead_orderdate) AS f_orderdate,
        formatDate(MIN(coitem_scheddate)) AS f_scheddate,
        formatDate(cohead_packdate) AS f_packdate,
        <? if exists("showPrices") ?>
-         formatExtPrice( SUM( noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) *
-                            (coitem_price / item_invpricerat) ) )
+         formatExtPrice( SUM( (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
+                            (coitem_price / coitem_price_invuomratio) ) )
        <? else ?>
          text('')
        <? endif ?>
        AS f_extprice,
-       SUM( noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) *
-            (coitem_price / item_invpricerat) ) AS backlog,
+       SUM( (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
+            (coitem_price / coitem_price_invuomratio) ) AS backlog,
        MIN(coitem_scheddate) AS scheddate,
        COALESCE(MIN(coship_id), 0) AS shipped
   FROM cohead, itemsite, item, cust,
        coitem LEFT OUTER JOIN coship ON (coship_coitem_id=coitem_id)
  WHERE ( (coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (coitem_status='O')
    AND (cohead_id IN ( SELECT DISTINCT coitem_cohead_id
                          FROM coitem
                         WHERE (coitem_qtyshipped > 0) ))
    AND (coitem_qtyshipped < coitem_qtyord)
    AND (coitem_scheddate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 GROUP BY cohead_id, cohead_number, cust_name, cohead_holdtype,
          cohead_orderdate, cohead_packdate
 ORDER BY scheddate, cohead_number;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PendingBOMChanges
 QUERY: head
 SELECT item_number,
-       item_invuom,
+       uom_name,
        item_descrip1,
        item_descrip2,
        CASE WHEN (<? value("cutOffDate") ?> >= date('12/31/2099')) THEN text('Latest')
             ELSE formatDate(<? value("cutOffDate") ?>)
        END AS cutoffdate
-  FROM item
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT formatDate(bomitem_effective) as actiondate,
        'Effective' AS action,
-       bomitem_seqnumber, item_number, item_invuom,
-       item_descrip1, item_descrip2, item_invuom,
-       formatQtyPer(bomitem_qtyper) AS qtyper,
+       bomitem_seqnumber, item_number, uom_name,
+       item_descrip1, item_descrip2, uom_name,
+       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS qtyper,
        formatScrap(bomitem_scrap) AS scrap,
-       formatQtyPer(bomitem_qtyper + (1 * bomitem_scrap)) AS qtyreq,
+       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper + (1 * bomitem_scrap))) AS qtyreq,
        formatDate(bomitem_effective, 'Always') AS effective,
        formatDate(bomitem_expires, 'Never') AS expires,
        formatBoolYN(bomitem_createwo) AS createchild,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS issuemethod
-  FROM bomitem, item
+  FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>), item, uom
  WHERE ((bomitem_item_id=item_id)
-   AND (bomitem_parent_item_id=<? value("item_id") ?>)
+   AND (item_inv_uom_id=uom_id)
    AND (bomitem_effective BETWEEN CURRENT_DATE AND <? value("cutOffDate") ?>)
 )
 UNION
 SELECT formatDate(bomitem_expires) as actiondate,
        'Expires' AS action,
-       bomitem_seqnumber, item_number, item_invuom,
-       item_descrip1, item_descrip2, item_invuom,
-       formatQtyPer(bomitem_qtyper) AS qtyper,
+       bomitem_seqnumber, item_number, uom_name,
+       item_descrip1, item_descrip2, uom_name,
+       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS qtyper,
        formatScrap(bomitem_scrap) AS scrap,
-       formatQtyPer(bomitem_qtyper + (1 * bomitem_scrap)) AS qtyreq,
+       formatQtyPer(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper + (1 * bomitem_scrap))) AS qtyreq,
        formatDate(bomitem_effective, 'Always') AS effective,
        formatDate(bomitem_expires, 'Never') AS expires,
        formatBoolYN(bomitem_createwo) AS createchild,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS issuemethod
-FROM bomitem, item
+FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>), item, uom
 WHERE ((bomitem_item_id=item_id)
- AND (bomitem_parent_item_id=<? value("item_id") ?>)
+ AND (item_inv_uom_id=uom_id)
  AND (bomitem_expires BETWEEN CURRENT_DATE AND <? value("cutOffDate") ?>)
 )
 ORDER BY action, actiondate, bomitem_seqnumber;

 --------------------------------------------------------------------

+QUERY: bomhead
+SELECT bomhead_docnum, bomhead_revision,
+formatDate(bomhead_revisiondate) AS f_revisiondate
+FROM bomhead
+WHERE ((bomhead_item_id=<? value("item_id") ?>)
+AND (bomhead_rev_id=<? value("revision_id") ?>));
+--------------------------------------------------------------------
+

 --------------------------------------------------------------------
 REPORT: PendingWOMaterialAvailability
 QUERY: detail
-SELECT bomitem_seqnumber, item_number, item_descrip1, item_descrip2, item_invuom,
+SELECT bomitem_seqnumber, item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(pendalloc) AS pendalloc,
        formatQty(totalalloc + pendalloc) AS totalalloc,
        formatQty(qoh) AS qoh,
        formatQty(qoh + ordered - (totalalloc + pendalloc)) AS totalavail
 FROM ( SELECT bomitem_seqnumber, item_number,
-              item_descrip1, item_descrip2, item_invuom,
-              ((bomitem_qtyper * (1 + bomitem_scrap)) * <? value("buildQty") ?>) AS pendalloc,
+              item_descrip1, item_descrip2, uom_name,
+              ((itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper * (1 + bomitem_scrap))) * <? value("buildQty") ?>) AS pendalloc,
               qtyAllocated(itemsite_id, date(<? value("buildDate") ?>)) AS totalalloc,
               noNeg(itemsite_qtyonhand) AS qoh,
               qtyOrdered(itemsite_id, date(<? value("buildDate") ?>)) AS ordered
-   FROM itemsite, item, bomitem
+   FROM itemsite, item, bomitem(<? value("item_id") ?>), uom
        WHERE ((bomitem_item_id=itemsite_item_id)
         AND (itemsite_item_id=item_id)
+        AND (item_inv_uom_id=uom_id)
         AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-        AND (bomitem_parent_item_id=<? value("item_id") ?>)
         AND (<? value("effectiveDate") ?> BETWEEN bomitem_effective AND (bomitem_expires-1)) ) ) AS data
 <? if exists("showShortages") ?>
 WHERE ((qoh + ordered - (totalalloc + pendalloc)) < 0.0)
 <? endif ?>
 ORDER BY bomitem_seqnumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PickList
 QUERY: Head
 SELECT formatWoNumber(wo_id) AS wonumber, wo_prodnotes,
-                item_number, item_invuom, item_descrip1, item_descrip2,
+                item_number, uom_name, item_descrip1, item_descrip2,
                 warehous_code, formatQty(wo_qtyord) AS qtyord,
                 formatQty(wo_qtyrcv) AS qtyrcv,
                 formatDate(wo_startdate) AS startdate,
                 formatDate(wo_duedate) AS duedate
-         FROM wo, itemsite, item, warehous
+         FROM wo, itemsite, item, warehous, uom
          WHERE ((wo_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
+          AND (item_inv_uom_id=uom_id)
           AND (itemsite_warehous_id=warehous_id)
           AND (wo_id=%1))

 --------------------------------------------------------------------

 QUERY: Detail
 SELECT item_number,
-       item_invuom,
+       uom_name,
        item_descrip1,
        item_descrip2,
        formatQty(womatl_qtyreq) AS qtyreq,
        formatQty(womatl_qtyiss) AS qtyiss,
        formatQty(noNeg(womatl_qtyreq - womatl_qtyiss)) AS qtybalance,
        itemsite_location,
        CASE WHEN (womatl_issuemethod='S') THEN text('Push')
             WHEN (womatl_issuemethod='L') THEN text('Pull')
             WHEN (womatl_issuemethod='M') THEN text('Mixed')
             ELSE text(womatl_issuemethod)
        END AS f_issuemethod
-  FROM womatl, itemsite, item
+  FROM womatl, itemsite, item, uom
  WHERE ((item_picklist)
    AND (womatl_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (womatl_uom_id=uom_id)
    AND (womatl_wo_id=%1) );

 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PickingListSOClosedLines
 QUERY: detail
 SELECT 1 AS groupby,
        coitem_linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
-       item_invuom,
+--     In 2.3 replaced the next line:
+--     uom_name,
+--     with:
+       (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        item_shipuom,
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
-       formatQty(roundUp(coitem_qtyord / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipordered,
-       formatQty(roundUp((coitem_qtyshipped - coitem_qtyreturned) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipshipped,
-       formatQty(roundUp(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipbalance,
+       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipordered,
+       formatQty(roundUp(((coitem_qtyshipped - coitem_qtyreturned) * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipshipped,
+       formatQty(roundUp((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipbalance,
        formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
                             FROM coship, cosmisc
                             WHERE ( (coship_coitem_id=coitem_id)
                               AND (coship_cosmisc_id=cosmisc_id)
                               AND (NOT cosmisc_shipped) ) )/ CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END ) ) AS shipatshipping,
        CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
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
-  FROM itemsite, item, coitem
+  FROM itemsite, item, uom, coitem
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
-GROUP BY coitem_linenumber, coitem_id, coitem_memo, item_number, item_invuom, item_shipuom,
-         item_descrip1, item_descrip2, coitem_qtyord, coitem_qtyshipped,
+--2.3 add coitem_qty_uom_id, to the GROUP BY clause
+GROUP BY coitem_qty_uom_id,
+         coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_shipuom,
+         item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, item_shipinvrat, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
 ORDER BY coitem_linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PickingListNoClosedLines
 QUERY: detail
 SELECT 1 AS groupby,
        coitem_linenumber,
        coitem_memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
-       item_invuom,
+--     In 2.3 replaced the next line:
+--     uom_name,
+--     with:
+       (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        item_shipuom,
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
-       formatQty(roundUp(coitem_qtyord / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipordered,
-       formatQty(roundUp((coitem_qtyshipped - coitem_qtyreturned) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipshipped,
-       formatQty(roundUp(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipbalance,
+       formatQty(roundUp((coitem_qtyord * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipordered,
+       formatQty(roundUp(((coitem_qtyshipped - coitem_qtyreturned) * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipshipped,
+       formatQty(roundUp((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) / CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END)) AS shipbalance,
        formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
                             FROM coship, cosmisc
                             WHERE ( (coship_coitem_id=coitem_id)
                               AND (coship_cosmisc_id=cosmisc_id)
                               AND (NOT cosmisc_shipped) ) )/ CASE WHEN(item_shipinvrat = 0) THEN 1 ELSE item_shipinvrat END ) ) AS shipatshipping,
        CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
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
-  FROM itemsite, item, coitem
+  FROM itemsite, item, uom, coitem
  WHERE ( (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (coitem_status <> 'X')
    AND (coitem_status <> 'C')
 -- 1 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
    <? if exists("hide closed") ?>
    AND (coitem_status <> 'C')
 -- 2 REMOVE THIS AND CLOSED LINES WILL NOT DISPLAY ON PACKING LIST
 -- <? endif ?>
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
-GROUP BY coitem_linenumber, coitem_id, coitem_memo, item_number, item_invuom, item_shipuom,
-         item_descrip1, item_descrip2, coitem_qtyord, coitem_qtyshipped,
+--2.3 add coitem_qty_uom_id, to the GROUP BY clause
+GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, item_shipuom,
+         item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, item_shipinvrat, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
 ORDER BY coitem_linenumber;
 --------------------------------------------------------------------


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
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
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
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
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
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
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
          -1 AS qtybreak, item_listprice AS price,
          <? if exists("actualCosts") ?>
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM item
    WHERE ( (item_sold)
      AND (NOT item_exclusive) )
 ) AS data
 ORDER BY itemnumber, price;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PricesByCustomerType
 QUERY: detail
 SELECT itemid, sourcetype, schedulename, type, itemnumber,
        item_descrip1, item_descrip2,
        CASE WHEN (qtybreak = -1) THEN 'N/A'
             ELSE formatQty(qtybreak)
        END AS f_qtybreak,
        price, formatSalesPrice(price) AS f_price,
        <? if exists("showCosts") ?>
          cost AS cost,
          formatCost(cost) AS f_cost,
          CASE WHEN ((price = 0) OR (cost = 0)) THEN 'N/A'
               ELSE formatScrap((price - cost) / price)
          END AS f_margin
        <? else ?>
          0 AS cost,
          '' AS f_cost,
          '' AS f_margin
        <? endif ?>
 FROM (
   SELECT ipsprice_id AS itemid, 2 AS sourcetype,
          ipshead_name AS schedulename, 'Cust. Type' AS type,
          item_number AS itemnumber, item_descrip1, item_descrip2,
          ipsprice_qtybreak AS qtybreak, ipsprice_price AS price,
          <? if exists("actualCosts") ?>
-           (actcost(ipsprice_item_id) * item_invpricerat)
+           (actcost(ipsprice_item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(ipsprice_item_id) * item_invpricerat)
+           (stdcost(ipsprice_item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM ipsass, ipshead, ipsprice, item
    WHERE ((ipsass_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsprice_item_id=item_id)
      AND (ipsass_custtype_id=<? value("custtype_id") ?>)
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
          item_number AS itemnumber,
          item_descrip1, item_descrip2,
          ipsprice_qtybreak AS qtybreak, ipsprice_price AS price,
          <? if exists("actualCosts") ?>
-           (actcost(ipsprice_item_id) * item_invpricerat)
+           (actcost(ipsprice_item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(ipsprice_item_id) * item_invpricerat)
+           (stdcost(ipsprice_item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM sale, ipshead, ipsprice, item
    WHERE ( (sale_ipshead_id=ipshead_id)
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
          -1 AS qtybreak, item_listprice AS price,
          <? if exists("actualCosts") ?>
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM item
    WHERE ( (item_sold)
      AND (NOT item_exclusive) )
 ) AS data
 ORDER BY itemnumber, price;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PricesByItem
 QUERY: detail
 SELECT itemid, sourcetype, schedulename, type, typename,
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
 FROM ( SELECT ipsprice_id AS itemid, 1 AS sourcetype,
               ipshead_name AS schedulename, 'Customer' AS type,
               cust_name AS typename,
               ipsprice_qtybreak AS qtybreak,
               ipsprice_price AS price,
               <? if exists("actualCosts") ?>
-                (actcost(item_id) * item_invpricerat)
+                (actcost(item_id) * iteminvpricerat(item_id))
               <? else ?>
-                (stdcost(item_id) * item_invpricerat)
+                (stdcost(item_id) * iteminvpricerat(item_id))
               <? endif ?>
               AS cost
          FROM ipsass, ipshead, ipsprice, cust, item
         WHERE ( (ipsass_ipshead_id=ipshead_id)
           AND (ipsprice_ipshead_id=ipshead_id)
           AND (ipsass_cust_id=cust_id)
           AND (ipsprice_item_id=item_id)
           AND (item_id=<? value("item_id") ?>)
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
          (custtype_code || '-' || custtype_descrip) AS typename,
          ipsprice_qtybreak AS qtybreak,
          ipsprice_price AS price,
          <? if exists("actualCosts") ?>
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM ipsass, ipshead, ipsprice, custtype, item
    WHERE ( (ipsass_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsass_custtype_id=custtype_id)
      AND (ipsprice_item_id=item_id)
      AND (item_id=<? value("item_id") ?>)
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT ipsprice_id AS itemid, 3 AS sourcetype,
          ipshead_name AS schedulename, 'Cust. Type Pattern' AS type,
          (custtype_code || '-' || custtype_descrip) AS typename,
          ipsprice_qtybreak AS qtybreak,
          ipsprice_price AS price,
          <? if exists("actualCosts") ?>
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM ipsass, ipshead, ipsprice, custtype, item
    WHERE ( (ipsass_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (COALESCE(LENGTH(ipsass_custtype_pattern), 0) > 0)
      AND (custtype_code ~ ipsass_custtype_pattern)
      AND (ipsprice_item_id=item_id)
      AND (item_id=<? value("item_id") ?>)
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT ipsprice_id AS itemid, 4 AS sourcetype,
          ipshead_name AS schedulename, 'Sale' AS type,
          sale_name AS typename,
          ipsprice_qtybreak AS qtybreak,
          ipsprice_price AS price,
          <? if exists("actualCosts") ?>
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM sale, ipshead, ipsprice, item
    WHERE ( (sale_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsprice_item_id=item_id)
      AND (item_id=<? value("item_id") ?>)
 <? if not exists("showExpired") ?>
      AND (sale_enddate > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (sale_startdate <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT ipsprice_id AS itemid, 5 AS sourcetype,
          ipshead_name AS schedulename, 'Cust. Ship-To' AS type,
          (cust_name || '-' || shipto_num) AS typename,
          ipsprice_qtybreak AS qtybreak,
          ipsprice_price AS price,
          <? if exists("actualCosts") ?>
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM ipsass, ipshead, ipsprice, cust, shipto, item
    WHERE ( (ipsass_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (ipsass_shipto_id=shipto_id)
      AND (shipto_cust_id=cust_id)
      AND (ipsprice_item_id=item_id)
      AND (item_id=<? value("item_id") ?>)
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT ipsprice_id AS itemid, 5 AS sourcetype,
          ipshead_name AS schedulename, 'Cust. Ship-To Pattern' AS type,
          (cust_name || '-' || shipto_num) AS typename,
          ipsprice_qtybreak AS qtybreak,
          ipsprice_price AS price,
          <? if exists("actualCosts") ?>
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM ipsass, ipshead, ipsprice, cust, shipto, item
    WHERE ( (ipsass_ipshead_id=ipshead_id)
      AND (ipsprice_ipshead_id=ipshead_id)
      AND (COALESCE(LENGTH(ipsass_shipto_pattern), 0) > 0)
      AND (shipto_num ~ ipsass_shipto_pattern)
      AND (shipto_cust_id=cust_id)
      AND (ipsprice_item_id=item_id)
      AND (item_id=<? value("item_id") ?>)
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
   )

   UNION
   SELECT item_id AS itemid, 0 AS sourcetype,
          'List Price' AS schedulename, 'N/A' AS type,
          '' AS typename,
          -1 AS qtybreak,
          item_listprice AS price,
          <? if exists("actualCosts") ?>
-           (actcost(item_id) * item_invpricerat)
+           (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
-           (stdcost(item_id) * item_invpricerat)
+           (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM item
    WHERE ( (NOT item_exclusive)
      AND (item_id=<? value("item_id") ?>) ) ) AS data
 ORDER BY price;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PurchaseOrder
 QUERY: Detail
 SELECT poitem_linenumber,
        poitem_comments,
        poitem_linenumber AS f_line,
        item_number,
        poitem_vend_item_number,
 --The Case statement below filters out TABs that a user may have inadvertently put in the Vend Desc field
 --MDA v 2.1
        CASE WHEN (LENGTH(TRIM(BOTH '	' FROM poitem_vend_item_descrip)) <= 0) THEN
           (item_descrip1 || '' || item_descrip2)
        ELSE (poitem_vend_item_descrip)
        END AS itemdescription,
        formatQty(poitem_qty_ordered) AS f_ordered,
-       CASE WHEN (poitem_vend_uom LIKE '') THEN (item_invuom)
+       CASE WHEN (poitem_vend_uom LIKE '') THEN (uom_name)
             ELSE (poitem_vend_uom)
        END AS itemuom,
        formatPrice(poitem_unitprice) AS f_price,
        formatExtPrice(poitem_unitprice * poitem_qty_ordered) AS f_extended,
        formatDate(poitem_duedate) AS f_duedate,
        characteristicsToString('PI', poitem_id, '=', ', ') AS poitem_characteristics
 FROM poitem
 	LEFT OUTER JOIN itemsite ON (poitem_itemsite_id = itemsite_id)
-	LEFT OUTER JOIN item ON (itemsite_item_id = item_id)
+	LEFT OUTER JOIN (item JOIN uom ON (item_inv_uom_id=uom_id)) ON (itemsite_item_id = item_id)
 WHERE 	(poitem_pohead_id=<? value("pohead_id") ?>)
 ORDER BY poitem_linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PurchaseOrder
 QUERY: Detail
 SELECT poitem_linenumber,
        poitem_comments,
        poitem_linenumber AS f_line,
        item_number,
        poitem_vend_item_number,
        CASE WHEN (poitem_vend_item_descrip LIKE '') THEN (item_descrip1 || ' ' || item_descrip2)
             ELSE (poitem_vend_item_descrip)
        END AS itemdescription,
        formatQty(poitem_qty_ordered) AS f_ordered,
-       CASE WHEN (poitem_vend_uom LIKE '') THEN (item_invuom)
+       CASE WHEN (poitem_vend_uom LIKE '') THEN (uom_name)
             ELSE (poitem_vend_uom)
        END AS itemuom,
        formatPrice(poitem_unitprice) AS f_price,
        formatExtPrice(poitem_unitprice * poitem_qty_ordered) AS f_extended,
        formatDate(poitem_duedate) AS f_duedate
   FROM poitem LEFT OUTER JOIN
          ( itemsite JOIN item
-           ON (itemsite_item_id=item_id) )
+           ON (itemsite_item_id=item_id) JOIN uom ON (item_inv_uom_id=uom_id))
          ON (poitem_itemsite_id=itemsite_id)
  WHERE (poitem_pohead_id=<? value("pohead_id") ?>)
 ORDER BY poitem_linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PurchasePriceVariancesByItem
 QUERY: head
 SELECT item_number, item_descrip1,
-       item_descrip2, item_invuom,
+       item_descrip2, uom_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername
-  FROM item
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: PurchaseRequestsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        <? if exists("warehous_id") ?>
          (select warehous_code
             from warehous
            where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse
-  FROM item
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: QOHByLocation
 QUERY: detail
 SELECT itemloc_id, warehous_code, item_number, item_descrip1, item_descrip2,
-       itemloc_lotserial, item_invuom, formatQty(itemloc_qty) AS f_qoh
-FROM itemloc, itemsite, warehous, item
+       itemloc_lotserial, uom_name, formatQty(itemloc_qty) AS f_qoh
+FROM itemloc, itemsite, warehous, item, uom
 WHERE ((itemloc_itemsite_id=itemsite_id)
  AND (itemsite_item_id=item_id)
+ AND (item_inv_uom_id=uom_id)
  AND (itemsite_warehous_id=warehous_id)
  AND (itemloc_location_id=<? value("location_id") ?>))

 UNION SELECT -1, warehous_code, item_number, item_descrip1, item_descrip2,
-             'N/A', item_invuom, formatQty(itemsite_qtyonhand)
-FROM itemsite, warehous, item
+             'N/A', uom_name, formatQty(itemsite_qtyonhand)
+FROM itemsite, warehous, item, uom
 WHERE ((itemsite_item_id=item_id)
+ AND (item_inv_uom_id=uom_id)
  AND (itemsite_warehous_id=warehous_id)
  AND (NOT itemsite_loccntrl)
  AND (itemsite_location_id=<? value("location_id") ?>))

 ORDER BY item_number;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: QOHByParameterList
 QUERY: detail
 SELECT itemsite_id,
        detail,
        item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
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
        AS r_nonnetvalue
 FROM ( SELECT itemsite_id,
               item_number,
               item_descrip1, item_descrip2, itemsite_loccntrl,
               warehous_code,
-              item_invuom,
+              uom_name,
               CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel,
               itemsite_qtyonhand AS qoh,
               CASE WHEN ((itemsite_loccntrl) OR (itemsite_controlmethod IN ('L', 'S'))) THEN 1
                    ELSE 0
               END AS detail,
               itemsite_nnqoh AS nonnetable,
               <? if exists("useActualCosts") ?>
                 actcost(itemsite_item_id)
               <? else ?>
                 stdcost(itemsite_item_id)
               <? endif ?>
               AS standardcost
-         FROM itemsite, item, warehous
+         FROM itemsite, item, uom, warehous
         WHERE ((itemsite_item_id=item_id)
+          AND (item_inv_uom_id=uom_id)
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


 --------------------------------------------------------------------
 REPORT: Quote
 QUERY: items
-SELECT quitem_id,
+SELECT
+--The following 2 lines are new in 2.3
+       (select uom_name from uom where uom_id = quitem_qty_uom_id) AS uom_ordered,
+       (select uom_name from uom where uom_id = quitem_price_uom_id) AS uom_pricing,
+       quitem_id,
        quitem_linenumber,
        item_number,
        item_descrip1,
        warehous_code,
        formatQty(quitem_qtyord) as f_ordered,
        formatPrice(quitem_price) as f_price,
-       formatExtprice(quitem_qtyord * (quitem_price / item_invpricerat)) as f_extprice
+--The following line was changed in 2.3 from:
+--       formatExtprice(quitem_qtyord * (quitem_price / iteminvpricerat(item_id))) as f_extprice
+--To:
+       formatExtprice((quitem_qtyord * quitem_qty_invuomratio) * (quitem_price / quitem_price_invuomratio)) as f_extprice
   FROM item, quitem LEFT OUTER JOIN (itemsite JOIN warehous ON (itemsite_warehous_id=warehous_id)) ON (quitem_itemsite_id=itemsite_id)
  WHERE ( (quitem_item_id=item_id)
+-- AND   (quitem_quhead_id='122') )
    AND   (quitem_quhead_id=<? value("quhead_id") ?>) )
  ORDER BY quitem_linenumber;
 --------------------------------------------------------------------

 QUERY: totals
 SELECT 1 as one,
        formatExtPrice(subtotal) AS f_subtotal,
        formatExtPrice(tax) AS f_tax,
        formatExtPrice(quhead_freight) as f_freight,
        formatExtPrice(subtotal + tax + quhead_freight) AS f_total
   FROM quhead,
-       (SELECT SUM(quitem_qtyord * (quitem_price / item_invpricerat)) AS subtotal
+       (SELECT SUM(quitem_qtyord * (quitem_price / iteminvpricerat(item_id))) AS subtotal
           FROM quitem, item
          WHERE ((quitem_quhead_id=<? value("quhead_id") ?>)
            AND  (quitem_item_id=item_id)) ) AS subtot,
        (SELECT calculateTax(quhead_tax_id,
                             SUM(quitem_qtyord
                               * (quitem_price
-                              / item_invpricerat)),
+                              / iteminvpricerat(item_id))),
                             quhead_freight) AS tax
           FROM quitem, item,
                (SELECT quhead_tax_id,
                        quhead_freight
                   FROM quhead
                  WHERE (quhead_id=<? value("quhead_id") ?>) ) as data
          WHERE ((quitem_quhead_id=<? value("quhead_id") ?>)
            AND  (quitem_item_id=item_id))
       GROUP BY quhead_tax_id, quhead_freight ) as taxinfo
  WHERE (quhead_id=<? value("quhead_id") ?>);


 --------------------------------------------------------------------

 QUERY: GroupFoot
-SELECT formatMoney(SUM(round(quitem_price * quitem_qtyord / item_invpricerat ,2))) AS f_extprice,
+--Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
+--with quitem_price_invuomratio:
+SELECT formatMoney(SUM(round((quitem_price * quitem_qty_invuomratio) * quitem_qtyord / quitem_price_invuomratio ,2))) AS f_extprice,
        formatMoney(quhead_freight) AS f_freight,
        formatMoney(quhead_misc) AS f_misc,

 -- Old way of calculating Tax:
---formatMoney(calculateTax(quhead_tax_id, SUM(round(quitem_price * CASE WHEN (item_taxable) THEN quitem_qtyord ELSE 0 END / item_invpricerat ,2)), quhead_freight, 'T')) AS f_tax,
+--formatMoney(calculateTax(quhead_tax_id, SUM(round(quitem_price * CASE WHEN (item_taxable) THEN quitem_qtyord ELSE 0 END / iteminvpricerat(item_id) ,2)), quhead_freight, 'T')) AS f_tax,
 --
 -- New way after 2.1.1:
 formatMoney((select
 ((
-select sum(calculatetax(quitem_tax_id, (quitem_qtyord * quitem_price / item_invpricerat), '0')) from quitem, quhead, item, itemsite where quhead_id  = <? value("quhead_id") ?> and quitem_quhead_id = quhead_id and quitem_itemsite_id = itemsite_id and itemsite_item_id  = item_id
+
+--Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
+--with quitem_price_invuomratio:
+select sum(calculatetax(quitem_tax_id, (quitem_qtyord * (quitem_price * quitem_qty_invuomratio) / quitem_price_invuomratio), '0')) from quitem, quhead, item, itemsite where quhead_id  = <? value("quhead_id") ?> and quitem_quhead_id = quhead_id and quitem_itemsite_id = itemsite_id and itemsite_item_id  = item_id
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'A') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'B') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'C') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 ))) AS f_tax,
 --End of new 2.1.1 Tax Calc

 --Note: in 2.1.1 replace Tax Calc with new method in the section
 --of the query that returns f_totaldue:
 --Old f_total due START:
---formatMoney((calculateTax(quhead_tax_id, SUM(round(quitem_price * CASE WHEN (item_taxable) THEN quitem_qtyord ELSE 0 END / --item_invpricerat ,2)), quhead_freight, 'T')) + SUM(round(quitem_price * quitem_qtyord / item_invpricerat ,2)) + quhead_freight + --quhead_misc) as f_totaldue
+--formatMoney((calculateTax(quhead_tax_id, SUM(round(quitem_price * CASE WHEN (item_taxable) THEN quitem_qtyord ELSE 0 END / --iteminvpricerat(item_id) ,2)), quhead_freight, 'T')) + SUM(round(quitem_price * quitem_qtyord / iteminvpricerat(item_id) ,2)) + quhead_freight + --quhead_misc) as f_totaldue
 --Old f_totaldue END

 ------------------------------------
 --New f_totaldue begin:

 formatMoney(
 (
-select sum(calculatetax(quitem_tax_id, (quitem_qtyord * quitem_price / item_invpricerat), '0')) from quitem, quhead, item, itemsite where quhead_id  = <? value("quhead_id") ?> and quitem_quhead_id = quhead_id and quitem_itemsite_id = itemsite_id and itemsite_item_id  = item_id
+--Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
+--with quitem_price_invuomratio:
+select sum(calculatetax(quitem_tax_id, (quitem_qtyord * (quitem_price * quitem_qty_invuomratio) / quitem_price_invuomratio), '0')) from quitem, quhead, item, itemsite where quhead_id  = <? value("quhead_id") ?> and quitem_quhead_id = quhead_id and quitem_itemsite_id = itemsite_id and itemsite_item_id  = item_id
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'A') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'B') from quhead where quhead_id = <? value("quhead_id") ?>
 )
 +
 (
 select calculatetax((select getfreighttaxselection((select quhead_taxauth_id from quhead where quhead_id = <? value("quhead_id")?>))), quhead_freight, quhead_freight, 'C') from quhead where quhead_id = <? value("quhead_id") ?>
 )
-
- + SUM(round(quitem_price * quitem_qtyord / item_invpricerat ,2))
+--Note that for version 2.3 the addition of quitem_qty_invuomratio was added in the line below and iteminvpricerat(item_id) was replaced
+--with quitem_price_invuomratio:
+ + SUM(round((quitem_price * quitem_qty_invuomratio) * quitem_qtyord / quitem_price_invuomratio ,2))
  + quhead_freight
  + quhead_misc)
 AS f_totaldue

 --New f_totaldue end:
 ------------------------------------

 FROM quhead, quitem, item

 WHERE ( (quitem_quhead_id=quhead_id)
  AND (quitem_item_id=item_id)
  AND (quhead_id=<? value("quhead_id") ?>) )
 GROUP BY quhead_id, quhead_freight, quhead_tax_id, quhead_misc;
 --------------------------------------------------------------------

+QUERY: currency_info
+--this was added in version 2.3
+select
+curr_name,
+curr_symbol,
+curr_abbr
+ from quhead, curr_symbol where quhead_curr_id = curr_id
+ and quhead_id = <? value("quhead_id") ?>;
+--------------------------------------------------------------------
+

 --------------------------------------------------------------------
 REPORT:
 QUERY: Detail
 SELECT quitem_linenumber,
        quitem_linenumber AS f_line,
        formatQty(quitem_qtyord) AS f_ordered,
-       item_invuom, item_number, item_descrip1,item_descrip2,
+       uom_name, item_number, item_descrip1,item_descrip2,
        CASE WHEN (item_listprice < quitem_price) THEN formatPrice(quitem_price)
             ELSE formatPrice(item_listprice)
        END AS f_listprice,
        formatPrice(quitem_price) AS f_price,
        formatExtPrice(quitem_price * quitem_qtyord) AS f_extended,
        CASE WHEN (item_listprice=0) THEN 'N/A'
             ELSE formatScrap(noNeg(1 - (quitem_price / item_listprice)))
        END AS f_discount
-  FROM quitem, item
+  FROM quitem, item, uom
  WHERE ( (quitem_item_id=item_id)
+   AND   (item_inv_uom_id=uom_id)
    AND   (quitem_quhead_id=<? value("quhead_id") ?>) )
  ORDER BY quitem_linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: RunningAvailability
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        warehous_code AS warehouse,
        <? if exists("showPlanned") ?>
          text('Yes')
        <? else ?>
          text('No')
        <? endif ?>
        AS showplnord
-  FROM item, warehous
+  FROM item, uom, warehous
  WHERE ((item_id=<? value("item_id") ?>)
+   AND (item_inv_uom_id=uom_id)
    AND (warehous_id=<? value("warehous_id") ?>))
 --------------------------------------------------------------------

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
   AND  (item_type='M'))

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
-      formatQty(womatl_qtyreq) AS f_qtyordered,
-      formatQty(womatl_qtyiss) AS f_qtyreceived,
-      formatQty((noNeg(womatl_qtyreq - womatl_qtyiss) * -1)) AS f_balance,
-      (noNeg(womatl_qtyreq - womatl_qtyiss) * -1) AS balance
+      formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, womatl_qtyreq)) AS f_qtyordered,
+      formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, womatl_qtyiss)) AS f_qtyreceived,
+      formatQty(itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, (noNeg(womatl_qtyreq - womatl_qtyiss) * -1))) AS f_balance,
+      itemuomtouom(womatlis.itemsite_item_id, womatl_uom_id, NULL, (noNeg(womatl_qtyreq - womatl_qtyiss) * -1)) AS balance
 FROM womatl, wo, itemsite AS wois, item, itemsite AS womatlis
 WHERE ((wo_status<>'C')
   AND  (wo_itemsite_id=wois.itemsite_id)
   AND  (wois.itemsite_item_id=item_id)
   AND  (womatl_wo_id=wo_id)
   AND  (womatlis.itemsite_item_id=<? value("item_id") ?>)
   AND  (womatlis.itemsite_warehous_id=<? value("warehous_id") ?>)
   AND  (womatl_itemsite_id=womatlis.itemsite_id)
   AND  (item_type IN ('P', 'M', 'C', 'O')) )

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
-       formatQty(coitem_qtyord) AS f_qtyordered,
-       formatQty(coitem_qtyshipped - coitem_qtyreturned + qtyAtShipping(coitem_id)) AS f_qtyreceived,
-       formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned - qtyAtShipping(coitem_id)) * -1) AS f_balance,
-       (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned - qtyAtShipping(coitem_id)) * -1) AS balance
+       formatQty(coitem_qty_invuomratio * coitem_qtyord) AS f_qtyordered,
+       formatQty(coitem_qty_invuomratio * (coitem_qtyshipped - coitem_qtyreturned + qtyAtShipping(coitem_id))) AS f_qtyreceived,
+       formatQty(coitem_qty_invuomratio * noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned - qtyAtShipping(coitem_id)) * -1) AS f_balance,
+       (coitem_qty_invuomratio * noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned - qtyAtShipping(coitem_id)) * -1) AS balance
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
-       'P/O' AS ordertype,
-       CASE WHEN (planord_firm) THEN <? value("firmPo") ?>
- 	   ELSE <? value("plannedPo") ?>
-       END AS ordernumber,
+       'Planned P/O' AS ordertype,
+--       CASE WHEN (planord_firm) THEN <? value("firmPo") ?>
+-- 	   ELSE <? value("plannedPo") ?>
+--       END AS ordernumber,
+--2.3 replaced case above with actual order number for higher level demand
+       CAST(planord_number AS text) AS ordernumber,
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
-       'W/O' AS ordertype,
-       CASE WHEN (planord_firm) THEN <? value("firmWo") ?>
-	    ELSE <? value("plannedWo") ?>
-       END AS ordernumber,
+       'Planned W/O' AS ordertype,
+--       CASE WHEN (planord_firm) THEN <? value("firmWo") ?>
+--	    ELSE <? value("plannedWo") ?>
+--       END AS ordernumber,
+--2.3 replaced case above with actual order number
+       CAST(planord_number AS text) AS ordernumber,
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
-       'W/O' AS ordertype,
-       CASE WHEN (planord_firm) THEN <? value("firmWoReq") ?>
-	    ELSE <? value("plannedWoReq") ?>
-       END AS ordernumber,
+       'Planned W/O' AS ordertype,
+--       CASE WHEN (planord_firm) THEN <? value("firmWoReq") ?>
+--	    ELSE <? value("plannedWoReq") ?>
+--       END AS ordernumber,
+--2.3 replaced case above with actual order number for higher level demand
+       CAST(planord_number AS text) AS ordernumber,
        1 AS sequence,
-       item_number,
+--2.3 Start
+--Starting here a sub-select gets the planned order number for the higher level demand
+             (SELECT item_number
+                FROM item, itemsite
+               WHERE((itemsite_item_id=item_id)
+                 AND (itemsite_id=planord_itemsite_id))
+             ) AS item_number,
+--End of subselect to get higher level item number
+--2.3 Start
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
-       <? value("pr") ?> AS ordernumber,
+--       <? value("pr") ?> AS ordernumber,
+--2.3 replaced above with actual order number
+       CAST(pr_number AS text) AS ordernumber,
        1 AS sequence,
-       item_number,
+       '' AS item_number,
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

-UNION SELECT -1 AS orderid, -1 AS altorderid,
+UNION
+
+SELECT -1 AS orderid, -1 AS altorderid,
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
+
+
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: SalesHistoryByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        <? if exists("warehous_id") ?>
            (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
            text('All Warehouses')
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
-  FROM item
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: SalesHistoryBySalesRep
 QUERY: detail
 SELECT cust_name,
        cohist_ordernumber as sonumber,
        CASE WHEN (cohist_invcnumber='-1') THEN 'Credit'
             ELSE text(cohist_invcnumber)
        END as invnumber,
        formatDate(cohist_orderdate) AS orddate, formatDate(cohist_invcdate, 'Return') AS invcdate,
-       item_number, item_invuom, item_descrip1, item_descrip2,
+       item_number, uom_name, item_descrip1, item_descrip2,
        formatQty(cohist_qtyshipped) AS shipped,
        <? if exists("showPrices") ?>
        formatPrice(cohist_unitprice) AS unitprice,
        formatMoney(round(cohist_qtyshipped * cohist_unitprice,2)) AS f_total,
        <? else ?>
        '' AS unitprice,
        '' AS f_total,
        <? endif ?>
        round(cohist_qtyshipped * cohist_unitprice,2) AS total
-  FROM cohist, cust, itemsite, item, prodcat
+  FROM cohist, cust, itemsite, item, uom, prodcat
  WHERE ((cohist_itemsite_id=itemsite_id)
    AND (cohist_cust_id=cust_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
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


 --------------------------------------------------------------------
 REPORT: SalesOrderStatus
 QUERY: detail
-SELECT coitem_linenumber,
+SELECT
+       --the following line was added for version 2.3:
+       (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_orderuom,
+       coitem_linenumber,
        item_number, item_descrip1,
        item_descrip2,
        warehous_code,
        formatQty(coitem_qtyord) AS qtyord,
        formatQty(coitem_qtyshipped) AS qtyship,
        formatQty(coitem_qtyreturned) AS qtyret,
        formatQty(SUM(COALESCE(coship_qty, 0))) AS qtyinvcd,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS f_balance,
        CASE WHEN (coitem_status='C') THEN
                 ( formatDate(coitem_closedate) || ' (' || coitem_close_username || ')' )
             ELSE ''
        END AS f_dateuser,
        CASE WHEN (coitem_order_id=-1) THEN ''
             WHEN (coitem_order_type='W') THEN
                 ( SELECT (formatWoNumber(wo_id) || '/' || wo_status)
                     FROM wo
                    WHERE (wo_id=coitem_order_id) )
             ELSE ''
        END AS f_childord
   FROM itemsite, item, warehous, coitem LEFT OUTER JOIN
        coship ON (coship_coitem_id=coitem_id
               AND coship_invcitem_id IS NOT NULL)
  WHERE ((coitem_itemsite_id=itemsite_id)
    AND (coitem_status<>'X')
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
-GROUP BY coitem_id, coitem_linenumber, item_number,
+GROUP BY uom_orderuom,
+         coitem_id, coitem_linenumber, item_number,
          item_descrip1, item_descrip2, warehous_code,
          coitem_qtyord, coitem_qtyshipped, coitem_status,
          coitem_closedate, coitem_close_username,
          coitem_qtyreturned, coitem_order_id,
          coitem_order_type
 ORDER BY coitem_linenumber;
 --------------------------------------------------------------------


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
-                   COALESCE((SELECT SUM(currToCurr(apchkitem_curr_id, apopen_curr_id, apchkitem_amount, CURRENT_DATE))
-                             FROM apchkitem, apchk
-                             WHERE ((apchkitem_apchk_id=apchk_id)
-                              AND (apchkitem_apopen_id=apopen_id)
-                              AND (NOT apchk_void)
-                              AND (NOT apchk_posted))
+                   COALESCE((SELECT SUM(currToCurr(checkitem_curr_id, apopen_curr_id, checkitem_amount, CURRENT_DATE))
+                             FROM checkitem, checkhead
+                             WHERE ((checkitem_checkhead_id=checkhead_id)
+                              AND (checkitem_apopen_id=apopen_id)
+                              AND (NOT checkhead_void)
+                              AND (NOT checkhead_posted))
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


 --------------------------------------------------------------------
 REPORT: SequencedBOM
 QUERY: detail
 SELECT text(booitem_seqnumber) AS booseqnumber, bomitem_seqnumber,
        item_number, item_invuom, item_descrip1, item_descrip2,
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
-  FROM booitem, bomitem, item
+  FROM booitem(<? value("item_id") ?>), bomitem(<? value("item_id") ?>,<? value("revision_id") ?>), item
  WHERE ((bomitem_item_id=item_id)
-   AND (bomitem_booitem_id=booitem_id)
-   AND (bomitem_parent_item_id=<? value("item_id") ?>)
+   AND (bomitem_booitem_seq_id=booitem_seq_id)
 <? if not exists("showExpired") ?>
    AND (bomitem_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
    AND (bomitem_effective <= CURRENT_DATE)
 <? endif ?>
 )
 UNION
 SELECT text('') AS booseqnumber, bomitem_seqnumber,
        item_number, item_invuom, item_descrip1, item_descrip2,
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
-  FROM bomitem, item
+  FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>), item
  WHERE ((bomitem_item_id=item_id)
-   AND (bomitem_booitem_id=-1)
-   AND (bomitem_parent_item_id=<? value("item_id") ?>)
+   AND (bomitem_booitem_seq_id=-1)
 <? if not exists("showExpired") ?>
    AND (bomitem_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
    AND (bomitem_effective <= CURRENT_DATE)
 <? endif ?>
 )
 ORDER BY booseqnumber, bomitem_seqnumber;

 --------------------------------------------------------------------

+QUERY: bomhead
+SELECT bomhead_docnum, bomhead_revision,
+formatDate(bomhead_revisiondate) AS f_revisiondate
+FROM bomhead
+WHERE ((bomhead_item_id=<? value("item_id") ?>)
+AND (bomhead_rev_id=<? value("revision_id") ?>));
+--------------------------------------------------------------------
+

 --------------------------------------------------------------------
 REPORT: ShipmentsByDate
 QUERY: head
 SELECT formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate;
 --------------------------------------------------------------------

 QUERY: detail
 SELECT cosmisc_id,
        formatShipmentNumber(cosmisc_id) AS cosmisc_number,
        coitem_id,
        cohead_number,
        (cust_number || '-' || cust_name) AS customer,
        formatDate(cosmisc_shipdate) AS f_shipdate,
        coitem_linenumber,
        item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        warehous_code,
        formatQty(coitem_qtyord) AS f_qtyord,
        formatQty(SUM(coship_qty)) AS f_qtyshipped
-  FROM coship, cosmisc, coitem, cohead, cust, itemsite, item, warehous
+  FROM coship, cosmisc, coitem, cohead, cust, itemsite, item, uom, warehous
  WHERE ( (coship_cosmisc_id=cosmisc_id)
    AND (coship_coitem_id=coitem_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (cosmisc_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (cosmisc_shipped)
    AND (cosmisc_shipdate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>) )
 GROUP BY cosmisc_id, coitem_id,
          cohead_number, cust_number, cust_name, cosmisc_shipdate,
          coitem_linenumber, item_number, item_descrip1, item_descrip2,
-         item_invuom, warehous_code, coitem_qtyord
+         uom_name, warehous_code, coitem_qtyord
 ORDER BY cosmisc_id, coitem_linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: ShipmentsBySalesOrder
 QUERY: detail
 SELECT cosmisc_id,
        coitem_id,
        formatShipmentNumber(cosmisc_id) AS cosmisc_number,
        formatDate(cosmisc_shipdate) AS f_shipdate,
        coitem_linenumber,
        item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        warehous_code,
        formatQty(coitem_qtyord) AS f_qtyord,
        formatQty(SUM(coship_qty)) AS f_qtyshipped
-  FROM coship, cosmisc, coitem, itemsite, item, warehous
+  FROM coship, cosmisc, coitem, itemsite, item, uom, warehous
  WHERE ( (coship_cosmisc_id=cosmisc_id)
    AND (coship_coitem_id=coitem_id)
    AND (cosmisc_shipped)
    AND (coitem_itemsite_id=itemsite_id)
    AND (coitem_status<>'X')
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
 GROUP BY cosmisc_id, coitem_id,
          cosmisc_shipdate, coitem_linenumber,
          item_number, item_descrip1, item_descrip2,
-         item_invuom, warehous_code, coitem_qtyord
+         uom_name, warehous_code, coitem_qtyord
 ORDER BY cosmisc_id DESC, coitem_linenumber DESC;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: ShippingLabelsBySo
 QUERY: detail
 SELECT sequence_value,
        cust_number,
        cohead_number,
+
+formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3, (cohead_shiptocity || '  ' ||   cohead_shiptostate || '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,
+
+
        cohead_custponumber,
        cohead_shiptoname,
        cohead_shiptoaddress1,
        cohead_shiptoaddress2,
        cohead_shiptoaddress3,
        (COALESCE(cohead_shiptocity,'') || ' ' || COALESCE(cohead_shiptostate,'') || ' ' || COALESCE(cohead_shiptozipcode,'')) AS citystatezip
 FROM cohead, cust, sequence
 WHERE ( (cohead_cust_id=cust_id)
  AND (sequence_value BETWEEN <? value("labelFrom") ?> AND <? value("labelTo") ?>)
- AND (cohead_id=<? value("sohead_id") ?>) );
+ AND (cohead_id=<? value("sohead_id") ?>) )
+LIMIT <? value("labelTo") ?>;

 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: SingleLevelBOM
 QUERY: detail
 SELECT bomitem_seqnumber, item_number,
        item_invuom, item_descrip1, item_descrip2,
        formatBoolYN(bomitem_createwo) AS createchild,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixed'
             ELSE 'Special'
        END AS issuemethod,
        formatQtyPer(bomitem_qtyper) AS qtyper,
        formatScrap(bomitem_scrap) AS scrap,
        formatQtyPer(bomitem_qtyper + (1 * bomitem_scrap)) AS qtyreq,
        formatDate(bomitem_effective, 'Always') AS effective,
        formatDate(bomitem_expires, 'Never') AS expires,
        bomitem_ecn
-FROM bomitem, item
+<? if exists("revision_id") ?>
+  FROM bomitem(<? value("item_id") ?>,<? value("revision_id") ?>)
+<? else ?>
+  FROM bomitem(<? value("item_id") ?>)
+<? endif ?>
+, item
 WHERE ((bomitem_item_id=item_id)
- AND (bomitem_parent_item_id=<? value("item_id") ?>)

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

 QUERY: bomhead
 SELECT bomhead_docnum, bomhead_revision,
        formatDate(bomhead_revisiondate) AS f_revisiondate
 FROM bomhead
-WHERE (bomhead_item_id=<? value("item_id") ?>);
+WHERE ((bomhead_item_id=<? value("item_id") ?>)
+<? if exists("revision_id") ?>
+AND (bomhead_rev_id=<? value("revision_id") ?>)
+<? else ?>
+AND (bomhead_rev_id=getActiveRevId('BOM',<? value("item_id") ?>))
+<? endif ?>
+);
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: SingleLevelWhereUsed
 QUERY: head
 SELECT item_number,
-       item_invuom,
+       uom_name,
        item_descrip1,
        item_descrip2,
        <? if exists("effective") ?>
          formatDate(<? value("effective") ?>)
        <? else ?>
          text('Now')
        <? endif ?>
        AS effective
-  FROM item
+  FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);

 --------------------------------------------------------------------

 QUERY: detail
 SELECT bomitem_seqnumber, item_number,
-       item_descrip1, item_descrip2, item_invuom,
-       formatQtyper(bomitem_qtyper) AS f_qtyper,
+       item_descrip1, item_descrip2, uom_name,
+       formatQtyper(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper)) AS f_qtyper,
        formatScrap(bomitem_scrap) AS f_scrap,
        formatDate(bomitem_effective, 'Always') AS f_effective,
        formatDate(bomitem_expires, 'Never') AS f_expires,
        formatBoolYN(bomitem_createwo) AS f_createwo,
        CASE WHEN (bomitem_issuemethod='S') THEN 'Push'
             WHEN (bomitem_issuemethod='L') THEN 'Pull'
             WHEN (bomitem_issuemethod='M') THEN 'Mixxed'
             ELSE 'Special'
        END AS f_issuemethod,
-       formatQtyper(bomitem_qtyper + (1 * bomitem_scrap)) as f_qtyreq
-  FROM bomitem, item
+       formatQtyper(itemuomtouom(bomitem_item_id, bomitem_uom_id, NULL, bomitem_qtyper + (1 * bomitem_scrap))) as f_qtyreq
+  FROM bomitem, item, uom
  WHERE ((bomitem_parent_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (bomitem_item_id=<? value("item_id") ?>)
 <? if exists("effective") ?>
    AND (<? value("effective") ?> BETWEEN bomitem_effective and (bomitem_expires-1))
 <? else ?>
    AND (CURRENT_DATE BETWEEN bomitem_effective and (bomitem_expires-1))
 <? endif ?>
 )
 ORDER BY item_number;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: SlowMovingInventoryByClassCode
 QUERY: detail
 SELECT warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        formatQty(itemsite_qtyonhand) AS f_qoh,
        formatDate(itemsite_datelastused) AS f_datelastused,
        <? if exists("showValue") ?>
          formatCost(cost)
        <? else ?>
          text('')
        <? endif ?>
        AS f_unitcost,
        noNeg(cost * itemsite_qtyonhand) AS value,
        <? if exists("showValue") ?>
          formatExtPrice(noNeg(cost * itemsite_qtyonhand))
        <? else ?>
          text('')
        <? endif ?>
        AS f_value
   FROM ( SELECT itemsite_id,
                 warehous_code,
                 item_number,
                 item_descrip1,
-                item_descrip2, item_invuom,
+                item_descrip2, uom_name,
                 itemsite_qtyonhand,
                 itemsite_datelastused,
                 <? if exists("useActualCosts") ?>
                   actcost(itemsite_item_id)
                 <? else ?>
                   stdcost(itemsite_item_id)
                 <? endif ?>
                 AS cost
-           FROM itemsite, item, warehous
+           FROM itemsite, item, warehous, uom
           WHERE ((itemsite_item_id=item_id)
+            AND (item_inv_uom_id=uom_id)
             AND (itemsite_warehous_id=warehous_id)
             AND (itemsite_active)
             AND (itemsite_datelastused < <? value("cutoffDate") ?>)
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
 <? elseif exists("orderByDateLastUsed") ?>
   itemsite_datelastused
 <? else ?>
   item_number
 <? endif ?>
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT:
 QUERY: detail
-SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, item_invuom, roundUp(SUM(coship_qty) / item_shipinvrat)::integer AS shipqty,
+SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, uom_name, roundUp(SUM(coship_qty) / item_shipinvrat)::integer AS shipqty,
                 item_shipuom, item_number, item_descrip1, item_descrip2,
                 formatQty(SUM(coship_qty) * item_prodweight) AS netweight,
                 formatQty(SUM(coship_qty) * (item_prodweight + item_packweight)) AS grossweight
-         FROM coship, coitem, itemsite, item
+         FROM coship, coitem, itemsite, item, uom
          WHERE ((coship_coitem_id=coitem_id)
           AND (coitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
+          AND (item_inv_uom_id=uom_id)
           AND (coship_cosmisc_id=%1))
-         GROUP BY coitem_linenumber, item_number, item_invuom, item_shipinvrat, item_shipuom,
+         GROUP BY coitem_linenumber, item_number, uom_name, item_shipinvrat, item_shipuom,
                   item_descrip1, item_descrip2, item_prodweight, item_packweight
          ORDER BY coitem_linenumber;

 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: SummarizedBOM
 QUERY: detail
-select item_number,
-       item_invuom,
-       item_descrip1,
-       item_descrip2,
-       formatQtyPer(SUM(bomwork_qtyper * (1 + bomwork_scrap))) AS qtyper
-  FROM bomwork, item
- WHERE ((bomwork_item_id=item_id)
-   AND (bomwork_set_id=<? value("bomworkset_id") ?>)
-<? if exists("expiredDays") ?>
-   AND (bomwork_expires > (CURRENT_DATE - <? value("expiredDays") ?>))
-<? else ?>
-   AND (bomwork_expires > CURRENT_DATE)
-<? endif ?>
-<? if exists("futureDays") ?>
-   AND (bomwork_effective <= (CURRENT_DATE + <? value("futureDays") ?>))
-<? else ?>
-   AND (bomwork_effective <= CURRENT_DATE)
-<? endif ?>
- )
-GROUP BY item_number, item_invuom,
-         item_descrip1, item_descrip2
-ORDER BY item_number;
+select bomdata_item_number AS item_number,
+       bomdata_uom_name AS item_invuom,
+       bomdata_item_descrip1 AS item_descrip1,
+       bomdata_item_descrip2 AS item_descrip2,
+       bomdata_qtyper AS qtyper
+  FROM summarizedBOM(<? value("item_id") ?>,<? value("revision_id") ?>,<? value("expiredDays") ?>,<? value("futureDays") ?>)
+
+
+--------------------------------------------------------------------
+
+QUERY: bomhead
+SELECT bomhead_docnum, bomhead_revision,
+formatDate(bomhead_revisiondate) AS f_revisiondate
+FROM bomhead
+WHERE ((bomhead_item_id=<? value("item_id") ?>)
+AND (bomhead_rev_id=<? value("revision_id") ?>));
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: SummarizedBacklogByWarehouse
 QUERY: detail
 SELECT CASE WHEN (cohead_holdtype='P') THEN -1
             ELSE cohead_id
        END AS _coheadid, cohead_id,
        cohead_holdtype, cohead_number, cust_name,
-       CASE WHEN (cohead_holdtype='N') THEN text('None')
-            WHEN (cohead_holdtype='C') THEN text('Credit')
-            WHEN (cohead_holdtype='S') THEN text('Ship')
-            WHEN (cohead_holdtype='P') THEN text('Pack')
-            ELSE text('Other')
+       CASE WHEN (cohead_holdtype='N') THEN <? value("none") ?>
+            WHEN (cohead_holdtype='C') THEN <? value("credit") ?>
+            WHEN (cohead_holdtype='S') THEN <? value("ship") ?>
+            WHEN (cohead_holdtype='P') THEN <? value("pack") ?>
+            WHEN (cohead_holdtype='R') THEN <? value("return") ?>
+            ELSE <? value("Other") ?>
        END AS f_holdtype,
        formatDate(cohead_orderdate) AS f_orderdate,
        formatDate(MIN(coitem_scheddate)) AS f_scheddate,
        formatDate(cohead_packdate) AS f_packdate,
        <? if exists("showPrices") ?>
-         formatMoney( SUM( round(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) *
-                         (coitem_price / item_invpricerat),2) ) )
+         formatMoney( SUM( round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
+                         (coitem_price / coitem_price_invuomratio),2) ) )
        <? else ?>
          text('')
        <? endif ?>
        AS f_sales,
        <? if exists("showPrices") ?>
-         formatCost(SUM(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * stdcost(item_id) ) )
+         formatCost(SUM((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * stdcost(item_id) ) )
        <? else ?>
          text('')
        <? endif ?>
        AS f_cost,
        <? if exists("showPrices") ?>
-         formatMoney( SUM( noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) *
-                         ((coitem_price / item_invpricerat) - stdcost(item_id)) ) )
+         formatMoney( SUM( (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
+                         ((coitem_price / coitem_price_invuomratio) - stdcost(item_id)) ) )
        <? else ?>
          text('')
        <? endif ?>
        AS f_margin,
-       SUM( round( noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) *
-            (coitem_price / item_invpricerat),2) ) AS sales,
-       SUM(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * stdcost(item_id) ) AS cost,
-       SUM( noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) *
-            ((coitem_price / item_invpricerat) - stdcost(item_id)) ) AS margin,
+       SUM( round( (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
+            (coitem_price / coitem_price_invuomratio),2) ) AS sales,
+       SUM((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * stdcost(item_id) ) AS cost,
+       SUM((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
+            ((coitem_price / coitem_price_invuomratio) - stdcost(item_id)) ) AS margin,
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
   cohead_packdate
 <? endif ?>
 cohead_number, cosmisc_shipped;
 --------------------------------------------------------------------

 QUERY: totals
 SELECT
 <? if exists("showPrices") ?>
        formatMoney( SUM( sales ) ) AS f_sales,
        formatCost( SUM( cost ) ) AS f_cost,
        formatMoney( SUM( margin ) ) AS f_margin
   FROM (
-SELECT SUM( round(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) *
-                         (coitem_price / item_invpricerat),2) ) AS sales,
-       SUM(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * stdcost(item_id) ) AS cost,
-       SUM( noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) *
-                         ((coitem_price / item_invpricerat) - stdcost(item_id)) ) AS margin
+SELECT SUM( round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
+                         (coitem_price / coitem_price_invuomratio),2) ) AS sales,
+       SUM((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * stdcost(item_id) ) AS cost,
+       SUM((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
+                         ((coitem_price / coitem_price_invuomratio) - stdcost(item_id)) ) AS margin
   FROM coitem, itemsite, item, cust,
        cohead
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
          cohead_orderdate, cohead_packdate
 ) AS data
 <? else ?>
        text('') AS f_sales,
        text('') AS f_cost,
        text('') AS f_margin
 <? endif ?>
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: SummarizedTaxableSales
 QUERY: detail
 SELECT (tax_code||'-'||tax_descrip) AS taxcode,
-       formatMoney( ( SELECT COALESCE(SUM(round(cohist_qtyshipped * cohist_unitprice,2)), 0)
+       formatMoney((
+	  SELECT COALESCE(SUM(ROUND(cohist_qtyshipped *
+				    currToCurr(cohist_curr_id, baseCurrId(),
+					       cohist_unitprice,
+					       cohist_invcdate),2)), 0)
                            FROM cohist
-                          WHERE ( (cohist_tax_id=tax_id)
+	  WHERE ((cohist_tax_id=tax_id)
                             AND (cohist_itemsite_id<>-1)
-                            AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) ) ) ) AS f_sales,
-       formatMoney( ( SELECT COALESCE(SUM(cohist_unitprice), 0)
+	    AND  (cohist_invcdate BETWEEN <? value("startDate") ?>
+				      AND <? value("endDate") ?>))
+       )) AS f_sales,
+       formatMoney((
+	  SELECT COALESCE(SUM(ROUND(currToCurr(cohist_curr_id, baseCurrId(),
+					       cohist_unitprice,
+					       cohist_invcdate), 2)), 0)
                            FROM cohist
-                          WHERE ( (cohist_tax_id=tax_id)
+	  WHERE ((cohist_tax_id=tax_id)
                             AND (cohist_misc_type='F')
-                            AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) ) ) ) AS f_freight,
-       formatBoolYN(tax_freight) AS f_taxfreight,
-       formatMoney( ( SELECT COALESCE(SUM(COALESCE(cohist_tax_ratea,0) + COALESCE(cohist_tax_rateb,0) + COALESCE(cohist_tax_ratec,0)), 0)
+	    AND  (cohist_invcdate BETWEEN <? value("startDate") ?>
+				      AND <? value("endDate") ?>))
+       )) AS f_freight,
+       formatBoolYN(EXISTS(SELECT *
+			   FROM taxsel
+			   WHERE ((taxsel_tax_id=tax_id)
+			     AND  (taxsel_taxtype_id=getFreightTaxTypeId()))
+       )) AS f_taxfreight,
+       formatMoney((
+	 SELECT COALESCE(SUM(ROUND(currToCurr(cohist_curr_id, baseCurrId(),
+					      COALESCE(cohist_tax_ratea,0) +
+					      COALESCE(cohist_tax_rateb,0) +
+					      COALESCE(cohist_tax_ratec, 0),
+					      cohist_invcdate), 2)), 0)
                            FROM cohist
-                          WHERE ( (cohist_tax_id=tax_id)
-                            AND (cohist_invcdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) ) ) ) AS f_tax
-  FROM tax
+	 WHERE ((cohist_tax_id=tax_id)
+--          AND (cohist_misc_type='T')
+	    AND (cohist_invcdate BETWEEN <? value("startDate") ?>
+				      AND <? value("endDate") ?>))
+       )) AS f_taxbase,
+       formatMoney((
+	 SELECT COALESCE(SUM(ROUND(currToCurr(cohist_curr_id,
+					      COALESCE(taxauth_curr_id,
+						       baseCurrId()),
+					      COALESCE(cohist_tax_ratea,0) +
+					      COALESCE(cohist_tax_rateb,0) +
+					      COALESCE(cohist_tax_ratec, 0),
+					      cohist_invcdate), 2)), 0)
+	 FROM cohist
+	 WHERE ((cohist_tax_id=tax_id)
+--          AND (cohist_misc_type='T')
+	    AND (cohist_invcdate BETWEEN <? value("startDate") ?>
+				      AND <? value("endDate") ?>))
+       )) AS f_tax,
+       currConcat(COALESCE(taxauth_curr_id, baseCurrId())) AS taxauthcurr
+FROM tax LEFT OUTER JOIN
+     (taxsel JOIN taxauth ON (taxsel_taxauth_id=taxauth_id))
+	ON (taxsel_tax_id=tax_id)
 <? if exists("tax_id") ?>
- WHERE (tax_id=<? value("tax_id") ?>)
+WHERE (tax_id=<? value("tax_id") ?>)
 <? endif ?>
-GROUP BY tax_id, tax_code, tax_descrip, tax_freight;
+GROUP BY tax_id, tax_code, tax_descrip, tax_freight, taxauth_curr_id;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: TimePhasedAvailability
 QUERY: detail
 SELECT findPeriodStart(rcalitem_id) AS pstart,
        findPeriodEnd(rcalitem_id) AS pend,
        (formatDate(findPeriodStart(rcalitem_id)) || '-' || formatDate(findPeriodEnd(rcalitem_id))) AS period,
        item_number,
-       item_invuom AS f_uom,
+       uom_name AS f_uom,
        warehous_code,
        formatQty(qtyAvailable(itemsite_id, findPeriodStart(rcalitem_id))) AS f_unit
-  FROM rcalitem, itemsite, item, warehous
+  FROM rcalitem, itemsite, item, uom, warehous
  WHERE ((rcalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                         ))
    AND (itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN ( SELECT plancode_id
                                     FROM plancode
                                    WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
   )
  UNION
 SELECT findPeriodStart(acalitem_id) AS pstart,
        findPeriodEnd(acalitem_id) AS pend,
        (formatDate(findPeriodStart(acalitem_id)) || '-' || formatDate(findPeriodEnd(acalitem_id))) AS period,
        item_number,
-       item_invuom AS f_uom,
+       uom_name AS f_uom,
        warehous_code,
        formatQty(qtyAvailable(itemsite_id, findPeriodStart(acalitem_id))) AS f_unit
-  FROM acalitem, itemsite, item, warehous
+  FROM acalitem, itemsite, item, uom, warehous
  WHERE ((acalitem_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                         ))
    AND (itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN ( SELECT plancode_id
                                     FROM plancode
                                    WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
   )
 ORDER BY pstart, item_number, warehous_code;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: TimePhasedBookingsByItem
 QUERY: detail
 SELECT calitem_start AS pstart,
        calitem_end AS pend,
        (formatDate(calitem_start) || '-' || formatDate(calitem_end)) AS period,
        item_number,
        <? if exists("inventoryUnits") ?>
-         item_invuom AS f_uom,
+         uom_name AS f_uom,
          formatQty(bookingsByItemQty(itemsite_id, calitem_id)) AS f_unit,
          bookingsByItemQty(itemsite_id, calitem_id) AS unit,
        <? else ?>
          text('') AS f_uom,
          formatExtPrice(bookingsByItemValue(itemsite_id, calitem_id)) AS f_unit,
          bookingsByItemValue(itemsite_id, calitem_id) AS unit,
        <? endif ?>
        warehous_code
-  FROM itemsite, item, warehous,
+  FROM itemsite, item, uom, warehous,
        ( SELECT rcalitem_id AS calitem_id,
                 findPeriodStart(rcalitem_id) AS calitem_start,
                 findPeriodEnd(rcalitem_id) AS calitem_end
            FROM rcalitem
           WHERE (rcalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                 )
                 )
           UNION
          SELECT acalitem_id AS calitem_id,
                 findPeriodStart(acalitem_id) AS calitem_start,
                 findPeriodEnd(acalitem_id) AS calitem_end
            FROM acalitem
           WHERE (acalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                 )
                 )
        ) AS calitem
  WHERE ((itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (item_sold)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
    AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (item_prodcat_id IN ( SELECT prodcat_id
                                FROM prodcat
                               WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
   )
 ORDER BY pstart, item_number, warehous_code;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: TimePhasedBookingsByProductCategory
 QUERY: detail
 SELECT calitem_start AS pstart,
        calitem_end AS pend,
        (formatDate(calitem_start) || '-' || formatDate(calitem_end)) AS period,
        prodcat_code,
        <? if exists("inventoryUnits") ?>
-         item_invuom
+         uom_name
        <? elseif exists("capacityUnits") ?>
-         item_capuom
+         itemcapuom(item_id)
        <? elseif exists("altCapacityUnits") ?>
-         item_altcapuom
+         itemaltcapuom(item_id)
        <? else ?>
          text('')
        <? endif ?>
        AS f_uom,
        warehous_code,
        <? if exists("inventoryUnits") ?>
          formatQty(SUM(bookingsByItemQty(itemsite_id, calitem_id)))
        <? elseif exists("capacityUnits") ?>
-         formatQty(SUM(bookingsByItemQty(itemsite_id, calitem_id) * item_capinvrat))
+         formatQty(SUM(bookingsByItemQty(itemsite_id, calitem_id) * itemcapinvrat(item_id)))
        <? elseif exists("altCapacityUnits") ?>
-         formatQty(SUM(bookingsByItemQty(itemsite_id, calitem_id) * item_altcapinvrat))
+         formatQty(SUM(bookingsByItemQty(itemsite_id, calitem_id) * itemaltcapinvrat(item_id)))
        <? else ?>
          formatExtPrice(SUM(bookingsByItemValue(itemsite_id, calitem_id)))
        <? endif ?>
        AS f_unit,
        <? if exists("inventoryUnits") ?>
          SUM(bookingsByItemQty(itemsite_id, calitem_id))
        <? elseif exists("capacityUnits") ?>
-         SUM(bookingsByItemQty(itemsite_id, calitem_id) * item_capinvrat)
+         SUM(bookingsByItemQty(itemsite_id, calitem_id) * itemcapinvrat(item_id))
        <? elseif exists("altCapacityUnits") ?>
-         SUM(bookingsByItemQty(itemsite_id, calitem_id) * item_altcapinvrat)
+         SUM(bookingsByItemQty(itemsite_id, calitem_id) * itemaltcapinvrat(item_id))
        <? else ?>
          SUM(bookingsByItemValue(itemsite_id, calitem_id))
        <? endif ?>
        AS unit
-  FROM itemsite, item, warehous, prodcat,
+  FROM itemsite, item, uom, warehous, prodcat,
        ( SELECT rcalitem_id AS calitem_id,
                 findPeriodStart(rcalitem_id) AS calitem_start,
                 findPeriodEnd(rcalitem_id) AS calitem_end
            FROM rcalitem
           WHERE (rcalitem_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                 )
                 )
           UNION
          SELECT acalitem_id AS calitem_id,
                 findPeriodStart(acalitem_id) AS calitem_start,
                 findPeriodEnd(acalitem_id) AS calitem_end
            FROM acalitem
           WHERE (acalitem_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                 )
                 )
        ) AS calitem
  WHERE ((itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (item_prodcat_id=prodcat_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
   )
 GROUP BY pstart, pend, period, prodcat_code, warehous_code, f_uom
 ORDER BY pstart, prodcat_code, warehous_code, f_uom;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: TimePhasedDemandByPlannerCode
 QUERY: detail
 SELECT findPeriodStart(calitem_id) AS pstart,
        findPeriodEnd(calitem_id) AS pend,
        (formatDate(findPeriodStart(calitem_id)) || '-' || formatDate(findPeriodEnd(calitem_id))) AS period,
        plancode_code,
        <? if exists("inventoryUnits") ?>
-         item_invuom
+         uom_name
        <? elseif exists("capacityUnits") ?>
-         item_capuom
+         itemcapuom(item_id)
        <? elseif exists("altCapacityUnits") ?>
-         item_altcapuom
+         itemaltcapuom(item_id)
        <? else ?>
          text('')
        <? endif ?>
        AS f_uom,
        warehous_code,
        <? if exists("inventoryUnits") ?>
          formatQty(SUM(summDemand(itemsite_id, calitem_id)))
        <? elseif exists("capacityUnits") ?>
-         formatQty(SUM(summDemand(itemsite_id, calitem_id) * item_capinvrat))
+         formatQty(SUM(summDemand(itemsite_id, calitem_id) * itemcapinvrat(item_id)))
        <? elseif exists("altCapacityUnits") ?>
-         formatQty(SUM(summDemand(itemsite_id, calitem_id) * item_altcapinvrat))
+         formatQty(SUM(summDemand(itemsite_id, calitem_id) * itemaltcapinvrat(item_id)))
        <? else ?>
          formatQty(SUM(summDemand(itemsite_id, calitem_id)))
        <? endif ?>
        AS f_unit
-  FROM itemsite, item, warehous, plancode,
+  FROM itemsite, item, uom, warehous, plancode,
        (SELECT rcalitem_id AS calitem_id
           FROM rcalitem
          WHERE (rcalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                ))
          UNION
         SELECT acalitem_id as calitem_id
           FROM acalitem
          WHERE (acalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                ))
         ) AS calitem
  WHERE ((itemsite_warehous_id=warehous_id)
    AND (itemsite_active)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_plancode_id=plancode_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("plancode_id") ?>
    AND (plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (plancode_code ~ <? value("plancode_pattern") ?>)
 <? endif ?>
   )
 GROUP BY pstart, pend, period, plancode_code, warehous_code, f_uom
 ORDER BY pstart, plancode_code, warehous_code, f_uom;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: TimePhasedProductionByItem
 QUERY: detail
 SELECT findPeriodStart(calitem_id) AS pstart,
        findPeriodEnd(calitem_id) AS pend,
        (formatDate(findPeriodStart(calitem_id)) || '-' || formatDate(findPeriodEnd(calitem_id))) AS period,
        item_number,
-       item_invuom,
+       uom_name,
        warehous_code,
        formatQty(SUM(summProd(itemsite_id, calitem_id))) AS f_unit
-  FROM itemsite, item, warehous,
+  FROM itemsite, item, uom, warehous,
        (SELECT rcalitem_id AS calitem_id
           FROM rcalitem
          WHERE (rcalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                ))
          UNION
         SELECT acalitem_id as calitem_id
           FROM acalitem
          WHERE (acalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                ))
         ) AS calitem
  WHERE ((itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN (SELECT plancode_id FROM plancode WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
   )
-GROUP BY pstart, pend, period, item_number, warehous_code, item_invuom
+GROUP BY pstart, pend, period, item_number, warehous_code, uom_name
 ORDER BY pstart, item_number, warehous_code;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: TimePhasedProductionByPlannerCode
 QUERY: detail
 SELECT findPeriodStart(calitem_id) AS pstart,
        findPeriodEnd(calitem_id) AS pend,
        (formatDate(findPeriodStart(calitem_id)) || '-' || formatDate(findPeriodEnd(calitem_id))) AS period,
        plancode_code,
        <? if exists("inventoryUnits") ?>
-         item_invuom
+         uom_name
        <? elseif exists("capacityUnits") ?>
-         item_capuom
+         itemcapuom(item_id)
        <? elseif exists("altCapacityUnits") ?>
-         item_altcapuom
+         itemaltcapuom(item_id)
        <? else ?>
          text('')
        <? endif ?>
        AS f_uom,
        warehous_code,
        <? if exists("inventoryUnits") ?>
          formatQty(SUM(summProd(itemsite_id, calitem_id)))
        <? elseif exists("capacityUnits") ?>
-         formatQty(SUM(summProd(itemsite_id, calitem_id) * item_capinvrat))
+         formatQty(SUM(summProd(itemsite_id, calitem_id) * itemcapinvrat(item_id)))
        <? elseif exists("altCapacityUnits") ?>
-         formatQty(SUM(summProd(itemsite_id, calitem_id) * item_altcapinvrat))
+         formatQty(SUM(summProd(itemsite_id, calitem_id) * itemaltcapinvrat(item_id)))
        <? else ?>
          formatQty(SUM(summProd(itemsite_id, calitem_id)))
        <? endif ?>
        AS f_unit
-  FROM itemsite, item, warehous, plancode,
+  FROM itemsite, item, uom, warehous, plancode,
        (SELECT rcalitem_id AS calitem_id
           FROM rcalitem
          WHERE (rcalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                ))
          UNION
         SELECT acalitem_id as calitem_id
           FROM acalitem
          WHERE (acalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                                ))
         ) AS calitem
  WHERE ((itemsite_warehous_id=warehous_id)
 <? if not exists("showInactive") ?>
    AND (itemsite_active)
 <? endif ?>
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_plancode_id=plancode_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("plancode_id") ?>
    AND (plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (plancode_code ~ <? value("plancode_pattern") ?>)
 <? endif ?>
   )
 GROUP BY pstart, pend, period, plancode_code, warehous_code, f_uom
 ORDER BY pstart, plancode_code, warehous_code, f_uom;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: TimePhasedSalesHistoryByItem
 QUERY: detail
 SELECT findPeriodStart(rcalitem_id) AS pstart,
        findPeriodEnd(rcalitem_id) AS pend,
        (formatDate(findPeriodStart(rcalitem_id)) || '-' || formatDate(findPeriodEnd(rcalitem_id))) AS period,
        item_number,
        <? if exists("inventoryUnits") ?>
-         item_invuom
+         uom_name
        <? else ?>
          text('')
        <? endif ?>
        AS f_uom,
        warehous_code,
        <? if exists("inventoryUnits") ?>
          formatExtPrice(shipmentsByItemQty(itemsite_id, rcalitem_id))
        <? else ?>
          formatExtPrice(shipmentsByItemValue(itemsite_id, rcalitem_id))
        <? endif ?>
        AS f_unit,
        <? if exists("inventoryUnits") ?>
          shipmentsByItemQty(itemsite_id, rcalitem_id)
        <? else ?>
          shipmentsByItemValue(itemsite_id, rcalitem_id)
        <? endif ?>
        AS unit
-  FROM rcalitem, itemsite, item, warehous
+  FROM rcalitem, itemsite, item, uom, warehous
  WHERE ((rcalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                         ))
    AND (itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
    AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (item_prodcat_id IN ( SELECT prodcat_id
                                FROM prodcat
                               WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
   )
  UNION
 SELECT findPeriodStart(acalitem_id) AS pstart,
        findPeriodEnd(acalitem_id) AS pend,
        (formatDate(findPeriodStart(acalitem_id)) || '-' || formatDate(findPeriodEnd(acalitem_id))) AS period,
        item_number,
        <? if exists("inventoryUnits") ?>
-         item_invuom
+         uom_name
        <? else ?>
          text('')
        <? endif ?>
        AS f_uom,
        warehous_code,
        <? if exists("inventoryUnits") ?>
          formatExtPrice(shipmentsByItemQty(itemsite_id, acalitem_id))
        <? else ?>
          formatExtPrice(shipmentsByItemValue(itemsite_id, acalitem_id))
        <? endif ?>
        AS f_unit,
        <? if exists("inventoryUnits") ?>
          shipmentsByItemQty(itemsite_id, acalitem_id)
        <? else ?>
          shipmentsByItemValue(itemsite_id, acalitem_id)
        <? endif ?>
        AS unit
-  FROM acalitem, itemsite, item, warehous
+  FROM acalitem, itemsite, item, uom, warehous
  WHERE ((acalitem_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                         ))
    AND (itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
    AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (item_prodcat_id IN ( SELECT prodcat_id
                                FROM prodcat
                               WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
   )
 ORDER BY pstart, item_number, warehous_code;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: TimePhasedSalesHistoryByProductCategory
 QUERY: detail
 SELECT findPeriodStart(rcalitem_id) AS pstart,
        findPeriodEnd(rcalitem_id) AS pend,
        (formatDate(findPeriodStart(rcalitem_id)) || '-' || formatDate(findPeriodEnd(rcalitem_id))) AS period,
        prodcat_code,
        <? if exists("inventoryUnits") ?>
-         item_invuom
+         uom_name
        <? elseif exists("capacityUnits") ?>
-         item_capuom
+         itemcapuom(item_id)
        <? elseif exists("altCapacityUnits") ?>
-         item_altcapuom
+         itemaltcapuom(item_id)
        <? else ?>
          text('')
        <? endif ?>
        AS f_uom,
        warehous_code,
        <? if exists("inventoryUnits") ?>
          formatExtPrice(SUM(shipmentsByItemQty(itemsite_id, rcalitem_id)))
        <? elseif exists("capacityUnits") ?>
-         formatExtPrice(SUM(shipmentsByItemQty(itemsite_id, rcalitem_id) * item_capinvrat))
+         formatExtPrice(SUM(shipmentsByItemQty(itemsite_id, rcalitem_id) * itemcapinvrat(item_id)))
        <? elseif exists("altCapacityUnits") ?>
-         formatExtPrice(SUM(shipmentsByItemQty(itemsite_id, rcalitem_id) * item_altcapinvrat))
+         formatExtPrice(SUM(shipmentsByItemQty(itemsite_id, rcalitem_id) * itemaltcapinvrat(item_id)))
        <? else ?>
          formatExtPrice(SUM(shipmentsByItemValue(itemsite_id, rcalitem_id)))
        <? endif ?>
        AS f_unit,
        <? if exists("inventoryUnits") ?>
          SUM(shipmentsByItemQty(itemsite_id, rcalitem_id))
        <? elseif exists("capacityUnits") ?>
-         SUM(shipmentsByItemQty(itemsite_id, rcalitem_id) * item_capinvrat)
+         SUM(shipmentsByItemQty(itemsite_id, rcalitem_id) * itemcapinvrat(item_id))
        <? elseif exists("altCapacityUnits") ?>
-         SUM(shipmentsByItemQty(itemsite_id, rcalitem_id) * item_altcapinvrat)
+         SUM(shipmentsByItemQty(itemsite_id, rcalitem_id) * itemaltcapinvrat(item_id))
        <? else ?>
          SUM(shipmentsByItemValue(itemsite_id, rcalitem_id))
        <? endif ?>
        AS unit
-  FROM rcalitem, itemsite, item, warehous, prodcat
+  FROM rcalitem, itemsite, item, uom, warehous, prodcat
  WHERE ((rcalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                         ))
    AND (itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (item_prodcat_id=prodcat_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
   )
 GROUP BY pstart, pend, period, prodcat_code, warehous_code, f_uom
  UNION
 SELECT findPeriodStart(acalitem_id) AS pstart,
        findPeriodEnd(acalitem_id) AS pend,
        (formatDate(findPeriodStart(acalitem_id)) || '-' || formatDate(findPeriodEnd(acalitem_id))) AS period,
        prodcat_code,
        <? if exists("inventoryUnits") ?>
-         item_invuom
+         uom_name
        <? elseif exists("capacityUnits") ?>
-         item_capuom
+         itemcapuom(item_id)
        <? elseif exists("altCapacityUnits") ?>
-         item_altcapuom
+         itemaltcapuom(item_id)
        <? else ?>
          text('')
        <? endif ?>
        AS f_uom,
        warehous_code,
        <? if exists("inventoryUnits") ?>
          formatExtPrice(SUM(shipmentsByItemQty(itemsite_id, acalitem_id)))
        <? elseif exists("capacityUnits") ?>
-         formatExtPrice(SUM(shipmentsByItemQty(itemsite_id, acalitem_id) * item_capinvrat))
+         formatExtPrice(SUM(shipmentsByItemQty(itemsite_id, acalitem_id) * itemcapinvrat(item_id)))
        <? elseif exists("altCapacityUnits") ?>
-         formatExtPrice(SUM(shipmentsByItemQty(itemsite_id, acalitem_id) * item_altcapinvrat))
+         formatExtPrice(SUM(shipmentsByItemQty(itemsite_id, acalitem_id) * itemaltcapinvrat(item_id)))
        <? else ?>
          formatExtPrice(SUM(shipmentsByItemValue(itemsite_id, acalitem_id)))
        <? endif ?>
        AS f_unit,
        <? if exists("inventoryUnits") ?>
          SUM(shipmentsByItemQty(itemsite_id, acalitem_id))
        <? elseif exists("capacityUnits") ?>
-         SUM(shipmentsByItemQty(itemsite_id, acalitem_id) * item_capinvrat)
+         SUM(shipmentsByItemQty(itemsite_id, acalitem_id) * itemcapinvrat(item_id))
        <? elseif exists("altCapacityUnits") ?>
-         SUM(shipmentsByItemQty(itemsite_id, acalitem_id) * item_altcapinvrat)
+         SUM(shipmentsByItemQty(itemsite_id, acalitem_id) * itemaltcapinvrat(item_id))
        <? else ?>
          SUM(shipmentsByItemValue(itemsite_id, acalitem_id))
        <? endif ?>
        AS unit
-  FROM acalitem, itemsite, item, warehous, prodcat
+  FROM acalitem, itemsite, item, uom, warehous, prodcat
  WHERE ((acalitem_id IN (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                         ))
    AND (itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (item_prodcat_id=prodcat_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
    AND (prodcat_id=<? value("prodcat_id") ?>)
 <? elseif exists("prodcat_pattern") ?>
    AND (prodcat_code ~ <? value("prodcat_pattern") ?>)
 <? endif ?>
   )
 GROUP BY pstart, pend, period, prodcat_code, warehous_code, f_uom
 ORDER BY pstart, prodcat_code, warehous_code, f_uom;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: UniformBOL
 QUERY: detail
 SELECT 1 as one,
        coitem_linenumber,
        formatQty(SUM(coship_qty)) AS invqty,
-       item_invuom,
+       uom_name,
        roundUp(SUM(coship_qty) / item_shipinvrat)::integer AS shipqty,
        item_shipuom, item_number, item_descrip1, item_descrip2,
        formatQty(SUM(coship_qty) * item_prodweight) AS netweight,
        formatQty(SUM(coship_qty) * (item_prodweight + item_packweight)) AS grossweight
-  FROM coship, coitem, itemsite, item
+  FROM coship, coitem, itemsite, item, uom
  WHERE ((coship_coitem_id=coitem_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (coship_cosmisc_id=%1))
 GROUP BY coitem_linenumber, item_number,
-         item_invuom, item_shipinvrat,
+         uom_name, item_shipinvrat,
          item_shipuom, item_descrip1,
          item_descrip2, item_prodweight,
          item_packweight
 ORDER BY coitem_linenumber;

 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: UninvoicedShipments
 QUERY: detail
 SELECT cohead_id, coship_id, cohead_number, coitem_linenumber,
        item_number, item_descrip1, item_descrip2,
+       uom_name,
        formatQty(SUM(coship_qty)) AS f_shipped,
        formatQty(COALESCE(SUM(cobill_qty), 0)) AS f_selected
-FROM cohead, itemsite, item,
+FROM cohead, itemsite, item, uom,
      warehous, coship, cosmisc,
      coitem LEFT OUTER JOIN
       ( cobill JOIN cobmisc
         ON ( (cobill_cobmisc_id=cobmisc_id) AND (NOT cobmisc_posted) ) )
      ON (cobill_coitem_id=coitem_id)
 WHERE ( (coship_coitem_id=coitem_id)
  AND (coship_cosmisc_id=cosmisc_id)
  AND (coitem_cohead_id=cohead_id)
  AND (coitem_itemsite_id=itemsite_id)
+ AND (coitem_qty_uom_id=uom_id)
  AND (itemsite_item_id=item_id)
  AND (itemsite_warehous_id=warehous_id)
  AND (cosmisc_shipped)
  AND (NOT coship_invoiced)
 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
  )
 GROUP BY cohead_number, coitem_id, coitem_linenumber, item_number,
-         item_descrip1, item_descrip2, cohead_id, coship_id;
+         item_descrip1, item_descrip2, cohead_id, coship_id, uom_name;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: UnpostedPoReceipts
 QUERY: detail
 SELECT porecv_id, porecv_poitem_id, porecv_ponumber,
        (vend_number || '-' || vend_name) AS vend_number,
        poitem_linenumber,
        formatDate(porecv_duedate) AS porecv_duedate,
        COALESCE(item_number, 'Non-Inventory') AS item_number,
-       COALESCE(item_invuom, 'N/A') AS item_invuom,
+       COALESCE(uom_name, 'N/A') AS uom_name,
        porecv_vend_item_number,
        porecv_vend_uom,
        formatQty(poitem_qty_ordered) AS poitem_qty_ordered,
        formatQty(poitem_qty_received) AS poitem_qty_received,
        formatQty(porecv_qty) AS porecv_qty,
        formatDate(porecv_date) AS porecv_date,
        formatDate(COALESCE(porecv_gldistdate, porecv_date)) AS porecv_gldistdate,
       poitem_pohead_id
 FROM vend, pohead, poitem, porecv LEFT OUTER JOIN
-     (itemsite JOIN ITEM ON (itemsite_item_id=item_id))
+     (itemsite JOIN item ON (itemsite_item_id=item_id) JOIN uom ON (item_inv_uom_id=uom_id))
       ON (porecv_itemsite_id=itemsite_id)
 WHERE ( (porecv_poitem_id=poitem_id)
   AND   (NOT porecv_posted)
   AND   (poitem_pohead_id=pohead_id)
   AND   (pohead_vend_id=vend_id))
 ORDER BY porecv_ponumber, poitem_linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: UnpostedReturnsForPO
 QUERY: detail
 SELECT poitem_linenumber,
        COALESCE(item_number, 'Non-Inventory') AS item_number,
-       COALESCE(item_invuom, 'N/A') AS item_invuom,
+       COALESCE(uom_name, 'N/A') AS uom_name,
        poitem_vend_item_number, poitem_vend_uom,
        formatQty(poitem_qty_ordered)  AS f_poitem_qty_ordered,
        formatQty(poitem_qty_received) AS f_poitem_qty_received,
        formatQty(poitem_qty_returned) AS f_poitem_qty_returned,
        formatQty(SUM(COALESCE(poreject_qty, 0))) AS f_poreject_qty,
        rjctcode_code
 FROM poreject LEFT OUTER JOIN rjctcode ON (poreject_rjctcode_id=rjctcode_id),
      poitem LEFT OUTER JOIN
      ( itemsite JOIN item
-       ON (itemsite_item_id=item_id)
+       ON (itemsite_item_id=item_id) JOIN uom ON (item_inv_uom_id=uom_id)
      ) ON (poitem_itemsite_id=itemsite_id)
 WHERE ((poreject_poitem_id=poitem_id)
   AND  (NOT poreject_posted)
   AND  (poitem_pohead_id=<? value("pohead_id") ?>))
 GROUP BY
         poitem_linenumber,
         item_number,
-        item_invuom,
+        uom_name,
         poitem_vend_item_number,
         poitem_vend_uom,
         poitem_qty_ordered,
         poitem_qty_received,
         poitem_qty_returned,
         rjctcode_code
 ORDER BY poitem_linenumber;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: UnusedPurchasedItems
 QUERY: detail
 SELECT DISTINCT item_id,
        item_number,
        item_descrip1,
        item_descrip2,
-       item_invuom,
+       uom_name,
        formatQty(SUM(itemsite_qtyonhand)) AS f_qoh,
        formatDate(MAX(itemsite_datelastcount), 'Never') AS f_lastcntd,
        formatDate(MAX(itemsite_datelastused), 'Never') AS f_lastused
-  FROM item, itemsite
+  FROM item, itemsite, uom
  WHERE ((itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (item_id NOT IN (SELECT DISTINCT bomitem_item_id FROM bomitem))
    AND (NOT item_sold)
    AND (item_type IN ('P', 'O'))
 <? if exists("classcode_id") ?>
    AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (item_classcode_id IN (SELECT classcode_id
                                 FROM classcode
                                WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? endif ?>
 <? if not exists("includeUncontrolledItems") ?>
    AND (itemsite_controlmethod <> 'N')
 <? endif ?>
 )
-GROUP BY item_id, item_number, item_invuom, item_descrip1, item_descrip2
+GROUP BY item_id, item_number, uom_name, item_descrip1, item_descrip2
 ORDER BY item_number;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: ViewAPCheckRunEditList
 QUERY: detail
-SELECT apchk_id AS primaryid,
+SELECT checkhead_id AS primaryid,
        -1 AS secondaryid,
-       formatBoolYN(apchk_void) AS f_void,
-       formatBoolYN(apchk_printed) AS f_printed,
-       TEXT(apchk_number) AS number,
-       (vend_number || '-' || vend_name) AS description,
-       formatDate(apchk_checkdate) AS f_checkdate,
-       formatMoney(apchk_amount) AS f_amount,
-       apchk_number AS orderby
-  FROM apchk, vend
- WHERE ( (apchk_vend_id=vend_id)
-   AND (apchk_bankaccnt_id=<? value("bankaccnt_id") ?>)
-   AND (NOT apchk_posted)
-   AND (NOT apchk_replaced)
-   AND (NOT apchk_deleted) )
+       formatBoolYN(checkhead_void) AS f_void,
+       formatBoolYN(checkhead_printed) AS f_printed,
+       TEXT(checkhead_number) AS number,
+       (checkrecip_number || '-' || checkrecip_name) AS description,
+       formatDate(checkhead_checkdate) AS f_checkdate,
+       formatMoney(checkhead_amount) AS f_amount,
+       checkhead_number,
+       1 AS orderby
+  FROM checkhead LEFT OUTER JOIN
+       checkrecip ON ((checkrecip_id=checkhead_recip_id)
+		 AND  (checkrecip_type=checkhead_recip_type))
+ WHERE ((checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
+   AND  (NOT checkhead_posted)
+   AND  (NOT checkhead_replaced)
+   AND  (NOT checkhead_deleted) )

-UNION SELECT apchkitem_apchk_id AS primaryid,
-             apchkitem_id AS secondaryid,
+UNION SELECT checkitem_checkhead_id AS primaryid,
+             checkitem_id AS secondaryid,
              '' AS f_void,
              '' AS f_printed,
-             apchkitem_vouchernumber AS number,
-             apchkitem_invcnumber AS description,
+             CASE WHEN (checkitem_ranumber IS NOT NULL) THEN checkitem_ranumber::TEXT
+	          ELSE checkitem_vouchernumber
+	     END AS number,
+             CASE WHEN (checkitem_cmnumber IS NOT NULL) THEN checkitem_cmnumber::TEXT
+	          ELSE checkitem_invcnumber
+	     END AS description,
              '' AS f_checkdate,
-             formatMoney(apchkitem_amount) AS f_amount,
-             apchk_number AS orderby
-        FROM apchkitem, apchk
-       WHERE ( (apchkitem_apchk_id=apchk_id)
-         AND (apchk_bankaccnt_id=<? value("bankaccnt_id") ?>)
-         AND (NOT apchk_posted)
-         AND (NOT apchk_replaced)
-         AND (NOT apchk_deleted) )
+             formatMoney(checkitem_amount) AS f_amount,
+	     checkhead_number,
+             2 AS orderby
+        FROM checkitem, checkhead
+       WHERE ( (checkitem_checkhead_id=checkhead_id)
+         AND (checkhead_bankaccnt_id=<? value("bankaccnt_id") ?>)
+         AND (NOT checkhead_posted)
+         AND (NOT checkhead_replaced)
+         AND (NOT checkhead_deleted) )

-ORDER BY orderby desc, secondaryid, number;
+ORDER BY checkhead_number, primaryid, orderby;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: VoucheringEditList
 QUERY: detail
 SELECT orderid,
        CASE WHEN(itemid = 1) THEN text(vouchernumber)
             ELSE ''
        END AS vouchernumber,
        ponumber,
        CASE WHEN(itemid = 1) THEN invoicenumber
             ELSE itemnumber
        END AS itemnumber,
        CASE WHEN(itemid = 1) THEN itemnumber
             ELSE ''
        END AS vendnumber,
        description,
-       item_invuom,
+       iteminvuom,
        f_qty,
        CASE WHEN(itemid = 1) THEN cost
             ELSE 0
        END AS cost,
        f_cost,
        account,
        COALESCE((SELECT formatGLAccountLong(accnt_id)
                    FROM accnt
                   WHERE (accnt_id=findAPAccount(vendid))
                   LIMIT 1
                 ), 'Not Assigned') AS debit_account
   FROM voucheringEditList;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: WOHistoryByClassCode
 QUERY: Detail
 SELECT formatWoNumber(wo_id) AS wonumber,
        wo_status, warehous_code,
-       item_number, item_descrip1, item_descrip2, item_invuom,
+       item_number, item_descrip1, item_descrip2, uom_name,
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
-  FROM wo, itemsite, warehous, item
+  FROM wo, itemsite, warehous, item, uom
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
 <? if exists("classcode_id") ?>
    AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (item_classcode_id IN (SELECT classcode_id FROM classcode WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("showOnlyTopLevel") ?>
    AND ((wo_ordtype<>'W') OR (wo_ordtype IS NULL))
 <? endif ?>
  )
 ORDER BY item_number;

 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: WOHistoryByNumber
 QUERY: Detail
 SELECT wo_subnumber AS subnumber,
        wo_status, warehous_code,
-       item_number, item_descrip1, item_descrip2, item_invuom,
+       item_number, item_descrip1, item_descrip2, uom_name,
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
-  FROM wo, itemsite, warehous, item
+  FROM wo, itemsite, warehous, item, uom
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_number=<? value("woNumber") ?>)
 <? if exists("showOnlyTopLeve") ?>
    AND ((wo_ordtype<>'W') OR (wo_ordtype IS NULL))
 <? endif ?>
  )
 ORDER BY wo_subnumber;

 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: WOMaterialAvailabilityByWorkOrder
 QUERY: head
 SELECT formatWONumber(wo_id) AS wonumber,
        warehous_code as warehouse,
-       item_number, item_descrip1, item_descrip2, item_invuom,
+       item_number, item_descrip1, item_descrip2, uom_name,
        wo_status AS status
-  FROM wo, itemsite, item, warehous
+  FROM wo, itemsite, item, uom, warehous
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_id=<? value("wo_id") ?>) );
 --------------------------------------------------------------------

 QUERY: detail
-SELECT item_number, item_descrip1, item_descrip2, item_invuom,
+SELECT item_number, item_descrip1, item_descrip2, uom_name,
                formatQty(qoh) AS adjqoh,
                formatQty(wobalance) AS woalloc,
                formatQty(allocated) AS totalalloc,
                formatQty(ordered) AS ordered,
                formatQty(qoh + ordered - wobalance) AS woavail,
                formatQty(qoh + ordered - allocated) AS totalavail
    FROM (SELECT item_number, item_descrip1, item_descrip2,
-                item_invuom,
+                uom_name,
                 noNeg(itemsite_qtyonhand) AS qoh,
                 noNeg(womatl_qtyreq - womatl_qtyiss) AS wobalance,
                 qtyAllocated(itemsite_id, womatl_duedate) AS allocated,
                 qtyOrdered(itemsite_id, womatl_duedate) AS ordered
-           FROM wo, womatl, itemsite, item
+           FROM wo, womatl, itemsite, item, uom
           WHERE ((womatl_wo_id=wo_id)
              AND (womatl_itemsite_id=itemsite_id)
              AND (itemsite_item_id=item_id)
+             AND (womatl_uom_id=uom_id)
              AND (womatl_wo_id=<? value("wo_id") ?>))
         ) AS data
 <? if exists("onlyShowShortages") ?>
  WHERE ( ((qoh + ordered - allocated) < 0) OR ((qoh + ordered - wobalance) < 0) )
 <? endif ?>
 ORDER BY item_number;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: WOMaterialRequirementsByComponentItem
 QUERY: detail
 SELECT formatWONumber(wo_id) AS wonumber,
                item_number, item_descrip1, item_descrip2,
                CASE WHEN (womatl_issuemethod='S') THEN 'Push'
                          WHEN (womatl_issuemethod='L') THEN 'Pull'
                          WHEN (womatl_issuemethod='M') THEN 'Mixed'
                          ELSE 'Error'
                 END AS issuemethod,
+                uom_name,
                 formatQty(womatl_qtyper) AS qtyper,
                 formatScrap(womatl_scrap) AS scrappercent,
                 formatQty(womatl_qtyreq) AS required,
                 formatQty(womatl_qtyiss) AS issued,
                 formatQty(noNeg(womatl_qtyreq - womatl_qtyiss)) AS balance,
                 formatDate(womatl_duedate) AS duedate
-    FROM wo, womatl, itemsite AS parentsite, itemsite AS componentsite, item
+    FROM wo, womatl, itemsite AS parentsite, itemsite AS componentsite, item, uom
 WHERE ((womatl_wo_id=wo_id)
+       AND (womatl_uom_id=uom_id)
        AND (wo_status <> 'C')
        AND (wo_itemsite_id=parentsite.itemsite_id)
        AND (womatl_itemsite_id=componentsite.itemsite_id)
        AND (parentsite.itemsite_item_id=item_id)
        AND (componentsite.itemsite_item_id=<? value("item_id") ?>)
 <? if exists("warehous_id") ?>
        AND (componentsite.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
  )
 ORDER BY wo_startdate;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: WOMaterialRequirementsByWorkOrder
 QUERY: head
 SELECT formatWONumber(wo_id) AS wonumber,
        warehous_code as warehouse,
        item_number, item_descrip1,
-       item_descrip2, item_invuom,
+       item_descrip2, uom_name,
        wo_status AS status
-  FROM wo, itemsite, item, warehous
+  FROM wo, itemsite, item, uom, warehous
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
+   AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_id=<? value("wo_id") ?>) );
 --------------------------------------------------------------------

 QUERY: detail
 SELECT womatl_id, item_number,
        item_descrip1, item_descrip2,
        CASE WHEN (womatl_issuemethod = 'S') THEN 'Push'
             WHEN (womatl_issuemethod = 'L') THEN 'Pull'
             WHEN (womatl_issuemethod = 'M') THEN 'Mixed'
             ELSE 'Error'
        END AS issuemethod,
+       uom_name,
        formatQtyper(womatl_qtyper) AS qtyper,
        formatScrap(womatl_scrap) AS scrappercent,
        formatQty(womatl_qtyreq) AS required,
        formatQty(womatl_qtyiss) AS issued,
        formatQty(noNeg(womatl_qtyreq - womatl_qtyiss)) AS balance,
        formatDate(womatl_duedate) AS duedate
-FROM wo, womatl, itemsite, item
+FROM wo, womatl, itemsite, item, uom
 WHERE ((womatl_wo_id=wo_id)
+ AND (womatl_uom_id=uom_id)
  AND (womatl_itemsite_id=itemsite_id)
  AND (itemsite_item_id=item_id)
  AND (wo_id=<? value("wo_id") ?>) )
 ORDER BY item_number;
 --------------------------------------------------------------------


 --------------------------------------------------------------------
 REPORT: WOScheduleByParameterList
 QUERY: Detail
 SELECT formatWONumber(wo_id) AS wonumber,
-       wo_status, warehous_code, item_number, item_descrip1, item_descrip2, item_invuom,
+       wo_status, warehous_code, item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(wo_qtyord) AS ordered,
        formatQty(wo_qtyrcv) AS received,
        formatDate(wo_startdate) AS startdate,
        formatDate(wo_duedate) AS duedate
-FROM wo, itemsite, warehous, item
+FROM wo, itemsite, warehous, item, uom
 WHERE ( (wo_itemsite_id=itemsite_id)
  AND (itemsite_item_id=item_id)
+ AND (item_inv_uom_id=uom_id)
  AND (itemsite_warehous_id=warehous_id)

 <? if exists("showOnlyRI") ?>
  AND (wo_status IN ('R', 'I'))
 <? else ?>
  AND (wo_status <> 'C')
 <? endif ?>

 <? if exists("showOnlyTopLevel") ?>
  AND (wo_ordtype<>'W')
 <? endif ?>

 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>

 <? if exists("item_id") ?>
  AND (itemsite_item_id=<? value("item_id") ?>)
 <? endif ?>

 <? if exists("plancode_id") ?>
  AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
  AND (itemsite_plancode_id IN (SELECT plancode_id FROM plancode WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>

 <? if exists("classcode_id") ?>
  AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
  AND (item_classcode_id IN (SELECT classcode_id FROM classcode WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? endif ?>

 <? if exists("itemgrp_id") ?>
  AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
  AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem, itemgrp WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id) AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) )))
 <? endif ?>

 <? if exists("wrkcnt_id") ?>
  AND (wo_id IN (SELECT wooper_wo_id FROM wooper WHERE (wooper_wrkcnt_id=<? value("wrkcnt_id") ?>)))
 <? elseif exists("wrkcnt_pattern") ?>
  AND (wo_id IN (SELECT wooper_wo_id FROM wooper, wrkcnt WHERE ( (wooper_wrkcnt_id=wrkcnt_id) AND (wrkcnt_code ~ <? value("wrkcnt_pattern") ?>) )))
 <? endif ?>

  AND (wo_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
 ORDER BY

 <? if exists("sortByStartDate") ?>
   wo_startdate,
 <? elseif exists("sortByDueDate") ?>
   wo_duedate,
 <? elseif exists("sortByItemNumber") ?>
   item_number,
 <? endif ?>

   wo_number, wo_subnumber;

 --------------------------------------------------------------------