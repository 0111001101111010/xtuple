--------------------------------------------------------------------
REMOVED REPORTS:
ListOpenReturnAuthorizations
--------------------------------------------------------------------
NEW REPORTS:
Contracts
SaleTypesMasterList
--------------------------------------------------------------------
CHANGED REPORTS:
APCheck
ARApplications
Backlog
BillingSelections
Bookings
BriefSalesHistory
BuyCard
CashReceipts
CashReceiptsEditList
CheckMultiPage
CountSlipEditList
CountSlipsByWarehouse
CountTagEditList
CountTagsByClassCode
CountTagsByItem
CountTagsByWarehouse
CreditMemo
CustOrderAcknowledgement
CustomerARHistory
CustomerInformation
DeliveryDateVariancesByItem
DeliveryDateVariancesByVendor
DetailedInventoryHistoryByLocation
ExpiredInventoryByClassCode
FreightPricesByCustomer
FrozenItemSites
InventoryAvailability
InventoryAvailabilityByCustomerType
InventoryAvailabilityBySalesOrder
InventoryAvailabilityBySourceVendor
InventoryHistory
Invoice
InvoiceInformation
ItemSites
ItemSources
ListOpenSalesOrders
LocationDispatchList
MaterialUsageVarianceByBOMItem
MaterialUsageVarianceByComponentItem
MaterialUsageVarianceByItem
MaterialUsageVarianceByWarehouse
MaterialUsageVarianceByWorkOrder
OpenWorkOrdersWithClosedParentSalesOrders
OpenWorkOrdersWithParentSalesOrders
POHistory
POLineItemsByDate
POLineItemsByItem
POLineItemsByVendor
POsByDate
POsByVendor
PackingList-Shipment
PackingList
PackingListBatchEditList
PartiallyShippedOrders
PendingWOMaterialAvailability
PickList
PickListWOShowLocations
PickingListSOClosedLines
PickingListSOLocsNoClosedLines
PickingListSONoClosedLines
PricesByCustomer
PricesByItem
PricingScheduleAssignments
PurchaseOrder
PurchasePriceVariancesByItem
PurchasePriceVariancesByVendor
PurchaseReqsByPlannerCode
PurchaseRequestsByItem
PurchaseReqsByPlannerCode
QOH
QOHByLocation
Quote
ReceiptsReturnsByDate
ReceiptsReturnsByItem
ReceiptsReturnsByVendor
RejectedMaterialByVendor
ReorderExceptionsByPlannerCode
RunningAvailability
SalesAccountAssignmentsMasterList
SalesHistory
SalesOrderAcknowledgement
SalesOrderStatus
SelectPaymentsList
SelectedPaymentsList
ShipToMasterList
ShipmentsByDate
ShipmentsBySalesOrder
ShipmentsByShipment
ShipmentsPending
ShippingLabelsByInvoice
ShippingLabelsBySo
SlowMovingInventoryByClassCode
StandardBOL
Statement
SubstituteAvailabilityByRootItem
SummarizedBacklogByWarehouse
SummarizedSalesHistory
TimePhasedAvailability
TimePhasedBookings
TimePhasedDemandByPlannerCode
TimePhasedOpenAPItems
TimePhasedOpenARItems
TimePhasedPlannedRevenueExpensesByPlannerCode
TimePhasedProductionByItem
TimePhasedProductionByPlannerCode
TimePhasedSalesHistory
TimePhasedStatisticsByItem
TimePhasedStatisticsByItem
UnappliedAPCreditMemos
UnappliedARCreditMemos
UniformBOL
UninvoicedReceipts
UninvoicedShipments
UnpostedPoReceipts
ValidLocationsByItem
VendorAPHistory
VendorAddressList
VoucherRegister
WOHistoryByClassCode
WOHistoryByItem
WOHistoryByNumber
WOMaterialAvailabilityByWorkOrder
WOMaterialRequirementsByComponentItem
WOMaterialRequirementsByWorkOrder
WOSchedule
WarehouseLocationMasterList
Items

 
 --------------------------------------------------------------------
 REPORT: APCheck
 QUERY: Head
 SELECT
 checkhead_id, checkhead_number, checkhead_for AS memo,
 formatDate(checkhead_checkdate) AS f_checkdate,
 formatMoney(checkhead_amount) AS f_amount,
 INITCAP(spellAmount(checkhead_amount, curr_id)) AS f_words,
 CASE WHEN(checkhead_void) THEN TEXT('V O I D')
      ELSE TEXT('')
 END AS f_void,
 CASE WHEN checkhead_recip_type = 'C' THEN (SELECT cust_number
                                            FROM custinfo
                                            WHERE (cust_id=checkhead_recip_id))
      WHEN checkhead_recip_type = 'T' THEN (SELECT taxauth_code
                                            FROM taxauth
                                            WHERE (taxauth_id=checkhead_recip_id))
      WHEN checkhead_recip_type = 'V' THEN (SELECT vend_number
                                            FROM vendinfo
                                            WHERE (vend_id=checkhead_recip_id))
      ELSE 'Unknown Recipient Type'
 END AS recip_number,
 formatAddr(CASE WHEN checkhead_recip_type = 'C' THEN
                                          (SELECT cntct_addr_id
                                           FROM cntct, custinfo
                                           WHERE ((cust_cntct_id=cntct_id)
                                             AND  (cust_id=checkhead_recip_id)))
                 WHEN checkhead_recip_type = 'T' THEN 
                                          (SELECT taxauth_addr_id
                                           FROM taxauth
                                           WHERE (taxauth_id=checkhead_recip_id))
                 WHEN checkhead_recip_type = 'V' THEN
                         COALESCE((SELECT vendaddr_addr_id
                                   FROM vendaddrinfo
                                   WHERE ((UPPER(vendaddr_code)='REMIT')
                                     AND  (vendaddr_vend_id=checkhead_recip_id))),
                                  (SELECT vend_addr_id
                                   FROM vendinfo
                                   WHERE (vend_id=checkhead_recip_id)))
            END) AS check_address,
 CASE WHEN checkhead_recip_type = 'C' THEN (SELECT cust_name
                                            FROM custinfo
                                            WHERE cust_id=checkhead_recip_id)
      WHEN checkhead_recip_type = 'T' THEN (SELECT taxauth_name
                                            FROM taxauth
                                            WHERE taxauth_id=checkhead_recip_id)
      WHEN checkhead_recip_type = 'V' THEN
                          COALESCE((SELECT vendaddr_name
-                                   FROM vendaddr
+                                   FROM vendaddrinfo
                                    WHERE ((UPPER(vendaddr_code)='REMIT')
                                      AND  (vendaddr_vend_id=checkhead_recip_id))),
                                   (SELECT vend_name
                                    FROM vendinfo
                                    WHERE (vend_id=checkhead_recip_id)))
 END AS recip_name, 
 curr_symbol, curr_abbr, curr_name
 FROM checkhead, curr_symbol
 WHERE ((checkhead_curr_id = curr_id)
    AND (checkhead_id=<? value("checkhead_id") ?>) );
 
 
 --------------------------------------------------------------------
 REPORT: ARApplications
 QUERY: head
 SELECT <? if exists("cust_id") ?>
          (SELECT (cust_number || '-' || cust_name)
-            FROM cust
+            FROM custinfo
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
        <? if exists("includeCashReceipts") ?>
          <? if exists("includeCreditMemos") ?>
            text('Show Cash Receipts and Credit Memos')
          <? else ?>
            text('Show Cash Receipts')
          <? endif ?>
        <? elseif exists("includeCreditMemos") ?>
          text('Show Credit Memos')
        <? else ?>
          text('Error: No transaction type selected.')
        <? endif ?>
        AS f_show;
 
 --------------------------------------------------------------------
 REPORT: Backlog
 QUERY: detail
 SELECT cohead_number, coitem_linenumber, cust_name,
        formatDate(cohead_orderdate) AS f_orderdate,
        formatDate(coitem_scheddate) AS f_scheddate,
        item_number, uom_name,
        item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS f_qtyord,
        formatQty(coitem_qtyshipped) AS f_qtyship,
        formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned)) AS f_balance, 
        CASE WHEN (checkPrivilege('ViewCustomerPrices')) THEN
 formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
                 * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2))
        ELSE
          text('')
        END
        AS f_ammount,
        CASE WHEN (checkPrivilege('ViewCustomerPrices') AND isMultiCurr()) THEN
 formatMoney(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
                 * (coitem_price / coitem_price_invuomratio),2))
        ELSE
          text('')
        END
        AS foreign_ammount,
 round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
     * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2) AS backlog 
-  FROM cohead, coitem, itemsite, item, cust, uom
+  FROM cohead, coitem, itemsite, item, custinfo, uom
  WHERE ((coitem_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (coitem_status='O')
   <? if exists("cohead_id") ?>
     AND  (coitem_cohead_id=<? value("cohead_id") ?>)
   <? endif ?>
   <? if exists("startDate") ?>
     AND  (cohead_orderdate >= <? value("startDate") ?>)
   <? endif ?>
   <? if exists("endDate") ?>
     AND  (cohead_orderdate <= <? value("endDate") ?>)
   <? endif ?>
   <? if exists("startDateSched") ?>
     AND  (coitem_scheddate >= <? value("startDateSched") ?>)
   <? endif ?>
   <? if exists("endDateSched") ?>
     AND  (coitem_scheddate <= <? value("endDateSched") ?>)
   <? endif ?>
   <? if exists("salesrep_id") ?>
     AND  (cohead_salesrep_id=<? value("salesrep_id") ?>)
   <? endif ?>
   <? if exists("shipto_id") ?>
     AND  (cohead_shipto_id=<? value("shipto_id") ?>)
   <? endif ?>
   <? if exists("cust_id") ?>
     AND  (cohead_cust_id=<? value("cust_id") ?>)
   <? endif ?>
   <? if exists("custtype_id") ?>
     AND  (cust_custtype_id=<? value("custtype_id") ?>)
   <? endif ?>
   <? if exists("custtype_pattern") ?>
     AND  (cust_custtype_id IN (SELECT DISTINCT custtype_id
                                FROM custtype
                                WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
   <? endif ?>
   <? if exists("custgrp") ?>
     AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                      FROM custgrpitem))
   <? endif ?>
   <? if exists("custgrp_id") ?>
     AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                      FROM custgrpitem
                      WHERE (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)))
   <? endif ?>
   <? if exists("custgrp_pattern") ?>
     AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                      FROM custgrp, custgrpitem
                      WHERE ( (custgrpitem_custgrp_id=custgrp_id)
                        AND   (custgrp_name ~ <? value("custgrp_pattern") ?>) )) )
   <? endif ?>
 
   <? if exists("item_id") ?>
     AND  (itemsite_item_id=<? value("item_id") ?>)
   <? endif ?>
   <? if exists("prodcat_id") ?>
     AND (item_prodcat_id=<? value("prodcat_id") ?>)
   <? endif ?>
   <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT DISTINCT prodcat_id
                              FROM prodcat
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
   <? endif ?>
 
   <? if exists("warehous_id") ?>
     AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   <? endif ?>
 )
 ORDER BY coitem_scheddate, cohead_number, coitem_linenumber;
 
 --------------------------------------------------------------------
 REPORT: BillingSelections
 QUERY: detail
 SELECT cobmisc_id,
        cohead_id,
        COALESCE(TEXT(cobmisc_invcnumber), '?') AS docnumber,
        cohead_number,
        cust_number,
        cust_name
-  FROM cobmisc, cohead, cust
+  FROM cobmisc, cohead, custinfo
  WHERE ((cobmisc_cohead_id=cohead_id)
    AND (cohead_cust_id=cust_id)
    AND (NOT cobmisc_posted) )
 ORDER BY docnumber;
 
 --------------------------------------------------------------------
 REPORT: Bookings
 QUERY: detail
 SELECT cohead_number AS sonumber,
        formatDate(cohead_orderdate) AS orddate,
        cust_number, cust_name,
        item_number, item_descrip1, item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
 formatPrice(currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio) AS unitprice,
 formatExtPrice(round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio)
                    * (currtobase(cohead_curr_id,coitem_price,cohead_orderdate) / coitem_price_invuomratio),2)) AS f_extprice
   FROM coitem JOIN cohead ON (cohead_id=coitem_cohead_id)
-              JOIN cust ON (cust_id=cohead_cust_id)
+              JOIN custinfo ON (cust_id=cohead_cust_id)
               JOIN itemsite ON (itemsite_id=coitem_itemsite_id)
               JOIN site() ON (warehous_id=itemsite_warehous_id)
               JOIN item ON (item_id=itemsite_item_id)
               JOIN uom ON (uom_id=coitem_qty_uom_id)
               JOIN curr_symbol ON (curr_id=cohead_curr_id)
   WHERE ( (coitem_status<>'X')
   <? if exists("cohead_id") ?>
     AND  (coitem_cohead_id=<? value("cohead_id") ?>)
   <? endif ?>
   <? if exists("openOnly") ?>
     AND  (coitem_status<>'C')
   <? endif ?>
   <? if exists("startDate") ?>
     AND  (cohead_orderdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
   <? endif ?>
 
   <? if exists("salesrep_id") ?>
     AND  (cohead_salesrep_id=<? value("salesrep_id") ?>)
   <? endif ?>
   <? if exists("shipto_id") ?>
     AND  (cohead_shipto_id=<? value("shipto_id") ?>)
   <? endif ?>
   <? if exists("cust_id") ?>
     AND  (cohead_cust_id=<? value("cust_id") ?>)
   <? endif ?>
   <? if exists("custtype_id") ?>
     AND  (cust_custtype_id=<? value("custtype_id") ?>)
   <? endif ?>
   <? if exists("custtype_pattern") ?>
     AND  (cust_custtype_id IN (SELECT DISTINCT custtype_id
                                FROM custtype
                                WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
   <? endif ?>
   <? if exists("custgrp") ?>
     AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                      FROM custgrpitem))
   <? endif ?>
   <? if exists("custgrp_id") ?>
     AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                      FROM custgrpitem
                      WHERE (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)))
   <? endif ?>
   <? if exists("custgrp_pattern") ?>
     AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                      FROM custgrp, custgrpitem
                      WHERE ( (custgrpitem_custgrp_id=custgrp_id)
                        AND   (custgrp_name ~ <? value("custgrp_pattern") ?>) )) )
   <? endif ?>
 
   <? if exists("item_id") ?>
     AND  (itemsite_item_id=<? value("item_id") ?>)
   <? endif ?>
   <? if exists("prodcat_id") ?>
     AND (item_prodcat_id=<? value("prodcat_id") ?>)
   <? endif ?>
   <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT DISTINCT prodcat_id
                              FROM prodcat
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
   <? endif ?>
 
   <? if exists("warehous_id") ?>
     AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
   <? endif ?>
 )
 ORDER BY cohead_orderdate;
       
 
 --------------------------------------------------------------------
 REPORT: BriefSalesHistory
 QUERY: head
 SELECT <? if exists("startDate") ?>
          formatDate(date(<? value("startDate") ?>))
        <? else ?>
          text('Earliest')
        <? endif ?> AS startDate,
        <? if exists("endDate") ?>
          formatDate(date(<? value("endDate") ?>))
        <? else ?>
          text('Latest')
        <? endif ?> AS endDate,
        <? if exists("showPrices") ?>
            text('Unit Price') AS lbl_unitprice,
            text('Total') AS lbl_total,
        <? else ?>
            text('') AS lbl_unitprice,
            text('') AS lbl_total,
        <? endif ?>
        <? if exists("warehous_id") ?>
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("cust_id") ?>
          (select cust_name from custinfo where cust_id=<? value("cust_id") ?>)
        <? else ?>
          text('All Customers')
        <? endif ?>
          AS cust_name,
        <? if exists("custtype_id") ?>
          (select custtype_code from custtype where custtype_id=<? value("custtype_id") ?>)
        <? else ?>
          text('All Customer Types')
        <? endif ?>
          AS custtype_code,
        <? if exists("custtype_pattern") ?>
            text(<? value("custtype_pattern") ?>)
        <? else ?>
            text('Not Applicable')
        <? endif ?>
          AS custtype_pattern,
        <? if exists("custgrp_id") ?>
          (select custgrp_name from custgrp where custgrp_id=<? value("custgrp_id") ?>)
        <? else ?>
          text('All Customer Groups')
        <? endif ?>
          AS custgrp_name,
        <? if exists("custgrp_pattern") ?>
            text(<? value("custgrp_pattern") ?>)
        <? else ?>
            text('Not Applicable')
        <? endif ?>
          AS custgrp_pattern,
       <? if exists("prodcat_id") ?>
          (select prodcat_code from prodcat where prodcat_id=<? value("prodcat_id") ?>)
        <? else ?>
          text('All Product Categories')
        <? endif ?>
          AS prodcat_code,
        <? if exists("prodcat_pattern") ?>
            text(<? value("prodcat_pattern") ?>)
        <? else ?>
            text('Not Applicable')
        <? endif ?>
          AS prodcat_pattern,
        <? if exists("item_id") ?>
          (select item_number from item where item_id=<? value("item_id") ?>)
        <? else ?>
          text('All Item Numbers')
        <? endif ?>
          AS item_number,
        <? if exists("cohead_id") ?>
          (select cohead_number from cohead where cohead_id=<? value("cohead_id") ?>)
        <? else ?>
          text('All Orders')
        <? endif ?>
          AS docnumber; 
 
 --------------------------------------------------------------------
 REPORT: BuyCard
 QUERY: head
 SELECT vend_number, vend_name,
        itemsrc_vend_item_number,
        itemsrc_vend_item_descrip
-  FROM vend, itemsrc
+  FROM vendinfo, itemsrc
  WHERE ((vend_id=<? value("vend_id") ?>)
    AND  (itemsrc_id=<? value("itemsrc_id") ?>) )
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT poitem_id, pohead_number, poitem_linenumber,
        CASE WHEN(poitem_status='C') THEN TEXT('Closed')
             WHEN(poitem_status='U') THEN TEXT('Unposted')
             WHEN(poitem_status='O' AND ((poitem_qty_received-poitem_qty_returned) > 0) AND (poitem_qty_ordered>(poitem_qty_received-poitem_qty_returned))) THEN TEXT('Partial')
             WHEN(poitem_status='O' AND ((poitem_qty_received-poitem_qty_returned) > 0) AND (poitem_qty_ordered=(poitem_qty_received-poitem_qty_returned))) THEN TEXT('Received')
             WHEN(poitem_status='O') THEN TEXT('Open')
             ELSE poitem_status
        END AS poitemstatus,
        formatDate(poitem_duedate) as f_duedate,
        formatQty(poitem_qty_ordered) as f_qtyord,
-       formatQty(COALESCE(SUM(porecv_qty), 0)) as f_qty,
+       formatQty(COALESCE(SUM(recv_qty), 0)) as f_qty,
        formatPrice(poitem_unitprice) as f_unitprice
-FROM pohead, poitem LEFT OUTER JOIN porecv ON (porecv_poitem_id=poitem_id)
+FROM pohead, poitem LEFT OUTER JOIN recv ON (recv_orderitem_id=poitem_id)
 WHERE ( (poitem_pohead_id=pohead_id)
+ AND (recv_order_type='PO')
  AND (pohead_vend_id=<? value("vend_id") ?>)
  AND (poitem_vend_item_number=(select itemsrc_vend_item_number from itemsrc where itemsrc_id=<? value("itemsrc_id") ?>)) ) 
 GROUP BY poitem_id, pohead_number, poitem_linenumber,
          poitem_status, poitem_qty_received, poitem_qty_returned,
          poitem_duedate, poitem_qty_ordered, poitem_unitprice
 ORDER BY pohead_number, poitem_linenumber;
 
 --------------------------------------------------------------------
 REPORT: CashReceipts
 QUERY: head
 SELECT <? if exists("cust_id") ?>
          (SELECT (cust_number || '-' || cust_name)
-            FROM cust
+            FROM custinfo
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
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate;
 --------------------------------------------------------------------
   
 QUERY: detail
 == MetaSQL statement cashReceipts-detail
 --------------------------------------------------------------------
   
 QUERY: foot
 SELECT formatMoney(SUM(base_applied)) AS f_base_applied_total
 FROM (
 <? if exists("LegacyDisplayMode") ?>
 -- Posted cash receipts
 SELECT  currtobase(arapply_curr_id,arapply_applied,arapply_postdate) AS base_applied
-FROM cust LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id), arapply
+FROM custinfo LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id), arapply
 WHERE ( (arapply_cust_id=cust_id)
   AND   (arapply_postdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
   AND   (arapply_source_doctype ='K')
 <? if exists("cust_id") ?>
   AND   (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
   AND   (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custgrp_id") ?>
   AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custtype_pattern") ?>
   AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
       )
 
 -- Unposted cash receipts
 UNION ALL
 SELECT currtobase(cashrcpt_curr_id,cashrcpt_amount,cashrcpt_distdate) AS base_applied
-FROM cashrcpt, cust LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id)
+FROM cashrcpt, custinfo LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id)
 WHERE ( (NOT cashrcpt_posted)
   AND   (cashrcpt_cust_id=cust_id)
   AND   (cashrcpt_distdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("cust_id") ?>
   AND   (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
   AND   (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custgrp_id") ?>
   AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custtype_pattern") ?>
   AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
       )
 
 -- Cash Advance
 UNION ALL
 SELECT aropen_amount / aropen_curr_rate AS base_applied
-FROM cust LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id), aropen
+FROM custinfo LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id), aropen
   JOIN cashrcptitem ON (aropen_id=cashrcptitem_aropen_id)
 WHERE ( (aropen_cust_id=cust_id)
   AND   (aropen_doctype IN ('R','C'))
   AND   (aropen_docdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("cust_id") ?>
   AND   (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
   AND   (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custgrp_id") ?>
   AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custtype_pattern") ?>
   AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
       )
 <? else ?>
 -- New mode
 SELECT (cashrcpt_amount / cashrcpt_curr_rate) AS base_applied
-FROM cashrcpt JOIN cust ON (cust_id=cashrcpt_cust_id) LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id)
+FROM cashrcpt JOIN custinfo ON (cust_id=cashrcpt_cust_id)
+<? if exists("custgrp_id") ?>
+ LEFT OUTER JOIN custgrpitem ON (custgrpitem_cust_id=cust_id)
+<? endif ?>
 WHERE ( (cashrcpt_distdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("cust_id") ?>
   AND   (cust_id=<? value("cust_id") ?>)
 <? elseif exists("custtype_id") ?>
   AND   (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custgrp_id") ?>
   AND   (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? elseif exists("custtype_pattern") ?>
   AND   (cust_custtype_id IN (SELECT custtype_id FROM custtype WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
       )
 <? endif ?>
 ) data
 ;
 
 
 --------------------------------------------------------------------
 REPORT: CashReceiptsEditList
 QUERY: detail
 SELECT cashrcpt_id, 1 AS orderBy,
        cust_number, cust_name,
        formatDate(cashrcpt_distdate) AS f_distdate,
        CASE WHEN (cashrcpt_fundstype = 'C') THEN <? value("check") ?>
             WHEN (cashrcpt_fundstype = 'T') THEN <? value("certifiedCheck") ?>
             WHEN (cashrcpt_fundstype = 'M') THEN <? value("masterCard") ?>
             WHEN (cashrcpt_fundstype = 'V') THEN <? value("visa") ?>
             WHEN (cashrcpt_fundstype = 'A') THEN <? value("americanExpress") ?>
             WHEN (cashrcpt_fundstype = 'D') THEN <? value("discoverCard") ?>
             WHEN (cashrcpt_fundstype = 'R') THEN <? value("otherCreditCard") ?>
             WHEN (cashrcpt_fundstype = 'K') THEN <? value("cash") ?>
             WHEN (cashrcpt_fundstype = 'W') THEN <? value("wireTransfer") ?>
             ELSE <? value("other") ?>
        END AS f_fundstype,
        'C/R' AS doctype,
        cashrcpt_docnumber AS docnumber,
        cashrcpt_amount AS amount,
        formatMoney(cashrcpt_amount) AS f_amount,
        0 AS detailedamount,
        formatMoney(0) AS f_detailedamount,
        bankaccnt_name
-FROM cashrcpt, bankaccnt, cust
+FROM cashrcpt, bankaccnt, custinfo
 WHERE ( (cashrcpt_bankaccnt_id=bankaccnt_id)
   AND   (cashrcpt_cust_id=cust_id)
   AND   (NOT cashrcpt_posted)
   AND   (NOT cashrcpt_void) )
 
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
   AND   (NOT cashrcpt_posted)
   AND   (NOT cashrcpt_void) )
 
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
   AND   (NOT cashrcpt_posted)
   AND   (NOT cashrcpt_void) )
 
 ORDER BY cashrcpt_id, orderBy;
 
 
 
 --------------------------------------------------------------------
 REPORT: CheckMultiPage
 QUERY: Head
 SELECT
 checkhead_id, checkhead_number, checkhead_for AS memo,
 formatDate(checkhead_checkdate) AS f_checkdate,
 formatMoney(checkhead_amount) AS f_amount,
 INITCAP(spellAmount(checkhead_amount, curr_id)) AS f_words,
 CASE WHEN(checkhead_void) THEN TEXT('V O I D')
      ELSE TEXT('')
 END AS f_void,
 CASE WHEN checkhead_recip_type = 'C' THEN (SELECT cust_number
                                            FROM custinfo
                                            WHERE (cust_id=checkhead_recip_id))
      WHEN checkhead_recip_type = 'T' THEN (SELECT taxauth_code
                                            FROM taxauth
                                            WHERE (taxauth_id=checkhead_recip_id))
      WHEN checkhead_recip_type = 'V' THEN (SELECT vend_number
                                            FROM vendinfo
                                            WHERE (vend_id=checkhead_recip_id))
      ELSE 'Unknown Recipient Type'
 END AS recip_number,
 formatAddr(CASE WHEN checkhead_recip_type = 'C' THEN
                                          (SELECT cntct_addr_id
                                           FROM cntct, custinfo
                                           WHERE ((cust_cntct_id=cntct_id)
                                             AND  (cust_id=checkhead_recip_id)))
                 WHEN checkhead_recip_type = 'T' THEN 
                                          (SELECT taxauth_addr_id
                                           FROM taxauth
                                           WHERE (taxauth_id=checkhead_recip_id))
                 WHEN checkhead_recip_type = 'V' THEN
                         COALESCE((SELECT vendaddr_addr_id
                                   FROM vendaddrinfo
                                   WHERE ((UPPER(vendaddr_code)='REMIT')
                                     AND  (vendaddr_vend_id=checkhead_recip_id))),
                                  (SELECT vend_addr_id
                                   FROM vendinfo
                                   WHERE (vend_id=checkhead_recip_id)))
            END) AS check_address,
 CASE WHEN checkhead_recip_type = 'C' THEN (SELECT cust_name
                                            FROM custinfo
                                            WHERE cust_id=checkhead_recip_id)
      WHEN checkhead_recip_type = 'T' THEN (SELECT taxauth_name
                                            FROM taxauth
                                            WHERE taxauth_id=checkhead_recip_id)
      WHEN checkhead_recip_type = 'V' THEN
                          COALESCE((SELECT vendaddr_name
-                                   FROM vendaddr
+                                   FROM vendaddrinfo
                                    WHERE ((UPPER(vendaddr_code)='REMIT')
                                      AND  (vendaddr_vend_id=checkhead_recip_id))),
                                   (SELECT vend_name
                                    FROM vendinfo
                                    WHERE (vend_id=checkhead_recip_id)))
 END AS recip_name, 
 curr_symbol, curr_abbr, curr_name
 FROM checkhead, curr_symbol
 WHERE ((checkhead_curr_id = curr_id)
    AND (checkhead_id=<? value("checkhead_id") ?>) );
 
 
 --------------------------------------------------------------------
 REPORT: CountSlipEditList
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        warehous_code as warehouse,
        invcnt_tagnumber
-  FROM item, itemsite, invcnt, warehous
+  FROM item, itemsite, invcnt, whsinfo
  WHERE ((itemsite_item_id=item_id)
    AND (invcnt_itemsite_id=itemsite_id)
    AND (invcnt_id=<? value("cnttag_id") ?>)
    AND (itemsite_warehous_id=warehous_id) );
 
 
 --------------------------------------------------------------------
 REPORT: CountSlipsByWarehouse
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate
 
 --------------------------------------------------------------------
   
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
-  FROM cntslip, invcnt, itemsite, item, warehous
+  FROM cntslip, invcnt, itemsite, item, whsinfo
  WHERE ((cntslip_cnttag_id=invcnt_id)
    AND (invcnt_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (cntslip_entered BETWEEN <? value("startDate") ?> AND (<? value("endDate") ?>::DATE + 1))
 <? if not exists("showUnposted") ?>
    AND (cntslip_posted)
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY slipnum;
 
 --------------------------------------------------------------------
 REPORT: CountTagEditList
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-                   FROM warehous
+                   FROM whsinfo
                    WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
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
   
 QUERY: detail
 SELECT formatBoolYN(invcnt_priority) AS f_priority,
        CASE WHEN (invcnt_tagnumber IS NULL) THEN 'Misc.'
             ELSE invcnt_tagnumber
        END AS f_tagnumber, 
        formatDate(invcnt_tagdate) AS f_tagdate,
        item_number,
        item_descrip1,
        item_descrip2,
        warehous_code,
        CASE WHEN (invcnt_location_id IS NOT NULL)
                  THEN (SELECT formatQty(SUM(itemloc_qty))
                          FROM itemloc
                         WHERE ((itemloc_itemsite_id=itemsite_id)
                           AND  (itemloc_location_id=invcnt_location_id)) )
             ELSE formatQty(itemsite_qtyonhand)
        END AS f_qoh,
        CASE WHEN (location_id IS NOT NULL)
                  THEN location_name
             ELSE 'All' END AS location_name,
        CASE WHEN (invcnt_qoh_after IS NULL) THEN ''
             ELSE formatQty(invcnt_qoh_after)
        END AS f_cntqty,
        CASE WHEN (invcnt_qoh_after IS NULL) THEN ''
             ELSE formatQty(invcnt_qoh_after - itemsite_qtyonhand)
        END AS f_variance,
        CASE WHEN (invcnt_qoh_after IS NULL) THEN ''
             WHEN ((itemsite_qtyonhand = 0) AND (invcnt_qoh_after > 0)) THEN formatPrcnt(1)
             WHEN ((itemsite_qtyonhand = 0) AND (invcnt_qoh_after < 0)) THEN formatPrcnt(-1)
             WHEN ((itemsite_qtyonhand = 0) AND (invcnt_qoh_after = 0)) THEN formatPrcnt(0)
             ELSE formatPrcnt((1 - (invcnt_qoh_after / itemsite_qtyonhand)) * -1)
        END AS f_percent,
        formatExtPrice(stdcost(item_id) * (invcnt_qoh_after - itemsite_qtyonhand)) AS f_amount
   FROM invcnt LEFT OUTER JOIN location ON (invcnt_location_id=location_id),
-       item, warehous, itemsite
+       item, whsinfo, itemsite
  WHERE ((invcnt_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (NOT invcnt_posted)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("classcode_id") ?>
    AND (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
    AND (item_classcode_id IN ( SELECT classcode_id
                                  FROM classcode
                                 WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
 <? elseif exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN ( SELECT plancode_id
                                  FROM plancode
                                 WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
 )
 ORDER BY f_priority DESC, item_number
 <? if exists("maxTags") ?>
     LIMIT <? value("maxTags") ?>
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
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse;
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT invcnt_id, invcnt_tagnumber, warehous_code,
        item_number, item_descrip1, item_descrip2,
        formatDate(invcnt_tagdate) AS createddate,
        invcnt_tag_username AS createdby,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
             ELSE formatDate(invcnt_cntdate)
        END AS entereddate,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
             ELSE invcnt_cnt_username
        END AS enteredby,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatDate(invcnt_postdate)
        END AS posteddate,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE invcnt_post_username
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
-  FROM invcnt, itemsite, item, warehous
+  FROM invcnt, itemsite, item, whsinfo
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
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);
 
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT invcnt_tagnumber, warehous_code,
        formatDate(invcnt_tagdate) AS createddate,
        invcnt_tag_username AS createdby,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
             ELSE formatDate(invcnt_cntdate)
        END AS entereddate,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
             ELSE invcnt_cnt_username
        END AS enteredby,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatDate(invcnt_postdate)
        END AS posteddate,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE invcnt_post_username
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
-  FROM invcnt, itemsite, warehous
+  FROM invcnt, itemsite, whsinfo
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
 QUERY: head
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse;
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT invcnt_id,
        formatcounttagbarcode(invcnt_id) AS countag_barcode, 
        invcnt_tagnumber, 
        warehous_code,
        item_number, item_descrip1, item_descrip2,
        formatDate(invcnt_tagdate) AS createddate,
        invcnt_tag_username AS createdby,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
             ELSE formatDate(invcnt_cntdate)
        END AS entereddate,
        CASE WHEN (invcnt_cntdate IS NULL) THEN ''
             ELSE invcnt_cnt_username
        END AS enteredby,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE formatDate(invcnt_postdate)
        END AS posteddate,
        CASE WHEN (NOT invcnt_posted) THEN ''
             ELSE invcnt_post_username
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
-  FROM invcnt, itemsite, item, warehous
+  FROM invcnt, itemsite, item, whsinfo
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
 REPORT: CreditMemo
 QUERY: GroupHead
 SELECT remitto.*,
        cmhead_number,
        formatDate(cmhead_docdate) AS docdate,
        cust_number,
        cust_name,
        formatAddr(cmhead_billtoaddress1, cmhead_billtoaddress2, cmhead_billtoaddress3,
                   COALESCE(cmhead_billtocity,'') || '  ' || COALESCE(cmhead_billtostate,'') || '  ' || COALESCE(cmhead_billtozip,''),
                    cmhead_billtocountry)
        AS f_custaddr,
-       cust_phone,
+       cntct_phone AS cust_phone,
        cmhead_shipto_name,
        formatAddr(cmhead_shipto_address1, cmhead_shipto_address2, cmhead_shipto_address3,
                   COALESCE(cmhead_shipto_city,'') ||'  '|| COALESCE(cmhead_shipto_state,'') || '  '|| COALESCE(cmhead_shipto_zipcode,''),
                   cmhead_shipto_country)
                   AS f_shiptoaddr,
        CASE 
          WHEN (cmhead_invcnumber='-1') THEN ''
          --note: must now set explicit type for Postgres 8.3+
          --add ' '
          ELSE text(cmhead_invcnumber)
        END AS invcnumber,
        cmhead_custponumber,
        cmhead_comments,
        cmhead_misc_descrip,
        curr_symbol,
        curr_name
-  FROM remitto, cmhead, cust, curr_symbol
+  FROM remitto, cmhead, curr_symbol, custinfo
+  LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
  WHERE ((cmhead_cust_id=cust_id)
        AND (cmhead_curr_id = curr_id)
        AND (cmhead_id=<? value("cmhead_id") ?>))
 ORDER BY cmhead_number;
 --------------------------------------------------------------------
   
 
 --------------------------------------------------------------------
 REPORT: CustOrderAcknowledgement
 QUERY: head
-<? if not exists("cosmisc_id") ?>
---Run query if no cosmisc_id passed - No Shipment Pack List
+<? if not exists("shiphead_id") ?>
+--Run query if no shiphead_id passed - No Shipment Pack List
 SELECT cust_number,
        formatsobarcode(cohead_id) AS order_barcode,
-       formataddr(cust_address1, cust_address2, cust_address3, (cust_city || '  ' ||  cust_state || '  ' || cust_zipcode), cust_country) AS corr_address, 
+       formataddr(addr_line1, addr_line2, addr_line3, (addr_city || '  ' ||  addr_state || '  ' || addr_postalcode), addr_country) AS corr_address,
        formataddr(cohead_billtoaddress1, cohead_billtoaddress2, cohead_billtoaddress3, (cohead_billtocity || '  ' ||   cohead_billtostate || '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address, 
 
   formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3, (cohead_shiptocity || '  ' ||   cohead_shiptostate || '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,           
 
-       cust_contact,
+       trim(cntct_first_name || ' ' || cntct_last_name) AS cust_contact,
        cohead_fob,
        cohead_billtoname,
        cohead_billtoaddress1,
        cohead_billtoaddress2,
        cohead_billtoaddress3,
        (cohead_billtocity || '  ' || cohead_billtostate || '  ' || cohead_billtozipcode) AS billtocitystatezip,
-       cust_phone,
+       cntct_phone AS cust_phone,
        cohead_shiptoname,
        cohead_shiptoaddress1,
        cohead_shiptoaddress2,
        cohead_shiptoaddress3,
        (cohead_shiptocity || '  ' || cohead_shiptostate || ' ' || cohead_shiptozipcode) AS shiptocitystatezip,
        cohead_number,
        cohead_shipvia,
        cohead_shiptophone,
        cohead_custponumber,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_shipcomments, 
        terms_descrip
-  FROM cohead, cust, terms 
- WHERE ((cohead_cust_id=cust_id)
-   AND (cohead_terms_id=terms_id)
-   AND (cohead_id=<? value("sohead_id") ?>)
-);
+  FROM cohead JOIN custinfo ON (cohead_cust_id=cust_id)
+  JOIN terms ON (cohead_terms_id=terms_id)
+  LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+  LEFT OUTER JOIN addr ON (cntct_addr_id=addr_id)
+ WHERE (cohead_id=<? value("sohead_id") ?>);
 
 -------------------
 <? else ?>
 --Run New Query for Header with shipment number
 -----------------------------------------------
 
-SELECT cosmisc_number,
+SELECT shiphead_number,
 
        cohead_number,
        formatsobarcode(cohead_id) AS order_barcode,
        cohead_shipvia,
        cohead_shiptophone,
        cohead_custponumber,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_shipcomments,   
        cohead_billtoname,
        formataddr(cohead_billtoaddress1, cohead_billtoaddress2, cohead_billtoaddress3,
                   (cohead_billtocity || '  ' ||   cohead_billtostate || '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address,
        cohead_shiptoname,
        formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3,
                   (cohead_shiptocity || '  ' ||   cohead_shiptostate || '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,           
 
        cust_number,
-       cust_contact,
-       cust_phone,
+       trim(cntct_first_name || ' ' || cntct_last_name) AS cust_contact,
+       cntct_phone AS cust_phone,
        cohead_shipchrg_id,
        shipchrg_descrip,
 
        terms_descrip
-  FROM cosmisc, cohead, cust, terms, shipchrg
- WHERE ((cohead_cust_id=cust_id)
-   AND (cohead_terms_id=terms_id)
-   AND (cohead_id=cosmisc_cohead_id)
-   AND (cohead_shipchrg_id = shipchrg_id)
-   AND (cosmisc_id=<? value("cosmisc_id") ?>)
-);
+  FROM shiphead
+  JOIN cohead ON (cohead_id=shiphead_order_id)
+  JOIN custinfo ON (cohead_cust_id=cust_id)
+  JOIN terms ON (cohead_terms_id=terms_id)
+  JOIN shipchrg ON (cohead_shipchrg_id = shipchrg_id)
+  LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+  LEFT OUTER JOIN addr ON (cntct_addr_id=addr_id)
+ WHERE (shiphead_id=<? value("shiphead_id") ?>);
 
 <? endif ?>
 --------------------------------------------------------------------
   
 QUERY: scheddate
-<? if not exists("cosmisc_id") ?>
+<? if not exists("shiphead_id") ?>
 --Query without shipment number
 
 SELECT formatDate(MIN(coitem_scheddate)) AS scheddate
   FROM coitem
  WHERE ((coitem_status <> 'X') AND (coitem_cohead_id=<? value("sohead_id") ?>));
 
 --
 <? else ?>
 --------------------------
 
 
 SELECT formatDate(MIN(coitem_scheddate)) AS scheddate
-  FROM coitem, coship
+  FROM coitem, shipitem
  WHERE ((coitem_status <> 'X')
-   AND  (coitem_id=coship_coitem_id)
-   AND  (coship_cosmisc_id=<? value("cosmisc_id") ?>));
+   AND  (coitem_id=shipitem_orderitem_id)
+   AND  (shipitem_shiphead_id=<? value("shiphead_id") ?>));
 
 <? endif ?>
 --------------------------------------------------------------------
   
 QUERY: detail
 == MetaSQL statement salesOrderItems-list
 --------------------------------------------------------------------
   
 QUERY: logo
 SELECT image_data 
 FROM image 
 WHERE ((image_name='logo'));
 
 --------------------------------------------------------------------
 REPORT: CustomerARHistory
 QUERY: head
 SELECT cust_name,
        formatDate(date(<? value("startDate") ?>)) AS startDate,
        formatDate(date(<? value("endDate") ?>)) AS endDate
-  FROM cust
+  FROM custinfo
  WHERE (cust_id=<? value("cust_id") ?>);
     
 --------------------------------------------------------------------
   
 QUERY: detail
 == MetaSQL statement arHistory-detail
 
 --------------------------------------------------------------------
 REPORT: 
 QUERY: head
-SELECT cosmisc_shipvia, formatDate(cosmisc_shipdate) AS shipdate,
-                cust_name, cust_address1, cust_address2,
-                (cust_city || '  ' || cust_state || '  ' || cust_zipcode) AS custcitystatezip,
+SELECT shiphead_shipvia, formatDate(shiphead_shipdate) AS shipdate,
+                cust_name, ca.addr_line1 AS cust_address1, ca.addr_line2 AS cust_address2,
+                (ca.addr_city || '  ' || ca.addr_state || '  ' || ca.addr_postalcode) AS custcitystatezip,
                 cust_number, cohead_number, cohead_fob, cohead_custponumber,
-                warehous_descrip, warehous_addr1, warehous_addr2, warehous_addr3, warehous_addr4, warehous_fob,
+                warehous_descrip, wa.addr_line1 AS warehous_addr1, wa.addr_line2 AS warehous_addr2, wa.addr_line3 AS warehous_addr3, wa.addr_city AS warehous_addr4, warehous_fob,
                 cohead_shiptoname, cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3,
                 (cohead_shiptocity || ' ' || cohead_shiptostate || ' ' || cohead_shiptozipcode) AS shiptocitystatezip,
                 cohead_shiptophone
-         FROM cosmisc, cohead, warehous, cust
-         WHERE ((cosmisc_cohead_id=cohead_id)
+         FROM shiphead, cohead, whsinfo, custinfo
+         LEFT OUTER JOIN addr ca ON (cntct_addr_id=ca.addr_id)
+         LEFT OUTER JOIN addr wa ON (warehous_addr_id=wa.addr_id);
+         WHERE ((shiphead_order_id=cohead_id)
           AND (cohead_cust_id=cust_id)
           AND (cohead_warehous_id=warehous_id)
-          AND (cosmisc_id=%1));
+          AND (shiphead_id=%1));
 --------------------------------------------------------------------
   
 QUERY: detail
-SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, uom_name, roundUp(SUM(coship_qty) / itemuomratiobytype(item_id, 'Selling'))::integer AS shipqty,
+SELECT coitem_linenumber, formatQty(SUM(shipitem_qty)) AS invqty, uom_name, roundUp(SUM(shipitem_qty) / itemuomratiobytype(item_id, 'Selling'))::integer AS shipqty,
                 itemsellinguom(item_id) AS shipuom, item_number, item_descrip1, item_descrip2,
-                formatQty(SUM(coship_qty) * item_prodweight) AS netweight,
-                formatQty(SUM(coship_qty) * (item_prodweight + item_packweight)) AS grossweight
-         FROM coship, coitem, itemsite, item, uom
-         WHERE ((coship_coitem_id=coitem_id)
+                formatQty(SUM(shipitem_qty) * item_prodweight) AS netweight,
+                formatQty(SUM(shipitem_qty) * (item_prodweight + item_packweight)) AS grossweight
+         FROM shipitem, coitem, itemsite, item, uom
+         WHERE ((shipitem_orderitem_id=coitem_id)
           AND (coitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
-          AND (coship_cosmisc_id=%1))
+          AND (shipitem_shiphead_id=%1))
          GROUP BY coitem_linenumber, item_number, uom_name, shipuom
                   item_descrip1, item_descrip2, item_prodweight, item_packweight
          ORDER BY coitem_linenumber;
     
 --------------------------------------------------------------------
   
 QUERY: foot
-SELECT formatQty(SUM(coship_qty * item_prodweight)) AS netweight,
-                formatQty(SUM(coship_qty * (item_prodweight + item_packweight))) AS grossweight,
+SELECT formatQty(SUM(shipitem_qty * item_prodweight)) AS netweight,
+                formatQty(SUM(shipitem_qty * (item_prodweight + item_packweight))) AS grossweight,
                 CASE
                  WHEN ('%3' = 'C') THEN 'X'
                  ELSE ' '
                 END AS collectflag,
                 CASE
                  WHEN ('%3' = 'C') THEN 'Therm-O-Rock East, Inc.'
                  ELSE ' '
                 END AS section7,
                 CASE
                  WHEN ('%3' = 'C') THEN cust_name
                  ELSE ' '
                 END AS collect_name,
                 CASE
-                 WHEN ('%3' = 'C') THEN cust_address1
+                 WHEN ('%3' = 'C') THEN addr_line1
                  ELSE ' '
                 END AS collect_address1,
                 CASE
-                 WHEN ('%3' = 'C') THEN cust_address2
+                 WHEN ('%3' = 'C') THEN addr_line2
                  ELSE ' '
                 END AS collect_address2,
                 CASE
-                 WHEN ('%3' = 'C') THEN (cust_city || '  ' || cust_state || '  ' || cust_zipcode)
+                 WHEN ('%3' = 'C') THEN (addr_city || '  ' || addr_state || '  ' || addr_postalcode)
                  ELSE ' '
                 END AS collect_address3
-         FROM coship, cohead, cust, coitem, itemsite, item
-         WHERE ((coship_coitem_id=coitem_id)
+         FROM shipitem, cohead, custinfo, coitem, itemsite, item
+         LEFT OUTER JOIN addr ON (cntct_addr_id=addr_id)
+         WHERE ((shipitem_orderitem_id=coitem_id)
           AND (coitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (coitem_cohead_id=cohead_id)
           AND (cohead_cust_id=cust_id)
-          AND (coship_cosmisc_id=%1))
-         GROUP BY cust_name, cust_address1, cust_address2, cust_city, cust_state, cust_zipcode;
+          AND (shipitem_shiphead_id=%1))
+         GROUP BY cust_name, addr_line1, addr_line2, addr_city, addr_state, addr_postalcode;
 --------------------------------------------------------------------
   
 QUERY: notes
-SELECT cosmisc_notes
-         FROM cosmisc
-         WHERE (cosmisc_id=%1);
+SELECT shiphead_notes
+         FROM shiphead
+         WHERE (shiphead_id=%1);
 
 --------------------------------------------------------------------
 REPORT: CustomerInformation
 QUERY: head
 SELECT cust_name, cust_number,
-       cust_address1, cust_address2, cust_address3,
-       cust_city, cust_state, cust_zipcode,
-       (cust_city || ', ' || cust_state || ' ' || cust_zipcode) AS citystatezip,
-       cust_contact, cust_phone, cust_fax, cust_email,
-       cust_corraddress1, cust_corraddress2, cust_corraddress3,
-       cust_corrcity, cust_corrstate, cust_corrzipcode,
-       (cust_corrcity || ', ' || cust_corrstate || ' ' || cust_corrzipcode) AS corrcitystatezip,
-       cust_corrcontact, cust_corrphone, cust_corrfax, cust_corremail,
+       ba.addr_line1 AS cust_address1, ba.addr_line2 AS cust_address2, ba.addr_line3 AS cust_address3,
+       ba.addr_city AS cust_city, ba.addr_state AS cust_state, ba.addr_postalcode AS cust_zipcode,
+       (ba.addr_city || ', ' || ba.addr_state || ' ' || ba.addr_postalcode) AS citystatezip,
+       trim(bc.cntct_first_name || ' ' || bc.cntct_last_name) AS cust_contact, bc.cntct_phone AS cust_phone, bc.cntct_fax AS cust_fax, bc.cntct_email AS cust_email,
+       ca.addr_line1 AS cust_corraddress1, ca.addr_line2 AS cust_corraddress2, ca.addr_line3 AS cust_corraddress3,
+       ca.addr_city AS cust_corrcity, ca.addr_state AS cust_corrstate, ca.addr_postalcode AS cust_corrzipcode,
+       (ca.addr_city || ', ' || ca.addr_state || ' ' || ca.addr_postalcode) AS corrcitystatezip,
+       trim(cc.cntct_first_name || ' ' || cc.cntct_last_name) AS cust_corrcontact, cc.cntct_phone AS cust_corrphone,
+       cc.cntct_fax AS cust_corrfax, cc.cntct_email AS cust_corremail,
        CASE WHEN (cust_creditstatus='G') THEN 'In Good Standing'
             WHEN (cust_creditstatus='W') THEN 'On Credit Warning'
             WHEN (cust_creditstatus='H') THEN 'On Credit Hold'
             ELSE ('Unknown Status: ' || cust_creditstatus)
        END AS f_creditstatus,
        cust_comments
-  FROM cust
+ FROM custinfo
+ LEFT OUTER JOIN cntct cc ON (cust_corrcntct_id=cc.cntct_id)
+ LEFT OUTER JOIN addr ca ON (cc.cntct_addr_id=ca.addr_id)
+ LEFT OUTER JOIN cntct bc ON (cust_cntct_id=bc.cntct_id)
+ LEFT OUTER JOIN addr ba ON (bc.cntct_addr_id=ba.addr_id)
  WHERE (cust_id=<? value("cust_id") ?>);
 
 --------------------------------------------------------------------
 REPORT: DeliveryDateVariancesByItem
 QUERY: head
 SELECT item_number, item_descrip1,
        item_descrip2, uom_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
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
   
 QUERY: detail
-SELECT porecv_ponumber, vend_name,
-       formatDate(COALESCE(porecv_released, porecv_orderdate)) AS orderdate,
-       DATE(porecv_rlsd_duedate) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS req_leadtime, 
-       DATE(porecv_duedate) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS agrd_leadtime, 		       DATE(porecv_date) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS real_leadtime, 
-       DATE(porecv_date) - DATE(porecv_rlsd_duedate) AS req_diff, 
-       DATE(porecv_date) - DATE(porecv_duedate) AS argd_diff, 
-       formatDate(porecv_date) AS receivedate,
-       porecv_date,			  
-       firstLine(porecv_vend_item_number) AS  venditemnumber,
-       firstLine(porecv_vend_item_descrip) AS venditemdescrip, formatQty(porecv_qty) as f_qty,
-       porecv_qty, formatDate(porecv_rlsd_duedate) AS release_duedate,   
-       formatDate(porecv_duedate) AS argd_duedate
-  FROM porecv, vend, itemsite 
- WHERE ( (porecv_vend_id=vend_id)
-   AND (porecv_itemsite_id=itemsite_id)
-   AND (itemsite_item_id=<? value("item_id") ?>)
-   AND (date(porecv_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
-   AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if exists("agentUsername") ?>
-   AND (porecv_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
- )
-ORDER BY porecv_date DESC;
+== MetaSQL statement poDeliveryDateVariances-detail
 
 --------------------------------------------------------------------
 REPORT: DeliveryDateVariancesByVendor
 QUERY: head
 SELECT vend_name,
        vend_number,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS purchagent
-  FROM vend
+  FROM vendinfo
  WHERE (vend_id=<? value("vend_id") ?>);
 --------------------------------------------------------------------
   
 QUERY: detail
-SELECT porecv_ponumber, vend_name,
-       formatDate(COALESCE(porecv_released, porecv_orderdate)) AS orderdate,
-       DATE(porecv_rlsd_duedate) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS req_leadtime, 
-       DATE(porecv_duedate) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS agrd_leadtime, 		       
-       DATE(porecv_date) - DATE(COALESCE(porecv_released, porecv_orderdate)) AS real_leadtime, 
-       DATE(porecv_date) - DATE(porecv_rlsd_duedate) AS req_diff, 
-       DATE(porecv_date) - DATE(porecv_duedate) AS argd_diff, 
-       firstLine(porecv_item_number) AS  itemnumber,
-       formatDate(porecv_date) AS receivedate,
-       porecv_date,			  
-       firstLine(porecv_vend_item_number) AS  venditemnumber,
-       firstLine(porecv_vend_item_descrip) AS venditemdescrip, formatQty(porecv_qty) as f_qty,
-       porecv_qty, formatDate(porecv_rlsd_duedate) AS release_duedate,   
-       formatDate(porecv_duedate) AS argd_duedate
-  FROM porecv, vend, itemsite 
- WHERE ( (porecv_vend_id=vend_id)
-   AND (porecv_itemsite_id=itemsite_id)
-   AND (vend_id=<? value("vend_id") ?>)
-   AND (date(porecv_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? if exists("warehous_id") ?>
-   AND (porecv_itemsite_id in (SELECT itemsite_id FROM itemsite WHERE (itemsite_warehous_id=<? value("warehous_id") ?>)))
-<? endif ?>
-<? if exists("agentUsername") ?>
-   AND (porecv_agent_username=<? value("agentUsername") ?>)
-<? endif ?>
- )
-ORDER BY porecv_date DESC, itemnumber ASC, venditemnumber ASC;
+== MetaSQL statement poDeliveryDateVariances-detail
 
 --------------------------------------------------------------------
 REPORT: DetailedInventoryHistoryByLocation
 QUERY: head
 SELECT formatLocationName(location_id) AS locationname,
        firstLine(location_descrip) as f_descrip,
        formatBoolYN(location_netable) AS f_netable,
        formatBoolYN(location_restrict) AS f_restrict,
        warehous_code AS warehouse,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate
-  FROM location, warehous
+  FROM location, whsinfo
  WHERE ((location_id=<? value("location_id") ?>)
    AND (location_warehous_id=warehous_id) );
 
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT invhist_id,
        formatDateTime(invhist_transdate) AS transdate,
        invhist_transtype,
        (invhist_ordtype || '-' || invhist_ordnumber) AS ordernumber,
        invhist_invuom,
        item_number,
        item_descrip1,
        item_descrip2,
        formatlotserialnumber(invdetail_ls_id) AS invdetail_lotserial,
        formatQty(invdetail_qty) AS transqty,
        formatQty(invdetail_qty_before) AS qohbefore,
        formatQty(invdetail_qty_after) AS qohafter,
        invhist_user AS username,
-       (select warehous_code from warehous where warehous_id=itemsite_warehous_id) as warehous_code
+       (select warehous_code from whsinfo where warehous_id=itemsite_warehous_id) as warehous_code
   FROM invdetail, invhist, itemsite, item
  WHERE ((invdetail_invhist_id=invhist_id)
    AND (invhist_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (invdetail_location_id=<? value("location_id") ?>)
    AND (date(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
    AND (transType(invhist_transtype, <? value("transType") ?>))
 )
 ORDER BY invhist_transdate DESC, invhist_transtype;
 
 --------------------------------------------------------------------
 REPORT: ExpiredInventoryByClassCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (SELECT warehous_code
-            FROM warehous
+            FROM whsinfo
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
-           <? if exists("useActualCost") ?>
+           <? if exists("useActualCosts") ?>
              text('Show Inventory Value with Actual Costs')
-           <? elseif exists("useStandardCost") ?>
+           <? elseif exists("useStandardCosts") ?>
              text('Show Inventory Value with Standard Costs')
            <? else ?>
              text('Show Inventory Value with Posted Costs')
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
-                <? if exists("useActualCost") ?>
+                <? if exists("useActualCosts") ?>
                   actcost(itemsite_item_id)
-                <? elseif exists("useStandardCost") ?>
+                <? elseif exists("useStandardCosts") ?>
                   stdcost(itemsite_item_id)
                 <? else ?>
                   (itemsite_value / CASE WHEN(itemsite_qtyonhand=0) THEN 1 ELSE itemsite_qtyonhand END)
                 <? endif ?>
                 AS cost
-           FROM itemloc, itemsite, item, warehous, uom, ls
+           FROM itemloc, itemsite, item, whsinfo, uom, ls
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
 REPORT: FreightPricesByCustomer
 QUERY: head
 SELECT cust_name,
-       cust_address1,
-       cust_address2,
-       cust_address3,
+       addr_line1 AS cust_address1,
+       addr_line2 AS cust_address2,
+       addr_line3 AS cust_address3,
        <? if exists("showExpired") ?>
          text('Yes')
        <? else ?>
          text('No')
        <? endif ?>
        AS f_showexpired,
        <? if exists("showFuture") ?>
          text('Yes')
        <? else ?>
          text('No')
        <? endif ?>
        AS f_showfuture
-   FROM cust
+   FROM custinfo
+   LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+   LEFT OUTER JOIN addr ON (cntct_addr_id=addr_id)
 WHERE (cust_id=<? value("cust_id") ?>);
 
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT itemid, sourcetype, ipshead_name, source,
        formatQty(ipsfreight_qtybreak) AS f_qtybreak,
        formatSalesPrice(ipsfreight_price) AS f_price,
        CASE WHEN (ipsfreight_type = 'F') THEN 'Flat Rate'
             ELSE 'Per UOM'
        END AS method,
        currConcat(ipshead_curr_id) AS currConcat,
        CASE WHEN (warehous_code IS NULL) THEN 'Any' ELSE warehous_code END AS f_warehous,
        CASE WHEN (shipzone_name IS NULL) THEN 'Any' ELSE shipzone_name END AS f_shipzone,
        CASE WHEN (freightclass_code IS NULL) THEN 'Any' ELSE freightclass_code END AS f_freightclass,
        CASE WHEN (ipsfreight_shipvia IS NULL) THEN 'Any' ELSE ipsfreight_shipvia END AS f_shipvia
 
 FROM ( SELECT ipsfreight_id AS itemid, 1 AS sourcetype,
               ipshead_name, 'Customer' AS source,
               ipsfreight_qtybreak, ipsfreight_price,
               ipsfreight_type, ipshead_curr_id,
               warehous_code, shipzone_name, freightclass_code, ipsfreight_shipvia
 FROM ipsass JOIN ipshead ON (ipshead_id=ipsass_ipshead_id)
             JOIN ipsfreight ON (ipsfreight_ipshead_id=ipshead_id)
             LEFT OUTER JOIN whsinfo ON (warehous_id=ipsfreight_warehous_id)
             LEFT OUTER JOIN shipzone ON (shipzone_id=ipsfreight_shipzone_id)
             LEFT OUTER JOIN freightclass ON (freightclass_id=ipsfreight_freightclass_id)
 WHERE ( (ipsass_cust_id=<? value("cust_id") ?>)
  AND (COALESCE(LENGTH(ipsass_shipto_pattern), 0) = 0)
 
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
 
 )
 UNION SELECT ipsfreight_id AS itemid, 2 AS sourcetype,
              ipshead_name, 'CustType' AS source,
              ipsfreight_qtybreak, ipsfreight_price,
              ipsfreight_type, ipshead_curr_id,
              warehous_code, shipzone_name, freightclass_code, ipsfreight_shipvia
 FROM ipsass JOIN ipshead ON (ipshead_id=ipsass_ipshead_id)
             JOIN ipsfreight ON (ipsfreight_ipshead_id=ipshead_id)
-            JOIN cust ON (cust_custtype_id=ipsass_custtype_id)
+            JOIN custinfo ON (cust_custtype_id=ipsass_custtype_id)
             LEFT OUTER JOIN whsinfo ON (warehous_id=ipsfreight_warehous_id)
             LEFT OUTER JOIN shipzone ON (shipzone_id=ipsfreight_shipzone_id)
             LEFT OUTER JOIN freightclass ON (freightclass_id=ipsfreight_freightclass_id)
 WHERE ( (cust_id=<? value("cust_id") ?>)
                   
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
 
 )
 UNION SELECT ipsfreight_id AS itemid, 3 AS sourcetype,
              ipshead_name, 'CustTypePattern' AS source,
              ipsfreight_qtybreak, ipsfreight_price,
              ipsfreight_type, ipshead_curr_id,
              warehous_code, shipzone_name, freightclass_code, ipsfreight_shipvia
-FROM cust   JOIN custtype ON (custtype_id=cust_custtype_id)
+FROM custinfo   JOIN custtype ON (custtype_id=cust_custtype_id)
             JOIN ipsass ON ((coalesce(length(ipsass_custtype_pattern), 0) > 0) AND
                             (custtype_code ~ ipsass_custtype_pattern))
             JOIN ipshead ON (ipshead_id=ipsass_ipshead_id)
             JOIN ipsfreight ON (ipsfreight_ipshead_id=ipshead_id)
             LEFT OUTER JOIN whsinfo ON (warehous_id=ipsfreight_warehous_id)
             LEFT OUTER JOIN shipzone ON (shipzone_id=ipsfreight_shipzone_id)
             LEFT OUTER JOIN freightclass ON (freightclass_id=ipsfreight_freightclass_id)
 WHERE ( (cust_id=<? value("cust_id") ?>)
                   
 <? if not exists("showExpired") ?>
      AND (ipshead_expires > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (ipshead_effective <= CURRENT_DATE)
 <? endif ?>
 
 )
 UNION SELECT ipsfreight_id AS itemid, 4 AS sourcetype,
              ipshead_name, ('Sale' || '-' || sale_name) AS source,
              ipsfreight_qtybreak, ipsfreight_price,
              ipsfreight_type, ipshead_curr_id,
              warehous_code, shipzone_name, freightclass_code, ipsfreight_shipvia
 FROM sale JOIN ipshead ON (ipshead_id=sale_ipshead_id)
           JOIN ipsfreight ON (ipsfreight_ipshead_id=ipshead_id)
           LEFT OUTER JOIN whsinfo ON (warehous_id=ipsfreight_warehous_id)
           LEFT OUTER JOIN shipzone ON (shipzone_id=ipsfreight_shipzone_id)
           LEFT OUTER JOIN freightclass ON (freightclass_id=ipsfreight_freightclass_id)
 WHERE ((TRUE)
                   
 <? if not exists("showExpired") ?>
      AND (sale_enddate > CURRENT_DATE)
 <? endif ?>
 <? if not exists("showFuture") ?>
      AND (sale_startdate <= CURRENT_DATE)
 <? endif ?>
 
 ) ) AS data
 ORDER BY ipsfreight_qtybreak, ipsfreight_price;
 
 --------------------------------------------------------------------
 REPORT: FrozenItemSites
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
         ( SELECT warehous_code
-            FROM warehous
+            FROM whsinfo
            WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse;
 
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT warehous_code,
        formatBoolYN(itemsite_active) AS active,
        item_number,
        item_descrip1,
        item_descrip2,
        formatBoolYN(itemsite_wosupply) AS supplied,
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
-FROM itemsite, warehous, item
+FROM itemsite, whsinfo, item
 WHERE ((itemsite_item_id=item_id)
  AND (itemsite_warehous_id=warehous_id)
  AND (itemsite_freeze)
 <? if exists("warehous_id") ?>
  AND (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY item_number;
 
 --------------------------------------------------------------------
 REPORT: InventoryAvailability
 QUERY: detail
 SELECT item_number, item_descrip1, item_descrip2,
        warehous_code, itemsite_leadtime,
        formatQty(qtyonhand) AS f_qtyonhand,
        formatQty(noNeg(qtyonhand - allocated)) AS f_unallocated,
        formatQty(noNeg(allocated)) AS f_allocated,
        formatQty(ordered) AS f_ordered,
        formatQty(requests) AS f_requests,
        formatQty(reorderlevel) AS f_reorderlevel,
        (qtyonhand - allocated + ordered) AS available,
        formatQty(qtyonhand - allocated + ordered) AS f_available
   FROM (SELECT 
            <? if reExists("[vV]end") ?>
              DISTINCT
            <? endif ?>
              itemsite_id,
              CASE WHEN (item_type IN ('P', 'O')) THEN 1
                   WHEN (item_type IN ('M')) THEN 2
                   ELSE 0
              END AS altId,
              item_number, item_descrip1, item_descrip2, item_inv_uom_id,
              warehous_id, warehous_code, itemsite_leadtime,
              itemsite_qtyonhand AS qtyonhand,
              CASE WHEN itemsite_useparams THEN itemsite_reorderlevel
                   ELSE 0.0
              END AS reorderlevel,
              CASE WHEN itemsite_useparams THEN itemsite_ordertoqty
                   ELSE 0.0
              END AS outlevel,
              <? if exists("byVend") ?>
                vend_number,
              <? else ?>
                NULL AS vend_number,
              <? endif ?>
              <? if exists("byLeadTime") ?>
                qtyAllocated(itemsite_id, itemsite_leadtime) AS allocated,
                qtyOrdered(itemsite_id,   itemsite_leadtime) AS ordered, 
                qtypr(itemsite_id,   itemsite_leadtime) AS requests
              <? elseif exists("byDays") ?>
                qtyAllocated(itemsite_id, CAST(<? value("byDays") ?> AS INTEGER)) AS allocated,
                qtyOrdered(itemsite_id,   CAST(<? value("byDays") ?> AS INTEGER)) AS ordered,
                qtypr(itemsite_id,   CAST(<? value("byDays") ?> AS INTEGER)) AS requests  
              <? elseif exists("byDate") ?>
                qtyAllocated(itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) AS allocated,
                qtyOrdered(itemsite_id,   (<? value("byDate") ?> - CURRENT_DATE)) AS ordered,
                qtypr(itemsite_id,   (<? value("byDate") ?> - CURRENT_DATE)) AS requests 
              <? elseif exists("byDates") ?>
                qtyAllocated(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>) AS allocated,
                qtyOrdered(itemsite_id,   <? value("startDate") ?>, <? value("endDate") ?>) AS ordered,
                qtypr(itemsite_id,   <? value("startDate") ?>, <? value("endDate") ?>) AS requests
              <? endif ?>
-      FROM item, itemsite, warehous 
+      FROM item, itemsite, whsinfo
            <? if reExists("[vV]end") ?>
-             , vend JOIN itemsrc ON (itemsrc_vend_id=vend_id)
+             , vendinfo JOIN itemsrc ON (itemsrc_vend_id=vend_id)
            <? endif ?>
       WHERE ( (itemsite_active)
           AND (itemsite_item_id=item_id)
           AND (itemsite_warehous_id=warehous_id)
           <? if exists("warehous_id") ?>
             AND (warehous_id=<? value("warehous_id") ?>)
           <? endif ?>
           <? if exists("item_id") ?>
             AND (item_id=<? value("item_id") ?>)
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
           <? elseif exists("itemgrp_id") ?>
             AND (item_id IN (SELECT itemgrpitem_item_id
                              FROM itemgrpitem
                              WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
           <? elseif exists("itemgrp_pattern") ?>
             AND (item_id IN (SELECT itemgrpitem_item_id
                              FROM itemgrpitem, itemgrp
                              WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                                     AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
           <? elseif exists("itemgrp") ?>
             AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
           <? endif ?>
           <? if reExists("[vV]end") ?>
             AND (itemsrc_item_id=item_id)
           <? endif ?>
           <? if exists("vend_id") ?>
             AND (vend_id=<? value("vend_id") ?>)
           <? elseif exists("vendtype_id") ?>
             AND (vend_vendtype_id=<? value("vendtype_id") ?>)
           <? elseif exists("vendtype_pattern") ?>
             AND (vend_vendtype_id IN (SELECT vendtype_id
                                       FROM vendtype
                                       WHERE (vendtype_code ~ <? value("vendtype_pattern") ?>)))
           <? endif ?>
       ) ) AS data
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
 REPORT: InventoryAvailabilityByCustomerType
 QUERY: head
 SELECT 
        <? if exists("onlyShowShortages") ?>
          text('Only Showing Shortages')
        <? else ?>
          text('')
        <? endif ?>
        AS f_onlyShowShortages,
       <? if exists("showWoSupply") ?>
          text('Show W/O Supply')
        <? else ?>
          text('')
        <? endif ?>
        AS f_showWoSupply,
 <? if exists("custtype_id") ?>
-       SELECT custtype_code from custtype where (cust_custtype_id=<? value("custtype_id") ?>)
+       (SELECT custtype_code from custtype where (custtype_id=<? value("custtype_id") ?>))
 <? elseif exists("custtype_pattern") ?>
        <? value("custtype_pattern") ?>
 <? else ?>
        text('All Customer Types')
 <? endif ?>
        AS f_custtype;
 --------------------------------------------------------------------
   
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
                      coitem_qtyreserved,
                      CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel 
 <? if exists(showWoSupply) ?>,  
                      COALESCE(wo_id,-1) AS wo_id,
                      formatwonumber(wo_id) AS wo_number,
                      noNeg((wo_qtyord-wo_qtyrcv)) AS wo_ordered,
                      wo_status, wo_startdate, wo_duedate,
                      ((wo_startdate <= CURRENT_DATE) AND (wo_status IN ('O','E','S','R'))) AS wo_latestart,
                      (wo_duedate<=CURRENT_DATE) AS wo_latedue  
 <? endif ?> 
-                FROM cohead, itemsite, item, uom, cust, coitem
+                FROM cohead, itemsite, item, uom, custinfo, coitem
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
                   AND (cust_custtype_id=<? value("custtype_id") ?>)
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
 REPORT: InventoryAvailabilityBySalesOrder
 QUERY: head
 SELECT cohead_number,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_custponumber,
        cust_name,
-       cust_phone,
+       cntct_phone AS cust_phone,
        <? if exists("onlyShowShortages") ?>
          text('Only Showing Shortages')
        <? else ?>
          text('')
        <? endif ?>
        AS f_onlyShowShortages,
       <? if exists("showWoSupply") ?>
          text('Show W/O Supply')
        <? else ?>
          text('')
        <? endif ?>
        AS f_showWoSupply
-  FROM cohead, cust
+  FROM cohead, custinfo
+  LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+  LEFT OUTER JOIN addr ON (cntct_addr_id=addr_id)
  WHERE ((cohead_cust_id=cust_id)
    AND (cohead_id=<? value("sohead_id") ?>) );
 
 --------------------------------------------------------------------
 REPORT: InventoryAvailabilityBySourceVendor
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
   FROM (SELECT 
            <? if reExists("[vV]end") ?>
              DISTINCT
            <? endif ?>
              itemsite_id,
              CASE WHEN (item_type IN ('P', 'O')) THEN 1
                   WHEN (item_type IN ('M')) THEN 2
                   ELSE 0
              END AS altId,
              item_number, item_descrip1, item_descrip2, item_inv_uom_id,
              warehous_id, warehous_code, itemsite_leadtime,
              itemsite_qtyonhand AS qtyonhand,
              CASE WHEN itemsite_useparams THEN itemsite_reorderlevel
                   ELSE 0.0
              END AS reorderlevel,
              CASE WHEN itemsite_useparams THEN itemsite_ordertoqty
                   ELSE 0.0
              END AS outlevel,
              <? if exists("byVend") ?>
                vend_number,
              <? else ?>
                NULL AS vend_number,
              <? endif ?>
              <? if exists("byLeadTime") ?>
                qtyAllocated(itemsite_id, itemsite_leadtime) AS allocated,
                qtyOrdered(itemsite_id,   itemsite_leadtime) AS ordered, 
                qtypr(itemsite_id,   itemsite_leadtime) AS requests
              <? elseif exists("byDays") ?>
                qtyAllocated(itemsite_id, CAST(<? value("byDays") ?> AS INTEGER)) AS allocated,
                qtyOrdered(itemsite_id,   CAST(<? value("byDays") ?> AS INTEGER)) AS ordered,
                qtypr(itemsite_id,   CAST(<? value("byDays") ?> AS INTEGER)) AS requests  
              <? elseif exists("byDate") ?>
                qtyAllocated(itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) AS allocated,
                qtyOrdered(itemsite_id,   (<? value("byDate") ?> - CURRENT_DATE)) AS ordered,
                qtypr(itemsite_id,   (<? value("byDate") ?> - CURRENT_DATE)) AS requests 
              <? elseif exists("byDates") ?>
                qtyAllocated(itemsite_id, <? value("startDate") ?>, <? value("endDate") ?>) AS allocated,
                qtyOrdered(itemsite_id,   <? value("startDate") ?>, <? value("endDate") ?>) AS ordered,
                qtypr(itemsite_id,   <? value("startDate") ?>, <? value("endDate") ?>) AS requests
              <? endif ?>
-      FROM item, itemsite, warehous 
+      FROM item, itemsite, whsinfo
            <? if reExists("[vV]end") ?>
-             , vend JOIN itemsrc ON (itemsrc_vend_id=vend_id)
+             , vendinfo JOIN itemsrc ON (itemsrc_vend_id=vend_id)
            <? endif ?>
       WHERE ( (itemsite_active)
           AND (itemsite_item_id=item_id)
           AND (itemsite_warehous_id=warehous_id)
           <? if exists("warehous_id") ?>
             AND (warehous_id=<? value("warehous_id") ?>)
           <? endif ?>
           <? if exists("item_id") ?>
             AND (item_id=<? value("item_id") ?>)
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
           <? elseif exists("itemgrp_id") ?>
             AND (item_id IN (SELECT itemgrpitem_item_id
                              FROM itemgrpitem
                              WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
           <? elseif exists("itemgrp_pattern") ?>
             AND (item_id IN (SELECT itemgrpitem_item_id
                              FROM itemgrpitem, itemgrp
                              WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                                     AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
           <? elseif exists("itemgrp") ?>
             AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
           <? endif ?>
           <? if reExists("[vV]end") ?>
             AND (itemsrc_item_id=item_id)
           <? endif ?>
           <? if exists("vend_id") ?>
             AND (vend_id=<? value("vend_id") ?>)
           <? elseif exists("vendtype_id") ?>
             AND (vend_vendtype_id=<? value("vendtype_id") ?>)
           <? elseif exists("vendtype_pattern") ?>
             AND (vend_vendtype_id IN (SELECT vendtype_id
                                       FROM vendtype
                                       WHERE (vendtype_code ~ <? value("vendtype_pattern") ?>)))
           <? endif ?>
       ) ) AS data
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
-  FROM itemsite, item, warehous AS whs1, invhist LEFT OUTER JOIN warehous AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
+  FROM itemsite, item, whsinfo AS whs1, invhist LEFT OUTER JOIN whsinfo AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
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
 <? endif ?>
 <? if exists("cohead_id") ?>
   AND  (invhist_ordtype='SO')
   AND  (invhist_ordnumber ~ (
     SELECT cohead_number 
     FROM cohead 
     WHERE cohead_id=<? value("cohead_id") ?>))
 <? endif ?>
 <? if exists("pohead_id") ?>
   AND  (invhist_ordtype='PO')
   AND  (invhist_ordnumber ~ (
     SELECT pohead_number 
     FROM pohead 
     WHERE pohead_id=<? value("pohead_id") ?>))
 <? endif ?>
 <? if exists("tohead_id") ?>
   AND  (invhist_ordtype='TO')
   AND  (invhist_ordnumber ~ (
     SELECT tohead_number 
     FROM tohead 
     WHERE tohead_id=<? value("tohead_id") ?>))
 <? endif ?>
 <? if exists("wo_id") ?>
   AND  (invhist_ordtype='WO')
   AND  (invhist_ordnumber ~ formatWoNumber(<? value("wo_id") ?>))
 <? endif ?>
 <? if exists("warehous_id") ?>
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("item_id") ?>
   AND  (itemsite_item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("classcode_id") ?>
   AND  (item_classcode_id=<? value("classcode_id") ?>)
 <? endif ?>
 <? if exists("itemgrp_id") ?>
   AND (item_id IN (SELECT itemgrpitem_item_id
 		   FROM itemgrpitem
 		   WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? endif ?>
 <? if exists("plancode_id") ?>
   AND  (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? endif ?>
 <? if exists("classcode_pattern") ?>
   AND  (item_classcode_id IN (SELECT classcode_id
 			      FROM classcode
 			      WHERE (classcode_code ~ <? value ("classcode_pattern") ?>)))
 <? endif ?>
 <? if exists("itemgrp_pattern") ?>
   AND (item_id IN (SELECT itemgrpitem_item_id
 		   FROM itemgrpitem, itemgrp
 		   WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
 		     AND  (itemgrp_name ~ <? value ("itemgrp_pattern") ?>))))
 <? endif ?>
 <? if exists("plancode_pattern") ?>
   AND (itemsite_plancode_id IN (SELECT plancode_id
 				FROM plancode
 				WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
 <? if exists("itemgrp") ?>
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
-  FROM itemsite, item, warehous AS whs1, invdetail, invhist LEFT OUTER JOIN warehous AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
+  FROM itemsite, item, whsinfo AS whs1, invdetail, invhist LEFT OUTER JOIN whsinfo AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
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
 <? endif ?>
 <? if exists("cohead_id") ?>
   AND  (invhist_ordtype='SO')
   AND  (invhist_ordnumber ~ (
     SELECT cohead_number 
     FROM cohead 
     WHERE cohead_id=<? value("cohead_id") ?>))
 <? endif ?>
 <? if exists("pohead_id") ?>
   AND  (invhist_ordtype='PO')
   AND  (invhist_ordnumber ~ (
     SELECT pohead_number 
     FROM pohead 
     WHERE pohead_id=<? value("pohead_id") ?>))
 <? endif ?>
 <? if exists("tohead_id") ?>
   AND  (invhist_ordtype='TO')
   AND  (invhist_ordnumber ~ (
     SELECT tohead_number 
     FROM tohead 
     WHERE tohead_id=<? value("tohead_id") ?>))
 <? endif ?>
 <? if exists("wo_id") ?>
   AND  (invhist_ordtype='WO')
   AND  (invhist_ordnumber ~ formatWoNumber(<? value("wo_id") ?>))
 <? endif ?>
 <? if exists("warehous_id") ?>
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("item_id") ?>
   AND  (itemsite_item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("classcode_id") ?>
   AND  (item_classcode_id=<? value("classcode_id") ?>)
 <? endif ?>
 <? if exists("itemgrp_id") ?>
   AND (item_id IN (SELECT itemgrpitem_item_id
 		   FROM itemgrpitem
 		   WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? endif ?>
 <? if exists("plancode_id") ?>
   AND  (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? endif ?>
 <? if exists("classcode_pattern") ?>
   AND  (item_classcode_id IN (SELECT classcode_id
 			      FROM classcode
 			      WHERE (classcode_code ~ <? value ("classcode_pattern") ?>)))
 <? endif ?>
 <? if exists("itemgrp_pattern") ?>
   AND (item_id IN (SELECT itemgrpitem_item_id
 		   FROM itemgrpitem, itemgrp
 		   WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
 		     AND  (itemgrp_name ~ <? value ("itemgrp_pattern") ?>))))
 <? endif ?>
 <? if exists("plancode_pattern") ?>
   AND (itemsite_plancode_id IN (SELECT plancode_id
 				FROM plancode
 				WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
 <? if exists("itemgrp") ?>
   AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
 <? endif ?>
 );
 --------------------------------------------------------------------
   
 QUERY: footer
 SELECT formatMoney(sum(invhist_value_after-invhist_value_before)) AS transvalue_total
-FROM itemsite, item, warehous AS whs1, invhist LEFT OUTER JOIN
-     warehous AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id) 
+FROM itemsite, item, whsinfo AS whs1, invhist LEFT OUTER JOIN
+     whsinfo AS whs2 ON (invhist_xfer_warehous_id=whs2.warehous_id)
 WHERE ( (invhist_itemsite_id=itemsite_id)
   AND  (itemsite_item_id=item_id) 
   AND  (itemsite_warehous_id=whs1.warehous_id)
   AND  (DATE(invhist_transdate) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?> )
   AND  (transType(invhist_transtype, <? value("transType") ?>))
 <? if exists("orderType") ?>
   AND  (invhist_ordtype=<? value("orderType") ?>)
 <? endif ?>
 <? if exists("orderNumber") ?>
   AND  (invhist_ordnumber ~ <? value("orderNumber") ?>)
   AND  (invhist_ordtype = 'SO')
 <? endif ?>
 <? if exists("warehous_id") ?>
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("item_id") ?>
   AND  (itemsite_item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("classcode_id") ?>
   AND  (item_classcode_id=<? value("classcode_id") ?>)
 <? elseif exists("itemgrp_id") ?>
   AND (item_id IN (SELECT itemgrpitem_item_id
 		   FROM itemgrpitem
 		   WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? elseif exists("plancode_id") ?>
   AND  (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("classcode_pattern") ?>
   AND  (item_classcode_id IN (SELECT classcode_id
 			      FROM classcode
 			      WHERE (classcode_code ~ <? value ("classcode_pattern") ?>)))
 <? elseif exists("itemgrp_pattern") ?>
   AND (item_id IN (SELECT itemgrpitem_item_id
 		   FROM itemgrpitem, itemgrp
 		   WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
 		     AND  (itemgrp_name ~ <? value ("itemgrp_pattern") ?>))))
 <? elseif exists("plancode_pattern") ?>
   AND (itemsite_plancode_id IN (SELECT plancode_id
 				FROM plancode
 				WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? elseif exists("itemgrp") ?>
   AND (item_id IN (SELECT DISTINCT itemgrpitem_item_id FROM itemgrpitem))
 <? endif ?>
 )
 
 --------------------------------------------------------------------
 REPORT: Invoice
 QUERY: GroupHead
 SELECT 
 
 --Due Date
 formatDate(determineDueDate(invchead_terms_id, invchead_invcdate)) AS due_date,
 --Discount Date
 formatDate(determineDiscountDate(invchead_terms_id, invchead_invcdate)) AS dis_date,
 
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
-FROM remitto, cust, invchead, terms
+FROM remitto, custinfo, invchead, terms
 WHERE ( (invchead_cust_id=cust_id)
 AND (invchead_terms_id=terms_id)
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
            ELSE item_descrip2
       END AS descrip2,
       CASE WHEN (<? value("showcosts") ?>=FALSE) THEN '---'
            ELSE formatPrice(invcitem_qty_invuomratio * invcitem_price / COALESCE(invcitem_price_invuomratio,1))
       END AS f_unitprice,
       CASE WHEN (<? value("showcosts") ?>=FALSE) THEN '---'
            ELSE formatMoney(round((invcitem_billed * invcitem_qty_invuomratio) * (invcitem_price / COALESCE(invcitem_price_invuomratio,1)),2)) 
       END AS f_extprice,
       invcitem_notes,
       getInvcitemLotSerial(invcitem_id) AS lotserial,
 --Sub-select updated for 3.1 to support kitting
       characteristicsToString('SI',invcitem_coitem_id, '=', ', ') 
       AS coitem_characteristics
 FROM invcitem LEFT OUTER JOIN (item JOIN uom ON (item_inv_uom_id=uom_id)) ON (invcitem_item_id=item_id) LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=invcitem_custpn)
 WHERE (invcitem_invchead_id=<? value("invchead_id") ?>)
 ORDER BY invcitem_linenumber;
 --------------------------------------------------------------------
   
 QUERY: tracknum
-select formatdate(cosmisc_shipdate) AS f_shipdate, cosmisc_tracknum, cosmisc_shipvia from cohead, cosmisc, invchead 
+select formatdate(shiphead_shipdate) AS f_shipdate, shiphead_tracknum, shiphead_shipvia from cohead, shiphead, invchead 
 where 
-cohead_id = cosmisc_cohead_id
+cohead_id = shiphead_order_id
+and shiphead_order_type = 'SO'
 and cohead_number = invchead_ordernumber
 and invchead_id = <? value("invchead_id") ?>
-order by cosmisc_shipdate;
+order by shiphead_shipdate;
 
 --------------------------------------------------------------------
 REPORT: InvoiceInformation
 QUERY: CustInfo
 SELECT cust_id,
        cust_number,
        cust_name,
-       cust_address1,
-       cust_address2,
-       cust_address3,
-       cust_city || ' ' || cust_state || ', ' || cust_zipcode AS custcitystatezip
-FROM invchead, cust
+       addr_line1 AS cust_address1,
+       addr_line2 AS cust_address2,
+       addr_line3 AS cust_address3,
+       addr_city || ' ' || addr_state || ', ' || addr_postalcode AS custcitystatezip
+FROM invchead, custinfo
+LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+LEFT OUTER JOIN addr ON (cntct_addr_id=addr_id)
 WHERE ( (invchead_id=<? value("invchead_id") ?>)
  AND (invchead_cust_id=cust_id) );
 
 --------------------------------------------------------------------
 REPORT: ItemSites
 QUERY: detail
 SELECT warehous_code,
        formatBoolYN(itemsite_active) AS active,
        item_number,
        item_descrip1,
        item_descrip2,
        formatBoolYN(itemsite_wosupply) AS supplied,
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
-  FROM item, uom, itemsite, warehous 
+  FROM item, uom, itemsite, whsinfo
  WHERE ((itemsite_warehous_id=warehous_id)
          AND (itemsite_item_id=item_id)
          AND(item_inv_uom_id=uom_id)
        <? if exists("search_pattern") ?>
          AND ((item_number ~* <? value("search_pattern") ?>)
            OR (item_descrip1 || ' ' || item_descrip2 ~* <? value("search_pattern") ?>)
            OR (warehous_code ~* <? value("search_pattern") ?>))
        <? endif ?>
        <? if exists("item_id") ?>
          AND (item_id=<? value("item_id") ?>)
        <? endif ?>
        <? if exists("classcode_id") ?>
          AND (item_classcode_id=<? value("classcode_id") ?>)
        <? endif ?>
        <? if exists("itemgrp_id") ?>
          AND (item_id IN (SELECT itemgrpitem_item_id 
                           FROM itemgrpitem 
                           WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
        <? endif ?>
        <? if exists("plancode_id") ?>
          AND (itemsite_plancode_id=<? value("plancode_id") ?>)
        <? endif ?>
        <? if exists("costcat_id") ?>
          AND (itemsite_costcat_id=<? value("costcat_id") ?>)
        <? endif ?>
        <? if exists("classcode_pattern") ?>
          AND (item_classcode_id IN (SELECT classcode_id 
                                     FROM classcode 
                                     WHERE (classcode_code ~ <? value("classcode_pattern") ?>)))
        <? endif ?>
        <? if exists("itemgrp_pattern") ?>
          AND (item_id IN (SELECT itemgrpitem_item_id 
                           FROM itemgrpitem, itemgrp 
                           WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id) 
                               AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
        <? endif ?>
        <? if exists("plancode_pattern") ?>
          AND (itemsite_plancode_id IN (SELECT plancode_id 
                                        FROM plancode 
                                        WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
        <? endif ?>
        <? if exists("costcat_pattern") ?>
          AND (itemsite_costcat_id IN (SELECT costcat_id 
                                       FROM costcat 
                                       WHERE (costcat_code ~ <? value("costcat_pattern") ?>)))
        <? endif ?>
      <? if exists("warehous_id") ?>
        AND (warehous_id=<? value("warehous_id") ?>)
      <? endif ?>
    <? if not exists("showInactive") ?>
      AND (itemsite_active)
    <? endif ?>
 )
 ORDER BY item_number, warehous_code;
 
 --------------------------------------------------------------------
 REPORT: ItemSources
 QUERY: detail
 SELECT item_number, vend_name,
        item_descrip1, item_descrip2,
        uom_name,
        itemsrc_vend_item_number as f_venditem,
        itemsrc_vend_uom as f_venduom,
        formatQty(itemsrc_invvendoruomratio) as f_uomratio
-FROM itemsrc, vend, item, uom 
+FROM itemsrc, vendinfo, item, uom
 WHERE ((itemsrc_vend_id=vend_id)
   AND (itemsrc_item_id=item_id)
   AND (item_inv_uom_id=uom_id)
 <? if exists("item_id") ?>
   AND (itemsrc_item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("vend_id") ?>
   AND (itemsrc_vend_id=<? value("vend_id") ?>)
 <? endif ?>
 )
 ORDER By item_number, vend_name;
 
 --------------------------------------------------------------------
 REPORT: ListOpenSalesOrders
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse;
 
 
 --------------------------------------------------------------------
 REPORT: LocationDispatchList
 QUERY: head
 SELECT warehous_code
-FROM warehous
+FROM whsinfo
 WHERE (warehous_id=%1);
 
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
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item as parent, item as child, uom AS puom, uom AS cuom, bomitem
  WHERE ((parent.item_id=<? value("item_id") ?>)
    AND (parent.item_inv_uom_id=puom.uom_id)
    AND (bomitem_item_id=child.item_id)
    AND (child.item_inv_uom_id=cuom.uom_id)
    AND (bomitem_id=<? value("bomitem_id") ?>) );
 
 
 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByComponentItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("component_item_id") ?>);
 
 
 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
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
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse;
 
 --------------------------------------------------------------------
 REPORT: MaterialUsageVarianceByWorkOrder
 QUERY: head
 SELECT formatWONumber(wo_id) AS wonumber,
        warehous_code, item_number, uom_name,
        item_descrip1, item_descrip2,
        wo_status
-  FROM wo, itemsite, item, warehous, uom
+  FROM wo, itemsite, item, whsinfo, uom
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_id=<? value("wo_id") ?>))
 
 --------------------------------------------------------------------
 REPORT: OpenWorkOrdersWithClosedParentSalesOrders
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse;
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT formatWONumber(wo_id) AS wonumber,
        wo_status, item_number, uom_name,
        item_descrip1, item_descrip2,
        warehous_code,
        cohead_number,
        formatQty(wo_qtyord) AS qtyord,
        formatQty(wo_qtyrcv) AS qtyrcv,
        formatDate(wo_startdate) AS startdate,
        formatDate(wo_duedate) AS duedate 
-  FROM coitem, cohead, wo, itemsite, warehous, item, uom
+  FROM coitem, cohead, wo, itemsite, whsinfo, item, uom
  WHERE ((coitem_cohead_id=cohead_id)
    AND (coitem_order_id=wo_id)
    AND (coitem_status='C')
    AND (wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_status IN ('O', 'E', 'R', 'I'))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY wo_duedate;
 
 --------------------------------------------------------------------
 REPORT: OpenWorkOrdersWithParentSalesOrders
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse;
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT formatWONumber(wo_id) AS wonumber,
        wo_status, item_number, uom_name,
        item_descrip1, item_descrip2,
        warehous_code,
        cohead_number,
        formatQty(wo_qtyord) AS qtyord,
        formatQty(wo_qtyrcv) AS qtyrcv,
        formatDate(wo_startdate) AS startdate,
        formatDate(wo_duedate) AS duedate 
-  FROM coitem, cohead, wo, itemsite, warehous, item, uom
+  FROM coitem, cohead, wo, itemsite, whsinfo, item, uom
  WHERE ((coitem_cohead_id=cohead_id)
    AND (coitem_order_id=wo_id)
    AND (coitem_status<>'X')
    AND (wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_status IN ('O', 'E', 'R', 'I'))
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY wo_duedate;
 
 --------------------------------------------------------------------
 REPORT: POHistory
 QUERY: head
 SELECT pohead_number,
        vend_name
-  FROM pohead, vend
+  FROM pohead, vendinfo
  WHERE ((pohead_id=<? value("pohead_id") ?>)
   AND  (pohead_vend_id=vend_id));
 
 --------------------------------------------------------------------
 REPORT: POLineItemsByDate
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
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
        as f_whichitems,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
 
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT CASE WHEN (itemsite_id IS NULL) THEN ( SELECT warehous_code
-                                              FROM warehous
+                                              FROM whsinfo
                                               WHERE (pohead_warehous_id=warehous_id) )
             ELSE ( SELECT warehous_code
-                   FROM warehous
+                   FROM whsinfo
                    WHERE (itemsite_warehous_id=warehous_id) )
        END AS warehousecode,
        pohead_number as f_ponumber,
        poitem_linenumber as f_linenumber,
        vend_name,
        formatDate(poitem_duedate) as f_duedate,
        COALESCE(item_number, (text('NonInv - ') || poitem_vend_item_number)) AS itemnumber,
        COALESCE(uom_name, poitem_vend_uom) AS itemuom,
        formatQty(poitem_qty_ordered) as f_ordered,
        formatQty(poitem_qty_received) as f_received,
        formatQty(poitem_qty_returned) as f_returned
-  FROM pohead, vend,
+  FROM pohead, vendinfo,
        poitem LEFT OUTER JOIN
          (itemsite JOIN item
            ON (itemsite_item_id=item_id) JOIN uom ON (item_inv_uom_id=uom_id))
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
 REPORT: POLineItemsByItem
 QUERY: head
 SELECT item_number, item_descrip1, item_descrip2, uom_name,
        <? if exists("warehous_id") ?>
-         ( SELECT warehous_code FROM warehous WHERE warehous_id=<? value("warehous_id") ?>)
+         ( SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
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
   FROM item JOIN uom ON (item_inv_uom_id=uom_id)
  WHERE (item_id=<? value("item_id") ?>);
 
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT warehous_code, pohead_number as f_ponumber, vend_name,
        formatDate(poitem_duedate) as f_duedate,
        poitem_vend_uom as uom_name, 
        formatQty(poitem_qty_ordered) as f_ordered,
        formatQty(poitem_qty_received) as f_received,
        formatQty(poitem_qty_returned) as f_returned 
-  FROM pohead, poitem, vend, itemsite, warehous 
+  FROM pohead, poitem, vendinfo, itemsite, whsinfo
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
 REPORT: POLineItemsByVendor
 QUERY: head
 SELECT
 <? if exists("vend_id") ?>
        (SELECT ('Vendor = ' || vend_name) FROM vendinfo WHERE vend_id=<? value("vend_id") ?>)
 <? elseif exists("vendtype_id") ?>
        (SELECT ('Vendor Type = ' || vendtype_code) FROM vendtype WHERE vendtype_id=<? value("vendtype_id") ?>)
 <? elseif exists("vendtype_pattern") ?>
        ('Vendor Type pattern = ' || <? value("vendtype_pattern") ?>)
 <? else ?>
        'All Vendors'
 <? endif ?>
        AS selection,
        <? if exists("warehous_id") ?>
-         ( SELECT warehous_code FROM warehous WHERE warehous_id=<? value("warehous_id") ?>)
+         ( SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
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
 ;
 
 --------------------------------------------------------------------
 REPORT: POsByDate
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
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
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
 
 
 --------------------------------------------------------------------
 REPORT: POsByVendor
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
 <? if exists("vend_id") ?>
        (SELECT ('Vendor = ' || vend_name) FROM vendinfo WHERE vend_id=<? value("vend_id") ?>)
 <? elseif exists("vendtype_id") ?>
        (SELECT ('Vendor Type = ' || vendtype_code) FROM vendtype WHERE vendtype_id=<? value("vendtype_id") ?>)
 <? elseif exists("vendtype_pattern") ?>
        ('Vendor Type pattern = ' || <? value("vendtype_pattern") ?>)
 <? else ?>
        'All Vendors'
 <? endif ?>
        AS selection,
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
   
 QUERY: detail
-SELECT pohead_id, pohead_number,
-       warehous_code AS warehousecode,
-       CASE WHEN(poitem_status='C') THEN TEXT('Closed')
-            WHEN(poitem_status='U') THEN TEXT('Unposted')
-            WHEN(poitem_status='O' AND (SUM(poitem_qty_received-poitem_qty_returned) > 0) AND (SUM(poitem_qty_ordered)>SUM(poitem_qty_received-poitem_qty_returned))) THEN TEXT('Partial')
-            WHEN(poitem_status='O' AND (SUM(poitem_qty_received-poitem_qty_returned) > 0) AND (SUM(poitem_qty_ordered)=SUM(poitem_qty_received-poitem_qty_returned))) THEN TEXT('Received')
-            WHEN(poitem_status='O') THEN TEXT('Open')
-            ELSE poitem_status
-       END AS poitemstatus,
-       vend_number,
-<? if exists("byReceiptDate") ?>
-       formatDate(MIN(date(porecv_date))) AS f_date,
-       MIN(date(porecv_date)) AS sortDate,
-<? elseif exists("byDueDate") ?>
-       formatDate(MIN(poitem_duedate)) AS f_date,
-       MIN(poitem_duedate) AS sortDate,
-<? else ?>
-       formatDate(pohead_orderdate) AS f_date,
-       pohead_orderdate AS sortDate,
-<? endif ?>
-       (MIN(poitem_duedate) < CURRENT_DATE) AS late
-  FROM vend, poitem,
-<? if exists("byReceiptDate") ?>
-       porecv,
-<? endif ?>
-       pohead LEFT OUTER JOIN warehous ON (pohead_warehous_id=warehous_id)
- WHERE ((poitem_pohead_id=pohead_id)
-   AND  (pohead_vend_id=vend_id)
-<? if exists("byReceiptDate") ?>
-   AND  (porecv_itemsite_id=poitem_itemsite_id)
-   AND  (porecv_ponumber=pohead_number)
-   AND  (date(porecv_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? elseif exists("byDueDate") ?>
-   AND  (poitem_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? else ?>
-   AND  (pohead_orderdate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
-<? endif ?>
-<? if exists("vend_id") ?>
-   AND  (vend_id=<? value("vend_id") ?>)
-<? endif ?>
-<? if exists("warehous_id") ?>
-   AND (pohead_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-<? if not exists("showClosed") ?>
-   AND (poitem_status!='C')
-<? endif ?>
-<? if exists("descrip_pattern") ?>
-  AND ((poitem_vend_item_descrip ~* <? value("descrip_pattern") ?>)
-    OR (poitem_itemsite_id IN (
-      SELECT itemsite_id
-        FROM itemsite, item
-       WHERE ((itemsite_item_id=item_id)
-         AND  ((item_descrip1 ~* <? value("descrip_pattern") ?>)
-            OR (item_descrip2 ~* <? value("descrip_pattern") ?>)))
-                              )))
-<? endif ?>
-
-)
-GROUP BY pohead_id, pohead_number, warehous_code,
-         poitem_status, pohead_orderdate, vend_number
-ORDER BY sortDate
-
+== MetaSQL statement purchaseOrders-detail
 
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
-       cust_contact,
-       cust_phone,
+       trim(cntct_first_name || ' ' || cntct_last_name) AS cust_contact,
+       cntct_phone AS cust_phone,
        terms_descrip
-  FROM shiphead, cohead, cust, terms
- WHERE ((cohead_cust_id=cust_id)
-   AND (cohead_terms_id=terms_id)
-   AND (cohead_id=shiphead_order_id)
-   AND (shiphead_order_type='SO')
-   AND (shiphead_id=<? value("shiphead_id") ?>)
-)
+  FROM shiphead
+  JOIN cohead ON (cohead_id=shiphead_order_id)
+  JOIN custinfo ON (cohead_cust_id=cust_id)
+  JOIN terms ON (cohead_terms_id=terms_id)
+  LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+  LEFT OUTER JOIN addr ON (cntct_addr_id=addr_id)
+ WHERE (shiphead_id=<? value("shiphead_id") ?>)
+
 <? if exists("MultiWhs") ?>
 UNION
 SELECT shiphead_number, 'T/O #:' AS ordertype,
        tohead_number AS ordernumber,
        formattobarcode(tohead_id) AS order_barcode,
        shiphead_shipvia AS shipvia,
        tohead_destphone AS shiptophone,
        TEXT(' ') AS cohead_custponumber,
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
   
 QUERY: scheddate
 SELECT formatDate(MIN(coitem_scheddate)) AS scheddate
-  FROM coitem, coship
+  FROM coitem, shipitem
  WHERE ((coitem_status <> 'X')
-   AND  (coitem_id=coship_coitem_id)
-   AND  (coship_cosmisc_id=<? value("coship_cosmisc_id") ?>));
+   AND  (coitem_id=shipitem_orderitem_id)
+   AND  (shipitem_shiphead_id=<? value("shipitem_shiphead_id") ?>));
 --------------------------------------------------------------------
   
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
-       (SELECT formatQty(SUM(coship_qty)) FROM coship WHERE ((coship_cosmisc_id=<? value("cosmisc_id") ?>) AND (coship_coitem_id=coitem_id))) AS shipped,
+       (SELECT formatQty(SUM(shipitem_qty)) FROM shipitem WHERE ((shipitem_shiphead_id=<? value("shiphead_id") ?>) AND (shipitem_orderitem_id=coitem_id))) AS shipped,
 
        CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus
-                                           FROM cust,cohead
+                                           FROM custinfo,cohead
                                           WHERE coitem_cohead_id=cohead_id
-                                            AND cust_id=cohead_cust_id)='H') THEN 'H'
+                                            AND (cust_id=cohead_cust_id))='H') THEN 'H'
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
-         WHEN (getPacklistItemLotSerial(coship_cosmisc_id, coitem_id) = '') THEN
+         WHEN (getPacklistItemLotSerial(shipitem_shiphead_id, coitem_id) = '') THEN
            ''
          ELSE
            'Serial #/Lot Information:'
        END AS lotserial_title,
-       getPacklistItemLotSerial(coship_cosmisc_id, coitem_id) AS lotserial,
+       getPacklistItemLotSerial(shipitem_shiphead_id, coitem_id) AS lotserial,
        CASE
-         WHEN (getPacklistCharName(coship_cosmisc_id, coitem_id) = '') THEN
+         WHEN (getPacklistCharName(shipitem_shiphead_id, coitem_id) = '') THEN
            ''
          ELSE
            'Characteristics:'
        END AS char_title,
-       getPacklistCharName(coship_cosmisc_id, coitem_id) AS char_name,
-       getPacklistCharValue(coship_cosmisc_id, coitem_id) AS char_value
-  FROM coship
-       JOIN coitem ON (coitem_id=coship_coitem_id)
+       getPacklistCharName(shipitem_shiphead_id, coitem_id) AS char_name,
+       getPacklistCharValue(shipitem_shiphead_id, coitem_id) AS char_value
+  FROM shipitem
+       JOIN coitem ON (coitem_id=shipitem_orderitem_id)
        JOIN itemsite ON (itemsite_id=coitem_itemsite_id)
        JOIN item ON (item_id=itemsite_item_id)
        JOIN uom ON (uom_id=item_inv_uom_id)
        LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=coitem_custpn) 
  WHERE ( (coitem_status <> 'X')
-   AND (coship_cosmisc_id=<? value("cosmisc_id") ?>)
+   AND (shipitem_shiphead_id=<? value("shiphead_id") ?>)
 )
 <? if exists("MultiWhs") ?>
 UNION
 SELECT 2 AS groupby,
 --     For 3.1 added CAST to match column type of corresponding column in other SELECT 
 --     in this UNION
        CAST(toitem_linenumber AS text) AS linenumber,
        toitem_notes AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formattoitembarcode(toitem_id) AS orderitem_barcode,
        uom_name,
        itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,
 
        formatQty(toitem_qty_ordered) AS ordered,
 
        (SELECT formatQty(SUM(shipitem_qty))
         FROM shipitem
         WHERE ((shipitem_shiphead_id=<? value("shiphead_id") ?>)
           AND  (shipitem_orderitem_id=toitem_id))
        ) AS shipped,
 
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
-       cust_contact,
-       cust_phone,
+       trim(cntct_first_name || ' ' || cntct_last_name) AS cust_contact,
+       cntct_phone AS cust_phone,
        terms_descrip
-  FROM cust, terms, cohead
+  FROM custinfo
+  JOIN cohead ON (cohead_cust_id=cust_id)
+  JOIN terms ON (cohead_terms_id=terms_id)
+  LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
 <? if exists("shiphead_id") ?>
 	JOIN
 <? else ?>
 	LEFT OUTER JOIN
 <? endif ?>
-       shiphead ON ((shiphead_id=<? value("shiphead_id") ?>)
-		AND (shiphead_order_id=cohead_id)
-		AND (shiphead_order_type='SO'))
- WHERE ((cohead_cust_id=cust_id)
-   AND  (cohead_terms_id=terms_id)
+        shiphead ON (shiphead_order_type='SO') AND (shiphead_order_id=cohead_id)
+WHERE TRUE
+<? if exists('shiphead_id') ?>
+    AND (shiphead_id=<? value("shiphead_id") ?>)
+<? endif ?>
 <? if exists("head_id") ?>
-   AND  (<? value("head_type") ?>='SO')
    AND  (cohead_id=<? value("head_id") ?>)
+   AND  (<? value("head_type") ?>='SO')
 <? endif ?>
-)
+
 
 <? if exists("MultiWhs") ?>
 UNION
 SELECT COALESCE(shiphead_number::TEXT, 'Not Issued To Shipping') AS shiphead_number,
       'T/O #:' AS ordertype,
        tohead_number AS ordernumber,
        formattobarcode(tohead_id) AS order_barcode,
        COALESCE(shiphead_shipvia, tohead_shipvia) AS shipvia,
        tohead_destphone AS shiptophone,
        TEXT(' ') AS cohead_custponumber,
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
-       shiphead ON ((shiphead_id=<? value("shiphead_id") ?>)
-		AND (shiphead_order_id=tohead_id)
-		AND (shiphead_order_type='TO'))
+       shiphead ON (shiphead_order_type='TO') AND (shiphead_order_id=tohead_id)
+WHERE TRUE
+<? if exists('shiphead_id') ?>
+    AND (shiphead_id=<? value("shiphead_id")?>)
+<? endif ?>
 <? if exists("head_id") ?>
- WHERE ((<? value("head_type") ?>='TO')
    AND  (tohead_id=<? value("head_id") ?>)
-   )
+   AND ((<? value("head_type") ?>='TO')
 <? endif ?>
 <? endif ?>;
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT 1 AS groupby,
        coitem_linenumber AS linenumber,
        coitem_memo AS memo,
        CASE WHEN (coitem_custpn != '') THEN coitem_custpn
             ELSE item_number
        END AS item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formatsoitembarcode(coitem_id) AS orderitem_barcode,
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_name,
        itemsellinguom(item_id) AS shipuom,
        CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip1
             ELSE item_descrip1
        END AS item_descrip1,
        CASE WHEN (coitem_custpn != '' AND itemalias_usedescrip=TRUE) THEN itemalias_descrip2
             ELSE item_descrip2
        END AS item_descrip2,
        formatQty(coitem_qtyord) AS ordered,
        ( SELECT formatQty(COALESCE(SUM(shipitem_qty), 0))
          FROM shipitem JOIN shiphead ON (shiphead_id=shipitem_shiphead_id)
          WHERE ((shipitem_orderitem_id=coitem_id) AND (shiphead_order_type='SO')) ) AS atShipping,
 
        CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus
-                                           FROM cust,cohead
-                                          WHERE coitem_cohead_id=cohead_id
-                                            AND cust_id=cohead_cust_id)='H') THEN 'H'
+                                           FROM custinfo,cohead
+                                          WHERE (coitem_cohead_id=cohead_id)
+                                            AND (cust_id=cohead_cust_id))='H') THEN 'H'
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
   FROM coitem
        JOIN itemsite ON (itemsite_id=coitem_itemsite_id)
        JOIN item ON (item_id=itemsite_item_id)
        JOIN uom ON (uom_id=item_inv_uom_id)
        LEFT OUTER JOIN itemalias ON (itemalias_item_id=item_id AND itemalias_number=coitem_custpn) 
  WHERE ( (coitem_status <> 'X')
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
 GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_id, coitem_memo, item_number, uom_name, shipuom,
          coitem_custpn, itemalias_usedescrip, itemalias_descrip1, itemalias_descrip2,
          item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
 <? if exists("MultiWhs") ?>
 UNION
 SELECT 2 AS groupby,
        toitem_linenumber AS linenumber,
        toitem_notes AS memo,
        item_number,
        formatitemsitebarcode(itemsite_id) AS item_barcode,
        formattoitembarcode(toitem_id) AS orderitem_barcode,
        uom_name,
        itemsellinguom(item_id) AS shipuom,
        item_descrip1,
        item_descrip2,
 
        formatQty(toitem_qty_ordered) AS ordered,
        ( SELECT formatQty(COALESCE(SUM(shipitem_qty), 0))
          FROM shipitem JOIN shiphead ON (shiphead_id=shipitem_shiphead_id)
          WHERE ((shipitem_orderitem_id=toitem_id) AND (shiphead_order_type='TO')) ) AS atShipping,
 
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
   
 QUERY: lotdetail
 SELECT * FROM 
 (
   SELECT
-    shiphead_number AS cosmisc_number,
+    shiphead_number,
     (cohead_number || '-' || coitem_linenumber) AS ordernumber,
     item_number,
     formatlotserialnumber(invdetail_ls_id) AS invdetail_lotserial,
     SUM(invdetail_qty) * -1 AS lotqty,
     SUM(invhist_invqty) as totalshipmentqty,
     invhist_transtype,
     formatdate(MAX(invhist_transdate)) AS invhistdate,
     formatdate(MAX(shipitem_transdate)) AS shiptransdate
   FROM shiphead
     JOIN shipitem ON (shipitem_shiphead_id=shiphead_id)
     JOIN invhist ON (invhist_id=shipitem_invhist_id)
     JOIN invdetail ON (invdetail_invhist_id=invhist_id)
     JOIN cohead ON (cohead_id=shiphead_order_id)
     JOIN coitem ON (coitem_id=shipitem_orderitem_id)
     JOIN itemsite ON (itemsite_id=coitem_itemsite_id)
     JOIN item ON (item_id=itemsite_item_id)
   WHERE ( (shiphead_id = <? value("shiphead_id") ?> )
     AND ('SO'=shiphead_order_type) )
   GROUP BY shiphead_number,cohead_number,item_number,invdetail_ls_id,
     coitem_linenumber,invhist_transtype
 <? if exists("MultiWhs") ?>
 UNION
   SELECT
-    shiphead_number AS cosmisc_number,
+    shiphead_number,
     (tohead_number || '-' || toitem_linenumber) AS ordernumber,
     item_number,
     formatlotserialnumber(invdetail_ls_id) AS invdetail_lotserial,
     SUM(invdetail_qty) * -1 AS lotqty,
     SUM(invhist_invqty) as totalshipmentqty,
     invhist_transtype,
     formatdate(MAX(invhist_transdate)) AS invhistdate,
     formatdate(MAX(shipitem_transdate)) AS shiptransdate
   FROM shiphead
     JOIN shipitem ON (shipitem_shiphead_id=shiphead_id)
     JOIN invhist ON (invhist_id=shipitem_invhist_id)
     JOIN invdetail ON (invdetail_invhist_id=invhist_id)
     JOIN tohead ON (tohead_id=shiphead_order_id)
     JOIN toitem ON (toitem_id=shipitem_orderitem_id)
     JOIN item ON (item_id=toitem_item_id)
   WHERE ( (shiphead_id = <? value("shiphead_id") ?> )
     AND ('TO'=shiphead_order_type) )
   GROUP BY shiphead_number,tohead_number,item_number,invdetail_ls_id,
     toitem_linenumber,invhist_transtype
 <? endif ?>
 ) data
 ORDER BY ordernumber;
 
 --------------------------------------------------------------------
 REPORT: PackingListBatchEditList
 QUERY: detail
 SELECT cohead_number AS order_number, pack_head_type,
        cohead_shipvia AS shipvia,
        formatShipmentNumber(pack_shiphead_id) AS shipment_number, 
        cust_number AS number, cohead_billtoname AS name,
        CASE WHEN (cohead_holdtype='N') THEN <? value("none") ?>
             WHEN (cohead_holdtype='C') THEN <? value("credit") ?>
             WHEN (cohead_holdtype='S') THEN <? value("ship") ?>
             WHEN (cohead_holdtype='P') THEN <? value("pack") ?>
             WHEN (cohead_holdtype='R') THEN <? value("return") ?>
             ELSE <? value("other") ?>
        END AS f_holdtype,
        formatBoolYN(pack_printed) AS f_printed
-FROM pack, cohead, cust 
+FROM pack, cohead, custinfo
 WHERE ((pack_head_id=cohead_id)
   AND  (cohead_cust_id=cust_id)
   AND  (pack_head_type='SO'))
 <? if exists("MultiWhs") ?>
   AND  checkSOSitePrivs(cohead_id)
 UNION 
 SELECT tohead_number AS order_number, pack_head_type,
        tohead_shipvia AS shipvia,
        formatShipmentNumber(pack_shiphead_id) AS shipment_number, 
        tohead_destname AS number, tohead_destcntct_name AS name,
        '' AS f_holdtype,
        formatBoolYN(pack_printed) AS f_printed
 FROM pack, tohead 
 WHERE ((pack_head_id=tohead_id)
   AND  (pack_head_type='TO')) 
 <? endif ?>
 ORDER BY order_number;
 
 --------------------------------------------------------------------
 REPORT: PartiallyShippedOrders
 QUERY: detail
 SELECT CASE WHEN (cohead_holdtype IN ('P', 'C', 'R')) THEN -1
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
          formatExtPrice( SUM( (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
                             (coitem_price / coitem_price_invuomratio) ) )
        <? else ?>
          text('')
        <? endif ?>
        AS f_extprice,
        SUM( (noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
             (coitem_price / coitem_price_invuomratio) ) AS backlog,
        MIN(coitem_scheddate) AS scheddate,
-       COALESCE(MIN(coship_id), 0) AS shipped
-  FROM cohead, itemsite, item, cust,
-       coitem LEFT OUTER JOIN coship ON (coship_coitem_id=coitem_id) 
+       COALESCE(MIN(shipitem_id), 0) AS shipped
+  FROM cohead, itemsite, item, custinfo,
+       coitem LEFT OUTER JOIN shipitem ON (shipitem_orderitem_id=coitem_id) 
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
   
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT (warehous_code||'-'||warehous_descrip)
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
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
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
 WHERE (item_id=<? value("item_id") ?>);
 
 --------------------------------------------------------------------
 REPORT: PickList
 QUERY: Head
 SELECT formatWoNumber(wo_id) AS wonumber, wo_prodnotes,
                 item_number, uom_name, item_descrip1, item_descrip2,
                 warehous_code, formatQty(wo_qtyord) AS qtyord,
                 formatQty(wo_qtyrcv) AS qtyrcv,
                 formatDate(wo_startdate) AS startdate,
                 formatDate(wo_duedate) AS duedate
-         FROM wo, itemsite, item, warehous, uom
+         FROM wo, itemsite, item, whsinfo, uom
          WHERE ((wo_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
           AND (itemsite_warehous_id=warehous_id)
           AND (wo_id=%1))
     
 
 --------------------------------------------------------------------
 REPORT: PickListWOShowLocations
 QUERY: Head
 SELECT formatWoNumber(wo_id) AS wonumber, wo_prodnotes,
                 item_number, uom_name, item_descrip1, item_descrip2,
                 warehous_code, formatQty(wo_qtyord) AS qtyord,
                 formatQty(wo_qtyrcv) AS qtyrcv,
                 formatDate(wo_startdate) AS startdate,
                 formatDate(wo_duedate) AS duedate
-         FROM wo, itemsite, item, warehous, uom
+         FROM wo, itemsite, item, whsinfo, uom
          WHERE ((wo_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
           AND (itemsite_warehous_id=warehous_id)
           AND (wo_id=%1))
     
 --------------------------------------------------------------------
   
 QUERY: Detail
 select 
      warehous_code, 
      wo_number,
      womatl_id,
      item_number,
      item_descrip1,
      item_descrip2, 
      uom_name,
 --   itemuomtouomratio(item_id,item_inv_uom_id, womatl_uom_id) * womatl_qtyreq AS required_qty,
      womatl_qtyreq AS required_qty,
 --   formatqty(itemuomtouomratio(item_id,item_inv_uom_id, womatl_uom_id) * womatl_qtyreq) AS required_fmt,
      formatqty(womatl_qtyreq) AS required_fmt,
 --   itemuomtouomratio(item_id,item_inv_uom_id, womatl_uom_id) * womatl_qtyiss AS issued_qty,
      womatl_qtyiss AS issued_qty,
      formatqty(womatl_qtyiss) AS issued_fmt,
 --   (itemuomtouomratio(item_id,item_inv_uom_id, womatl_uom_id) * womatl_qtyreq) - 
                (itemuomtouomratio(item_id,item_inv_uom_id, womatl_uom_id)  * womatl_qtyiss) AS pick_qty,
      womatl_qtyreq - womatl_qtyiss AS pick_qty,   
     formatqty(womatl_qtyreq - womatl_qtyiss) AS pick_fmt,
      CASE WHEN (womatl_issuemethod='S') THEN text('Push')
             WHEN (womatl_issuemethod='L') THEN text('Pull')
             WHEN (womatl_issuemethod='M') THEN text('Mixed')
             ELSE text(womatl_issuemethod)
      END AS f_issuemethod,
      location_aisle || '-' || location_rack || '-' || location_bin || '-' || location_name  AS location_name,
      formatlotserialnumber(itemloc_ls_id),
 --     itemloc_lotserial,
      itemsite_location_comments AS location_comment,
      itemloc_qty AS location_qty_qty,
      itemuomtouomratio(item_id,item_inv_uom_id, womatl_uom_id) * itemloc_qty AS loc_issue_uom_qty,
      formatqty(itemuomtouomratio(item_id,item_inv_uom_id, womatl_uom_id) * itemloc_qty) AS loc_issue_uom_fmt,
      CASE WHEN itemloc_expiration = '1970-01-01' THEN text ('N/A')
           WHEN itemloc_expiration = '2100-01-01' THEN text ('N/A')
           ELSE CAST(formatdate(itemloc_expiration) AS text)
      END AS expiration 
 
 from 
 
-     item, uom, warehous, womatl, wo, itemsite
+     item, uom, whsinfo, womatl, wo, itemsite
      LEFT OUTER JOIN itemloc  ON (itemloc_itemsite_id = itemsite_id)
      LEFT OUTER JOIN location ON (itemloc_location_id = location_id)
 
 
 where
      itemsite_item_id = item_id
      and 
      itemsite_warehous_id = warehous_id
      and
      womatl_uom_id = uom_id
      and
      itemsite_id = womatl_itemsite_id
      and
      womatl_wo_id = wo_id
      and
      wo_id = <? value("wo_id") ?>
 order by wo_number, womatl_id, item_number, itemloc_expiration, location_name;
 
 --------------------------------------------------------------------
 REPORT: PickingListSOClosedLines
 QUERY: head
 SELECT cust_number,
        formatsobarcode(cohead_id) AS order_barcode,
 
        formataddr(cohead_billtoaddress1, cohead_billtoaddress2, cohead_billtoaddress3, (cohead_billtocity || '  ' ||   cohead_billtostate || '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address, 
 
   formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3, (cohead_shiptocity || '  ' ||   cohead_shiptostate || '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,           
 
-       cust_contact,
+       trim(cntct_first_name || ' ' || cntct_last_name) AS cust_contact,
        cohead_billtoname,
        cohead_billtoaddress1,
        cohead_billtoaddress2,
        cohead_billtoaddress3,
        (cohead_billtocity || '  ' || cohead_billtostate || '  ' || cohead_billtozipcode) AS billtocitystatezip,
-       cust_phone,
+       cntct_phone AS cust_phone,
        cohead_shiptoname,
        cohead_shiptoaddress1,
        cohead_shiptoaddress2,
        cohead_shiptoaddress3,
        (cohead_shiptocity || '  ' || cohead_shiptostate || ' ' || cohead_shiptozipcode) AS shiptocitystatezip,
        cohead_number,
        cohead_shipvia,
        cohead_shiptophone,
        cohead_custponumber,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_shipcomments, 
        terms_descrip
-  FROM cohead, cust, terms
- WHERE ((cohead_cust_id=cust_id)
-   AND (cohead_terms_id=terms_id)
-   AND (cohead_id=<? value("sohead_id") ?>)
-);
+  FROM cohead
+  JOIN custinfo ON (cohead_cust_id=cust_id)
+  JOIN terms ON (cohead_terms_id=terms_id)
+  LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+  WHERE (cohead_id=<? value("sohead_id") ?>);
+  
 --------------------------------------------------------------------
   
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
        CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(coitem_qtyshipped - coitem_qtyreturned)
             ELSE NULL
        END AS shipped,
        CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned))
             ELSE NULL
        END AS balance,
        CASE WHEN (qtyAtShipping('SO', coitem_id) > 0.0) THEN formatQty(qtyAtShipping('SO', coitem_id))
             ELSE NULL
        END AS atShipping,
-       CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
+       CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM custinfo,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
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
 QUERY: head
 SELECT cust_number,
        formatsobarcode(cohead_id) AS order_barcode,
 
        formataddr(cohead_billtoaddress1, cohead_billtoaddress2, cohead_billtoaddress3, (cohead_billtocity || '  ' ||   cohead_billtostate || '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address, 
 
   formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3, (cohead_shiptocity || '  ' ||   cohead_shiptostate || '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,           
 
-       cust_contact,
+       trim(cntct_first_name || ' ' || cntct_last_name) AS cust_contact,
        cohead_billtoname,
        cohead_billtoaddress1,
        cohead_billtoaddress2,
        cohead_billtoaddress3,
        (cohead_billtocity || '  ' || cohead_billtostate || '  ' || cohead_billtozipcode) AS billtocitystatezip,
-       cust_phone,
+       cntct_phone AS cust_phone,
        cohead_shiptoname,
        cohead_shiptoaddress1,
        cohead_shiptoaddress2,
        cohead_shiptoaddress3,
        (cohead_shiptocity || '  ' || cohead_shiptostate || ' ' || cohead_shiptozipcode) AS shiptocitystatezip,
        cohead_number,
        cohead_shipvia,
        cohead_shiptophone,
        cohead_custponumber,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_shipcomments, 
        terms_descrip
-  FROM cust, cohead
+  FROM custinfo
+  LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+  JOIN cohead ON (cohead_cust_id=cust_id)
   LEFT OUTER JOIN terms on (cohead_terms_id=terms_id)
- WHERE ((cohead_cust_id=cust_id)
+ WHERE (cohead_id=<? value("sohead_id") ?>)
 --   AND (cohead_id='9999')
-    AND (cohead_id=<? value("sohead_id") ?>)
 );
 --------------------------------------------------------------------
   
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
        CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(coitem_qtyshipped - coitem_qtyreturned)
             ELSE NULL
        END AS shipped,
        CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned))
             ELSE NULL
        END AS balance,
        CASE WHEN (qtyAtShipping('SO', coitem_id) > 0.0) THEN formatQty(qtyAtShipping('SO', coitem_id))
             ELSE NULL
        END AS atShipping,
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
        
-FROM coitem
+   FROM coitem
      JOIN cohead ON (cohead_id = coitem_cohead_id)
-	 JOIN cust ON (cust_id = cohead_cust_id)
+   JOIN custinfo ON (cust_id = cohead_cust_id)
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
 QUERY: head
 SELECT cust_number,
        formatsobarcode(cohead_id) AS order_barcode,
 
        formataddr(cohead_billtoaddress1, cohead_billtoaddress2, cohead_billtoaddress3, (cohead_billtocity || '  ' ||   cohead_billtostate || '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address, 
 
   formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3, (cohead_shiptocity || '  ' ||   cohead_shiptostate || '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,           
 
-       cust_contact,
+       trim(cntct_first_name || ' ' || cntct_last_name) AS cust_contact,
        cohead_billtoname,
        cohead_billtoaddress1,
        cohead_billtoaddress2,
        cohead_billtoaddress3,
        (cohead_billtocity || '  ' || cohead_billtostate || '  ' || cohead_billtozipcode) AS billtocitystatezip,
-       cust_phone,
+       cntct_phone AS cust_phone,
        cohead_shiptoname,
        cohead_shiptoaddress1,
        cohead_shiptoaddress2,
        cohead_shiptoaddress3,
        (cohead_shiptocity || '  ' || cohead_shiptostate || ' ' || cohead_shiptozipcode) AS shiptocitystatezip,
        cohead_number,
        cohead_shipvia,
        cohead_shiptophone,
        cohead_custponumber,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_shipcomments, 
        terms_descrip
-  FROM cohead, cust, terms
- WHERE ((cohead_cust_id=cust_id)
-   AND (cohead_terms_id=terms_id)
-   AND (cohead_id=<? value("sohead_id") ?>)
-);
+  FROM cohead
+  JOIN custinfo ON (cohead_cust_id=cust_id)
+  LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+  LEFT OUTER JOIN addr ON (cntct_addr_id=addr_id)
+  JOIN terms ON (cohead_terms_id=terms_id)
+ WHERE (cohead_id=<? value("sohead_id") ?>);
 --------------------------------------------------------------------
   
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
        CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(coitem_qtyshipped - coitem_qtyreturned)
             ELSE NULL
        END AS shipped,
        CASE WHEN ((coitem_qtyshipped - coitem_qtyreturned) > 0.0) THEN formatQty(noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned))
             ELSE NULL
        END AS balance,
        CASE WHEN (qtyAtShipping('SO', coitem_id) > 0.0) THEN formatQty(qtyAtShipping('SO', coitem_id))
             ELSE NULL
        END AS atShipping,
-       formatQty(roundUp( ( SELECT COALESCE(SUM(coship_qty), 0)
-                            FROM coship, cosmisc
-                            WHERE ( (coship_coitem_id=coitem_id)
-                              AND (coship_cosmisc_id=cosmisc_id)
-                              AND (NOT cosmisc_shipped) ) )/ CASE WHEN(itemuomratiobytype(item_id, 'Selling') = 0) THEN 1 ELSE itemuomratiobytype(item_id, 'Selling') END ) ) AS shipatshipping,
-       CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM cust,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
+       formatQty(roundUp( ( SELECT COALESCE(SUM(shipitem_qty), 0)
+                            FROM shipitem, shiphead
+                            WHERE ( (shipitem_orderitem_id=coitem_id)
+                              AND (shipitem_shiphead_id=shiphead_id)
+                              AND (NOT shiphead_shipped) ) )/ CASE WHEN(itemuomratiobytype(item_id, 'Selling') = 0) THEN 1 ELSE itemuomratiobytype(item_id, 'Selling') END ) ) AS shipatshipping,
+       CASE WHEN (coitem_status='O' AND (SELECT cust_creditstatus FROM custinfo,cohead WHERE coitem_cohead_id=cohead_id AND cust_id=cohead_cust_id)='H') THEN 'H'
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
    <? endif ?>
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
 GROUP BY coitem_qty_uom_id, coitem_linenumber, coitem_subnumber, coitem_id, coitem_memo, item_number, item_invuom,
          item_descrip1, item_descrip2, coitem_qtyord, coitem_qty_invuomratio, coitem_qtyshipped,
          coitem_qtyreturned, coitem_status, coitem_cohead_id,
          itemsite_id, itemsite_qtyonhand, itemsite_warehous_id, item_id
 ORDER BY linenumber;
 
 --------------------------------------------------------------------
 REPORT: PricesByCustomer
 QUERY: head
 SELECT cust_name,
-       cust_address1,
-       cust_address2,
-       cust_address3,
+       addr_line1 AS cust_address1,
+       addr_line2 AS cust_address2,
+       addr_line3 AS cust_address3,
        <? if exists("showExpired") ?>
          text('Yes')
        <? else ?>
          text('No')
        <? endif ?>
        AS f_showexpired,
        <? if exists("showFuture") ?>
          text('Yes')
        <? else ?>
          text('No')
        <? endif ?>
        AS f_showfuture,
        <? if exists("showCosts") ?>
          <? if exists("actualCosts") ?>
            text('Show Costs and Margins using Actual Costs')
          <? else ?>
            text('Show Costs and Margins using Standard Costs')
          <? endif ?>
          AS f_showcosts,
          text('Cost') AS f_costlabel,
          text('Margin') AS f_marginlabel
        <? else ?>
          text('') AS f_showcosts,
          text('') AS f_costlabel,
          text('') AS f_marginlabel
        <? endif ?>
-   FROM cust
+   FROM custinfo
+   LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+   LEFT OUTER JOIN addr ON (cntct_addr_id=addr_id)
 WHERE (cust_id=<? value("cust_id") ?>);
 
 --------------------------------------------------------------------
   
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
-    FROM ipsass, ipshead, ipsprice, item, cust
+    FROM ipsass, ipshead, ipsprice, item, custinfo
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
          -1 AS qtybreak, (item_listprice - (item_listprice * cust_discntprcnt)) AS price,
          <? if exists("actualCosts") ?>
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
-    FROM item, cust
+    FROM item, custinfo
    WHERE ( (item_sold)
      AND (item_active)
      AND (cust_id=<? value("cust_id") ?>)
      AND (NOT item_exclusive) )
 ) AS data
 ORDER BY itemnumber, price;
 
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
                 (actcost(item_id) * iteminvpricerat(item_id))
               <? else ?>
                 (stdcost(item_id) * iteminvpricerat(item_id))
               <? endif ?>
               AS cost
-         FROM ipsass, ipshead, ipsprice, cust, item
+         FROM ipsass, ipshead, ipsprice, custinfo, item
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
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
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
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
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
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
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
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
-    FROM ipsass, ipshead, ipsprice, cust, shipto, item
+    FROM ipsass, ipshead, ipsprice, custinfo, shiptoinfo, item
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
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
-    FROM ipsass, ipshead, ipsprice, cust, shipto, item
+    FROM ipsass, ipshead, ipsprice, custinfo, shiptoinfo, item
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
            (actcost(item_id) * iteminvpricerat(item_id))
          <? else ?>
            (stdcost(item_id) * iteminvpricerat(item_id))
          <? endif ?>
          AS cost
     FROM item
    WHERE ( (NOT item_exclusive)
      AND (item_id=<? value("item_id") ?>) ) ) AS data
 ORDER BY price;
 
 --------------------------------------------------------------------
 REPORT: PricingScheduleAssignments
 QUERY: detail
 SELECT ipsass_id,
-       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT shipto_num FROM shipto WHERE (shipto_id=ipsass_shipto_id))
+       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT shipto_num FROM shiptoinfo WHERE (shipto_id=ipsass_shipto_id))
             WHEN (COALESCE(LENGTH(ipsass_shipto_pattern), 0) > 0) THEN ipsass_shipto_pattern
             ELSE TEXT('ANY')
        END AS shiptonum,
-       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_number FROM shipto, cust WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
+       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_number FROM shiptoinfo, custinfo WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
             WHEN (ipsass_cust_id=-1) THEN TEXT('Any')
-            ELSE (SELECT cust_number FROM cust WHERE (cust_id=ipsass_cust_id))
+            ELSE (SELECT cust_number FROM custinfo WHERE (cust_id=ipsass_cust_id))
        END AS custnumber,
-       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_name FROM shipto, cust WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
+       CASE WHEN (ipsass_shipto_id != -1) THEN (SELECT cust_name FROM shiptoinfo, custinfo WHERE ((shipto_cust_id=cust_id) AND (shipto_id=ipsass_shipto_id)))
             WHEN (ipsass_cust_id=-1) THEN ''
-            ELSE (SELECT cust_name FROM cust WHERE (cust_id=ipsass_cust_id))
+            ELSE (SELECT cust_name FROM custinfo WHERE (cust_id=ipsass_cust_id))
        END AS custname,
        CASE WHEN (ipsass_cust_id != -1) THEN TEXT('N/A')
             WHEN (ipsass_shipto_id != -1) THEN TEXT('N/A')
             WHEN (COALESCE(LENGTH(ipsass_shipto_pattern),0) > 0) THEN TEXT('N/A')
             WHEN (ipsass_custtype_id=-1) THEN ipsass_custtype_pattern
             ELSE (SELECT custtype_code FROM custtype WHERE (custtype_id=ipsass_custtype_id))
        END AS custtype,
        ipshead_name
 FROM ipsass, ipshead
 WHERE (ipshead_id=ipsass_ipshead_id)
 ORDER BY custname, custtype;
 
 
 --------------------------------------------------------------------
 REPORT: PurchaseOrder
 QUERY: Head
 SELECT pohead_number,
        formatDate(pohead_orderdate) AS f_orderdate,
        pohead_fob,
        pohead_shipvia,
        terms_descrip,
        vend_number,
        vend_name,
-       vend_address1,
-       vend_address2,
-       vend_address3,
-       (vend_city || '  '  || vend_state || '  ' || vend_zip) AS vendcitystatezip,
-       formataddr(vend_address1, vend_address2, vend_address3, (vend_city || '  '  || vend_state || '   ' || vend_zip), vend_country) as vend_address,
        warehous_descrip,
-       addr_line1 as warehous_addr1,
-       addr_line2 as warehous_addr2,
-       addr_line3 as warehous_addr3,
-       addr_city  as warehous_addr4,
-       addr_postalcode as zip,
-       addr_state,
-       addr_country,
-       formataddr(addr_line1, addr_line2, addr_line3, (addr_city || ' ' || addr_state || ' ' || addr_postalcode), addr_country) as warehouse_address,
        pohead_agent_username,
        usr.usr_propername AS username,
        pohead_comments,
        text(<? value("title") ?>) AS title
  FROM pohead
-   LEFT OUTER JOIN usr ON (pohead.pohead_agent_username = usr.usr_username)
-   LEFT OUTER JOIN terms ON (pohead_terms_id = terms_id),
-   vend, whsinfo
-   LEFT OUTER JOIN addr ON (warehous_addr_id = addr_id)
- WHERE ((pohead_vend_id=vend_id)
-   AND (pohead_warehous_id = warehous_id)
-   AND (pohead_id=<? value("pohead_id") ?>) );
+   LEFT OUTER JOIN usr ON (pohead_agent_username = usr_username)
+   LEFT OUTER JOIN terms ON (pohead_terms_id = terms_id)
+   LEFT OUTER JOIN vendinfo ON (pohead_vend_id = vend_id)
+   LEFT OUTER JOIN whsinfo ON (pohead_warehous_id = warehous_id)
+ WHERE (pohead_id=<? value("pohead_id") ?>);
 --------------------------------------------------------------------
   
 QUERY: ShipToAddress
 SELECT pohead_number,
        formatDate(pohead_orderdate) AS f_orderdate,
        pohead_fob,
        pohead_shipvia,
        terms_descrip,
        vend_number,
        vend_name,
-       vend_address1,
-       vend_address2,
-       vend_address3,
-       (vend_city || '  '  || vend_state || '  ' || vend_zip) AS vendcitystatezip,
+       va.addr_line1 AS vend_address1,
+       va.addr_line2 AS vend_address2,
+       va.addr_line3 AS vend_address3,
+       (va.addr_city || '  '  || va.addr_state || '  ' || va.addr_postalcode) AS vendcitystatezip,
        formatcntctname(pohead_vend_cntct_id) AS vend_contact,
        formataddr(pohead_vendaddress1, pohead_vendaddress2, pohead_vendaddress3, (pohead_vendcity || '  '  || pohead_vendstate || '   ' || pohead_vendzipcode), pohead_vendcountry) as vend_address,
        warehous_descrip,
-       addr_line1 as warehous_addr1,
-       addr_line2 as warehous_addr2,
-       addr_line3 as warehous_addr3,
-       addr_city  as warehous_addr4,
-       addr_postalcode as zip,
-       addr_state,
-       addr_country,
+       wa.addr_line1 as warehous_addr1,
+       wa.addr_line2 as warehous_addr2,
+       wa.addr_line3 as warehous_addr3,
+       wa.addr_city  as warehous_addr4,
+       wa.addr_postalcode as zip,
+       wa.addr_state,
+       wa.addr_country,
        formatcntctname(pohead_shipto_cntct_id) AS shipto_contact,
        formataddr(pohead_shiptoaddress1, pohead_shiptoaddress2, pohead_shiptoaddress3, (pohead_shiptocity || ' ' || pohead_shiptostate || ' ' || pohead_shiptozipcode), pohead_shiptocountry) as shipto_address,
        pohead_agent_username AS username,
        pohead_comments,
        text(<? value("title") ?>) AS title
  FROM pohead
    LEFT OUTER JOIN terms ON (pohead_terms_id = terms_id),
-   vend, whsinfo
-   LEFT OUTER JOIN addr ON (warehous_addr_id = addr_id)
+   vendinfo
+   LEFT OUTER JOIN addr va ON (vend_addr_id=va.addr_id),
+   whsinfo
+   LEFT OUTER JOIN addr wa ON (warehous_addr_id = wa.addr_id)
  WHERE ((pohead_vend_id=vend_id)
    AND (pohead_warehous_id = warehous_id)
    AND (pohead_id=<? value("pohead_id") ?>) );
 
 --------------------------------------------------------------------
 REPORT: PurchasePriceVariancesByItem
 QUERY: head
 SELECT item_number, item_descrip1,
        item_descrip2, uom_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
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
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername;
 
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
-             FROM warehous
+             FROM whsinfo
             WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
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
-            from warehous
+            FROM whsinfo
            where warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
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
-             FROM warehous
+             FROM whsinfo
             WHERE warehous_id=<? value("warehous_id") ?>)
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        formatDate(<? value("startDate") ?>) AS startdate,
        formatDate(<? value("endDate") ?>) AS enddate;
 
 --------------------------------------------------------------------
 REPORT: QOH
 QUERY: total
 SELECT SUM(qoh) AS f_qoh,
        SUM(nonnetable) AS f_nonnetable,
        <? if exists("showValue") ?>
          FormatExtPrice(SUM(standardcost * qoh))
        <? else ?>
          ''
        <? endif ?>
        AS f_value,
        <? if exists("showValue") ?>
          FormatExtPrice(SUM(CASE WHEN (itemsite_loccntrl) THEN (standardcost * nonnetable)
                                  ELSE 0
                             END))
        <? else ?>
          ''
        <? endif ?>
        AS f_nonnetvalue
 FROM ( SELECT itemsite_id, itemsite_costmethod,
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
               <? elseif exists("useStandardCosts") ?>
                 stdcost(itemsite_item_id)
               <? else ?>
                 (itemsite_value / CASE WHEN(itemsite_qtyonhand=0) THEN 1 ELSE itemsite_qtyonhand END)
               <? endif ?>
               AS standardcost
-         FROM itemsite, item, uom, warehous, costcat
+         FROM itemsite, item, uom, whsinfo, costcat
         WHERE ((itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
           AND (itemsite_warehous_id=warehous_id)
           AND (itemsite_costcat_id=costcat_id)
           AND (itemsite_active)
 <? if exists("item_id") ?>
           AND (item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("classcode_id") ?>
           AND (item_classcode_id=<? value("classcode_id") ?>)
 <? endif ?>
 <? if exists("classcode_pattern") ?>
           AND (item_classcode_id IN (SELECT classcode_id
                                        FROM classcode
                                       WHERE (classcode_code ~ <? value("classcode_pattern") ?>) ) )
 <? endif ?>
 <? if exists("costcat_id") ?>
           AND (costcat_id=<? value("costcat_id") ?>)
 <? endif ?>
 <? if exists("costcat_pattern") ?>
           AND (costcat_id IN (SELECT costcat_id
                                        FROM costcat
                                       WHERE (costcat_code ~ <? value("costcat_pattern") ?>) ) )
 <? endif ?>
 <? if exists("itemgrp_id") ?>
           AND (item_id IN (SELECT itemgrpitem_item_id FROM itemgrpitem WHERE (itemgrpitem_itemgrp_id=<? value("itemgrp_id") ?>)))
 <? endif ?>
 <? if exists("itemgrp_pattern") ?>
           AND (item_id IN (SELECT itemgrpitem_item_id
                              FROM itemgrpitem, itemgrp
                             WHERE ( (itemgrpitem_itemgrp_id=itemgrp_id)
                               AND (itemgrp_name ~ <? value("itemgrp_pattern") ?>) ) ))
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
 ;
 
 
 --------------------------------------------------------------------
 REPORT: QOHByLocation
 QUERY: head
 SELECT (location_name||'-'||firstLine(location_descrip)) AS f_location,
        formatBoolYN(location_netable) AS f_netable,
        formatBoolYN(location_restrict) AS f_restricted,
        warehous_code,
        formatDate(<? value("asOf") ?>) AS asofdate
-  FROM location, warehous
+  FROM location, whsinfo
  WHERE ((location_warehous_id=warehous_id)
        AND (location_id=<? value("location_id") ?>) );
 
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
        (terms_code||' - '||terms_descrip) as f_terms,
        cust_number,
        quhead_billtoname,
        formatAddr(quhead_billtoaddress1,
                   quhead_billtoaddress2,
                   quhead_billtoaddress3,
                  (quhead_billtocity || ', ' || quhead_billtostate || ' ' || quhead_billtozip),
                   quhead_billtocountry) AS f_billtoaddress,
        CASE WHEN(quhead_shipto_id=-1) THEN text('')
-            ELSE (select text(shipto_num) from shipto where shipto_id=quhead_shipto_id)
+            ELSE (SELECT text(shipto_num) FROM shiptoinfo WHERE (shipto_id=quhead_shipto_id))
        END AS f_shiptonum,
        quhead_shiptoname,
        formatAddr(quhead_shiptoaddress1,
                   quhead_shiptoaddress2,
                   quhead_shiptoaddress3,
                  (quhead_shiptocity || ', ' || quhead_shiptostate || ' ' || quhead_shiptozipcode),
                   quhead_shiptocountry) AS f_shiptoaddress,
        quhead_custponumber,
        quhead_fob
 FROM quhead
-     LEFT OUTER JOIN cust ON (quhead_cust_id = cust_id)
+     LEFT OUTER JOIN custinfo ON (quhead_cust_id = cust_id)
      LEFT OUTER JOIN terms ON (quhead_terms_id = terms_id)
      LEFT OUTER JOIN salesrep ON (quhead_salesrep_id = salesrep_id)
 WHERE (quhead_id = <? value("quhead_id") ?>)
 
 --------------------------------------------------------------------
   
 QUERY: items
 SELECT quitem_id,
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
 FROM quitem
      JOIN item ON (item_id=quitem_item_id)
-     LEFT OUTER JOIN (itemsite JOIN warehous ON (itemsite_warehous_id=warehous_id)) ON (quitem_itemsite_id=itemsite_id)
+     LEFT OUTER JOIN (itemsite JOIN whsinfo ON (itemsite_warehous_id=warehous_id)) ON (quitem_itemsite_id=itemsite_id)
      LEFT OUTER JOIN charass ON ((charass_target_id = quitem_id) 
                             AND (charass_target_type = 'QI'))
      LEFT OUTER JOIN char ON (charass_char_id = char_id)
 WHERE (quitem_quhead_id=<? value("quhead_id") ?>) 
 ORDER BY quitem_linenumber;
 
 --------------------------------------------------------------------
 REPORT: 
 QUERY: GroupHead
 SELECT quhead_number,
        formatDate(quhead_quotedate) AS quotedate,
        cust_number,
        quhead_billtoname AS billtoname,
        quhead_billtoaddress1 AS billtoaddress1,
        quhead_billtoaddress2 AS billtoaddress2,
        quhead_billtoaddress3 AS billtoaddress3,
        (quhead_billtocity || '  ' || quhead_billtostate || '  ' || quhead_billtozip) AS billtocitystatezip,
-       cust_phone,
+       cntct_phone AS cust_phone,
        quhead_shiptoname AS shiptoname,
        quhead_shiptoaddress1 AS shiptoaddress1,
        quhead_shiptoaddress2 AS shiptoaddress2,
        quhead_shiptoaddress3 AS shiptoaddress3,
        (quhead_shiptocity || '  ' || quhead_shiptostate || '  ' || quhead_shiptozipcode) AS shiptocitystatezip,
        quhead_custponumber, quhead_ordercomments,
        quhead_shipvia, terms_descrip
-  FROM quhead, cust, terms
+  FROM quhead, custinfo, terms, cntct
  WHERE ( (quhead_cust_id=cust_id)
+   AND (cust_cntct_id=cntct_id)
    AND (quhead_terms_id=terms_id)
    AND (quhead_id=<? value("quhead_id") ?>) );
 
 --------------------------------------------------------------------
 REPORT: ReceiptsReturnsByDate
 QUERY: head
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate,
        <? if exists("warehous_id") ?>
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
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
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
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
-         (select warehous_code from warehous where warehous_id=<? value("warehous_id") ?>)
+         (SELECT warehous_code FROM whsinfo WHERE warehous_id=<? value("warehous_id") ?>)
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
        <? if exists("showVariances") ?>
          text('Purch. Cost') AS f_purchcost,
          text('Recv. Cost') AS f_recvcost
        <? else ?>
          text('') AS f_purchcost,
          text('') AS f_recvcost
        <? endif ?>
-FROM vend
+FROM vendinfo
 WHERE (vend_id=<? value("vend_id") ?>);
 
 --------------------------------------------------------------------
 REPORT: RejectedMaterialByVendor
 QUERY: head
 SELECT vend_number, vend_name,
        <? if exists("warehous_id") ?>
          (select warehous_code
-            from warehous
+            FROM whsinfo
            where warehous_id=<? value("warehous_id") ?>)
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
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
-  FROM vend
+  FROM vendinfo
  WHERE (vend_id=<? value("vend_id") ?>);
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT poreject_id, poreject_ponumber, vend_name,
        formatDate(poreject_date) as f_date,
        poreject_vend_item_number as f_itemnum,
        poreject_vend_item_descrip as f_itemdescrip,
        formatQty(poreject_qty) as f_qty,
        rjctcode_code as f_rejectcode
-FROM poreject, vend, itemsite, rjctcode
+FROM poreject, vendinfo, itemsite, rjctcode
 WHERE ( (poreject_posted)
  AND (poreject_vend_id=vend_id)
  AND (poreject_rjctcode_id=rjctcode_id)
  AND (poreject_itemsite_id=itemsite_id)
  AND (vend_id=<? value("vend_id") ?>)
  AND (date(poreject_date) BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("agentUsername") ?>
  AND (poreject_agent_username=<? value("agentUsername") ?>)
 <? endif ?>
  )
 ORDER BY poreject_date DESC;
 
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
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse;
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT warehous_code, item_number, item_descrip1, item_descrip2,
        formatDate(reorderdate) AS f_reorderdate,
        formatQty(reorderlevel) AS f_reorderlevel,
        formatQty((itemsite_qtyonhand - qtyAllocated(itemsite_id, reorderdate) + qtyOrdered(itemsite_id, reorderdate))) AS f_projavail,
        reorderdate 
   FROM ( SELECT itemsite_id,
                 CASE WHEN (item_type IN ('M', 'B', 'T')) THEN 1
                      WHEN (item_type IN ('P', 'O')) THEN 2
                      ELSE 3
                 END AS itemtype,
                 warehous_code, item_number, item_descrip1, item_descrip2,
                 reorderDate(itemsite_id, <? value("lookAheadDays") ?>, <? if exists("includePlannedOrder") ?>true<? else ?>false<? endif ?>) AS reorderdate, itemsite_qtyonhand,
                 reorderlevel 
            FROM ( SELECT itemsite_id, itemsite_item_id, itemsite_warehous_id,
                          itemsite_qtyonhand,
                          CASE WHEN(itemsite_useparams) THEN itemsite_reorderlevel ELSE 0.0 END AS reorderlevel
                     FROM itemsite 
                    WHERE ((true)
 <? if exists("warehous_id") ?>
                      AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("plancode_id") ?>
                      AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
                      AND (itemsite_plancode_id IN (SELECT plancode_id
                                                      FROM plancode
                                                     WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
                          )
-                ) AS itemsitedate, item, warehous
+                ) AS itemsitedate, item, whsinfo
           WHERE ((itemsite_item_id=item_id)
             AND (itemsite_warehous_id=warehous_id))
        ) AS data 
  WHERE (reorderdate IS NOT NULL) 
 ORDER BY reorderdate, item_number;
 
 --------------------------------------------------------------------
 REPORT: RunningAvailability
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        warehous_code AS warehouse,
        <? if exists("showPlanned") ?>
          text('Yes')
        <? else ?>
          text('No')
        <? endif ?>
        AS showplnord
-  FROM item, uom, warehous
+  FROM item, uom, whsinfo
  WHERE ((item_id=<? value("item_id") ?>)
    AND (item_inv_uom_id=uom_id)
    AND (warehous_id=<? value("warehous_id") ?>))
 
 --------------------------------------------------------------------
 REPORT: SalesAccountAssignmentsMasterList
 QUERY: detail
 SELECT salesaccnt_id,
        CASE WHEN salesaccnt_warehous_id=-1 THEN 'Any'::TEXT
-            ELSE (SELECT warehous_code FROM warehous WHERE (warehous_id=salesaccnt_warehous_id))
+            ELSE (SELECT warehous_code FROM whsinfo WHERE (warehous_id=salesaccnt_warehous_id))
        END AS warehouscode,
        CASE WHEN salesaccnt_custtype_id=-1 THEN salesaccnt_custtype
             ELSE (SELECT custtype_code FROM custtype WHERE (custtype_id=salesaccnt_custtype_id))
        END AS custtypecode,
        CASE WHEN salesaccnt_prodcat_id=-1 THEN salesaccnt_prodcat
             ELSE (SELECT prodcat_code FROM prodcat WHERE (prodcat_id=salesaccnt_prodcat_id))
        END AS prodcatcode,
        formatGLAccount(salesaccnt_sales_accnt_id) AS salesaccnt,
        formatGLAccount(salesaccnt_credit_accnt_id) AS creditaccnt,
        formatGLAccount(salesaccnt_cos_accnt_id) AS costaccnt,
        formatGLAccount(salesaccnt_returns_accnt_id) AS returnsaccnt,
        formatGLAccount(salesaccnt_cor_accnt_id) AS coraccnt,
        formatGLAccount(salesaccnt_cow_accnt_id) AS cowaccnt
   FROM salesaccnt
 ORDER BY warehouscode, custtypecode, prodcatcode;
 
 --------------------------------------------------------------------
 REPORT: SalesHistory
 QUERY: detail
 SELECT cohist_ordernumber AS sonumber,
        cohist_invcnumber AS invnumber,
        formatDate(cohist_orderdate) AS orddate,
        formatDate(cohist_invcdate, 'Return') AS invcdate,
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
-  FROM cohist JOIN cust ON (cust_id=cohist_cust_id)
+  FROM cohist JOIN custinfo ON (cust_id=cohist_cust_id)
               JOIN salesrep ON (salesrep_id=cohist_salesrep_id)
 <? if exists("includeMisc") ?>
               LEFT OUTER JOIN itemsite ON (itemsite_id=cohist_itemsite_id)
               LEFT OUTER JOIN site() ON (warehous_id=itemsite_warehous_id)
               LEFT OUTER JOIN item ON (item_id=itemsite_item_id)
 <? else ?>
               JOIN itemsite ON (itemsite_id=cohist_itemsite_id)
               JOIN site() ON (warehous_id=itemsite_warehous_id)
               JOIN item ON (item_id=itemsite_item_id)
 <? endif ?>
-<? if exists("shipzone_id") ?>
-              JOIN shiptoinfo ON (shipto_id=cohist_shipto_id)
-              JOIN shipzone ON (shipzone_id=shipto_shipzone_id)
-<? endif ?>
 <? if exists("cohead_id") ?>
               JOIN cohead ON (cohead_number=cohist_ordernumber)
 <? endif ?>
 WHERE ( (true)
 <? if exists("includeMisc") ?>
   AND  (COALESCE(cohist_misc_type, '') <> 'F')
   AND  (COALESCE(cohist_misc_type, '') <> 'T')
 <? endif ?>
 <? if exists("startDate") ?>
   AND  (cohist_invcdate >= <? value("startDate") ?>)
 <? endif ?>
 <? if exists("endDate") ?>
   AND  (cohist_invcdate <= <? value("endDate") ?>)
 <? endif ?>
 <? if exists("shipStartDate") ?>
   AND  (cohist_shipdate >= <? value("shipStartDate") ?>)
 <? endif ?>
 <? if exists("shipEndDate") ?>
   AND  (cohist_shipdate <= <? value("shipEndDate") ?>)
 <? endif ?>
 <? if exists("salesrep_id") ?>
   AND  (cohist_salesrep_id=<? value("salesrep_id") ?>)
 <? endif ?>
 <? if exists("shipto_id") ?>
   AND  (cohist_shipto_id=<? value("shipto_id") ?>)
 <? endif ?>
 <? if exists("billToName") ?>
   AND  (UPPER(cohist_billtoname) ~ UPPER(<? value("billToName") ?>))
 <? endif ?>
 <? if exists("cust_id") ?>
   AND  (cohist_cust_id=<? value("cust_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?>
   AND  (cust_custtype_id=<? value("custtype_id") ?>)
 <? elseif exists("custtype_pattern") ?>
   AND  (cust_custtype_id IN (SELECT DISTINCT custtype_id
                              FROM custtype
                              WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
 <? if exists("by_custgrp" ?>
   AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                    FROM custgrpitem))
 <? endif ?>
 <? if exists("custgrp_id") ?>
   AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                    FROM custgrpitem
                    WHERE (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)))
 <? endif ?>
 <? if exists("custgrp_pattern") ?>
   AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
                    FROM custgrp, custgrpitem
                    WHERE ( (custgrpitem_custgrp_id=custgrp_id)
                      AND   (custgrp_name ~ <? value("custgrp_pattern") ?>) )) )
 <? endif ?>
 
 <? if exists("item_id") ?>
   AND  (itemsite_item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
   AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
   AND (item_prodcat_id IN (SELECT DISTINCT prodcat_id
                            FROM prodcat
                            WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 
 <? if exists("warehous_id") ?>
   AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("shipzone_id") ?>
-  AND (shipzone_id=<? value("shipzone_id") ?>)
+  AND (cohist_shipzone_id=<? value("shipzone_id") ?>)
+<? endif ?>
+<? if exists("saletype_id") ?>
+  AND (cohist_saletype_id=<? value("saletype_id") ?>)
 <? endif ?>
 <? if exists("cohead_id") ?>
   AND (cohead_id=<? value("cohead_id") ?>)
 <? endif ?>
       )
 ORDER BY cohist_invcdate, item_number
 
 --------------------------------------------------------------------
 REPORT: SalesOrderAcknowledgement
 QUERY: head
 SELECT cust_number,
        formatsobarcode(cohead_id) AS order_barcode,
 
        formataddr(cohead_billtoaddress1, cohead_billtoaddress2, cohead_billtoaddress3, (cohead_billtocity || '  ' ||   cohead_billtostate || '  ' || cohead_billtozipcode), cohead_billtocountry) AS billing_address, 
 
   formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3, (cohead_shiptocity || '  ' ||   cohead_shiptostate || '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,           
 
-       cust_contact,
+       trim(cntct_first_name || ' ' || cntct_last_name) AS cust_contact,
        cohead_billtoname,
        cohead_billtoaddress1,
        cohead_billtoaddress2,
        cohead_billtoaddress3,
        (cohead_billtocity || '  ' || cohead_billtostate || '  ' || cohead_billtozipcode) AS billtocitystatezip,
-       cust_phone,
+       cntct_phone AS cust_phone,
        cohead_shiptoname,
        cohead_shiptoaddress1,
        cohead_shiptoaddress2,
        cohead_shiptoaddress3,
        (cohead_shiptocity || '  ' || cohead_shiptostate || ' ' || cohead_shiptozipcode) AS shiptocitystatezip,
        cohead_number,
        cohead_shipvia,
        cohead_shiptophone,
        cohead_custponumber,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_shipcomments, 
        terms_descrip
-  FROM cohead, cust, terms
+  FROM cohead, custinfo, terms, cntct
  WHERE ((cohead_cust_id=cust_id)
+   AND (cust_cntct_id=cntct_id)
    AND (cohead_terms_id=terms_id)
    AND (cohead_id=<? value("sohead_id") ?>)
 );
 
 --------------------------------------------------------------------
 REPORT: SalesOrderStatus
 QUERY: detail
 SELECT 
        --the following line was added for version 2.3:
        (select uom_name from uom where uom_id = coitem_qty_uom_id) AS uom_orderuom,
        coitem_linenumber,
        item_number, item_descrip1,
        item_descrip2,
        warehous_code,
        formatQty(coitem_qtyord) AS qtyord,
        formatQty(coitem_qtyshipped) AS qtyship,
        formatQty(coitem_qtyreturned) AS qtyret,
-       formatQty(SUM(COALESCE(coship_qty, 0))) AS qtyinvcd,
+       formatQty(SUM(COALESCE(shipitem_qty, 0))) AS qtyinvcd,
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
-  FROM itemsite, item, warehous, coitem LEFT OUTER JOIN
-       coship ON (coship_coitem_id=coitem_id
-              AND coship_invcitem_id IS NOT NULL)  
+  FROM itemsite, item, whsinfo, coitem LEFT OUTER JOIN
+       shipitem ON (shipitem_orderitem_id=coitem_id
+              AND shipitem_invcitem_id IS NOT NULL)  
  WHERE ((coitem_itemsite_id=itemsite_id)
    AND (coitem_status<>'X')
    AND (itemsite_item_id=item_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
 GROUP BY uom_orderuom,
          coitem_id, coitem_linenumber, item_number,
          item_descrip1, item_descrip2, warehous_code,
          coitem_qtyord, coitem_qtyshipped, coitem_status,
          coitem_closedate, coitem_close_username,
          coitem_qtyreturned, coitem_order_id,
          coitem_order_type
 ORDER BY coitem_linenumber;
 --------------------------------------------------------------------
   
 QUERY: head
 SELECT cohead_number,
        formatDate(cohead_orderdate) AS orderdate,
        cohead_custponumber,
-       cust_name, cust_phone 
-  FROM cohead, cust 
+       cust_name, cntct_phone AS cust_phone
+  FROM cohead, custinfo, cntct
  WHERE ((cohead_cust_id=cust_id)
+   AND (cust_cntct_id=cntct_id)
    AND (cohead_id=<? value("sohead_id") ?>)
 );
 
 --------------------------------------------------------------------
 REPORT: SelectPaymentsList
 QUERY: detail
 SELECT apopen_id, apselectid, vendor, apopen_docnumber, apopen_ponumber,
               formatDate(apopen_duedate) AS f_duedate,
               formatDate(apopen_docdate) AS f_docdate,
               formatMoney(amount) AS f_amount,
               f_selected, f_late, status
  FROM (SELECT apopen_id, COALESCE(apselect_id, -1) AS apselectid,
        (vend_number || '-' || vend_name) AS vendor,
        apopen_docnumber, apopen_ponumber,
        apopen_duedate, apopen_docdate,
        (apopen_amount - apopen_paid -
                    COALESCE((SELECT SUM(checkitem_amount / checkitem_curr_rate)
                              FROM checkitem, checkhead
                              WHERE ((checkitem_checkhead_id=checkhead_id)
                               AND (checkitem_apopen_id=apopen_id)
                               AND (NOT checkhead_void)
                               AND (NOT checkhead_posted))
                            ), 0)) AS amount,
        formatMoney(COALESCE(SUM(apselect_amount), 0)) AS f_selected,
        formatBoolYN(apopen_duedate <= CURRENT_DATE) AS f_late,
        CASE WHEN (apopen_status='O') THEN TEXT('Open')
                     ELSE CASE WHEN (apopen_status='H') THEN TEXT('On Hold')
                       ELSE CASE WHEN (apopen_status='C') THEN TEXT('Close')
                       END
                     END
                   END AS status
-  FROM vend, apopen LEFT OUTER JOIN apselect ON (apselect_apopen_id=apopen_id)
+  FROM vendinfo, apopen LEFT OUTER JOIN apselect ON (apselect_apopen_id=apopen_id)
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
          apopen_duedate, apopen_docdate, apopen_amount, apopen_paid, apopen_curr_id, apopen_status) AS data
  WHERE (amount <> 0.0)
 ORDER BY apopen_duedate, amount DESC;
 --------------------------------------------------------------------
   
 QUERY: head
 SELECT <? if exists("vend_id") ?>
          ( SELECT vend_name
-             FROM vend
+             FROM vendinfo
             WHERE (vend_id=<? value("vend_id") ?>) )
        <? elseif exists("vendtype_id") ?>
          ( SELECT (vendtype_code || '-' || vendtype_descrip)
              FROM vendtype
             WHERE (vendtype_id=<? value("vendtype_id") ?>) )
        <? elseif exists("vendtype_pattern") ?>
          text(<? value("vendtype_pattern") ?>)
        <? else ?>
          text('All Vendors')
        <? endif ?>
        AS f_value,
        <? if reExists("vendtype_.*") ?>
          text('Vendor Type:')
        <? else ?>
          text('Vendor:')
        <? endif ?>
        AS f_label;
        
 
 --------------------------------------------------------------------
 REPORT: SelectedPaymentsList
 QUERY: detail
 SELECT apopen_id, apselect_id,
        (bankaccnt_name || '-' || bankaccnt_descrip) AS bankaccnt,
        (vend_number || '-' || vend_name) AS vendor,
        apopen_docnumber,
        apopen_ponumber,
        formatMoney(apselect_amount) AS f_selected
-  FROM apselect, apopen, vend, bankaccnt
+  FROM apselect, apopen, vendinfo, bankaccnt
  WHERE ((apopen_vend_id=vend_id)
    AND (apselect_apopen_id=apopen_id)
    AND (apselect_bankaccnt_id=bankaccnt_id)
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
 ORDER BY bankaccnt_name, vend_number, apopen_docnumber;
 
 --------------------------------------------------------------------
 REPORT: ShipToMasterList
 QUERY: head
 SELECT cust_number, cust_name
-   FROM cust
+   FROM custinfo
 WHERE (cust_id=<? value("cust_id") ?>);
     
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT shipto_num as num,
        shipto_name as name,
-       shipto_address1 AS address,
-       (shipto_city || ', ' || shipto_state || '  ' || shipto_zipcode)  AS citystatezip
-  FROM shipto 
+       addr_line1 AS address,
+       (addr_city || ', ' || addr_state || '  ' || addr_postalcode)  AS citystatezip
+  FROM shiptoinfo
+  LEFT OUTER JOIN addr ON (shipto_addr_id=addr_id)
  WHERE (shipto_cust_id=<? value("cust_id") ?>) 
 ORDER BY shipto_num;
 
 --------------------------------------------------------------------
 REPORT: ShipmentsByDate
 QUERY: detail
 SELECT shiphead_id, lineitem_id,
        CASE WHEN (level=0) THEN order_number
             ELSE item_number
        END AS order_item,
        CASE WHEN (level=0) THEN customer
             ELSE itemdescription
        END AS cust_desc,
        shiphead_order_type,
        shiphead_number, 
        order_number, 
        customer,
        shiphead_shipdate AS f_shipdate,
        shiphead_tracknum,
        shiphead_freight,
        freight_curr_abbr,
        linenumber,
        item_number,
        itemdescription,
        warehous_code,
        formatQty(qtyord) AS f_qtyord,
        formatQty(qtyshipped) AS f_qtyshipped
 FROM (
 SELECT shiphead_id, coitem_id AS lineitem_id, cohead_number AS sortkey1, shiphead_number AS sortkey2, 1 AS level,
        shiphead_order_type,
        shiphead_number,
        cohead_number AS order_number, 
        (cust_number || '-' || cust_name) AS customer,
        shiphead_shipdate,
        shiphead_tracknum,
        shiphead_freight,
        currConcat(shiphead_freight_curr_id) AS freight_curr_abbr, 
        coitem_linenumber AS linenumber, item_number,
        (item_descrip1 || ' ' || item_descrip2) AS itemdescription,
        warehous_code,
        coitem_qtyord AS qtyord,
        SUM(shipitem_qty) AS qtyshipped
-FROM shipitem, shiphead, coitem, cohead, cust, itemsite, item, warehous 
+FROM shipitem, shiphead, coitem, cohead, custinfo, itemsite, item, whsinfo
 WHERE ( (shipitem_shiphead_id=shiphead_id)
  AND (shipitem_orderitem_id=coitem_id)
  AND (coitem_itemsite_id=itemsite_id)
  AND (coitem_status <> 'X')
  AND (itemsite_item_id=item_id)
  AND (itemsite_warehous_id=warehous_id)
  AND (shiphead_order_id=cohead_id)
  AND (cohead_cust_id=cust_id)
  AND (shiphead_shipped)
  AND (shiphead_order_type='SO')
 <? if exists("startDate") ?>
  AND (shiphead_shipdate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>)
 <? endif ?>
 <? if exists("sohead_id") ?>
  AND (cohead_id = <? value("sohead_id") ?>)
 <? endif ?>
 <? if exists("shiphead_id") ?>
  AND (shiphead_id = <? value("shiphead_id") ?>)
 <? endif ?>
       ) 
 GROUP BY shiphead_id, coitem_id, shiphead_order_type, shiphead_number,
          cohead_number, cust_number, cust_name, shiphead_shipdate,
          coitem_linenumber, item_number, item_descrip1, item_descrip2,
          warehous_code, shiphead_tracknum, coitem_qtyord, 
          shiphead_freight, shiphead_freight_curr_id 
 <? if exists("MultiWhs") ?>
 UNION
 SELECT shiphead_id, toitem_id AS lineitem_id, tohead_number AS sortkey1, shiphead_number AS sortkey2, 1 AS level,
        shiphead_order_type,
        shiphead_number,
        tohead_number AS order_number, 
        tohead_destname AS customer,
        shiphead_shipdate,
        shiphead_tracknum,
        shiphead_freight,
        currConcat(shiphead_freight_curr_id) AS freight_curr_abbr, 
        toitem_linenumber AS linenumber, item_number,
        (item_descrip1 || ' ' || item_descrip2) AS itemdescription,
        tohead_srcname AS warehous_code,
        toitem_qty_ordered AS qtyord,
        SUM(shipitem_qty) AS qtyshipped
 FROM shipitem, shiphead, toitem, tohead, item 
 WHERE ( (shipitem_shiphead_id=shiphead_id)
  AND (shipitem_orderitem_id=toitem_id)
  AND (toitem_status <> 'X')
  AND (toitem_item_id=item_id)
  AND (shiphead_order_id=tohead_id)
  AND (shiphead_shipped)
  AND (shiphead_order_type='TO')
 <? if exists("startDate") ?>
  AND (shiphead_shipdate BETWEEN <? value("startDate") ?> and <? value("endDate") ?>)
 <? endif ?>
 <? if exists("tohead_id") ?>
  AND (tohead_id = <? value("tohead_id") ?>)
 <? endif ?>
 <? if exists("shiphead_id") ?>
  AND (shiphead_id = <? value("shiphead_id") ?>)
 <? endif ?>
       ) 
 GROUP BY shiphead_id, toitem_id, shiphead_order_type, shiphead_number,
          tohead_number, tohead_destname, shiphead_shipdate,
          toitem_linenumber, item_number, item_descrip1, item_descrip2,
          tohead_srcname, shiphead_tracknum, toitem_qty_ordered, 
          shiphead_freight, shiphead_freight_curr_id 
 <? endif ?>
    ) AS data
 ORDER BY sortkey1, sortkey2, level, linenumber DESC;
 
 
 --------------------------------------------------------------------
 REPORT: ShipmentsBySalesOrder
 QUERY: head
 SELECT cohead_number as f_sonumber,
        formatDate(cohead_orderdate) AS f_orderdate,
        cohead_custponumber AS f_ponumber,
        cust_name as f_custname,
-       cust_phone as f_custphone
-FROM cohead, cust
+       cntct_phone AS f_custphone
+FROM cohead, custinfo, cntct
 WHERE ((cohead_cust_id=cust_id)
+ AND (cust_cntct_id=cntct_id)
  AND (cohead_id=<? value("sohead_id") ?>));
 --------------------------------------------------------------------
   
 QUERY: detail
-SELECT cosmisc_id,
+SELECT shiphead_id,
        coitem_id,
-       formatShipmentNumber(cosmisc_id) AS cosmisc_number,
-       formatDate(cosmisc_shipdate) AS f_shipdate,
+       formatShipmentNumber(shiphead_id) AS shiphead_number,
+       formatDate(shiphead_shipdate) AS f_shipdate,
        coitem_linenumber,
        item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
        warehous_code,
        formatQty(coitem_qtyord) AS f_qtyord,
-       formatQty(SUM(coship_qty)) AS f_qtyshipped
-  FROM coship, cosmisc, coitem, itemsite, item, uom, warehous
- WHERE ( (coship_cosmisc_id=cosmisc_id)
-   AND (coship_coitem_id=coitem_id)
-   AND (cosmisc_shipped)
+       formatQty(SUM(shipitem_qty)) AS f_qtyshipped
+  FROM shipitem, shiphead, coitem, itemsite, item, uom, whsinfo
+ WHERE ( (shipitem_shiphead_id=shiphead_id)
+   AND (shiphead_order_type='SO')
+   AND (shipitem_orderitem_id=coitem_id)
+   AND (shiphead_shipped)
    AND (coitem_itemsite_id=itemsite_id)
    AND (coitem_status<>'X')
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (coitem_cohead_id=<? value("sohead_id") ?>)
 )
-GROUP BY cosmisc_id, coitem_id,
-         cosmisc_shipdate, coitem_linenumber,
+GROUP BY shiphead_id, coitem_id,
+         shiphead_shipdate, coitem_linenumber,
          item_number, item_descrip1, item_descrip2,
          uom_name, warehous_code, coitem_qtyord
-ORDER BY cosmisc_id DESC, coitem_linenumber DESC;
+ORDER BY shiphead_id DESC, coitem_linenumber DESC;
 
 --------------------------------------------------------------------
 REPORT: ShipmentsByShipment
 QUERY: head
 SELECT shiphead_number AS f_shipnumber,
        shiphead_tracknum AS f_tracknum,
        formatMoney(shiphead_freight) AS freight,
        ordernumber AS f_sonumber,
        formatDate(orderdate) AS f_orderdate,
        custponumber AS f_ponumber,
        cust_name AS f_custname,
-       cust_phone AS f_custphone
-  FROM cust, (SELECT shiphead_number,
+       cntct_phone AS f_custphone
+  FROM custinfo JOIN cntct ON (cust_cntct_id=cntct_id), (SELECT shiphead_number,
                      shiphead_tracknum,
                      shiphead_freight,
                      cohead_number AS ordernumber,
                      cohead_cust_id AS order_cust_id,
                      cohead_orderdate AS orderdate,
                      cohead_custponumber AS custponumber
                 FROM cohead JOIN shiphead ON (shiphead_order_id=cohead_id AND shiphead_order_type='SO')
                WHERE(shiphead_id=<? value("shiphead_id") ?>)
               UNION
               SELECT shiphead_number,
                      shiphead_tracknum,
                      shiphead_freight,
                      tohead_number AS ordernumber,
                      NULL AS order_cust_id,
                      tohead_orderdate AS orderdate,
                      NULL AS custponumber
                 FROM tohead JOIN shiphead ON (shiphead_order_id=tohead_id AND shiphead_order_type='TO')
                WHERE(shiphead_id=<? value("shiphead_id") ?>) 
              ) AS taborder
  WHERE(order_cust_id=cust_id);
 
 
 --------------------------------------------------------------------
 REPORT: ShipmentsPending
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse;
 
 
 --------------------------------------------------------------------
 REPORT: ShippingLabelsByInvoice
 QUERY: detail
 SELECT sequence_value,
        invchead_invcnumber,
        cust_number,
        invchead_ordernumber,
        invchead_ponumber,
        invchead_shipto_name,
        invchead_shipto_address1,
        invchead_shipto_address2,
        invchead_shipto_address3,
        (COALESCE(invchead_shipto_city,'') || ' ' || COALESCE(invchead_shipto_state,'') || ' ' || COALESCE(invchead_shipto_zipcode,'')) AS citystatezip
-  FROM invchead, cust, sequence
+  FROM invchead, custinfo, sequence
  WHERE ( (invchead_cust_id=cust_id)
    AND (sequence_value BETWEEN <? value("labelFrom") ?> AND <? value("labelTo") ?>)
    AND (invchead_id=<? value("invchead_id") ?>) );
        
 
 --------------------------------------------------------------------
 REPORT: ShippingLabelsBySo
 QUERY: detail
 SELECT sequence_value,
        cust_number,
        cohead_number,
 
 formataddr(cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3, (cohead_shiptocity || '  ' ||   cohead_shiptostate || '  ' || cohead_shiptozipcode), cohead_shiptocountry) AS shipping_address,           
 
 
        cohead_custponumber,
        cohead_shiptoname,
        cohead_shiptoaddress1,
        cohead_shiptoaddress2,
        cohead_shiptoaddress3,
        (COALESCE(cohead_shiptocity,'') || ' ' || COALESCE(cohead_shiptostate,'') || ' ' || COALESCE(cohead_shiptozipcode,'')) AS citystatezip
-FROM cohead, cust, sequence
+FROM cohead, custinfo, sequence
 WHERE ( (cohead_cust_id=cust_id)
  AND (sequence_value BETWEEN <? value("labelFrom") ?> AND <? value("labelTo") ?>)
  AND (cohead_id=<? value("sohead_id") ?>) )
 LIMIT <? value("labelTo") ?>;
        
 
 --------------------------------------------------------------------
 REPORT: SlowMovingInventoryByClassCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          (SELECT warehous_code
-            FROM warehous
+            FROM whsinfo
            WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
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
   
 QUERY: detail
 SELECT warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        uom_name,
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
                 item_descrip2, uom_name,
                 itemsite_qtyonhand,
                 itemsite_datelastused,
                 <? if exists("useActualCosts") ?>
                   actcost(itemsite_item_id)
                 <? else ?>
                   stdcost(itemsite_item_id)
                 <? endif ?>
                 AS cost
-           FROM itemsite, item, warehous, uom
+           FROM itemsite, item, whsinfo, uom
           WHERE ((itemsite_item_id=item_id)
             AND (item_inv_uom_id=uom_id)
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
 REPORT: StandardBOL
 QUERY: head
-SELECT cosmisc_shipvia, formatDate(cosmisc_shipdate) AS shipdate,
+SELECT shiphead_shipvia, formatDate(shiphead_shipdate) AS shipdate,
                 cust_name, cust_number, cohead_number, cohead_fob, cohead_custponumber,
-                warehous_descrip, warehous_addr1, warehous_addr2, warehous_addr3, warehous_addr4, warehous_fob,
+                warehous_descrip, addr_line1 AS warehous_addr1, addr_line2 AS warehous_addr2, addr_line3 AS warehous_addr3, addr_city AS warehous_addr4, warehous_fob,
                 cohead_shiptoname, cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3,
                 (cohead_shiptocity || ' ' || cohead_shiptostate || ' ' || cohead_shiptozipcode) AS shiptocitystatezip,
                 cohead_shiptophone
-         FROM cosmisc, cohead, warehous, cust
-         WHERE ((cosmisc_cohead_id=cohead_id)
+         FROM shiphead, cohead, whsinfo, custinfo
+         LEFT OUTER JOIN addr ON (warehous_addr_id=addr_id)
+         WHERE ((shiphead_order_id=cohead_id)
           AND (cohead_cust_id=cust_id)
           AND (cohead_warehous_id=warehous_id)
-          AND (cosmisc_id=%1));
+          AND (shiphead_id=%1));
 --------------------------------------------------------------------
   
 QUERY: detail
-SELECT coitem_linenumber, formatQty(SUM(coship_qty)) AS invqty, uom_name, roundUp(SUM(coship_qty) / itemuomratiobytype(item_id, 'Selling'))::integer AS shipqty,
+SELECT coitem_linenumber, formatQty(SUM(shipitem_qty)) AS invqty, uom_name, roundUp(SUM(shipitem_qty) / itemuomratiobytype(item_id, 'Selling'))::integer AS shipqty,
                 itemsellinguom(item_id) AS shipuom, item_number, item_descrip1, item_descrip2,
-                formatQty(SUM(coship_qty) * item_prodweight) AS netweight,
-                formatQty(SUM(coship_qty) * (item_prodweight + item_packweight)) AS grossweight
-         FROM coship, coitem, itemsite, item, uom
-         WHERE ((coship_coitem_id=coitem_id)
+                formatQty(SUM(shipitem_qty) * item_prodweight) AS netweight,
+                formatQty(SUM(shipitem_qty) * (item_prodweight + item_packweight)) AS grossweight
+         FROM shipitem, coitem, itemsite, item, uom
+         WHERE ((shipitem_orderitem_id=coitem_id)
           AND (coitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
           AND (item_inv_uom_id=uom_id)
-          AND (coship_cosmisc_id=%1))
+          AND (shipitem_shiphead_id=%1))
          GROUP BY coitem_linenumber, item_number, uom_name, shipuom,
                   item_descrip1, item_descrip2, item_prodweight, item_packweight
          ORDER BY coitem_linenumber;
     
 --------------------------------------------------------------------
   
 QUERY: foot
-SELECT formatQty(SUM(coship_qty * item_prodweight)) AS netweight,
-                formatQty(SUM(coship_qty * (item_prodweight + item_packweight))) AS grossweight,
+SELECT formatQty(SUM(shipitem_qty * item_prodweight)) AS netweight,
+                formatQty(SUM(shipitem_qty * (item_prodweight + item_packweight))) AS grossweight,
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
-         FROM coship, coitem, itemsite, item
-         WHERE ((coship_coitem_id=coitem_id)
+         FROM shipitem, coitem, itemsite, item
+         WHERE ((shipitem_orderitem_id=coitem_id)
           AND (coitem_itemsite_id=itemsite_id)
           AND (itemsite_item_id=item_id)
-          AND (coship_cosmisc_id=%1));
+          AND (shipitem_shiphead_id=%1));
 --------------------------------------------------------------------
   
 QUERY: notes
-SELECT cosmisc_notes
-         FROM cosmisc
-         WHERE (cosmisc_id=%1);
+SELECT shiphead_notes
+         FROM shiphead
+         WHERE (shiphead_id=%1);
 
 --------------------------------------------------------------------
 REPORT: Statement
 QUERY: detail
 SELECT CASE WHEN (araging_doctype = 'I') THEN <? value("invoice") ?>
-            WHEN (araging_doctype = 'D') THEN <? value("debitMemo") ?>
-            WHEN (araging_doctype = 'C') THEN <? value("creditMemo") ?>
+            WHEN (araging_doctype = 'D') THEN <? value("debit") ?>
+            WHEN (araging_doctype = 'C') THEN <? value("credit") ?>
             WHEN (araging_doctype = 'R') THEN <? value("deposit") ?>
             ELSE 'Misc.'
        END AS doctype,
        araging_docnumber AS f_docnumber,
        formatDate(CAST(araging_docdate AS DATE)) AS f_docdate,
        CASE WHEN (araging_doctype IN ('I','C','D')) THEN formatDate(araging_duedate)
             ELSE ''
        END AS f_duedate,
        formatMoney(araging_aropen_amount) AS f_amount,
        formatMoney(araging_aropen_amount - araging_total_val) AS f_applied,
        formatMoney(araging_total_val) AS f_balance
 FROM araging(<? value("asofdate") ?>, true, false)
 WHERE ((araging_cust_id = <? value("cust_id") ?>)
    AND (abs(araging_aropen_amount) > 0)
       )
 ORDER BY araging_duedate;
 --------------------------------------------------------------------
   
 QUERY: head
-SELECT cust_name, cust_address1, cust_address2, cust_address3,
-       (cust_city || '  ' || cust_state || '  ' || cust_zipcode) AS citystatezip,
+SELECT cust_name, addr_line1 AS cust_address1, addr_line2 AS cust_address2, addr_line3 AS cust_address3,
+       (addr_city || '  ' || addr_state || '  ' || addr_postalcode) AS citystatezip,
        formatDate(COALESCE(<? value("asofdate") ?>, current_date)) AS asofdate
-FROM cust
+FROM custinfo
+LEFT OUTER JOIN cntct ON (cust_cntct_id=cntct_id)
+LEFT OUTER JOIN addr ON (cntct_addr_id=addr_id)
 WHERE (cust_id = <? value("cust_id") ?>);
 --------------------------------------------------------------------
   
 QUERY: Currency
 SELECT currconcat(cust_curr_id) AS currAbbr
-  FROM cust
+  FROM custinfo
  WHERE (cust_id=<? value("cust_id") ?>)
 
 
 --------------------------------------------------------------------
 REPORT: SubstituteAvailabilityByRootItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT warehous_code,
        item_number,
        item_descrip1,
        item_descrip2,
        formatQty(sub.itemsite_qtyonhand) AS f_qtyonhand,
        formatQty(CASE WHEN(sub.itemsite_useparams) THEN sub.itemsite_reorderlevel ELSE 0.0 END) AS f_reorderlevel,
        sub.itemsite_leadtime as leadtime,
 <? if exists("byDays") ?>
        formatQty(qtyAllocated(sub.itemsite_id, <? value("byDays") ?>)) AS f_allocated,
        formatQty(qtyOrdered(sub.itemsite_id, <? value("byDays") ?>)) AS f_ordered,
        formatQty(sub.itemsite_qtyonhand + qtyOrdered(sub.itemsite_id, <? value("byDays") ?>) - qtyAllocated(sub.itemsite_id, <? value("byDays") ?>)) as f_avail
 <? elseif exists("byDate") ?>
        formatQty(qtyAllocated(sub.itemsite_id, (<? value("byDate") ?> - CURRENT_DATE))) AS f_allocated,
        formatQty(qtyOrdered(sub.itemsite_id, (<? value("byDate") ?> - CURRENT_DATE))) AS f_ordered,
        formatQty(sub.itemsite_qtyonhand + qtyOrdered(sub.itemsite_id, (<? value("byDate") ?> - CURRENT_DATE)) - qtyAllocated(sub.itemsite_id, (<? value("byDate") ?> - CURRENT_DATE))) as f_avail
 <? else ?>
        formatQty(qtyAllocated(sub.itemsite_id, sub.itemsite_leadtime)) AS f_allocated,
        formatQty(qtyOrdered(sub.itemsite_id, sub.itemsite_leadtime)) AS f_ordered,
        formatQty(sub.itemsite_qtyonhand + qtyOrdered(sub.itemsite_id, sub.itemsite_leadtime) - qtyAllocated(sub.itemsite_id, sub.itemsite_leadtime)) as f_avail
 <? endif ?>
-  FROM item, itemsite AS sub, itemsite AS root, warehous, itemsub
+  FROM item, itemsite AS sub, itemsite AS root, whsinfo, itemsub
  WHERE ((sub.itemsite_item_id=item_id)
    AND (root.itemsite_item_id=itemsub_parent_item_id)
    AND (sub.itemsite_item_id=itemsub_sub_item_id)
    AND (root.itemsite_warehous_id=sub.itemsite_warehous_id)
    AND (sub.itemsite_warehous_id=warehous_id)
    AND (root.itemsite_item_id=<? value("item_id") ?>)
 <? if exists("warehous_id") ?>
    AND (root.itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY itemsub_rank;
 
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
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
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
-       formatShipmentNumber(cosmisc_id) AS cosmisc_number,
-       CASE WHEN (cosmisc_shipped IS NULL) THEN text('')
-            WHEN (cosmisc_shipped) THEN text('Yes')
-            WHEN (NOT cosmisc_shipped) THEN text('No')
+       formatShipmentNumber(shiphead_id) AS shiphead_number,
+       CASE WHEN (shiphead_shipped IS NULL) THEN text('')
+            WHEN (shiphead_shipped) THEN text('Yes')
+            WHEN (NOT shiphead_shipped) THEN text('No')
        END AS shipstatus,
-       COALESCE(cosmisc_shipvia, '') AS shipvia,
-       CASE WHEN (cosmisc_shipdate IS NULL) THEN text('')
-            ELSE formatDate(cosmisc_shipdate)
+       COALESCE(shiphead_shipvia, '') AS shipvia,
+       CASE WHEN (shiphead_shipdate IS NULL) THEN text('')
+            ELSE formatDate(shiphead_shipdate)
        END AS shipdate
-  FROM coitem, itemsite, item, cust, 
-       cohead LEFT OUTER JOIN cosmisc ON (cosmisc_cohead_id=cohead_id) 
+  FROM coitem, itemsite, item, custinfo,
+       cohead LEFT OUTER JOIN shiphead ON (shiphead_order_id=cohead_id AND shiphead_order_type='SO') 
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
-         cohead_orderdate, cohead_packdate, cosmisc_shipped,
-         cosmisc_shipvia, cosmisc_shipdate, cosmisc_id
+         cohead_orderdate, cohead_packdate, shiphead_shipped,
+         shiphead_shipvia, shiphead_shipdate, shiphead_id
 ORDER BY 
 <? if exists("orderByShipDate") ?>
   scheddate,
 <? elseif exists("orderByPackDate") ?>
   cohead_packdate,
 <? endif ?>
-cohead_number, cosmisc_shipped;
+cohead_number, shiphead_shipped;
 --------------------------------------------------------------------
   
 QUERY: totals
 SELECT
 <? if exists("showPrices") ?>
        formatMoney( SUM( sales ) ) AS f_sales,
        formatCost( SUM( cost ) ) AS f_cost,
        formatMoney( SUM( margin ) ) AS f_margin
   FROM (
 SELECT SUM( round((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
                          (coitem_price / coitem_price_invuomratio),2) ) AS sales,
        SUM((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) * stdcost(item_id) ) AS cost,
        SUM((noNeg(coitem_qtyord - coitem_qtyshipped + coitem_qtyreturned) * coitem_qty_invuomratio) *
                          ((coitem_price / coitem_price_invuomratio) - stdcost(item_id)) ) AS margin
-  FROM coitem, itemsite, item, cust, 
+  FROM coitem, itemsite, item, custinfo,
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
 REPORT: SummarizedSalesHistory
-QUERY: head
-SELECT <? if exists("warehous_id") ?>
-         ( SELECT warehous_code
-             FROM warehous
-            WHERE warehous_id=<? value("warehous_id") ?>)
-       <? else ?>
-         text('All Sites')
-       <? endif ?>
-       AS warehouse,
-       <? if exists("prodcat_id") ?>
-         ( SELECT (prodcat_code||'-'||prodcat_descrip)
-             FROM prodcat
-            WHERE prodcat_id=<? value("prodcat_id") ?>)
-       <? elseif exists("prodcat_pattern") ?>
-         text(<? value("prodcat_pattern") ?>)
-       <? else ?>
-         text('All Categories')
-       <? endif ?>
-       AS prodcat,
-       formatDate(<? value("startDate") ?>) AS startdate,
-       formatDate(<? value("endDate") ?>) AS enddate;
---------------------------------------------------------------------
-  
 QUERY: detail
-SELECT 1 AS dummy,
-<? foreach("groupLitList") ?>
-  <? literal("groupLitList") ?>
-  <? if not isLast("groupLitList") ?>
-  || E'\n' || 
-  <? endif ?>
-<? endforeach ?> AS groupsLit,
-<? foreach("groupList") ?>
-  substring(<? literal("groupList") ?> from 1 for 15) 
-  <? if not isLast("groupList") ?>
-  || E'\n' || 
-  <? endif ?>
-<? endforeach ?> AS groups,
-<? foreach("groupDescripList") ?>
-  substring(<? literal("groupDescripList") ?> from 1 for 30) 
-  <? if not isLast("groupDescripList") ?>
-  || E'\n' || 
-  <? endif ?>
-<? endforeach ?> AS groupsDescrip,
-       formatDate(MIN(cohist_invcdate)) AS firstsale,
-       formatDate(MAX(cohist_invcdate)) AS lastsale,
-       formatQty(SUM(cohist_qtyshipped)) AS qty,
-<? if exists("byCurrency") ?>
-       currAbbr,
-       formatMoney(SUM(round(cohist_qtyshipped * cohist_unitprice,2))) AS sales
-<? else ?>
-       currConcat(baseCurrId()) AS currAbbr, 
-       formatMoney(SUM(round(cohist_qtyshipped * currtobase(cohist_curr_id,cohist_unitprice,cohist_invcdate),2))) AS sales 
-<? endif ?>
-FROM saleshistory 
-WHERE (true
-<? if exists("startDate") ?>
- AND (cohist_invcdate >= <? value("startDate") ?>)
-<? endif ?>
-
-<? if exists("endDate") ?>
- AND (cohist_invcdate <= <? value("endDate") ?>)
-<? endif ?>
-
-<? if exists("shipStartDate") ?>
- AND (cohist_shipdate >= <? value("shipStartDate") ?>)
-<? endif ?>
-
-<? if exists("shipEndDate") ?>
- AND (cohist_shipdate <= <? value("shipEndDate") ?>)
-<? endif ?>
-
-<? if exists("warehous_id") ?>
- AND (itemsite_warehous_id=<? value("warehous_id") ?>)
-<? endif ?>
-
-<? if exists("item_id") ?>
- AND (itemsite_item_id=<? value("item_id") ?>)
-<? endif ?>
-
-<? if exists("cust_id") ?>
- AND (cohist_cust_id=<? value("cust_id") ?>)
-<? endif ?>
-
-<? if exists("shipto_id") ?>
- AND (cohist_shipto_id=<? value("shipto_id") ?>)
-<? endif ?>
-
-<? if exists("salesrep_id") ?>
- AND (cohist_salesrep_id=<? value("salesrep_id") ?>)
-<? endif ?>
-
-<? if exists("prodcat_id") ?>
- AND (item_prodcat_id=<? value("prodcat_id") ?>)
-<? endif ?>
-
-<? if exists("prodcat_pattern") ?>
- AND (prodcat_code ~ <? value("prodcat_pattern") ?>) 
-<? endif ?>
-
-<? if exists("custtype_id") ?>
- AND (cust_custtype_id=<? value("custtype_id") ?>)
-<? endif ?>
-
-<? if exists("custtype_pattern") ?>
-   AND (custtype_code ~ <? value("custtype_pattern") ?>)
-<? endif ?> 
-
-<? if exists("custgrp_id") ?>
-  AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
-                   FROM custgrpitem
-                   WHERE (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)))
-<? endif ?>
-
-<? if exists("custgrp_pattern") ?>
-  AND (cust_id IN (SELECT DISTINCT custgrpitem_cust_id
-                   FROM custgrp, custgrpitem
-                   WHERE ( (custgrpitem_custgrp_id=custgrp_id)
-                     AND   (custgrp_name ~ <? value("custgrp_pattern") ?>) )) )
-<? endif ?>
-
-<? if exists("shipzone_id") ?>
- AND (shipzone_id=<? value("shipzone_id") ?>)
-<? endif ?>
-
-<? if exists("curr_id") ?>
- AND cust_curr_id = <? value("curr_id") ?>
-<? endif ?>
-
-<? if exists("currConcat_pattern") ?>
- AND (currAbbr ~ <? value("currConcat_pattern") ?>) 
-<? endif ?>
-) 
-GROUP BY dummy
-<? if exists("bySalesRep") ?>
- , cohist_salesrep_id, salesrep_number, salesrep_name
-<? endif ?>
-<? if exists("byShippingZone") ?>
- , shipzone_id, shipzone_name, shipzone_descrip
-<? endif ?>
-<? if exists("byCustomer") ?>
- , cohist_cust_id, cust_number, cust_name
-<? endif ?>
-<? if exists("byCustomerType") ?>
- , cust_custtype_id, custtype_code, custtype_descrip
-<? endif ?>
-<? if exists("byItem") ?>
- , item_id, item_number, itemdescription
-<? endif ?>
-<? if exists("bySite") ?>
- , itemsite_warehous_id, warehous_code, warehous_descrip
-<? endif ?>
-<? if exists("byCurrency") ?>
- , cust_curr_id, currAbbr
-<? endif ?>
- ORDER BY dummy
-<? if exists("bySalesRep") ?>
- , salesrep_number
-<? endif ?>
-<? if exists("byShippingZone") ?>
- , shipzone_name
-<? endif ?>
-<? if exists("byCustomer") ?>
- , cust_number
-<? endif ?>
-<? if exists("byCustomerType") ?>
- , custtype_code
-<? endif ?>
-<? if exists("byItem") ?>
- , item_number
-<? endif ?>
-<? if exists("bySite") ?>
- , warehous_code
-<? endif ?>
-;
+== MetaSQL statement summarizedSalesHistory-detail
 
 --------------------------------------------------------------------
 REPORT: TimePhasedAvailability
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
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
   
 QUERY: detail
 SELECT findPeriodStart(rcalitem_id) AS pstart,
        findPeriodEnd(rcalitem_id) AS pend,
        (formatDate(findPeriodStart(rcalitem_id)) || '-' || formatDate(findPeriodEnd(rcalitem_id))) AS period,
        item_number,
        uom_name AS f_uom,
        warehous_code,
        formatQty(qtyAvailable(itemsite_id, findPeriodStart(rcalitem_id))) AS f_unit
-  FROM rcalitem, itemsite, item, uom, warehous
+  FROM rcalitem, itemsite, item, uom, whsinfo
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
    AND (item_inv_uom_id=uom_id)
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
        uom_name AS f_uom,
        warehous_code,
        formatQty(qtyAvailable(itemsite_id, findPeriodStart(acalitem_id))) AS f_unit
-  FROM acalitem, itemsite, item, uom, warehous
+  FROM acalitem, itemsite, item, uom, whsinfo
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
    AND (item_inv_uom_id=uom_id)
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
 REPORT: TimePhasedBookings
 QUERY: detail
 SELECT *, 
   coalesce(unit,0) AS unit, 
 <? if exists("salesDollars") ?>
   formatExtPrice(coalesce(unit,0)) AS f_unit
 <? else ?>
   formatQty(coalesce(unit,0)) AS f_unit
 <? endif ?>
 FROM
 -- Outer Table Query
 (SELECT DISTINCT
        calitem_id,
        findPeriodStart(calitem_id) AS pstart,
        findPeriodEnd(calitem_id) AS pend,
        (formatDate(findPeriodStart(calitem_id)) || '-' || formatDate(findPeriodEnd(calitem_id))) AS period,
 <? if exists("byCust") ?>
          cust_id, cust_number AS f_number, cust_name AS f_description
 <? elseif exists("byProdcat") ?>
          prodcat_id, prodcat_code AS f_number, prodcat_descrip AS f_description
 <? elseif exists("byItem") ?>
          item_id, item_number AS f_number, item_descrip1 AS f_description
 <? endif ?>
        , warehous_id, warehous_code
 <? if exists("salesDollars") ?>
        , <? value("baseCurrAbbr") ?>::text AS f_uom
 <? else ?>
   <? if exists("inventoryUnits") ?>
        , uom_name AS f_uom
   <? elseif exists("capacityUnits") ?>
        , itemcapuom(item_id) AS f_uom
   <? elseif exists("altCapacityUnits") ?>
        , itemaltcapuom(item_id) AS f_uom
   <? endif ?>
 <? endif ?>
 FROM coitem
  JOIN cohead ON (coitem_cohead_id=cohead_id)
  JOIN itemsite ON (coitem_itemsite_id=itemsite_id)
  JOIN item ON (itemsite_item_id=item_id)
 <? if exists("inventoryUnits") ?>
  JOIN uom ON (item_inv_uom_id=uom_id)
 <? endif ?>
  JOIN site() ON (itemsite_warehous_id=warehous_id)
 <? if reExists("[cC]ust") ?>
  JOIN custinfo ON (cohead_cust_id=cust_id)
 <? endif ?> 
 <? if reExists("[pP]rodcat") ?>
  JOIN prodcat ON (item_prodcat_id=prodcat_id)
 <? endif ?>
     ,   ( SELECT rcalitem_id AS calitem_id,
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
 WHERE ((cohead_orderdate BETWEEN
 <? foreach("period_id_list") ?>
   <? if isfirst("period_id_list") ?>
     findPeriodStart(<? value("period_id_list") ?>)
   <? endif ?>
   <? if isLast("period_id_list") ?>
     AND findPeriodEnd(<? value("period_id_list") ?>)
   <? endif ?>
 <? endforeach ?>
 )
     AND (coitem_status != 'X')
 <? if exists("item_id") ?> 
     AND (item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("cust_id") ?> 
     AND (cust_id=<? value("cust_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?> 
     AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? endif ?>
 <? if exists("custtype_pattern") ?>
     AND (cust_custtype_id IN (SELECT custtype_id 
                               FROM custtype 
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
 <? if exists("prodcat_id") ?> 
     AND (item_prodcat_id=<? value("prodcat_id") ?>) 
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT prodcat_id  
                              FROM prodcat 
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?> 
     AND(itemsite_warehous_id=<? value("warehous_id") ?>) 
 <? endif ?>
       )
 ORDER BY pstart, f_number, f_description, f_uom, warehous_code) list
 LEFT OUTER JOIN
 -- Bookings calcuations
 -- Loop through each period bucket to find bookings for period
 (<? foreach("period_id_list") ?>
   SELECT 
        <? value("period_id_list") ?> AS calitem_id,
        warehous_id,
 <? if exists("byCust") ?>
          cust_id
 <? elseif exists("byProdcat") ?>
          prodcat_id 
 <? elseif exists("byItem") ?>
          item_id
 <? endif ?>
 <? if exists("salesDollars") ?>
        , sum(round((coitem_qtyord * coitem_qty_invuomratio) * (currtobase(cohead_curr_id, coitem_price, cohead_orderdate) / coitem_price_invuomratio), 2)) AS unit
        , <? value("baseCurrAbbr") ?>::text AS f_uom
 <? else ?>
        , sum(coitem_qtyord)
   <? if exists("capacityUnits") ?>
        * itemcapinvrat(item_id)
   <? elseif exists("altCapacityUnits") ?>
        * itemaltcapinvrat(item_id)
   <? endif ?>
        AS unit
   <? if exists("inventoryUnits") ?>
        , uom_name AS f_uom
   <? elseif exists("capacityUnits") ?>
        , itemcapuom(item_id) AS f_uom
   <? elseif exists("altCapacityUnits") ?>
        , itemaltcapuom(item_id) AS f_uom
   <? endif ?>
 <? endif ?>
   FROM coitem
    JOIN cohead ON (coitem_cohead_id=cohead_id)
    JOIN itemsite ON (coitem_itemsite_id=itemsite_id)
    JOIN item ON (itemsite_item_id=item_id)
 <? if exists("inventoryUnits") ?>
    JOIN uom ON (item_inv_uom_id=uom_id)
 <? endif ?>
    JOIN site() ON (itemsite_warehous_id=warehous_id)
 <? if reExists("[cC]ust") ?>
    JOIN custinfo ON (cohead_cust_id=cust_id)
 <? endif ?> 
 <? if reExists("[pP]rodcat") ?>
    JOIN prodcat ON (item_prodcat_id=prodcat_id)
 <? endif ?>
   WHERE ((cohead_orderdate BETWEEN findPeriodStart(<? value("period_id_list") ?>) AND findPeriodEnd(<? value("period_id_list") ?>))
     AND (coitem_status != 'X')
 <? if exists("item_id") ?> 
     AND (item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("cust_id") ?> 
     AND (cust_id=<? value("cust_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?> 
     AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? endif ?>
 <? if exists("custtype_pattern") ?>
     AND (cust_custtype_id IN (SELECT custtype_id 
                               FROM custtype 
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
 <? if exists("prodcat_id") ?> 
     AND (item_prodcat_id=<? value("prodcat_id") ?>) 
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT prodcat_id  
                              FROM prodcat 
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?> 
     AND(itemsite_warehous_id=<? value("warehous_id") ?>) 
 <? endif ?>
       )
 GROUP BY
 <? if exists("byCust") ?>
   cust_id, 
+  <? if exists("capacityUnits") ?>
+    item_id,
+  <? elseif exists("altCapacityUnits") ?>
+    item_id,
+  <? endif ?>
 <? elseif exists("byProdcat") ?>
   prodcat_id,
+  <? if exists("capacityUnits") ?>
+    item_id,
+  <? elseif exists("altCapacityUnits") ?>
+    item_id,
+  <? endif ?>
 <? elseif exists("byItem") ?>
   item_id,
 <? endif ?>
   f_uom, warehous_id
   <? if isLast("period_id_list") ?>
   <? else ?>
 UNION
   <? endif ?>
 <? endforeach ?> 
 ) bookings ON
 <? if exists("byCust") ?>
    (list.cust_id=bookings.cust_id)
 <? elseif exists("byProdcat") ?>
     (list.prodcat_id=bookings.prodcat_id)
 <? elseif exists("byItem") ?>
     (list.item_id=bookings.item_id)
 <? endif ?>
    AND (list.calitem_id=bookings.calitem_id)
    AND (list.warehous_id=bookings.warehous_id)
    AND (list.f_uom=bookings.f_uom)
 
 --------------------------------------------------------------------
 REPORT: TimePhasedDemandByPlannerCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
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
   
 QUERY: detail
 SELECT findPeriodStart(calitem_id) AS pstart,
        findPeriodEnd(calitem_id) AS pend,
        (formatDate(findPeriodStart(calitem_id)) || '-' || formatDate(findPeriodEnd(calitem_id))) AS period,
        plancode_code,
        <? if exists("inventoryUnits") ?>
          uom_name
        <? elseif exists("capacityUnits") ?>
          itemcapuom(item_id)
        <? elseif exists("altCapacityUnits") ?>
          itemaltcapuom(item_id)
        <? else ?>
          text('')
        <? endif ?>
        AS f_uom,
        warehous_code,
        <? if exists("inventoryUnits") ?>
          formatQty(SUM(summDemand(itemsite_id, calitem_id)))
        <? elseif exists("capacityUnits") ?>
          formatQty(SUM(summDemand(itemsite_id, calitem_id) * itemcapinvrat(item_id)))
        <? elseif exists("altCapacityUnits") ?>
          formatQty(SUM(summDemand(itemsite_id, calitem_id) * itemaltcapinvrat(item_id)))
        <? else ?>
          formatQty(SUM(summDemand(itemsite_id, calitem_id)))
        <? endif ?>
        AS f_unit
-  FROM itemsite, item, uom, warehous, plancode,
+  FROM itemsite, item, uom, whsinfo, plancode,
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
    AND (item_inv_uom_id=uom_id)
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
 REPORT: TimePhasedOpenAPItems
 QUERY: head
 SELECT <? if exists("vend_id") ?>
          ( SELECT vend_name
-             FROM vend
+             FROM vendinfo
             WHERE (vend_id=<? value("vend_id") ?>) )
        <? elseif exists("vendtype_id") ?>
          ( SELECT (vendtype_code || '-' || vendtype_descrip)
              FROM vendtype
             WHERE (vendtype_id=<? value("vendtype_id") ?>) )
        <? elseif exists("vendtype_pattern") ?>
          text(<? value("vendtype_pattern") ?>)
        <? else ?>
          text('All Vendors')
        <? endif ?>
        AS f_value,
        <? if reExists("vendtype_.*") ?>
          text('Vendor Type:')
        <? else ?>
          text('Vendor:')
        <? endif ?>
        AS f_label;
        
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT pstart, pend,
        period,
        vend_number, vend_name,
        value,
        formatMoney(value) AS f_value
   FROM (
   SELECT calitem_start AS pstart,
          calitem_end AS pend,
          (formatDate(calitem_start) || '-' || formatDate(calitem_end)) AS period,
          vend_number,
          vend_name,
          openAPItemsValue(vend_id, calitem_id) AS value
-    FROM vend,
+    FROM vendinfo,
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
   <? if exists("vend_id") ?>
    WHERE (vend_id=<? value("vend_id") ?>)
   <? elseif exists("vendtype_id") ?>
    WHERE (vend_vendtype_id=<? value("vendtype_id") ?>)
   <? elseif exists("vendtype_pattern") ?>
    WHERE (vend_vendtype_id IN (SELECT vendtype_id
                                  FROM vendtype
                                 WHERE (vendtype_code ~ <? value("vendtype_pattern") ?>) ))
   <? endif ?>
   ) AS data
  WHERE (value != 0)
 ORDER BY pstart, pend, vend_number
 
 
 --------------------------------------------------------------------
 REPORT: TimePhasedOpenARItems
 QUERY: head
 SELECT <? if exists("cust_id") ?>
          ( SELECT cust_name
-             FROM cust
+             FROM custinfo
             WHERE (cust_id=<? value("cust_id") ?>) )
        <? elseif exists("custtype_id") ?>
          ( SELECT (custtype_code || '-' || custtype_descrip)
              FROM custtype
             WHERE (custtype_id=<? value("custtype_id") ?>) )
       <? elseif exists("custgrp_id") ?>
          ( SELECT (custgrp_name || '-' ||  custgrp_descrip)
 	   FROM custgrp
             WHERE (custgrp_id=<? value("custgrp_id") ?>) )
        <? elseif exists("custtype_pattern") ?>
          text(<? value("custtype_pattern") ?>)
        <? else ?>
          text('All Customers')
        <? endif ?>
        AS f_value,
        <? if reExists("custtype_.*") ?>
          text('Customer Type:')
        <? elseif exists("custgrp_id") ?>
          text('Customer Group:')
        <? else ?>
          text('Customer:')
        <? endif ?>
        AS f_label;
        
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT pstart, pend,
        period,
        cust_number, cust_name,
        value,
        formatMoney(value) AS f_value
   FROM (
   SELECT calitem_start AS pstart,
          calitem_end AS pend,
          (formatDate(calitem_start) || '-' || formatDate(calitem_end)) AS period,
          cust_number,
          cust_name,
          openARItemsValue(cust_id, calitem_id) AS value
-    FROM cust LEFT OUTER JOIN custgrpitem ON (cust_id=custgrpitem_cust_id)
+    FROM custinfo LEFT OUTER JOIN custgrpitem ON (cust_id=custgrpitem_cust_id)
          LEFT OUTER JOIN custgrp ON (custgrpitem_custgrp_id=custgrp_id),
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
   <? if exists("cust_id") ?>
    WHERE (cust_id=<? value("cust_id") ?>)
   <? elseif exists("custtype_id") ?>
    WHERE (cust_custtype_id=<? value("custtype_id") ?>)
   <? elseif exists("custgrp_id") ?>
    WHERE (custgrp_id=<? value("custgrp_id") ?>)
   <? elseif exists("custtype_pattern") ?>
    WHERE (cust_custtype_id IN (SELECT custtype_id
                                  FROM custtype
                                 WHERE (custtype_code ~ <? value("custtype_pattern") ?>) ))
   <? endif ?>
   ) AS data
  WHERE (value != 0)
 ORDER BY pstart, pend, cust_number
 
 
 --------------------------------------------------------------------
 REPORT: TimePhasedPlannedRevenueExpensesByPlannerCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
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
   
 QUERY: detail
 SELECT (formatDate(calitem_startdate) || '-' || formatDate(calitem_enddate)) AS period,
        formatMoney(COALESCE(cost,0.0)) AS f_cost,
        formatMoney(COALESCE(revenue,0.0)) AS f_revenue,
        formatMoney(COALESCE(revenue,0.0) - COALESCE(cost,0.0)) AS f_profit
   FROM ( SELECT calitem_startdate,
                 calitem_enddate,
                 SUM(plannedCost(plancode_id, warehous_id,
                     <? if exists("actualCost") ?>'A'<? else ?>'S'<? endif ?>
                     , calitem_id))
                  AS cost,
                 <? if exists("averagePrice") ?>
                   SUM(plannedRevenue(plancode_id, warehous_id, 'A', calitem_id,
                     <? value("startEvalDate") ?>, <? value("endEvalDate") ?>))
                 <? else ?>
                   SUM(plannedRevenue(plancode_id, warehous_id, 'L', calitem_id))
                 <? endif ?>
                 AS revenue
-           FROM plancode, warehous,
+           FROM plancode, whsinfo,
                 ( SELECT rcalitem_id AS calitem_id,
                          findPeriodStart(rcalitem_id) AS calitem_startdate,
                          findPeriodEnd(rcalitem_id) AS calitem_enddate
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
                   SELECT acalitem_id AS calitem_id,
                          findPeriodStart(acalitem_id) AS calitem_startdate,
                          findPeriodEnd(acalitem_id) AS calitem_enddate
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
           WHERE ((TRUE)
 <? if exists("warehous_id") ?>
             AND  (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("plancode_id") ?>
             AND  (plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
             AND  (plancode_code ~ <? value("plancode_pattern") ?>)
 <? endif ?>
                 )
        GROUP BY calitem_startdate, calitem_enddate
        ) AS data
 ORDER BY calitem_startdate
 
 --------------------------------------------------------------------
 REPORT: TimePhasedProductionByItem
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
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
   
 QUERY: detail
 SELECT findPeriodStart(calitem_id) AS pstart,
        findPeriodEnd(calitem_id) AS pend,
        (formatDate(findPeriodStart(calitem_id)) || '-' || formatDate(findPeriodEnd(calitem_id))) AS period,
        item_number,
        uom_name,
        warehous_code,
        formatQty(SUM(summProd(itemsite_id, calitem_id))) AS f_unit
-  FROM itemsite, item, uom, warehous,
+  FROM itemsite, item, uom, whsinfo,
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
    AND (item_inv_uom_id=uom_id)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("plancode_id") ?>
    AND (itemsite_plancode_id=<? value("plancode_id") ?>)
 <? elseif exists("plancode_pattern") ?>
    AND (itemsite_plancode_id IN (SELECT plancode_id FROM plancode WHERE (plancode_code ~ <? value("plancode_pattern") ?>)))
 <? endif ?>
   )
 GROUP BY pstart, pend, period, item_number, warehous_code, uom_name
 ORDER BY pstart, item_number, warehous_code;
 
 --------------------------------------------------------------------
 REPORT: TimePhasedProductionByPlannerCode
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
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
   
 QUERY: detail
 SELECT findPeriodStart(calitem_id) AS pstart,
        findPeriodEnd(calitem_id) AS pend,
        (formatDate(findPeriodStart(calitem_id)) || '-' || formatDate(findPeriodEnd(calitem_id))) AS period,
        plancode_code,
        <? if exists("inventoryUnits") ?>
          uom_name
        <? elseif exists("capacityUnits") ?>
          itemcapuom(item_id)
        <? elseif exists("altCapacityUnits") ?>
          itemaltcapuom(item_id)
        <? else ?>
          text('')
        <? endif ?>
        AS f_uom,
        warehous_code,
        <? if exists("inventoryUnits") ?>
          formatQty(SUM(summProd(itemsite_id, calitem_id)))
        <? elseif exists("capacityUnits") ?>
          formatQty(SUM(summProd(itemsite_id, calitem_id) * itemcapinvrat(item_id)))
        <? elseif exists("altCapacityUnits") ?>
          formatQty(SUM(summProd(itemsite_id, calitem_id) * itemaltcapinvrat(item_id)))
        <? else ?>
          formatQty(SUM(summProd(itemsite_id, calitem_id)))
        <? endif ?>
        AS f_unit
-  FROM itemsite, item, uom, warehous, plancode,
+  FROM itemsite, item, uom, whsinfo, plancode,
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
    AND (item_inv_uom_id=uom_id)
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
 REPORT: TimePhasedSalesHistory
 QUERY: detail
 SELECT *, 
   coalesce(unit,0) AS unit, 
 <? if exists("salesDollars") ?>
   formatExtPrice(coalesce(unit,0)) AS f_unit
 <? else ?>
   formatQty(coalesce(unit,0)) AS f_unit
 <? endif ?>
 FROM
 -- Outer Table Query
 (SELECT DISTINCT
        calitem_id,
        findPeriodStart(calitem_id) AS pstart,
        findPeriodEnd(calitem_id) AS pend,
        (formatDate(findPeriodStart(calitem_id)) || '-' || formatDate(findPeriodEnd(calitem_id))) AS period,
 <? if exists("byCust") ?>
          cust_id, cust_number AS f_number, cust_name AS f_description
 <? elseif exists("byProdcat") ?>
          prodcat_id, prodcat_code AS f_number, prodcat_descrip AS f_description
 <? elseif exists("byItem") ?>
          item_id, item_number AS f_number, item_descrip1 AS f_description
 <? endif ?>
        , warehous_id, warehous_code
 <? if exists("salesDollars") ?>
        , <? value("baseCurrAbbr") ?>::text AS f_uom
 <? else ?>
   <? if exists("inventoryUnits") ?>
        , uom_name AS f_uom
   <? elseif exists("capacityUnits") ?>
        , itemcapuom(item_id) AS f_uom
   <? elseif exists("altCapacityUnits") ?>
        , itemaltcapuom(item_id) AS f_uom
   <? endif ?>
 <? endif ?>
 FROM cohist JOIN itemsite ON (itemsite_id=cohist_itemsite_id)
             JOIN item ON (item_id=itemsite_item_id)
 <? if exists("inventoryUnits") ?>
  JOIN uom ON (item_inv_uom_id=uom_id)
 <? endif ?>
  JOIN site() ON (itemsite_warehous_id=warehous_id)
 <? if reExists("[cC]ust") ?>
  JOIN custinfo ON (cohist_cust_id=cust_id)
 <? endif ?> 
 <? if reExists("[pP]rodcat") ?>
  JOIN prodcat ON (item_prodcat_id=prodcat_id)
 <? endif ?>
 <? if reExists("custgrp") ?>
  JOIN custgrpitem ON (custgrpitem_cust_id=cohist_cust_id)
  JOIN custgrp ON (custgrpitem_custgrp_id=custgrp_id)
 <? endif ?>
     ,   ( SELECT rcalitem_id AS calitem_id,
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
 WHERE ((cohist_invcdate BETWEEN
 <? foreach("period_id_list") ?>
   <? if isfirst("period_id_list") ?>
     findPeriodStart(<? value("period_id_list") ?>)
   <? endif ?>
   <? if isLast("period_id_list") ?>
     AND findPeriodEnd(<? value("period_id_list") ?>)
   <? endif ?>
 <? endforeach ?>
 )
 <? if exists("item_id") ?> 
     AND (item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("cust_id") ?> 
     AND (cust_id=<? value("cust_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?> 
     AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? endif ?>
 <? if exists("custtype_pattern") ?>
     AND (cust_custtype_id IN (SELECT custtype_id 
                               FROM custtype 
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
 <? if exists("custgrp_id") ?> 
     AND (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? endif ?>
 <? if exists("custgrp_pattern") ?>
     AND (cust_custgrp_name ~ <? value("custgrp_pattern") ?>)))
 <? endif ?>
 <? if exists("prodcat_id") ?> 
     AND (item_prodcat_id=<? value("prodcat_id") ?>) 
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT prodcat_id  
                              FROM prodcat 
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?> 
     AND(itemsite_warehous_id=<? value("warehous_id") ?>) 
 <? endif ?>
       )
 ORDER BY pstart, f_number, f_description, f_uom, warehous_code) list
 LEFT OUTER JOIN
 -- Sales calcuations
 -- Loop through each period bucket to find bookings for period
 (<? foreach("period_id_list") ?>
   SELECT 
        <? value("period_id_list") ?> AS calitem_id,
        warehous_id,
 <? if exists("byCust") ?>
          cust_id
 <? elseif exists("byProdcat") ?>
          prodcat_id 
 <? elseif exists("byItem") ?>
          item_id
 <? endif ?>
 <? if exists("salesDollars") ?>
        , sum(round(cohist_qtyshipped * currtobase(cohist_curr_id, cohist_unitprice, cohist_invcdate), 2)) AS unit
        , <? value("baseCurrAbbr") ?>::text AS f_uom
 <? else ?>
        , sum(cohist_qtyshipped)
   <? if exists("capacityUnits") ?>
        * itemcapinvrat(item_id)
   <? elseif exists("altCapacityUnits") ?>
        * itemaltcapinvrat(item_id)
   <? endif ?>
        AS unit
   <? if exists("inventoryUnits") ?>
        , uom_name AS f_uom
   <? elseif exists("capacityUnits") ?>
        , itemcapuom(item_id) AS f_uom
   <? elseif exists("altCapacityUnits") ?>
        , itemaltcapuom(item_id) AS f_uom
   <? endif ?>
 <? endif ?>
 FROM cohist JOIN itemsite ON (itemsite_id=cohist_itemsite_id)
             JOIN item ON (item_id=itemsite_item_id)
 <? if exists("inventoryUnits") ?>
    JOIN uom ON (item_inv_uom_id=uom_id)
 <? endif ?>
    JOIN site() ON (itemsite_warehous_id=warehous_id)
 <? if reExists("[cC]ust") ?>
    JOIN custinfo ON (cohist_cust_id=cust_id)
 <? endif ?> 
 <? if reExists("[pP]rodcat") ?>
    JOIN prodcat ON (item_prodcat_id=prodcat_id)
 <? endif ?>
 <? if reExists("custgrp") ?>
  JOIN custgrpitem ON (custgrpitem_cust_id=cohist_cust_id)
  JOIN custgrp ON (custgrpitem_custgrp_id=custgrp_id)
 <? endif ?>
   WHERE ((cohist_invcdate BETWEEN findPeriodStart(<? value("period_id_list") ?>) AND findPeriodEnd(<? value("period_id_list") ?>))
 <? if exists("item_id") ?> 
     AND (item_id=<? value("item_id") ?>)
 <? endif ?>
 <? if exists("cust_id") ?> 
     AND (cust_id=<? value("cust_id") ?>)
 <? endif ?>
 <? if exists("custtype_id") ?> 
     AND (cust_custtype_id=<? value("custtype_id") ?>)
 <? endif ?>
 <? if exists("custtype_pattern") ?>
     AND (cust_custtype_id IN (SELECT custtype_id 
                               FROM custtype 
                               WHERE (custtype_code ~ <? value("custtype_pattern") ?>)))
 <? endif ?>
 <? if exists("custgrp_id") ?> 
     AND (custgrpitem_custgrp_id=<? value("custgrp_id") ?>)
 <? endif ?>
 <? if exists("custgrp_pattern") ?>
     AND (cust_custgrp_name ~ <? value("custgrp_pattern") ?>)))
 <? endif ?>
 <? if exists("prodcat_id") ?> 
     AND (item_prodcat_id=<? value("prodcat_id") ?>) 
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
     AND (item_prodcat_id IN (SELECT prodcat_id  
                              FROM prodcat 
                              WHERE (prodcat_code ~ <? value("prodcat_pattern") ?>)))
 <? endif ?>
 <? if exists("warehous_id") ?> 
     AND(itemsite_warehous_id=<? value("warehous_id") ?>) 
 <? endif ?>
       )
 GROUP BY
 <? if exists("byCust") ?>
   cust_id, 
+  <? if exists("capacityUnits") ?>
+    item_id,
+  <? elseif exists("altCapacityUnits") ?>
+    item_id,
+  <? endif ?>
 <? elseif exists("byProdcat") ?>
   prodcat_id,
+  <? if exists("capacityUnits") ?>
+    item_id,
+  <? elseif exists("altCapacityUnits") ?>
+    item_id,
+  <? endif ?>
 <? elseif exists("byItem") ?>
   item_id,
 <? endif ?>
   f_uom, warehous_id
   <? if isLast("period_id_list") ?>
   <? else ?>
 UNION
   <? endif ?>
 <? endforeach ?> 
 ) sales ON
 <? if exists("byCust") ?>
    (list.cust_id=sales.cust_id)
 <? elseif exists("byProdcat") ?>
     (list.prodcat_id=sales.prodcat_id)
 <? elseif exists("byItem") ?>
     (list.item_id=sales.item_id)
 <? endif ?>
    AND (list.calitem_id=sales.calitem_id)
    AND (list.warehous_id=sales.warehous_id)
    AND (list.f_uom=sales.f_uom)
 
 --------------------------------------------------------------------
 REPORT: TimePhasedStatisticsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Warehouses')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT calitem_pstart AS pstart,
        calitem_pend AS pend,
        (formatDate(calitem_pstart) || '-' || formatDate(calitem_pend)) AS period,
        warehous_code,
        formatQty(summTransR(itemsite_id, calitem_id)) AS received,
        formatQty(summTransI(itemsite_id, calitem_id)) AS issued,
        formatQty(summTransS(itemsite_id, calitem_id)) AS sold,
        formatQty(summTransC(itemsite_id, calitem_id)) AS scrap,
        formatQty(summTransA(itemsite_id, calitem_id)) AS adjustments
-  FROM itemsite, warehous,
+  FROM itemsite, whsinfo,
 
        ( SELECT rcalitem_id as calitem_id,
                 findPeriodStart(rcalitem_id) as calitem_pstart,
                 findPeriodEnd(rcalitem_id) as calitem_pend
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
          SELECT acalitem_id as calitem_id,
                 findPeriodStart(acalitem_id) as calitem_pstart,
                 findPeriodEnd(acalitem_id) as calitem_pend
            FROM acalitem
           WHERE (acalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                  ))
        ORDER BY calitem_pstart, calitem_pend
        ) as calitem
 
  WHERE ((itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY calitem_pstart, warehous_code;
 
 --------------------------------------------------------------------
 REPORT: TimePhasedStatisticsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
-         text('All Sites')
+         text('All Warehouses')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT calitem_pstart AS pstart,
        calitem_pend AS pend,
        (formatDate(calitem_pstart) || '-' || formatDate(calitem_pend)) AS period,
        warehous_code,
        formatQty(summTransR(itemsite_id, calitem_id)) AS received,
        formatQty(summTransI(itemsite_id, calitem_id)) AS issued,
        formatQty(summTransS(itemsite_id, calitem_id)) AS sold,
        formatQty(summTransC(itemsite_id, calitem_id)) AS scrap,
-       formatQty(summTransA(itemsite_id, calitem_id)) AS adjustments
-  FROM itemsite, warehous,
+       formatQty(summTransA(itemsite_id, calitem_id)) AS adjustments,
+--
+       summTransR(itemsite_id, calitem_id) AS a_received,
+       summTransI(itemsite_id, calitem_id) AS a_issued,
+       summTransS(itemsite_id, calitem_id) AS a_sold,
+       summTransC(itemsite_id, calitem_id) AS a_scrap,
+       summTransA(itemsite_id, calitem_id) AS a_adjustments
+
+  FROM itemsite, whsinfo,
 
        ( SELECT rcalitem_id as calitem_id,
                 findPeriodStart(rcalitem_id) as calitem_pstart,
                 findPeriodEnd(rcalitem_id) as calitem_pend
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
          SELECT acalitem_id as calitem_id,
                 findPeriodStart(acalitem_id) as calitem_pstart,
                 findPeriodEnd(acalitem_id) as calitem_pend
            FROM acalitem
           WHERE (acalitem_id in (
 <? foreach("period_id_list") ?>
   <? if not isfirst("period_id_list") ?>
     ,
   <? endif ?>
   <? value("period_id_list") ?>
 <? endforeach ?>
                  ))
        ORDER BY calitem_pstart, calitem_pend
        ) as calitem
 
  WHERE ((itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 ORDER BY calitem_pstart, warehous_code;
 
 --------------------------------------------------------------------
 REPORT: UnappliedAPCreditMemos
 QUERY: detail
 SELECT apopen_id, apopen_docnumber,
        (vend_number || '-' || vend_name) AS vendor,
        formatMoney(apopen_amount) AS f_amount,
        formatMoney(apopen_paid) AS f_paid,
        formatMoney(apopen_amount - apopen_paid) AS f_balance
-FROM apopen, vend
+FROM apopen, vendinfo
 WHERE ( (apopen_doctype='C')
  AND (apopen_open)
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
 ORDER BY apopen_docnumber;
 
 --------------------------------------------------------------------
 REPORT: UnappliedARCreditMemos
 QUERY: detail
 SELECT aropen_id, aropen_docnumber,
        (cust_number || '-' || cust_name) AS cust,
        formatMoney(aropen_amount) AS f_amount,
        formatMoney(aropen_paid) AS f_paid,
        formatMoney(aropen_amount - aropen_paid) AS f_balance
-FROM aropen, cust
+FROM aropen, custinfo
 WHERE ( (aropen_doctype IN ('C', 'R'))
  AND (aropen_open)
  AND (aropen_cust_id=cust_id) )
 ORDER BY aropen_docnumber;
 
 --------------------------------------------------------------------
 REPORT: UniformBOL
 QUERY: head
-SELECT cosmisc_shipvia, formatDate(cosmisc_shipdate) AS shipdate,
+SELECT shiphead_shipvia, formatDate(shiphead_shipdate) AS shipdate,
                 cust_name, cust_number, cohead_number, cohead_fob, cohead_custponumber,
-                warehous_descrip, warehous_addr1, warehous_addr2, warehous_addr3, warehous_addr4, warehous_fob,
+                warehous_descrip, addr_line1 AS warehous_addr1, addr_line2 AS warehous_addr2, addr_line3 AS warehous_addr3, addr_city AS warehous_addr4, warehous_fob,
                 cohead_shiptoname, cohead_shiptoaddress1, cohead_shiptoaddress2, cohead_shiptoaddress3,
                 (cohead_shiptocity || ' ' || cohead_shiptostate || ' ' || cohead_shiptozipcode) AS shiptocitystatezip,
                 cohead_shiptophone
-         FROM cosmisc, cohead, warehous, cust
-         WHERE ((cosmisc_cohead_id=cohead_id)
+         FROM shiphead, cohead, whsinfo, custinfo
+         LEFT OUTER JOIN addr ON (warehous_addr_id=addr_id)
+         WHERE ((shiphead_cohead_id=cohead_id)
           AND (cohead_cust_id=cust_id)
           AND (cohead_warehous_id=warehous_id)
-          AND (cosmisc_id=%1));
+          AND (shiphead_id=%1));
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT 1 as one,
        coitem_linenumber,
-       formatQty(SUM(coship_qty)) AS invqty,
+       formatQty(SUM(shipitem_qty)) AS invqty,
        uom_name,
        itemsellinguom(item_id) AS shipuom,
-       roundUp(SUM(coship_qty) / iteminvpricerat(item_id))::integer AS shipqty,
+       roundUp(SUM(shipitem_qty) / iteminvpricerat(item_id))::integer AS shipqty,
        item_number, item_descrip1, item_descrip2,
-       formatQty(SUM(coship_qty) * item_prodweight) AS netweight,
-       formatQty(SUM(coship_qty) * (item_prodweight + item_packweight)) AS grossweight
-  FROM coship, coitem, itemsite, item, uom
- WHERE ((coship_coitem_id=coitem_id)
+       formatQty(SUM(shipitem_qty) * item_prodweight) AS netweight,
+       formatQty(SUM(shipitem_qty) * (item_prodweight + item_packweight)) AS grossweight
+  FROM shipitem, coitem, itemsite, item, uom
+ WHERE ((shipitem_orderitem_id=coitem_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
-   AND (coship_cosmisc_id=%1))
+   AND (shipitem_shiphead_id=%1))
 GROUP BY coitem_linenumber, item_number,
          uom_name, shipuom,
          item_descrip1,
          item_descrip2, item_prodweight,
          item_packweight
 ORDER BY coitem_linenumber;
     
 --------------------------------------------------------------------
   
 QUERY: foot
-SELECT formatQty(SUM(coship_qty * item_prodweight)) AS netweight,
-       formatQty(SUM(coship_qty * (item_prodweight + item_packweight))) AS grossweight             
-  FROM coship, coitem, itemsite, item
- WHERE ((coship_coitem_id=coitem_id)
+SELECT formatQty(SUM(shipitem_qty * item_prodweight)) AS netweight,
+       formatQty(SUM(shipitem_qty * (item_prodweight + item_packweight))) AS grossweight             
+  FROM shipitem, coitem, itemsite, item
+ WHERE ((shipitem_orderitem_id=coitem_id)
    AND (coitem_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
-   AND (coship_cosmisc_id=%1));
+   AND (shipitem_shiphead_id=%1));
 --------------------------------------------------------------------
   
 QUERY: notes
-SELECT cosmisc_notes
-  FROM cosmisc
- WHERE (cosmisc_id=%1);
+SELECT shiphead_notes
+  FROM shiphead
+ WHERE (shiphead_id=%1);
 
 --------------------------------------------------------------------
 REPORT: UninvoicedReceipts
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse,
        <? if exists("agentUsername") ?>
        TEXT(<? value("agentUsername" ?>)
        <? else ?>
        TEXT('All Agents')
        <? endif ?>
        AS agentUsername;
 
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT recv_id,
        formatDate(recv_date) as f_date,
        recv_trans_usr_name as f_user,
        recv_order_number AS f_ponumber, poitem_linenumber,
        vend_name, 
        COALESCE(item_number, ('Misc. - ' || recv_vend_item_number)) AS item_number,
        formatQty(recv_qty) as f_qty,
        'Receipt' AS f_type,
        recv_value AS value,
        formatMoney(recv_value) AS f_value
   FROM recv
     LEFT OUTER JOIN itemsite ON (recv_itemsite_id=itemsite_id)
     LEFT OUTER JOIN item ON (itemsite_item_id=item_id),
-    poitem, vend
+    poitem, vendinfo
  WHERE ((recv_orderitem_id=poitem_id)
    AND  (recv_order_type='PO')
    AND  (recv_vend_id=vend_id)
    AND  (recv_posted)
    AND  (recv_vohead_id IS NULL)
    AND  (NOT recv_invoiced)
 <? if exists("warehous_id") ?>
    AND  (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 <? if exists("agentUsername") ?>
    AND  (recv_agent_username=<? value("agentUsername") ?>)
 <? endif ?>
 )
 UNION
 SELECT poreject_id,
        formatDate(poreject_date) as f_date,
        poreject_trans_username as f_user,
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
-    poitem, vend
+    poitem, vendinfo
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
 REPORT: UninvoicedShipments
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse;
 
 --------------------------------------------------------------------
   
 QUERY: detail
-SELECT cohead_id, coship_id, cohead_number, coitem_linenumber,
+SELECT cohead_id, shipitem_id, cohead_number, coitem_linenumber,
        item_number, item_descrip1, item_descrip2,
        uom_name,
        shipped, formatQty(shipped) AS f_shipped,
        selected, formatQty(selected) AS f_selected
 FROM (
-SELECT cohead_id, coship_id, cohead_number, coitem_linenumber,
+SELECT cohead_id, shipitem_id, cohead_number, coitem_linenumber,
        item_number, item_descrip1, item_descrip2,
        uom_name,
-       COALESCE(SUM(coship_qty), 0) AS shipped,
+       COALESCE(SUM(shipitem_qty), 0) AS shipped,
        COALESCE(SUM(cobill_qty), 0) AS selected
 FROM cohead, itemsite, item, uom,
-     warehous, coship, cosmisc,
+     whsinfo, shipitem, shiphead,
      coitem LEFT OUTER JOIN
       ( cobill JOIN cobmisc
         ON ( (cobill_cobmisc_id=cobmisc_id) AND (NOT cobmisc_posted) ) )
      ON (cobill_coitem_id=coitem_id)
-WHERE ( (coship_coitem_id=coitem_id)
- AND (coship_cosmisc_id=cosmisc_id)
+WHERE ( (shipitem_orderitem_id=coitem_id)
+ AND (shipitem_shiphead_id=shiphead_id)
  AND (coitem_cohead_id=cohead_id)
  AND (coitem_itemsite_id=itemsite_id)
  AND (coitem_qty_uom_id=uom_id)
  AND (itemsite_item_id=item_id)
  AND (itemsite_warehous_id=warehous_id)
- AND (cosmisc_shipped)
- AND (NOT coship_invoiced)
+ AND (shiphead_shipped)
+ AND (NOT shipitem_invoiced)
 <? if exists("warehous_id") ?>
  AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
  )
 GROUP BY cohead_number, coitem_id, coitem_linenumber, item_number,
-         item_descrip1, item_descrip2, cohead_id, coship_id, uom_name
+         item_descrip1, item_descrip2, cohead_id, shipitem_id, uom_name
 ) AS data
 <? if exists("showUnselected") ?>
  WHERE (selected = 0)
 <? endif ?>
 ;
 
 --------------------------------------------------------------------
 REPORT: UnpostedPoReceipts
 QUERY: detail
 SELECT recv_id, recv_orderitem_id, recv_order_number, recv_order_type,
        orderhead_from,
        orderitem_linenumber,
        formatDate(recv_duedate) AS recv_duedate,
        warehous_code,
        COALESCE(item_number, <? value("nonInventory") ?>) AS item_number,
        COALESCE(uom_name, <? value("na") ?>) AS uom_name,
        recv_vend_item_number,
        recv_vend_uom,
        formatQty(orderitem_qty_ordered)  AS qty_ordered,
        formatQty(orderitem_qty_received) AS qty_received,
        formatQty(recv_qty)     AS recv_qty,
        formatDate(recv_date)   AS recv_date,
        formatDate(COALESCE(recv_gldistdate, recv_date)) AS recv_gldistdate
 FROM orderhead JOIN
      orderitem ON ((orderitem_orderhead_id=orderhead_id)
 	       AND (orderitem_orderhead_type=orderhead_type)) JOIN 
      recv  ON ((recv_orderitem_id=orderitem_id)
 	   AND (recv_order_type=orderitem_orderhead_type)) LEFT OUTER JOIN
      (itemsite JOIN item ON (itemsite_item_id=item_id)
 	       JOIN uom ON (item_inv_uom_id=uom_id)
                JOIN site() ON (itemsite_warehous_id=warehous_id)
        )
       ON (recv_itemsite_id=itemsite_id) LEFT OUTER JOIN
-     vend ON (orderhead_type='PO' AND orderhead_from_id=vend_id)
+     vendinfo ON (orderhead_type='PO' AND orderhead_from_id=vend_id)
 WHERE (NOT recv_posted)
 ORDER BY orderhead_from, recv_order_number, orderitem_linenumber;
 
 
 --------------------------------------------------------------------
 REPORT: ValidLocationsByItem
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-                   FROM warehous
+                   FROM whsinfo
                    WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);
 
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT warehous_code,
        formatLocationName(location_id) AS locationname,
        firstLine(location_descrip) as f_descrip,
        formatBoolYN(location_restrict) AS restricted,
        formatBoolYN(location_netable) AS netable
-  FROM itemsite, location, warehous
+  FROM itemsite, location, whsinfo
  WHERE ((validLocation(location_id, itemsite_id))
    AND  ((itemsite_loccntrl) OR (itemsite_location_id=location_id))
    AND  (itemsite_item_id=<? value("item_id") ?>)
    AND  (itemsite_warehous_id=warehous_id)
 <? if exists("warehous_id") ?>
    AND  (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 )
 
 ORDER BY warehous_code, locationname;
 
 --------------------------------------------------------------------
 REPORT: VendorAPHistory
 QUERY: head
 SELECT vend_number,
        vend_name,
        formatDate(<? value("startDate") ?>, 'Earliest') AS startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS enddate
-  FROM vend
+  FROM vendinfo
  WHERE (vend_id=<? value("vend_id") ?>);
 
 --------------------------------------------------------------------
 REPORT: VendorAddressList
 QUERY: head
 SELECT vend_number, vend_name
-  FROM vend
+  FROM vendinfo
  WHERE (vend_id=<? value("vend_id") ?>);
     
 --------------------------------------------------------------------
   
 QUERY: detail
 SELECT vendaddr_code as num,
        vendaddr_name as name,
-       vendaddr_address1 AS address,
-       (vendaddr_city || ', ' || vendaddr_state || '  ' || vendaddr_zipcode)  AS citystatezip
-  FROM vendaddr 
+       addr_line1 AS address,
+       (addr_city || ', ' || addr_state || '  ' || addr_postalcode)  AS citystatezip
+  FROM vendaddrinfo
+  LEFT OUTER JOIN addr ON (vendaddr_addr_id=addr_id)
  WHERE (vendaddr_vend_id=<? value("vend_id") ?>) 
 ORDER BY vendaddr_code;
 
 --------------------------------------------------------------------
 REPORT: VoucherRegister
 QUERY: detail
 SELECT gltrans_id,
        formatDate(gltrans_date) AS transdate,
        vend_number, vend_name,
        gltrans_doctype,
        gltrans_docnumber,
        firstLine(gltrans_notes) AS transnotes,
        (formatGLAccount(accnt_id) || ' - ' || accnt_descrip) AS account,
        CASE WHEN (gltrans_amount < 0) THEN formatMoney(ABS(gltrans_amount))
             ELSE ''
        END AS f_debit,
        CASE WHEN (gltrans_amount > 0) THEN formatMoney(gltrans_amount)
             ELSE ''
        END AS f_credit,
        <? if exists("showUsernames") ?>
          gltrans_username
        <? else ?>
          text('')
        <? endif ?>
        AS f_username
-  FROM accnt, gltrans LEFT OUTER JOIN vohead JOIN vend ON (vohead_vend_id=vend_id) ON (gltrans_doctype='VO' and gltrans_docnumber=vohead_number)
+  FROM accnt, gltrans LEFT OUTER JOIN vohead JOIN vendinfo ON (vohead_vend_id=vend_id) ON (gltrans_doctype='VO' and gltrans_docnumber=vohead_number)
  WHERE ((gltrans_accnt_id=accnt_id)
    AND (gltrans_date BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>)
 <? if exists("accnt_id") ?>
    AND (gltrans_accnt_id=<? value("accnt_id") ?>)
 <? endif ?>
    AND (gltrans_source='A/P')
        )
 ORDER BY gltrans_created DESC, gltrans_sequence, gltrans_amount;
 
 --------------------------------------------------------------------
 REPORT: WOHistoryByClassCode
 QUERY: Detail
 == MetaSQL statement workOrderHistory-detail
 --------------------------------------------------------------------
   
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
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
        AS lbl_toplevel,
        <? if exists("showCosts") ?>
          text('Cost')
        <? else ?>
          text('')
        <? endif ?>
        AS lbl_cost
 ;
 
 --------------------------------------------------------------------
 REPORT: WOHistoryByItem
 QUERY: Detail
 SELECT formatWONumber(wo_id) AS wonumber,
        wo_status, warehous_code,
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
-  FROM wo, itemsite, warehous
+  FROM wo, itemsite, whsinfo
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (itemsite_item_id=<? value("item_id") ?>)
 <? if exists("showOnlyTopLevel") ?>
    AND ((wo_ordtype<>'W') OR (wo_ordtype IS NULL))
 <? endif ?>
 <? if exists("warehous_id") ?>
    AND (itemsite_warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
    AND (wo_duedate BETWEEN <? value("startDate") ?> AND <? value("endDate") ?>) )
 ORDER BY wo_startdate DESC, wo_number, wo_subnumber;
     
 --------------------------------------------------------------------
   
 QUERY: head
 SELECT item_number,
        item_descrip1,
        item_descrip2,
        <? if exists("warehous_id") ?>
          (SELECT warehous_code
-            FROM warehous
+            FROM whsinfo
            WHERE (warehous_id=<? value("warehous_id") ?>))
        <? else ?>
          text('All Sites')
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
 SELECT formatWoNumber(wo_id) AS number,
        wo_subnumber AS subnumber,
        wo_status, warehous_code,
        item_number, item_descrip1, item_descrip2, uom_name,
        formatQty(wo_qtyord) AS ordered,
        formatQty(wo_qtyrcv) AS received,
        formatDate(wo_startdate) AS startdate,
        formatDate(wo_duedate) AS duedate,
        <? if exists("showCosts") ?>
          text('W/O Cost') AS lbl_value,
          formatCost(wo_postedvalue) AS value
        <? else ?>
          text('') AS lbl_value,
          text('') AS value
        <? endif ?>
-  FROM wo, itemsite, warehous, item, uom
+  FROM wo, itemsite, whsinfo, item, uom
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (CAST(wo_number AS TEXT) ~ <? value("woNumber") ?>)
 <? if exists("showOnlyTopLevel") ?>
    AND ((wo_ordtype<>'W') OR (wo_ordtype IS NULL))
 <? endif ?>
  )
 ORDER BY wo_subnumber;
     
 
 --------------------------------------------------------------------
 REPORT: WOMaterialAvailabilityByWorkOrder
 QUERY: head
 SELECT formatWONumber(wo_id) AS wonumber,
        warehous_code as warehouse,
        item_number, item_descrip1, item_descrip2, uom_name,
        wo_status AS status,        
        <? if exists("onlyShowShortages") ?>
          text('Only Show Shortages')
        <? elseif exists("onlyShowInsufficientInventory") ?>
          text('Only Show Insufficient Inventory')
        <? else ?>
          text('All Materials')
        <? endif ?>
        AS itemfiltertext,
        <? if exists("IndentedParentChild") ?>
          text('Indented Works Orders')
        <? elseif exists("summarizedParentChild") ?>
          text('Summarized Parent/Child Orders')
        <? else ?>
          text('Parent Order Only')
        <? endif ?>
        AS wofiltertext
-  FROM wo, itemsite, item, uom, warehous
+  FROM wo, itemsite, item, uom, whsinfo
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_id=<? value("wo_id") ?>) );
 
 --------------------------------------------------------------------
 REPORT: WOMaterialRequirementsByComponentItem
 QUERY: head
 SELECT item_number, item_descrip1, item_descrip2,
        <? if exists("warehous_id") ?>
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) )
        <? else ?>
          text('All Sites')
        <? endif ?>
        AS warehouse
   FROM item
  WHERE (item_id=<? value("item_id") ?>);
 
 
 --------------------------------------------------------------------
 REPORT: WOMaterialRequirementsByWorkOrder
 QUERY: head
 SELECT formatWONumber(wo_id) AS wonumber,
        warehous_code as warehouse,
        item_number, item_descrip1,
        item_descrip2, uom_name,
        wo_status AS status
-  FROM wo, itemsite, item, uom, warehous
+  FROM wo, itemsite, item, uom, whsinfo
  WHERE ((wo_itemsite_id=itemsite_id)
    AND (itemsite_item_id=item_id)
    AND (item_inv_uom_id=uom_id)
    AND (itemsite_warehous_id=warehous_id)
    AND (wo_id=<? value("wo_id") ?>) );
 
 --------------------------------------------------------------------
 REPORT: WOSchedule
 QUERY: Detail
 == MetaSQL statement workOrderSchedule-detail
 --------------------------------------------------------------------
   
 QUERY: Head
 SELECT formatDate(<? value("startDate") ?>, 'Earliest') AS f_startdate,
        formatDate(<? value("endDate") ?>, 'Latest') AS f_enddate,
 <? if exists("warehous_id") ?>
        warehous_code
-FROM warehous
+FROM whsinfo
 WHERE (warehous_id=<? value("warehous_id") ?>);
 <? else ?>
        TEXT('All Sites') AS warehous_code;
 <? endif ?>
 
 
 --------------------------------------------------------------------
 REPORT: WarehouseLocationMasterList
 QUERY: detail
 SELECT (warehous_code || ' ' || location_name) AS whs_bin,
        warehous_code,
        formatLocationName(location_id) AS locationname,
        location_descrip,
        formatBoolYN(location_netable) AS f_netable,
        formatBoolYN(location_restrict) AS f_restrict,
        item_number,
        (item_descrip1 || ' ' || item_descrip2) AS itemdesc
   FROM location LEFT OUTER JOIN
        (SELECT locitem_location_id,
                item_number,
                item_descrip1,
                item_descrip2
           FROM locitem, item
          WHERE locitem_item_id=item_id) AS itemlocation
-       ON (locitem_location_id=location_id and location_restrict=true), warehous
+       ON (locitem_location_id=location_id and location_restrict=true), whsinfo
  WHERE ((location_warehous_id=warehous_id)
 <? if exists("warehous_id") ?>
    AND (warehous_id=<? value("warehous_id") ?>)
 <? endif ?>
 ) ORDER BY warehous_code, location_name;
 --------------------------------------------------------------------
   
 QUERY: head
 SELECT <? if exists("warehous_id") ?>
          text('Warehouse:') AS f_text,
          ( SELECT warehous_code
-             FROM warehous
+             FROM whsinfo
             WHERE (warehous_id=<? value("warehous_id") ?>) ) AS f_value
        <? else ?>
          text('') AS f_text,
          text('') AS f_value
        <? endif ?>
 
 --------------------------------------------------------------------
 REPORT: Items
 QUERY: detail
 SELECT
        <? if exists("ListNumericItemNumbersFirst") ?>
          DISTINCT ON ( toNumeric(item_number, 999999999999999), item_number )
        <? else ?>
          DISTINCT ON ( item_number )
        <? endif ?>
        item_number,
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
             WHEN (item_type='J') THEN 'Job'
             WHEN (item_type='K') THEN 'Kit'
             WHEN (item_type='L') THEN 'Planning'
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
        formatBoolYN(item_picklist) AS picklist,
        formatBoolYN(item_config) AS configured,
        formatWeight(item_prodweight) AS prodweight,
        formatWeight(item_packweight) AS packweight,
        classcode_code
 FROM item
   JOIN classcode ON (item_classcode_id=classcode_id)
   JOIN uom iuom ON (item_inv_uom_id=iuom.uom_id)
   JOIN uom puom ON (item_price_uom_id=puom.uom_id)
 <? if exists("itemgrp_id") ?>
   JOIN itemgrpitem ON (item_id=itemgrpitem_item_id)
   JOIN itemgrp ON (itemgrp_id=itemgrpitem_itemgrp_id)
 <? endif ?>
 <? foreach("char_id_text_list") ?>
   LEFT OUTER JOIN charass charass_alias<? literal("char_id_text_list") ?> 
     ON ((charass_alias<? literal("char_id_text_list") ?>.charass_target_type='I') 
     AND  (charass_alias<? literal("char_id_text_list") ?>.charass_target_id=item_id)
     AND  (charass_alias<? literal("char_id_text_list") ?>.charass_char_id=<? value("char_id_text_list") ?>))
   LEFT OUTER JOIN char char_alias<? literal("char_id_text_list") ?> 
     ON (charass_alias<? literal("char_id_text_list") ?>.charass_char_id=char_alias<? literal("char_id_text_list") ?>.char_id)
 <? endforeach ?>
 <? foreach("char_id_list_list") ?>
   LEFT OUTER JOIN charass charass_alias<? literal("char_id_list_list") ?> 
     ON ((charass_alias<? literal("char_id_list_list") ?>.charass_target_type='I') 
     AND  (charass_alias<? literal("char_id_list_list") ?>.charass_target_id=item_id)
     AND  (charass_alias<? literal("char_id_list_list") ?>.charass_char_id=<? value("char_id_list_list") ?>))
   LEFT OUTER JOIN char char_alias<? literal("char_id_list_list") ?> 
     ON (charass_alias<? literal("char_id_list_list") ?>.charass_char_id=char_alias<? literal("char_id_list_list") ?>.char_id)
 <? endforeach ?>
 <? foreach("char_id_date_list") ?>
   LEFT OUTER JOIN charass charass_alias<? literal("char_id_date_list") ?> 
     ON ((charass_alias<? literal("char_id_date_list") ?>.charass_target_type='I') 
     AND  (charass_alias<? literal("char_id_date_list") ?>.charass_target_id=item_id)
     AND  (charass_alias<? literal("char_id_date_list") ?>.charass_char_id=<? value("char_id_date_list") ?>))
   LEFT OUTER JOIN char char_alias<? literal("char_id_date_list") ?> 
     ON (charass_alias<? literal("char_id_date_list") ?>.charass_char_id=char_alias<? literal("char_id_date_list") ?>.char_id)
 <? endforeach ?>
 WHERE ( true
 <? if exists("search_pattern") ?>
  AND ( (item_number ~* <? value("search_pattern") ?>)
        OR  (item_descrip1 || item_descrip2 ~* <? value("search_pattern") ?>) )
 <? endif ?>
 <? if exists("showPurchased") ?>
  AND (item_type IN ('P', 'O'))
 <? elseif exists("showManufactured") ?>
  AND (item_type IN ('M', 'F', 'B','K'))
 <? elseif exists("showSold") ?>
  AND (item_sold)
 <? endif ?>
+<? if exists("item_type") ?>
+ AND (item_type=<? value("item_type") ?>)
+<? endif ?>
 <? if not exists("showInactive") ?>
  AND (item_active)
 <? endif ?>
 <? if exists("classcode_id") ?>
  AND (item_classcode_id=<? value("classcode_id") ?>)
 <? endif ?>
 <? if exists("prodcat_id") ?>
  AND (item_prodcat_id=<? value("prodcat_id") ?>)
 <? endif ?>
 <? if exists("freightclass_id") ?>
  AND (item_freightclass_id=<? value("freightclass_id") ?>)
 <? endif ?>
 <? if exists("itemgrp_id") ?>
  AND (itemgrp_id=<? value("itemgrp_id") ?>)
 <? endif ?>
 <? if exists("item_number_pattern") ?>
  AND (item_number ~* <? value("item_number_pattern") ?>)
 <? endif ?>
 <? if exists("item_descrip_pattern") ?>
  AND (item_descrip1 || item_descrip2 ~* <? value("item_descrip_pattern") ?>)
 <? endif ?>
 <? if exists("classcode_pattern") ?>
  AND (classcode_code ~* <? value("classcode_pattern") ?>)
 <? endif ?>
 <? if exists("prodcat_pattern") ?>
  AND (prodcat_code  ~* <? value("prodcat_pattern") ?>)
 <? endif ?>
 <? if exists("freightclass_pattern") ?>
  AND (freightclass_code ~* <? value("freightclass_pattern") ?>)
 <? endif ?>
 <? literal("charClause") ?>
 ) ORDER BY
 <? if exists("ListNumericItemNumbersFirst") ?>
  toNumeric(item_number, 999999999999999),
 <? endif ?>
  item_number;